import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Eye, Edit, Download, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type BookStatus = "outline" | "writing" | "completed" | "draft"

interface BookCardProps {
  id: string
  title: string
  description: string
  status: BookStatus
  progress: number
  wordCount: number
  targetWordCount: number
  genre: string
  createdAt: string
  onEdit?: (id: string) => void
  onView?: (id: string) => void
  onDownload?: (id: string) => void
  onDelete?: (id: string) => void
}

const statusColors: Record<BookStatus, string> = {
  outline: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  writing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
}

const statusLabels: Record<BookStatus, string> = {
  outline: "Outline",
  writing: "Writing",
  completed: "Completed",
  draft: "Draft",
}

export function BookCard({
  id,
  title,
  description,
  status,
  progress,
  wordCount,
  targetWordCount,
  genre,
  createdAt,
  onEdit,
  onView,
  onDownload,
  onDelete,
}: BookCardProps) {
  const handleEdit = () => {
    console.log("Edit book:", id)
    onEdit?.(id)
  }

  const handleView = () => {
    console.log("View book:", id)
    onView?.(id)
  }

  const handleDownload = () => {
    console.log("Download book:", id)
    onDownload?.(id)
  }

  const handleDelete = () => {
    console.log("Delete book:", id)
    onDelete?.(id)
  }

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold leading-none tracking-tight" data-testid={`text-book-title-${id}`}>
            {title}
          </h3>
          <Badge variant="secondary" className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-book-menu-${id}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleView} data-testid={`menu-view-${id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit} data-testid={`menu-edit-${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {status === "completed" && (
              <DropdownMenuItem onClick={handleDownload} data-testid={`menu-download-${id}`}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleDelete} className="text-destructive" data-testid={`menu-delete-${id}`}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground" data-testid={`text-book-description-${id}`}>
          {description}
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span data-testid={`text-progress-${id}`}>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span data-testid={`text-word-count-${id}`}>
            {wordCount.toLocaleString()} / {targetWordCount.toLocaleString()} words
          </span>
          <span>{genre}</span>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={handleView} data-testid={`button-view-${id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button size="sm" onClick={handleEdit} data-testid={`button-edit-${id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}