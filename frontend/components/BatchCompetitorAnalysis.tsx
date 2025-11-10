"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Trash2, Plus, AlertCircle, TrendingUp, TrendingDown, Star, Info } from "lucide-react"
import { CompetitorProgress } from "@/components/CompetitorProgress"
import type { BatchCompetitorResults } from "@/types"
import { TFIDFDisplay } from "./TFIDFDisplay"

interface BatchCompetitorAnalysisProps {
  yourUrl?: string
  yourText?: string
  onAnalyze: (urls: string[]) => void
  isLoading: boolean
  error?: string
  results?: BatchCompetitorResults
}

export function BatchCompetitorAnalysis({
  yourUrl,
  yourText,
  onAnalyze,
  isLoading,
  error,
  results
}: BatchCompetitorAnalysisProps) {
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(['', ''])
  const [localError, setLocalError] = useState<string>("")

  const hasYourContent = !!(yourUrl || yourText)

  const addUrlField = () => {
    if (competitorUrls.length < 20) {
      setCompetitorUrls([...competitorUrls, ''])
    }
  }

  const removeUrlField = (index: number) => {
    if (competitorUrls.length > 1) {
      setCompetitorUrls(competitorUrls.filter((_, i) => i !== index))
    }
  }

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...competitorUrls]
    newUrls[index] = value
    setCompetitorUrls(newUrls)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    // Validate that user has analyzed their content first
    if (!yourUrl && !yourText) {
      setLocalError("Please analyze your content first before comparing with competitors")
      return
    }

    const validUrls = competitorUrls.filter(url => url.trim() !== '')
    if (validUrls.length < 2) {
      setLocalError("Please enter at least 2 competitor URLs")
      return
    }
    onAnalyze(validUrls)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Batch Competitor Analysis</CardTitle>
          <CardDescription>
            Analyze 2-20 competitor URLs simultaneously for comprehensive SEO insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasYourContent && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Please analyze your content first using the main analysis form above. Then you can compare it with multiple competitors.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Competitor URLs ({competitorUrls.filter(u => u.trim()).length}/20)</Label>
              {competitorUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="url"
                    placeholder={`Competitor URL ${index + 1}`}
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    className="flex-1"
                    disabled={!hasYourContent}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeUrlField(index)}
                    disabled={competitorUrls.length <= 1 || !hasYourContent}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {competitorUrls.length < 20 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addUrlField}
                  className="w-full"
                  disabled={!hasYourContent}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Competitor URL
                </Button>
              )}
            </div>

            {(error || localError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error || localError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || competitorUrls.filter(u => u.trim()).length < 2 || !hasYourContent}
            >
              {isLoading ? "Analyzing Competitors..." : "Analyze All Competitors"}
            </Button>
          </form>

          {isLoading && <CompetitorProgress isLoading={isLoading} type="batch" />}
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
              <CardDescription>
                Analyzed {results.analyzed_competitors} out of {results.analyzed_competitors + results.failed_competitors} competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="text-3xl font-bold text-red-600">
                    {results.summary.gaps_identified}
                  </div>
                  <div className="text-sm text-red-800">Keyword Gaps</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">
                    {results.summary.common_keywords_found}
                  </div>
                  <div className="text-sm text-blue-800">Common Keywords</div>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-3xl font-bold text-green-600">
                    {results.summary.your_unique_keywords}
                  </div>
                  <div className="text-sm text-green-800">Your Unique Terms</div>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">
                    {results.summary.total_competitor_keywords}
                  </div>
                  <div className="text-sm text-purple-800">Total Keywords</div>
                </div>
              </div>

              {results.summary.recommendation && (
                <Alert>
                  <AlertTitle>Strategic Recommendation</AlertTitle>
                  <AlertDescription className="text-sm mt-2">
                    {results.summary.recommendation}
                  </AlertDescription>
                </Alert>
              )}

              {results.failed_urls.length > 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Failed Analyses</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      {results.failed_urls.map((fail, idx) => (
                        <li key={idx}>{fail.url}: {fail.error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Keyword Gaps */}
          {results.keyword_gaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Keyword Gaps (Missing Keywords)
                </CardTitle>
                <CardDescription>
                  Keywords used by competitors that you're missing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.keyword_gaps.map((gap, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="font-medium font-mono">{gap.keyword}</div>
                        <div className="text-sm text-muted-foreground">
                          Used by {gap.competitor_count} competitors • Avg density: {gap.avg_density}%
                        </div>
                      </div>
                      <Badge variant="warning">
                        Score: {gap.importance_score.toFixed(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Common Keywords */}
          {results.common_keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Common Keywords Comparison
                </CardTitle>
                <CardDescription>
                  Keywords used by most competitors - compare your usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-medium">Keyword</th>
                        <th className="text-center p-3 font-medium">Competitors</th>
                        <th className="text-center p-3 font-medium">Avg Density</th>
                        <th className="text-center p-3 font-medium">Your Density</th>
                        <th className="text-center p-3 font-medium">Gap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.common_keywords.map((kw, idx) => (
                        <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-3 font-mono text-sm">{kw.keyword}</td>
                          <td className="text-center p-3">{kw.competitor_count}</td>
                          <td className="text-center p-3">{kw.avg_competitor_density}%</td>
                          <td className="text-center p-3 font-medium">{kw.your_density}%</td>
                          <td className="text-center p-3">
                            <span className={kw.gap > 0 ? 'text-red-600' : 'text-green-600'}>
                              {kw.gap > 0 ? '+' : ''}{kw.gap}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Your Unique Strengths */}
          {results.your_unique_strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-600" />
                  Your Unique Strengths
                </CardTitle>
                <CardDescription>
                  Keywords you use that competitors don't - maintain this differentiation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {results.your_unique_strengths.map((strength, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-green-50 dark:bg-green-950"
                    >
                      <span className="font-mono text-sm font-medium">{strength.keyword}</span>
                      <Badge variant="optimal" className="text-xs">
                        {strength.your_density.toFixed(2)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TF-IDF Scores */}
          {results.tfidf_scores && results.tfidf_scores.length > 0 && (
            <TFIDFDisplay
              results={{
                total_documents: results.analyzed_competitors + 1,
                scores: results.tfidf_scores,
                analysis: {
                  unique_terms: results.tfidf_scores.filter(s => s.uniqueness === 'high').length,
                  common_terms: results.tfidf_scores.filter(s => s.uniqueness === 'low').length,
                  average_tfidf: results.tfidf_scores.length > 0
                    ? results.tfidf_scores.reduce((sum, s) => sum + s.tfidf, 0) / results.tfidf_scores.length
                    : 0
                }
              }}
              documentsAnalyzed={results.analyzed_competitors + 1}
            />
          )}

          {/* Competitor List */}
          <Card>
            <CardHeader>
              <CardTitle>Analyzed Competitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.competitors.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="font-medium truncate">{comp.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{comp.url}</div>
                    </div>
                    <Badge variant="outline">{comp.total_words.toLocaleString()} words</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
