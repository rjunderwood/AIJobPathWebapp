import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { getOpenAIClient } from '@/lib/openai/client'
import { getPaidUsefulPromptsPrompt } from '@/lib/prompts/paid-useful-prompts'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { userId, responseId } = await request.json()
    
    if (!userId || !responseId) {
      return NextResponse.json(
        { error: 'User ID and Response ID are required' },
        { status: 400 }
      )
    }
    
    const supabase = createClient()
    
    // Check if premium prompts already exist for this user and response
    const { data: existingPrompts } = await supabase
      .from('premium_prompts')
      .select('*')
      .eq('user_id', userId)
      .eq('response_id', responseId)
      .single()
    
    if (existingPrompts) {
      return NextResponse.json({
        prompts: existingPrompts.prompts_data,
        cached: true,
        promptsId: existingPrompts.id
      })
    }
    
    // Get assessment response data
    const { data: assessmentResponse, error: responseError } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('id', responseId)
      .single()
    
    if (responseError || !assessmentResponse) {
      return NextResponse.json(
        { error: 'Assessment response not found' },
        { status: 404 }
      )
    }
    
    // Calculate days to graduation
    const currentDate = new Date()
    const graduationYear = assessmentResponse.graduation_year as number
    const graduationDate = new Date(graduationYear, 5, 1) // Assume June graduation
    const daysToGraduation = Math.max(
      0,
      Math.floor((graduationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    )
    
    // Determine company tier based on target role
    const companyTier = determineCompanyTier(assessmentResponse.target_role as string)
    
    // Identify skill gaps
    const skillGaps = identifySkillGaps(
      assessmentResponse.major as string,
      assessmentResponse.target_role as string,
      (assessmentResponse.current_skills as string[] | null) || []
    )
    
    // Generate personalized prompts with OpenAI
    const openai = getOpenAIClient()
    const startTime = Date.now()
    
    const prompt = getPaidUsefulPromptsPrompt({
      major: assessmentResponse.major as string,
      dreamJob: assessmentResponse.target_role as string,
      companyTier,
      graduationYear: graduationYear.toString(),
      currentSkills: (assessmentResponse.current_skills as string[] | null)?.join(', ') || 'None specified',
      skillGaps: skillGaps.join(', '),
      learningStyle: (assessmentResponse.learning_style as string | null) || 'Not specified',
      timeAvailability: (assessmentResponse.time_availability as string | null) || 'Not specified',
      careerConcerns: (assessmentResponse.career_concerns as string | null) || 'Not specified',
      currentDate: currentDate.toISOString().split('T')[0],
      daysToGraduation: daysToGraduation.toString()
    })
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini-2025-08-07',
      messages: [
        {
          role: 'system',
          content: 'You are an AI prompt engineering specialist who has reverse-engineered the exact AI workflows used by top performers. Generate a forensically personalized collection of prompts that gives this specific student an almost unfair advantage in their exact career transition.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 1,
      // max_completion_tokens: 8000, // More tokens for comprehensive prompts
    })
    
    const promptsContent = completion.choices[0].message.content || ''
    const generationTime = Date.now() - startTime
    
    // Parse and structure the prompts
    const promptsData = {
      userId,
      responseId,
      major: assessmentResponse.major,
      dreamJob: assessmentResponse.target_role,
      content: promptsContent,
      prompts: parsePersonalizedPrompts(promptsContent),
      metadata: {
        daysToGraduation,
        companyTier,
        skillGaps,
        learningStyle: assessmentResponse.learning_style,
        timeAvailability: assessmentResponse.time_availability
      },
      generatedAt: new Date().toISOString()
    }
    
    // Save to database
    const { data: newPrompts, error: dbError } = await supabase
      .from('premium_prompts')
      .insert({
        user_id: userId,
        response_id: responseId,
        prompts_data: promptsData,
        ai_tokens_used: completion.usage?.total_tokens,
        generation_time_ms: generationTime
      })
      .select()
      .single()
    
    if (dbError) {
      console.error('Database save error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save prompts' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      prompts: promptsData,
      cached: false,
      promptsId: newPrompts.id,
      generationTime
    })
    
  } catch (error) {
    console.error('Premium prompts generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate premium prompts' },
      { status: 500 }
    )
  }
}

function determineCompanyTier(targetRole: string): string {
  const roleLower = targetRole.toLowerCase()
  
  if (roleLower.includes('google') || roleLower.includes('amazon') || 
      roleLower.includes('apple') || roleLower.includes('meta') || 
      roleLower.includes('microsoft') || roleLower.includes('faang')) {
    return 'FAANG'
  } else if (roleLower.includes('startup')) {
    return 'Startup'
  } else if (roleLower.includes('consulting') || roleLower.includes('deloitte') || 
             roleLower.includes('mckinsey') || roleLower.includes('bain')) {
    return 'Consulting'
  } else if (roleLower.includes('agency')) {
    return 'Agency'
  } else {
    return 'Fortune 500'
  }
}

