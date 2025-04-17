import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, XCircle, Save } from "lucide-react"
import { useState, useEffect } from "react"

interface CodeAnalysisResultsProps {
  analysis: {
    codingScore: number
    mcqScores: number[]
    analysis: {
      readability: number
      performance: number
      correctness: number
    }
    feedback: string
    issues: Array<{
      type: string
      description: string
      severity: "low" | "medium" | "high"
    }>
  }
  onSave?: () => Promise<void>
  saved?: boolean
}

const getSeverityColor = (severity: "low" | "medium" | "high") => {
  switch (severity) {
    case "low":
      return "bg-yellow-500/10 text-yellow-500"
    case "medium":
      return "bg-orange-500/10 text-orange-500"
    case "high":
      return "bg-red-500/10 text-red-500"
  }
}

const getSeverityIcon = (severity: "low" | "medium" | "high") => {
  switch (severity) {
    case "low":
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    case "medium":
      return <AlertTriangle className="w-4 h-4 text-orange-500" />
    case "high":
      return <XCircle className="w-4 h-4 text-red-500" />
  }
}

export function CodeAnalysisResults({ analysis, onSave, saved = false }: CodeAnalysisResultsProps) {
  const { codingScore, mcqScores, analysis: scores, feedback, issues } = analysis
  const totalMCQScore = mcqScores.reduce((a, b) => a + b, 0)
  const totalScore = codingScore + totalMCQScore
  const [isSaving, setIsSaving] = useState(false)
  const [isLocalSaved, setIsLocalSaved] = useState(saved)

  useEffect(() => {
    setIsLocalSaved(saved)
  }, [saved])

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true)
      try {
        await onSave()
        setIsLocalSaved(true)
      } catch (error) {
        console.error('Error saving:', error)
      }
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Score with Save Status */}
        <Card className="p-6 col-span-1 md:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Total Score</h3>
              <p className="text-sm text-muted-foreground">MCQ + Coding Evaluation</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{totalScore}/100</div>
              {onSave && (
                <button
                  onClick={handleSave}
                  disabled={isSaving || isLocalSaved}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isLocalSaved
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                  }`}
                >
                  {isLocalSaved ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <Progress 
            value={totalScore} 
            className="mt-4 h-3" 
            indicatorClassName={`${totalScore >= 70 ? 'bg-green-500' : totalScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
          />
        </Card>

        {/* MCQ Scores */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">MCQ Scores</h3>
          <div className="space-y-4">
            {mcqScores.map((score, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Question {index + 1}</span>
                  <span className="font-medium">{score}/10</span>
                </div>
                <Progress value={score * 10} className="h-2" indicatorClassName={score >= 7 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500'} />
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="font-medium">Total MCQ Score</span>
                <span className="font-bold">{totalMCQScore}/50</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Coding Score */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Coding Evaluation</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{codingScore}</span>
              <span className="text-muted-foreground">/50 points</span>
            </div>
            <div className="space-y-4">
              {Object.entries(scores).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{key}</span>
                    <span>{value}%</span>
                  </div>
                  <Progress 
                    value={value} 
                    className="h-2" 
                    indicatorClassName={value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'} 
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Points Breakdown */}
        <Card className="p-6 col-span-1 md:col-span-3">
          <h3 className="text-xl font-semibold mb-4">Points Breakdown</h3>
          <div className="space-y-6 text-sm">
            {feedback.split('\\n\\n').map((section, index) => {
              if (section.startsWith('Detailed Analysis:')) {
                return (
                  <div key={index} className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Detailed Analysis</h4>
                    <div className="text-muted-foreground space-y-2">
                      {section.replace('Detailed Analysis:', '').split('\\n').map((line, i) => (
                        <p key={i}>{line.trim()}</p>
                      ))}
                    </div>
                  </div>
                )
              }
              
              if (section.includes(':')) {
                const [title, ...points] = section.split(':\\n')
                return (
                  <div key={index} className="space-y-2">
                    <h4 className="font-semibold">{title}</h4>
                    <ul className="list-none space-y-1 text-muted-foreground">
                      {points.join('').split('\\n').map((point, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          </span>
                          {point.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              }
              
              return null
            })}
          </div>
        </Card>

        {/* Issues */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Code Issues</h3>
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  {getSeverityIcon(issue.severity)}
                  <span className="font-medium">{issue.type}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${getSeverityColor(issue.severity)}`}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Feedback */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Detailed Feedback</h3>
        <div className="space-y-4 text-muted-foreground">
          {feedback.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Card>
    </div>
  )
} 