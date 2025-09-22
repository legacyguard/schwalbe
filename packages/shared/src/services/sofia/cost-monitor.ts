/**
 * SOFIA AI Cost Monitor
 * Tracks and optimizes AI usage costs with alerts and budgets
 */

export interface CostEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  requestType: 'free' | 'low_cost' | 'premium';
  model: string;
  tokensUsed: number;
  cost: number;
  route: string;
  confidence: number;
  cacheHit: boolean;
  processingTime: number;
  context?: {
    page?: string;
    feature?: string;
    userType?: string;
  };
}

export interface CostBudget {
  id: string;
  name: string;
  period: 'daily' | 'weekly' | 'monthly';
  limit: number;
  current: number;
  alertThresholds: number[]; // e.g., [0.5, 0.8, 0.9] for 50%, 80%, 90%
  enabled: boolean;
  notificationChannels: ('email' | 'dashboard' | 'slack')[];
}

export interface CostAlert {
  id: string;
  budgetId: string;
  threshold: number;
  triggered: Date;
  acknowledged: boolean;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface CostAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalCost: number;
    totalRequests: number;
    averageCostPerRequest: number;
    costByType: {
      free: { count: number; cost: number };
      lowCost: { count: number; cost: number };
      premium: { count: number; cost: number };
    };
    costByModel: Record<string, { count: number; cost: number; tokens: number }>;
    costByRoute: Record<string, { count: number; cost: number }>;
    cacheEfficiency: {
      hitRate: number;
      costSaved: number;
    };
  };
  trends: {
    daily: Array<{ date: string; cost: number; requests: number }>;
    hourly: Array<{ hour: number; cost: number; requests: number }>;
  };
  topCostUsers: Array<{ userId: string; cost: number; requests: number }>;
  recommendations: string[];
}

/**
 * Cost Monitor Class
 */
export class CostMonitor {
  private static instance: CostMonitor;
  private entries: CostEntry[] = [];
  private budgets: CostBudget[] = [];
  private alerts: CostAlert[] = [];
  private maxEntries = 10000; // Keep last 10k entries in memory

  private constructor() {
    this.initializeDefaultBudgets();
    this.startPeriodicCleanup();
  }

  public static getInstance(): CostMonitor {
    if (!CostMonitor.instance) {
      CostMonitor.instance = new CostMonitor();
    }
    return CostMonitor.instance;
  }

