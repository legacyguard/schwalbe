
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon-library';
import type { WillData } from './WillWizard';
import type { WillType } from './WillTypeSelector';
import { useLocalization } from '@/contexts/LocalizationContext';
import { SealOfTrust } from './SealOfTrust';

interface LiveWillPreviewProps {
  currentStep: string;
  willData: WillData;
  willType: WillType;
}

export const LiveWillPreview: React.FC<LiveWillPreviewProps> = ({
  willData,
  willType,
  currentStep,
}) => {
  const { jurisdiction, currency } = useLocalization();

  // Helper function to format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '[Date to be filled]';
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  // Helper function to format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return '[Amount to be specified]';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderWillContent = () => {
    return (
      <div className='font-serif text-sm leading-relaxed text-gray-900 dark:text-gray-100'>
        {/* Header */}
        <div className='text-center mb-8 border-b-2 border-gray-300 pb-6'>
          <h1 className='text-2xl font-bold mb-2'>LAST WILL AND TESTAMENT</h1>
          <p className='text-lg'>(Last Will and Testament)</p>
          <div className='mt-4'>
            <Badge
              variant={willType === 'holographic' ? 'default' : 'secondary'}
            >
              {willType === 'holographic'
                ? 'Holographic Will'
                : 'Witnessed Will'}
            </Badge>
          </div>
        </div>

        {/* Declaration */}
        <div className='mb-6'>
          <p className='mb-4'>
            <strong>
              I, {willData.testator_data.fullName || '[Your Full Name]'}
            </strong>
            , born on {formatDate(willData.testator_data.dateOfBirth)} in [Place
            of Birth],
            {willData.testator_data.citizenship &&
              `citizen of ${willData.testator_data.citizenship}, `}
            currently residing at{' '}
            {willData.testator_data.address || '[Your Address]'}, being of sound
            mind and under no constraint or undue influence, do hereby make,
            publish, and declare this to be my Last Will and Testament, hereby
            revoking any and all former Wills and Codicils by me at any time
            heretofore made.
          </p>
        </div>

        {/* Article I - Declaration */}
        <div className='mb-6'>
          <h2 className='text-lg font-semibold mb-3 border-b border-gray-200 pb-1'>
            ARTICLE I - DECLARATION AND REVOCATION
          </h2>
          <p className='mb-3'>
            I declare that I am of sound mind. I make this Will voluntarily and
            am not acting under duress, fraud, or undue influence of any person
            whomsoever.
          </p>
          <p className='mb-3'>
            I hereby revoke all prior Wills and Codicils made by me.
          </p>

          {willType === 'holographic' && (
            <div className='bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-3'>
              <p className='text-blue-800 dark:text-blue-300 text-sm'>
                <strong>This is a holographic will</strong> written entirely in
                my own hand and signed by me, as permitted under the laws of{' '}
                {jurisdiction}.
              </p>
            </div>
          )}

          {willType === 'witnessed' && (
            <div className='bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-3'>
              <p className='text-green-800 dark:text-green-300 text-sm'>
                <strong>This will is made in the presence of witnesses</strong>{' '}
                as permitted under the laws of {jurisdiction}.
              </p>
            </div>
          )}
        </div>

        {/* Article II - Family Status */}
        <div className='mb-6'>
          <h2 className='text-lg font-semibold mb-3 border-b border-gray-200 pb-1'>
            ARTICLE II - FAMILY STATUS
          </h2>
          <p className='mb-2'>
            I am {willData.testator_data.maritalStatus || '[marital status]'}.
          </p>

          {/* Children section - highlight when on beneficiaries step */}
          <div
            className={`${currentStep === 'beneficiaries' ? 'bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-l-4 border-yellow-400' : ''}`}
          >
            {willData.beneficiaries.filter(b => b.relationship === 'child')
              .length > 0 ? (
              <div>
                <p className='mb-2'>I have the following children:</p>
                <ul className='list-disc list-inside ml-4'>
                  {willData.beneficiaries
                    .filter(b => b.relationship === 'child')
                    .map((child, idx) => (
                      <li key={idx}>{child.name}</li>
                    ))}
                </ul>
              </div>
            ) : (
              <p>
                I have{' '}
                {currentStep === 'beneficiaries'
                  ? '[children to be specified]'
                  : 'no children'}
                .
              </p>
            )}
          </div>
        </div>

        {/* Article III - Assets */}
        <div className='mb-6'>
          <h2 className='text-lg font-semibold mb-3 border-b border-gray-200 pb-1'>
            ARTICLE III - ASSETS AND PROPERTY
          </h2>

          <div
            className={`${currentStep === 'assets' ? 'bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-l-4 border-yellow-400' : ''}`}
          >
            <p className='mb-3'>I own the following assets and property:</p>

            {/* Real Estate */}
            {willData.assets.realEstate &&
            willData.assets.realEstate.length > 0 ? (
              <div className='mb-4'>
                <p className='font-medium mb-2'>Real Estate:</p>
                <ul className='list-disc list-inside ml-4'>
                  {willData.assets.realEstate.map((property, idx) => (
                    <li key={idx}>
                      {property.description} located at {property.address}
                      {property.value &&
                        `, estimated value: ${formatCurrency(property.value)}`}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              currentStep === 'assets' && (
                <p className='mb-4 text-gray-600 dark:text-gray-400 italic'>
                  [Real estate properties will appear here as you add them]
                </p>
              )
            )}

            {/* Bank Accounts */}
            {willData.assets.bankAccounts &&
            willData.assets.bankAccounts.length > 0 ? (
              <div className='mb-4'>
                <p className='font-medium mb-2'>Bank Accounts:</p>
                <ul className='list-disc list-inside ml-4'>
                  {willData.assets.bankAccounts.map((account, idx) => (
                    <li key={idx}>
                      {account.type} account at {account.bank}, account ending
                      in {account.accountNumber}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              currentStep === 'assets' && (
                <p className='mb-4 text-gray-600 dark:text-gray-400 italic'>
                  [Bank accounts will appear here as you add them]
                </p>
              )
            )}

            {/* Vehicles */}
            {willData.assets.vehicles && willData.assets.vehicles.length > 0 ? (
              <div className='mb-4'>
                <p className='font-medium mb-2'>Vehicles:</p>
                <ul className='list-disc list-inside ml-4'>
                  {willData.assets.vehicles.map((vehicle, idx) => (
                    <li key={idx}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                      {vehicle.vin && `, VIN: ${vehicle.vin}`}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              currentStep === 'assets' && (
                <p className='mb-4 text-gray-600 dark:text-gray-400 italic'>
                  [Vehicles will appear here as you add them]
                </p>
              )
            )}

            {/* Personal Property */}
            {willData.assets.personalProperty &&
            willData.assets.personalProperty.length > 0 ? (
              <div className='mb-4'>
                <p className='font-medium mb-2'>Personal Property:</p>
                <ul className='list-disc list-inside ml-4'>
                  {willData.assets.personalProperty.map((item, idx) => (
                    <li key={idx}>
                      {item.description}
                      {item.value &&
                        `, estimated value: ${formatCurrency(item.value)}`}
                      {item.recipient && `, designated for: ${item.recipient}`}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              currentStep === 'assets' && (
                <p className='mb-4 text-gray-600 dark:text-gray-400 italic'>
                  [Personal property will appear here as you add them]
                </p>
              )
            )}
          </div>
        </div>

        {/* Article IV - Bequests and Distributions */}
        <div className='mb-6'>
          <h2 className='text-lg font-semibold mb-3 border-b border-gray-200 pb-1'>
            ARTICLE IV - BEQUESTS AND DISTRIBUTIONS
          </h2>

          {/* Forced Heirs Notice for Slovak/Czech law */}
          {(jurisdiction === 'Slovakia' ||
            jurisdiction === 'Czech Republic') && (
            <div className='bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mb-4 border border-amber-200'>
              <h3 className='font-medium mb-2'>
                NOTICE REGARDING FORCED HEIRS:
              </h3>
              <p className='text-sm text-amber-800 dark:text-amber-300'>
                Under {jurisdiction} law, certain family members are entitled to
                forced inheritance shares. The distributions below respect these
                mandatory provisions.
              </p>
            </div>
          )}

          <div
            className={`${currentStep === 'beneficiaries' ? 'bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-l-4 border-yellow-400' : ''}`}
          >
            <p className='mb-4'>
              I give, devise, and bequeath my property as follows:
            </p>

            {willData.beneficiaries.length > 0 ? (
              willData.beneficiaries.map((beneficiary, _idx) => (
                <div
                  key={beneficiary.id}
                  className='mb-4 p-3 border border-gray-200 rounded'
                >
                  <p className='font-medium'>
                    To {beneficiary.name} ({beneficiary.relationship}):
                  </p>
                  <ul className='list-disc list-inside ml-4 mt-2'>
                    {beneficiary.percentage > 0 && (
                      <li>{beneficiary.percentage}% of my entire estate</li>
                    )}
                    {beneficiary.specificGifts &&
                      beneficiary.specificGifts.length > 0 && (
                        <li>
                          The following specific assets:{' '}
                          {beneficiary.specificGifts.join(', ')}
                        </li>
                      )}
                    {beneficiary.conditions && (
                      <li>
                        Subject to the following conditions:{' '}
                        {beneficiary.conditions}
                      </li>
                    )}
                  </ul>
                </div>
              ))
            ) : (
              <p className='text-gray-600 dark:text-gray-400 italic mb-4'>
                [Beneficiaries will appear here as you add them]
              </p>
            )}

            <div className='mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded'>
              <p className='font-medium'>RESIDUARY CLAUSE:</p>
              <p className='text-sm mt-1'>
                All the rest, residue, and remainder of my estate, both real and
                personal, of every kind and nature and wheresoever situate, I
                give, devise, and bequeath to my beneficiaries as specified
                above, or to their survivors per stirpes.
              </p>
            </div>
          </div>
        </div>

        {/* Article V - Executor */}
        <div className='mb-6'>
          <h2 className='text-lg font-semibold mb-3 border-b border-gray-200 pb-1'>
            ARTICLE V - EXECUTOR
          </h2>

          <div
            className={`${currentStep === 'executor' ? 'bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-l-4 border-yellow-400' : ''}`}
          >
            {willData.executor_data.primaryExecutor ? (
              <div>
                <p className='mb-2'>
                  I hereby nominate and appoint{' '}
                  <strong>{willData.executor_data.primaryExecutor.name}</strong>
                  as the Executor of this my Last Will and Testament.
                </p>
                {willData.executor_data.backupExecutor && (
                  <p className='mb-2'>
                    If {willData.executor_data.primaryExecutor.name} is unable
                    or unwilling to serve, I nominate{' '}
                    <strong>
                      {willData.executor_data.backupExecutor.name}
                    </strong>{' '}
                    as alternate Executor.
                  </p>
                )}
                <p className='mb-2'>
                  I direct that my Executor shall not be required to give bond
                  for the faithful performance of duties as Executor.
                </p>
              </div>
            ) : (
              <p className='text-gray-600 dark:text-gray-400 italic'>
                {currentStep === 'executor'
                  ? '[Executor information will appear here as you fill it in]'
                  : 'I do not appoint an Executor. The administration of my estate shall proceed according to law.'}
              </p>
            )}
          </div>
        </div>

        {/* Article VI - Final Wishes */}
        <div className='mb-6'>
          <h2 className='text-lg font-semibold mb-3 border-b border-gray-200 pb-1'>
            ARTICLE VI - SPECIAL WISHES AND INSTRUCTIONS
          </h2>

          <div
            className={`${currentStep === 'wishes' ? 'bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-l-4 border-yellow-400' : ''}`}
          >
            {willData.special_instructions.funeralWishes && (
              <div className='mb-3'>
                <p className='font-medium'>Funeral and Burial Instructions:</p>
                <p className='text-sm'>
                  {willData.special_instructions.funeralWishes}
                </p>
              </div>
            )}

            {willData.special_instructions.organDonation !== undefined && (
              <div className='mb-3'>
                <p className='font-medium'>Organ Donation:</p>
                <p className='text-sm'>
                  {willData.special_instructions.organDonation
                    ? 'I wish to donate my organs for transplantation and medical research.'
                    : 'I do not wish to donate my organs.'}
                </p>
              </div>
            )}

            {willData.special_instructions.digitalAssets && (
              <div className='mb-3'>
                <p className='font-medium'>Digital Assets and Accounts:</p>
                <p className='text-sm'>
                  {willData.special_instructions.digitalAssets}
                </p>
              </div>
            )}

            {willData.special_instructions.personalMessages &&
              willData.special_instructions.personalMessages.length > 0 && (
                <div className='mb-3'>
                  <p className='font-medium'>Personal Messages:</p>
                  {willData.special_instructions.personalMessages.map(
                    (message, idx) => (
                      <div key={idx} className='ml-4 mt-2'>
                        <p className='text-sm'>
                          <em>To {message.recipient}:</em> {message.message}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}

            {currentStep === 'wishes' &&
              !willData.special_instructions.funeralWishes &&
              !willData.special_instructions.digitalAssets &&
              (!willData.special_instructions.personalMessages ||
                willData.special_instructions.personalMessages.length ===
                  0) && (
                <p className='text-gray-600 dark:text-gray-400 italic'>
                  [Your special wishes and instructions will appear here as you
                  add them]
                </p>
              )}
          </div>
        </div>

        {/* Execution Section */}
        <div className='mt-8 border-t-2 border-gray-300 pt-6'>
          <h2 className='text-lg font-semibold mb-4'>EXECUTION</h2>

          {willType === 'holographic' ? (
            <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg'>
              <p className='font-medium mb-2'>HOLOGRAPHIC WILL EXECUTION:</p>
              <p className='text-sm mb-4'>
                This entire Will has been written in my own handwriting and is
                signed by me on this day.
              </p>
              <div className='border-t border-gray-300 pt-4'>
                <p className='text-sm mb-2'>
                  Signature: ________________________
                </p>
                <p className='text-sm mb-2'>
                  {willData.testator_data.fullName || '[Your Name]'}
                </p>
                <p className='text-sm'>Date: ____________________________</p>
              </div>
            </div>
          ) : (
            <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded-lg'>
              <p className='font-medium mb-2'>WITNESSED WILL EXECUTION:</p>
              <p className='text-sm mb-4'>
                I have signed this Will in the presence of the witnesses whose
                signatures appear below, and they have signed this Will in my
                presence and in the presence of each other.
              </p>
              <div className='border-t border-gray-300 pt-4 space-y-4'>
                <div>
                  <p className='text-sm'>
                    Testator's Signature: ________________________ Date:
                    ____________________
                  </p>
                  <p className='text-sm'>
                    {willData.testator_data.fullName || '[Your Name]'}
                  </p>
                </div>
                <div>
                  <p className='font-medium text-sm mb-2'>WITNESSES:</p>
                  <div className='space-y-3'>
                    <div>
                      <p className='text-sm'>
                        Witness 1 Signature: ________________________ Date:
                        ____________________
                      </p>
                      <p className='text-sm'>
                        Print Name: ________________________
                      </p>
                      <p className='text-sm'>
                        Address: ________________________
                      </p>
                    </div>
                    <div>
                      <p className='text-sm'>
                        Witness 2 Signature: ________________________ Date:
                        ____________________
                      </p>
                      <p className='text-sm'>
                        Print Name: ________________________
                      </p>
                      <p className='text-sm'>
                        Address: ________________________
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seal of Trust - Legal Authority Indicator */}
        <div className='mt-8'>
          <SealOfTrust variant='pdf' className='border-t-2 pt-6' />
        </div>
      </div>
    );
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-800'>
        <div className='flex items-center gap-3'>
          <Icon
            name="document-text"
            className='w-5 h-5 text-primary'
          />
          <h3 className='font-semibold'>Live Preview</h3>
          <SealOfTrust variant='compact' />
        </div>
        <Badge variant='outline' className='text-xs'>
          Updates in real-time
        </Badge>
      </div>

      {/* Paper-like document container */}
      <div className='flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900'>
        <div className='max-w-4xl mx-auto'>
          <Card className='min-h-[800px] p-8 bg-white dark:bg-gray-50 shadow-xl'>
            {renderWillContent()}
          </Card>
        </div>
      </div>
    </div>
  );
};
