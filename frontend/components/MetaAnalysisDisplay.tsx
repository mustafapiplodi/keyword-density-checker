"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import type { MetaAnalysis } from "@/types"

interface MetaAnalysisDisplayProps {
  metaAnalysis: MetaAnalysis
}

export function MetaAnalysisDisplay({ metaAnalysis }: MetaAnalysisDisplayProps) {
  const renderMetaField = (
    label: string,
    content: string | string[],
    keywords: string[],
    found: boolean
  ) => (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{label}</h4>
        <Badge variant={found ? "optimal" : "warning"}>
          {found ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Found
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Not Found
            </>
          )}
        </Badge>
      </div>

      <div className="space-y-2">
        {Array.isArray(content) ? (
          content.length > 0 ? (
            <div className="space-y-1">
              {content.map((item, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">
                  {item}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No content</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            {content || <span className="italic">No content</span>}
          </p>
        )}

        {keywords.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium mb-1">Keywords found:</p>
            <div className="flex flex-wrap gap-1">
              {keywords.map((kw, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta Tag Analysis</CardTitle>
        <CardDescription>
          Keyword presence in critical SEO elements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renderMetaField(
            "Title Tag",
            metaAnalysis.title?.text || "",
            metaAnalysis.title?.present || [],
            (metaAnalysis.title?.present?.length || 0) > 0
          )}

          {renderMetaField(
            "Meta Description",
            metaAnalysis.meta_description?.text || "",
            metaAnalysis.meta_description?.present || [],
            (metaAnalysis.meta_description?.present?.length || 0) > 0
          )}

          {metaAnalysis.h1 && (metaAnalysis.h1.count || 0) > 0 && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">H1 Tags</h4>
                <Badge variant={(metaAnalysis.h1.present?.length || 0) > 0 ? "optimal" : "warning"}>
                  {(metaAnalysis.h1.present?.length || 0) > 0 ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {metaAnalysis.h1.present.length} found
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      None found
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {metaAnalysis.h1.count} H1 tag(s) on page
              </p>
              {metaAnalysis.h1.present && metaAnalysis.h1.present.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium mb-1">Keywords found:</p>
                  <div className="flex flex-wrap gap-1">
                    {metaAnalysis.h1.present.map((kw: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {metaAnalysis.h2 && (metaAnalysis.h2.count || 0) > 0 && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">H2 Tags</h4>
                <Badge variant={(metaAnalysis.h2.present?.length || 0) > 0 ? "optimal" : "warning"}>
                  {(metaAnalysis.h2.present?.length || 0) > 0 ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {metaAnalysis.h2.present.length} found
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      None found
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {metaAnalysis.h2.count} H2 tag(s) on page
              </p>
              {metaAnalysis.h2.present && metaAnalysis.h2.present.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium mb-1">Keywords found:</p>
                  <div className="flex flex-wrap gap-1">
                    {metaAnalysis.h2.present.map((kw: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium">Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Title Length:</span>
                <span className="ml-2 font-medium">
                  {metaAnalysis.title?.text?.length || 0} characters
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Description Length:</span>
                <span className="ml-2 font-medium">
                  {metaAnalysis.meta_description?.text?.length || 0} characters
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">H1 Count:</span>
                <span className="ml-2 font-medium">
                  {metaAnalysis.h1?.count || 0}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">H2 Count:</span>
                <span className="ml-2 font-medium">
                  {metaAnalysis.h2?.count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
