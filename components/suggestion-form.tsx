"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

interface SuggestionFormProps {
  agendaId: string
  onSuggestionAdded?: () => void
}

export function SuggestionForm({ agendaId, onSuggestionAdded }: SuggestionFormProps) {
  const { t } = useTranslation('common')
  const [content, setContent] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() || !authorName.trim()) {
      setError(t('suggestions.errorRequired'))
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agenda_id: agendaId,
          content: content.trim(),
          author_name: authorName.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || t('suggestions.errorSubmit'))
      }

      const result = await response.json()
      
      // Show success message
      setSuccessMessage(result.message || t('suggestions.successMessage'))
      
      // Reset form
      setContent("")
      setAuthorName("")
      
      // Clear success message after 7 seconds
      setTimeout(() => setSuccessMessage(null), 7000)
      
      onSuggestionAdded?.()
    } catch (err) {
      console.error("Error submitting suggestion:", err)
      setError(err instanceof Error ? err.message : t('suggestions.errorSubmit'))
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          {t('suggestions.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs underline hover:no-underline mt-1"
            >
              {t('suggestions.dismiss')}
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-xs underline hover:no-underline mt-1 text-green-700"
            >
              {t('suggestions.dismiss')}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="author-name" className="text-sm font-medium">
              {t('suggestions.yourName')}
            </Label>
            <Input
              id="author-name"
              placeholder={t('suggestions.namePlaceholder')}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              className="bg-background"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestion-content" className="text-sm font-medium">
              {t('suggestions.yourSuggestion')}
            </Label>
            <Textarea
              id="suggestion-content"
              placeholder={t('suggestions.suggestionPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              className="bg-background resize-none"
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !content.trim() || !authorName.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('suggestions.submitting')}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {t('suggestions.submit')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
