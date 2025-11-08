"use client"

import { useState } from "react"
import { AnalysisForm } from "@/components/AnalysisForm"
import { ResultsDisplay } from "@/components/ResultsDisplay"
import { MetaAnalysisDisplay } from "@/components/MetaAnalysisDisplay"
import { ProminenceScoresDisplay } from "@/components/ProminenceScoresDisplay"
import { ReadabilityScoresDisplay } from "@/components/ReadabilityScoresDisplay"
import { ContentStructureDisplay } from "@/components/ContentStructureDisplay"
import { VisualizationChart } from "@/components/VisualizationChart"
import { KeywordWordCloud } from "@/components/KeywordWordCloud"
import { KeywordHeatmap } from "@/components/KeywordHeatmap"
import { TargetKeywordAnalysis } from "@/components/TargetKeywordAnalysis"
import { KeywordClusters } from "@/components/KeywordClusters"
import { CompetitorComparison } from "@/components/CompetitorComparison"
import { BatchCompetitorAnalysis } from "@/components/BatchCompetitorAnalysis"
import { AnalysisSkeleton, ChartSkeleton, ContentQualitySkeleton } from "@/components/LoadingSkeletons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  analyzeContent,
  compareCompetitor,
  exportCSV,
  batchCompetitorAnalysis
} from "@/lib/api"
import type { AnalyzeRequest, CompareRequest } from "@/lib/api"
import type { AnalysisResults, ComparisonResults, BatchCompetitorResults } from "@/types"

export default function Home() {
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [comparisonResults, setComparisonResults] = useState<ComparisonResults | null>(null)
  const [batchResults, setBatchResults] = useState<BatchCompetitorResults | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | undefined>()
  const [comparisonError, setComparisonError] = useState<string | undefined>()
  const [batchError, setBatchError] = useState<string | undefined>()
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

  const handleBatchAnalysis = async (competitorUrls: string[]) => {
    if (!lastAnalyzedText && !lastAnalyzedUrl) {
      setBatchError("Please analyze your content first before comparing with competitors")
      return
    }

    setIsBatchAnalyzing(true)
    setBatchError(undefined)
    setBatchResults(null)

    try {
      const result = await batchCompetitorAnalysis({
        your_content: lastAnalyzedUrl || lastAnalyzedText || '',
        competitor_urls: competitorUrls,
        source_type: lastAnalyzedUrl ? 'url' : 'text'
      })
      setBatchResults(result)
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : "Batch analysis failed")
    } finally {
      setIsBatchAnalyzing(false)
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

      {isAnalyzing && (
        <div className="space-y-6">
          <AnalysisSkeleton />
        </div>
      )}

      {!isAnalyzing && results && (
        <div className="space-y-6">
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="visualization">Charts</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="quality">Content Quality</TabsTrigger>
              <TabsTrigger value="meta">Meta Tags</TabsTrigger>
              <TabsTrigger value="competitor">1 Competitor</TabsTrigger>
              <TabsTrigger value="batch">Batch Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-6">
              <ResultsDisplay results={results} onExport={handleExport} />

              {results.prominence_scores && results.prominence_scores.length > 0 && (
                <ProminenceScoresDisplay scores={results.prominence_scores} />
              )}
            </TabsContent>

            <TabsContent value="visualization" className="space-y-6">
              {isAnalyzing ? (
                <>
                  <ChartSkeleton />
                  <ChartSkeleton />
                  <ChartSkeleton />
                </>
              ) : (
                <>
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

                  {results.single_words.length > 0 && (
                    <KeywordWordCloud
                      data={results.single_words}
                      title="Keyword Word Cloud"
                      description="Visual representation of keyword density (size = density)"
                    />
                  )}

                  {results.single_words.length > 0 && (
                    <KeywordHeatmap
                      data={results.single_words}
                      title="Keyword Density Heatmap"
                      description="Interactive heatmap showing keyword density distribution"
                    />
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              {isAnalyzing ? (
                <ChartSkeleton />
              ) : (
                <>
                  {results.target_keyword_analysis ? (
                    <TargetKeywordAnalysis data={results.target_keyword_analysis} />
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground p-8">
                          <p className="mb-2 font-medium">No target keyword specified</p>
                          <p className="text-sm">
                            Enter a target keyword in the analysis form to get optimization insights
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {results.keyword_clusters ? (
                    <KeywordClusters data={results.keyword_clusters} />
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground p-8">
                          <p className="mb-2 font-medium">Keyword clustering not enabled</p>
                          <p className="text-sm">
                            Enable keyword clustering in the analysis form to see related keyword groups
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="quality" className="space-y-6">
              {isAnalyzing ? (
                <ContentQualitySkeleton />
              ) : (
                <>
                  {results.readability_scores && (
                    <ReadabilityScoresDisplay scores={results.readability_scores} />
                  )}

                  {results.content_structure && (
                    <ContentStructureDisplay structure={results.content_structure} />
                  )}

                  {!results.readability_scores && !results.content_structure && (
                    <div className="text-center text-muted-foreground p-8 border rounded-lg">
                      Content quality analysis not available for this content
                    </div>
                  )}
                </>
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

            <TabsContent value="batch">
              <BatchCompetitorAnalysis
                yourUrl={lastAnalyzedUrl}
                yourText={lastAnalyzedText}
                onAnalyze={handleBatchAnalysis}
                isLoading={isBatchAnalyzing}
                error={batchError}
                results={batchResults || undefined}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
