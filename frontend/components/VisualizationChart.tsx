"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts"
import type { KeywordItem } from "@/types"

interface VisualizationChartProps {
  data: KeywordItem[]
  title: string
  description?: string
}

const STATUS_COLORS = {
  optimal: "hsl(142, 71%, 45%)",
  caution: "hsl(48, 96%, 53%)",
  warning: "hsl(25, 95%, 53%)",
  critical: "hsl(0, 84%, 60%)",
}

export function VisualizationChart({ data, title, description }: VisualizationChartProps) {
  const chartData = data.slice(0, 15).map(item => ({
    name: item.term.length > 20 ? item.term.substring(0, 20) + '...' : item.term,
    density: Number(item.density.toFixed(2)),
    count: item.count,
    status: item.status,
    fullTerm: item.term,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              className="text-xs"
            />
            <YAxis
              label={{ value: 'Density (%)', angle: -90, position: 'insideLeft' }}
              className="text-xs"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload[0]) return null
                const data = payload[0].payload
                return (
                  <div className="bg-card border rounded-lg shadow-lg p-3">
                    <p className="font-medium mb-1">{data.fullTerm}</p>
                    <p className="text-sm text-muted-foreground">
                      Count: {data.count}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Density: {data.density}%
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      Status: {data.status}
                    </p>
                  </div>
                )
              }}
            />
            <Legend />
            <Bar dataKey="density" name="Density (%)">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.optimal }} />
            <span>Optimal (0.5-2.5%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.caution }} />
            <span>Caution (2.5-3.5%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.warning }} />
            <span>Warning (3.5-5%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.critical }} />
            <span>Critical (&gt;5%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
