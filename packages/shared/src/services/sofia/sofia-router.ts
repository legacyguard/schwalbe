/**
 * SOFIA AI Router - Cost Optimization Engine
 * Implements intelligent routing: 80% FREE / 15% LOW COST / 5% PREMIUM
 */

export interface RouterRequest {
  message: string;
  userId?: string;
  sessionId?: string;
  context?: {
    currentPage?: string;
    userAction?: string;
    documentContext?: any;
    familyContext?: any;
  };
  metadata?: {
    timestamp?: string;
    source?: 'chat' | 'action' | 'widget';
  };
}

export interface RouterResponse {
  content: string;
  type: 'free' | 'low_cost' | 'premium';
  cost: number;
  confidence: number;
  source: 'cache' | 'knowledge_base' | 'action_buttons' | 'simple_query' | 'ai_generation';
  actions?: SofiaAction[];
  metadata?: {
    tokens_used?: number;
    model_used?: string;
    cache_hit?: boolean;
    processing_time?: number;
  };
}

export interface SofiaAction {
  type: 'navigate' | 'execute' | 'form_fill' | 'help';
  label: string;
  action: string;
  data?: any;
  icon?: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  keywords: string[];
  patterns: RegExp[];
  response: string;
  actions?: SofiaAction[];
  confidence: number;
  category: string;
  variations?: string[];
}

export interface UsageMetrics {
  totalRequests: number;
  freeRoutes: number;
  lowCostRoutes: number;
  premiumRoutes: number;
  totalCost: number;
  averageResponseTime: number;
  cacheHitRate: number;
}

/**
 * Main SOFIA Router Class
 */
export class SofiaRouter {
  private static instance: SofiaRouter;
  private knowledgeBase: KnowledgeBaseEntry[] = [];
  private responseCache: Map<string, { response: RouterResponse; timestamp: number }> = new Map();
  private usageMetrics: UsageMetrics = {
    totalRequests: 0,
    freeRoutes: 0,
    lowCostRoutes: 0,
    premiumRoutes: 0,
    totalCost: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
  };

  private constructor() {
    this.initializeKnowledgeBase();
  }

  public static getInstance(): SofiaRouter {
    if (!SofiaRouter.instance) {
      SofiaRouter.instance = new SofiaRouter();
    }
    return SofiaRouter.instance;
  }

