"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react"

export default function ChatExplainer() {
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState("")
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    const handleExplain = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        setResponse("")

        try {
            // Direct webhook URL as requested, or fallback to environment variable if configured
            const webhookUrl = "https://n8n.almanassikalarabi.com/webhook/aaaf7cff-3b92-46fe-8892-6e6541d16d63NEXT_PUBLIC_N8N_CHAT_WEBHOOK_post"

            const res = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: input,
                    timestamp: new Date().toISOString(),
                }),
            })

            if (!res.ok) {
                throw new Error("Failed to get explanation from N8N")
            }

            const data = await res.json()
            // N8N might return data in various fields, usually 'output', 'text', 'message', or just the body
            // Adjusting to capture common return fields
            const reply = data.output || data.text || data.message || data.response || JSON.stringify(data)
            setResponse(reply)

        } catch (error) {
            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Failed to get explanation. Please try again.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleExplain} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="explanation-input" className="text-sm font-medium">
                        Ask a Question or Enter a Word/Sentence
                    </Label>
                    <Textarea
                        id="explanation-input"
                        placeholder="e.g., Explain the difference between 'der', 'die', and 'das', or enter a German sentence to analyze."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        required
                        className="bg-background border-input min-h-24"
                    />
                    <p className="text-xs text-muted-foreground">
                        Get detailed explanations, grammar rules, or translations.
                    </p>
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
                    disabled={loading || !input}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Asking...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            Ask / Explain
                        </>
                    )}
                </Button>
            </form>

            {/* Response Display */}
            {response && (
                <Card className="border border-border bg-accent/10 p-6">
                    <div className="space-y-3">
                        <h3 className="font-semibold text-foreground">Explanation</h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                            {response}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}
