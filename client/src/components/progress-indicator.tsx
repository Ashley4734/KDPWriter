import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Clock, AlertCircle } from "lucide-react"

interface ProgressStep {
  id: string
  title: string
  status: "pending" | "in-progress" | "completed" | "error"
  description?: string
}

interface ProgressIndicatorProps {
  steps: ProgressStep[]
  currentStep?: string
  overallProgress: number
  title: string
}

const statusIcons = {
  pending: Circle,
  "in-progress": Clock,
  completed: CheckCircle,
  error: AlertCircle,
}

const statusColors = {
  pending: "text-muted-foreground",
  "in-progress": "text-blue-500",
  completed: "text-green-500", 
  error: "text-red-500",
}

const statusLabels = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
  error: "Error",
}

export function ProgressIndicator({ steps, currentStep, overallProgress, title }: ProgressIndicatorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-muted-foreground" data-testid="text-overall-progress">
            {overallProgress}% Complete
          </span>
        </CardTitle>
        <Progress value={overallProgress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const StatusIcon = statusIcons[step.status]
          const isActive = step.id === currentStep
          
          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-md transition-colors ${
                isActive ? "bg-muted/50" : ""
              }`}
              data-testid={`step-${step.id}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <StatusIcon className={`h-5 w-5 ${statusColors[step.status]}`} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium" data-testid={`text-step-title-${step.id}`}>
                    {index + 1}. {step.title}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${statusColors[step.status]}`}
                    data-testid={`badge-step-status-${step.id}`}
                  >
                    {statusLabels[step.status]}
                  </Badge>
                </div>
                {step.description && (
                  <p className="text-sm text-muted-foreground" data-testid={`text-step-description-${step.id}`}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}