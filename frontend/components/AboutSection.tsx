"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  BarChart3,
  FileSearch,
  Target,
  TrendingUp,
  Zap,
  Globe,
  PieChart,
  FileText,
  Search,
  Users,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react"

export function AboutSection() {
  const features = [
    {
      icon: <FileSearch className="h-6 w-6" />,
      title: "Advanced Keyword Density Analysis",
      description: "Analyze keyword frequency and density with precision. Our tool calculates 1-gram, 2-gram, 3-gram, and 4-gram keyword density to help you optimize content for search engines."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Target Keyword Optimization",
      description: "Get a comprehensive SEO score (0-100) for your target keyword. Our algorithm analyzes keyword placement in titles, headings, meta descriptions, and content to provide actionable optimization recommendations."
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Readability Score Analysis",
      description: "Measure content readability with Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog Index, and SMOG Index. Ensure your content is accessible to your target audience."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Meta Tag & SEO Analysis",
      description: "Analyze title tags, meta descriptions, H1-H6 headings, and URL structure. Get instant feedback on keyword presence in critical SEO elements with character count recommendations."
    },
    {
      icon: <PieChart className="h-6 w-6" />,
      title: "Interactive Data Visualizations",
      description: "Visualize keyword density with bar charts, line graphs, pie charts, word clouds, and heatmaps. Export charts as PNG images for reports and presentations."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Content Structure Analysis",
      description: "Analyze paragraph length, sentence variety, heading hierarchy, internal/external links, and image alt text coverage. Improve content structure for better user experience and SEO."
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "Keyword Clustering",
      description: "Discover related keywords and content themes with AI-powered keyword clustering. Group semantically similar keywords to identify content topics and improve topical relevance."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "PDF Export",
      description: "Export comprehensive SEO reports as PDF with executive summaries, charts, and actionable recommendations. Perfect for client reports, presentations, and documentation."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "URL & Text Analysis",
      description: "Analyze content from any URL or paste text directly. Our tool fetches webpage content, extracts text, and provides comprehensive SEO analysis for blogs, articles, and landing pages."
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "Real-time SEO Recommendations",
      description: "Get instant SEO recommendations based on industry best practices. Identify over-optimized keywords, keyword stuffing, and opportunities to improve content quality and search rankings."
    }
  ]

  const faqs = [
    {
      question: "What is keyword density and why does it matter for SEO?",
      answer: "Keyword density is the percentage of times a keyword appears in your content compared to the total word count. For example, if a keyword appears 10 times in a 1,000-word article, the keyword density is 1%. Optimal keyword density (typically 0.5-2.5%) helps search engines understand your content topic without triggering keyword stuffing penalties. Our keyword density checker analyzes your content to ensure you're using keywords naturally and effectively for better search engine rankings."
    },
    {
      question: "How does the keyword density checker calculate density?",
      answer: "Our keyword density analyzer uses the formula: (Keyword Count ÷ Total Words) × 100. We analyze single words (1-grams), two-word phrases (2-grams), three-word phrases (3-grams), and four-word phrases (4-grams) to give you comprehensive insights. The tool uses advanced NLP (Natural Language Processing) with lemmatization to group word variations (e.g., 'running' and 'run') and removes common stopwords for more accurate results."
    },
    {
      question: "What is the ideal keyword density for SEO in 2024?",
      answer: "The ideal keyword density for SEO is between 0.5% and 2.5%. Content with keyword density below 0.5% may not rank well because search engines can't determine the main topic. Keyword density above 3.5% is considered keyword stuffing and can result in search engine penalties. Our tool provides color-coded status indicators: Optimal (0.5-2.5%), Caution (2.5-3.5%), Warning (3.5-5%), and Critical (>5%) to help you maintain the perfect balance for modern SEO best practices."
    },
    {
      question: "How does the readability score affect SEO?",
      answer: "Readability scores (Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog Index, and SMOG Index) measure how easy your content is to read and understand. Search engines like Google favor content that provides good user experience, and readability is a key factor. Content that's too difficult to read leads to high bounce rates and low engagement, negatively impacting SEO. Our readability analyzer helps you create content that's both search-engine friendly and user-friendly, improving dwell time and search rankings."
    },
    {
      question: "What is the Target Keyword Optimization score?",
      answer: "The Target Keyword Optimization score (0-100) evaluates how well your content is optimized for a specific keyword. It analyzes keyword placement in: title tags (20 points), H1 headings (15 points), first 100 words (15 points), meta descriptions (10 points), URL slug (10 points), and overall density (30 points). Scores are graded A-F, with actionable recommendations to improve your target keyword optimization for better search engine rankings and organic traffic."
    },
    {
      question: "Can I export my keyword analysis results?",
      answer: "Yes! Our SEO keyword density checker offers professional PDF export functionality. PDF exports include an executive summary, keyword density tables, interactive visualizations, readability scores, SEO recommendations, and detailed analysis results—perfect for client reports, presentations, and documentation. All reports are branded with professional formatting and comprehensive insights."
    },
    {
      question: "Does the tool analyze meta tags and headings for SEO?",
      answer: "Absolutely! Our comprehensive SEO analyzer examines all critical meta elements including title tags (character count and keyword presence), meta descriptions (length and keyword optimization), H1-H6 heading hierarchy, URL structure, and image alt text coverage. The tool identifies missing keywords in meta tags, improper heading structure, and provides specific recommendations to improve on-page SEO factors that directly impact search engine rankings."
    },
    {
      question: "Is this keyword density checker free to use?",
      answer: "Yes, our SEO keyword density analyzer is completely free to use. You can analyze unlimited URLs and text content, get readability scores, export professional PDF reports, and access all advanced features including keyword clustering, target keyword optimization, and content structure analysis without any cost or registration required. We built this tool to help content creators, SEO professionals, bloggers, and digital marketers improve their content quality and search engine rankings."
    },
    {
      question: "What makes this different from other keyword density checkers?",
      answer: "Our keyword density tool goes beyond basic keyword counting. It includes: (1) Advanced NLP with lemmatization for accurate analysis, (2) Multi-gram analysis (1-4 word phrases), (3) Competitor comparison and batch analysis, (4) TF-IDF scoring for content uniqueness, (5) Readability metrics (4 different indices), (6) Target keyword optimization scoring, (7) Keyword clustering for topic discovery, (8) Interactive visualizations (charts, word clouds, heatmaps), (9) Content structure analysis (paragraphs, sentences, links, images), (10) Professional PDF reports with executive summaries. It's an all-in-one SEO content optimization platform, not just a simple density calculator."
    },
    {
      question: "How often should I check keyword density when writing SEO content?",
      answer: "We recommend checking keyword density multiple times during content creation: (1) During outline creation to plan keyword placement, (2) After writing the first draft to identify over/under-optimization, (3) After revisions to ensure optimal density, and (4) Before publishing to verify all SEO elements are optimized. For existing content, run keyword density analysis quarterly or whenever updating content to ensure it maintains competitive keyword usage and follows current SEO best practices. Regular analysis helps prevent keyword stuffing and ensures your content stays optimized for search engines."
    }
  ]

  return (
    <section className="space-y-16 py-8" id="about">
      {/* About Section */}
      <Card className="border-none shadow-none bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-8 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <h2 className="text-2xl font-bold tracking-tight">
                About Our Free SEO Keyword Density Checker
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                A comprehensive, free SEO tool designed to help content creators, digital marketers, and SEO professionals
                optimize their content for search engines. Get <strong>keyword frequency analysis</strong>, <strong>readability
                scoring</strong>, <strong>meta tag analysis</strong>, and <strong>content structure evaluation</strong> all
                in one powerful platform.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Analyze single keywords and multi-word phrases (1-4 grams), get target keyword optimization scores, and receive
                actionable recommendations. With <strong>keyword clustering</strong>, <strong>interactive visualizations</strong>, and
                <strong>professional PDF export</strong>, create SEO-optimized content that ranks higher on Google.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">
            Powerful Features for SEO Content Optimization
          </h2>
          <p className="text-lg text-muted-foreground">
            All the tools you need to create perfectly optimized content that ranks on search engines
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-muted/50 hover:border-primary/50"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about keyword density analysis and SEO content optimization
          </p>
        </div>

        <Card className="border-muted/50 shadow-sm">
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-muted/30 last:border-0">
                  <AccordionTrigger className="text-left hover:text-primary transition-colors py-4">
                    <span className="font-semibold text-base pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="border-none shadow-none bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <CardContent className="pt-8 pb-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/20 rounded-2xl">
                <ArrowRight className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold">
              Start Optimizing Your Content Today
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Join SEO professionals, content marketers, and bloggers worldwide who use our <strong>keyword density
              analyzer</strong> to create search-engine-optimized content that ranks higher on Google. Get keyword
              frequency analysis, readability scores, content structure analysis, and actionable SEO recommendations—all
              completely free.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
