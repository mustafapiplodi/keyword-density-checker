import type {
  AnalysisResults,
  ComparisonResults,
  TFIDFResults,
  BatchCompetitorResults
} from "@/types"

const API_BASE = "/api"

export interface AnalyzeRequest {
  text?: string
  url?: string
  n_grams?: number[]
  analyze_meta?: boolean
  calculate_prominence?: boolean
  target_keyword?: string
  cluster_keywords?: boolean
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

export async function exportPDF(data: AnalysisResults): Promise<Blob> {
  const response = await fetch(`${API_BASE}/export-pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ results: data }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "PDF export failed")
  }

  return response.blob()
}

export interface TFIDFRequest {
  your_content: string
  competitor_urls: string[]
  source_type: 'url' | 'text'
}

export async function analyzeTFIDF(
  data: TFIDFRequest
): Promise<{ tfidf: TFIDFResults; documents_analyzed: number; failed_urls: any[] }> {
  const response = await fetch(`${API_BASE}/tfidf-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "TF-IDF analysis failed")
  }

  const result = await response.json()
  return result
}

export interface BatchCompetitorRequest {
  your_content: string
  competitor_urls: string[]
  source_type: 'url' | 'text'
}

export async function batchCompetitorAnalysis(
  data: BatchCompetitorRequest
): Promise<BatchCompetitorResults> {
  const response = await fetch(`${API_BASE}/batch-competitor-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Batch analysis failed")
  }

  return response.json()
}
