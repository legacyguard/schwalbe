
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.28.0'

function getCorsHeaders(origin: string) {
  // Allow localhost development and production domains
  const allowedOrigins = [
    'http://localhost:8081',  // Vite dev server
    'http://localhost:8082',  // Vite dev server (alternate)
    'http://localhost:3000',  // Alternative dev port
    'http://127.0.0.1:8081', // Alternative localhost
    'http://127.0.0.1:8082', // Alternative localhost
    'http://127.0.0.1:3000'  // Alternative dev port
  ];
  
  const isAllowedOrigin = allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'http://localhost:8082',
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
  const origin = req.headers.get('origin') || 'http://localhost:8082';
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
        
        // Initialize OpenAI client with the configured API key
        const openaiApiKey = Deno.env.get('SOFIA_OPENAI_API_KEY')
        if (!openaiApiKey) {
          console.error('SOFIA_OPENAI_API_KEY not configured in Edge Function environment')
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

          console.log('Calling OpenAI API with context:', {
            userId: context.userId,
            documentCount: context.documentCount,
            guardianCount: context.guardianCount,
            completionPercentage: context.completionPercentage
          })

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            max_tokens: 300,
            temperature: 0.7,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
          })

          const response = completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble responding right now. Please try again.'

          console.log('OpenAI API response received successfully')

          return new Response(
            JSON.stringify({ response }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
          
        } catch (error) {
          console.error('Error calling OpenAI API:', error)
          // Fallback to mock response
          const mockResponse = getMockResponse(message, context)
          return new Response(
            JSON.stringify({ 
              response: mockResponse,
              warning: 'Using fallback response due to OpenAI API error'
            }),
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

      case 'simple_query': {
        if (!data?.prompt || !data?.context) {
          return new Response(
            JSON.stringify({ error: 'Prompt and context are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Use simple OpenAI query for knowledge base responses
        const openaiApiKey = Deno.env.get('SOFIA_OPENAI_API_KEY')
        if (!openaiApiKey) {
          // Fallback to mock response
          const mockResponse = getMockResponse(data.prompt, data.context)
          return new Response(
            JSON.stringify({ 
              response: mockResponse,
              tokensUsed: 0
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        try {
          const openai = new OpenAI({ apiKey: openaiApiKey })
          
          // Get relevant context from knowledge base
          const knowledgeContext = getKnowledgeBaseContext(data.prompt)
          
          const systemPrompt = `You are Sofia, a warm AI assistant for LegacyGuard. Answer the user's question based ONLY on the following context. Do not add information that is not in the context. If the context doesn't contain relevant information, say so politely and suggest they try one of the suggested options.

CONTEXT: "${knowledgeContext}"

USER CONTEXT: ${data.context.userName || 'user'} has ${data.context.documentCount} documents, ${data.context.guardianCount} guardians, ${data.context.completionPercentage}% complete.`
          
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: data.prompt }
            ],
            max_tokens: 200,
            temperature: 0.3
          })

          const response = completion.choices[0]?.message?.content || 'I apologize, an error occurred.'
          
          return new Response(
            JSON.stringify({ 
              response,
              tokensUsed: completion.usage?.total_tokens || 0
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } catch (error) {
          console.error('Error in simple_query:', error)
          const mockResponse = getMockResponse(data.prompt, data.context)
          return new Response(
            JSON.stringify({ 
              response: mockResponse,
              tokensUsed: 0
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        break
      }

      case 'premium_generation': {
        if (!data?.prompt || !data?.context) {
          return new Response(
            JSON.stringify({ error: 'Prompt and context are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const openaiApiKey = Deno.env.get('SOFIA_OPENAI_API_KEY')
        if (!openaiApiKey) {
          return new Response(
            JSON.stringify({ error: 'Premium features require API key configuration' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        try {
          const openai = new OpenAI({ apiKey: openaiApiKey })
          const systemPrompt = generateSystemPrompt(data.context) + `\n\nPREMIUM MODE: Create detailed, personalized content for family legacy purposes. Use creative, warm, and meaningful language.`
          
          const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: data.prompt }
          ]

          // Add conversation history if provided
          if (data.conversationHistory) {
            const recentHistory = data.conversationHistory.slice(-6)
            for (const msg of recentHistory) {
              messages.splice(-1, 0, {
                role: msg.role,
                content: msg.content
              })
            }
          }

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            max_tokens: 600,
            temperature: 0.7
          })

          const response = completion.choices[0]?.message?.content || 'I apologize, an error occurred during premium content generation.'
          
          return new Response(
            JSON.stringify({ 
              response,
              tokensUsed: completion.usage?.total_tokens || 0
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } catch (error) {
          console.error('Error in premium_generation:', error)
          return new Response(
            JSON.stringify({ error: 'Error generating premium content. Please try again.' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
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
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Knowledge Base for Sofia AI Assistant
const SOFIA_KNOWLEDGE_BASE: Record<string, string> = {
  'faq_security': `🔒 Your data is maximally secure:
• End-to-End encryption: All documents are encrypted directly in your browser before upload
• Zero-Knowledge: We cannot see the content of your files  
• Personal key: Only you have access to the decryption key
• European servers: Data is stored in compliance with GDPR
Your documents are safer than in a bank!`,

  'technical_security': `🛡️ Technical security of LegacyGuard:
Encryption: AES-256 in GCM mode for files, TweetNaCl for keys and metadata, unique nonce for each file
Infrastructure: Supabase with Row Level Security, Clerk authentication, EU servers (GDPR compliant)
Key Management: Client-side key generation, PBKDF2 key derivation, secure key storage in IndexedDB`,

  'faq_guardians': `👥 Guardians are your Circle of Trust:
• Trusted people who can help your family in emergencies
• Secure access to your important documents when needed
• Peace of mind knowing your family is protected
• Flexible permissions - you control what each guardian can see`,

  'faq_documents': `📄 Essential documents for family protection:
Identity & Legal: Passport, driver's license, birth certificate, marriage certificate, will, power of attorney
Financial: Bank account info, insurance policies, investment accounts, mortgage documents
Medical: Medical records, prescriptions, health insurance cards, emergency contacts
Digital: Password manager export, digital asset information, social media accounts`,

  'faq_pricing': `💰 LegacyGuard Pricing:
Free Plan: Up to 10 documents, 2 guardians, basic security
Family Plan - $9.99/month: Unlimited documents, unlimited guardians, premium AI features, advanced legacy tools
Business Plan - $29.99/month: Everything in Family, multi-user management, advanced permissions, audit logs`,

  'security': 'Your data is protected with end-to-end encryption, zero-knowledge architecture, and European GDPR-compliant servers.',
  'guardians': 'Guardians are trusted people who can help your family access important documents in emergencies.',
  'documents': 'Upload essential documents like ID, passport, insurance, bank info, and medical records to protect your family.',
  'pricing': 'LegacyGuard offers free and paid plans. Free includes 10 documents and 2 guardians. Family plan is $9.99/month.',
  'help': 'I can help you upload documents, add guardians, create your will, or answer questions about security and features.',
  'upload': 'Go to your Vault and click "Add Document" to upload files. All documents are automatically encrypted.',
  'vault': 'Your Vault is where all important documents are stored, safely encrypted and accessible only to you and your guardians.',
  'emergency': 'In emergencies, your guardians can access shared documents, get emergency contacts, and follow your instructions to help your family.',
  'legacy': 'Create your digital legacy by writing messages, recording videos, and setting up your will to guide your family.',
  'will': 'LegacyGuard helps you create a basic will through a simple 7-step process focused on protecting your loved ones.'
}

function getKnowledgeBaseContext(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  // Direct FAQ matches
  for (const [key, content] of Object.entries(SOFIA_KNOWLEDGE_BASE)) {
    if (lowerPrompt.includes(key.replace('faq_', '').replace('_', ' '))) {
      return content
    }
  }
  
  // Keyword matching
  const keywords = [
    'security', 'encryption', 'safe', 'protect', 'gdpr',
    'guardians', 'trust', 'family', 'emergency', 'access',
    'documents', 'upload', 'vault', 'files', 'storage',
    'pricing', 'cost', 'plan', 'free', 'premium',
    'help', 'how', 'what', 'guide', 'start',
    'legacy', 'will', 'testament', 'inheritance'
  ]
  
  for (const keyword of keywords) {
    if (lowerPrompt.includes(keyword) && SOFIA_KNOWLEDGE_BASE[keyword]) {
      return SOFIA_KNOWLEDGE_BASE[keyword]
    }
  }
  
  // Fallback - provide general help
  return SOFIA_KNOWLEDGE_BASE['help'] || 'I can help you with document management, guardian setup, security questions, and legacy planning for LegacyGuard.'
}

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
- Language preference: ${context.language || 'en'}
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
