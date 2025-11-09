"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProminenceScore } from "@/types"

interface ProminenceScoresDisplayProps {
  scores: ProminenceScore[]
}

export function ProminenceScoresDisplay({ scores }: ProminenceScoresDisplayProps) {
  const getScoreBadge = (score: number) => {
    if (score >= 50) return { variant: "optimal" as const, label: "Excellent" }
    if (score >= 30) return { variant: "default" as const, label: "Good" }
    if (score >= 15) return { variant: "caution" as const, label: "Fair" }
    return { variant: "warning" as const, label: "Low" }
  }

  const topScores = scores.slice(0, 10)
  const maxScore = Math.max(...topScores.map(s => s.total_score), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword Prominence Scores</CardTitle>
        <CardDescription>
          Position-weighted importance of top keywords
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topScores.map((item, idx) => {
            const scoreBadge = getScoreBadge(item.total_score)
            const percentage = (item.total_score / maxScore) * 100

            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-medium font-mono">{item.keyword}</div>
                    <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
                  </div>
                  <div className="text-lg font-bold">{item.total_score.toFixed(1)}</div>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    View breakdown
                  </summary>
                  <div className="mt-2 space-y-1 pl-4 border-l-2">
                    {Object.entries(item.breakdown).map(([position, data]) => {
                      const breakdown = data as { count: number; weight: number; score: number }
                      if (breakdown.count === 0) return null
                      return (
                        <div key={position} className="flex justify-between text-xs">
                          <span className="text-muted-foreground capitalize">
                            {position.replace(/_/g, ' ')}
                          </span>
                          <span>
                            {breakdown.count} × {breakdown.weight} = {breakdown.score}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </details>
              </div>
            )
          })}

          {scores.length > 10 && (
            <p className="text-sm text-muted-foreground text-center pt-2">
              Showing top 10 of {scores.length} keywords
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
