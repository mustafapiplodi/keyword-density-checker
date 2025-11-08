"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ReadabilityScores } from "@/types"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

interface ReadabilityScoresDisplayProps {
  scores: ReadabilityScores
}

export function ReadabilityScoresDisplay({ scores }: ReadabilityScoresDisplayProps) {
  const getFleschBadge = (score: number) => {
    if (score >= 80) return { variant: "optimal" as const, label: "Easy" }
    if (score >= 60) return { variant: "default" as const, label: "Standard" }
    if (score >= 50) return { variant: "caution" as const, label: "Difficult" }
    return { variant: "warning" as const, label: "Very Difficult" }
  }

  const getGradeBadge = (grade: number) => {
    if (grade <= 8) return { variant: "optimal" as const, label: "Elementary" }
    if (grade <= 10) return { variant: "default" as const, label: "Middle School" }
    if (grade <= 12) return { variant: "caution" as const, label: "High School" }
    return { variant: "warning" as const, label: "College" }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'warning':
        return <AlertCircle className="h-4 w-4" />
      case 'info':
        return <Info className="h-4 w-4" />
      default:
        return <CheckCircle2 className="h-4 w-4" />
    }
  }

  const fleschBadge = getFleschBadge(scores.flesch_reading_ease)
  const gradeBadge = getGradeBadge(scores.flesch_kincaid_grade)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Readability Analysis</CardTitle>
        <CardDescription>
          Content readability metrics and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reading Level Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Reading Level</h3>
            <Badge variant={fleschBadge.variant} className="text-sm">
              {scores.reading_level}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            This content is suitable for {scores.reading_level.toLowerCase()} readers
          </div>
        </div>

        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Flesch Reading Ease</span>
              <Badge variant={fleschBadge.variant}>{fleschBadge.label}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{scores.flesch_reading_ease.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${Math.min(scores.flesch_reading_ease, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Flesch-Kincaid Grade</span>
              <Badge variant={gradeBadge.variant}>{gradeBadge.label}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{scores.flesch_kincaid_grade.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">grade level</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Gunning Fog Index</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{scores.gunning_fog_index.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">years of education</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">SMOG Index</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{scores.smog_index.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">grade level</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="font-semibold mb-3">Content Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Sentences</div>
              <div className="text-lg font-bold">{scores.statistics.total_sentences}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Avg Sentence</div>
              <div className="text-lg font-bold">{scores.statistics.avg_sentence_length.toFixed(1)} words</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Avg Syllables</div>
              <div className="text-lg font-bold">{scores.statistics.avg_syllables_per_word.toFixed(2)}/word</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Complex Words</div>
              <div className="text-lg font-bold">{scores.statistics.complex_words}</div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {scores.recommendations && scores.recommendations.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Recommendations</h3>
            <div className="space-y-2">
              {scores.recommendations.map((rec, idx) => (
                <Alert key={idx} variant={rec.severity === 'warning' ? 'destructive' : 'default'}>
                  <div className="flex gap-2">
                    {getSeverityIcon(rec.severity)}
                    <div className="flex-1">
                      <div className="font-medium">{rec.message}</div>
                      <AlertDescription className="mt-1">
                        {rec.suggestion}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Readability Guide */}
        <div className="border-t pt-4">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium hover:text-primary">
              Understanding Readability Scores
            </summary>
            <div className="mt-3 space-y-2 text-muted-foreground">
              <p><strong>Flesch Reading Ease:</strong> 90-100 = Very Easy, 60-70 = Standard, 30-50 = Difficult, 0-30 = Very Difficult</p>
              <p><strong>Flesch-Kincaid Grade:</strong> Indicates U.S. grade level needed to understand the text</p>
              <p><strong>Gunning Fog:</strong> Years of formal education needed to understand the text on first reading</p>
              <p><strong>SMOG Index:</strong> Estimates years of education needed to comprehend the text</p>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  )
}
