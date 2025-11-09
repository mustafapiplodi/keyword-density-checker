"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react"
import html2canvas from "html2canvas"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
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

type ChartType = 'bar' | 'line' | 'pie'

const STATUS_COLORS = {
  optimal: "hsl(142, 71%, 45%)",
  caution: "hsl(48, 96%, 53%)",
  warning: "hsl(25, 95%, 53%)",
  critical: "hsl(0, 84%, 60%)",
}

export function VisualizationChart({ data, title, description }: VisualizationChartProps) {
  const [chartType, setChartType] = React.useState<ChartType>('bar')
  const [isExporting, setIsExporting] = React.useState(false)
  const chartRef = React.useRef<HTMLDivElement>(null)

  const chartData = data.slice(0, 15).map(item => ({
    name: item.term.length > 20 ? item.term.substring(0, 20) + '...' : item.term,
    density: Number(item.density.toFixed(2)),
    count: item.count,
    status: item.status,
    fullTerm: item.term,
  }))

  const handleExport = async () => {
    if (!chartRef.current) return

    setIsExporting(true)
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: null,
        scale: 2,
      })

      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-chart.png`
      link.href = url
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
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
                  </div>
                )
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="density" name="Density (%)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        )

      case 'pie':
        const pieData = chartData.map(item => ({
          ...item,
          value: item.density,
        }))
        return (
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={(entry) => `${entry.name}: ${entry.value}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
              ))}
            </Pie>
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
                  </div>
                )
              }}
            />
          </PieChart>
        )

      default: // 'bar'
        return (
          <BarChart {...commonProps}>
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
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={chartType === 'bar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="h-8 w-8 p-0"
                title="Bar Chart"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="h-8 w-8 p-0"
                title="Line Chart"
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('pie')}
                className="h-8 w-8 p-0"
                title="Pie Chart"
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef}>
          <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>

          {chartType !== 'pie' && (
            <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
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
          )}
        </div>
      </CardContent>
    </Card>
  )
}
