"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { CopyIconButton } from "@/components/CopyButton"
import { ShareResults } from "@/components/ShareResults"
import type { AnalysisResults, KeywordItem } from "@/types"

interface ResultsDisplayProps {
  results: AnalysisResults
  onExportPDF?: () => void
}

export function ResultsDisplay({ results, onExportPDF }: ResultsDisplayProps) {
  const getStatusIcon = (status: KeywordItem["status"]) => {
    switch (status) {
      case "optimal":
        return <CheckCircle className="w-4 h-4" />
      case "caution":
        return <Info className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "critical":
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const renderKeywordTable = (keywords: KeywordItem[], title: string) => (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Keyword</th>
              <th className="text-center p-3 font-medium">Count</th>
              <th className="text-center p-3 font-medium">Density</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-center p-3 font-medium w-16"></th>
            </tr>
          </thead>
          <tbody>
            {keywords.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-muted-foreground">
                  No keywords found
                </td>
              </tr>
            ) : (
              keywords.slice(0, 20).map((keyword, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-mono text-sm">{keyword.term}</td>
                  <td className="text-center p-3">{keyword.count}</td>
                  <td className="text-center p-3">{keyword.density.toFixed(2)}%</td>
                  <td className="text-center p-3">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(keyword.status)}
                      <Badge variant={keyword.status}>
                        {keyword.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="text-center p-3">
                    <CopyIconButton text={keyword.term} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {keywords.length > 20 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing top 20 of {keywords.length} results
        </p>
      )}
    </div>
  )

  const renderRecommendations = () => {
    const { critical, warnings, opportunities } = results.recommendations

    return (
      <div className="space-y-4">
        {critical && critical.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Critical Issues</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-2 mt-2">
                {critical.map((rec, idx) => (
                  <li key={idx} className="text-sm">
                    <strong>{rec.keyword}:</strong> {rec.issue} - {rec.current}. {rec.action}
                    {rec.tip && <span className="text-muted-foreground block ml-5 mt-1">💡 {rec.tip}</span>}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {warnings && warnings.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warnings</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-2 mt-2">
                {warnings.map((rec, idx) => (
                  <li key={idx} className="text-sm">
                    <strong>{rec.keyword}:</strong> {rec.issue} - {rec.current}. {rec.action}
                    {rec.tip && <span className="text-muted-foreground block ml-5 mt-1">💡 {rec.tip}</span>}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {opportunities && opportunities.length > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Opportunities</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-2 mt-2">
                {opportunities.map((rec, idx) => (
                  <li key={idx} className="text-sm">
                    <strong>{rec.keyword}:</strong> {rec.status || rec.suggestion} - {rec.current}
                    {rec.tip && <span className="text-muted-foreground block ml-5 mt-1">💡 {rec.tip}</span>}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Keyword density and SEO metrics for your content
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <ShareResults results={results} />
              {onExportPDF && (
                <Button variant="default" size="sm" onClick={onExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{results.total_words.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Words</div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{results.unique_words.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Unique Words</div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">
                {results.total_words > 0
                  ? ((results.unique_words / results.total_words) * 100).toFixed(1)
                  : '0.0'}%
              </div>
              <div className="text-sm text-muted-foreground">Vocabulary Diversity</div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">
                {results.single_words.length + results.two_word_phrases.length +
                  results.three_word_phrases.length + results.four_word_phrases.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Keywords</div>
            </div>
          </div>

          <Tabs defaultValue="1-gram" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="1-gram">1-grams</TabsTrigger>
              <TabsTrigger value="2-gram">2-grams</TabsTrigger>
              <TabsTrigger value="3-gram">3-grams</TabsTrigger>
              <TabsTrigger value="4-gram">4-grams</TabsTrigger>
            </TabsList>

            <TabsContent value="1-gram" className="space-y-4">
              {renderKeywordTable(results.single_words, "Single Word Keywords")}
            </TabsContent>

            <TabsContent value="2-gram" className="space-y-4">
              {renderKeywordTable(results.two_word_phrases, "Two-Word Phrases")}
            </TabsContent>

            <TabsContent value="3-gram" className="space-y-4">
              {renderKeywordTable(results.three_word_phrases, "Three-Word Phrases")}
            </TabsContent>

            <TabsContent value="4-gram" className="space-y-4">
              {renderKeywordTable(results.four_word_phrases, "Four-Word Phrases")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            SEO optimization suggestions based on your content analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderRecommendations()}
        </CardContent>
      </Card>
    </div>
  )
}
