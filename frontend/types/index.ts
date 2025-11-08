export interface KeywordItem {
  term: string
  count: number
  density: number
  status: 'optimal' | 'caution' | 'warning' | 'critical'
}

export interface Recommendation {
  keyword: string
  issue?: string
  status?: string
  current: string
  action?: string
  suggestion?: string
  tip: string
}

export interface MetaAnalysis {
  title: {
    present: string[]
    missing: string[]
    text: string
  }
  meta_description: {
    present: string[]
    missing: string[]
    text: string
  }
  h1: {
    present: string[]
    missing: string[]
    count: number
  }
  h2: {
    present: string[]
    missing: string[]
    count: number
  }
  h3: {
    present: string[]
    missing: string[]
    count: number
  }
  url: {
    present: string[]
    missing: string[]
    text: string
  }
  recommendations: Array<{
    type: 'critical' | 'warning'
    issue: string
    action: string
  }>
}

export interface ProminenceScore {
  keyword: string
  total_score: number
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor'
  breakdown: {
    title: { count: number; weight: number; score: number }
    h1: { count: number; weight: number; score: number }
    first_100_words: { count: number; weight: number; score: number }
    h2_h3: { count: number; weight: number; score: number }
    url: { count: number; weight: number; score: number }
    meta_description: { count: number; weight: number; score: number }
    body: { count: number; weight: number; score: number }
  }
}

export interface AnalysisResults {
  total_words: number
  unique_words: number
  single_words: KeywordItem[]
  two_word_phrases: KeywordItem[]
  three_word_phrases: KeywordItem[]
  four_word_phrases: KeywordItem[]
  recommendations: {
    critical: Recommendation[]
    warnings: Recommendation[]
    opportunities: Recommendation[]
  }
  meta_analysis?: MetaAnalysis
  prominence_scores?: ProminenceScore[]
  metadata?: any
}

export interface ComparisonStats {
  total_words: number
  unique_words: number
  top_keyword?: KeywordItem
}

export interface ComparisonResults {
  your_stats: ComparisonStats
  competitor_stats: ComparisonStats
  keyword_gaps: Array<{
    keyword: string
    competitor_count: number
    competitor_density: number
    your_count: number
    recommendation: string
  }>
  opportunities: Array<{
    keyword: string
    your_density: number
    competitor_density: number
    recommendation: string
  }>
  advantages: Array<{
    keyword: string
    your_density: number
    competitor_density: number
    note: string
  }>
}

export interface TFIDFScore {
  term: string
  tf: number
  idf: number
  tfidf: number
  count: number
  document_frequency: number
  uniqueness: 'high' | 'medium' | 'low'
}

export interface TFIDFResults {
  total_documents: number
  scores: TFIDFScore[]
  analysis: {
    unique_terms: number
    common_terms: number
    average_tfidf: number
  }
}

export interface BatchCompetitorResults {
  success: boolean
  analyzed_competitors: number
  failed_competitors: number
  failed_urls: Array<{ url: string; error: string }>
  keyword_gaps: Array<{
    keyword: string
    competitor_count: number
    avg_density: number
    importance_score: number
  }>
  common_keywords: Array<{
    keyword: string
    competitor_count: number
    avg_competitor_density: number
    your_density: number
    gap: number
  }>
  your_unique_strengths: Array<{
    keyword: string
    your_density: number
    competitor_usage: number
  }>
  tfidf_scores: TFIDFScore[]
  summary: {
    total_competitor_keywords: number
    gaps_identified: number
    common_keywords_found: number
    your_unique_keywords: number
    recommendation: string
  }
  competitors: Array<{
    url: string
    title: string
    total_words: number
  }>
}
