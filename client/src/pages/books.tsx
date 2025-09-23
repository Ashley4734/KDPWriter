import { useState } from "react"
import { BookCard } from "@/components/book-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Loader2 } from "lucide-react"
import { Link, useLocation } from "wouter"
import { useQuery, useMutation } from "@tanstack/react-query"
import { apiRequest, queryClient } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Book } from "@shared/schema"


export default function Books() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
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

  const handleBookDownload = (id: string) => {
    toast({
      title: "Download feature coming soon",
      description: "Book download functionality will be available in a future update.",
    })
  }

  const handleBookDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      deleteBookMutation.mutate(id)
    }
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (book.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === "all" || book.genre === selectedGenre
    const matchesStatus = selectedStatus === "all" || book.status === selectedStatus
    
    return matchesSearch && matchesGenre && matchesStatus
  })

  const genres = Array.from(new Set(books.map(book => book.genre)))
  const statusOptions = [
    { value: "idea", label: "Idea" },
    { value: "outline", label: "Outline" },
    { value: "approved", label: "Approved" },
    { value: "writing", label: "Writing" },
    { value: "completed", label: "Completed" }
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-muted-foreground">Loading your books...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error loading books</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">There was an error loading your books. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Books</h1>
        <Link href="/new-book">
          <Button data-testid="button-create-book">
            <Plus className="mr-2 h-4 w-4" />
            Create New Book
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-books"
              />
            </div>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-genre-filter">
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span data-testid="text-books-count">
          Showing {filteredBooks.length} of {books.length} books
        </span>
        {(searchQuery || selectedGenre !== "all" || selectedStatus !== "all") && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSearchQuery("")
              setSelectedGenre("all")
              setSelectedStatus("all")
            }}
            data-testid="button-clear-filters"
          >
            Clear filters
          </Button>
        )}
      </div>

      {filteredBooks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No books found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              description={book.description || ''}
              status={book.status as any}
              progress={book.progress || 0}
              wordCount={book.currentWordCount || 0}
              targetWordCount={book.targetWordCount}
              genre={book.genre}
              createdAt={book.createdAt ? new Date(book.createdAt).toISOString().split('T')[0] : ''}
              onEdit={handleBookEdit}
              onView={handleBookView}
              onDownload={handleBookDownload}
              onDelete={handleBookDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}