"use client"

import React, { useState, useEffect } from "react"
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

const tourSteps: Step[] = [
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="text-lg font-bold">Welcome to SEO Keyword Density Analyzer! 👋</h3>
        <p>Let's take a quick tour of the main features to help you get started.</p>
      </div>
    ),
    placement: "center",
  },
  {
    target: '[data-tour="input-tabs"]',
    content: (
      <div className="space-y-2">
        <h4 className="font-semibold">Text or URL Input</h4>
        <p>Choose between analyzing text directly or fetching content from a URL.</p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="target-keyword"]',
    content: (
      <div className="space-y-2">
        <h4 className="font-semibold">Target Keyword Optimization</h4>
        <p>Enter a target keyword to get a comprehensive optimization score (0-100) with actionable recommendations.</p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="clustering-toggle"]',
    content: (
      <div className="space-y-2">
        <h4 className="font-semibold">Keyword Clustering</h4>
        <p>Enable this to group related keywords and discover content themes.</p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="analyze-button"]',
    content: (
      <div className="space-y-2">
        <h4 className="font-semibold">Analyze Content</h4>
        <p>Click here to start the analysis. The system will analyze keyword density, readability, and SEO metrics.</p>
      </div>
    ),
    placement: "top",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="text-lg font-bold">Results Tabs 📊</h3>
        <p>After analysis, you'll see multiple tabs:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><b>Results:</b> Keyword density tables and export options</li>
          <li><b>Charts:</b> Interactive visualizations (word clouds, heatmaps)</li>
          <li><b>SEO:</b> Target keyword optimization and keyword clusters</li>
          <li><b>Content Quality:</b> Readability scores and structure analysis</li>
          <li><b>Meta Tags:</b> Title, description, and heading analysis</li>
          <li><b>Competitor:</b> Compare with competitor content</li>
          <li><b>Batch Analysis:</b> Compare with multiple competitors at once</li>
        </ul>
      </div>
    ),
    placement: "center",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="text-lg font-bold">Export Your Reports 📄</h3>
        <p>After analyzing, you can export results as:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><b>CSV:</b> Simple data export for spreadsheets</li>
          <li><b>PDF:</b> Professional report with executive summary and charts</li>
        </ul>
      </div>
    ),
    placement: "center",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="text-lg font-bold">You're All Set! 🎉</h3>
        <p>You can restart this tour anytime by clicking the help icon (?) in the header.</p>
        <p className="text-sm text-muted-foreground">Happy analyzing!</p>
      </div>
    ),
    placement: "center",
  },
]

export function OnboardingTour() {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      setRun(false)
      setStepIndex(0)
    }

    // Handle step progression
    if (type === 'step:after' && action === 'next') {
      setStepIndex(index + 1)
    } else if (type === 'step:after' && action === 'prev') {
      setStepIndex(index - 1)
    }
  }

  const startTour = () => {
    setRun(true)
    setStepIndex(0)
  }

  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        title="Start Tutorial"
        disabled
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Help</span>
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={startTour}
        className="gap-2"
        title="Start Tutorial"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Help</span>
      </Button>

      <Joyride
        steps={tourSteps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        scrollToFirstStep
        disableScrolling={false}
        disableScrollParentFix={true}
        scrollOffset={200}
        spotlightPadding={10}
        styles={{
          options: {
            primaryColor: "#3b82f6",
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 8,
            padding: 20,
          },
          tooltipContent: {
            padding: "8px 0",
          },
          buttonNext: {
            backgroundColor: "#3b82f6",
            borderRadius: 6,
            padding: "8px 16px",
          },
          buttonBack: {
            color: "#6b7280",
            marginRight: 8,
          },
          buttonSkip: {
            color: "#9ca3af",
          },
        }}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish",
          next: "Next",
          skip: "Skip tour",
        }}
      />
    </>
  )
}
