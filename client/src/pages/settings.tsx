import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Settings as SettingsIcon, Key, Bell, Download } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Settings() {
  const [apiKey, setApiKey] = useState("")
  const [defaultGenre, setDefaultGenre] = useState("Business")
  const [defaultWordCount, setDefaultWordCount] = useState("50000")
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  const handleSaveSettings = () => {
    console.log("Saving settings:", { 
      apiKey: apiKey ? "****" : "", 
      defaultGenre, 
      defaultWordCount, 
      notifications, 
      autoSave 
    })
  }

  const handleTestConnection = () => {
    console.log("Testing OpenRouter connection")
  }

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
              <Select defaultValue="docx">
                <SelectTrigger data-testid="select-output-format">
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
              <Select defaultValue="letter">
                <SelectTrigger data-testid="select-page-size">
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
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} data-testid="button-save-settings">
          Save Settings
        </Button>
      </div>
    </div>
  )
}