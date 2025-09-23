/**
 * SOFIA Cost Dashboard Component
 * Displays cost monitoring, usage statistics, and optimization metrics
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Zap,
  Clock,
  Sparkles,
  Target,
  Shield,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface CostMetrics {
  routing: {
    totalRequests: number;
    freeRoutes: number;
    lowCostRoutes: number;
    premiumRoutes: number;
    totalCost: number;
    averageResponseTime: number;
    cacheHitRate: number;
    costDistribution: {
      free: number;
      lowCost: number;
      premium: number;
    };
  };
  models: {
    [modelName: string]: {
      uses: number;
      avgCost: number;
      avgQuality: number;
      avgResponseTime: number;
    };
  };
  recommendations: {
    [useCase: string]: string;
  };
  budget: {
    dailySpent: number;
    weeklySpent: number;
    monthlySpent: number;
    projectedMonthlyCost: number;
    savingsFromOptimization: number;
  };
  performance: {
    responseQuality: number;
    userSatisfaction: number;
    costEfficiency: number;
    systemReliability: number;
  };
}

interface SofiaCostDashboardProps {
  className?: string;
  showDetailedMetrics?: boolean;
}

export function SofiaCostDashboard({
  className,
  showDetailedMetrics = true,
}: SofiaCostDashboardProps) {
  const [metrics, setMetrics] = useState<CostMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch metrics from API
  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sofia/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !metrics) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p>Nepodařilo se načíst metriky nákladů</p>
          <Button onClick={fetchMetrics} variant="outline" size="sm" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Skúsiť znovu
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { routing, budget, performance, recommendations } = metrics;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with main metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Mesačné náklady</p>
                <p className="text-2xl font-bold">${budget.monthlySpent.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  Projekcia: ${budget.projectedMonthlyCost.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Ušetrené náklady</p>
                <p className="text-2xl font-bold">${budget.savingsFromOptimization.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  Vďaka optimalizácii
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Bezplatné odpovede</p>
                <p className="text-2xl font-bold">{routing.costDistribution.free}%</p>
                <p className="text-xs text-muted-foreground">
                  z {routing.totalRequests} požiadaviek
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Efektivita nákladov</p>
                <p className="text-2xl font-bold">{performance.costEfficiency}%</p>
                <p className="text-xs text-muted-foreground">
                  Celkové skóre
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost distribution chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribúcia nákladov
          </CardTitle>
          <CardDescription>
            Inteligentné smerovanie zabezpečuje optimálne náklady
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  Bezplatné (Cache, KB, Actions)
                </span>
                <span className="font-semibold">{routing.costDistribution.free}%</span>
              </div>
              <Progress value={routing.costDistribution.free} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Nízke náklady (GPT-3.5)
                </span>
                <span className="font-semibold">{routing.costDistribution.lowCost}%</span>
              </div>
              <Progress value={routing.costDistribution.lowCost} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-red-600" />
                  Premium (GPT-4o)
                </span>
                <span className="font-semibold">{routing.costDistribution.premium}%</span>
              </div>
              <Progress value={routing.costDistribution.premium} className="h-2" />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Celkom požiadaviek</p>
              <p className="font-semibold">{routing.totalRequests}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Cache hit rate</p>
              <p className="font-semibold">{Math.round(routing.cacheHitRate * 100)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Priemerný čas odpovede</p>
              <p className="font-semibold">{Math.round(routing.averageResponseTime)}ms</p>
            </div>
            <div>
              <p className="text-muted-foreground">Celkové náklady</p>
              <p className="font-semibold">${routing.totalCost.toFixed(3)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Výkonnostné metriky
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Kvalita odpovedí</span>
                <div className="flex items-center gap-2">
                  <Progress value={performance.responseQuality} className="w-20 h-2" />
                  <span className="text-sm font-semibold">{performance.responseQuality}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Spokojnosť používateľov</span>
                <div className="flex items-center gap-2">
                  <Progress value={performance.userSatisfaction} className="w-20 h-2" />
                  <span className="text-sm font-semibold">{performance.userSatisfaction}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Spoľahlivosť systému</span>
                <div className="flex items-center gap-2">
                  <Progress value={performance.systemReliability} className="w-20 h-2" />
                  <span className="text-sm font-semibold">{performance.systemReliability}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Odporúčania modelov
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(recommendations).map(([useCase, model]) => (
                <div key={useCase} className="flex justify-between items-center">
                  <span className="text-sm capitalize">
                    {useCase.replace('_', ' ')}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {model}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed model statistics */}
      {showDetailedMetrics && Object.keys(metrics.models).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Štatistiky modelov</CardTitle>
            <CardDescription>
              Detailné metriky pre jednotlivé AI modely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Model</th>
                    <th className="text-right py-2">Použitia</th>
                    <th className="text-right py-2">Priem. náklady</th>
                    <th className="text-right py-2">Kvalita</th>
                    <th className="text-right py-2">Rýchlosť</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(metrics.models).map(([modelName, stats]) => (
                    <tr key={modelName} className="border-b">
                      <td className="py-2 font-medium">{modelName}</td>
                      <td className="text-right py-2">{stats.uses}</td>
                      <td className="text-right py-2">${stats.avgCost.toFixed(4)}</td>
                      <td className="text-right py-2">{stats.avgQuality.toFixed(1)}/10</td>
                      <td className="text-right py-2">{Math.round(stats.avgResponseTime)}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer with last updated */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>
          Posledná aktualizácia: {lastUpdated.toLocaleTimeString('sk-SK')}
        </span>
        <Button
          onClick={fetchMetrics}
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="h-8"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Obnoviť
        </Button>
      </div>
    </div>
  );
}