  /**
   * Main routing logic - implements 80/15/5 cost distribution
   */
  public async route(request: RouterRequest): Promise<RouterResponse> {
    const startTime = Date.now();
    this.usageMetrics.totalRequests++;

    try {
      // 1. Check cache first (FREE - 0% cost)
      const cacheKey = this.generateCacheKey(request);
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        this.usageMetrics.freeRoutes++;
        return {
          ...cached,
          metadata: { ...cached.metadata, cache_hit: true, processing_time: Date.now() - startTime }
        };
      }

      // 2. Try action button detection (FREE - 0% cost)
      const actionResponse = this.detectActionButtons(request);
      if (actionResponse) {
        this.cacheResponse(cacheKey, actionResponse);
        this.usageMetrics.freeRoutes++;
        return actionResponse;
      }

      // 3. Check knowledge base (FREE - 0% cost)
      const knowledgeResponse = this.searchKnowledgeBase(request);
      if (knowledgeResponse) {
        this.cacheResponse(cacheKey, knowledgeResponse);
        this.usageMetrics.freeRoutes++;
        return knowledgeResponse;
      }

      // 4. Simple query classification (LOW COST - ~$0.001-0.01)
      const simpleResponse = await this.trySimpleQuery(request);
      if (simpleResponse) {
        this.cacheResponse(cacheKey, simpleResponse);
        this.usageMetrics.lowCostRoutes++;
        this.usageMetrics.totalCost += simpleResponse.cost;
        return simpleResponse;
      }

      // 5. Full AI generation (PREMIUM - ~$0.01-0.10)
      const aiResponse = await this.generateAIResponse(request);
      this.usageMetrics.premiumRoutes++;
      this.usageMetrics.totalCost += aiResponse.cost;

      // Cache premium responses longer
      this.cacheResponse(cacheKey, aiResponse, 1800000); // 30 minutes

      return aiResponse;

    } finally {
      const processingTime = Date.now() - startTime;
      this.updateMetrics(processingTime);
    }
  }

  /**
   * Initialize knowledge base with common FAQ and responses
   */
  private initializeKnowledgeBase(): void {
    this.knowledgeBase = [
      // Family Protection FAQ
      {
        id: 'family_protection_intro',
        keywords: ['family protection', 'what is', 'how works', 'protection system'],
        patterns: [/^(what|how).*(family).*(protect)/i],
        response: 'Family protection is a digital system that secures your important documents and information for future generations. It helps you organize wills, insurance policies, documents, and emergency contacts.',
        actions: [
          { type: 'navigate', label: 'Start Protection Setup', action: '/onboarding', icon: '🛡️' },
          { type: 'help', label: 'Watch Tutorial', action: 'show_tutorial', icon: '📹' }
        ],
        confidence: 0.9,
        category: 'basic_info',
        variations: ['how does family protection work', 'what is family protection for']
      },

      // Document Management
      {
        id: 'add_document',
        keywords: ['add document', 'upload', 'new document', 'document management'],
        patterns: [/^(how).*(add|upload).*(document)/i],
        response: 'You can add documents in two ways: 1) Click "Add Document" and upload a file, or 2) Use Gmail import to automatically find documents in your emails.',
        actions: [
          { type: 'navigate', label: 'Add Document', action: '/documents/add', icon: '📄' },
          { type: 'execute', label: 'Gmail Import', action: 'open_gmail_import', icon: '📧' }
        ],
        confidence: 0.95,
        category: 'document_management'
      },

      // Guardian Management
      {
        id: 'add_guardian',
        keywords: ['guardian', 'add', 'invite', 'family member'],
        patterns: [/^(how).*(add|invite).*(guardian)/i],
        response: 'Guardians are people who can access your information in emergency situations. You can invite them through "Family Management" and set specific permissions for them.',
        actions: [
          { type: 'navigate', label: 'Invite Guardian', action: '/family/invite', icon: '👥' },
          { type: 'navigate', label: 'Family Management', action: '/family', icon: '🏠' }
        ],
        confidence: 0.9,
        category: 'family_management'
      },

      // Emergency Situations
      {
        id: 'emergency_help',
        keywords: ['emergency', 'help', 'urgent', 'contact', 'crisis'],
        patterns: [/^(emergency|help|urgent)/i],
        response: 'In emergency situations, you can activate the emergency protocol or contact local emergency services. Your system is ready to provide necessary information to authorized persons.',
        actions: [
          { type: 'execute', label: 'Activate Emergency Protocol', action: 'activate_emergency', icon: '🚨' },
          { type: 'execute', label: 'Show Emergency Contacts', action: 'show_emergency_contacts', icon: '📞' }
        ],
        confidence: 0.95,
        category: 'emergency'
      },

      // Security and Privacy
      {
        id: 'security_privacy',
        keywords: ['security', 'privacy', 'encryption', 'data protection'],
        patterns: [/^(how).*(secur|privac|encrypt)/i],
        response: 'All your data is encrypted using state-of-the-art security standards. We use end-to-end encryption and comply with GDPR and local data protection laws.',
        actions: [
          { type: 'navigate', label: 'Security Settings', action: '/settings/security', icon: '🔒' },
          { type: 'help', label: 'Technical Details', action: 'show_security_details', icon: '🛡️' }
        ],
        confidence: 0.85,
        category: 'security'
      },

      // Pricing and Plans
      {
        id: 'pricing_plans',
        keywords: ['price', 'plan', 'subscription', 'cost', 'how much'],
        patterns: [/^(how\s+much|what.*cost|price|pricing)/i],
        response: 'We offer flexible pricing plans tailored to your needs. The basic plan is free and covers essential protection for small families. Premium plans include advanced features.',
        actions: [
          { type: 'navigate', label: 'View Pricing', action: '/pricing', icon: '💰' },
          { type: 'execute', label: 'Upgrade to Premium', action: 'show_upgrade_dialog', icon: '⭐' }
        ],
        confidence: 0.9,
        category: 'pricing'
      },

      // Legal and Compliance
      {
        id: 'legal_questions',
        keywords: ['legal', 'law', 'court', 'will', 'testament', 'compliance'],
        patterns: [/^(is.*legal|legal|law)/i],
        response: 'Our system complies with local laws and international standards. Documents are legally valid and can be used in official proceedings. We recommend consulting with a lawyer for complex cases.',
        actions: [
          { type: 'navigate', label: 'Legal Information', action: '/legal', icon: '⚖️' },
          { type: 'execute', label: 'Find Lawyer', action: 'find_lawyer', icon: '👨‍💼' }
        ],
        confidence: 0.8,
        category: 'legal'
      }
    ];
  }

  /**
   * Detect if request can be handled by action buttons
   */
  private detectActionButtons(request: RouterRequest): RouterResponse | null {
    const message = request.message.toLowerCase();

    // Navigation intents
    if (message.includes('want to') || message.includes('need to') || message.includes('i want')) {
      const actions: SofiaAction[] = [];

      if (message.includes('add')) {
        actions.push(
          { type: 'navigate', label: 'Add Document', action: '/documents/add', icon: '📄' },
          { type: 'navigate', label: 'Invite Family Member', action: '/family/invite', icon: '👥' }
        );
      }

      if (message.includes('view') || message.includes('see') || message.includes('show')) {
        actions.push(
          { type: 'navigate', label: 'My Documents', action: '/documents', icon: '📁' },
          { type: 'navigate', label: 'Family Overview', action: '/family', icon: '🏠' },
          { type: 'navigate', label: 'Analytics', action: '/analytics', icon: '📊' }
        );
      }

      if (actions.length > 0) {
        return {
          content: 'Here are the most common actions you might want to take. You can click a button or tell me more specifically what you need.',
          type: 'free',
          cost: 0,
          confidence: 0.8,
          source: 'action_buttons',
          actions,
          metadata: { processing_time: 0 }
        };
      }
    }

    return null;
  }

  /**
   * Search knowledge base for matching responses
   */
  private searchKnowledgeBase(request: RouterRequest): RouterResponse | null {
    const message = request.message.toLowerCase();
    let bestMatch: KnowledgeBaseEntry | null = null;
    let bestScore = 0;

    for (const entry of this.knowledgeBase) {
      let score = 0;

      // Check keyword matches
      for (const keyword of entry.keywords) {
        if (message.includes(keyword.toLowerCase())) {
          score += 0.3;
        }
      }

      // Check pattern matches
      for (const pattern of entry.patterns) {
        if (pattern.test(message)) {
          score += 0.5;
        }
      }

      // Check variations
      if (entry.variations) {
        for (const variation of entry.variations) {
          if (message.includes(variation.toLowerCase())) {
            score += 0.2;
          }
        }
      }

      if (score > bestScore && score >= 0.3) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    if (bestMatch) {
      return {
        content: bestMatch.response,
        type: 'free',
        cost: 0,
        confidence: Math.min(bestScore, bestMatch.confidence),
        source: 'knowledge_base',
        actions: bestMatch.actions,
        metadata: { processing_time: 0 }
      };
    }

    return null;
  }

  /**
   * Try simple query processing (LOW COST)
   */
  private async trySimpleQuery(request: RouterRequest): Promise<RouterResponse | null> {
    // Check if request is simple enough for low-cost processing
    const message = request.message;
    const isSimple = this.isSimpleQuery(message);

    if (!isSimple) {
      return null;
    }

    try {
      // Call optimized OpenAI endpoint with token limits
      const response = await fetch('/api/sofia/simple-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: message,
          context: request.context,
          model: 'gpt-3.5-turbo',
          max_tokens: 150, // Strict token limit
          temperature: 0.3, // Lower temperature for consistent, concise responses
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      return {
        content: data.response || 'Sorry, I cannot answer this question. Please try formulating it more specifically.',
        type: 'low_cost',
        cost: this.calculateCost(data.tokens_used || 150, 'gpt-3.5-turbo'),
        confidence: data.confidence || 0.6,
        source: 'simple_query',
        metadata: {
          tokens_used: data.tokens_used || 150,
          model_used: 'gpt-3.5-turbo',
          processing_time: 0
        }
      };
    } catch (error) {
      console.error('Simple query failed:', error);
      return null;
    }
  }

  /**
   * Full AI generation (PREMIUM)
   */
  private async generateAIResponse(request: RouterRequest): Promise<RouterResponse> {
    try {
      // Select optimal model based on complexity
      const model = this.selectOptimalModel(request);
      const maxTokens = this.calculateMaxTokens(request, model);

      const response = await fetch('/api/sofia/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: request.message,
          context: request.context,
          model: model,
          max_tokens: maxTokens,
          temperature: 0.7, // Balanced creativity and consistency
          presence_penalty: 0.1, // Slight penalty for repetition
        }),
      });

      if (!response.ok) {
        throw new Error('AI generation failed');
      }

      const data = await response.json();

      return {
        content: data.response || 'I apologize, I cannot process your request at the moment. Please try again later.',
        type: 'premium',
        cost: this.calculateCost(data.tokens_used || maxTokens, model),
        confidence: data.confidence || 0.8,
        source: 'ai_generation',
        metadata: {
          tokens_used: data.tokens_used || maxTokens,
          model_used: model,
          processing_time: 0
        }
      };
    } catch (error) {
      console.error('AI generation failed:', error);

      // Fallback response
      return {
        content: 'Sorry, we are experiencing technical issues. You can try using one of the default actions or contact us later.',
        type: 'free',
        cost: 0,
        confidence: 0.3,
        source: 'ai_generation',
        actions: [
          { type: 'navigate', label: 'Home', action: '/', icon: '🏠' },
          { type: 'help', label: 'Help', action: 'show_help', icon: '❓' }
        ],
        metadata: { processing_time: 0 }
      };
    }
  }

  /**
   * Determine if query is simple enough for low-cost processing
   */
  private isSimpleQuery(message: string): boolean {
    const simple_indicators = [
      // Short questions
      message.length < 50,
      // FAQ patterns
      /^(čo|ako|kde|kedy|prečo|who|what|where|when|why|how)/i.test(message),
      // Single word queries
      message.split(' ').length <= 3,
      // Known simple topics
      /^(cena|price|kontakt|contact|help|pomoc)$/i.test(message.trim())
    ];

    return simple_indicators.some(Boolean);
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(request: RouterRequest): string {
    const normalizedMessage = request.message.toLowerCase().trim();
    const context = request.context?.currentPage || '';
    return `${normalizedMessage}:${context}`;
  }

  /**
   * Get cached response
   */
  private getCachedResponse(key: string): RouterResponse | null {
    const cached = this.responseCache.get(key);
    if (!cached) return null;

    // Check if cache is still valid (default 10 minutes)
    const now = Date.now();
    const maxAge = 600000; // 10 minutes

    if (now - cached.timestamp > maxAge) {
      this.responseCache.delete(key);
      return null;
    }

    this.usageMetrics.cacheHitRate =
      (this.usageMetrics.cacheHitRate * (this.usageMetrics.totalRequests - 1) + 1) /
      this.usageMetrics.totalRequests;

    return cached.response;
  }

  /**
   * Cache response
   */
  private cacheResponse(key: string, response: RouterResponse, maxAge = 600000): void {
    this.responseCache.set(key, {
      response,
      timestamp: Date.now()
    });

    // Clean old cache entries periodically
    if (this.responseCache.size > 1000) {
      this.cleanCache();
    }
  }

  /**
   * Clean old cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    const maxAge = 600000; // 10 minutes

    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.responseCache.delete(key);
      }
    }
  }

  /**
   * Update usage metrics
   */
  private updateMetrics(processingTime: number): void {
    const total = this.usageMetrics.totalRequests;
    this.usageMetrics.averageResponseTime =
      (this.usageMetrics.averageResponseTime * (total - 1) + processingTime) / total;
  }

  /**
   * Get current usage metrics
   */
  public getMetrics(): UsageMetrics & { costDistribution: { free: number; lowCost: number; premium: number } } {
    const total = this.usageMetrics.totalRequests || 1;

    return {
      ...this.usageMetrics,
      costDistribution: {
        free: Math.round((this.usageMetrics.freeRoutes / total) * 100),
        lowCost: Math.round((this.usageMetrics.lowCostRoutes / total) * 100),
        premium: Math.round((this.usageMetrics.premiumRoutes / total) * 100),
      }
    };
  }

  /**
   * Reset metrics (for testing or new sessions)
   */
  public resetMetrics(): void {
    this.usageMetrics = {
      totalRequests: 0,
      freeRoutes: 0,
      lowCostRoutes: 0,
      premiumRoutes: 0,
      totalCost: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
    };
  }

  /**
   * Add knowledge base entry dynamically
   */
  public addKnowledgeBaseEntry(entry: KnowledgeBaseEntry): void {
    this.knowledgeBase.push(entry);
  }

  /**
   * Clear cache manually
   */
  public clearCache(): void {
    this.responseCache.clear();
  }

  /**
   * Select optimal model based on request complexity
   */
  private selectOptimalModel(request: RouterRequest): string {
    const message = request.message;
    const wordCount = message.split(' ').length;
    const hasContext = Boolean(request.context?.documentContext || request.context?.familyContext);
    const isComplex = this.isComplexQuery(message);

    // Use gpt-4o-mini for most cases (cost-effective)
    if (wordCount <= 20 && !hasContext && !isComplex) {
      return 'gpt-3.5-turbo';
    }

    // Use gpt-4o-mini for medium complexity
    if (wordCount <= 50 || hasContext) {
      return 'gpt-4o-mini';
    }

    // Use gpt-4o only for highly complex queries
    if (isComplex || wordCount > 50) {
      return 'gpt-4o-mini'; // Still use mini version for cost optimization
    }

    return 'gpt-4o-mini'; // Default to cost-effective model
  }

  /**
   * Calculate optimal max tokens based on request and model
   */
  private calculateMaxTokens(request: RouterRequest, model: string): number {
    const message = request.message;
    const inputTokens = Math.ceil(message.length / 4); // Rough estimate

    // Conservative token limits for cost control
    const baseTokens = {
      'gpt-3.5-turbo': 150,
      'gpt-4o-mini': 250,
      'gpt-4o': 300,
    };

    let maxTokens = baseTokens[model as keyof typeof baseTokens] || 200;

    // Adjust based on input length
    if (inputTokens > 100) {
      maxTokens = Math.min(maxTokens + 100, 400);
    }

    // Adjust based on context
    if (request.context?.documentContext || request.context?.familyContext) {
      maxTokens = Math.min(maxTokens + 50, 350);
    }

    return maxTokens;
  }

  /**
   * Calculate cost based on tokens and model
   */
  private calculateCost(tokens: number, model: string): number {
    // OpenAI pricing (approximate, as of 2024)
    const pricing = {
      'gpt-3.5-turbo': {
        input: 0.0015 / 1000,  // $0.0015 per 1K tokens
        output: 0.002 / 1000,  // $0.002 per 1K tokens
      },
      'gpt-4o-mini': {
        input: 0.00015 / 1000, // $0.00015 per 1K tokens
        output: 0.0006 / 1000, // $0.0006 per 1K tokens
      },
      'gpt-4o': {
        input: 0.03 / 1000,    // $0.03 per 1K tokens
        output: 0.06 / 1000,   // $0.06 per 1K tokens
      },
    };

    const modelPricing = pricing[model as keyof typeof pricing];
    if (!modelPricing) {
      return 0.001; // Default fallback cost
    }

    // Estimate input/output split (roughly 30% input, 70% output)
    const inputTokens = Math.floor(tokens * 0.3);
    const outputTokens = Math.floor(tokens * 0.7);

    return (inputTokens * modelPricing.input) + (outputTokens * modelPricing.output);
  }

  /**
   * Check if query is complex and requires advanced processing
   */
  private isComplexQuery(message: string): boolean {
    const complexIndicators = [
      // Multi-part questions
      /\?.*\?/,
      // Technical terms
      /\b(implement|algorithm|database|encryption|security|integration)\b/i,
      // Long conditional sentences
      /\b(if|when|unless|provided|assuming)\b.*\b(then|should|would|could)\b/i,
      // Multiple topics
      message.split(/\band\b|\bor\b/i).length > 2,
      // Length-based complexity
      message.length > 200,
    ];

    return complexIndicators.some(indicator =>
      typeof indicator === 'boolean' ? indicator : indicator.test(message)
    );
  }
}

export const sofiaRouter = SofiaRouter.getInstance();