  /**
   * Record a cost entry
   */
  public recordCost(entry: Omit<CostEntry, 'id' | 'timestamp'>): void {
    const costEntry: CostEntry = {
      id: `cost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...entry,
    };

    this.entries.push(costEntry);

    // Maintain memory limit
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }

    // Update budgets
    this.updateBudgets(costEntry);

    // Check for alerts
    this.checkAlerts();

    // Store to persistent storage (if available)
    this.persistEntry(costEntry);
  }

  /**
   * Get cost analytics for a period
   */
  public getAnalytics(
    startDate: Date,
    endDate: Date,
    filters?: {
      userId?: string;
      requestType?: string;
      route?: string;
    }
  ): CostAnalytics {
    let filteredEntries = this.entries.filter(
      entry => entry.timestamp >= startDate && entry.timestamp <= endDate
    );

    // Apply filters
    if (filters?.userId) {
      filteredEntries = filteredEntries.filter(e => e.userId === filters.userId);
    }
    if (filters?.requestType) {
      filteredEntries = filteredEntries.filter(e => e.requestType === filters.requestType);
    }
    if (filters?.route) {
      filteredEntries = filteredEntries.filter(e => e.route === filters.route);
    }

    const totalCost = filteredEntries.reduce((sum, e) => sum + e.cost, 0);
    const totalRequests = filteredEntries.length;
    const averageCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;

    // Cost by type
    const costByType = {
      free: { count: 0, cost: 0 },
      lowCost: { count: 0, cost: 0 },
      premium: { count: 0, cost: 0 },
    };

    filteredEntries.forEach(entry => {
      if (entry.requestType === 'free') {
        costByType.free.count++;
        costByType.free.cost += entry.cost;
      } else if (entry.requestType === 'low_cost') {
        costByType.lowCost.count++;
        costByType.lowCost.cost += entry.cost;
      } else if (entry.requestType === 'premium') {
        costByType.premium.count++;
        costByType.premium.cost += entry.cost;
      }
    });

    // Cost by model
    const costByModel: Record<string, { count: number; cost: number; tokens: number }> = {};
    filteredEntries.forEach(entry => {
      if (!costByModel[entry.model]) {
        costByModel[entry.model] = { count: 0, cost: 0, tokens: 0 };
      }
      costByModel[entry.model].count++;
      costByModel[entry.model].cost += entry.cost;
      costByModel[entry.model].tokens += entry.tokensUsed;
    });

    // Cost by route
    const costByRoute: Record<string, { count: number; cost: number }> = {};
    filteredEntries.forEach(entry => {
      if (!costByRoute[entry.route]) {
        costByRoute[entry.route] = { count: 0, cost: 0 };
      }
      costByRoute[entry.route].count++;
      costByRoute[entry.route].cost += entry.cost;
    });

    // Cache efficiency
    const cacheHits = filteredEntries.filter(e => e.cacheHit).length;
    const cacheHitRate = totalRequests > 0 ? cacheHits / totalRequests : 0;
    const avgCostWithoutCache = filteredEntries
      .filter(e => !e.cacheHit)
      .reduce((sum, e) => sum + e.cost, 0) / Math.max(1, filteredEntries.filter(e => !e.cacheHit).length);
    const costSaved = cacheHits * avgCostWithoutCache;

    // Daily trends
    const dailyTrends = this.calculateDailyTrends(filteredEntries, startDate, endDate);

    // Hourly trends
    const hourlyTrends = this.calculateHourlyTrends(filteredEntries);

    // Top cost users
    const userCosts: Record<string, { cost: number; requests: number }> = {};
    filteredEntries.forEach(entry => {
      if (entry.userId) {
        if (!userCosts[entry.userId]) {
          userCosts[entry.userId] = { cost: 0, requests: 0 };
        }
        userCosts[entry.userId].cost += entry.cost;
        userCosts[entry.userId].requests++;
      }
    });

    const topCostUsers = Object.entries(userCosts)
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      totalCost,
      totalRequests,
      costByType,
      cacheHitRate,
      costByModel,
    });

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalCost,
        totalRequests,
        averageCostPerRequest,
        costByType,
        costByModel,
        costByRoute,
        cacheEfficiency: {
          hitRate: cacheHitRate,
          costSaved,
        },
      },
      trends: {
        daily: dailyTrends,
        hourly: hourlyTrends,
      },
      topCostUsers,
      recommendations,
    };
  }

  /**
   * Create a cost budget
   */
  public createBudget(budget: Omit<CostBudget, 'id' | 'current'>): CostBudget {
    const newBudget: CostBudget = {
      id: `budget_${Date.now()}`,
      current: 0,
      ...budget,
    };

    this.budgets.push(newBudget);
    return newBudget;
  }

  /**
   * Get current budgets
   */
  public getBudgets(): CostBudget[] {
    return [...this.budgets];
  }

  /**
   * Get active alerts
   */
  public getAlerts(): CostAlert[] {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Get optimization suggestions
   */
  public getOptimizationSuggestions(): Array<{
    type: 'cache' | 'routing' | 'model' | 'budget';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    estimatedSavings: number;
    action: string;
  }> {
    const analytics = this.getAnalytics(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      new Date()
    );

    const suggestions = [];

    // Cache optimization
    if (analytics.summary.cacheEfficiency.hitRate < 0.5) {
      suggestions.push({
        type: 'cache' as const,
        priority: 'high' as const,
        title: 'Zlepšiť cache efektivitu',
        description: `Cache hit rate je len ${Math.round(analytics.summary.cacheEfficiency.hitRate * 100)}%. Zvýšením cache môžete ušetriť významné náklady.`,
        estimatedSavings: analytics.summary.cacheEfficiency.costSaved * 2,
        action: 'increase_cache_duration',
      });
    }

    // Routing optimization
    const premiumPercentage = (analytics.summary.costByType.premium.count / analytics.summary.totalRequests) * 100;
    if (premiumPercentage > 10) {
      suggestions.push({
        type: 'routing' as const,
        priority: 'high' as const,
        title: 'Optimalizovať routing',
        description: `${Math.round(premiumPercentage)}% požiadaviek používa premium AI. Cieľom je max 5%.`,
        estimatedSavings: analytics.summary.costByType.premium.cost * 0.5,
        action: 'improve_knowledge_base',
      });
    }

    // Model optimization
    const gpt4Cost = analytics.summary.costByModel['gpt-4']?.cost || 0;
    if (gpt4Cost > analytics.summary.totalCost * 0.1) {
      suggestions.push({
        type: 'model' as const,
        priority: 'medium' as const,
        title: 'Migrovať z GPT-4',
        description: 'GPT-4 tvorí významnú časť nákladov. Zvážte prechod na gpt-4o-mini pre vhodné prípady.',
        estimatedSavings: gpt4Cost * 0.8,
        action: 'migrate_to_gpt4_mini',
      });
    }

    return suggestions.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
  }

  /**
   * Initialize default budgets
   */
  private initializeDefaultBudgets(): void {
    this.budgets = [
      {
        id: 'daily_budget',
        name: 'Denný limit',
        period: 'daily',
        limit: 5.0, // $5 per day
        current: 0,
        alertThresholds: [0.5, 0.8, 0.9],
        enabled: true,
        notificationChannels: ['dashboard'],
      },
      {
        id: 'monthly_budget',
        name: 'Mesačný limit',
        period: 'monthly',
        limit: 100.0, // $100 per month
        current: 0,
        alertThresholds: [0.7, 0.9, 0.95],
        enabled: true,
        notificationChannels: ['dashboard', 'email'],
      },
    ];
  }

  /**
   * Update budget tracking
   */
  private updateBudgets(entry: CostEntry): void {
    const now = new Date();

    this.budgets.forEach(budget => {
      if (!budget.enabled) return;

      // Reset budget if period has passed
      const shouldReset = this.shouldResetBudget(budget, now);
      if (shouldReset) {
        budget.current = 0;
      }

      // Add current cost
      budget.current += entry.cost;
    });
  }

  /**
   * Check if budget should be reset
   */
  private shouldResetBudget(budget: CostBudget, now: Date): boolean {
    // This is simplified - in production, you'd track last reset time
    const today = now.toDateString();
    const key = `budget_${budget.id}_last_reset`;
    const lastReset = localStorage.getItem(key);

    if (budget.period === 'daily') {
      if (lastReset !== today) {
        localStorage.setItem(key, today);
        return true;
      }
    } else if (budget.period === 'monthly') {
      const monthYear = `${now.getFullYear()}-${now.getMonth()}`;
      if (lastReset !== monthYear) {
        localStorage.setItem(key, monthYear);
        return true;
      }
    }

    return false;
  }

  /**
   * Check for budget alerts
   */
  private checkAlerts(): void {
    this.budgets.forEach(budget => {
      if (!budget.enabled || budget.limit === 0) return;

      const percentage = budget.current / budget.limit;

      budget.alertThresholds.forEach(threshold => {
        if (percentage >= threshold) {
          // Check if alert already exists
          const existingAlert = this.alerts.find(
            alert => alert.budgetId === budget.id &&
                    alert.threshold === threshold &&
                    !alert.acknowledged
          );

          if (!existingAlert) {
            const alert: CostAlert = {
              id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              budgetId: budget.id,
              threshold,
              triggered: new Date(),
              acknowledged: false,
              message: `Budget "${budget.name}" dosiahol ${Math.round(percentage * 100)}% limitu ($${budget.current.toFixed(2)} / $${budget.limit})`,
              severity: threshold >= 0.9 ? 'critical' : threshold >= 0.8 ? 'warning' : 'info',
            };

            this.alerts.push(alert);

            // Trigger notifications
            this.triggerNotifications(alert, budget);
          }
        }
      });
    });
  }

  /**
   * Trigger notifications for alerts
   */
  private triggerNotifications(alert: CostAlert, budget: CostBudget): void {
    budget.notificationChannels.forEach(channel => {
      switch (channel) {
        case 'dashboard':
          // Trigger dashboard notification
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('sofia-cost-alert', {
              detail: { alert, budget }
            });
            window.dispatchEvent(event);
          }
          break;

        case 'email':
          // Send email notification (would integrate with email service)
          console.log('Email alert:', alert.message);
          break;

        case 'slack':
          // Send Slack notification (would integrate with Slack API)
          console.log('Slack alert:', alert.message);
          break;
      }
    });
  }

  /**
   * Calculate daily trends
   */
  private calculateDailyTrends(
    entries: CostEntry[],
    startDate: Date,
    endDate: Date
  ): Array<{ date: string; cost: number; requests: number }> {
    const days: Record<string, { cost: number; requests: number }> = {};

    // Initialize all days in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      days[dateStr] = { cost: 0, requests: 0 };
    }

    // Aggregate entries by day
    entries.forEach(entry => {
      const dateStr = entry.timestamp.toISOString().split('T')[0];
      if (days[dateStr]) {
        days[dateStr].cost += entry.cost;
        days[dateStr].requests++;
      }
    });

    return Object.entries(days).map(([date, data]) => ({ date, ...data }));
  }

  /**
   * Calculate hourly trends
   */
  private calculateHourlyTrends(
    entries: CostEntry[]
  ): Array<{ hour: number; cost: number; requests: number }> {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      cost: 0,
      requests: 0,
    }));

    entries.forEach(entry => {
      const hour = entry.timestamp.getHours();
      hours[hour].cost += entry.cost;
      hours[hour].requests++;
    });

    return hours;
  }

  /**
   * Generate recommendations based on analytics
   */
  private generateRecommendations(data: {
    totalCost: number;
    totalRequests: number;
    costByType: any;
    cacheHitRate: number;
    costByModel: any;
  }): string[] {
    const recommendations = [];

    // Cache recommendations
    if (data.cacheHitRate < 0.6) {
      recommendations.push('Zvýšte cache hit rate implementáciou dlhšieho cache TTL pre často kladené otázky');
    }

    // Routing recommendations
    const premiumRate = data.costByType.premium.count / data.totalRequests;
    if (premiumRate > 0.1) {
      recommendations.push('Rozšírte knowledge base pre zníženie premium AI využitia pod 5%');
    }

    // Model recommendations
    if (data.costByModel['gpt-4']) {
      recommendations.push('Migrácia z GPT-4 na gpt-4o-mini môže ušetriť až 90% nákladov');
    }

    // Cost efficiency
    const avgCost = data.totalCost / data.totalRequests;
    if (avgCost > 0.01) {
      recommendations.push('Implementujte action buttons pre zníženie free-form promptov');
    }

    return recommendations;
  }

  /**
   * Persist entry to storage
   */
  private persistEntry(entry: CostEntry): void {
    // In production, this would save to database
    try {
      const key = `sofia_cost_${entry.timestamp.toISOString().split('T')[0]}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(entry);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.warn('Failed to persist cost entry:', error);
    }
  }

