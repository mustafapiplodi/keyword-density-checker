"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface AnalysisProgressProps {
  isAnalyzing: boolean
}

const ANALYSIS_STEPS = [
  { label: "Fetching content", duration: 2000 },
  { label: "Processing text", duration: 2000 },
  { label: "Analyzing keywords", duration: 2500 },
  { label: "Calculating metrics", duration: 2000 },
  { label: "Generating insights", duration: 1500 },
]

export function AnalysisProgress({ isAnalyzing }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    // Reset when starting
    setCurrentStep(0)
    setProgress(0)

    const totalDuration = ANALYSIS_STEPS.reduce((sum, step) => sum + step.duration, 0)
    let elapsed = 0
    let currentStepIndex = 0

    const interval = setInterval(() => {
      elapsed += 100

      // Calculate progress percentage
      const progressPercent = Math.min((elapsed / totalDuration) * 100, 95)
      setProgress(progressPercent)

      // Update current step
      let stepElapsed = 0
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        stepElapsed += ANALYSIS_STEPS[i].duration
        if (elapsed < stepElapsed) {
          setCurrentStep(i)
          break
        }
      }

      // Stop at 95% to wait for actual response
      if (elapsed >= totalDuration) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isAnalyzing])

  // Complete progress when analysis finishes
  useEffect(() => {
    if (!isAnalyzing && progress > 0) {
      setProgress(100)
      setTimeout(() => {
        setProgress(0)
        setCurrentStep(0)
      }, 500)
    }
  }, [isAnalyzing, progress])

  if (!isAnalyzing && progress === 0) return null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">
              {ANALYSIS_STEPS[currentStep]?.label || "Finalizing..."}
            </p>
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Analyzing your content... This may take a few moments.
        </p>
      </CardContent>
    </Card>
  )
}
