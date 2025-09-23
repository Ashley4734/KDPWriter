import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { 
  BookOpen, 
  Loader2, 
  CheckCircle, 
  Clock, 
  Pen,
  Eye,
  EyeOff
} from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"

interface Chapter {
  id: string
  bookId: string
  outlineId: string
  chapterNumber: number
  title: string
  content?: string | null
  wordCount: number
  status: "pending" | "writing" | "completed"
  createdAt: Date
  updatedAt: Date
}

interface OutlineChapter {
  id: string
  title: string
  description: string
  keyPoints: string[]
  estimatedWordCount: number
}

interface ChapterWriterProps {
  bookId: string
  bookTitle: string
  bookDescription: string
  bookGenre: string
  targetAudience: string
  outline: {
    id: string
    chapters: OutlineChapter[]
  }
}

export function ChapterWriter({ 
  bookId, 
  bookTitle, 
  bookDescription, 
  bookGenre,
  targetAudience,
  outline 
}: ChapterWriterProps) {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [previewMode, setPreviewMode] = useState<{ [key: number]: boolean }>({})
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch existing chapters
  const { data: chapters = [], isLoading: chaptersLoading } = useQuery<Chapter[]>({
    queryKey: [`/api/books/${bookId}/chapters`],
    enabled: !!bookId
  })

  // Generate chapter mutation
  const generateChapterMutation = useMutation({
    mutationFn: async (chapterData: {
      bookId: string
      chapterNumber: number
      chapterTitle: string
      chapterDescription: string
      keyPoints: string[]
      targetWordCount: number
    }) => {
      return apiRequest('POST', '/api/generate-chapter', chapterData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}/chapters`] })
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}`] })
      toast({
        title: "Chapter generated successfully",
        description: "Your chapter content has been created and saved.",
      })
      setSelectedChapter(null)
    },
    onError: (error: any) => {
      toast({
        title: "Error generating chapter",
        description: error.message || "Failed to generate chapter content",
        variant: "destructive",
      })
    }
  })

  // Update chapter mutation
  const updateChapterMutation = useMutation({
    mutationFn: async ({ chapterId, content }: { chapterId: string; content: string }) => {
      return apiRequest('PUT', `/api/chapters/${chapterId}`, { content })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}/chapters`] })
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}`] })
      toast({
        title: "Chapter updated",
        description: "Your changes have been saved.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error updating chapter",
        description: error.message || "Failed to update chapter",
        variant: "destructive",
      })
    }
  })

  const handleGenerateChapter = (outlineChapter: OutlineChapter, chapterNumber: number) => {
    generateChapterMutation.mutate({
      bookId,
      chapterNumber,
      chapterTitle: outlineChapter.title,
      chapterDescription: outlineChapter.description,
      keyPoints: outlineChapter.keyPoints,
      targetWordCount: outlineChapter.estimatedWordCount
    })
  }

  const handleUpdateChapter = (chapterId: string, content: string) => {
    updateChapterMutation.mutate({ chapterId, content })
  }

  const togglePreview = (chapterNumber: number) => {
    setPreviewMode(prev => ({
      ...prev,
      [chapterNumber]: !prev[chapterNumber]
    }))
  }

  const getChapterStatus = (chapterNumber: number): Chapter | null => {
    return (chapters as Chapter[]).find(ch => ch.chapterNumber === chapterNumber) || null
  }

  const completedChapters = (chapters as Chapter[]).filter(ch => ch.status === "completed").length
  const totalChapters = outline.chapters.length
  const progressPercent = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0

  if (chaptersLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading chapters...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Chapter Writing Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{completedChapters} of {totalChapters} chapters completed</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600" data-testid="text-completed-chapters">
                  {completedChapters}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {(chapters as Chapter[]).filter(ch => ch.status === "writing").length}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {totalChapters - completedChapters}
                </div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapter List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Chapters</h3>
        {outline.chapters.map((outlineChapter, index) => {
          const chapterNumber = index + 1
          const existingChapter = getChapterStatus(chapterNumber)
          const isGenerating = generateChapterMutation.isPending && selectedChapter === chapterNumber
          const isUpdating = updateChapterMutation.isPending
          const inPreview = previewMode[chapterNumber]

          return (
            <Card key={outlineChapter.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                      {chapterNumber}
                    </div>
                    <div>
                      <CardTitle className="text-base" data-testid={`text-chapter-title-${chapterNumber}`}>
                        {outlineChapter.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {outlineChapter.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {existingChapter ? (
                      <>
                        <Badge 
                          variant={existingChapter.status === "completed" ? "default" : "secondary"}
                          className={
                            existingChapter.status === "completed" 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : ""
                          }
                        >
                          {existingChapter.status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
                          {existingChapter.status === "writing" && <Clock className="mr-1 h-3 w-3" />}
                          {existingChapter.status === "pending" && <Pen className="mr-1 h-3 w-3" />}
                          {existingChapter.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {existingChapter.wordCount} words
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="outline">Not started</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Target: {outlineChapter.estimatedWordCount} words</span>
                  <span>•</span>
                  <span>Key points: {outlineChapter.keyPoints.join(", ")}</span>
                </div>

                <div className="flex gap-2">
                  {!existingChapter ? (
                    <Button
                      onClick={() => {
                        setSelectedChapter(chapterNumber)
                        handleGenerateChapter(outlineChapter, chapterNumber)
                      }}
                      disabled={isGenerating}
                      data-testid={`button-generate-chapter-${chapterNumber}`}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Generate Chapter
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => togglePreview(chapterNumber)}
                        data-testid={`button-preview-chapter-${chapterNumber}`}
                      >
                        {inPreview ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Hide Content
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            View Content
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedChapter(chapterNumber)
                          handleGenerateChapter(outlineChapter, chapterNumber)
                        }}
                        variant="outline"
                        disabled={isGenerating}
                        data-testid={`button-regenerate-chapter-${chapterNumber}`}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Regenerate
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>

                {existingChapter && inPreview && (
                  <div className="border-t pt-4">
                    <Textarea
                      value={existingChapter.content || ""}
                      onChange={(e) => {
                        // Optimistically update the content
                        const updatedChapters = (chapters as Chapter[]).map(ch => 
                          ch.id === existingChapter.id 
                            ? { ...ch, content: e.target.value }
                            : ch
                        )
                        queryClient.setQueryData([`/api/books/${bookId}/chapters`], updatedChapters)
                      }}
                      onBlur={(e) => {
                        if (e.target.value !== existingChapter.content) {
                          handleUpdateChapter(existingChapter.id, e.target.value)
                        }
                      }}
                      placeholder="Chapter content will appear here..."
                      className="min-h-48 font-mono text-sm"
                      disabled={isUpdating}
                      data-testid={`textarea-chapter-content-${chapterNumber}`}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}