  /**
   * Start periodic cleanup
   */
  private startPeriodicCleanup(): void {
    // Clean up old alerts every hour
    setInterval(() => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      this.alerts = this.alerts.filter(alert => alert.triggered > oneWeekAgo);
    }, 60 * 60 * 1000);
  }

  /**
   * Export analytics data
   */
  public exportAnalytics(format: 'json' | 'csv', startDate: Date, endDate: Date): string {
    const analytics = this.getAnalytics(startDate, endDate);

    if (format === 'json') {
      return JSON.stringify(analytics, null, 2);
    } else {
      // CSV export
      const entries = this.entries.filter(
        e => e.timestamp >= startDate && e.timestamp <= endDate
      );

      const csvHeaders = [
        'timestamp', 'userId', 'requestType', 'model', 'tokensUsed',
        'cost', 'route', 'confidence', 'cacheHit', 'processingTime'
      ];

      const csvRows = entries.map(entry => [
        entry.timestamp.toISOString(),
        entry.userId || '',
        entry.requestType,
        entry.model,
        entry.tokensUsed,
        entry.cost,
        entry.route,
        entry.confidence,
        entry.cacheHit,
        entry.processingTime,
      ]);

      return [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
    }
  }
}

export const costMonitor = CostMonitor.getInstance();