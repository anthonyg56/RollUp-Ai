interface TestimonialCardProps {
  quote: string
  author: string
  role: string
}

export default function TestimonialCard({ quote, author, role }: TestimonialCardProps) {
  return (
    <div className="border bg-secondary rounded-lg p-6">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>
      <p className="mb-4 text-secondary-foreground">"{quote}"</p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-secondary-foreground rounded-full mr-3"></div>
        <div>
          <div className="font-bold text-fuchsia-600 dark:text-fuchsia-400">{author}</div>
          <div className="text-sm text-muted-foreground">{role}</div>
        </div>
      </div>
    </div>
  )
}
