/**
 * Localized Dashboard Component
 * Dashboard that adapts content based on user's geographic location
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MapPin,
  Shield,
  AlertTriangle,
  Phone,
  Scale,
  Building,
  DollarSign,
  Clock,
  Globe,
  TrendingUp,
  Users,
  FileText,
  Heart,
  Info,
} from 'lucide-react';
import {
  GeoLocalizedContent,
  EmergencyQuickAccess,
  LocationBadge,
} from '@/components/common/GeoLocalizedContent';
import {
  useGeoLocalization,
  useEmergencyServices,
  useLocalization,
  useLegalCompliance,
} from '@/hooks/useGeoLocalization';

interface LocalizedDashboardProps {
  showEmergencyWidget?: boolean;
  showLegalInfo?: boolean;
  showLocationBadge?: boolean;
  className?: string;
}

export function LocalizedDashboard({
  showEmergencyWidget = true,
  showLegalInfo = true,
  showLocationBadge = true,
  className,
}: LocalizedDashboardProps) {
  const { geoData, isLoading, error } = useGeoLocalization();
  const { emergencyNumber } = useEmergencyServices();
  const { formatCurrency, formatDate, strings } = useLocalization();
  const { isGDPRApplicable, legalFramework } = useLegalCompliance();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className='p-6'>
                  <div className='space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                    <div className='h-8 bg-gray-200 rounded w-1/3'></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive' className={className}>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription>
          {strings.common.error}: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!geoData) {
    return null;
  }

  const { location, content, emergency } = geoData;

  // Sample data that would be localized
  const localizedMetrics = {
    protectionScore: 85,
    documentsCount: 12,
    guardiansCount: 3,
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    estimatedValue: 25000,
    riskLevel: 'low' as const,
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with location info */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Ochranné centrum
          </h1>
          <p className='text-muted-foreground mt-1'>
            Personalizované pre {location.city}, {location.country}
          </p>
        </div>
        {showLocationBadge && <LocationBadge />}
      </div>

      {/* Quick Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-green-100 rounded-full'>
                <Shield className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Ochranné skóre</p>
                <p className='text-2xl font-bold text-green-600'>
                  {localizedMetrics.protectionScore}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 rounded-full'>
                <FileText className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Dokumenty</p>
                <p className='text-2xl font-bold'>{localizedMetrics.documentsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-purple-100 rounded-full'>
                <Users className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Opatrovníci</p>
                <p className='text-2xl font-bold'>{localizedMetrics.guardiansCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-yellow-100 rounded-full'>
                <DollarSign className='h-5 w-5 text-yellow-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Ochránená hodnota</p>
                <p className='text-xl font-bold'>
                  {formatCurrency(localizedMetrics.estimatedValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Alert for High Risk Situations */}
      {localizedMetrics.riskLevel === 'high' && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription className='flex items-center justify-between'>
            <span>Zistené vysoké riziko - odporúčame okamžité kroky na ochranu.</span>
            <Button size='sm' variant='outline'>
              <Phone className='h-4 w-4 mr-2' />
              Kontaktovať {emergencyNumber}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* GDPR Compliance Notice */}
      {isGDPRApplicable && (
        <Alert>
          <Info className='h-4 w-4' />
          <AlertDescription>
            Vaše údaje sú spracovávané v súlade s GDPR a miestnymi zákonmi o ochrane údajov.
            Právny rámec: {legalFramework}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Prehľad</TabsTrigger>
          <TabsTrigger value='local'>Lokálne info</TabsTrigger>
          <TabsTrigger value='emergency'>Núdzové</TabsTrigger>
          <TabsTrigger value='legal'>Právne</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          {/* Protection Status */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Stav ochrany
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span>Celkové ochranné skóre:</span>
                  <div className='flex items-center gap-2'>
                    <div className='w-32 bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-green-600 h-2 rounded-full'
                        style={{ width: `${localizedMetrics.protectionScore}%` }}
                      ></div>
                    </div>
                    <span className='font-semibold'>{localizedMetrics.protectionScore}%</span>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='flex justify-between'>
                    <span>Posledná aktualizácia:</span>
                    <span>{formatDate(localizedMetrics.lastUpdate)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Úroveň rizika:</span>
                    <Badge variant={localizedMetrics.riskLevel === 'low' ? 'secondary' : 'destructive'}>
                      {localizedMetrics.riskLevel === 'low' ? 'Nízke' : 'Vysoké'}
                    </Badge>
                  </div>
                  <div className='flex justify-between'>
                    <span>Aktuálny čas:</span>
                    <span>{currentTime.toLocaleTimeString(content.locale)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Časové pásmo:</span>
                    <span>{location.timezone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Card className='cursor-pointer hover:shadow-md transition-shadow'>
              <CardContent className='p-4 text-center'>
                <FileText className='h-8 w-8 mx-auto mb-2 text-blue-600' />
                <h3 className='font-semibold mb-1'>Pridať dokument</h3>
                <p className='text-xs text-muted-foreground'>
                  Bezpečne uložte nový dokument
                </p>
              </CardContent>
            </Card>

            <Card className='cursor-pointer hover:shadow-md transition-shadow'>
              <CardContent className='p-4 text-center'>
                <Users className='h-8 w-8 mx-auto mb-2 text-purple-600' />
                <h3 className='font-semibold mb-1'>Pozvať opatrovníka</h3>
                <p className='text-xs text-muted-foreground'>
                  Rozšírte svoj kruh ochrany
                </p>
              </CardContent>
            </Card>

            <Card className='cursor-pointer hover:shadow-md transition-shadow'>
              <CardContent className='p-4 text-center'>
                <Heart className='h-8 w-8 mx-auto mb-2 text-red-600' />
                <h3 className='font-semibold mb-1'>Núdzový plán</h3>
                <p className='text-xs text-muted-foreground'>
                  Aktivovať alebo upraviť plán
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='local'>
          <GeoLocalizedContent
            showEmergency={false}
            showLegal={false}
            showCurrency={true}
          />
        </TabsContent>

        <TabsContent value='emergency'>
          <GeoLocalizedContent
            showEmergency={true}
            showLegal={false}
            showCurrency={false}
          />
        </TabsContent>

        <TabsContent value='legal'>
          {showLegalInfo && (
            <GeoLocalizedContent
              showEmergency={false}
              showLegal={true}
              showCurrency={false}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Current Time Widget */}
      <Card className='bg-gradient-to-r from-blue-50 to-purple-50'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Clock className='h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Aktuálny čas</p>
                <p className='text-lg font-semibold'>
                  {currentTime.toLocaleString(content.locale, {
                    timeZone: location.timezone,
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <Badge variant='outline'>{location.timezone}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Quick Access Widget */}
      {showEmergencyWidget && <EmergencyQuickAccess />}
    </div>
  );
}

/**
 * Mini localized widget for embedding in other components
 */
export function LocalizedWidget() {
  const { geoData, isLoading } = useGeoLocalization();
  const { formatCurrency } = useLocalization();

  if (isLoading || !geoData) {
    return (
      <Card className='w-full max-w-sm'>
        <CardContent className='p-4'>
          <div className='animate-pulse space-y-2'>
            <div className='h-4 bg-gray-200 rounded w-1/2'></div>
            <div className='h-3 bg-gray-200 rounded w-1/3'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { location, emergency } = geoData;

  return (
    <Card className='w-full max-w-sm border-l-4 border-l-blue-500'>
      <CardContent className='p-4'>
        <div className='flex items-center gap-3'>
          <div className='text-lg'>
            {location.countryCode === 'SK' && '🇸🇰'}
            {location.countryCode === 'CZ' && '🇨🇿'}
            {location.countryCode === 'AT' && '🇦🇹'}
            {location.countryCode === 'DE' && '🇩🇪'}
            {location.countryCode === 'HU' && '🇭🇺'}
            {location.countryCode === 'PL' && '🇵🇱'}
            {!['SK', 'CZ', 'AT', 'DE', 'HU', 'PL'].includes(location.countryCode) && '🌍'}
          </div>
          <div>
            <p className='font-semibold text-sm'>{location.city}</p>
            <p className='text-xs text-muted-foreground'>
              Núdza: {emergency.unified} • {location.currency}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}