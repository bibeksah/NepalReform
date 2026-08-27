import { OpinionForm } from "@/components/opinion-form"
import { Header } from "@/components/header"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function CreateOpinionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Propose Reform Agenda</h1>
            <p className="text-muted-foreground">
              Share your thoughts and reform proposals for Nepal. Your submission will be verified with your device signature and reviewed by the moderation team.
            </p>
          </div>

          <OpinionForm />
        </div>
      </div>
    </div>
  )
}
