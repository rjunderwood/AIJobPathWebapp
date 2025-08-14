import { OpenAI } from 'openai'

let client: OpenAI | null = null

export function getOpenAIClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.openai.com/v1',
    })
  }
  
  return client
}