"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Word {
  id: string
  german: string
  english: string
  arabic: string
  partOfSpeech: string
  example: string
  addedAt: string
}

export default function StoredWords() {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchWords()
  }, [])

  const fetchWords = async () => {
    setLoading(true)
    setError(null)

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_GET_WORDS_WEBHOOK;

      if (!webhookUrl) {
        throw new Error("N8N Get Words Webhook URL is not configured");
      }

      const response = await fetch(webhookUrl, {
        method: "GET",
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error("Failed to fetch words directly from N8N")
      }

      const data = await response.json()

      // Handle the data transformation to match our interface
      // Log for debugging (visible in browser console)
      console.log("Fetched words data:", data);

      let rawWords: any[] = []

      // Prioritize data.items if it exists, as it contains full objects
      if (data.items && Array.isArray(data.items)) {
        rawWords = data.items
      } else if (Array.isArray(data)) {
        rawWords = data
      } else if (data.words && Array.isArray(data.words)) {
        // If data.words is an array of strings, it's already handled by the map logic below
        // but it will result in empty fields. We keep it as fallback.
        rawWords = data.words
      } else if (data.deutsch || data.german) {
        // Handle single object response
        rawWords = [data]
      } else {
        rawWords = []
      }

      const transformedWords: Word[] = rawWords.map((item: any, index: number) => {
        // Handle cases where item might be a string (from data.words strings array)
        if (typeof item === 'string') {
          return {
            id: index.toString(),
            german: item,
            english: "",
            arabic: "",
            partOfSpeech: "",
            example: "",
            addedAt: new Date().toISOString(),
          }
        }

        return {
          id: item.row_number?.toString() || item.id?.toString() || index.toString(),
          german: item.deutsch || item.german || "",
          english: item.englisch || item.english || "",
          arabic: item.arabisch || item.arabic || "",
          partOfSpeech: item.speech || item.partOfSpeech || "",
          example: item.example || "",
          addedAt: item.addedAt || new Date().toISOString(),
        }
      })

      setWords(transformedWords)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch words")
      setWords([])
    } finally {
      setLoading(false)
    }
  }

  const filteredWords = words.filter(
    (word) =>
      word.german.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.arabic.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border border-destructive/20 bg-red-50 dark:bg-red-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Error Loading Words</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button onClick={fetchWords} size="sm" className="mt-3">
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Your German Word Collection</CardTitle>
          <CardDescription>
            You have {words.length} word{words.length !== 1 ? "s" : ""} stored and ready for practice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {words.length > 0 && (
            <Input
              placeholder="Search words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background border-input"
            />
          )}

          {filteredWords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {words.length === 0
                  ? 'No words yet. Add your first German word in the "Add Words" tab!'
                  : "No words match your search."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWords.map((word) => (
                <div
                  key={word.id}
                  className="border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-lg">{word.german}</p>
                        <p className="text-sm text-muted-foreground">{word.english}</p>
                        {word.arabic && (
                          <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
                            {word.arabic}
                          </p>
                        )}
                      </div>
                      {word.partOfSpeech && (
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">
                          {word.partOfSpeech}
                        </Badge>
                      )}
                    </div>

                    {word.example && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-primary pl-2">
                        {word.example}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Added: {new Date(word.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {words.length > 0 && (
        <Button onClick={fetchWords} variant="outline" className="w-full bg-transparent">
          <Loader2 className="w-4 h-4 mr-2" />
          Refresh Words
        </Button>
      )}
    </div>
  )
}
