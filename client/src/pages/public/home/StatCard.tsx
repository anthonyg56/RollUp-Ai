interface StatCardProps {
  number: number
  label: string
}

export function StatCard({ number, label }: StatCardProps) {
  return (
    <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <div className="text-5xl font-bold mb-2 text-fuchsia-600 dark:text-fuchsia-400">{number}%</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  )
}
