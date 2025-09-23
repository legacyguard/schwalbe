/**
 * SOFIA AI Generation API Endpoint
 * Handles premium AI queries with full context and advanced capabilities
 */

import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { sofiaModelOptimizer } from '@/packages/shared/src/services/sofia/model-optimizer';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateRequest {
  message: string;
  context?: {
    currentPage?: string;
    userAction?: string;
    documentContext?: any;
    familyContext?: any;
  };
  model?: string;
  max_tokens?: number;
  temperature?: number;
  presence_penalty?: number;
}

interface GenerateResponse {
  response: string;
  confidence: number;
  tokens_used: number;
  cost: number;
  model_used: string;
  processing_time: number;
  actions?: Array<{
    type: string;
    label: string;
    action: string;
    icon?: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    const {
      message,
      context,
      model = 'gpt-4o-mini',
      max_tokens = 300,
      temperature = 0.7,
      presence_penalty = 0.1
    }: GenerateRequest = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Determine required capabilities based on context and message
    const requiredCapabilities = analyzeRequiredCapabilities(message, context);

    // Optimize model selection for premium quality
    const optimization = sofiaModelOptimizer.optimize(
      {
        message,
        context,
        requiredCapabilities,
        priority: 'quality'
      },
      {
        strategy: 'balanced',
        maxCostPerRequest: 0.10, // Higher budget for premium responses
        minQualityThreshold: 8,
        maxResponseTime: 5000
      }
    );

    // Create comprehensive system prompt
    const systemPrompt = createAdvancedSystemPrompt(context, requiredCapabilities);

    // Prepare conversation with context
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add context-specific examples if available
    if (context?.documentContext || context?.familyContext) {
      messages.push({
        role: 'user',
        content: 'Context: ' + JSON.stringify({
          page: context.currentPage,
          documents: context.documentContext ? 'User has active documents' : undefined,
          family: context.familyContext ? 'User is managing family data' : undefined
        })
      });
      messages.push({
        role: 'assistant',
        content: 'I understand the context. I\'m ready to help with family protection.'
      });
    }

    // Add main user message
    messages.push({
      role: 'user',
      content: message
    });

    // Generate response with advanced parameters
    const completion = await openai.chat.completions.create({
      model: optimization.selectedModel,
      messages,
      max_tokens: optimization.maxTokens,
      temperature: Math.min(temperature, 0.8),
      presence_penalty,
      frequency_penalty: 0.1,
      top_p: 0.95,
    });

    const response = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    const processingTime = Date.now() - startTime;

    // Extract suggested actions from response
    const suggestedActions = extractActions(response, context);

    // Calculate confidence for premium responses
    const confidence = calculateAdvancedConfidence(message, response, processingTime, requiredCapabilities);

    // Calculate actual cost
    const actualCost = optimization.estimatedCost;

    // Record usage for learning
    sofiaModelOptimizer.recordUsage(
      optimization.selectedModel,
      actualCost,
      confidence * 10,
      processingTime
    );

    const result: GenerateResponse = {
      response: cleanResponse(response),
      confidence,
      tokens_used: tokensUsed,
      cost: actualCost,
      model_used: optimization.selectedModel,
      processing_time: processingTime,
      actions: suggestedActions
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('AI generation API error:', error);

    const processingTime = Date.now() - startTime;

    // Return fallback response
    res.status(200).json({
      response: 'I apologize, I cannot process your request at the moment. Please try again later or use one of the default actions.',
      confidence: 0.3,
      tokens_used: 0,
      cost: 0,
      model_used: 'fallback',
      processing_time: processingTime,
      actions: [
        { type: 'navigate', label: 'Home', action: '/', icon: '🏠' },
        { type: 'help', label: 'Help', action: 'show_help', icon: '❓' }
      ]
    });
  }
}

/**
 * Analyze what capabilities are needed for this request
 */
function analyzeRequiredCapabilities(message: string, context?: GenerateRequest['context']): Array<'general_qa' | 'document_analysis' | 'family_guidance' | 'legal_advice' | 'emergency' | 'technical'> {
  const capabilities: Array<'general_qa' | 'document_analysis' | 'family_guidance' | 'legal_advice' | 'emergency' | 'technical'> = ['general_qa'];
  const lowerMessage = message.toLowerCase();

  // Document-related capabilities
  if (lowerMessage.includes('dokument') || lowerMessage.includes('document') ||
      lowerMessage.includes('súbor') || lowerMessage.includes('pdf') ||
      context?.documentContext) {
    capabilities.push('document_analysis');
  }

  // Family-related capabilities
  if (lowerMessage.includes('rodin') || lowerMessage.includes('family') ||
      lowerMessage.includes('opatrovník') || lowerMessage.includes('guardian') ||
      context?.familyContext) {
    capabilities.push('family_guidance');
  }

  // Legal advice capabilities
  if (lowerMessage.includes('zákon') || lowerMessage.includes('legal') ||
      lowerMessage.includes('práv') || lowerMessage.includes('súd') ||
      lowerMessage.includes('závet') || lowerMessage.includes('will')) {
    capabilities.push('legal_advice');
  }

  // Emergency capabilities
  if (lowerMessage.includes('núdz') || lowerMessage.includes('emergency') ||
      lowerMessage.includes('pomoc') || lowerMessage.includes('urgent')) {
    capabilities.push('emergency');
  }

  // Technical capabilities
  if (lowerMessage.includes('ako') || lowerMessage.includes('how') ||
      lowerMessage.includes('nastavenie') || lowerMessage.includes('setting') ||
      lowerMessage.includes('problém') || lowerMessage.includes('error')) {
    capabilities.push('technical');
  }

  return capabilities;
}

/**
 * Create advanced system prompt with specialized knowledge
 */
function createAdvancedSystemPrompt(
  context?: GenerateRequest['context'],
  capabilities?: ReturnType<typeof analyzeRequiredCapabilities>
): string {
  let prompt = `You are SOFIA, an advanced AI assistant for the family protection system. You are an expert in:

🛡️ FAMILY PROTECTION
- Digital security of important documents
- Emergency access systems to information
- Personal data and privacy protection
- Long-term planning for future generations

👥 FAMILY AND GUARDIAN MANAGEMENT
- Setting permissions and access rights
- Trust systems and identity verification
- Emergency protocols and escalation
- Communication between family members

📄 DOCUMENTS AND WILLS
- Organization and categorization of documents
- Legal validity of digital records
- Automatic backup and archiving
- Emergency access procedures

⚖️ LEGAL ADVICE (BASIC)
- European data protection laws
- Inheritance law basics
- Digital document validity
- GDPR and privacy`;

  // Add capability-specific knowledge
  if (capabilities?.includes('emergency')) {
    prompt += `\n\n🚨 EMERGENCY SITUATIONS
- Emergency protocol activation
- Contact with authorized persons
- Access to critical information
- Coordination with emergency services`;
  }

  if (capabilities?.includes('technical')) {
    prompt += `\n\n🔧 TECHNICAL SUPPORT
- Troubleshooting access problems
- Setting up security features
- Data import and export
- Integration with external services`;
  }

  // Add context awareness
  if (context?.currentPage) {
    prompt += `\n\nCURRENT CONTEXT: User is on page ${context.currentPage}`;
  }

  prompt += `\n\nCOMMUNICATION STYLE:
- Respond in English, clearly and understandably
- Be empathetic and supportive
- Provide specific steps and solutions
- For complex topics, recommend consultation with experts
- Always prioritize security and data privacy

SECURITY RULES:
- Never ask for passwords or sensitive data
- Recommend identity verification for sensitive operations
- Warn about risks when sharing personal information
- Promote the use of strong encryption`;

  return prompt;
}

/**
 * Calculate advanced confidence based on multiple factors
 */
function calculateAdvancedConfidence(
  message: string,
  response: string,
  processingTime: number,
  capabilities?: ReturnType<typeof analyzeRequiredCapabilities>
): number {
  let confidence = 0.7; // Base confidence for premium responses

  // Response quality factors
  const responseLength = response.length;
  const messageLength = message.length;

  // Length appropriateness
  if (responseLength > messageLength * 0.5 && responseLength < messageLength * 5) {
    confidence += 0.1;
  }

  // Slovak language quality
  if (hasAdvancedSlovakStructure(response)) {
    confidence += 0.1;
  }

  // Actionable content
  if (containsActionableAdvice(response)) {
    confidence += 0.1;
  }

  // Capability match
  if (capabilities && matchesRequiredCapabilities(response, capabilities)) {
    confidence += 0.1;
  }

  // Processing efficiency
  if (processingTime < 3000) {
    confidence += 0.05;
  }

  // Safety and security awareness
  if (containsSecurityAwareness(response)) {
    confidence += 0.05;
  }

  return Math.max(0.3, Math.min(1.0, confidence));
}

/**
 * Check for advanced Slovak language structure
 */
function hasAdvancedSlovakStructure(response: string): boolean {
  const complexSlovakPatterns = [
    /\b(odporúčam|navrhujemem|môžete|dokážete)\b/i,
    /\b(bezpečnosť|ochrana|súkromie)\b/i,
    /\b(dokument|závet|opatrovník|rodina)\b/i
  ];

  return complexSlovakPatterns.some(pattern => pattern.test(response)) &&
         response.length > 50;
}

/**
 * Check if response contains actionable advice
 */
function containsActionableAdvice(response: string): boolean {
  const actionPatterns = [
    /\b(kliknite|otvorte|prejdite|vyplňte)\b/i,
    /\b(nastavte|zvoľte|pridajte|odstráňte)\b/i,
    /\b(skontrolujte|overte|upravte)\b/i
  ];

  return actionPatterns.some(pattern => pattern.test(response));
}

/**
 * Check if response matches required capabilities
 */
function matchesRequiredCapabilities(
  response: string,
  capabilities: ReturnType<typeof analyzeRequiredCapabilities>
): boolean {
  const capabilityKeywords = {
    family_guidance: ['rodin', 'opatrovník', 'member', 'guardian'],
    document_analysis: ['dokument', 'súbor', 'pdf', 'upload'],
    legal_advice: ['zákon', 'práv', 'legal', 'súd'],
    emergency: ['núdz', 'emergency', 'pomoc', 'urgent'],
    technical: ['nastavenie', 'problém', 'error', 'konfigurácia']
  };

  return capabilities.some(cap => {
    const keywords = capabilityKeywords[cap];
    return keywords?.some(keyword => response.toLowerCase().includes(keyword));
  });
}

/**
 * Check if response shows security awareness
 */
function containsSecurityAwareness(response: string): boolean {
  const securityTerms = [
    'bezpečn', 'súkromie', 'šifrovanie', 'overenie', 'heslo', 'prístup'
  ];

  return securityTerms.some(term => response.toLowerCase().includes(term));
}

/**
 * Extract suggested actions from response
 */
function extractActions(response: string, context?: GenerateRequest['context']): Array<{ type: string; label: string; action: string; icon?: string }> {
  const actions: Array<{ type: string; label: string; action: string; icon?: string }> = [];

  // Navigation actions
  if (response.includes('dokument') || response.includes('document')) {
    actions.push({ type: 'navigate', label: 'Správa dokumentov', action: '/documents', icon: '📄' });
  }

  if (response.includes('rodin') || response.includes('family')) {
    actions.push({ type: 'navigate', label: 'Rodinný prehľad', action: '/family', icon: '👥' });
  }

  if (response.includes('opatrovník') || response.includes('guardian')) {
    actions.push({ type: 'navigate', label: 'Pozvať opatrovníka', action: '/family/invite', icon: '✉️' });
  }

  if (response.includes('nastavenie') || response.includes('setting')) {
    actions.push({ type: 'navigate', label: 'Nastavenia', action: '/settings', icon: '⚙️' });
  }

  if (response.includes('núdz') || response.includes('emergency')) {
    actions.push({ type: 'execute', label: 'Núdzové kontakty', action: 'show_emergency_contacts', icon: '🚨' });
  }

  // Limit to 3 most relevant actions
  return actions.slice(0, 3);
}

/**
 * Clean and format response
 */
function cleanResponse(response: string): string {
  return response
    .replace(/\n\s*\n/g, '\n\n') // Clean up excessive line breaks
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
    .replace(/\*(.*?)\*/g, '$1'); // Remove markdown italic
}