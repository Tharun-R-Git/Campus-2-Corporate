"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, GraduationCap, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AlumniExperience {
  id: string
  name: string
  year: string
  company: string
  role: string
  package: string
  experience: string
  interviewProcess: string
}

interface AlumniExperiencesProps {
  experiences: AlumniExperience[]
}

export function AlumniExperiences({ experiences }: AlumniExperiencesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"company" | "role">("company")
  const [filteredExperiences, setFilteredExperiences] = useState(experiences)

  // Enhanced search function that searches across all relevant fields
  const searchExperiences = (query: string) => {
    if (!query.trim()) {
      return experiences
    }

    const searchTerms = query.toLowerCase().split(" ")
    
    return experiences.filter((exp) => {
      const searchableText = `
        ${exp.company} ${exp.role} ${exp.name} ${exp.year} 
        ${exp.package} ${exp.experience} ${exp.interviewProcess}
      `.toLowerCase()

      return searchTerms.every(term => searchableText.includes(term))
    })
  }

  // Update filtered results whenever search query changes
  useEffect(() => {
    const results = searchExperiences(searchQuery)
    setFilteredExperiences(results)
  }, [searchQuery, experiences])

  // Group experiences by company and role
  const groupedByCompany: Record<string, AlumniExperience[]> = {}
  const groupedByRole: Record<string, AlumniExperience[]> = {}

  filteredExperiences.forEach((exp) => {
    // Group by company
    if (!groupedByCompany[exp.company]) {
      groupedByCompany[exp.company] = []
    }
    groupedByCompany[exp.company].push(exp)

    // Group by role
    if (!groupedByRole[exp.role]) {
      groupedByRole[exp.role] = []
    }
    groupedByRole[exp.role].push(exp)
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-blue-800 dark:text-blue-300">
          Alumni Experiences
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Learn from alumni who have successfully secured placements
        </p>
      </div>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search by company, role, name, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
        {filteredExperiences.length === 0 && searchQuery && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No results found for "{searchQuery}". Try different keywords.
          </p>
        )}
        {filteredExperiences.length > 0 && searchQuery && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Found {filteredExperiences.length} result(s)
          </p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "company" | "role")}>
        <TabsList className="bg-blue-50 dark:bg-blue-900/50 p-1 border border-blue-100 dark:border-blue-800">
          <TabsTrigger
            value="company"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm"
          >
            <Building2 className="mr-2 h-4 w-4" />
            By Company
          </TabsTrigger>
          <TabsTrigger
            value="role"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm"
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            By Role
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6">
          <div className="grid gap-6">
            {Object.entries(groupedByCompany).map(([company, experiences]) => (
              <Card key={company} className="border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800">
                <CardHeader className="bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                  <CardTitle className="text-blue-800 dark:text-blue-300 flex items-center justify-between">
                    <span>{company}</span>
                    <Badge variant="secondary" className="ml-2 dark:bg-blue-900/50 dark:text-blue-300">
                      {experiences.length} alumni experiences
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-gray-200 dark:divide-gray-700">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="py-4 first:pt-6 last:pb-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{exp.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{exp.role} • {exp.year}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          {exp.package}
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Experience</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{exp.experience}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Interview Process</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{exp.interviewProcess}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="role" className="mt-6">
          <div className="grid gap-6">
            {Object.entries(groupedByRole).map(([role, experiences]) => (
              <Card key={role} className="border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800">
                <CardHeader className="bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                  <CardTitle className="text-blue-800 dark:text-blue-300 flex items-center justify-between">
                    <span>{role}</span>
                    <Badge variant="secondary" className="ml-2 dark:bg-blue-900/50 dark:text-blue-300">
                      {experiences.length} alumni experiences
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-gray-200 dark:divide-gray-700">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="py-4 first:pt-6 last:pb-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{exp.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{exp.company} • {exp.year}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          {exp.package}
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Experience</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{exp.experience}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Interview Process</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{exp.interviewProcess}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 