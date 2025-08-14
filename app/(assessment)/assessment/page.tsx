import { AssessmentFlow } from "@/components/assessment/AssessmentFlow"
import { MobileOptimized } from "@/components/assessment/MobileOptimized"

export const metadata = {
  title: "AI Career Gap Analysis - Find Your Path to Success",
  description: "Discover the exact skills you need to land your dream job. Get a personalized career roadmap in minutes."
}

export default function AssessmentPage() {
  return (
    <MobileOptimized>
      <AssessmentFlow />
    </MobileOptimized>
  )
}