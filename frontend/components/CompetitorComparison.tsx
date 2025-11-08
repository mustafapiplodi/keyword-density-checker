"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { ComparisonResults, CompareRequest } from "@/lib/api"

interface CompetitorComparisonProps {
  yourUrl?: string
  yourText?: string
  onCompare: (data: CompareRequest) => void
  isLoading: boolean
  error?: string
  results?: ComparisonResults
}

export function CompetitorComparison({
  yourUrl,
  yourText,
  onCompare,
  isLoading,
  error,
  results
}: CompetitorComparisonProps) {
  const [competitorUrl, setCompetitorUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: CompareRequest = {
      competitor_url: competitorUrl,
      n_grams: [1, 2, 3],
    }

    if (yourUrl) {
      data.your_url = yourUrl
    } else if (yourText) {
      data.your_text = yourText
    }

    onCompare(data)
  }

  const renderComparisonTable = (
    keywords: Array<{ keyword: string; your_density: number; competitor_density: number; difference: number }>,
    title: string
  ) => {
    if (!keywords || keywords.length === 0) return null

    return (
      <div className="space-y-3">
        <h4 className="font-semibold">{title}</h4>
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Keyword</th>
                <th className="text-center p-3 font-medium">Your Density</th>
                <th className="text-center p-3 font-medium">Competitor</th>
                <th className="text-center p-3 font-medium">Difference</th>
              </tr>
            </thead>
            <tbody>
              {keywords.slice(0, 10).map((item, idx) => {
                const isHigher = item.difference > 0
                const isEqual = Math.abs(item.difference) < 0.01

                return (
                  <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-mono text-sm">{item.keyword}</td>
                    <td className="text-center p-3">{item.your_density.toFixed(2)}%</td>
                    <td className="text-center p-3">{item.competitor_density.toFixed(2)}%</td>
                    <td className="text-center p-3">
                      <div className="flex items-center justify-center gap-2">
                        {isEqual ? (
                          <Minus className="w-4 h-4 text-muted-foreground" />
                        ) : isHigher ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={isEqual ? "" : isHigher ? "text-green-600" : "text-red-600"}>
                          {isHigher ? "+" : ""}{item.difference.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competitor Analysis</CardTitle>
        <CardDescription>
          Compare your content with a competitor's page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="competitor-url">Competitor URL</Label>
            <Input
              id="competitor-url"
              type="url"
              placeholder="https://competitor.com/article"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isLoading || !competitorUrl}>
            {isLoading ? "Comparing..." : "Compare with Competitor"}
          </Button>
        </form>

        {results && (
          <div className="space-y-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-green-600">
                  {results.keyword_gaps?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Keyword Gaps</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-blue-600">
                  {results.opportunities?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Opportunities</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-purple-600">
                  {results.your_strengths?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Your Strengths</div>
              </div>
            </div>

            {results.keyword_gaps && results.keyword_gaps.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Keyword Gaps (Missing from Your Content)</h4>
                <div className="flex flex-wrap gap-2">
                  {results.keyword_gaps.slice(0, 20).map((kw, idx) => (
                    <Badge key={idx} variant="warning">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {results.opportunities && results.opportunities.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Optimization Opportunities</h4>
                <div className="flex flex-wrap gap-2">
                  {results.opportunities.slice(0, 20).map((kw, idx) => (
                    <Badge key={idx} variant="caution">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {results.your_strengths && results.your_strengths.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Your Competitive Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {results.your_strengths.slice(0, 20).map((kw, idx) => (
                    <Badge key={idx} variant="optimal">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {results.comparison_data && (
              <div className="space-y-4">
                {renderComparisonTable(
                  results.comparison_data.filter(d => d.keyword.split(' ').length === 1),
                  "Single Word Comparison"
                )}
                {renderComparisonTable(
                  results.comparison_data.filter(d => d.keyword.split(' ').length === 2),
                  "Two-Word Phrase Comparison"
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
