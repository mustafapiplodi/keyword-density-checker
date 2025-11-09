"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface ReadabilityGaugeProps {
  score: number
  maxScore?: number
  label: string
  color?: string
}

export function ReadabilityGauge({
  score,
  maxScore = 100,
  label,
  color
}: ReadabilityGaugeProps) {
  // Clamp score between 0 and maxScore
  const clampedScore = Math.max(0, Math.min(score, maxScore))
  const percentage = (clampedScore / maxScore) * 100

  // Determine color based on score if not provided
  const gaugeColor = color || getScoreColor(percentage)

  // Data for the gauge (filled and empty portions)
  const data = [
    { value: clampedScore, color: gaugeColor },
    { value: maxScore - clampedScore, color: 'hsl(var(--muted))' }
  ]

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={45}
              outerRadius={60}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold" style={{ color: gaugeColor }}>
            {clampedScore.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">/ {maxScore}</div>
        </div>
      </div>
      <p className="text-sm text-center mt-2 font-medium">{label}</p>
    </div>
  )
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "hsl(142, 71%, 45%)" // Green
  if (percentage >= 60) return "hsl(48, 96%, 53%)"  // Yellow
  if (percentage >= 40) return "hsl(25, 95%, 53%)"  // Orange
  return "hsl(0, 84%, 60%)" // Red
}
