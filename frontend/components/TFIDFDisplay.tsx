"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TFIDFResults } from "@/types"

interface TFIDFDisplayProps {
  results: TFIDFResults
  documentsAnalyzed: number
}

export function TFIDFDisplay({ results, documentsAnalyzed }: TFIDFDisplayProps) {
  const getUniquenessColor = (uniqueness: string) => {
    switch (uniqueness) {
      case 'high':
        return 'optimal'
      case 'medium':
        return 'caution'
      case 'low':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>TF-IDF Semantic Relevance Analysis</CardTitle>
        <CardDescription>
          Keywords ranked by importance relative to {documentsAnalyzed} competitor documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-muted">
            <div className="text-2xl font-bold text-green-600">
              {results.analysis.unique_terms}
            </div>
            <div className="text-sm text-muted-foreground">Unique Terms</div>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <div className="text-2xl font-bold text-orange-600">
              {results.analysis.common_terms}
            </div>
            <div className="text-sm text-muted-foreground">Common Terms</div>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <div className="text-2xl font-bold text-blue-600">
              {results.analysis.average_tfidf.toFixed(4)}
            </div>
            <div className="text-sm text-muted-foreground">Avg TF-IDF Score</div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg mb-3">Top Keywords by Semantic Importance</h3>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Keyword</th>
                  <th className="text-center p-3 font-medium">TF-IDF</th>
                  <th className="text-center p-3 font-medium">TF</th>
                  <th className="text-center p-3 font-medium">IDF</th>
                  <th className="text-center p-3 font-medium">Count</th>
                  <th className="text-center p-3 font-medium">Uniqueness</th>
                </tr>
              </thead>
              <tbody>
                {results.scores.slice(0, 20).map((score, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-mono text-sm font-medium">{score.term}</td>
                    <td className="text-center p-3">
                      <span className="font-bold text-primary">{score.tfidf.toFixed(4)}</span>
                    </td>
                    <td className="text-center p-3 text-sm text-muted-foreground">
                      {score.tf.toFixed(4)}
                    </td>
                    <td className="text-center p-3 text-sm text-muted-foreground">
                      {score.idf.toFixed(4)}
                    </td>
                    <td className="text-center p-3">{score.count}</td>
                    <td className="text-center p-3">
                      <Badge variant={getUniquenessColor(score.uniqueness) as any}>
                        {score.uniqueness}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
              Understanding TF-IDF Scores
            </h4>
            <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
              <li><strong>High TF-IDF:</strong> Keywords that are frequent in your content but rare in competitors - these differentiate you</li>
              <li><strong>High Uniqueness:</strong> Terms only in your content - unique selling points</li>
              <li><strong>Low Uniqueness:</strong> Common across all documents - industry standard terms</li>
              <li><strong>TF (Term Frequency):</strong> How often the term appears relative to document length</li>
              <li><strong>IDF (Inverse Document Frequency):</strong> How unique the term is across all documents</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
