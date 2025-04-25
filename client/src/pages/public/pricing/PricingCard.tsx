import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  title: string
  description: string
  price: string
  period: string
  features: string[]
  buttonText: string
  buttonVariant: "default" | "outline" | "secondary"
  popular?: boolean
}

export function PricingCard({
  title,
  description,
  price,
  period,
  features,
  buttonText,
  buttonVariant,
  popular = false,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden border bg-card text-card-foreground shadow transition-all duration-200",
        popular ? "border-fuchsia-600 dark:border-fuchsia-400 scale-105 shadow-lg" : "",
      )}
    >
      {popular && <div className="bg-fuchsia-600 text-white text-center py-1 text-sm font-medium">MOST POPULAR</div>}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="mb-6">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">{period}</span>
        </div>
        <Button
          className={cn(
            "w-full mb-6",
            buttonVariant === "default" ? "bg-fuchsia-600 hover:bg-fuchsia-700 text-white" : "",
            buttonVariant === "outline" ? "text-fuchsia-600 border-fuchsia-600 hover:bg-fuchsia-600/10" : "",
          )}
          variant={buttonVariant}
        >
          {buttonText}
        </Button>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
