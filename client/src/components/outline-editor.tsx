import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, GripVertical } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export interface OutlineSection {
  id: string
  title: string
  description: string
  wordCount: number
  subsections?: OutlineSection[]
  isExpanded?: boolean
}

interface OutlineEditorProps {
  outline: OutlineSection[]
  onOutlineChange: (outline: OutlineSection[]) => void
  isEditable?: boolean
}

export function OutlineEditor({ outline, onOutlineChange, isEditable = true }: OutlineEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const updateSection = (sections: OutlineSection[], id: string, updates: Partial<OutlineSection>): OutlineSection[] => {
    return sections.map(section => {
      if (section.id === id) {
        return { ...section, ...updates }
      }
      if (section.subsections) {
        return {
          ...section,
          subsections: updateSection(section.subsections, id, updates)
        }
      }
      return section
    })
  }

  const toggleExpand = (id: string) => {
    const updated = updateSection(outline, id, { isExpanded: !outline.find(s => s.id === id)?.isExpanded })
    onOutlineChange(updated)
  }

  const addSection = (parentId?: string) => {
    console.log("Adding section", parentId)
    const newSection: OutlineSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      description: "Add your section description here...",
      wordCount: 1000,
      isExpanded: true
    }
    
    if (!parentId) {
      onOutlineChange([...outline, newSection])
    } else {
      // Add as subsection - implementation would go here
      console.log("Adding subsection to", parentId)
    }
  }

  const deleteSection = (id: string) => {
    console.log("Deleting section", id)
    const filterSections = (sections: OutlineSection[]): OutlineSection[] => {
      return sections.filter(s => s.id !== id).map(s => ({
        ...s,
        subsections: s.subsections ? filterSections(s.subsections) : undefined
      }))
    }
    onOutlineChange(filterSections(outline))
  }

  const startEditing = (id: string) => {
    setEditingId(id)
  }

  const stopEditing = () => {
    setEditingId(null)
  }

  const EditableSection = ({ section }: { section: OutlineSection }) => {
    const [title, setTitle] = useState(section.title)
    const [description, setDescription] = useState(section.description)
    const [wordCount, setWordCount] = useState(section.wordCount.toString())

    const saveChanges = () => {
      const updated = updateSection(outline, section.id, {
        title,
        description,
        wordCount: parseInt(wordCount) || 1000
      })
      onOutlineChange(updated)
      stopEditing()
    }

    return (
      <div className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Section title"
          data-testid={`input-section-title-${section.id}`}
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Section description"
          className="min-h-20"
          data-testid={`textarea-section-description-${section.id}`}
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={wordCount}
            onChange={(e) => setWordCount(e.target.value)}
            placeholder="Word count"
            className="w-32"
            data-testid={`input-word-count-${section.id}`}
          />
          <span className="text-sm text-muted-foreground">words</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={saveChanges} data-testid={`button-save-${section.id}`}>
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={stopEditing} data-testid={`button-cancel-${section.id}`}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  const SectionDisplay = ({ section }: { section: OutlineSection }) => (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-semibold" data-testid={`text-section-title-${section.id}`}>
            {section.title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1" data-testid={`text-section-description-${section.id}`}>
            {section.description}
          </p>
          <Badge variant="secondary" className="mt-2">
            {section.wordCount.toLocaleString()} words
          </Badge>
        </div>
        {isEditable && (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => startEditing(section.id)}
              data-testid={`button-edit-section-${section.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => deleteSection(section.id)}
              data-testid={`button-delete-section-${section.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {outline.map((section) => (
        <Card key={section.id}>
          <CardHeader className="pb-3">
            <Collapsible
              open={section.isExpanded}
              onOpenChange={() => toggleExpand(section.id)}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    data-testid={`button-toggle-section-${section.id}`}
                  >
                    {section.isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <div className="flex-1">
                  {editingId === section.id ? (
                    <EditableSection section={section} />
                  ) : (
                    <SectionDisplay section={section} />
                  )}
                </div>
              </div>
              <CollapsibleContent className="pt-4">
                {section.subsections && section.subsections.length > 0 && (
                  <div className="pl-6 space-y-3">
                    {section.subsections.map((subsection) => (
                      <Card key={subsection.id} className="border-l-2 border-l-primary">
                        <CardContent className="p-4">
                          {editingId === subsection.id ? (
                            <EditableSection section={subsection} />
                          ) : (
                            <SectionDisplay section={subsection} />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {isEditable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSection(section.id)}
                    className="mt-3 ml-6"
                    data-testid={`button-add-subsection-${section.id}`}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subsection
                  </Button>
                )}
              </CollapsibleContent>
            </Collapsible>
          </CardHeader>
        </Card>
      ))}
      
      {isEditable && (
        <Button
          variant="outline"
          onClick={() => addSection()}
          className="w-full"
          data-testid="button-add-section"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      )}
    </div>
  )
}