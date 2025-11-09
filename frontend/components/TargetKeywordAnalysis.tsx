"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, Target } from "lucide-react"
import type { TargetKeywordAnalysis as TargetKeywordAnalysisType } from "@/types"

interface TargetKeywordAnalysisProps {
  data: TargetKeywordAnalysisType
}

const GRADE_COLORS = {
  A: "bg-green-500",
  B: "bg-green-400",
  C: "bg-yellow-500",
  D: "bg-orange-500",
  F: "bg-red-500",
}

const STATUS_VARIANTS = {
  Excellent: "default",
  Good: "secondary",
  Fair: "outline",
  "Needs Improvement": "destructive",
  Poor: "destructive",
} as const

export function TargetKeywordAnalysis({ data }: TargetKeywordAnalysisProps) {
  const gradeColor = GRADE_COLORS[data.grade as keyof typeof GRADE_COLORS] || "bg-gray-500"
  const statusVariant = STATUS_VARIANTS[data.status as keyof typeof STATUS_VARIANTS] || "outline"

  const findingsArray = [
    { key: "density", label: "Keyword Density", maxScore: 30 },
    { key: "title", label: "Title Tag", maxScore: 20 },
    { key: "h1", label: "H1 Heading", maxScore: 15 },
    { key: "first_100", label: "First 100 Words", maxScore: 15 },
    { key: "meta_description", label: "Meta Description", maxScore: 10 },
    { key: "url", label: "URL Slug", maxScore: 10 },
  ]

  const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes("good") || status.toLowerCase().includes("excellent")) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    if (status.toLowerCase().includes("missing") || status.toLowerCase().includes("not found")) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    return <AlertCircle className="h-4 w-4 text-yellow-500" />
  }

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Target Keyword Optimization
              </CardTitle>
              <CardDescription className="mt-1">
                Analyzing optimization for: <span className="font-semibold text-foreground">{data.target_keyword}</span>
              </CardDescription>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className={`${gradeColor} text-white text-3xl font-bold rounded-lg px-4 py-2 min-w-[60px] text-center`}>
                {data.grade}
              </div>
              <Badge variant={statusVariant}>{data.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Score</span>
                <span className="text-2xl font-bold">{data.score}/100</span>
              </div>
              <Progress value={data.score} className="h-3" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1 p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Keyword Count</span>
                <span className="text-xl font-semibold">{data.count}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Keyword Density</span>
                <span className="text-xl font-semibold">{data.density.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Breakdown</CardTitle>
          <CardDescription>Detailed analysis of keyword placement and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {findingsArray.map((item) => {
              const finding = data.findings[item.key as keyof typeof data.findings]
              if (!finding) return null

              const percentage = (finding.score / item.maxScore) * 100

              return (
                <div key={item.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(finding.status)}
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {finding.score}/{item.maxScore}
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground">{finding.status}</span>
                    {'value' in finding && finding.value !== undefined && (
                      <span className="text-xs font-medium">({finding.value.toFixed(2)}%)</span>
                    )}
                    {'text' in finding && finding.text && (
                      <span className="text-xs italic text-muted-foreground ml-auto max-w-[60%] truncate">
                        "{finding.text}"
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recommendations
            </CardTitle>
            <CardDescription>
              Actionable steps to improve your target keyword optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="mt-0.5">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                  </div>
                  <span className="text-sm flex-1">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
