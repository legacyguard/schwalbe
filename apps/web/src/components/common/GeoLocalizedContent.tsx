/**
 * Geo Localized Content Component
 * Automatically displays localized content based on user's geographic location
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Phone,
  AlertTriangle,
  Shield,
  Clock,
  Globe,
  DollarSign,
  Scale,
  Building,
  Heart,
  PhoneCall,
} from 'lucide-react';
import {
  type GeoLocation,
  type LocalizedContent,
  type EmergencyServices,
  useGeoLocalization,
  formatCurrency,
  formatDate,
  formatTime,
} from '@/middleware/geoLocalizationMiddleware';

interface GeoLocalizedContentProps {
  showEmergency?: boolean;
  showLegal?: boolean;
  showCurrency?: boolean;
  compact?: boolean;
  className?: string;
}

export function GeoLocalizedContent({
  showEmergency = true,
  showLegal = true,
  showCurrency = true,
  compact = false,
  className,
}: GeoLocalizedContentProps) {
  const [geoData, setGeoData] = useState<{
    location: GeoLocation;
    content: LocalizedContent;
    emergency: EmergencyServices;
    timestamp: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = useGeoLocalization();
    setGeoData(data);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className='p-4'>
          <div className='animate-pulse space-y-2'>
            <div className='h-4 bg-gray-200 rounded w-1/2'></div>
            <div className='h-3 bg-gray-200 rounded w-1/3'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!geoData) {
    return null;
  }

  const { location, content, emergency } = geoData;

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      SK: '🇸🇰',
      CZ: '🇨🇿',
      AT: '🇦🇹',
      DE: '🇩🇪',
      HU: '🇭🇺',
      PL: '🇵🇱',
      GB: '🇬🇧',
    };
    return flags[countryCode] || '🌍';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <MapPin className='h-4 w-4 text-muted-foreground' />
        <span>{getCountryFlag(location.countryCode)} {location.city}, {location.country}</span>
        {showEmergency && (
          <>
            <Separator orientation='vertical' className='h-4' />
            <Phone className='h-3 w-3 text-red-600' />
            <span className='font-mono text-red-600'>{emergency.unified}</span>
          </>
        )}
        {showCurrency && (
          <>
            <Separator orientation='vertical' className='h-4' />
            <DollarSign className='h-3 w-3 text-green-600' />
            <span>{location.currency}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Location Info */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Globe className='h-5 w-5' />
            Vaša poloha
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-center gap-3'>
            <div className='text-2xl'>{getCountryFlag(location.countryCode)}</div>
            <div>
              <p className='font-semibold'>{location.city}, {location.country}</p>
              <p className='text-sm text-muted-foreground'>
                {location.region} • {location.timezone}
              </p>
            </div>
            <div className='ml-auto'>
              <Badge variant='outline' className='text-xs'>
                {location.accuracy === 'high' && '📍 Presné'}
                {location.accuracy === 'medium' && '📍 Približné'}
                {location.accuracy === 'low' && '📍 Orientačné'}
              </Badge>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-2 text-xs text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <Clock className='h-3 w-3' />
              <span>{formatTime(new Date(), location)}</span>
            </div>
            <div className='flex items-center gap-1'>
              <DollarSign className='h-3 w-3' />
              <span>{location.currency}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Globe className='h-3 w-3' />
              <span>{content.locale}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Services */}
      {showEmergency && (
        <Card className='border-red-200 bg-red-50'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-lg text-red-700'>
              <AlertTriangle className='h-5 w-5' />
              Núdzové služby
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='flex items-center gap-2'>
                <Phone className='h-4 w-4 text-red-600' />
                <div>
                  <p className='text-sm font-medium'>Jednotné núdzové číslo</p>
                  <p className='font-mono text-red-600 font-bold'>{emergency.unified}</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Heart className='h-4 w-4 text-blue-600' />
                <div>
                  <p className='text-sm font-medium'>Zdravotná záchrana</p>
                  <p className='font-mono text-blue-600'>{emergency.medical}</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Shield className='h-4 w-4 text-gray-600' />
                <div>
                  <p className='text-sm font-medium'>Polícia</p>
                  <p className='font-mono text-gray-600'>{emergency.police}</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <AlertTriangle className='h-4 w-4 text-orange-600' />
                <div>
                  <p className='text-sm font-medium'>Hasiči</p>
                  <p className='font-mono text-orange-600'>{emergency.fire}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-700'>Špecializované linky:</p>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div className='flex justify-between'>
                  <span>Duševné zdravie:</span>
                  <span className='font-mono'>{emergency.helplines.mental}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Domáce násilie:</span>
                  <span className='font-mono'>{emergency.helplines.domestic}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Deti v núdzi:</span>
                  <span className='font-mono'>{emergency.helplines.child}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Seniori:</span>
                  <span className='font-mono'>{emergency.helplines.senior}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legal Framework */}
      {showLegal && (
        <Card className='border-blue-200 bg-blue-50'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-lg text-blue-700'>
              <Scale className='h-5 w-5' />
              Právny rámec
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <p className='text-sm font-medium'>Právny systém:</p>
              <p className='text-sm text-blue-700'>{content.legalFramework}</p>
            </div>

            <div>
              <p className='text-sm font-medium mb-2'>Ochrana osobných údajov:</p>
              <div className='flex flex-wrap gap-1'>
                {content.dataProtectionLaws.map((law, index) => (
                  <Badge key={index} variant='secondary' className='text-xs'>
                    {law}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className='text-sm font-medium mb-2'>Dôveryhodné inštitúcie:</p>
              <div className='space-y-1'>
                {content.trustedInstitutions.slice(0, 3).map((institution, index) => (
                  <div key={index} className='flex items-center gap-2 text-xs'>
                    <Building className='h-3 w-3 text-blue-600' />
                    <span>{institution}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Currency & Formatting */}
      {showCurrency && (
        <Card className='border-green-200 bg-green-50'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-lg text-green-700'>
              <DollarSign className='h-5 w-5' />
              Lokálne nastavenia
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <p className='font-medium'>Mena:</p>
                <p className='text-green-700'>{content.currency}</p>
                <p className='text-xs text-muted-foreground'>
                  Príklad: {formatCurrency(1234.56, location)}
                </p>
              </div>

              <div>
                <p className='font-medium'>Dátum:</p>
                <p className='text-green-700'>{content.dateFormat}</p>
                <p className='text-xs text-muted-foreground'>
                  Príklad: {formatDate(new Date(), location)}
                </p>
              </div>

              <div>
                <p className='font-medium'>Jazyk:</p>
                <p className='text-green-700'>{content.locale}</p>
              </div>

              <div>
                <p className='font-medium'>Daňový systém:</p>
                <p className='text-green-700 text-xs'>{content.taxSystem}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            navigator.clipboard.writeText(emergency.unified);
          }}
          className='flex-1'
        >
          <PhoneCall className='h-4 w-4 mr-2' />
          Kopírovať núdzové číslo
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => window.location.reload()}
        >
          <MapPin className='h-4 w-4 mr-2' />
          Aktualizovať polohu
        </Button>
      </div>
    </div>
  );
}

/**
 * Emergency Quick Access Component
 */
export function EmergencyQuickAccess() {
  const geoData = useGeoLocalization();

  if (!geoData) {
    return (
      <div className='fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg'>
        <Phone className='h-6 w-6' />
      </div>
    );
  }

  const { emergency, location } = geoData;

  return (
    <div className='fixed bottom-4 right-4 space-y-2'>
      <Card className='bg-red-600 text-white border-red-700 shadow-lg'>
        <CardContent className='p-3'>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5' />
            <div>
              <p className='text-xs opacity-90'>Núdza</p>
              <p className='font-mono font-bold'>{emergency.unified}</p>
            </div>
            <Button
              size='sm'
              variant='secondary'
              onClick={() => {
                window.open(`tel:${emergency.unified}`, '_self');
              }}
              className='ml-2'
            >
              <Phone className='h-4 w-4' />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Location Badge Component
 */
export function LocationBadge({ className }: { className?: string }) {
  const geoData = useGeoLocalization();

  if (!geoData) {
    return null;
  }

  const { location } = geoData;

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      SK: '🇸🇰',
      CZ: '🇨🇿',
      AT: '🇦🇹',
      DE: '🇩🇪',
      HU: '🇭🇺',
      PL: '🇵🇱',
      GB: '🇬🇧',
    };
    return flags[countryCode] || '🌍';
  };

  return (
    <Badge variant='outline' className={`gap-1 ${className}`}>
      <span>{getCountryFlag(location.countryCode)}</span>
      <span>{location.city}</span>
    </Badge>
  );
}