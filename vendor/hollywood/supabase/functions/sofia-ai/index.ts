
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.28.0'

function getCorsHeaders(origin: string) {
  // Allow localhost development and production domains
  const allowedOrigins = [
    'http://localhost:8081',  // Vite dev server
    'http://localhost:3000',  // Alternative dev port
    'http://127.0.0.1:8081', // Alternative localhost
    'http://127.0.0.1:3000'  // Alternative dev port
  ];
  
  const isAllowedOrigin = allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'http://localhost:8081',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };
}

interface SofiaMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    documentCount?: number;
    guardianCount?: number;
    completionPercentage?: number;
    currentStep?: string;
    userPreferences?: {
      language?: string;
      familyStatus?: 'single' | 'partner' | 'family' | 'parent_care' | 'business';
    };
  };
}

interface SofiaContext {
  userId: string;
  userName?: string;
  documentCount: number;
  guardianCount: number;
  completionPercentage: number;
  recentActivity: string[];
  familyStatus: 'single' | 'partner' | 'family' | 'parent_care' | 'business';
  language: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin') || 'http://localhost:8081';
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required environment variables' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

    // Get the request body
    const body = await req.json()
    
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { action, data } = body
    
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    switch (action) {
      case 'generate_response': {
        if (!data?.message || !data?.context) {
          return new Response(
            JSON.stringify({ error: 'Message and context are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { message, context, conversationHistory = [] } = data
        
        // Initialize OpenAI client
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openaiApiKey) {
          return new Response(
            JSON.stringify({ error: 'OpenAI API key not configured' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const openai = new OpenAI({ apiKey: openaiApiKey })

        try {
          const systemPrompt = generateSystemPrompt(context)
          
          // Build conversation history for context
          const messages: OpenAI.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt }
          ]

          // Add recent conversation history (last 10 messages)
          const recentHistory = conversationHistory.slice(-10)
          for (const msg of recentHistory) {
            messages.push({
              role: msg.role,
              content: msg.content
            })
          }

          // Add current message
          messages.push({ role: 'user', content: message })

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            max_tokens: 300,
            temperature: 0.7,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
          })

          const response = completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble responding right now. Please try again.'

          return new Response(
            JSON.stringify({ response }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
          
        } catch (error) {
          console.error('Error generating Sofia response:', error)
          // Fallback to mock response
          const mockResponse = getMockResponse(message, context)
          return new Response(
            JSON.stringify({ response: mockResponse }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        break
      }

      case 'generate_suggestion': {
        if (!data?.context) {
          return new Response(
            JSON.stringify({ error: 'Context is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const suggestion = generateProactiveSuggestion(data.context)
        
        return new Response(
          JSON.stringify({ suggestion }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
        break
      }

      case 'get_contextual_help': {
        if (!data?.page || !data?.context) {
          return new Response(
            JSON.stringify({ error: 'Page and context are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const help = getContextualHelp(data.page, data.context)
        
        return new Response(
          JSON.stringify({ help }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
        break
      }

      default: {
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper functions moved from client-side
function generateSystemPrompt(context: SofiaContext): string {
  return `You are Sofia, a warm, intelligent AI assistant for LegacyGuard - a secure family protection platform. You help users organize their digital lives, protect their families, and create meaningful legacies.

PERSONALITY:
- Warm, empathetic, and supportive
- Professional but friendly tone
- Focus on care, protection, and love (not fear or death)
- Use the user's name when available: ${context.userName || 'there'}
- Be encouraging about progress and gentle with guidance

CURRENT USER CONTEXT:
- User ID: ${context.userId}
- Name: ${context.userName || 'Not provided'}
- Documents uploaded: ${context.documentCount}
- Guardians added: ${context.guardianCount}
- Overall completion: ${context.completionPercentage}%
- Family status: ${context.familyStatus}
- Language preference: ${context.language}
- Recent activity: ${context.recentActivity.join(', ') || 'No recent activity'}

KEY GUIDANCE PRINCIPLES:
1. Always focus on the positive impact of their actions
2. Provide specific, actionable next steps
3. Acknowledge their progress and care for family
4. Suggest relevant documents based on what they have
5. Gently guide toward completing important tasks

RESPONSE STYLE:
- Keep responses conversational and not too long
- Use encouraging language: "Great progress!" "This will really help your family"
- Provide 1-2 specific suggestions when appropriate
- End with a question or call to action when relevant

Remember: You're helping someone protect what they love most - their family.`
}

function getMockResponse(message: string, context: SofiaContext): string {
  const responses = {
    greeting: [
      `Hello ${context.userName || 'there'}! I'm Sofia, your digital family guardian. I see you've uploaded ${context.documentCount} documents - that's a great start! How can I help you protect your family today?`,
      `Welcome back! I noticed you're ${context.completionPercentage}% complete with your family protection plan. What would you like to work on next?`
    ],
    documents: [
      "Excellent! Every document you upload is another layer of protection for your family. Based on what you have, I'd recommend adding your insurance policies next - they're often crucial in emergencies.",
      "I love seeing your progress! With your current documents, you're building a solid foundation. Have you considered adding contact information for your important service providers?"
    ],
    guardians: [
      "Setting up guardians shows such thoughtful care for your family. The people you trust will be able to help when it matters most. Would you like to add another guardian or set up specific access permissions?",
      "Your guardian network is growing - that's wonderful! Remember, each guardian you add makes your family's protection stronger."
    ],
    general: [
      "I'm here to help you every step of the way. What's on your mind today?",
      `You're doing amazing work protecting your family, ${context.userName || 'there'}. How can I assist you further?`,
      "Every small step you take today makes a big difference for your family's future. What shall we focus on?"
    ]
  }

  // Simple keyword matching for mock responses
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)]
  }
  if (lowerMessage.includes('document') || lowerMessage.includes('upload') || lowerMessage.includes('file')) {
    return responses.documents[Math.floor(Math.random() * responses.greeting.length)]
  }
  if (lowerMessage.includes('guardian') || lowerMessage.includes('family') || lowerMessage.includes('emergency')) {
    return responses.guardians[Math.floor(Math.random() * responses.greeting.length)]
  }
  
  return responses.general[Math.floor(Math.random() * responses.general.length)]
}

function generateProactiveSuggestion(context: SofiaContext): string | null {
  const { documentCount, guardianCount, completionPercentage, familyStatus } = context
  
  // Early stage suggestions
  if (documentCount === 0) {
    return "Ready to get started? I recommend uploading your ID document first - it's quick and helps establish your digital identity."
  }
  
  if (documentCount >= 1 && documentCount < 5) {
    return `Great progress with ${documentCount} document${documentCount > 1 ? 's' : ''}! Next, I suggest adding your insurance documents - they're crucial for family protection.`
  }
  
  // Guardian suggestions
  if (documentCount >= 5 && guardianCount === 0 && familyStatus !== 'single') {
    return "With your documents organized, it's time to set up your Circle of Trust. Adding guardians ensures your family can access what they need in emergencies."
  }
  
  // Will creation suggestions
  if (documentCount >= 10 && guardianCount >= 1 && completionPercentage < 60) {
    return "You've built a solid foundation! Ready to create your will? I'll guide you through a simple, 7-step process that focuses on protecting your loved ones."
  }
  
  return null
}

function getContextualHelp(page: string, context: SofiaContext): string {
  switch (page) {
    case 'onboarding':
      return `Welcome to LegacyGuard, ${context.userName || 'there'}! I'm Sofia, and I'll be your guide. This journey is about creating peace of mind for you and protection for your family. Take your time - I'm here to help every step of the way.`
      
    case 'vault':
      return `Your Vault is where all your important documents live, safely encrypted. ${context.documentCount > 0 ? `You've already secured ${context.documentCount} documents - excellent work!` : 'Ready to add your first document?'} I can help you decide what to upload next.`
      
    case 'guardians':
      return `Your Circle of Trust is about the people who matter most. ${context.guardianCount > 0 ? `You've trusted ${context.guardianCount} guardian${context.guardianCount > 1 ? 's' : ''} - that shows real care for your family.` : 'Guardians are the people who can help your family when you can\'t.'} Each person you add strengthens your family's protection.`
      
    case 'legacy':
      return 'Your Legacy section is where love becomes action - creating wills, recording messages, and sharing your wishes. This isn\'t about endings; it\'s about making sure your care continues.'
      
    default:
      return `I'm here to help you protect what matters most. With ${context.completionPercentage}% of your family protection complete, you're already making a real difference. What would you like to work on today?`
  }
}
