"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Network, ChevronDown, ChevronUp } from "lucide-react"
import type { KeywordClusters as KeywordClustersType, KeywordCluster } from "@/types"

interface KeywordClustersProps {
  data: KeywordClustersType
}

const STATUS_COLORS = {
  optimal: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200",
  caution: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200",
  warning: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200",
}

function ClusterCard({ cluster, index }: { cluster: KeywordCluster; index: number }) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              {cluster.main_keyword}
            </CardTitle>
            <CardDescription className="mt-2">
              {cluster.keyword_count} related keyword{cluster.keyword_count !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="ml-2"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Cluster Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 p-3 bg-muted rounded-lg">
              <span className="text-xs text-muted-foreground">Total Mentions</span>
              <span className="text-xl font-semibold">{cluster.total_count}</span>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-muted rounded-lg">
              <span className="text-xs text-muted-foreground">Avg. Density</span>
              <span className="text-xl font-semibold">{cluster.avg_density.toFixed(2)}%</span>
            </div>
          </div>

          {/* Related Keywords */}
          {expanded && cluster.keywords.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <h4 className="text-sm font-medium text-muted-foreground">Related Keywords</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cluster.keywords.map((keyword, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg border ${
                      STATUS_COLORS[keyword.status]
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">{keyword.term}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-2">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground">Count</span>
                        <span className="text-sm font-semibold">{keyword.count}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground">Density</span>
                        <span className="text-sm font-semibold">{keyword.density.toFixed(2)}%</span>
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">
                        {keyword.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview badges when collapsed */}
          {!expanded && cluster.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cluster.keywords.slice(0, 5).map((keyword, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {keyword.term}
                </Badge>
              ))}
              {cluster.keywords.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{cluster.keywords.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function KeywordClusters({ data }: KeywordClustersProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Keyword Clusters
          </CardTitle>
          <CardDescription>
            Semantically related keywords grouped by word overlap and similarity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Total Clusters Found</span>
              <span className="text-2xl font-bold">{data.total_clusters}</span>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-sm text-muted-foreground">Showing Top Clusters</span>
              <span className="text-2xl font-bold">{data.clusters.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clusters */}
      {data.clusters.length > 0 ? (
        <div className="grid gap-4">
          {data.clusters.map((cluster, index) => (
            <ClusterCard key={index} cluster={cluster} index={index} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No keyword clusters found. Try analyzing content with more keyword variety.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="mt-0.5">
              <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <span className="text-xs font-bold">i</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                About Keyword Clustering
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Keyword clusters help identify semantic relationships in your content. Keywords are grouped
                based on word overlap (50% threshold for phrases). This analysis helps you understand topic
                coverage and identify opportunities to create focused content around related keyword groups.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
