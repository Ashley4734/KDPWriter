import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OutlineEditor, OutlineSection } from "@/components/outline-editor"
import { ProgressIndicator } from "@/components/progress-indicator"
import { ArrowLeft, Edit, Download, Trash2, CheckCircle, Clock, FileText, Loader2 } from "lucide-react"
import { Link, useParams, useLocation } from "wouter"
import { useQuery, useMutation } from "@tanstack/react-query"
import { apiRequest, queryClient } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import type { Book, Outline } from "@shared/schema"

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const [currentOutline, setCurrentOutline] = useState<OutlineSection[]>([])

  // Fetch book data
  const { data: book, isLoading: bookLoading, error: bookError } = useQuery<Book>({
    queryKey: ['/api/books', id],
    queryFn: async () => {
      const response = await fetch(`/api/books/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch book')
      }
      return response.json()
    },
    enabled: !!id
  })

  // Fetch outline data  
  const { data: outline, isLoading: outlineLoading } = useQuery<Outline>({
    queryKey: ['/api/books', id, 'outline'],
    queryFn: async () => {
      const response = await fetch(`/api/books/${id}/outline`)
      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to fetch outline')
      }
      if (response.status === 404) {
        return null
      }
      return response.json()
    },
    enabled: !!id
  })

  // Create outline mutation
  const createOutlineMutation = useMutation({
    mutationFn: async (outlineData: {
      title: string
      chapters: any[]
      totalChapters: number
      totalEstimatedWords: number
    }) => {
      return apiRequest('POST', `/api/books/${id}/outline`, outlineData)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/books', id, 'outline'] })
      await queryClient.invalidateQueries({ queryKey: ['/api/books', id] })
      toast({
        title: "Outline created",
        description: "Your book outline has been created successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error creating outline",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Update outline mutation  
  const updateOutlineMutation = useMutation({
    mutationFn: async (outlineData: {
      title: string
      chapters: any[]
      totalChapters: number
      totalEstimatedWords: number
    }) => {
      if (!outline) throw new Error('No outline to update')
      return apiRequest('PUT', `/api/outlines/${outline.id}`, outlineData)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/books', id, 'outline'] })
      toast({
        title: "Outline saved",
        description: "Your outline changes have been saved.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error saving outline",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Approve outline mutation
  const approveOutlineMutation = useMutation({
    mutationFn: async () => {
      if (!outline) throw new Error('No outline to approve')
      return apiRequest('POST', `/api/outlines/${outline.id}/approve`)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/books', id, 'outline'] })
      await queryClient.invalidateQueries({ queryKey: ['/api/books', id] })
      toast({
        title: "Outline approved",
        description: "Your outline has been approved and book writing can begin.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error approving outline",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const handleSaveOutline = () => {
    if (!book) return

    const chapters = currentOutline.map((section, index) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      keyPoints: section.subsections?.map(sub => sub.title) || [],
      estimatedWordCount: section.wordCount
    }))

    const outlineData = {
      title: `${book.title} - Outline`,
      chapters,
      totalChapters: chapters.length,
      totalEstimatedWords: chapters.reduce((sum, ch) => sum + ch.estimatedWordCount, 0)
    }

    if (outline) {
      updateOutlineMutation.mutate(outlineData)
    } else {
      createOutlineMutation.mutate(outlineData)
    }
  }

  const handleApproveOutline = () => {
    approveOutlineMutation.mutate()
  }

  // Initialize outline state when data loads
  useEffect(() => {
    if (outline?.chapters) {
      const sections: OutlineSection[] = outline.chapters.map((ch, index) => ({
        id: ch.id,
        title: ch.title,
        description: ch.description,
        wordCount: ch.estimatedWordCount,
        subsections: ch.keyPoints.map((point: string, subIndex: number) => ({
          id: `${ch.id}-sub-${subIndex}`,
          title: point,
          description: "Subsection description...",
          wordCount: Math.round(ch.estimatedWordCount / ch.keyPoints.length),
        })),
        isExpanded: true
      }))
      setCurrentOutline(sections)
    }
  }, [outline])

  if (!id) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Book ID is required</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (bookLoading || outlineLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-muted-foreground">Loading book details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (bookError || !book) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Book not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The requested book could not be found.</p>
            <Button asChild className="mt-4">
              <Link href="/books">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Books
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getSteps = () => {
    const steps = [
      {
        id: "idea",
        title: "Generate Book Idea",
        status: "completed" as "pending" | "in-progress" | "completed" | "error",
        description: "AI generates unique book concept and market analysis"
      },
      {
        id: "outline",
        title: "Create Outline",
        status: (outline ? "completed" : book.status === "outline" ? "in-progress" : "pending") as "pending" | "in-progress" | "completed" | "error",
        description: "Detailed chapter structure and content planning"
      },
      {
        id: "review",
        title: "Review & Approve",
        status: (outline?.isApproved ? "completed" : outline ? "pending" : "pending") as "pending" | "in-progress" | "completed" | "error",
        description: "Human review and editing of the outline"
      },
      {
        id: "write",
        title: "Write Book",
        status: (book.status === "writing" || book.status === "completed" ? "in-progress" : "pending") as "pending" | "in-progress" | "completed" | "error",
        description: "AI generates complete book content based on approved outline"
      },
      {
        id: "export",
        title: "Export & Download",
        status: (book.status === "completed" ? "completed" : "pending") as "pending" | "in-progress" | "completed" | "error",
        description: "Format and prepare manuscript for Amazon KDP"
      }
    ]
    return steps
  }

  const steps = getSteps()
  const overallProgress = (steps.filter(s => s.status === "completed").length / steps.length) * 100

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild data-testid="button-back">
            <Link href="/books">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Books
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-book-title">{book.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" data-testid="badge-book-status">{book.status}</Badge>
              <Badge variant="outline" data-testid="badge-book-genre">{book.genre}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-edit-book">
            <Edit className="mr-2 h-4 w-4" />
            Edit Book
          </Button>
          <Button variant="outline" data-testid="button-download-book">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Progress */}
      <ProgressIndicator
        steps={steps}
        currentStep={book.status}
        overallProgress={overallProgress}
        title="Book Progress"
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Book Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Book Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Description</h4>
                <p className="text-sm" data-testid="text-book-description">
                  {book.description || "No description provided"}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Target Audience</h4>
                <p className="text-sm" data-testid="text-book-audience">
                  {book.targetAudience || "Not specified"}
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-muted-foreground">Current Words</h4>
                  <p className="text-lg font-semibold" data-testid="text-current-words">{book.currentWordCount || 0}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground">Target Words</h4>
                  <p className="text-lg font-semibold" data-testid="text-target-words">{book.targetWordCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Outline Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Book Outline</span>
                <div className="flex gap-2">
                  {outline && !outline.isApproved && (
                    <Button 
                      onClick={handleApproveOutline}
                      disabled={approveOutlineMutation.isPending}
                      variant="default"
                      size="sm"
                      data-testid="button-approve-outline"
                    >
                      {approveOutlineMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Approving...</>
                      ) : (
                        <><CheckCircle className="mr-2 h-4 w-4" />Approve Outline</>
                      )}
                    </Button>
                  )}
                  {outline?.isApproved && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Approved
                    </Badge>
                  )}
                  <Button 
                    onClick={handleSaveOutline}
                    disabled={createOutlineMutation.isPending || updateOutlineMutation.isPending}
                    size="sm"
                    data-testid="button-save-outline"
                  >
                    {(createOutlineMutation.isPending || updateOutlineMutation.isPending) ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                    ) : (
                      'Save Outline'
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentOutline.length > 0 ? (
                <OutlineEditor
                  outline={currentOutline}
                  onOutlineChange={setCurrentOutline}
                  isEditable={!outline?.isApproved}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No outline created yet</p>
                  <Button 
                    onClick={() => setCurrentOutline([{
                      id: `section-${Date.now()}`,
                      title: "Chapter 1: Introduction",
                      description: "Introduction to the main topic...",
                      wordCount: 2000,
                      isExpanded: true
                    }])}
                    data-testid="button-create-first-section"
                  >
                    Create First Section
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}