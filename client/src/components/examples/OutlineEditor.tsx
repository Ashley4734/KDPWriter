import { useState } from 'react'
import { OutlineEditor, OutlineSection } from '../outline-editor'

export default function OutlineEditorExample() {
  const [outline, setOutline] = useState<OutlineSection[]>([
    {
      id: "1",
      title: "Introduction to Digital Marketing",
      description: "Overview of modern digital marketing landscape, key concepts, and why it matters for businesses today.",
      wordCount: 2500,
      isExpanded: true,
      subsections: [
        {
          id: "1.1",
          title: "What is Digital Marketing?",
          description: "Define digital marketing and its core components.",
          wordCount: 1000
        },
        {
          id: "1.2", 
          title: "Evolution of Marketing",
          description: "How marketing has evolved from traditional to digital channels.",
          wordCount: 1500
        }
      ]
    },
    {
      id: "2",
      title: "Search Engine Optimization (SEO)",
      description: "Complete guide to SEO strategies, techniques, and best practices for improving organic search rankings.",
      wordCount: 4500,
      isExpanded: false
    },
    {
      id: "3",
      title: "Social Media Marketing",
      description: "Strategies for leveraging social platforms to build brand awareness and engage with customers.",
      wordCount: 3500,
      isExpanded: false
    }
  ])

  return (
    <div className="p-4 max-w-4xl">
      <OutlineEditor
        outline={outline}
        onOutlineChange={setOutline}
        isEditable={true}
      />
    </div>
  )
}