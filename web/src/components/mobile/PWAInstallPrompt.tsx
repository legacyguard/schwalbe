/**
 * PWA Install Prompt Component
 * Phase 7: Mobile & PWA Capabilities
 *
 * Provides a user-friendly interface for PWA installation
 * with device-specific instructions and fallback options.
 */

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Bell,
  Camera,
  Download,
  ExternalLink,
  Info,
  Monitor,
  Shield,
  Smartphone,
  Wifi,
  WifiOff,
  X,
  Zap,
} from 'lucide-react';
import { type PWACapabilities, pwaService } from '@/lib/pwa/pwaService';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PWAInstallPromptProps {
  autoShow?: boolean;
  className?: string;
  showMinimal?: boolean;
}

export default function PWAInstallPrompt({
  className,
  autoShow = false,
  showMinimal = false,
}: PWAInstallPromptProps) {
  const { t } = useTranslation('ui/pwa-install-prompt');
  const [capabilities, setCapabilities] = useState<null | PWACapabilities>(
    null
  );
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const updateCapabilities = () => {
      const caps = pwaService.getCapabilities();
      setCapabilities(caps);

      if (autoShow && caps.canInstall && !dismissed && !caps.isInstalled) {
        setIsVisible(true);
      }
    };

    updateCapabilities();

    // Listen for install availability changes
    const handleInstallChange = (_canInstall: boolean) => {
      updateCapabilities();
    };

    pwaService.addInstallListener(handleInstallChange);

    return () => {
      pwaService.removeInstallListener(handleInstallChange);
    };
  }, [autoShow, dismissed]);

  const handleInstall = async () => {
    if (!capabilities?.canInstall) {
      setShowInstructions(true);
      return;
    }

    try {
      setIsInstalling(true);
      const installed = await pwaService.installPWA();

      if (installed) {
        setIsVisible(false);
        setDismissed(true);
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
      setShowInstructions(true);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const getDeviceInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /ipad|iphone|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isChrome = /chrome/.test(userAgent);

    if (isIOS && isSafari) {
      return {
        device: t('instructions.devices.iosSafari'),
        icon: <Smartphone className='h-5 w-5' />,
        steps: t('instructions.steps.iosSafari', { returnObjects: true }) as string[],
      };
    }

    if (isAndroid && isChrome) {
      return {
        device: t('instructions.devices.androidChrome'),
        icon: <Smartphone className='h-5 w-5' />,
        steps: t('instructions.steps.androidChrome', { returnObjects: true }) as string[],
      };
    }

    if (isChrome) {
      return {
        device: t('instructions.devices.desktopChrome'),
        icon: <Monitor className='h-5 w-5' />,
        steps: t('instructions.steps.desktopChrome', { returnObjects: true }) as string[],
      };
    }

    return {
      device: t('instructions.devices.otherBrowser'),
      icon: <Monitor className='h-5 w-5' />,
      steps: t('instructions.steps.otherBrowser', { returnObjects: true }) as string[],
    };
  };

  const features = [
    { icon: <WifiOff className='h-4 w-4' />, text: t('features.workOffline') },
    { icon: <Zap className='h-4 w-4' />, text: t('features.fasterLoading') },
    { icon: <Bell className='h-4 w-4' />, text: t('features.pushNotifications') },
    { icon: <Camera className='h-4 w-4' />, text: t('features.cameraAccess') },
    { icon: <Shield className='h-4 w-4' />, text: t('features.enhancedSecurity') },
  ];

  if (
    !capabilities ||
    capabilities.isInstalled ||
    (!capabilities.canInstall && !autoShow)
  ) {
    return null;
  }

  if (showMinimal) {
    return (
      <div className={cn('fixed bottom-4 right-4 z-50', className)}>
        <Card className='max-w-sm shadow-lg border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <Download className='h-4 w-4 text-blue-600' />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-900'>
                  {t('title')}
                </p>
                <p className='text-xs text-gray-600'>
                  {t('minimal.quickAccess')}
                </p>
              </div>
              <div className='flex gap-1'>
                <Button
                  size='sm'
                  onClick={handleInstall}
                  disabled={isInstalling}
                >
                  {isInstalling ? '...' : t('buttons.install')}
                </Button>
                <Button size='sm' variant='ghost' onClick={handleDismiss}>
                  <X className='h-3 w-3' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isVisible) {
    return (
      <Button
        variant='outline'
        size='sm'
        onClick={() => setIsVisible(true)}
        className='gap-2'
      >
        <Download className='h-4 w-4' />
        {t('buttons.installApp')}
      </Button>
    );
  }

  const instructions = getDeviceInstructions();

  return (
    <>
      <Card
        className={cn('max-w-md mx-auto shadow-lg border-blue-200', className)}
      >
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <Shield className='h-6 w-6 text-blue-600' />
              </div>
              <div>
                <CardTitle className='text-lg'>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
              </div>
            </div>
            <Button variant='ghost' size='sm' onClick={handleDismiss}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='flex flex-wrap gap-2'>
            {features.map((feature, index) => (
              <Badge key={index} variant='secondary' className='gap-1'>
                {feature.icon}
                {feature.text}
              </Badge>
            ))}
          </div>

          <Alert>
            <Info className='h-4 w-4' />
            <AlertDescription>
              {t('alerts.benefits')}
            </AlertDescription>
          </Alert>

          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              {capabilities?.isOnline ? (
                <Wifi className='h-4 w-4 text-green-500' />
              ) : (
                <WifiOff className='h-4 w-4 text-gray-400' />
              )}
              <span>{capabilities?.isOnline ? t('status.online') : t('status.offline')}</span>
            </div>

            <div className='flex items-center gap-2'>
              <Shield className='h-4 w-4 text-blue-500' />
              <span>{t('status.secureContext')}</span>
            </div>
          </div>

          <div className='flex gap-2'>
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              className='flex-1'
            >
              {isInstalling ? (
                t('buttons.installing')
              ) : capabilities?.canInstall ? (
                <>
                  <Download className='h-4 w-4 mr-2' />
                  {t('buttons.installNow')}
                </>
              ) : (
                <>
                  <Info className='h-4 w-4 mr-2' />
                  {t('buttons.showInstructions')}
                </>
              )}
            </Button>

            <Button variant='outline' onClick={handleDismiss}>
              {t('buttons.later')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Installation Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              {instructions.icon}
              {t('instructions.title', { device: instructions.device })}
            </DialogTitle>
            <DialogDescription>
              {t('instructions.description')}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              {instructions.steps.map((step, index) => (
                <div key={index} className='flex gap-3'>
                  <div className='w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600 flex-shrink-0'>
                    {index + 1}
                  </div>
                  <p className='text-sm text-gray-700'>{step}</p>
                </div>
              ))}
            </div>

            <Alert>
              <Info className='h-4 w-4' />
              <AlertDescription>
                {t('alerts.troubleshooting')}
              </AlertDescription>
            </Alert>

            <div className='p-3 bg-gray-50 rounded-lg'>
              <h4 className='font-medium text-sm mb-2'>
                {t('instructions.benefits.title')}
              </h4>
              <ul className='text-xs text-gray-600 space-y-1'>
                {(t('instructions.benefits.list', { returnObjects: true }) as string[]).map((benefit, index) => (
                  <li key={index}>• {benefit}</li>
                ))}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowInstructions(false)}
            >
              {t('buttons.gotIt')}
            </Button>
            <Button asChild>
              <a
                href='https://web.dev/install-criteria/'
                target='_blank'
                rel='noopener noreferrer'
              >
                {t('buttons.learnMore')}
                <ExternalLink className='h-3 w-3 ml-1' />
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
