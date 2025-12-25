"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, Copy } from "lucide-react"

export default function TextGenerator() {
  const [prompt, setPrompt] = useState("")
  const [wordCount, setWordCount] = useState("100")
  const [loading, setLoading] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setGeneratedText("")

    try {
      // Request generated text directly from N8N webhook
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_GENERATE_TEXT_WEBHOOK;

      if (!webhookUrl) {
        throw new Error("N8N Generate Text Webhook URL is not configured");
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          wordCount: wordCount.toString(),
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate text directly from N8N")
      }

      const data = await response.json()
      setGeneratedText(data.generatedText || data.text || data.output || "")

      if (!data.generatedText && !data.text && !data.output) {
        setMessage({
          type: "error",
          text: "No text was generated. Please check your n8n workflow configuration.",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to generate text. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-sm font-medium">
            Learning Request <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="prompt"
            placeholder="e.g., Write a paragraph about daily routine using German words, or: Create sentences about shopping at the market"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
            className="bg-background border-input min-h-24"
          />
          <p className="text-xs text-muted-foreground">
            Describe what kind of text you'd like to generate using your stored German words
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="wordCount" className="text-sm font-medium">
            Approximate Length (words)
          </Label>
          <Input
            id="wordCount"
            type="number"
            min="50"
            max="500"
            value={wordCount}
            onChange={(e) => setWordCount(e.target.value)}
            className="bg-background border-input"
          />
        </div>

        {message && (
          <div
            className={`flex items-gap-2 p-3 rounded-lg border ${message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
              }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !prompt}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "✨ Generate Learning Text"
          )}
        </Button>
      </form>

      {/* Generated Text Display */}
      {generatedText && (
        <Card className="border border-border bg-accent/5 p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Generated Text</h3>
              <Button size="sm" variant="outline" onClick={handleCopy} className="text-xs bg-transparent">
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{generatedText}</p>
          </div>
        </Card>
      )}

      <Card className="border border-border bg-blue-50 dark:bg-blue-950/20 p-4">
        <p className="text-sm text-muted-foreground">
          <strong>💡 How it works:</strong> Your stored German words are used to create realistic stories and sentences, helping you learn them in context.
        </p>
      </Card>
    </div>
  )
}
