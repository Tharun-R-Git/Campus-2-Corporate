import { ObjectId } from "mongodb"
import clientPromise from "./db"
import type { User, Student, WeeklyContent, WeeklyTask, StudentSubmission, PlacementExperience } from "./models"
import bcrypt from "bcryptjs"

// Database collections
const getDb = async () => {
  const client = await clientPromise
  return client.db("campus2corporate")
}

// User functions
export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb()
  return db.collection("users").findOne({ email }) as Promise<User | null>
}

export async function createUser(userData: Omit<User, "_id" | "registrationDate">) {
  const db = await getDb()
  const hashedPassword = await bcrypt.hash(userData.password, 10)

  const newUser = {
    ...userData,
    password: hashedPassword,
    registrationDate: new Date(),
    ...(userData.role === "student" && {
      rollNumber: userData.rollNumber,
      branch: userData.branch,
      school: userData.school,
      cgpa: userData.cgpa,
      progress: {
        completedTasks: 0,
        totalTasks: 0,
        weeklyScores: {},
        completedContent: [],
        resourceCompletions: {},
      },
    }),
    ...(userData.role === "alumni" && {
      company: userData.company,
      position: userData.position,
      graduationYear: userData.graduationYear,
    }),
  }

  const result = await db.collection("users").insertOne(newUser)
  return { ...newUser, _id: result.insertedId }
}

export async function updateUserProfile(userId: string, updateData: Partial<User>) {
  const db = await getDb()
  const { password, role, ...data } = updateData

  // Get the current user to verify role
  const currentUser = await db.collection("users").findOne({ _id: new ObjectId(userId) })
  if (!currentUser) {
    throw new Error("User not found")
  }

  // For students, update student-specific fields
  if (currentUser.role === "student") {
    const { rollNumber, branch, school, cgpa } = data as any
    return db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          name: data.name,
          rollNumber,
          branch,
          school,
          cgpa,
        },
      }
    )
  }

  // For alumni, update alumni-specific fields
  if (currentUser.role === "alumni") {
    const { company, position, graduationYear } = data as any
    return db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          name: data.name,
          company,
          position,
          graduationYear,
        },
      }
    )
  }

  // For other roles, just update the name
  return db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { name: data.name } }
  )
}

// Student specific functions
export async function updateStudentCategory(studentId: string, category: string) {
  const db = await getDb()
  return db.collection("users").updateOne({ _id: new ObjectId(studentId), role: "student" }, { $set: { category } })
}

export async function updateStudentProgress(studentId: string, weekNumber: number, score: number, category?: string) {
  const db = await getDb()
  const student = (await db.collection("users").findOne({ _id: new ObjectId(studentId), role: "student" })) as Student

  // If category is provided and doesn't match the student's category, don't update progress
  if (category && student.category && category !== student.category) {
    return null
  }

  if (!student.progress) {
    student.progress = {
      completedTasks: 1,
      totalTasks: 0, // Will be updated later
      weeklyScores: { [weekNumber.toString()]: score },
      completedContent: [],
      resourceCompletions: {},
    }
  } else {
    student.progress.completedTasks += 1
    student.progress.weeklyScores[weekNumber.toString()] = score
  }

  return db.collection("users").updateOne({ _id: new ObjectId(studentId) }, { $set: { progress: student.progress } })
}

export async function updateContentCompletion(studentId: string, weekNumber: number, completed: boolean) {
  const db = await getDb()
  const student = (await db.collection("users").findOne({ _id: new ObjectId(studentId), role: "student" })) as Student

  if (!student.progress) {
    student.progress = {
      completedTasks: 0,
      totalTasks: 0,
      weeklyScores: {},
      completedContent: completed ? [weekNumber] : [],
    }
  } else if (!student.progress.completedContent) {
    student.progress.completedContent = completed ? [weekNumber] : []
  } else if (completed) {
    // Add to completed content if not already there
    if (!student.progress.completedContent.includes(weekNumber)) {
      student.progress.completedContent.push(weekNumber)
    }
  } else {
    // Remove from completed content
    student.progress.completedContent = student.progress.completedContent.filter((week) => week !== weekNumber)
  }

  return db.collection("users").updateOne({ _id: new ObjectId(studentId) }, { $set: { progress: student.progress } })
}

// Add this function to the existing db-utils.ts file
export async function resetStudentProgress(studentId: string) {
  const db = await getDb()
  return db.collection("users").updateOne(
    { _id: new ObjectId(studentId), role: "student" },
    {
      $set: {
        progress: {
          completedTasks: 0,
          totalTasks: 0,
          weeklyScores: {},
          completedContent: [],
          resourceCompletions: {},
        },
      },
    },
  )
}

