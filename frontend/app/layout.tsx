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
  description: "Free keyword density checker and SEO analyzer by Scaling High Technologies. Check keyword frequency, analyze competitor content, get readability scores, TF-IDF analysis, and comprehensive SEO reports. Optimize content for better Google rankings.",
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
    "keyword stuffing checker",
    "keyword density calculator",
    "SEO content analyzer",
    "free keyword tool"
  ],
  authors: [{ name: "Scaling High Technologies" }],
  creator: "Scaling High Technologies",
  publisher: "Scaling High Technologies",
  robots: "index, follow",
  metadataBase: new URL('https://www.scalinghigh.com'),
  openGraph: {
    title: "Free Keyword Density Checker | SEO Content Analyzer",
    description: "Analyze keyword density, compare with competitors, get readability scores, and optimize your content for search engines. Free SEO tool with TF-IDF analysis.",
    type: "website",
    locale: "en_US",
    url: "https://www.scalinghigh.com/tools/keyword-density-checker",
    siteName: "Scaling High Technologies",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Keyword Density Checker | SEO Content Analyzer",
    description: "Analyze keyword density, compare with competitors, and optimize your content for better search engine rankings.",
    site: "@scalinghigh",
  },
  alternates: {
    canonical: "https://www.scalinghigh.com/tools/keyword-density-checker",
  },
  verification: {
    google: "google-site-verification-code-here",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Keyword Density Checker',
    description: 'Free keyword density checker and SEO analyzer tool for content optimization',
    url: 'https://www.scalinghigh.com/tools/keyword-density-checker',
    applicationCategory: 'SEO Tool',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: 'Scaling High Technologies',
      url: 'https://www.scalinghigh.com',
    },
    featureList: [
      'Keyword Density Analysis',
      'Competitor Comparison',
      'Readability Score',
      'TF-IDF Analysis',
      'Meta Tag Analysis',
      'Content Structure Analysis',
      'Keyword Clustering',
      'SEO Report Export'
    ],
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SkipLink />
          <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
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
                  Powered by{" "}
                  <a
                    href="https://www.scalinghigh.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-foreground transition-colors underline"
                  >
                    Scaling High Technologies
                  </a>
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
