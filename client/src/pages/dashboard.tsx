import { DashboardStats } from "@/components/dashboard-stats"
import { BookCard } from "@/components/book-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { Link, useLocation } from "wouter"
import { useQuery, useMutation } from "@tanstack/react-query"
import { apiRequest, queryClient } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import type { Book } from "@shared/schema"

// Real API integration - no more mock data

export default function Dashboard() {
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  
  // Fetch books from API
  const { data: books = [], isLoading, error } = useQuery<Book[]>({
    queryKey: ['/api/books'],
    queryFn: async () => {
      const response = await fetch('/api/books')
      if (!response.ok) {
        throw new Error('Failed to fetch books')
      }
      return response.json()
    }
  })

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      return apiRequest('DELETE', `/api/books/${bookId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] })
      toast({
        title: "Book deleted",
        description: "The book has been successfully deleted.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error deleting book",
        description: error.message,
        variant: "destructive",
      })
    }
  })
  
  const handleBookEdit = (id: string) => {
    setLocation(`/books/${id}/edit`)
  }

  const handleBookView = (id: string) => {
    setLocation(`/books/${id}`)
  }

  const handleBookDownload = async (id: string) => {
    try {
      const book = books?.find(b => b.id === id)
      if (!book || book.status !== 'completed') {
        toast({
          title: "Cannot download book",
          description: "Book must be completed before it can be downloaded.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/books/${id}/download`)
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || `${book.title}.docx`
        : `${book.title}.docx`

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download complete",
        description: `${book.title} has been downloaded successfully.`,
      })
    } catch (error) {
      console.error('Error downloading book:', error)
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download book",
        variant: "destructive",
      })
    }
  }

  const handleBookDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      deleteBookMutation.mutate(id)
    }
  }

  // Calculate stats from real books data
  const totalWords = books.reduce((total, book) => total + (book.currentWordCount || 0), 0)
  const inProgress = books.filter(book => book.status === "writing" || book.status === "outline" || book.status === "approved").length
  const completed = books.filter(book => book.status === "completed").length
  const recentBooks = [...books]
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bDate - aDate
    })
    .slice(0, 6) // Show 6 most recent books

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/new-book">
          <Button data-testid="button-new-book">
            <Plus className="mr-2 h-4 w-4" />
            New Book
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-muted-foreground">Loading your books...</p>
          </div>
        </div>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error loading books</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">There was an error loading your books. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      ) : (
        <DashboardStats
          totalBooks={books.length}
          inProgress={inProgress}
          completed={completed}
          totalWords={totalWords}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Books</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-muted-foreground">Loading recent books...</p>
              </div>
            </div>
          ) : recentBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentBooks.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  description={book.description || ""}
                  status={book.status as any}
                  progress={book.progress || 0}
                  wordCount={book.currentWordCount || 0}
                  targetWordCount={book.targetWordCount}
                  genre={book.genre}
                  createdAt={book.createdAt ? book.createdAt.toString() : ""}
                  onEdit={handleBookEdit}
                  onView={handleBookView}
                  onDownload={handleBookDownload}
                  onDelete={handleBookDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No books created yet.</p>
              <Link href="/new-book">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Book
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}