import { DashboardStats } from "@/components/dashboard-stats"
import { BookCard } from "@/components/book-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "wouter"

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
  }
]

export default function Dashboard() {
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

  const totalWords = mockBooks.reduce((total, book) => total + book.wordCount, 0)
  const inProgress = mockBooks.filter(book => book.status === "writing" || book.status === "outline").length
  const completed = mockBooks.filter(book => book.status === "completed").length

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

      <DashboardStats
        totalBooks={mockBooks.length}
        inProgress={inProgress}
        completed={completed}
        totalWords={totalWords}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockBooks.map((book) => (
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
        </CardContent>
      </Card>
    </div>
  )
}