/**
 * SOFIA AI Model Optimizer
 * Advanced cost optimization and model selection system
 */

export interface ModelConfig {
  name: string;
  maxTokens: number;
  costPerInputToken: number;
  costPerOutputToken: number;
  capabilities: ModelCapability[];
  avgResponseTime: number; // milliseconds
  qualityScore: number; // 1-10
}

export interface ModelCapability {
  type: 'general_qa' | 'document_analysis' | 'family_guidance' | 'legal_advice' | 'emergency' | 'technical';
  proficiency: number; // 1-10
}

export interface OptimizationStrategy {
  strategy: 'cost_first' | 'quality_first' | 'balanced' | 'speed_first';
  maxCostPerRequest: number;
  minQualityThreshold: number;
  maxResponseTime: number;
}

export interface OptimizationResult {
  selectedModel: string;
  maxTokens: number;
  estimatedCost: number;
  estimatedQuality: number;
  estimatedResponseTime: number;
  reasoning: string;
}

/**
 * SOFIA Model Optimizer Class
 */
export class SofiaModelOptimizer {
  private static instance: SofiaModelOptimizer;
  private models: ModelConfig[] = [];
  private usageHistory: Map<string, { cost: number; quality: number; responseTime: number; timestamp: number }[]> = new Map();

  private constructor() {
    this.initializeModels();
  }

  public static getInstance(): SofiaModelOptimizer {
    if (!SofiaModelOptimizer.instance) {
      SofiaModelOptimizer.instance = new SofiaModelOptimizer();
    }
    return SofiaModelOptimizer.instance;
  }

  /**
   * Initialize available models with their configurations
   */
  private initializeModels(): void {
    this.models = [
      {
        name: 'gpt-3.5-turbo',
        maxTokens: 4096,
        costPerInputToken: 0.0015 / 1000,
        costPerOutputToken: 0.002 / 1000,
        capabilities: [
          { type: 'general_qa', proficiency: 8 },
          { type: 'family_guidance', proficiency: 7 },
          { type: 'document_analysis', proficiency: 6 },
          { type: 'emergency', proficiency: 8 },
          { type: 'technical', proficiency: 6 }
        ],
        avgResponseTime: 1500,
        qualityScore: 7
      },
      {
        name: 'gpt-4o-mini',
        maxTokens: 128000,
        costPerInputToken: 0.00015 / 1000,
        costPerOutputToken: 0.0006 / 1000,
        capabilities: [
          { type: 'general_qa', proficiency: 9 },
          { type: 'family_guidance', proficiency: 9 },
          { type: 'document_analysis', proficiency: 8 },
          { type: 'legal_advice', proficiency: 8 },
          { type: 'emergency', proficiency: 9 },
          { type: 'technical', proficiency: 8 }
        ],
        avgResponseTime: 2000,
        qualityScore: 9
      },
      {
        name: 'gpt-4o',
        maxTokens: 128000,
        costPerInputToken: 0.03 / 1000,
        costPerOutputToken: 0.06 / 1000,
        capabilities: [
          { type: 'general_qa', proficiency: 10 },
          { type: 'family_guidance', proficiency: 10 },
          { type: 'document_analysis', proficiency: 10 },
          { type: 'legal_advice', proficiency: 10 },
          { type: 'emergency', proficiency: 10 },
          { type: 'technical', proficiency: 10 }
        ],
        avgResponseTime: 3000,
        qualityScore: 10
      }
    ];
  }

