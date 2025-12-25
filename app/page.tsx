"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WordForm from "@/components/word-form"
import TextGenerator from "@/components/text-generator"
import StoredWords from "@/components/stored-words"
import Image from "next/image"

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleWordAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary overflow-hidden flex items-center justify-center">
              <Image
                src="/apple-icon.png"
                alt="DeutschLern Logo"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">DeutschLern</h1>
              <p className="text-sm text-muted-foreground">Master German Vocabulary</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="add-words" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="add-words">Add Words</TabsTrigger>
            <TabsTrigger value="generate">Generate Text</TabsTrigger>
            <TabsTrigger value="view-words">My Words</TabsTrigger>
          </TabsList>

          {/* Add New Words Tab */}
          <TabsContent value="add-words" className="space-y-4">
            <div className="grid gap-6">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Add New German Words</CardTitle>
                  <CardDescription>
                    Submit new German words or phrases to your learning collection. They will be stored and used in text
                    generation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WordForm onWordAdded={handleWordAdded} />
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="border border-border bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-base">💡 Tips for Best Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Only the German word is required to start building your collection</p>
                  <p>• Adding translations and parts of speech helps with better context</p>
                  <p>• Include examples to see how words are used in real sentences</p>
                  <p>• Use the text generator to practice your words in stories</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Generate Text Tab */}
          <TabsContent value="generate" className="space-y-4">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Generate Learning Text</CardTitle>
                <CardDescription>
                  Request generated text that includes your stored German words for contextual learning.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TextGenerator />
              </CardContent>
            </Card>
          </TabsContent>

          {/* View Words Tab */}
          <TabsContent value="view-words" className="space-y-4">
            <StoredWords key={refreshKey} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
