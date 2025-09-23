import { useState } from "react"
import { BookCard } from "@/components/book-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter } from "lucide-react"
import { Link } from "wouter"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// TODO: Remove mock data when implementing real backend
const mockBooks = [
  {
    id: "1",
    title: "The Complete Guide to Digital Marketing",
    description: "A comprehensive guide covering SEO, social media, content marketing, and analytics for modern businesses.",
    status: "writing" as const,
    progress: 65,
    wordCount: 45000,
    targetWordCount: 70000,
    genre: "Business",
    createdAt: "2024-01-15"
  },
  {
    id: "2", 
    title: "Mastering Remote Work",
    description: "Strategies and tools for effective remote work, team collaboration, and maintaining work-life balance.",
    status: "completed" as const,
    progress: 100,
    wordCount: 52000,
    targetWordCount: 50000,
    genre: "Self-Help",
    createdAt: "2024-01-10"
  },
  {
    id: "3",
    title: "Introduction to Cryptocurrency",
    description: "Beginner's guide to understanding blockchain, Bitcoin, and the future of digital currencies.",
    status: "outline" as const,
    progress: 15,
    wordCount: 0,
    targetWordCount: 40000,
    genre: "Finance",
    createdAt: "2024-01-20"
  },
  {
    id: "4",
    title: "Healthy Eating on a Budget",
    description: "Practical tips and recipes for maintaining a nutritious diet without breaking the bank.",
    status: "completed" as const,
    progress: 100,
    wordCount: 38000,
    targetWordCount: 35000,
    genre: "Health & Wellness",
    createdAt: "2024-01-05"
  },
  {
    id: "5",
    title: "Python for Data Science",
    description: "Learn Python programming specifically for data analysis, visualization, and machine learning applications.",
    status: "draft" as const,
    progress: 80,
    wordCount: 62000,
    targetWordCount: 75000,
    genre: "Technology",
    createdAt: "2024-01-12"
  },
  {
    id: "6",
    title: "Starting Your Own Business",
    description: "A step-by-step guide to launching a successful startup, from idea validation to scaling.",
    status: "outline" as const,
    progress: 25,
    wordCount: 5000,
    targetWordCount: 55000,
    genre: "Business",
    createdAt: "2024-01-18"
  }
]

export default function Books() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const handleBookEdit = (id: string) => {
    console.log("Edit book:", id)
  }

  const handleBookView = (id: string) => {
    console.log("View book:", id)
  }

  const handleBookDownload = (id: string) => {
    console.log("Download book:", id)
  }

  const handleBookDelete = (id: string) => {
    console.log("Delete book:", id)
  }

  const filteredBooks = mockBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === "all" || book.genre === selectedGenre
    const matchesStatus = selectedStatus === "all" || book.status === selectedStatus
    
    return matchesSearch && matchesGenre && matchesStatus
  })

  const genres = Array.from(new Set(mockBooks.map(book => book.genre)))
  const statusOptions = [
    { value: "outline", label: "Outline" },
    { value: "writing", label: "Writing" },
    { value: "draft", label: "Draft" },
    { value: "completed", label: "Completed" }
  ]

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
          Showing {filteredBooks.length} of {mockBooks.length} books
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
              {...book}
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