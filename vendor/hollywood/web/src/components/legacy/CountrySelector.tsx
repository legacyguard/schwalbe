
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import {
  type CountryCode,
  type JurisdictionCode,
  type LanguageCode,
  SUPPORTED_COMBINATIONS,
  useLocalization,
} from '@/contexts/LocalizationContext';
import { useTranslation } from 'react-i18next';

interface CountrySelectorProps {
  onCountryConfirmed: () => void;
  showStepByStep?: boolean;
}

type SelectionStep = 'confirmation' | 'jurisdiction' | 'language';

const SUPPORTED_LANGUAGES = [
  { code: 'sk' as LanguageCode, name: 'Slovenčina', flag: '🇸🇰', nativeName: 'Slovenčina' },
  { code: 'cs' as LanguageCode, name: 'Czech', flag: '🇨🇿', nativeName: 'Čeština' },
  { code: 'en' as LanguageCode, name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'de' as LanguageCode, name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
];

const SUPPORTED_JURISDICTIONS = [
  {
    code: 'SK' as JurisdictionCode,
    name: 'Slovakia',
    flag: '🇸🇰',
    description: 'Slovak legal framework',
    currency: 'EUR',
    legalBasis: '§ 476-478 Slovak Civil Code',
  },
  {
    code: 'CZ' as JurisdictionCode,
    name: 'Czech Republic',
    flag: '🇨🇿',
    description: 'Czech legal framework',
    currency: 'CZK',
    legalBasis: '§ 1540-1542 Czech Civil Code',
  },
];

const SUPPORTED_COUNTRIES = [
  {
    code: 'sk' as CountryCode,
    name: 'Slovakia',
    flag: '🇸🇰',
    domain: 'legacyguard.sk',
    description: 'Slovak Republic legal framework',
  },
  {
    code: 'cz' as CountryCode,
    name: 'Czech Republic',
    flag: '🇨🇿',
    domain: 'legacyguard.cz',
    description: 'Czech Republic legal framework',
  },
  {
    code: 'en' as CountryCode,
    name: 'Other/International',
    flag: '🌍',
    domain: 'legacyguard.com',
    description: 'General international framework',
  },
];

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  onCountryConfirmed,
  showStepByStep = false,
}) => {
  const { t } = useTranslation('ui/country-selector');
  const {
    countryCode,
    jurisdiction,
    languageCode,
    jurisdictionCode,
    setCountryCode,
    setLanguageCode,
    setJurisdictionCode,
    isLoading,
  } = useLocalization();

  const [currentStep, setCurrentStep] = React.useState<SelectionStep>('language');
  const [selectedLanguage, setSelectedLanguage] = React.useState<LanguageCode>(languageCode);
  const [selectedJurisdiction, setSelectedJurisdiction] = React.useState<JurisdictionCode>(jurisdictionCode);
  const [showCountryList, setShowCountryList] = React.useState(false);

  const currentCountry = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);
  const currentJurisdictionData = SUPPORTED_JURISDICTIONS.find(j => j.code === selectedJurisdiction);

  const handleCountryChange = (newCountryCode: CountryCode) => {
    setCountryCode(newCountryCode);
    setShowCountryList(false);
  };

  const handleLanguageSelect = (language: LanguageCode) => {
    setSelectedLanguage(language);
    setLanguageCode(language);
    setCurrentStep('jurisdiction');
  };

  const handleJurisdictionSelect = (jurisdiction: JurisdictionCode) => {
    setSelectedJurisdiction(jurisdiction);
    setJurisdictionCode(jurisdiction);
    setCurrentStep('confirmation');
  };

  const handleConfirmSelection = () => {
    onCountryConfirmed();
  };

  const handleBackToLanguage = () => {
    setCurrentStep('language');
  };

  const handleBackToJurisdiction = () => {
    setCurrentStep('jurisdiction');
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <Icon
            name="loader"
            className='w-8 h-8 text-primary animate-spin mx-auto mb-4'
          />
          <p className='text-muted-foreground'>{t('loading.title')}</p>
        </div>
      </div>
    );
  }

  // Step-by-step selection interface
  if (showStepByStep) {
    // Language Selection Step
    if (currentStep === 'language') {
      return (
        <div className='min-h-screen bg-background'>
          <div className='max-w-4xl mx-auto px-6 py-16'>
            <FadeIn duration={0.6}>
              <div className='text-center mb-12'>
                <Icon
                  name="globe"
                  className='w-12 h-12 text-primary mx-auto mb-6'
                />
                <h1 className='text-3xl font-bold mb-4'>{t('languageSelection.title')}</h1>
                <p className='text-lg text-muted-foreground'>
                  {t('languageSelection.subtitle')}
                </p>
                <div className='flex justify-center mt-6'>
                  <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                    <div className='w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold'>1</div>
                    <span className='font-semibold'>Language</span>
                    <Icon name="arrow-right" className='w-4 h-4' />
                    <div className='w-6 h-6 rounded-full border-2 border-muted text-xs flex items-center justify-center'>2</div>
                    <span>Jurisdiction</span>
                    <Icon name="arrow-right" className='w-4 h-4' />
                    <div className='w-6 h-6 rounded-full border-2 border-muted text-xs flex items-center justify-center'>3</div>
                    <span>Confirm</span>
                  </div>
                </div>
              </div>

              <div className='grid md:grid-cols-2 gap-6 max-w-3xl mx-auto'>
                {SUPPORTED_LANGUAGES.map((language, index) => (
                  <FadeIn key={language.code} duration={0.4} delay={0.1 * index}>
                    <Card
                      className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                        language.code === selectedLanguage
                          ? 'border-primary bg-primary/5'
                          : ''
                      }`}
                      onClick={() => handleLanguageSelect(language.code)}
                    >
                      <div className='text-center'>
                        <div className='text-4xl mb-4'>{language.flag}</div>
                        <h3 className='text-xl font-semibold mb-2'>
                          {language.nativeName}
                        </h3>
                        <p className='text-sm text-muted-foreground'>
                          {language.name}
                        </p>
                        {language.code === selectedLanguage && (
                          <div className='mt-4'>
                            <Icon
                              name="check-circle"
                              className='w-5 h-5 text-green-600 mx-auto'
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  </FadeIn>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      );
    }

    // Jurisdiction Selection Step
    if (currentStep === 'jurisdiction') {
      return (
        <div className='min-h-screen bg-background'>
          <div className='max-w-4xl mx-auto px-6 py-16'>
            <FadeIn duration={0.6}>
              <div className='text-center mb-12'>
                <Icon
                  name="balance-scale"
                  className='w-12 h-12 text-primary mx-auto mb-6'
                />
                <h1 className='text-3xl font-bold mb-4'>{t('jurisdictionSelection.title')}</h1>
                <p className='text-lg text-muted-foreground'>
                  {t('jurisdictionSelection.subtitle')}
                </p>
                <div className='flex justify-center mt-6'>
                  <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                    <div className='w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center'>
                      <Icon name="check" className='w-3 h-3' />
                    </div>
                    <span>Language</span>
                    <Icon name="arrow-right" className='w-4 h-4' />
                    <div className='w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold'>2</div>
                    <span className='font-semibold'>Jurisdiction</span>
                    <Icon name="arrow-right" className='w-4 h-4' />
                    <div className='w-6 h-6 rounded-full border-2 border-muted text-xs flex items-center justify-center'>3</div>
                    <span>Confirm</span>
                  </div>
                </div>
              </div>

              <div className='grid md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
                {SUPPORTED_JURISDICTIONS.map((jurisdiction, index) => (
                  <FadeIn key={jurisdiction.code} duration={0.4} delay={0.1 * index}>
                    <Card
                      className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                        jurisdiction.code === selectedJurisdiction
                          ? 'border-primary bg-primary/5'
                          : ''
                      }`}
                      onClick={() => handleJurisdictionSelect(jurisdiction.code)}
                    >
                      <div className='text-center'>
                        <div className='text-4xl mb-4'>{jurisdiction.flag}</div>
                        <h3 className='text-xl font-semibold mb-2'>
                          {jurisdiction.name}
                        </h3>
                        <p className='text-sm text-muted-foreground mb-4'>
                          {jurisdiction.description}
                        </p>
                        <div className='text-xs space-y-1'>
                          <div className='text-primary font-medium'>
                            Currency: {jurisdiction.currency}
                          </div>
                          <div className='text-muted-foreground'>
                            {jurisdiction.legalBasis}
                          </div>
                        </div>
                        {jurisdiction.code === selectedJurisdiction && (
                          <div className='mt-4'>
                            <Icon
                              name="check-circle"
                              className='w-5 h-5 text-green-600 mx-auto'
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  </FadeIn>
                ))}
              </div>

              <div className='text-center mt-8'>
                <Button
                  onClick={handleBackToLanguage}
                  variant='outline'
                >
                  <Icon name="arrow-left" className='w-4 h-4 mr-2' />
                  Back to Language
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      );
    }

    // Confirmation Step
    if (currentStep === 'confirmation') {
      const currentCombination = SUPPORTED_COMBINATIONS.find(
        c => c.language === selectedLanguage && c.jurisdiction === selectedJurisdiction
      );

      return (
        <div className='min-h-screen bg-background'>
          <div className='max-w-4xl mx-auto px-6 py-16'>
            <FadeIn duration={0.8}>
              <div className='text-center mb-12'>
                <Icon
                  name="shield-check"
                  className='w-16 h-16 text-primary mx-auto mb-6'
                />
                <h1 className='text-4xl font-bold mb-6'>{t('confirmation.title')}</h1>
                <div className='flex justify-center mt-6'>
                  <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                    <div className='w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center'>
                      <Icon name="check" className='w-3 h-3' />
                    </div>
                    <span>Language</span>
                    <Icon name="arrow-right" className='w-4 h-4' />
                    <div className='w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center'>
                      <Icon name="check" className='w-3 h-3' />
                    </div>
                    <span>Jurisdiction</span>
                    <Icon name="arrow-right" className='w-4 h-4' />
                    <div className='w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold'>3</div>
                    <span className='font-semibold'>Confirm</span>
                  </div>
                </div>
              </div>

              <Card className='p-8 max-w-2xl mx-auto'>
                <div className='text-center mb-8'>
                  <div className='flex items-center justify-center gap-4 mb-6'>
                    <div className='text-4xl'>{currentLanguage?.flag}</div>
                    <div className='text-2xl'>+</div>
                    <div className='text-4xl'>{currentJurisdictionData?.flag}</div>
                  </div>
                  <h2 className='text-2xl font-semibold mb-4'>
                    {currentCombination?.label}
                  </h2>
                  <div className='space-y-2 text-muted-foreground'>
                    <p><strong>Interface Language:</strong> {currentLanguage?.nativeName}</p>
                    <p><strong>Legal Jurisdiction:</strong> {currentJurisdictionData?.name}</p>
                    <p><strong>Currency:</strong> {currentJurisdictionData?.currency}</p>
                  </div>
                </div>

                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                  <Button
                    onClick={handleConfirmSelection}
                    className='bg-primary hover:bg-primary-hover text-primary-foreground px-8'
                    size='lg'
                  >
                    <Icon name="check" className='w-5 h-5 mr-2' />
                    Start Creating Will
                  </Button>

                  <Button
                    onClick={handleBackToJurisdiction}
                    variant='outline'
                    size='lg'
                    className='px-8'
                  >
                    <Icon name="arrow-left" className='w-5 h-5 mr-2' />
                    Back
                  </Button>
                </div>

                <div className='mt-8 p-4 bg-muted/30 rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <Icon
                      name="info"
                      className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5'
                    />
                    <div>
                      <h4 className='font-semibold text-sm mb-1'>
                        Your selection ensures legal compliance
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        The interface will be in {currentLanguage?.nativeName}, and your will
                        will comply with {currentJurisdictionData?.name} legal requirements
                        ({currentJurisdictionData?.legalBasis}).
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </FadeIn>
          </div>
        </div>
      );
    }
  }

  // Legacy country list selection (for backward compatibility)
  if (showCountryList) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='max-w-4xl mx-auto px-6 py-16'>
          <FadeIn duration={0.6}>
            <div className='text-center mb-12'>
              <Icon
                name="globe"
                className='w-12 h-12 text-primary mx-auto mb-6'
              />
              <h1 className='text-3xl font-bold mb-4'>Select Your Country</h1>
              <p className='text-lg text-muted-foreground'>
                Choose your country to ensure your will complies with local laws
              </p>
            </div>

            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto'>
              {SUPPORTED_COUNTRIES.map((country, index) => (
                <FadeIn key={country.code} duration={0.4} delay={0.1 * index}>
                  <Card
                    className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                      country.code === countryCode
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                    onClick={() => handleCountryChange(country.code)}
                  >
                    <div className='text-center'>
                      <div className='text-4xl mb-4'>{country.flag}</div>
                      <h3 className='text-xl font-semibold mb-2'>
                        {country.name}
                      </h3>
                      <p className='text-sm text-muted-foreground mb-4'>
                        {country.description}
                      </p>
                      <div className='text-xs text-primary font-medium'>
                        {country.domain}
                      </div>
                      {country.code === countryCode && (
                        <div className='mt-4'>
                          <Icon
                            name="check-circle"
                            className='w-5 h-5 text-green-600 mx-auto'
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                </FadeIn>
              ))}
            </div>

            <div className='text-center mt-8'>
              <Button
                onClick={() => setShowCountryList(false)}
                variant='outline'
              >
                <Icon name="arrow-left" className='w-4 h-4 mr-2' />
                Back
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  // Default legacy confirmation screen
  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-4xl mx-auto px-6 py-16'>
        <FadeIn duration={0.8}>
          <div className='text-center mb-12'>
            <Icon
              name="shield-check"
              className='w-16 h-16 text-primary mx-auto mb-6'
            />
            <h1 className='text-4xl font-bold mb-6'>{t('defaultConfirmation.title')}</h1>
            <p className='text-xl text-muted-foreground mb-8'>
              {t('defaultConfirmation.subtitle')}
            </p>
          </div>

          <Card className='p-8 max-w-2xl mx-auto'>
            <div className='text-center mb-8'>
              <div className='text-6xl mb-4'>{currentCountry?.flag}</div>
              <h2 className='text-2xl font-semibold mb-2'>
                We're creating your will according to the laws of {jurisdiction}
              </h2>
              <p className='text-muted-foreground'>Is this correct?</p>
            </div>

            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button
                onClick={handleConfirmSelection}
                className='bg-primary hover:bg-primary-hover text-primary-foreground px-8'
                size='lg'
              >
                <Icon name="check" className='w-5 h-5 mr-2' />
                Yes, that's correct
              </Button>

              <Button
                onClick={() => setShowCountryList(true)}
                variant='outline'
                size='lg'
                className='px-8'
              >
                <Icon name="globe" className='w-5 h-5 mr-2' />
                Change Country
              </Button>
            </div>

            <div className='mt-8 p-4 bg-muted/30 rounded-lg'>
              <div className='flex items-start gap-3'>
                <Icon
                  name="info"
                  className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5'
                />
                <div>
                  <h4 className='font-semibold text-sm mb-1'>
                    Why country matters
                  </h4>
                  <p className='text-sm text-muted-foreground'>
                    Different countries have varying legal requirements for
                    wills. Selecting the correct jurisdiction ensures your will
                    is legally valid and enforceable.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
};
