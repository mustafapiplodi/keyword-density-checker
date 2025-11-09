"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import html2canvas from "html2canvas"
import cloud from "d3-cloud"
import type { KeywordItem } from "@/types"

interface KeywordWordCloudProps {
  data: KeywordItem[]
  title?: string
  description?: string
}

interface CloudWord {
  text: string
  size: number
  x?: number
  y?: number
  rotate?: number
  color: string
}

const STATUS_COLORS = {
  optimal: "#22c55e",
  caution: "#f59e0b",
  warning: "#f97316",
  critical: "#ef4444",
}

export function KeywordWordCloud({ data, title = "Keyword Word Cloud", description }: KeywordWordCloudProps) {
  const [words, setWords] = React.useState<CloudWord[]>([])
  const [isExporting, setIsExporting] = React.useState(false)
  const cloudRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!containerRef.current) return

    const width = containerRef.current.offsetWidth || 800
    const height = 400

    // Prepare word data
    const wordData: CloudWord[] = data.slice(0, 50).map((item) => ({
      text: item.term,
      size: Math.max(12, Math.min(60, item.density * 10)), // Size based on density
      color: STATUS_COLORS[item.status],
    }))

    // Generate cloud layout
    const layout = cloud()
      .size([width, height])
      .words(wordData as any[])
      .padding(5)
      .rotate(() => (Math.random() > 0.7 ? 90 : 0))
      .fontSize((d: any) => d.size)
      .on('end', (computedWords: any[]) => {
        setWords(computedWords as CloudWord[])
      })

    layout.start()
  }, [data])

  const handleExport = async () => {
    if (!cloudRef.current) return

    setIsExporting(true)
    try {
      const canvas = await html2canvas(cloudRef.current, {
        backgroundColor: null,
        scale: 2,
      })

      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'keyword-word-cloud.png'
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
        <div ref={containerRef} className="w-full">
          <div
            ref={cloudRef}
            className="relative bg-muted/20 rounded-lg"
            style={{ height: '400px' }}
          >
            <svg
              width="100%"
              height="400"
              className="overflow-visible"
            >
              <g transform={`translate(${containerRef.current?.offsetWidth ? containerRef.current.offsetWidth / 2 : 400}, 200)`}>
                {words.map((word, index) => (
                  <text
                    key={index}
                    style={{
                      fontSize: `${word.size}px`,
                      fill: word.color,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    textAnchor="middle"
                    transform={`translate(${word.x},${word.y}) rotate(${word.rotate})`}
                    className="transition-opacity hover:opacity-70"
                  >
                    {word.text}
                  </text>
                ))}
              </g>
            </svg>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.optimal }} />
            <span>Optimal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.caution }} />
            <span>Caution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.warning }} />
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.critical }} />
            <span>Critical</span>
          </div>
          <span className="text-muted-foreground">• Larger words = higher density</span>
        </div>
      </CardContent>
    </Card>
  )
}
