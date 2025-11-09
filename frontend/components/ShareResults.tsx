"use client"

import * as React from "react"
import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/CopyButton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { AnalysisResults } from "@/types"

interface ShareResultsProps {
  results: AnalysisResults
}

export function ShareResults({ results }: ShareResultsProps) {
  const generateSummary = () => {
    const topKeywords = results.single_words.slice(0, 5)
      .map(kw => `${kw.term} (${kw.density.toFixed(2)}%)`)
      .join(", ")

    let summary = `📊 SEO Keyword Analysis Results\n\n`
    summary += `Total Words: ${results.total_words}\n`
    summary += `Unique Words: ${results.unique_words}\n`
    summary += `Top Keywords: ${topKeywords}\n\n`

    if (results.readability_scores) {
      summary += `📖 Readability:\n`
      summary += `- Flesch Reading Ease: ${results.readability_scores.flesch_reading_ease.toFixed(1)}\n`
      summary += `- Reading Level: ${results.readability_scores.reading_level}\n\n`
    }

    if (results.content_structure) {
      summary += `📝 Content Structure:\n`
      summary += `- Paragraphs: ${results.content_structure.paragraphs.total}\n`
      summary += `- Sentences: ${results.content_structure.sentences.total}\n`
      if (results.content_structure.headings) {
        summary += `- Headings: ${results.content_structure.headings.total_headings}\n`
      }
      summary += `\n`
    }

    const criticalCount = results.recommendations.critical?.length || 0
    const warningCount = results.recommendations.warnings?.length || 0

    if (criticalCount > 0 || warningCount > 0) {
      summary += `⚠️ Issues Found:\n`
      if (criticalCount > 0) summary += `- ${criticalCount} Critical\n`
      if (warningCount > 0) summary += `- ${warningCount} Warnings\n`
    }

    summary += `\nAnalyzed with Keyword Density Checker`

    return summary
  }

  const handleNativeShare = async () => {
    const summary = generateSummary()

    if (navigator.share) {
      try {
        await navigator.share({
          title: "SEO Analysis Results",
          text: summary,
        })
      } catch (err) {
        // User cancelled or share failed
        console.error("Share failed:", err)
      }
    }
  }

  const summary = generateSummary()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Results</DialogTitle>
          <DialogDescription>
            Share your analysis results with others
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-xs whitespace-pre-wrap font-mono overflow-auto max-h-64">
              {summary}
            </pre>
          </div>
          <div className="flex gap-2">
            <CopyButton text={summary} label="Copy Summary" className="flex-1" />
            {typeof window !== 'undefined' && 'share' in navigator && (
              <Button variant="outline" onClick={handleNativeShare} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
