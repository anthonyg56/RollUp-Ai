import { Check, Minus } from "lucide-react"

export function ComparisonTable() {
  const features = [
    {
      name: "Video Processing",
      free: "10 minutes/month",
      basic: "60 minutes/month",
      pro: "Unlimited",
    },
    {
      name: "Video Export Quality",
      free: "720p",
      basic: "1080p HD",
      pro: "4K",
    },
    {
      name: "Captions",
      free: "Basic",
      basic: "Advanced with styling",
      pro: "Advanced with styling",
    },
    {
      name: "Stock Library",
      free: "Pexels Basic",
      basic: "Premium",
      pro: "Premium",
    },
    {
      name: "Watermark",
      free: "Yes",
      basic: "No",
      pro: "No",
    },
    {
      name: "B-roll Generation",
      free: "No",
      basic: "Basic",
      pro: "Advanced",
    },
    {
      name: "Custom Branding",
      free: "No",
      basic: "No",
      pro: "Yes",
    },
    {
      name: "Priority Processing",
      free: "No",
      basic: "No",
      pro: "Yes",
    },
    {
      name: "Team Members",
      free: "1",
      basic: "1",
      pro: "Up to 5",
    },
    {
      name: "Storage",
      free: "500MB",
      basic: "10GB",
      pro: "50GB",
    },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 border-b-2">Feature</th>
            <th className="p-4 border-b-2">
              <div className="text-center">Free</div>
            </th>
            <th className="p-4 border-b-2 bg-fuchsia-50 dark:bg-fuchsia-950">
              <div className="text-center font-bold text-fuchsia-600 dark:text-fuchsia-400">Basic</div>
            </th>
            <th className="p-4 border-b-2">
              <div className="text-center">Pro</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : ""}>
              <td className="p-4 border-b">{feature.name}</td>
              <td className="p-4 border-b text-center">
                {feature.free === "Yes" ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : feature.free === "No" ? (
                  <Minus className="h-5 w-5 text-gray-400 mx-auto" />
                ) : (
                  feature.free
                )}
              </td>
              <td className="p-4 border-b text-center bg-fuchsia-50 dark:bg-fuchsia-950">
                {feature.basic === "Yes" ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : feature.basic === "No" ? (
                  <Minus className="h-5 w-5 text-gray-400 mx-auto" />
                ) : (
                  feature.basic
                )}
              </td>
              <td className="p-4 border-b text-center">
                {feature.pro === "Yes" ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : feature.pro === "No" ? (
                  <Minus className="h-5 w-5 text-gray-400 mx-auto" />
                ) : (
                  feature.pro
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
