import { BookIdeaGenerator } from '../book-idea-generator'

export default function BookIdeaGeneratorExample() {
  return (
    <div className="p-4 max-w-2xl">
      <BookIdeaGenerator
        onIdeaGenerated={(idea) => console.log('Idea generated:', idea)}
        onIdeaAccepted={(idea) => console.log('Idea accepted:', idea)}
      />
    </div>
  )
}