  /**
   * Optimize model selection based on request characteristics
   */
  public optimize(
    request: {
      message: string;
      context?: any;
      requiredCapabilities?: ModelCapability['type'][];
      priority?: 'cost' | 'quality' | 'speed';
    },
    strategy: OptimizationStrategy = {
      strategy: 'cost_first',
      maxCostPerRequest: 0.01,
      minQualityThreshold: 7,
      maxResponseTime: 5000
    }
  ): OptimizationResult {

    const inputTokens = this.estimateTokens(request.message);
    const outputTokens = this.estimateOutputTokens(request);
    const totalTokens = inputTokens + outputTokens;

    // Filter models by capabilities
    let candidateModels = this.models;
    if (request.requiredCapabilities) {
      candidateModels = this.filterByCapabilities(candidateModels, request.requiredCapabilities);
    }

    // Filter by constraints
    candidateModels = candidateModels.filter(model => {
      const estimatedCost = this.calculateCost(inputTokens, outputTokens, model);
      return estimatedCost <= strategy.maxCostPerRequest &&
             model.qualityScore >= strategy.minQualityThreshold &&
             model.avgResponseTime <= strategy.maxResponseTime;
    });

    if (candidateModels.length === 0) {
      // Fallback to most cost-effective model
      const fallbackModel = this.models.find(m => m.name === 'gpt-4o-mini') || this.models[0];
      return this.createResult(fallbackModel, Math.min(totalTokens, 200), inputTokens, outputTokens, 'Fallback: constraints too strict');
    }

    // Score models based on strategy
    const scoredModels = candidateModels.map(model => {
      const cost = this.calculateCost(inputTokens, outputTokens, model);
      const quality = model.qualityScore;
      const speed = 5000 / model.avgResponseTime; // Higher is better

      let score = 0;
      switch (strategy.strategy) {
        case 'cost_first':
          score = (1 / cost) * 0.6 + quality * 0.3 + speed * 0.1;
          break;
        case 'quality_first':
          score = quality * 0.6 + (1 / cost) * 0.2 + speed * 0.2;
          break;
        case 'speed_first':
          score = speed * 0.6 + quality * 0.2 + (1 / cost) * 0.2;
          break;
        case 'balanced':
        default:
          score = quality * 0.4 + (1 / cost) * 0.4 + speed * 0.2;
          break;
      }

      return { model, score, cost, quality, speed };
    });

    // Select best model
    const bestModel = scoredModels.sort((a, b) => b.score - a.score)[0];
    const optimalTokens = this.calculateOptimalTokens(totalTokens, bestModel.model, strategy);

    return this.createResult(
      bestModel.model,
      optimalTokens,
      inputTokens,
      outputTokens,
      `Selected ${bestModel.model.name} (score: ${bestModel.score.toFixed(2)}, strategy: ${strategy.strategy})`
    );
  }

  /**
   * Filter models by required capabilities
   */
  private filterByCapabilities(models: ModelConfig[], requiredCapabilities: ModelCapability['type'][]): ModelConfig[] {
    return models.filter(model => {
      return requiredCapabilities.every(reqCap => {
        const modelCap = model.capabilities.find(cap => cap.type === reqCap);
        return modelCap && modelCap.proficiency >= 7; // Minimum proficiency threshold
      });
    });
  }

  /**
   * Estimate input tokens from message
   */
  private estimateTokens(message: string): number {
    // Rough estimate: 1 token ≈ 4 characters for English/Slovak
    return Math.ceil(message.length / 4);
  }

  /**
   * Estimate output tokens based on request type
   */
  private estimateOutputTokens(request: { message: string; context?: any }): number {
    const messageLength = request.message.length;
    const hasContext = Boolean(request.context);

    // Base output tokens based on input complexity
    let outputTokens = Math.min(Math.max(messageLength / 8, 50), 300);

    // Adjust for context
    if (hasContext) {
      outputTokens += 50;
    }

    // Adjust for question types
    const message = request.message.toLowerCase();
    if (message.includes('explain') || message.includes('describe') || message.includes('vysvetli')) {
      outputTokens *= 1.5;
    }
    if (message.includes('list') || message.includes('enumerate') || message.includes('zoznam')) {
      outputTokens *= 1.3;
    }
    if (message.includes('short') || message.includes('brief') || message.includes('krátko')) {
      outputTokens *= 0.7;
    }

    return Math.round(outputTokens);
  }

  /**
   * Calculate cost for given token usage and model
   */
  private calculateCost(inputTokens: number, outputTokens: number, model: ModelConfig): number {
    return (inputTokens * model.costPerInputToken) + (outputTokens * model.costPerOutputToken);
  }

