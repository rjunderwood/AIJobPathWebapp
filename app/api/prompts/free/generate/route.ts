import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { getOpenAIClient } from '@/lib/openai/client'
import { getFreeUsefulPromptsPrompt } from '@/lib/prompts/free-useful-prompts'
import { kv } from '@/lib/cloudflare/kv'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { major } = await request.json()
    
    if (!major) {
      return NextResponse.json(
        { error: 'Major is required' },
        { status: 400 }
      )
    }
    
    const supabase = createClient()
    
    // Check if free prompts already exist for this major
    const { data: existingPrompts } = await supabase
      .from('free_prompts')
      .select('*')
      .eq('major', major)
      .single()
    
    if (existingPrompts) {
      // Return cached prompts
      return NextResponse.json({
        prompts: existingPrompts.prompts_data,
        cached: true,
        promptsId: existingPrompts.id
      })
    }
    
    // Check KV cache as fallback
    const cacheKey = `free-prompts:${major.toLowerCase().replace(/\s+/g, '-')}`
    const cached = await kv.get(cacheKey)
    if (cached) {
      const promptsData = JSON.parse(cached)
      
      // Save to database for persistence
      const { data: newPrompts } = await supabase
        .from('free_prompts')
        .insert({
          major,
          prompts_data: promptsData,
        })
        .select()
        .single()
      
      return NextResponse.json({
        prompts: promptsData,
        cached: true,
        promptsId: newPrompts?.id
      })
    }
    
    // Generate new prompts with OpenAI
    const openai = getOpenAIClient()
    const startTime = Date.now()
    
    const prompt = getFreeUsefulPromptsPrompt({
      major,
      currentDate: new Date().toISOString().split('T')[0]
    })
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini-2025-08-07',
      messages: [
        {
          role: 'system',
          content: 'You are an AI prompt engineering specialist. Generate a comprehensive collection of powerful prompts following the exact format requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 1,
      // max_completion_tokens: 4000,
    })
    
    const promptsContent = completion.choices[0].message.content || ''
    const generationTime = Date.now() - startTime
    
    // Parse the prompts content into structured data
    const promptsData = {
      major,
      content: promptsContent,
      prompts: parsePrompts(promptsContent),
      generatedAt: new Date().toISOString()
    }
    
    // Save to database
    const { data: newPrompts, error: dbError } = await supabase
      .from('free_prompts')
      .insert({
        major,
        prompts_data: promptsData,
        ai_tokens_used: completion.usage?.total_tokens,
        generation_time_ms: generationTime
      })
      .select()
      .single()
    
    if (dbError) {
      console.error('Database save error:', dbError)
    }
    
    // Cache in KV for fast access
    await kv.put(
      cacheKey,
      JSON.stringify(promptsData),
      { expirationTtl: 2592000 } // 30 days cache
    )
    
    return NextResponse.json({
      prompts: promptsData,
      cached: false,
      promptsId: newPrompts?.id,
      generationTime
    })
    
  } catch (error) {
    console.error('Free prompts generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate prompts' },
      { status: 500 }
    )
  }
}

function parsePrompts(content: string): any[] {
  const prompts: any[] = []
  
  // Extract individual prompts using regex
  // Look for patterns like "Prompt Title:" or numbered prompts
  const promptPattern = /(?:Prompt Title:|#{2,3})\s*"?([^"\n]+)"?\s*\n(?:Use Case:|Purpose:)?\s*([^\n]+)\n([\s\S]*?)(?=(?:Prompt Title:|#{2,3})\s*"?[^"\n]+"?\s*\n|$)/gi
  let match
  
  while ((match = promptPattern.exec(content)) !== null) {
    const title = match[1].trim().replace(/"/g, '')
    const useCase = match[2].trim()
    const promptContent = match[3].trim()
    
    prompts.push({
      title,
      useCase,
      content: promptContent,
      category: categorizePrompt(title, promptContent)
    })
  }
  
  // If no prompts found with the pattern, try to extract code blocks
  if (prompts.length === 0) {
    const codeBlockPattern = /```[\s\S]*?```/g
    const codeBlocks = content.match(codeBlockPattern)
    
    if (codeBlocks) {
      codeBlocks.forEach((block, index) => {
        const cleanBlock = block.replace(/```/g, '').trim()
        prompts.push({
          title: `Prompt ${index + 1}`,
          useCase: 'AI-powered assistance',
          content: cleanBlock,
          category: 'general'
        })
      })
    }
  }
  
  return prompts
}

function categorizePrompt(title: string, content: string): string {
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()
  
  if (titleLower.includes('learn') || contentLower.includes('skill')) {
    return 'learning'
  } else if (titleLower.includes('interview') || contentLower.includes('interview')) {
    return 'interview'
  } else if (titleLower.includes('project') || titleLower.includes('portfolio')) {
    return 'projects'
  } else if (titleLower.includes('network') || contentLower.includes('linkedin')) {
    return 'networking'
  } else if (titleLower.includes('research') || titleLower.includes('analysis')) {
    return 'research'
  } else {
    return 'productivity'
  }
}