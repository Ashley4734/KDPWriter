import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Sparkles, RefreshCw, Target, Users, TrendingUp, BookOpen, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Link } from "wouter"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BookIdea {
  id: string
  title: string
  description: string
  targetAudience: string
  genre: string
  keyPoints: string[]
  userId: string
  isSelected: boolean
  createdAt: Date
}

interface BookIdeaGeneratorProps {
  onIdeaGenerated?: (ideas: BookIdea[]) => void
  onIdeaAccepted?: (idea: BookIdea) => void
}

export function BookIdeaGenerator({ onIdeaGenerated, onIdeaAccepted }: BookIdeaGeneratorProps) {
  const { toast } = useToast()
  const [generatedIdeas, setGeneratedIdeas] = useState<BookIdea[]>([])
  const [selectedIdea, setSelectedIdea] = useState<BookIdea | null>(null)
  const [selectedGenre, setSelectedGenre] = useState("")
  const [keywords, setKeywords] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [numberOfIdeas, setNumberOfIdeas] = useState(3)
  
  // Check if user has configured OpenRouter API key
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      return response.json()
    }
  })
  
  const hasApiKey = Boolean(settings?.openrouterApiKey)
  
  const generateIdeasMutation = useMutation({
    mutationFn: async (data: {
      genre: string
      targetAudience?: string
      keyInterests?: string[]
      count?: number
    }) => {
      const response = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate ideas')
      }
      
      return response.json()
    },
    onSuccess: (ideas: BookIdea[]) => {
      setGeneratedIdeas(ideas)
      setSelectedIdea(ideas[0] || null)
      onIdeaGenerated?.(ideas)
      toast({
        title: "Ideas generated!",
        description: `Generated ${ideas.length} book idea${ideas.length === 1 ? '' : 's'} successfully.`
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error generating ideas",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const generateIdeas = () => {
    if (!selectedGenre) {
      toast({
        title: "Genre required",
        description: "Please select a genre before generating ideas.",
        variant: "destructive"
      })
      return
    }
    
    const keyInterests = keywords.trim() ? 
      keywords.split(',').map(k => k.trim()).filter(k => k.length > 0) : 
      undefined
    
    generateIdeasMutation.mutate({
      genre: selectedGenre,
      targetAudience: targetAudience.trim() || undefined,
      keyInterests,
      count: numberOfIdeas
    })
  }

  const regenerateIdeas = () => {
    generateIdeas()
  }

  const acceptIdea = () => {
    if (selectedIdea) {
      console.log("Accepting book idea:", selectedIdea.title)
      onIdeaAccepted?.(selectedIdea)
    }
  }
  
  const selectIdea = (idea: BookIdea) => {
    setSelectedIdea(idea)
  }

  const genres = [
    "Business", "Self-Help", "Health & Wellness", "Technology", 
    "Finance", "Education", "Cooking", "Travel", "History", "Science"
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Book Idea
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre *</Label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger data-testid="select-genre">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target-audience">Target Audience</Label>
              <Input
                id="target-audience"
                placeholder="e.g., small business owners, entrepreneurs"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                data-testid="input-target-audience"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="number-of-ideas">Number of Ideas</Label>
              <Select value={numberOfIdeas.toString()} onValueChange={(v) => setNumberOfIdeas(parseInt(v))}>
                <SelectTrigger data-testid="select-number-ideas">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 idea</SelectItem>
                  <SelectItem value="3">3 ideas</SelectItem>
                  <SelectItem value="5">5 ideas</SelectItem>
                  <SelectItem value="8">8 ideas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords or Topics (optional)</Label>
            <Textarea
              id="keywords"
              placeholder="e.g., digital marketing, SEO, social media (separate with commas)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="min-h-20"
              data-testid="textarea-keywords"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple topics with commas. This helps the AI focus on your areas of interest.
            </p>
          </div>
          
          {!hasApiKey && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                OpenRouter API key not configured. Please{" "}
                <Link href="/settings" className="underline font-medium">
                  set it in Settings
                </Link>{" "}
                to enable AI book idea generation.
              </AlertDescription>
            </Alert>
          )}
          
          {generateIdeasMutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {(generateIdeasMutation.error as Error).message}
                {(generateIdeasMutation.error as Error).message.includes('API key') && (
                  <>
                    {" "}<Link href="/settings" className="underline font-medium text-destructive-foreground">
                      Go to Settings
                    </Link>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={generateIdeas} 
            disabled={generateIdeasMutation.isPending || !selectedGenre || !hasApiKey}
            className="w-full"
            data-testid="button-generate-idea"
          >
            {generateIdeasMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating {numberOfIdeas} Idea{numberOfIdeas === 1 ? '' : 's'}...
              </>
            ) : !hasApiKey ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Configure API Key First
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate {numberOfIdeas} Book Idea{numberOfIdeas === 1 ? '' : 's'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedIdeas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Generated Ideas ({generatedIdeas.length})
            </CardTitle>
            {generatedIdeas.length > 1 && (
              <p className="text-sm text-muted-foreground">
                Click on an idea to view details, or use the tabs below to browse through all generated ideas.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {generatedIdeas.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {generatedIdeas.map((idea, index) => (
                  <Button
                    key={idea.id}
                    variant={selectedIdea?.id === idea.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => selectIdea(idea)}
                    data-testid={`button-select-idea-${index}`}
                  >
                    Idea {index + 1}
                  </Button>
                ))}
              </div>
            )}
            
            {selectedIdea && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle data-testid="text-generated-title">{selectedIdea.title}</CardTitle>
                  </div>
                  <Badge variant="secondary">{selectedIdea.genre}</Badge>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Description
                  </h4>
                  <p className="text-muted-foreground" data-testid="text-generated-description">
                    {selectedIdea.description}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Target Audience
                  </h4>
                  <p className="text-muted-foreground" data-testid="text-generated-audience">
                    {selectedIdea.targetAudience}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Key Points
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIdea.keyPoints?.map((point, index) => (
                      <Badge key={index} variant="outline" data-testid={`badge-topic-${index}`}>
                        {point}
                      </Badge>
                    )) || <p className="text-muted-foreground text-sm">No key points specified</p>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={acceptIdea} className="flex-1" data-testid="button-accept-idea">
                    Accept & Create Book
                  </Button>
                  <Button onClick={regenerateIdeas} variant="outline" disabled={generateIdeasMutation.isPending} data-testid="button-regenerate">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate New Ideas
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}