  /**
   * Calculate optimal token limit based on model and strategy
   */
  private calculateOptimalTokens(totalTokens: number, model: ModelConfig, strategy: OptimizationStrategy): number {
    let optimalTokens = totalTokens;

    // Apply cost constraints
    if (strategy.strategy === 'cost_first') {
      optimalTokens = Math.min(optimalTokens, 250); // Conservative limit for cost control
    }

    // Ensure within model limits
    optimalTokens = Math.min(optimalTokens, model.maxTokens);

    // Minimum viable response
    optimalTokens = Math.max(optimalTokens, 50);

    return optimalTokens;
  }

  /**
   * Create optimization result
   */
  private createResult(
    model: ModelConfig,
    maxTokens: number,
    inputTokens: number,
    outputTokens: number,
    reasoning: string
  ): OptimizationResult {
    return {
      selectedModel: model.name,
      maxTokens,
      estimatedCost: this.calculateCost(inputTokens, outputTokens, model),
      estimatedQuality: model.qualityScore,
      estimatedResponseTime: model.avgResponseTime,
      reasoning
    };
  }

  /**
   * Record actual usage for learning
   */
  public recordUsage(
    modelName: string,
    actualCost: number,
    qualityRating: number,
    responseTime: number
  ): void {
    if (!this.usageHistory.has(modelName)) {
      this.usageHistory.set(modelName, []);
    }

    const history = this.usageHistory.get(modelName)!;
    history.push({
      cost: actualCost,
      quality: qualityRating,
      responseTime,
      timestamp: Date.now()
    });

    // Keep only last 100 records per model
    if (history.length > 100) {
      history.shift();
    }

    // Update model performance metrics
    this.updateModelMetrics(modelName);
  }

  /**
   * Update model metrics based on usage history
   */
  private updateModelMetrics(modelName: string): void {
    const history = this.usageHistory.get(modelName);
    if (!history || history.length < 5) return; // Need minimum data

    const model = this.models.find(m => m.name === modelName);
    if (!model) return;

    // Calculate averages from recent usage
    const recent = history.slice(-20); // Last 20 uses
    const avgResponseTime = recent.reduce((sum, record) => sum + record.responseTime, 0) / recent.length;
    const avgQuality = recent.reduce((sum, record) => sum + record.quality, 0) / recent.length;

    // Update model with learned values (weighted average with original)
    model.avgResponseTime = Math.round((model.avgResponseTime * 0.7) + (avgResponseTime * 0.3));
    model.qualityScore = Math.round(((model.qualityScore * 0.8) + (avgQuality * 0.2)) * 10) / 10;
  }

  /**
   * Get usage statistics
   */
  public getUsageStats(): { [modelName: string]: { uses: number; avgCost: number; avgQuality: number; avgResponseTime: number } } {
    const stats: { [modelName: string]: { uses: number; avgCost: number; avgQuality: number; avgResponseTime: number } } = {};

    for (const [modelName, history] of this.usageHistory.entries()) {
      if (history.length === 0) continue;

      stats[modelName] = {
        uses: history.length,
        avgCost: history.reduce((sum, record) => sum + record.cost, 0) / history.length,
        avgQuality: history.reduce((sum, record) => sum + record.quality, 0) / history.length,
        avgResponseTime: history.reduce((sum, record) => sum + record.responseTime, 0) / history.length,
      };
    }

    return stats;
  }

  /**
   * Get model recommendations for specific use cases
   */
  public getRecommendations(): { [useCase: string]: string } {
    const stats = this.getUsageStats();

    // Find best models for different criteria
    const bestCost = Object.entries(stats).sort((a, b) => a[1].avgCost - b[1].avgCost)[0]?.[0] || 'gpt-4o-mini';
    const bestQuality = Object.entries(stats).sort((a, b) => b[1].avgQuality - a[1].avgQuality)[0]?.[0] || 'gpt-4o-mini';
    const bestSpeed = Object.entries(stats).sort((a, b) => a[1].avgResponseTime - b[1].avgResponseTime)[0]?.[0] || 'gpt-3.5-turbo';

    return {
      cost_optimization: bestCost,
      quality_focus: bestQuality,
      speed_priority: bestSpeed,
      general_purpose: 'gpt-4o-mini', // Best balance based on our config
    };
  }
}

export const sofiaModelOptimizer = SofiaModelOptimizer.getInstance();