"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface CompetitorProgressProps {
  isLoading: boolean
  type: "single" | "batch"
}

const SINGLE_STEPS = [
  { label: "Fetching competitor content", duration: 2500 },
  { label: "Analyzing competitor keywords", duration: 2500 },
  { label: "Comparing densities", duration: 2000 },
  { label: "Identifying gaps and opportunities", duration: 2000 },
]

const BATCH_STEPS = [
  { label: "Fetching competitor pages", duration: 3000 },
  { label: "Analyzing all competitors", duration: 4000 },
  { label: "Calculating TF-IDF scores", duration: 3000 },
  { label: "Generating comparison matrix", duration: 2500 },
]

export function CompetitorProgress({ isLoading, type }: CompetitorProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = type === "single" ? SINGLE_STEPS : BATCH_STEPS

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    // Reset when starting
    setCurrentStep(0)
    setProgress(0)

    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)
    let elapsed = 0

    const interval = setInterval(() => {
      elapsed += 100

      // Calculate progress percentage
      const progressPercent = Math.min((elapsed / totalDuration) * 100, 95)
      setProgress(progressPercent)

      // Update current step
      let stepElapsed = 0
      for (let i = 0; i < steps.length; i++) {
        stepElapsed += steps[i].duration
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
  }, [isLoading, steps])

  // Complete progress when loading finishes
  useEffect(() => {
    if (!isLoading && progress > 0) {
      setProgress(100)
      setTimeout(() => {
        setProgress(0)
        setCurrentStep(0)
      }, 500)
    }
  }, [isLoading, progress])

  if (!isLoading && progress === 0) return null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">
              {steps[currentStep]?.label || "Finalizing comparison..."}
            </p>
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {type === "batch"
            ? "Analyzing multiple competitors... This may take longer."
            : "Comparing with competitor... Please wait."}
        </p>
      </CardContent>
    </Card>
  )
}
