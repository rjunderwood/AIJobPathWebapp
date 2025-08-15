import { createClient } from "@/lib/supabase/server"
import { ReportViewer } from "@/components/report/report-viewer"
import { redirect } from "next/navigation"

export default async function PremiumReportPage({ 
  params 
}: { 
  params: { id: string }
}) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirect=/report/premium/${params.id}`)
  }
  
  // Get premium report
  const { data: premiumReport } = await supabase
    .from('premium_reports')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()
  
  if (!premiumReport) {
    // Check if user has access to this report
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single()
    
    if (!payment) {
      redirect('/pricing')
    }
    
    // Report might still be generating
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Generating Your Premium Report</h1>
          <p className="text-muted-foreground">
            Your personalized analysis is being created. This usually takes 1-2 minutes.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
  
  // Get premium prompts
  const { data: premiumPrompts } = await supabase
    .from('premium_prompts')
    .select('*')
    .eq('user_id', user.id)
    .eq('response_id', premiumReport.response_id)
    .single()
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <ReportViewer 
        reportData={premiumReport.report_data}
        reportType="premium"
        showPrompts={true}
        promptsData={premiumPrompts?.prompts_data}
      />
      
      {/* Success message */}
      <div className="mt-12 p-6 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          🎉 Welcome to Your Premium Analysis
        </h3>
        <p className="text-green-800 dark:text-green-200">
          This report is uniquely tailored to your background, university, and career goals. 
          Bookmark this page to access it anytime. New AI prompts and insights are included above.
        </p>
      </div>
      
      {/* Support section */}
      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
        <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
        <p className="text-muted-foreground mb-4">
          Our team is here to help you succeed. If you have questions about your report or need guidance:
        </p>
        <div className="flex gap-4">
          <a 
            href="mailto:support@aijobpath.com"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Email Support
          </a>
          <a 
            href="/dashboard/support"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Visit Help Center
          </a>
        </div>
      </div>
    </div>
  )
}