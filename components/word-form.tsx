"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface WordFormProps {
  onWordAdded: () => void
}

export default function WordForm({ onWordAdded }: WordFormProps) {
  const [german, setGerman] = useState("")
  const [english, setEnglish] = useState("")
  const [arabic, setArabic] = useState("")
  const [partOfSpeech, setPartOfSpeech] = useState("")
  const [example, setExample] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Send data directly to N8N webhook
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_ADD_WORDS_WEBHOOK;

      if (!webhookUrl) {
        throw new Error("N8N Add Words Webhook URL is not configured");
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deutsch: german,
          englisch: english,
          arabisch: arabic,
          speech: partOfSpeech,
          example,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit word directly to N8N")
      }

      setMessage({
        type: "success",
        text: `"${german}" added successfully!`,
      })

      // Reset form
      setGerman("")
      setEnglish("")
      setArabic("")
      setPartOfSpeech("")
      setExample("")
      onWordAdded()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to add word. Please check your n8n configuration.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="german" className="text-sm font-medium">
            German Word/Phrase <span className="text-destructive">*</span>
          </Label>
          <Input
            id="german"
            placeholder="e.g., Schmetterling"
            value={german}
            onChange={(e) => setGerman(e.target.value)}
            required
            className="bg-background border-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="english" className="text-sm font-medium">
            English Translation
          </Label>
          <Input
            id="english"
            placeholder="e.g., Butterfly"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            className="bg-background border-input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="arabic" className="text-sm font-medium">
          Arabic Translation
        </Label>
        <Input
          id="arabic"
          placeholder="e.g., فراشة"
          value={arabic}
          onChange={(e) => setArabic(e.target.value)}
          className="bg-background border-input"
          dir="rtl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="partOfSpeech" className="text-sm font-medium">
          Part of Speech
        </Label>
        <Input
          id="partOfSpeech"
          placeholder="e.g., Noun, Verb, Adjective"
          value={partOfSpeech}
          onChange={(e) => setPartOfSpeech(e.target.value)}
          className="bg-background border-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="example" className="text-sm font-medium">
          Example Sentence
        </Label>
        <Textarea
          id="example"
          placeholder="e.g., Der Schmetterling fliegt über die Blume."
          value={example}
          onChange={(e) => setExample(e.target.value)}
          className="bg-background border-input min-h-24"
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
        disabled={loading || !german}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "+ Add Word to Collection"
        )}
      </Button>

    </form>
  )
}
