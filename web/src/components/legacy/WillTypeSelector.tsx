
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { useCountryContent } from '@/contexts/LocalizationContext';
import { Badge } from '@/components/ui/badge';

interface WillTypeData {
  advantages: string[];
  description: string;
  disadvantages: string[];
  legalBasis: string;
  name: string;
  requirements: string[];
}

interface LegalInfo {
  willTypes: {
    holographic: WillTypeData;
    witnessed: WillTypeData;
  };
}

export type WillType = 'holographic' | 'witnessed';

interface WillTypeSelectorProps {
  onBack: () => void;
  onWillTypeSelected: (type: WillType) => void;
}

export const WillTypeSelector: React.FC<WillTypeSelectorProps> = ({
  onWillTypeSelected,
  onBack,
}) => {
  const { content: legalInfo, loading } =
    useCountryContent<LegalInfo>('legal_info');
  const [selectedType, setSelectedType] = useState<null | WillType>(null);
  const [showDetails, setShowDetails] = useState<null | WillType>(null);

  const handleTypeSelect = (type: WillType) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      onWillTypeSelected(selectedType);
    }
  };

  const toggleDetails = (type: WillType) => {
    setShowDetails(showDetails === type ? null : type);
  };

  if (loading || !legalInfo) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <Icon
            name='loader'
            className='w-8 h-8 text-primary animate-spin mx-auto mb-4'
          />
          <p className='text-muted-foreground'>Loading legal information...</p>
        </div>
      </div>
    );
  }

  const { holographic, witnessed } = legalInfo.willTypes;

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-6xl mx-auto px-6 py-16'>
        <FadeIn duration={0.6}>
          <div className='text-center mb-12'>
            <Icon
              name='document-text'
              className='w-12 h-12 text-primary mx-auto mb-6'
            />
            <h1 className='text-3xl font-bold mb-4'>Choose Your Will Type</h1>
            <div className='max-w-3xl mx-auto'>
              <div className='bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800'>
                <div className='flex items-start gap-4'>
                  <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                    <Icon name='sparkles' className='w-6 h-6 text-primary' />
                  </div>
                  <div className='text-left'>
                    <h3 className='font-semibold text-blue-900 dark:text-blue-200 mb-2'>
                      Sofia's Guidance
                    </h3>
                    <p className='text-blue-800 dark:text-blue-300'>
                      Excellent. Creating a will is an important act of care.
                      Under Slovak law, you have two main forms to choose from.
                      I'll help you select the right one for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='grid lg:grid-cols-2 gap-8 mb-8'>
            {/* Holographic Will */}
            <FadeIn duration={0.5} delay={0.2}>
              <Card
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedType === 'holographic'
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'hover:border-primary/50'
                }`}
              >
                <div className='flex items-start justify-between mb-4'>
                  <div>
                    <h3 className='text-xl font-semibold mb-2'>
                      {holographic.name}
                    </h3>
                    <Badge variant='outline' className='text-xs'>
                      {holographic.legalBasis}
                    </Badge>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedType === 'holographic'
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {selectedType === 'holographic' && (
                      <Icon name='check' className='w-4 h-4 text-white' />
                    )}
                  </div>
                </div>

                <p className='text-muted-foreground mb-4'>
                  {holographic.description}
                </p>

                <div className='space-y-4'>
                  <div>
                    <h4 className='font-medium text-sm mb-2 flex items-center gap-2'>
                      <Icon
                        name='check-circle'
                        className='w-4 h-4 text-green-600'
                      />
                      Advantages
                    </h4>
                    <ul className='text-sm text-muted-foreground space-y-1'>
                      {holographic.advantages
                        .slice(0, 2)
                        .map((advantage, idx) => (
                          <li key={idx} className='flex items-start gap-2'>
                            <span className='text-green-600 mt-1'>•</span>
                            {advantage}
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className='font-medium text-sm mb-2 flex items-center gap-2'>
                      <Icon name='info' className='w-4 h-4 text-blue-600' />
                      Key Requirements
                    </h4>
                    <ul className='text-sm text-muted-foreground space-y-1'>
                      {holographic.requirements.slice(0, 2).map((req, idx) => (
                        <li key={idx} className='flex items-start gap-2'>
                          <span className='text-blue-600 mt-1'>•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className='flex gap-3 mt-6'>
                  <Button
                    onClick={() => handleTypeSelect('holographic')}
                    variant={
                      selectedType === 'holographic' ? 'default' : 'outline'
                    }
                    className='flex-1'
                  >
                    Select This Type
                  </Button>
                  <Button
                    onClick={() => toggleDetails('holographic')}
                    variant='ghost'
                    size='sm'
                  >
                    <Icon name='info' className='w-4 h-4' />
                  </Button>
                </div>
              </Card>
            </FadeIn>

            {/* Witnessed Will */}
            <FadeIn duration={0.5} delay={0.4}>
              <Card
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedType === 'witnessed'
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'hover:border-primary/50'
                }`}
              >
                <div className='flex items-start justify-between mb-4'>
                  <div>
                    <h3 className='text-xl font-semibold mb-2'>
                      {witnessed.name}
                    </h3>
                    <Badge variant='outline' className='text-xs'>
                      {witnessed.legalBasis}
                    </Badge>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedType === 'witnessed'
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {selectedType === 'witnessed' && (
                      <Icon name='check' className='w-4 h-4 text-white' />
                    )}
                  </div>
                </div>

                <p className='text-muted-foreground mb-4'>
                  {witnessed.description}
                </p>

                <div className='space-y-4'>
                  <div>
                    <h4 className='font-medium text-sm mb-2 flex items-center gap-2'>
                      <Icon
                        name='check-circle'
                        className='w-4 h-4 text-green-600'
                      />
                      Advantages
                    </h4>
                    <ul className='text-sm text-muted-foreground space-y-1'>
                      {witnessed.advantages
                        .slice(0, 2)
                        .map((advantage, idx) => (
                          <li key={idx} className='flex items-start gap-2'>
                            <span className='text-green-600 mt-1'>•</span>
                            {advantage}
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className='font-medium text-sm mb-2 flex items-center gap-2'>
                      <Icon name='info' className='w-4 h-4 text-blue-600' />
                      Key Requirements
                    </h4>
                    <ul className='text-sm text-muted-foreground space-y-1'>
                      {witnessed.requirements.slice(0, 2).map((req, idx) => (
                        <li key={idx} className='flex items-start gap-2'>
                          <span className='text-blue-600 mt-1'>•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className='flex gap-3 mt-6'>
                  <Button
                    onClick={() => handleTypeSelect('witnessed')}
                    variant={
                      selectedType === 'witnessed' ? 'default' : 'outline'
                    }
                    className='flex-1'
                  >
                    Select This Type
                  </Button>
                  <Button
                    onClick={() => toggleDetails('witnessed')}
                    variant='ghost'
                    size='sm'
                  >
                    <Icon name='info' className='w-4 h-4' />
                  </Button>
                </div>
              </Card>
            </FadeIn>
          </div>

          {/* Detailed Information Panel */}
          {showDetails && (
            <FadeIn duration={0.3}>
              <Card className='p-6 bg-muted/30'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold'>
                    Detailed Information:{' '}
                    {legalInfo.willTypes[showDetails].name}
                  </h3>
                  <Button
                    onClick={() => setShowDetails(null)}
                    variant='ghost'
                    size='sm'
                  >
                    <Icon name="x" className='w-4 h-4' />
                  </Button>
                </div>

                <div className='grid md:grid-cols-3 gap-6'>
                  <div>
                    <h4 className='font-medium mb-3 flex items-center gap-2'>
                      <Icon
                        name="list"
                        className='w-4 h-4 text-blue-600'
                      />
                      Requirements
                    </h4>
                    <ul className='text-sm space-y-2'>
                      {legalInfo.willTypes[showDetails].requirements.map(
                        (req, idx) => (
                          <li key={idx} className='flex items-start gap-2'>
                            <span className='text-blue-600 mt-1 text-xs'>
                              •
                            </span>
                            {req}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className='font-medium mb-3 flex items-center gap-2'>
                      <Icon
                        name='check-circle'
                        className='w-4 h-4 text-green-600'
                      />
                      Advantages
                    </h4>
                    <ul className='text-sm space-y-2'>
                      {legalInfo.willTypes[showDetails].advantages.map(
                        (advantage, idx) => (
                          <li key={idx} className='flex items-start gap-2'>
                            <span className='text-green-600 mt-1 text-xs'>
                              •
                            </span>
                            {advantage}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className='font-medium mb-3 flex items-center gap-2'>
                      <Icon
                        name="alert-circle"
                        className='w-4 h-4 text-amber-600'
                      />
                      Considerations
                    </h4>
                    <ul className='text-sm space-y-2'>
                      {legalInfo.willTypes[showDetails].disadvantages.map(
                        (disadvantage, idx) => (
                          <li key={idx} className='flex items-start gap-2'>
                            <span className='text-amber-600 mt-1 text-xs'>
                              •
                            </span>
                            {disadvantage}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </Card>
            </FadeIn>
          )}

          {/* Navigation */}
          <div className='flex justify-between mt-8'>
            <Button onClick={onBack} variant='outline'>
              <Icon name="arrow-left" className='w-4 h-4 mr-2' />
              Back
            </Button>

            <Button
              onClick={handleContinue}
              disabled={!selectedType}
              className='bg-primary hover:bg-primary-hover text-primary-foreground'
            >
              Continue with{' '}
              {selectedType
                ? legalInfo.willTypes[selectedType].name
                : 'Selected Type'}
              <Icon name="arrow-right" className='w-4 h-4 ml-2' />
            </Button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};
