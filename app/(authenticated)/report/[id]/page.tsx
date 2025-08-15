import { createClient } from "@/lib/supabase/server"
import { ReportViewer } from "@/components/report/report-viewer"
import { redirect } from "next/navigation"

export default async function ReportPage({ 
  params,
  searchParams 
}: { 
  params: { id: string }
  searchParams: { session?: string } 
}) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?session=${searchParams.session || params.id}&redirect=/report/${params.id}`)
  }
  
  // Get free report for the user's assessment
  const { data: assessmentResponse } = await supabase
    .from('assessment_responses')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (!assessmentResponse) {
    // Try to link by session if provided
    if (searchParams.session) {
      const { data: session } = await supabase
        .from('assessment_sessions')
        .select('id')
        .eq('session_id', searchParams.session)
        .single()
      
      if (session) {
        const { data: response } = await supabase
          .from('assessment_responses')
          .select('*')
          .eq('session_id', session.id)
          .single()
        
        if (response) {
          // Link response to user
          await supabase
            .from('assessment_responses')
            .update({ user_id: user.id })
            .eq('id', response.id)
        }
      }
    }
    
    redirect('/assessment')
  }
  
  // Get free report for the major
  const { data: freeReport } = await supabase
    .from('free_reports')
    .select('*')
    .eq('major', assessmentResponse.major)
    .single()
  
  if (!freeReport) {
    // Trigger generation if not exists
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/report/free/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        major: assessmentResponse.major,
        sessionId: searchParams.session
      })
    })
    
    const result = await response.json()
    if (result.report) {
      return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <ReportViewer 
            reportData={result.report}
            reportType="free"
            showPrompts={true}
            promptsData={await getFreePrompts(assessmentResponse.major)}
          />
        </div>
      )
    }
  }
  
  // Get free prompts
  const promptsData = await getFreePrompts(assessmentResponse.major)
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <ReportViewer 
        reportData={freeReport?.report_data}
        reportType="free"
        showPrompts={true}
        promptsData={promptsData}
      />
      
      {/* Premium Upsell */}
      <div className="mt-12 p-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border-2">
        <h2 className="text-2xl font-bold mb-4">
          Get Your Personalized Premium Analysis
        </h2>
        <p className="text-muted-foreground mb-6">
          This report is based on your major only. Unlock a fully personalized analysis based on:
        </p>
        <ul className="grid grid-cols-2 gap-3 mb-6">
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Your specific university
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Your target role
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Your current skills
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Your learning style
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Your time availability
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Your career concerns
          </li>
        </ul>
        <a 
          href={`/checkout?session=${searchParams.session || params.id}`}
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Upgrade to Premium - $19
        </a>
      </div>
    </div>
  )
}

async function getFreePrompts(major: string) {
  const supabase = await createClient()
  
  const { data: freePrompts } = await supabase
    .from('free_prompts')
    .select('*')
    .eq('major', major)
    .single()
  
  if (!freePrompts) {
    // Trigger generation
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/prompts/free/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ major })
    })
    
    const result = await response.json()
    return result.prompts
  }
  
  return freePrompts.prompts_data
}