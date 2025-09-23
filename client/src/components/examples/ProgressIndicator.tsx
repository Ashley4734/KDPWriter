import { ProgressIndicator } from '../progress-indicator'

export default function ProgressIndicatorExample() {
  const steps = [
    {
      id: "idea",
      title: "Generate Book Idea",
      status: "completed" as const,
      description: "AI generates unique book concept and market analysis"
    },
    {
      id: "outline", 
      title: "Create Outline",
      status: "completed" as const,
      description: "Detailed chapter structure and content planning"
    },
    {
      id: "review",
      title: "Review & Approve",
      status: "in-progress" as const,
      description: "Human review and editing of the outline"
    },
    {
      id: "write",
      title: "Write Book",
      status: "pending" as const,
      description: "AI generates complete book content based on approved outline"
    },
    {
      id: "export",
      title: "Export & Download",
      status: "pending" as const,
      description: "Format and prepare manuscript for Amazon KDP"
    }
  ]

  return (
    <div className="p-4 max-w-md">
      <ProgressIndicator
        title="Book Generation Progress"
        steps={steps}
        currentStep="review"
        overallProgress={45}
      />
    </div>
  )
}