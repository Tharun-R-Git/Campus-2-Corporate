import { MongoClient } from "mongodb"
import db from "./db"
import type { ObjectId } from "mongodb"

export interface User {
  _id?: string
  name: string
  email: string
  password: string
  role: "student" | "alumni" | "admin"
  registrationDate: Date
  // Role-specific fields
  rollNumber?: string
  branch?: string
  school?: string
  cgpa?: string
  company?: string
  position?: string
  graduationYear?: number
  category?: "Dream Package" | "Super Dream Package" | "Higher Studies"
  progress?: {
    completedTasks: number
    totalTasks: number
    weeklyScores: Record<string, number>
    completedContent?: number[]
    resourceCompletions?: Record<string, boolean>
  }
}

export interface Student extends User {
  role: "student"
  rollNumber: string
  branch: string
  school: string
  cgpa: string
  category?: "Dream Package" | "Super Dream Package" | "Higher Studies"
  progress?: {
    completedTasks: number
    totalTasks: number
    weeklyScores: Record<string, number>
    completedContent?: number[]
    resourceCompletions?: Record<string, boolean>
  }
}

export interface Alumni extends User {
  role: "alumni"
  company: string
  position: string
  graduationYear: number
}

export interface Category {
  _id?: ObjectId
  name: string
  description: string
}

export interface WeeklyContent {
  _id?: ObjectId
  week: number
  category: string
  title: string
  description: string
  resources: {
    type: "video" | "notes" | "link"
    title: string
    url: string
  }[]
}

export interface MCQQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

export interface CodingQuestion {
  question: string
  description: string
  testCases: {
    input: string
    expectedOutput: string
  }[]
  sampleSolution?: string
}

export interface WeeklyTask {
  _id?: ObjectId
  week: number
  category: string
  title: string
  description: string
  deadline: Date
  mcqs: MCQQuestion[]
  codingQuestions: CodingQuestion[]
}

export interface CodingFeedback {
  questionIndex: number
  feedback: string
  score: number
  passesAllTests: boolean
  performance?: number
  readability?: number
  correctness?: number
  identifiedIssues?: {
    type: string
    severity: string
    description: string
  }[]
}

export interface StudentSubmission {
  _id?: ObjectId
  studentId: ObjectId
  taskId: ObjectId
  week: number
  category: string
  submissionDate: Date
  mcqAnswers: number[]
  codingSolutions: string[]
  mcqScore?: number
  codingScore?: number
  totalScore?: number
  evaluated: boolean
  codingFeedback?: CodingFeedback[]
}

export interface PlacementExperience {
  _id?: ObjectId
  alumniId: ObjectId
  alumniName: string
  company: string
  role: string
  package?: string
  yearOfPlacement: number
  experience: string
  interviewProcess: string
  tips: string
  createdAt: Date
}

// Database collections
export const getUsersCollection = async () => {
  const client = await db
  return client.db().collection<User>("users")
}

export const getStudentsCollection = async () => {
  const client = await db
  return client.db().collection<Student>("users")
}

export const getAlumniCollection = async () => {
  const client = await db
  return client.db().collection<Alumni>("users")
}

// Model functions
export const StudentModel = {
  findOne: async (query: any) => {
    const collection = await getStudentsCollection()
    return collection.findOne({ ...query, role: "student" })
  }
}

export const AlumniModel = {
  findOne: async (query: any) => {
    const collection = await getAlumniCollection()
    return collection.findOne({ ...query, role: "alumni" })
  }
}
