"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileText, Link as LinkIcon } from "lucide-react"
import type { AnalyzeRequest } from "@/lib/api"

interface AnalysisFormProps {
  onSubmit: (data: AnalyzeRequest) => void
  isLoading: boolean
  error?: string
}

export function AnalysisForm({ onSubmit, isLoading, error }: AnalysisFormProps) {
  const [activeTab, setActiveTab] = useState<"text" | "url">("text")
  const [text, setText] = useState("")
  const [url, setUrl] = useState("")
  const [analyzeMeta, setAnalyzeMeta] = useState(true)
  const [calculateProminence, setCalculateProminence] = useState(true)
  const [selectedNGrams, setSelectedNGrams] = useState([1, 2, 3, 4])
  const [targetKeyword, setTargetKeyword] = useState("")
  const [clusterKeywords, setClusterKeywords] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data: AnalyzeRequest = {
      n_grams: selectedNGrams,
      analyze_meta: analyzeMeta,
      calculate_prominence: calculateProminence,
      target_keyword: targetKeyword.trim() || undefined,
      cluster_keywords: clusterKeywords,
    }

    if (activeTab === "text") {
      data.text = text
    } else {
      data.url = url
    }

    onSubmit(data)
  }

  const toggleNGram = (n: number) => {
    setSelectedNGrams(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n].sort()
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyze Content</CardTitle>
        <CardDescription>
          Enter text directly or provide a URL to analyze keyword density and SEO metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "text" | "url")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">
                <FileText className="w-4 h-4 mr-2" />
                Text Input
              </TabsTrigger>
              <TabsTrigger value="url">
                <LinkIcon className="w-4 h-4 mr-2" />
                URL Input
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">Content Text</Label>
                <Textarea
                  id="text"
                  placeholder="Paste your content here for analysis..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                  required={activeTab === "text"}
                />
                <p className="text-xs text-muted-foreground">
                  {text.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL to Analyze</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required={activeTab === "url"}
                />
                <p className="text-xs text-muted-foreground">
                  Content will be extracted automatically from the URL
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Analysis Options</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select n-gram sizes to analyze
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    onClick={() => toggleNGram(n)}
                    className={`
                      cursor-pointer rounded-lg border-2 p-3 text-center transition-colors
                      ${selectedNGrams.includes(n)
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-muted-foreground/50'
                      }
                    `}
                  >
                    <div className="font-semibold">{n}-gram</div>
                    <div className="text-xs text-muted-foreground">
                      {n === 1 ? 'Single words' : `${n}-word phrases`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="meta">Meta Tag Analysis</Label>
                  <p className="text-xs text-muted-foreground">
                    Analyze title, meta description, and heading tags
                  </p>
                </div>
                <Switch
                  id="meta"
                  checked={analyzeMeta}
                  onCheckedChange={setAnalyzeMeta}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prominence">Prominence Scoring</Label>
                  <p className="text-xs text-muted-foreground">
                    Calculate position-weighted keyword importance
                  </p>
                </div>
                <Switch
                  id="prominence"
                  checked={calculateProminence}
                  onCheckedChange={setCalculateProminence}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cluster">Keyword Clustering</Label>
                  <p className="text-xs text-muted-foreground">
                    Group related keywords by semantic similarity
                  </p>
                </div>
                <Switch
                  id="cluster"
                  checked={clusterKeywords}
                  onCheckedChange={setClusterKeywords}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-keyword">Target Keyword (Optional)</Label>
              <Input
                id="target-keyword"
                type="text"
                placeholder="e.g., keyword density checker"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Analyze how well your content is optimized for a specific keyword
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || selectedNGrams.length === 0}
          >
            {isLoading ? "Analyzing..." : "Analyze Content"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
