/**
 * API Route for Real User Monitoring (RUM) data
 * POST /api/analytics/rum
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

interface RUMRequest {
  metrics: Array<{
    sessionId: string;
    pageUrl: string;
    timestamp: number;
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
    pageLoadTime?: number;
    domContentLoaded?: number;
    resourceLoadTime?: number;
    jsHeapSize?: number;
    deviceMemory?: number;
    connectionType?: string;
    isMobile: boolean;
    errorCount: number;
    warningCount: number;
  }>;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RUMRequest;
    const { metrics, userId } = body;

    if (!metrics || !Array.isArray(metrics)) {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );

    // Process each metric
    const processedMetrics = metrics.map(metric => ({
      session_id: metric.sessionId,
      user_id: userId || null,
      page_url: metric.pageUrl,
      timestamp: new Date(metric.timestamp),
      lcp: metric.lcp || null,
      fid: metric.fid || null,
      cls: metric.cls || null,
      fcp: metric.fcp || null,
      ttfb: metric.ttfb || null,
      page_load_time: metric.pageLoadTime || null,
      dom_content_loaded: metric.domContentLoaded || null,
      resource_load_time: metric.resourceLoadTime || null,
      js_heap_size: metric.jsHeapSize || null,
      device_memory: metric.deviceMemory || null,
      connection_type: metric.connectionType || 'unknown',
      is_mobile: metric.isMobile,
      error_count: metric.errorCount,
      warning_count: metric.warningCount,
    }));

    // Insert metrics into database
    const { error } = await supabase
      .from('rum_metrics')
      .insert(processedMetrics);

    if (error) {
      console.error('Failed to insert RUM metrics:', error);
      return NextResponse.json(
        { error: 'Failed to store metrics' },
        { status: 500 }
      );
    }

    // Check for performance issues
    const performanceIssues = this.detectPerformanceIssues(metrics);
    if (performanceIssues.length > 0) {
      console.warn('Performance issues detected:', performanceIssues);
      
      // Alert team about critical issues
      await this.sendPerformanceAlert(performanceIssues, userId);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('RUM API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function detectPerformanceIssues(metrics: RUMRequest['metrics']): Array<{
  type: string;
  severity: 'warning' | 'error';
  value: number;
  threshold: number;
}> {
  const issues: Array<{
    type: string;
    severity: 'warning' | 'error';
    value: number;
    threshold: number;
  }> = [];

  metrics.forEach(metric => {
    // LCP (Largest Contentful Paint)
    if (metric.lcp && metric.lcp > 4000) {
      issues.push({
        type: 'LCP',
        severity: metric.lcp > 6000 ? 'error' : 'warning',
        value: metric.lcp,
        threshold: metric.lcp > 6000 ? 6000 : 4000,
      });
    }

    // FID (First Input Delay)
    if (metric.fid && metric.fid > 100) {
      issues.push({
        type: 'FID',
        severity: metric.fid > 300 ? 'error' : 'warning',
        value: metric.fid,
        threshold: metric.fid > 300 ? 300 : 100,
      });
    }

    // CLS (Cumulative Layout Shift)
    if (metric.cls && metric.cls > 0.1) {
      issues.push({
        type: 'CLS',
        severity: metric.cls > 0.25 ? 'error' : 'warning',
        value: metric.cls,
        threshold: metric.cls > 0.25 ? 0.25 : 0.1,
      });
    }

    // Page Load Time
    if (metric.pageLoadTime && metric.pageLoadTime > 3000) {
      issues.push({
        type: 'PageLoadTime',
        severity: metric.pageLoadTime > 5000 ? 'error' : 'warning',
        value: metric.pageLoadTime,
        threshold: metric.pageLoadTime > 5000 ? 5000 : 3000,
      });
    }

    // Error rate
    if (metric.errorCount > 5) {
      issues.push({
        type: 'ErrorRate',
        severity: metric.errorCount > 10 ? 'error' : 'warning',
        value: metric.errorCount,
        threshold: metric.errorCount > 10 ? 10 : 5,
      });
    }
  });

  return issues;
}

async function sendPerformanceAlert(
  issues: Array<{ type: string; severity: 'warning' | 'error'; value: number; threshold: number }>,
  userId?: string
): Promise<void> {
  // Send to Slack/Discord/email notification service
  const criticalIssues = issues.filter(issue => issue.severity === 'error');
  
  if (criticalIssues.length > 0) {
    const alertMessage = {
      text: `🚨 Critical Performance Issues Detected`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Critical performance issues detected for user ${userId || 'anonymous'}*`,
          },
        },
        {
          type: 'section',
          fields: criticalIssues.map(issue => ({
            type: 'mrkdwn',
            text: `*${issue.type}*: ${issue.value.toFixed(2)} (threshold: ${issue.threshold})`,
          })),
        },
      ],
    };

    // Send to notification service (implement based on your setup)
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertMessage),
      });
    } catch (error) {
      console.error('Failed to send performance alert:', error);
    }
  }
}

// GET endpoint for retrieving aggregated metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const userId = searchParams.get('userId');

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );

    // Calculate time range
    const now = new Date();
    const startTime = new Date();
    
    switch (timeRange) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '24h':
        startTime.setDate(now.getDate() - 1);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(now.getDate() - 30);
        break;
      default:
        startTime.setDate(now.getDate() - 1);
    }

    // Build query
    let query = supabase
      .from('rum_metrics')
      .select('*')
      .gte('timestamp', startTime.toISOString())
      .order('timestamp', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to retrieve metrics' },
        { status: 500 }
      );
    }

    // Aggregate metrics
    const aggregated = this.aggregateMetrics(data || []);

    return NextResponse.json({
      timeRange,
      aggregated,
      rawMetrics: data,
    });

  } catch (error) {
    console.error('RUM GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function aggregateMetrics(metrics: any[]): any {
  if (metrics.length === 0) return {};

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const percentile = (arr: number[], p: number) => {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  };

  return {
    totalSessions: new Set(metrics.map(m => m.session_id)).size,
    avgLCP: avg(metrics.map(m => m.lcp).filter(Boolean)),
    p75LCP: percentile(metrics.map(m => m.lcp).filter(Boolean), 75),
    avgFID: avg(metrics.map(m => m.fid).filter(Boolean)),
    avgCLS: avg(metrics.map(m => m.cls).filter(Boolean)),
    avgPageLoadTime: avg(metrics.map(m => m.page_load_time).filter(Boolean)),
    avgTTFB: avg(metrics.map(m => m.ttfb).filter(Boolean)),
    totalErrors: metrics.reduce((sum, m) => sum + m.error_count, 0),
    totalWarnings: metrics.reduce((sum, m) => sum + m.warning_count, 0),
    mobileUsers: metrics.filter(m => m.is_mobile).length,
    desktopUsers: metrics.filter(m => !m.is_mobile).length,
  };
}