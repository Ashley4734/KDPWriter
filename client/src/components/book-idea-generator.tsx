import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Sparkles, RefreshCw, Target, Users, TrendingUp, BookOpen } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BookIdea {
  title: string
  subtitle: string
  description: string
  targetAudience: string
  marketPotential: string
  keyTopics: string[]
  estimatedLength: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  genre: string
}

interface BookIdeaGeneratorProps {
  onIdeaGenerated?: (idea: BookIdea) => void
  onIdeaAccepted?: (idea: BookIdea) => void
}

export function BookIdeaGenerator({ onIdeaGenerated, onIdeaAccepted }: BookIdeaGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedIdea, setGeneratedIdea] = useState<BookIdea | null>(null)
  const [selectedGenre, setSelectedGenre] = useState("")
  const [keywords, setKeywords] = useState("")
  const [targetAudience, setTargetAudience] = useState("")

  // Mock generated idea for demo
  const mockIdea: BookIdea = {
    title: "The Complete Guide to Digital Marketing",
    subtitle: "Master SEO, Social Media, and Analytics in 2024",
    description: "A comprehensive guide that takes readers from digital marketing basics to advanced strategies. Covers modern SEO techniques, social media marketing, content creation, email marketing, and data analytics. Perfect for entrepreneurs, small business owners, and marketing professionals looking to stay ahead in the digital landscape.",
    targetAudience: "Small business owners, entrepreneurs, and marketing professionals aged 25-45",
    marketPotential: "High demand market with 500K+ monthly searches for digital marketing guides",
    keyTopics: ["SEO Optimization", "Social Media Strategy", "Content Marketing", "Email Campaigns", "Analytics & ROI", "Paid Advertising", "Lead Generation", "Brand Building"],
    estimatedLength: 65000,
    difficulty: "Intermediate",
    genre: "Business"
  }

  const generateIdea = async () => {
    setIsGenerating(true)
    console.log("Generating book idea with:", { selectedGenre, keywords, targetAudience })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setGeneratedIdea(mockIdea)
    setIsGenerating(false)
    onIdeaGenerated?.(mockIdea)
  }

  const regenerateIdea = () => {
    console.log("Regenerating book idea")
    generateIdea()
  }

  const acceptIdea = () => {
    if (generatedIdea) {
      console.log("Accepting book idea:", generatedIdea.title)
      onIdeaAccepted?.(generatedIdea)
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords or Topics (optional)</Label>
            <Textarea
              id="keywords"
              placeholder="e.g., digital marketing, SEO, social media"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="min-h-20"
              data-testid="textarea-keywords"
            />
          </div>
          
          <Button 
            onClick={generateIdea} 
            disabled={isGenerating || !selectedGenre}
            className="w-full"
            data-testid="button-generate-idea"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Book Idea
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedIdea && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle data-testid="text-generated-title">{generatedIdea.title}</CardTitle>
                <p className="text-lg text-muted-foreground" data-testid="text-generated-subtitle">
                  {generatedIdea.subtitle}
                </p>
              </div>
              <Badge variant="secondary">{generatedIdea.genre}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Description
              </h4>
              <p className="text-muted-foreground" data-testid="text-generated-description">
                {generatedIdea.description}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Target Audience
                </h4>
                <p className="text-muted-foreground" data-testid="text-generated-audience">
                  {generatedIdea.targetAudience}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Market Potential
                </h4>
                <p className="text-muted-foreground" data-testid="text-market-potential">
                  {generatedIdea.marketPotential}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Key Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {generatedIdea.keyTopics.map((topic, index) => (
                  <Badge key={index} variant="outline" data-testid={`badge-topic-${index}`}>
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Estimated Length: <strong data-testid="text-estimated-length">{generatedIdea.estimatedLength.toLocaleString()} words</strong></span>
              <span>Difficulty: <strong data-testid="text-difficulty">{generatedIdea.difficulty}</strong></span>
            </div>

            <div className="flex gap-3">
              <Button onClick={acceptIdea} className="flex-1" data-testid="button-accept-idea">
                Accept & Create Outline
              </Button>
              <Button onClick={regenerateIdea} variant="outline" data-testid="button-regenerate">
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}