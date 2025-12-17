"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Activity, AlertCircle, CheckCircle2, Eye, Globe, Search, Zap } from "lucide-react"

type ImpactLevel = "High" | "Medium" | "Low"

interface Issue {
  type: string
  title: string
  reason: string
  impact: ImpactLevel
  fix: string
  helpUrl: string | null
}

interface AnalysisResult {
  summary: {
    performance: number
    seo: number
    accessibility: number
    bestPractices: number
    totalIssues: number
  }
  issues: Issue[]
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-500"
  if (score >= 50) return "text-amber-500"
  return "text-red-500"
}

const getScoreBgColor = (score: number) => {
  if (score >= 80) return "from-emerald-500/20 to-emerald-500/5"
  if (score >= 50) return "from-amber-500/20 to-amber-500/5"
  return "from-red-500/20 to-red-500/5"
}

const getImpactColor = (impact: ImpactLevel) => {
  switch (impact) {
    case "High":
      return "bg-red-500/10 text-red-500 border-red-500/20"
    case "Medium":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    case "Low":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
  }
}

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "performance":
      return <Zap className="w-4 h-4" />
    case "seo":
      return <Search className="w-4 h-4" />
    case "accessibility":
      return <Eye className="w-4 h-4" />
    case "ui":
      return <Globe className="w-4 h-4" />
    default:
      return <Activity className="w-4 h-4" />
  }
}

const ScoreCard = ({ title, score, icon }: { title: string; score: number; icon: React.ReactNode }) => {
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${getScoreBgColor(score)} opacity-50`} />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-center justify-center">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
  }

  const handleAnalyze = async () => {
    if (!isValidUrl(url)) {
      setError("Please enter a valid URL (e.g., https://example.com)")
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("https://webaudithq.onrender.com/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.")
      }

      const data = await response.json()
      setResult(data)

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">WebAuditHQ</h1>
              <p className="text-sm text-muted-foreground">Analyze performance, SEO, accessibility & UI issues</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Input Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Enter Website URL</CardTitle>
            <CardDescription>Run a comprehensive analysis to identify issues and improvements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && url) {
                    handleAnalyze()
                  }
                }}
                className="flex-1"
                disabled={loading}
              />
              <Button onClick={handleAnalyze} disabled={!url || loading} size="lg" className="sm:w-auto w-full">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Run Full Website Test
                  </>
                )}
              </Button>
            </div>
            {error && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-lg font-medium">Running deep website analysis...</p>
            <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div id="results" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary Cards */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                Analysis Complete
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ScoreCard title="Performance" score={result.summary.performance} icon={<Zap className="w-5 h-5" />} />
                <ScoreCard title="SEO" score={result.summary.seo} icon={<Search className="w-5 h-5" />} />
                <ScoreCard
                  title="Accessibility"
                  score={result.summary.accessibility}
                  icon={<Eye className="w-5 h-5" />}
                />
                <ScoreCard
                  title="Best Practices"
                  score={result.summary.bestPractices}
                  icon={<Activity className="w-5 h-5" />}
                />
              </div>
            </div>

            {/* Issues Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Detected Issues & Fix Suggestions</h2>
                <span className="text-sm text-muted-foreground">
                  {result.summary.totalIssues} {result.summary.totalIssues === 1 ? "issue" : "issues"} found
                </span>
              </div>

              {result.issues.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">No issues detected!</p>
                    <p className="text-sm text-muted-foreground mt-2">Your website is looking great.</p>
                  </CardContent>
                </Card>
              ) : (
                <Accordion type="single" collapsible className="space-y-3">
                  {result.issues.map((issue, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border border-border rounded-lg overflow-hidden bg-card"
                    >
                      <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-4 text-left flex-1 pr-4">
                          <div className="mt-0.5">{getTypeIcon(issue.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-semibold">{issue.title}</span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getImpactColor(issue.impact)}`}
                              >
                                {issue.impact}
                              </span>
                              <span className="text-xs text-muted-foreground">{issue.type}</span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-4 pt-4">
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Root Cause</h4>
                            <p className="text-sm text-muted-foreground">{issue.reason}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-2">How to Fix</h4>
                            <p className="text-sm text-muted-foreground">{issue.fix}</p>
                          </div>
                          {issue.helpUrl && (
                            <div>
                              <a
                                href={issue.helpUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                              >
                                Learn more
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
