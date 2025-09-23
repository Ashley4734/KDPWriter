import { BookCard } from '../book-card'

export default function BookCardExample() {
  return (
    <div className="p-4 max-w-sm">
      <BookCard
        id="1"
        title="The Complete Guide to Digital Marketing"
        description="A comprehensive guide covering SEO, social media, content marketing, and analytics for modern businesses."
        status="writing"
        progress={65}
        wordCount={45000}
        targetWordCount={70000}
        genre="Business"
        createdAt="2024-01-15"
      />
    </div>
  )
}