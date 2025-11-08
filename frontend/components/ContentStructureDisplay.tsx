"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ContentStructure } from "@/types"
import { AlertCircle, FileText, Hash, Link, Image as ImageIcon, Video } from "lucide-react"

interface ContentStructureDisplayProps {
  structure: ContentStructure
}

export function ContentStructureDisplay({ structure }: ContentStructureDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Structure Analysis</CardTitle>
        <CardDescription>
          Structural elements and organization of your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Paragraphs Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5" />
            <h3 className="font-semibold">Paragraphs</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{structure.paragraphs.total}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Avg Words</div>
              <div className="text-2xl font-bold">{structure.paragraphs.avg_words.toFixed(0)}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Range</div>
              <div className="text-lg font-bold">
                {structure.paragraphs.min_words}-{structure.paragraphs.max_words}
              </div>
            </div>
          </div>
          {(structure.paragraphs.short_paragraphs > 0 || structure.paragraphs.long_paragraphs > 0) && (
            <div className="mt-3 text-sm text-muted-foreground space-y-1">
              {structure.paragraphs.short_paragraphs > 0 && (
                <div>• {structure.paragraphs.short_paragraphs} short paragraphs (&lt;50 words)</div>
              )}
              {structure.paragraphs.long_paragraphs > 0 && (
                <div>• {structure.paragraphs.long_paragraphs} long paragraphs (&gt;150 words)</div>
              )}
            </div>
          )}
        </div>

        {/* Sentences Section */}
        <div>
          <h3 className="font-semibold mb-3">Sentences</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{structure.sentences.total}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Short</div>
              <div className="text-lg font-bold">{structure.sentences.short}</div>
              <div className="text-xs text-muted-foreground">≤10 words</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Medium</div>
              <div className="text-lg font-bold">{structure.sentences.medium}</div>
              <div className="text-xs text-muted-foreground">11-20 words</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Long</div>
              <div className="text-lg font-bold">{structure.sentences.long}</div>
              <div className="text-xs text-muted-foreground">&gt;20 words</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Variety Score</span>
              <Badge variant={structure.sentences.variety_score > 70 ? "optimal" : "default"}>
                {structure.sentences.variety_score.toFixed(0)}%
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${structure.sentences.variety_score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Headings Section */}
        {structure.headings && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Hash className="h-5 w-5" />
              <h3 className="font-semibold">Headings</h3>
              <Badge variant="default">{structure.headings.total_headings} total</Badge>
            </div>

            {structure.headings.issues && structure.headings.issues.length > 0 && (
              <div className="mb-3 space-y-2">
                {structure.headings.issues.map((issue, idx) => (
                  <Alert key={idx} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{issue}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {Object.entries(structure.headings.data).map(([tag, data]) => (
                <div key={tag}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium uppercase">{tag}</span>
                    <Badge variant="outline">{data.count}</Badge>
                  </div>
                  {data.texts && data.texts.length > 0 && (
                    <div className="pl-4 space-y-1">
                      {data.texts.slice(0, 3).map((text, idx) => (
                        <div key={idx} className="text-sm text-muted-foreground truncate">
                          • {text}
                        </div>
                      ))}
                      {data.texts.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          ...and {data.texts.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links Section */}
        {structure.links && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link className="h-5 w-5" />
              <h3 className="font-semibold">Links</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">{structure.links.total}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Internal</div>
                <div className="text-2xl font-bold">{structure.links.internal}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">External</div>
                <div className="text-2xl font-bold">{structure.links.external}</div>
              </div>
            </div>
            {structure.links.external_urls && structure.links.external_urls.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium hover:text-primary">
                  View External Links
                </summary>
                <div className="mt-2 pl-4 space-y-1">
                  {structure.links.external_urls.slice(0, 10).map((url, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground truncate">
                      • {url}
                    </div>
                  ))}
                  {structure.links.external_urls.length > 10 && (
                    <div className="text-xs text-muted-foreground">
                      ...and {structure.links.external_urls.length - 10} more
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Images Section */}
        {structure.images && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="h-5 w-5" />
              <h3 className="font-semibold">Images</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">{structure.images.total}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">With Alt</div>
                <div className="text-2xl font-bold">{structure.images.with_alt}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Missing Alt</div>
                <div className="text-2xl font-bold">{structure.images.without_alt}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Alt Text Coverage</span>
                <Badge variant={structure.images.alt_text_coverage >= 90 ? "optimal" : structure.images.alt_text_coverage >= 70 ? "default" : "warning"}>
                  {structure.images.alt_text_coverage.toFixed(0)}%
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${structure.images.alt_text_coverage}%` }}
                />
              </div>
            </div>
            {structure.images.without_alt > 0 && (
              <Alert variant="destructive" className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {structure.images.without_alt} image{structure.images.without_alt !== 1 ? 's' : ''} missing alt text. Add descriptive alt text for better accessibility and SEO.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Multimedia Section */}
        {structure.multimedia && structure.multimedia.has_multimedia && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-5 w-5" />
              <h3 className="font-semibold">Multimedia</h3>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Videos</div>
              <div className="text-2xl font-bold">{structure.multimedia.videos}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
