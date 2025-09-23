import { useState } from "react"
import { BookIdeaGenerator } from "@/components/book-idea-generator"
import { OutlineEditor } from "@/components/outline-editor"
import { ProgressIndicator } from "@/components/progress-indicator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { Link } from "wouter"
import type { OutlineSection } from "@/components/outline-editor"

type BookCreationStep = "idea" | "outline" | "review" | "write" | "export"

interface BookIdea {
  title: string
  subtitle: string
  description: string
  targetAudience: string
  marketPotential: string
  keyTopics: string[]
  estimatedLength: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  genre: string
}

export default function NewBook() {
  const [currentStep, setCurrentStep] = useState<BookCreationStep>("idea")
  const [bookIdea, setBookIdea] = useState<BookIdea | null>(null)
  const [outline, setOutline] = useState<OutlineSection[]>([])
  const [isOutlineApproved, setIsOutlineApproved] = useState(false)

  const steps = [
    {
      id: "idea",
      title: "Generate Book Idea",
      status: (bookIdea ? "completed" : currentStep === "idea" ? "in-progress" : "pending") as "pending" | "in-progress" | "completed" | "error",
      description: "AI generates unique book concept and market analysis"
    },
    {
      id: "outline",
      title: "Create Outline", 
      status: (outline.length > 0 ? "completed" : currentStep === "outline" ? "in-progress" : "pending") as "pending" | "in-progress" | "completed" | "error",
      description: "Detailed chapter structure and content planning"
    },
    {
      id: "review",
      title: "Review & Approve",
      status: (isOutlineApproved ? "completed" : currentStep === "review" ? "in-progress" : "pending") as "pending" | "in-progress" | "completed" | "error",
      description: "Human review and editing of the outline"
    },
    {
      id: "write",
      title: "Write Book",
      status: (currentStep === "write" ? "in-progress" : "pending") as "pending" | "in-progress" | "completed" | "error",
      description: "AI generates complete book content based on approved outline"
    },
    {
      id: "export",
      title: "Export & Download", 
      status: (currentStep === "export" ? "in-progress" : "pending") as "pending" | "in-progress" | "completed" | "error",
      description: "Format and prepare manuscript for Amazon KDP"
    }
  ]

  const getOverallProgress = () => {
    const completedSteps = steps.filter(step => step.status === "completed").length
    return Math.round((completedSteps / steps.length) * 100)
  }

  const handleIdeaGenerated = (idea: BookIdea) => {
    setBookIdea(idea)
  }

  const handleIdeaAccepted = (idea: BookIdea) => {
    setBookIdea(idea)
    setCurrentStep("outline")
    // Generate initial outline based on idea
    const initialOutline: OutlineSection[] = [
      {
        id: "intro",
        title: "Introduction", 
        description: `Introduction to ${idea.title} - setting the stage and explaining why this topic matters.`,
        wordCount: Math.round(idea.estimatedLength * 0.1),
        isExpanded: true
      },
      {
        id: "main",
        title: "Main Content",
        description: "Core chapters covering the key topics and concepts.",
        wordCount: Math.round(idea.estimatedLength * 0.8),
        isExpanded: false,
        subsections: (idea.keyPoints || []).slice(0, 5).map((topic, index) => ({
          id: `chapter-${index + 1}`,
          title: topic,
          description: `Comprehensive coverage of ${topic} with practical examples and actionable advice.`,
          wordCount: Math.round(2000) // Default chapter word count
        }))
      },
      {
        id: "conclusion",
        title: "Conclusion",
        description: "Summary of key points and next steps for readers.",
        wordCount: Math.round(idea.estimatedLength * 0.1),
        isExpanded: false
      }
    ]
    setOutline(initialOutline)
  }

  const handleOutlineChange = (newOutline: OutlineSection[]) => {
    setOutline(newOutline)
  }

  const handleOutlineApproval = () => {
    setIsOutlineApproved(true)
    setCurrentStep("write")
    console.log("Outline approved, starting book writing process")
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "idea":
        return (
          <BookIdeaGenerator
            onIdeaGenerated={handleIdeaGenerated}
            onIdeaAccepted={handleIdeaAccepted}
          />
        )
      
      case "outline":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Outline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Review and edit the generated outline. You can add, remove, or modify sections as needed.
                </p>
              </CardContent>
            </Card>
            <OutlineEditor
              outline={outline}
              onOutlineChange={handleOutlineChange}
              isEditable={true}
            />
            {outline.length > 0 && (
              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep("review")} data-testid="button-proceed-to-review">
                  Proceed to Review
                </Button>
              </div>
            )}
          </div>
        )
      
      case "review":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review & Approve Outline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Please review the outline below. Once you approve it, the AI will begin writing the complete book.
                </p>
              </CardContent>
            </Card>
            <OutlineEditor
              outline={outline}
              onOutlineChange={handleOutlineChange}
              isEditable={true}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setCurrentStep("outline")} data-testid="button-back-to-outline">
                Back to Edit
              </Button>
              <Button onClick={handleOutlineApproval} data-testid="button-approve-outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve & Start Writing
              </Button>
            </div>
          </div>
        )
      
      case "write":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Writing Your Book</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The AI is now writing your book based on the approved outline. This process typically takes 10-15 minutes.
              </p>
              <div className="text-center py-8">
                <div className="animate-pulse text-primary">
                  Writing in progress...
                </div>
              </div>
            </CardContent>
          </Card>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create New Book</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ProgressIndicator
            title="Progress"
            steps={steps}
            currentStep={currentStep}
            overallProgress={getOverallProgress()}
          />
        </div>
        <div className="lg:col-span-3">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  )
}