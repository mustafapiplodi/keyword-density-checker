import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ThemeToggle } from "@/components/ThemeToggle"
import { OnboardingTour } from "@/components/OnboardingTour"
import { SkipLink } from "@/components/SkipLink"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Free Keyword Density Checker | SEO Content Analyzer & Optimization Tool",
  description: "Free keyword density checker and SEO analyzer. Check keyword frequency, analyze competitor content, get readability scores, TF-IDF analysis, and comprehensive SEO reports. Optimize content for better Google rankings.",
  keywords: [
    "keyword density checker",
    "keyword density analyzer",
    "SEO tool",
    "keyword frequency checker",
    "content optimizer",
    "keyword analysis",
    "SEO analyzer",
    "competitor analysis",
    "TF-IDF calculator",
    "readability score",
    "meta tag analyzer",
    "keyword density tool",
    "free SEO tool",
    "content analysis",
    "keyword stuffing checker"
  ],
  authors: [{ name: "SEO Tools Team" }],
  creator: "SEO Tools",
  publisher: "SEO Tools",
  robots: "index, follow",
  openGraph: {
    title: "Free Keyword Density Checker | SEO Content Analyzer",
    description: "Analyze keyword density, compare with competitors, get readability scores, and optimize your content for search engines. Free SEO tool with TF-IDF analysis.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Keyword Density Checker | SEO Content Analyzer",
    description: "Analyze keyword density, compare with competitors, and optimize your content for better search engine rankings.",
  },
  alternates: {
    canonical: "/",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SkipLink />
          <div className="min-h-screen bg-background">
            <header className="border-b" role="banner">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Keyword Density Checker
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Professional SEO Analysis Tool
                    </p>
                  </div>
                  <nav className="flex items-center gap-4" aria-label="Main navigation">
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Visit GitHub repository"
                    >
                      GitHub
                    </a>
                    <a
                      href="/docs"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="View documentation"
                    >
                      Documentation
                    </a>
                    <OnboardingTour />
                    <ThemeToggle />
                  </nav>
                </div>
              </div>
            </header>
          <main id="main-content" className="container mx-auto px-4 py-8" role="main" tabIndex={-1}>
            {children}
          </main>
            <footer className="border-t mt-12" role="contentinfo">
              <div className="container mx-auto px-4 py-6">
                <p className="text-center text-sm text-muted-foreground">
                  Built with Next.js, Shadcn UI, and Flask
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
