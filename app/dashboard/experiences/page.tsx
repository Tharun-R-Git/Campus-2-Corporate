import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPlacementExperiences } from "@/lib/db-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Building, User, Calendar, Package, Briefcase } from "lucide-react"
import ExperienceSearch from "@/components/experience-search"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ExperiencesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Fetch all placement experiences
  const experiences = await getPlacementExperiences()

  // Group experiences by company
  const companiesMap = new Map()
  experiences.forEach((exp) => {
    if (!companiesMap.has(exp.company)) {
      companiesMap.set(exp.company, [])
    }
    companiesMap.get(exp.company).push(exp)
  })

  const companies = Array.from(companiesMap.keys()).sort()

  // Get unique roles for filtering
  const rolesSet = new Set<string>()
  experiences.forEach((exp) => {
    rolesSet.add(exp.role)
  })
  const roles = Array.from(rolesSet).sort()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-800">Alumni Experiences</h1>
        <p className="text-gray-600">Learn from alumni who have successfully secured placements</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <ExperienceSearch />
      </div>

      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList className="bg-blue-50 p-1 border border-blue-100">
          <TabsTrigger
            value="companies"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
          >
            <Building className="h-4 w-4 mr-2" />
            By Company
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            By Role
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          {companies.length === 0 ? (
            <Card className="border-blue-200 shadow-sm">
              <CardContent className="pt-6">
                <p>No alumni experiences shared yet. Check back later.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {companies.map((company) => (
                <Card key={company} className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Building className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-blue-800">{company}</CardTitle>
                        <CardDescription>{companiesMap.get(company).length} alumni experiences</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {companiesMap.get(company).map((experience) => (
                      <Card key={experience._id?.toString()} className="border border-gray-200 shadow-sm">
                        <CardHeader className="pb-2 bg-gray-50 border-b border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{experience.role}</CardTitle>
                                <CardDescription className="flex items-center">
                                  <span>{experience.alumniName}</span>
                                  <span className="mx-1">•</span>
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>{experience.yearOfPlacement}</span>
                                </CardDescription>
                              </div>
                            </div>
                            {experience.package && (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                <Package className="mr-1 h-3 w-3" />
                                {experience.package}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                          <div>
                            <h3 className="font-medium text-sm mb-1 text-blue-800">Experience</h3>
                            <p className="text-sm text-gray-700">{experience.experience}</p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm mb-1 text-blue-800">Interview Process</h3>
                            <p className="text-sm text-gray-700">{experience.interviewProcess}</p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm mb-1 text-blue-800">Tips for Students</h3>
                            <p className="text-sm text-gray-700">{experience.tips}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="roles">
          {roles.length === 0 ? (
            <Card className="border-blue-200 shadow-sm">
              <CardContent className="pt-6">
                <p>No alumni experiences shared yet. Check back later.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {roles.map((role) => {
                const roleExperiences = experiences.filter((exp) => exp.role === role)
                return (
                  <Card key={role} className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-blue-50 border-b border-blue-100">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <Briefcase className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-blue-800">{role}</CardTitle>
                          <CardDescription>{roleExperiences.length} alumni experiences</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {roleExperiences.map((experience) => (
                        <Card key={experience._id?.toString()} className="border border-gray-200 shadow-sm">
                          <CardHeader className="pb-2 bg-gray-50 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                                  <Building className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{experience.company}</CardTitle>
                                  <CardDescription className="flex items-center">
                                    <span>{experience.alumniName}</span>
                                    <span className="mx-1">•</span>
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>{experience.yearOfPlacement}</span>
                                  </CardDescription>
                                </div>
                              </div>
                              {experience.package && (
                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                  <Package className="mr-1 h-3 w-3" />
                                  {experience.package}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-4">
                            <div>
                              <h3 className="font-medium text-sm mb-1 text-blue-800">Experience</h3>
                              <p className="text-sm text-gray-700">{experience.experience}</p>
                            </div>
                            <div>
                              <h3 className="font-medium text-sm mb-1 text-blue-800">Interview Process</h3>
                              <p className="text-sm text-gray-700">{experience.interviewProcess}</p>
                            </div>
                            <div>
                              <h3 className="font-medium text-sm mb-1 text-blue-800">Tips for Students</h3>
                              <p className="text-sm text-gray-700">{experience.tips}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
