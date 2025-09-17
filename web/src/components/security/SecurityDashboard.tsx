
/**
 * Security Dashboard Component
 * Displays security status, audit logs, and security settings
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/clerk-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/motion/FadeIn';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';

interface SecurityScore {
  factors: {
    backupRecent: boolean;
    encryptionEnabled: boolean;
    passwordStrength: number;
    recoverySetup: boolean;
    twoFactorEnabled: boolean;
  };
  overall: number;
}

interface AuditLogEntry {
  details?: string;
  failure_reason?: string;
  id: string;
  ip_address?: string;
  operation: string;
  success: boolean;
  timestamp: string;
  user_agent?: string;
}

interface ActiveSession {
  device: string;
  id: string;
  ip_address: string;
  last_active: string;
  location?: string;
}

export function SecurityDashboard() {
  const { t } = useTranslation('ui/security-dashboard');
  const { userId } = useAuth();
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );
  const [securityScore, setSecurityScore] = useState<SecurityScore>({
    overall: 0,
    factors: {
      passwordStrength: 0,
      twoFactorEnabled: false,
      encryptionEnabled: false,
      backupRecent: false,
      recoverySetup: false,
    },
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyRotationNeeded, setKeyRotationNeeded] = useState(false);

  useEffect(() => {
    if (userId) {
      loadSecurityData();
    }
  }, [userId]);

  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      // Calculate security score
      await calculateSecurityScore();

      // Load audit logs
      await loadAuditLogs();

      // Load active sessions
      await loadActiveSessions();

      // Check if key rotation needed
      await checkKeyRotation();
    } catch (error) {
      console.error('Error loading security data:', error);
      toast.error(t('errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSecurityScore = async () => {
    if (!userId) return;

    let score = 0;
    const factors = {
      passwordStrength: 0,
      twoFactorEnabled: false,
      encryptionEnabled: false,
      backupRecent: false,
      recoverySetup: false,
    };

    // Check encryption keys
    const { data: keys } = await supabase
      .from('user_encryption_keys')
      .select('created_at, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (keys) {
      factors.encryptionEnabled = true;
      score += 25;
    }

    // Check backup recency
    const lastBackup = localStorage.getItem(`lastBackup_${userId}`);
    if (lastBackup) {
      const daysSinceBackup =
        (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceBackup <= 7) {
        factors.backupRecent = true;
        score += 20;
      }
    }

    // Check recovery setup
    const { data: recovery } = await supabase
      .from('user_key_recovery')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (recovery && recovery.length > 0) {
      factors.recoverySetup = true;
      score += 20;
    }

    // Note: 2FA status would be checked from Clerk user metadata
    // factors.twoFactorEnabled = user?.twoFactorEnabled || false;
    // if (factors.twoFactorEnabled) score += 25;

    // Password strength (mock for now)
    factors.passwordStrength = 3;
    score += factors.passwordStrength * 10;

    setSecurityScore({
      overall: Math.min(score, 100),
      factors,
    });
  };

  const loadAuditLogs = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('key_access_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (!error && data) {
      setAuditLogs(data);
    }
  };

  const loadActiveSessions = async () => {
    // Mock active sessions for now
    // In production, integrate with Clerk session management
    setActiveSessions([
      {
        id: '1',
        device: 'Chrome on MacOS',
        ip_address: '192.168.1.1',
        last_active: new Date().toISOString(),
        location: 'San Francisco, CA',
      },
    ]);
  };

  const checkKeyRotation = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('user_encryption_keys')
      .select('created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (data) {
      const keyAge = Date.now() - new Date(data.created_at).getTime();
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;
      setKeyRotationNeeded(keyAge > ninetyDays);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t('securityScore.labels.excellent');
    if (score >= 60) return t('securityScore.labels.good');
    if (score >= 40) return t('securityScore.labels.fair');
    return t('securityScore.labels.needsImprovement');
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'generate':
        return 'key';
      case 'retrieve':
        return 'unlock';
      case 'rotate':
        return 'rotate';
      case 'compromise':
        return 'triangle-exclamation';
      default:
        return 'shield-check';
    }
  };

  if (isLoading) {
    return (
      <Card className='p-8'>
        <div className='flex items-center justify-center'>
          <Icon
            name="upload"
            className='w-8 h-8 animate-spin text-primary'
          />
        </div>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Security Score */}
      <FadeIn duration={0.5} delay={0.1}>
        <Card className='p-6'>
          <div className='flex items-start justify-between mb-4'>
            <div>
              <h3 className='text-xl font-semibold mb-2'>{t('securityScore.title')}</h3>
              <p className='text-muted-foreground text-sm'>
                {t('securityScore.description')}
              </p>
            </div>
            <div className='text-right'>
              <div
                className={`text-3xl font-bold ${getScoreColor(securityScore.overall)}`}
              >
                {securityScore.overall}%
              </div>
              <Badge variant='outline' className='mt-1'>
                {getScoreLabel(securityScore.overall)}
              </Badge>
            </div>
          </div>

          <Progress value={securityScore.overall} className='mb-6' />

          <div className='grid md:grid-cols-2 gap-4'>
            <div className='flex items-center justify-between p-3 bg-muted/20 rounded-lg'>
              <div className='flex items-center gap-3'>
                <Icon
                  name="key"
                  className='w-5 h-5 text-muted-foreground'
                />
                <span className='text-sm'>{t('factors.passwordStrength.label')}</span>
              </div>
              <Badge
                variant={
                  securityScore.factors.passwordStrength >= 3
                    ? 'success'
                    : 'warning'
                }
              >
                {t('factors.passwordStrength.rating', { current: securityScore.factors.passwordStrength })}
              </Badge>
            </div>

            <div className='flex items-center justify-between p-3 bg-muted/20 rounded-lg'>
              <div className='flex items-center gap-3'>
                <Icon
                  name="shield-check"
                  className='w-5 h-5 text-muted-foreground'
                />
                <span className='text-sm'>{t('factors.twoFactorAuth.label')}</span>
              </div>
              <Badge
                variant={
                  securityScore.factors.twoFactorEnabled
                    ? 'success'
                    : 'secondary'
                }
              >
                {securityScore.factors.twoFactorEnabled
                  ? t('factors.twoFactorAuth.enabled')
                  : t('factors.twoFactorAuth.disabled')}
              </Badge>
            </div>

            <div className='flex items-center justify-between p-3 bg-muted/20 rounded-lg'>
              <div className='flex items-center gap-3'>
                <Icon
                  name="lock"
                  className='w-5 h-5 text-muted-foreground'
                />
                <span className='text-sm'>{t('factors.encryption.label')}</span>
              </div>
              <Badge
                variant={
                  securityScore.factors.encryptionEnabled
                    ? 'success'
                    : 'secondary'
                }
              >
                {securityScore.factors.encryptionEnabled
                  ? t('factors.encryption.active')
                  : t('factors.encryption.inactive')}
              </Badge>
            </div>

            <div className='flex items-center justify-between p-3 bg-muted/20 rounded-lg'>
              <div className='flex items-center gap-3'>
                <Icon
                  name="database"
                  className='w-5 h-5 text-muted-foreground'
                />
                <span className='text-sm'>{t('factors.recentBackup.label')}</span>
              </div>
              <Badge
                variant={
                  securityScore.factors.backupRecent ? 'success' : 'warning'
                }
              >
                {securityScore.factors.backupRecent ? t('factors.recentBackup.upToDate') : t('factors.recentBackup.outdated')}
              </Badge>
            </div>

            <div className='flex items-center justify-between p-3 bg-muted/20 rounded-lg'>
              <div className='flex items-center gap-3'>
                <Icon
                  name="refresh"
                  className='w-5 h-5 text-muted-foreground'
                />
                <span className='text-sm'>{t('factors.recoverySetup.label')}</span>
              </div>
              <Badge
                variant={
                  securityScore.factors.recoverySetup ? 'success' : 'secondary'
                }
              >
                {securityScore.factors.recoverySetup ? t('factors.recoverySetup.configured') : t('factors.recoverySetup.notSet')}
              </Badge>
            </div>

            <div className='flex items-center justify-between p-3 bg-muted/20 rounded-lg'>
              <div className='flex items-center gap-3'>
                <Icon
                  name="rotate"
                  className='w-5 h-5 text-muted-foreground'
                />
                <span className='text-sm'>{t('factors.keyRotation.label')}</span>
              </div>
              <Badge variant={keyRotationNeeded ? 'warning' : 'success'}>
                {keyRotationNeeded ? t('factors.keyRotation.needed') : t('factors.keyRotation.current')}
              </Badge>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Active Sessions */}
      <FadeIn duration={0.5} delay={0.2}>
        <Card className='p-6'>
          <h3 className='text-xl font-semibold mb-4'>{t('activeSessions.title')}</h3>
          <div className='space-y-3'>
            {activeSessions.map(session => (
              <div
                key={session.id}
                className='flex items-center justify-between p-4 bg-muted/20 rounded-lg'
              >
                <div className='flex items-center gap-4'>
                  <Icon
                    name="device-laptop"
                    className='w-5 h-5 text-muted-foreground'
                  />
                  <div>
                    <p className='font-medium'>{session.device}</p>
                    <p className='text-sm text-muted-foreground'>
                      {session.ip_address} • {session.location}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-sm text-muted-foreground'>
                    {t('activeSessions.active', {
                      timeAgo: formatDistanceToNow(new Date(session.last_active), {
                        addSuffix: true,
                      })
                    })}
                  </p>
                  {session.id === '1' && (
                    <Badge variant='outline' className='mt-1'>
                      {t('activeSessions.current')}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>

      {/* Recent Activity */}
      <FadeIn duration={0.5} delay={0.3}>
        <Card className='p-6'>
          <h3 className='text-xl font-semibold mb-4'>
            {t('recentActivity.title')}
          </h3>
          {auditLogs.length > 0 ? (
            <div className='space-y-2'>
              {auditLogs.map(log => (
                <div
                  key={log.id}
                  className='flex items-center justify-between p-3 hover:bg-muted/20 rounded-lg transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`p-2 rounded-full ${log.success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
                    >
                      <Icon
                        name={getOperationIcon(log.operation)}
                        className={`w-4 h-4 ${log.success ? 'text-green-600' : 'text-red-600'}`}
                      />
                    </div>
                    <div>
                      <p className='font-medium capitalize'>
                        {t('recentActivity.operation', { operation: log.operation })}
                      </p>
                      {log.failure_reason && (
                        <p className='text-sm text-red-600'>
                          {log.failure_reason}
                        </p>
                      )}
                      {log.details && (
                        <p className='text-sm text-muted-foreground'>
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-muted-foreground'>
                      {formatDistanceToNow(new Date(log.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                    {log.ip_address && (
                      <p className='text-xs text-muted-foreground'>
                        {log.ip_address}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-muted-foreground text-center py-8'>
              {t('recentActivity.noActivity')}
            </p>
          )}
        </Card>
      </FadeIn>

      {/* Security Recommendations */}
      {(keyRotationNeeded ||
        !securityScore.factors.twoFactorEnabled ||
        !securityScore.factors.backupRecent) && (
        <FadeIn duration={0.5} delay={0.4}>
          <Card className='p-6 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20'>
            <h3 className='text-xl font-semibold mb-4 flex items-center gap-2'>
              <Icon name="info" className='w-5 h-5 text-yellow-600' />
              {t('recommendations.title')}
            </h3>
            <div className='space-y-3'>
              {keyRotationNeeded && (
                <div className='flex items-start gap-3'>
                  <Icon
                    name="rotate"
                    className='w-5 h-5 text-yellow-600 mt-0.5'
                  />
                  <div className='flex-1'>
                    <p className='font-medium'>{t('recommendations.rotateKeys.title')}</p>
                    <p className='text-sm text-muted-foreground'>
                      {t('recommendations.rotateKeys.description')}
                    </p>
                    <Button size='sm' variant='outline' className='mt-2'>
                      {t('recommendations.rotateKeys.action')}
                    </Button>
                  </div>
                </div>
              )}

              {!securityScore.factors.twoFactorEnabled && (
                <div className='flex items-start gap-3'>
                  <Icon
                    name="shield-check"
                    className='w-5 h-5 text-yellow-600 mt-0.5'
                  />
                  <div className='flex-1'>
                    <p className='font-medium'>
                      {t('recommendations.enable2FA.title')}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {t('recommendations.enable2FA.description')}
                    </p>
                    <Button size='sm' variant='outline' className='mt-2'>
                      {t('recommendations.enable2FA.action')}
                    </Button>
                  </div>
                </div>
              )}

              {!securityScore.factors.backupRecent && (
                <div className='flex items-start gap-3'>
                  <Icon
                    name="database"
                    className='w-5 h-5 text-yellow-600 mt-0.5'
                  />
                  <div className='flex-1'>
                    <p className='font-medium'>{t('recommendations.createBackup.title')}</p>
                    <p className='text-sm text-muted-foreground'>
                      {t('recommendations.createBackup.description')}
                    </p>
                    <Button size='sm' variant='outline' className='mt-2'>
                      {t('recommendations.createBackup.action')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
