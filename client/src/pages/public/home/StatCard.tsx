interface StatCardProps {
  number: number;
  label: string
}

export function StatCard({ number, label }: StatCardProps) {
  return (
    <div className="text-center p-6 border border-gray-200 rounded-lg">
      <div className="text-5xl font-bold mb-2 text-primary">{number}%</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  )
}