function identifySkillGaps(major: string, targetRole: string, currentSkills: string[]): string[] {
  // Basic skill gap identification logic
  // In production, this would be more sophisticated
  const skillGaps: string[] = []
  const roleLower = targetRole.toLowerCase()
  const currentSkillsLower = currentSkills.map(s => s.toLowerCase())
  
  // Common technical skills by role type
  if (roleLower.includes('software') || roleLower.includes('developer')) {
    const techSkills = ['javascript', 'python', 'react', 'node.js', 'sql', 'git']
    techSkills.forEach(skill => {
      if (!currentSkillsLower.some(s => s.includes(skill))) {
        skillGaps.push(skill)
      }
    })
  } else if (roleLower.includes('data')) {
    const dataSkills = ['python', 'sql', 'statistics', 'machine learning', 'tableau']
    dataSkills.forEach(skill => {
      if (!currentSkillsLower.some(s => s.includes(skill))) {
        skillGaps.push(skill)
      }
    })
  } else if (roleLower.includes('product')) {
    const productSkills = ['user research', 'analytics', 'roadmapping', 'agile', 'figma']
    productSkills.forEach(skill => {
      if (!currentSkillsLower.some(s => s.includes(skill))) {
        skillGaps.push(skill)
      }
    })
  }
  
  // Add soft skills that are always valuable
  if (!currentSkillsLower.some(s => s.includes('communication'))) {
    skillGaps.push('communication')
  }
  if (!currentSkillsLower.some(s => s.includes('problem solving'))) {
    skillGaps.push('problem solving')
  }
  
  return skillGaps.slice(0, 5) // Return top 5 gaps
}

function parsePersonalizedPrompts(content: string): any[] {
  const prompts: any[] = []
  
  // Extract prompts with more detailed structure
  const promptPattern = /(?:Prompt Title:|#{2,3})\s*"?([^"\n]+)"?\s*\n(?:Use Case:|Purpose:)?\s*([^\n]+)\n(?:Expected Outcome:)?\s*([^\n]*)\n([\s\S]*?)(?=(?:Prompt Title:|#{2,3})\s*"?[^"\n]+"?\s*\n|$)/gi
  let match
  
  while ((match = promptPattern.exec(content)) !== null) {
    const title = match[1].trim().replace(/"/g, '')
    const useCase = match[2].trim()
    const expectedOutcome = match[3]?.trim() || ''
    const promptContent = match[4].trim()
    
    prompts.push({
      title,
      useCase,
      expectedOutcome,
      content: promptContent,
      category: categorizePersonalizedPrompt(title, promptContent),
      difficulty: assessPromptDifficulty(promptContent)
    })
  }
  
  // Fallback to extract code blocks if pattern doesn't match
  if (prompts.length === 0) {
    const codeBlockPattern = /```[\s\S]*?```/g
    const codeBlocks = content.match(codeBlockPattern)
    
    if (codeBlocks) {
      codeBlocks.forEach((block, index) => {
        const cleanBlock = block.replace(/```/g, '').trim()
        prompts.push({
          title: `Advanced Prompt ${index + 1}`,
          useCase: 'Career acceleration',
          expectedOutcome: 'Professional advantage',
          content: cleanBlock,
          category: 'advanced',
          difficulty: 'intermediate'
        })
      })
    }
  }
  
  return prompts
}

function categorizePersonalizedPrompt(title: string, content: string): string {
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()
  
  if (titleLower.includes('skill gap') || titleLower.includes('bridge')) {
    return 'skill-building'
  } else if (titleLower.includes('identity') || titleLower.includes('persona')) {
    return 'professional-identity'
  } else if (titleLower.includes('simulation') || titleLower.includes('practice')) {
    return 'role-simulation'
  } else if (titleLower.includes('portfolio') || titleLower.includes('project')) {
    return 'portfolio'
  } else if (titleLower.includes('interview')) {
    return 'interview-prep'
  } else if (titleLower.includes('network')) {
    return 'networking'
  } else if (titleLower.includes('market') || titleLower.includes('opportunity')) {
    return 'market-intelligence'
  } else if (titleLower.includes('confidence') || titleLower.includes('mindset')) {
    return 'mindset'
  } else if (titleLower.includes('crisis') || titleLower.includes('pivot')) {
    return 'contingency'
  } else {
    return 'optimization'
  }
}

function assessPromptDifficulty(content: string): string {
  const contentLength = content.length
  const hasComplexStructure = /STEP|PHASE|FRAMEWORK|MATRIX/i.test(content)
  const hasMultipleSections = (content.match(/#{2,3}/g) || []).length > 3
  
  if (contentLength > 2000 || (hasComplexStructure && hasMultipleSections)) {
    return 'advanced'
  } else if (contentLength > 1000 || hasComplexStructure || hasMultipleSections) {
    return 'intermediate'
  } else {
    return 'beginner'
  }
}