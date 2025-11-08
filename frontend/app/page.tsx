"use client"

import { useState } from "react"
import { AnalysisForm } from "@/components/AnalysisForm"
import { ResultsDisplay } from "@/components/ResultsDisplay"
import { MetaAnalysisDisplay } from "@/components/MetaAnalysisDisplay"
import { ProminenceScoresDisplay } from "@/components/ProminenceScoresDisplay"
import { VisualizationChart } from "@/components/VisualizationChart"
import { CompetitorComparison } from "@/components/CompetitorComparison"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeContent, compareCompetitor, exportCSV } from "@/lib/api"
import type { AnalyzeRequest, CompareRequest } from "@/lib/api"
import type { AnalysisResults, ComparisonResults } from "@/types"

export default function Home() {
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [comparisonResults, setComparisonResults] = useState<ComparisonResults | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | undefined>()
  const [comparisonError, setComparisonError] = useState<string | undefined>()
  const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState<string | undefined>()
  const [lastAnalyzedText, setLastAnalyzedText] = useState<string | undefined>()

  const handleAnalyze = async (data: AnalyzeRequest) => {
    setIsAnalyzing(true)
    setAnalysisError(undefined)
    setResults(null)

    try {
      const result = await analyzeContent(data)
      setResults(result)
      setLastAnalyzedUrl(data.url)
      setLastAnalyzedText(data.text)
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCompare = async (data: CompareRequest) => {
    setIsComparing(true)
    setComparisonError(undefined)
    setComparisonResults(null)

    try {
      const result = await compareCompetitor(data)
      setComparisonResults(result)
    } catch (err) {
      setComparisonError(err instanceof Error ? err.message : "Comparison failed")
    } finally {
      setIsComparing(false)
    }
  }

  const handleExport = async () => {
    if (!results) return

    try {
      const blob = await exportCSV(results)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `keyword-analysis-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Export failed:", err)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          SEO Content Analysis
        </h2>
        <p className="text-muted-foreground">
          Analyze keyword density, meta tags, and compare with competitors
        </p>
      </div>

      <AnalysisForm
        onSubmit={handleAnalyze}
        isLoading={isAnalyzing}
        error={analysisError}
      />

      {results && (
        <div className="space-y-6">
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="results">Analysis Results</TabsTrigger>
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="meta">Meta Tags</TabsTrigger>
              <TabsTrigger value="competitor">Competitor</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-6">
              <ResultsDisplay results={results} onExport={handleExport} />

              {results.prominence_scores && results.prominence_scores.length > 0 && (
                <ProminenceScoresDisplay scores={results.prominence_scores} />
              )}
            </TabsContent>

            <TabsContent value="visualization" className="space-y-6">
              {results.single_words.length > 0 && (
                <VisualizationChart
                  data={results.single_words}
                  title="Single Word Keywords"
                  description="Top single-word keywords by density"
                />
              )}

              {results.two_word_phrases.length > 0 && (
                <VisualizationChart
                  data={results.two_word_phrases}
                  title="Two-Word Phrases"
                  description="Top two-word phrases by density"
                />
              )}

              {results.three_word_phrases.length > 0 && (
                <VisualizationChart
                  data={results.three_word_phrases}
                  title="Three-Word Phrases"
                  description="Top three-word phrases by density"
                />
              )}
            </TabsContent>

            <TabsContent value="meta">
              {results.meta_analysis ? (
                <MetaAnalysisDisplay metaAnalysis={results.meta_analysis} />
              ) : (
                <div className="text-center text-muted-foreground p-8 border rounded-lg">
                  Meta tag analysis not available for this content
                </div>
              )}
            </TabsContent>

            <TabsContent value="competitor">
              <CompetitorComparison
                yourUrl={lastAnalyzedUrl}
                yourText={lastAnalyzedText}
                onCompare={handleCompare}
                isLoading={isComparing}
                error={comparisonError}
                results={comparisonResults || undefined}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
