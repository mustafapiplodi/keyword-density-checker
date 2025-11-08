import type { AnalysisResults, ComparisonResults } from "@/types"

const API_BASE = "/api"

export interface AnalyzeRequest {
  text?: string
  url?: string
  n_grams?: number[]
  analyze_meta?: boolean
  calculate_prominence?: boolean
}

export interface CompareRequest {
  your_text?: string
  your_url?: string
  competitor_url: string
  n_grams?: number[]
}

export async function analyzeContent(
  data: AnalyzeRequest
): Promise<AnalysisResults> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Analysis failed")
  }

  return response.json()
}

export async function compareCompetitor(
  data: CompareRequest
): Promise<ComparisonResults> {
  const response = await fetch(`${API_BASE}/compare-competitor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Comparison failed")
  }

  return response.json()
}

export async function exportCSV(data: AnalysisResults): Promise<Blob> {
  const response = await fetch(`${API_BASE}/export-csv`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Export failed")
  }

  return response.blob()
}
