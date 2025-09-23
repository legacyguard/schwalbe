/**
 * SOFIA Simple Query API Endpoint
 * Handles low-cost queries with optimized models and token limits
 */

import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { sofiaModelOptimizer } from '@/packages/shared/src/services/sofia/model-optimizer';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SimpleQueryRequest {
  query: string;
  context?: {
    currentPage?: string;
    userAction?: string;
    documentContext?: any;
    familyContext?: any;
  };
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

interface SimpleQueryResponse {
  response: string;
  confidence: number;
  tokens_used: number;
  cost: number;
  model_used: string;
  processing_time: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleQueryResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    const {
      query,
      context,
      model = 'gpt-3.5-turbo',
      max_tokens = 150,
      temperature = 0.3
    }: SimpleQueryRequest = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Optimize model selection
    const optimization = sofiaModelOptimizer.optimize(
      {
        message: query,
        context,
        priority: 'cost'
      },
      {
        strategy: 'cost_first',
        maxCostPerRequest: 0.005, // 0.5 cents max for simple queries
        minQualityThreshold: 6,
        maxResponseTime: 3000
      }
    );

    // Prepare context-aware system prompt
    const systemPrompt = createSystemPrompt(context);

    // Create optimized prompt
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: query
      }
    ];

    // Call OpenAI with optimized parameters
    const completion = await openai.chat.completions.create({
      model: optimization.selectedModel,
      messages,
      max_tokens: Math.min(optimization.maxTokens, max_tokens),
      temperature: Math.min(temperature, 0.5), // Keep low for consistency
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      top_p: 0.9,
    });

    const response = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    const processingTime = Date.now() - startTime;

    // Calculate actual cost
    const actualCost = optimization.estimatedCost;

    // Determine confidence based on response quality
    const confidence = calculateConfidence(query, response, processingTime);

    // Record usage for learning
    sofiaModelOptimizer.recordUsage(
      optimization.selectedModel,
      actualCost,
      confidence * 10, // Convert to 1-10 scale
      processingTime
    );

    const result: SimpleQueryResponse = {
      response: response.trim(),
      confidence,
      tokens_used: tokensUsed,
      cost: actualCost,
      model_used: optimization.selectedModel,
      processing_time: processingTime
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Simple query API error:', error);

    const processingTime = Date.now() - startTime;

    // Return fallback response
    res.status(200).json({
      response: 'Sorry, I cannot answer this question. Please try formulating it more specifically or use one of the default actions.',
      confidence: 0.3,
      tokens_used: 0,
      cost: 0,
      model_used: 'fallback',
      processing_time: processingTime
    });
  }
}

/**
 * Create context-aware system prompt
 */
function createSystemPrompt(context?: SimpleQueryRequest['context']): string {
  let prompt = `You are SOFIA, an AI assistant for the family protection system. Respond briefly, precisely, and in English.

Basic rules:
- Maximum 2-3 sentences
- Focus on practical advice
- If you don't know the answer, recommend a specific action
- Always be positive and supportive`;

  if (context?.currentPage) {
    prompt += `\n\nCurrent page: ${context.currentPage}`;
  }

  if (context?.documentContext) {
    prompt += `\nDocument context: User is working with family protection documents`;
  }

  if (context?.familyContext) {
    prompt += `\nFamily context: User is managing family data and guardians`;
  }

  prompt += `\n\nPrimary topics:
- Family protection and documents
- Guardians and permissions
- Emergency situations
- Legal advice (basic)
- Data security`;

  return prompt;
}

/**
 * Calculate response confidence based on various factors
 */
function calculateConfidence(query: string, response: string, processingTime: number): number {
  let confidence = 0.6; // Base confidence

  // Length-based confidence
  const queryLength = query.length;
  const responseLength = response.length;

  if (queryLength < 50 && responseLength > 20) {
    confidence += 0.2; // Good for simple questions
  }

  if (responseLength < 10) {
    confidence -= 0.3; // Too short responses are less confident
  }

  // Response quality indicators
  if (response.includes('sorry') || response.includes('cannot') || response.includes("don't know")) {
    confidence -= 0.2; // Lower confidence for uncertain responses
  }

  if (response.includes('you can') || response.includes('try') || response.includes('recommend')) {
    confidence += 0.1; // Higher confidence for actionable responses
  }

  // Processing time factor
  if (processingTime < 2000) {
    confidence += 0.1; // Fast responses are more confident
  }

  // English language bonus
  if (hasGoodEnglishStructure(response)) {
    confidence += 0.1;
  }

  // Clamp between 0.1 and 1.0
  return Math.max(0.1, Math.min(1.0, confidence));
}

/**
 * Check if response has good English language structure
 */
function hasGoodEnglishStructure(response: string): boolean {
  const englishWords = ['you can', 'document', 'family', 'protection', 'guardian', 'emergency', 'security'];
  const foundWords = englishWords.filter(word => response.toLowerCase().includes(word));
  return foundWords.length >= 1 && response.length > 15;
}