import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Settings as SettingsIcon, Key, Bell, Download, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length: number
  pricing: {
    prompt: string
    completion: string
  }
}

export default function Settings() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [apiKey, setApiKey] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)
  const [defaultGenre, setDefaultGenre] = useState("")
  const [defaultWordCount, setDefaultWordCount] = useState("50000")
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  // Export settings
  const [exportFormat, setExportFormat] = useState("docx")
  const [pageSize, setPageSize] = useState("letter")
  const [includeTableOfContents, setIncludeTableOfContents] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [amazonKdpFormatting, setAmazonKdpFormatting] = useState(false)
  
  // Fetch settings from backend
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      return response.json()
    }
  })
  
  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setApiKey(settings.openrouterApiKey || "")
      setSelectedModel(settings.selectedModel || "")
      setDefaultGenre(settings.defaultGenre || "Business")
      setDefaultWordCount(settings.defaultWordCount?.toString() || "50000")
      setAutoSave(settings.autoSave ?? true)
      // Export settings
      setExportFormat(settings.exportFormat || "docx")
      setPageSize(settings.pageSize || "letter")
      setIncludeTableOfContents(settings.includeTableOfContents ?? true)
      setIncludeMetadata(settings.includeMetadata ?? true)
      setAmazonKdpFormatting(settings.amazonKdpFormatting ?? false)
    }
  }, [settings])
  
  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
      
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully."
      })
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] })
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const handleSaveSettings = () => {
    console.log("Saving settings:", { 
      apiKey: apiKey ? "****" : "", 
      selectedModel,
      defaultGenre, 
      defaultWordCount, 
      notifications, 
      autoSave,
      exportFormat,
      pageSize,
      includeTableOfContents,
      includeMetadata,
      amazonKdpFormatting
    })
    
    saveSettingsMutation.mutate({
      userId: 'demo-user',
      openrouterApiKey: apiKey || null,
      selectedModel: selectedModel || null,
      defaultGenre: defaultGenre || 'Business',
      defaultWordCount: parseInt(defaultWordCount) || 50000,
      autoSave: autoSave,
      // Export settings
      exportFormat: exportFormat || 'docx',
      pageSize: pageSize || 'letter',
      includeTableOfContents: includeTableOfContents,
      includeMetadata: includeMetadata,
      amazonKdpFormatting: amazonKdpFormatting
    })
  }

  const fetchOpenRouterModels = async () => {
    setModelsLoading(true)
    setModelsError(null)
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Filter for text models only (exclude image, audio, etc.)
      const textModels = data.data.filter((model: any) => {
        const modelType = model.id.toLowerCase()
        return !modelType.includes('vision') && 
               !modelType.includes('image') && 
               !modelType.includes('audio') &&
               !modelType.includes('whisper') &&
               !modelType.includes('dall-e') &&
               !modelType.includes('tts') &&
               !modelType.includes('embedding')
      })
      
      const formattedModels: OpenRouterModel[] = textModels.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description,
        context_length: model.context_length,
        pricing: model.pricing
      }))
      
      // Sort by name for better UX
      formattedModels.sort((a, b) => a.name.localeCompare(b.name))
      
      setAvailableModels(formattedModels)
    } catch (error) {
      setModelsError(error instanceof Error ? error.message : 'Failed to fetch models')
      console.error('Error fetching OpenRouter models:', error)
    } finally {
      setModelsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    console.log("Testing OpenRouter connection")
    if (apiKey) {
      await fetchOpenRouterModels()
    } else {
      setModelsError("API key is required to fetch models")
    }
  }

  useEffect(() => {
    if (apiKey) {
      fetchOpenRouterModels()
    }
  }, [apiKey])

  const genres = [
    "Business", "Self-Help", "Health & Wellness", "Technology", 
    "Finance", "Education", "Cooking", "Travel", "History", "Science"
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure your book generation preferences and API settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenRouter API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your OpenRouter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              data-testid="input-api-key"
            />
            <p className="text-sm text-muted-foreground">
              Your API key is stored securely and used to generate book content.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleTestConnection} variant="outline" data-testid="button-test-connection">
              Test Connection
            </Button>
            <Badge variant={apiKey ? "default" : "secondary"}>
              {apiKey ? "Configured" : "Not configured"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Model Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!apiKey && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please enter your OpenRouter API key above to load available models.
              </AlertDescription>
            </Alert>
          )}
          
          {modelsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {modelsError}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="model-select">Choose AI Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel} disabled={modelsLoading || !apiKey}>
              <SelectTrigger data-testid="select-ai-model">
                <SelectValue placeholder={
                  modelsLoading ? "Loading models..." : 
                  !apiKey ? "Enter API key to load models" :
                  availableModels.length === 0 ? "No models available" :
                  "Select an AI model"
                } />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      {model.description && (
                        <span className="text-sm text-muted-foreground">{model.description}</span>
                      )}
                      <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                        <span>Context: {model.context_length?.toLocaleString()}</span>
                        {model.pricing && (
                          <span>Cost: ${model.pricing.prompt}/${model.pricing.completion}</span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {modelsLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading available models...
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {availableModels.length > 0 
                ? `${availableModels.length} text models available. Different models have varying capabilities and costs.`
                : "Models will load automatically when you enter a valid API key."
              }
            </p>
          </div>
          
          {selectedModel && availableModels.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-1">Selected Model:</p>
              <p className="text-sm font-medium">
                {availableModels.find(model => model.id === selectedModel)?.name}
              </p>
              {availableModels.find(model => model.id === selectedModel)?.description && (
                <p className="text-xs text-muted-foreground mb-2">
                  {availableModels.find(model => model.id === selectedModel)?.description}
                </p>
              )}
              <div className="flex gap-4 text-xs">
                <span>
                  <strong>Context Length:</strong>{" "}
                  {availableModels.find(model => model.id === selectedModel)?.context_length?.toLocaleString()}
                </span>
                {availableModels.find(model => model.id === selectedModel)?.pricing && (
                  <span>
                    <strong>Pricing:</strong>{" "}
                    ${availableModels.find(model => model.id === selectedModel)?.pricing.prompt}/1K prompt,{" "}
                    ${availableModels.find(model => model.id === selectedModel)?.pricing.completion}/1K completion
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-genre">Default Genre</Label>
            <Select value={defaultGenre} onValueChange={setDefaultGenre}>
              <SelectTrigger data-testid="select-default-genre">
                <SelectValue />
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
            <Label htmlFor="default-word-count">Default Target Word Count</Label>
            <Input
              id="default-word-count"
              type="number"
              min="10000"
              max="150000"
              step="5000"
              value={defaultWordCount}
              onChange={(e) => setDefaultWordCount(e.target.value)}
              data-testid="input-default-word-count"
            />
            <p className="text-sm text-muted-foreground">
              Typical nonfiction books range from 30,000 to 80,000 words.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates when book generation is complete
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
              data-testid="switch-notifications"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-save">Auto-save Outlines</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save changes to outlines as you edit
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
              data-testid="switch-auto-save"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure how your completed books are formatted for export.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select 
                value={exportFormat} 
                onValueChange={setExportFormat}
                data-testid="select-output-format"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docx">Word Document (.docx)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="txt">Plain Text</SelectItem>
                  <SelectItem value="epub">EPUB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Page Size</Label>
              <Select 
                value={pageSize} 
                onValueChange={setPageSize}
                data-testid="select-page-size"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="letter">Letter (8.5" x 11")</SelectItem>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="kindle">Kindle (6" x 9")</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-toc" 
                checked={includeTableOfContents}
                onCheckedChange={setIncludeTableOfContents}
                data-testid="checkbox-include-toc"
              />
              <Label htmlFor="include-toc">Include Table of Contents</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-metadata" 
                checked={includeMetadata}
                onCheckedChange={setIncludeMetadata}
                data-testid="checkbox-include-metadata"
              />
              <Label htmlFor="include-metadata">Include Book Metadata</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="amazon-kdp" 
                checked={amazonKdpFormatting}
                onCheckedChange={setAmazonKdpFormatting}
                data-testid="checkbox-amazon-kdp"
              />
              <Label htmlFor="amazon-kdp">Use Amazon KDP Formatting</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings} 
          disabled={saveSettingsMutation.isPending || settingsLoading}
          data-testid="button-save-settings"
        >
          {saveSettingsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </div>
  )
}