// Add this function to the existing db-utils.ts file
export async function markResourceCompletion(
  studentId: string,
  weekNumber: number,
  resourceIndex: number,
  completed: boolean,
) {
  const db = await getDb()
  const student = (await db.collection("users").findOne({ _id: new ObjectId(studentId), role: "student" })) as Student

  if (!student.progress) {
    student.progress = {
      completedTasks: 0,
      totalTasks: 0,
      weeklyScores: {},
      completedContent: [],
      resourceCompletions: {},
    }
  }

  if (!student.progress.resourceCompletions) {
    student.progress.resourceCompletions = {}
  }

  const resourceId = `${weekNumber}-${resourceIndex}`

  if (completed) {
    student.progress.resourceCompletions[resourceId] = true
  } else {
    delete student.progress.resourceCompletions[resourceId]
  }

  // Check if all resources for this week are completed
  const weekContent = await getWeeklyContent(student.category, weekNumber)
  if (weekContent) {
    const totalResources = weekContent.resources.length
    let completedResources = 0

    for (let i = 0; i < totalResources; i++) {
      if (student.progress.resourceCompletions[`${weekNumber}-${i}`]) {
        completedResources++
      }
    }

    // If all resources are completed, mark the week as completed
    if (completedResources === totalResources) {
      if (!student.progress.completedContent) {
        student.progress.completedContent = []
      }
      if (!student.progress.completedContent.includes(weekNumber)) {
        student.progress.completedContent.push(weekNumber)
      }
    } else {
      // If not all resources are completed, remove the week from completedContent
      if (student.progress.completedContent) {
        student.progress.completedContent = student.progress.completedContent.filter((week) => week !== weekNumber)
      }
    }
  }

  return db.collection("users").updateOne({ _id: new ObjectId(studentId) }, { $set: { progress: student.progress } })
}

// Weekly content functions
export async function getWeeklyContent(category: string, week: number): Promise<WeeklyContent | null> {
  const db = await getDb()
  return db.collection("weeklyContent").findOne({ category, week }) as Promise<WeeklyContent | null>
}

export async function getAllWeeklyContent(category: string): Promise<WeeklyContent[]> {
  const db = await getDb()
  return db.collection("weeklyContent").find({ category }).sort({ week: 1 }).toArray() as Promise<WeeklyContent[]>
}

// Weekly tasks functions
export async function getWeeklyTask(category: string, week: number): Promise<WeeklyTask | null> {
  const db = await getDb()
  return db.collection("weeklyTasks").findOne({ category, week }) as Promise<WeeklyTask | null>
}

export async function getAllWeeklyTasks(category: string): Promise<WeeklyTask[]> {
  const db = await getDb()
  return db.collection("weeklyTasks").find({ category }).sort({ week: 1 }).toArray() as Promise<WeeklyTask[]>
}

// Add this function to the existing db-utils.ts file
export async function getTaskById(taskId: string): Promise<WeeklyTask | null> {
  const db = await getDb()
  return db.collection("weeklyTasks").findOne({ _id: new ObjectId(taskId) }) as Promise<WeeklyTask | null>
}

// Submission functions
export async function createSubmission(submission: Omit<StudentSubmission, "_id">) {
  const db = await getDb()
  const result = await db.collection("submissions").insertOne(submission)
  return { ...submission, _id: result.insertedId }
}

export async function getStudentSubmission(studentId: string, taskId: string): Promise<StudentSubmission | null> {
  const db = await getDb()
  return db.collection("submissions").findOne({
    studentId: new ObjectId(studentId),
    taskId: new ObjectId(taskId),
  }) as Promise<StudentSubmission | null>
}

export async function getStudentSubmissions(studentId: string): Promise<StudentSubmission[]> {
  const db = await getDb()
  return db
    .collection("submissions")
    .find({
      studentId: new ObjectId(studentId),
    })
    .toArray() as Promise<StudentSubmission[]>
}

// Placement experience functions
export async function createPlacementExperience(experience: Omit<PlacementExperience, "_id" | "createdAt">) {
  const db = await getDb()
  const newExperience = {
    ...experience,
    createdAt: new Date(),
  }

  const result = await db.collection("placementExperiences").insertOne(newExperience)
  return { ...newExperience, _id: result.insertedId }
}

export async function getPlacementExperiences(): Promise<PlacementExperience[]> {
  const db = await getDb()
  return db.collection("placementExperiences").find().sort({ createdAt: -1 }).toArray() as Promise<
    PlacementExperience[]
  >
}

export async function getPlacementExperiencesByCompany(company: string): Promise<PlacementExperience[]> {
  const db = await getDb()
  return db
    .collection("placementExperiences")
    .find({ company: { $regex: company, $options: "i" } })
    .sort({ createdAt: -1 })
    .toArray() as Promise<PlacementExperience[]>
}

export async function getAllAlumniExperiences() {
  try {
    const db = await getDb()
    const experiences = await db.collection("alumniExperiences").find().toArray()
    return experiences.map((exp) => ({
      id: exp._id.toString(),
      name: exp.name,
      year: exp.year,
      company: exp.company,
      role: exp.role,
      package: exp.package,
      experience: exp.experience,
      interviewProcess: exp.interviewProcess,
    }))
  } catch (error) {
    console.error("Error fetching alumni experiences:", error)
    return []
  }
}
