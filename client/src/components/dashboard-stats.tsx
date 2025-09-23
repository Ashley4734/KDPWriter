import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, Clock, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  totalBooks: number
  inProgress: number
  completed: number
  totalWords: number
}

export function DashboardStats({ totalBooks, inProgress, completed, totalWords }: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Books",
      value: totalBooks,
      icon: BookOpen,
      description: "Books created",
      testId: "stat-total-books"
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: Clock,
      description: "Currently writing",
      testId: "stat-in-progress"
    },
    {
      title: "Completed",
      value: completed,
      icon: FileText,
      description: "Ready to publish",
      testId: "stat-completed"
    },
    {
      title: "Total Words",
      value: totalWords.toLocaleString(),
      icon: TrendingUp,
      description: "Words written",
      testId: "stat-total-words"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={stat.testId}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}