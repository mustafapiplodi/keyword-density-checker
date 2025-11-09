"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import html2canvas from "html2canvas"
import type { KeywordItem } from "@/types"

interface KeywordHeatmapProps {
  data: KeywordItem[]
  title?: string
  description?: string
}

export function KeywordHeatmap({ data, title = "Keyword Density Heatmap", description }: KeywordHeatmapProps) {
  const [isExporting, setIsExporting] = React.useState(false)
  const heatmapRef = React.useRef<HTMLDivElement>(null)

  // Prepare heatmap data (top 30 keywords)
  const heatmapData = data.slice(0, 30)

  // Calculate color intensity based on density
  const getHeatColor = (density: number, status: KeywordItem["status"]) => {
    // Base colors by status
    const baseColors = {
      optimal: { r: 34, g: 197, b: 94 },   // green
      caution: { r: 245, g: 158, b: 11 },  // yellow
      warning: { r: 249, g: 115, b: 22 },  // orange
      critical: { r: 239, g: 68, b: 68 },  // red
    }

    const color = baseColors[status]

    // Adjust opacity based on density (higher density = higher opacity)
    const maxDensity = Math.max(...heatmapData.map(d => d.density))
    const opacity = Math.max(0.3, Math.min(1, density / maxDensity))

    return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`
  }

  const handleExport = async () => {
    if (!heatmapRef.current) return

    setIsExporting(true)
    try {
      const canvas = await html2canvas(heatmapRef.current, {
        backgroundColor: null,
        scale: 2,
      })

      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'keyword-density-heatmap.png'
      link.href = url
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
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
      </CardHeader>
      <CardContent>
        <div ref={heatmapRef}>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {heatmapData.map((item, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-lg flex items-center justify-center p-2 text-center cursor-pointer transition-transform hover:scale-105"
                style={{
                  backgroundColor: getHeatColor(item.density, item.status),
                }}
              >
                <div className="relative z-10">
                  <div className="text-white font-semibold text-xs sm:text-sm drop-shadow-lg line-clamp-2">
                    {item.term}
                  </div>
                  <div className="text-white text-xs font-bold mt-1 drop-shadow-lg">
                    {item.density.toFixed(1)}%
                  </div>
                </div>

                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                  <div className="bg-card border rounded-lg shadow-lg p-3 whitespace-nowrap">
                    <p className="font-medium text-sm">{item.term}</p>
                    <p className="text-xs text-muted-foreground">Count: {item.count}</p>
                    <p className="text-xs text-muted-foreground">Density: {item.density.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground capitalize">Status: {item.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium">Intensity Guide</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.3)' }} />
                <span>Low Density</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 1)' }} />
                <span>High Density</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Color indicates status (green=optimal, yellow=caution, orange=warning, red=critical)
              <br />
              Intensity indicates relative density within the keyword set
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
