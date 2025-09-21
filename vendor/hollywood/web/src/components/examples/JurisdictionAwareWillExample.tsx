/**
 * Jurisdiction-Aware Will Translation Example
 * Demonstrates how translations work based on jurisdiction and language
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useJurisdictionAwareTranslation } from '@/lib/i18n/jurisdiction-aware-hooks';
import type { SupportedJurisdictionCode, SupportedLanguageCode } from '@/lib/i18n/config';

const JurisdictionAwareWillExample: React.FC = () => {
  const { i18n } = useTranslation();
  const [jurisdiction, setJurisdiction] = useState<SupportedJurisdictionCode>('SK');
  const [uiLanguage, setUiLanguage] = useState<SupportedLanguageCode>('sk');

  // Use jurisdiction-aware translation hook
  const { t, isContentLoaded, loadError } = useJurisdictionAwareTranslation(jurisdiction, 'wills');

  // Change UI language when selection changes
  useEffect(() => {
    i18n.changeLanguage(uiLanguage);
  }, [uiLanguage, i18n]);

  // Test data for displaying will content
  const testData = {
    fullName: 'Ján Novák',
    dateOfBirth: '01.01.1970',
    address: 'Bratislava, Slovensko',
    citizenship: 'slovenské',
    city: 'Bratislava',
    date: new Date().toLocaleDateString(uiLanguage === 'cs' ? 'cs-CZ' : 'sk-SK')
  };

  // Format currency based on jurisdiction
  const formatCurrency = (amount: number) => {
    const currency = jurisdiction === 'CZ' ? 'CZK' : 'EUR';
    const locale = uiLanguage === 'cs' ? 'cs-CZ' : 'sk-SK';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Jurisdiction-Aware Will Translation Demo
      </h1>

      {/* Control Panel */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-3">Settings</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* UI Language Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              UI Language (User Preference)
            </label>
            <select
              value={uiLanguage}
              onChange={(e) => setUiLanguage(e.target.value as SupportedLanguageCode)}
              className="w-full p-2 border rounded"
            >
              <option value="sk">Slovenčina</option>
              <option value="cs">Čeština</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Jurisdiction Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Legal Jurisdiction
            </label>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value as SupportedJurisdictionCode)}
              className="w-full p-2 border rounded"
            >
              <option value="SK">Slovakia (SK)</option>
              <option value="CZ">Czech Republic (CZ)</option>
            </select>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-4 text-sm">
          <p>
            <strong>Active Configuration:</strong> {uiLanguage.toUpperCase()} language, {jurisdiction} law
          </p>
          <p>
            <strong>Translation File:</strong> {uiLanguage}_{jurisdiction}.json
          </p>
          {loadError && (
            <p className="text-red-600">
              <strong>Error:</strong> {loadError}
            </p>
          )}
          {!isContentLoaded && !loadError && (
            <p className="text-yellow-600">Loading translations...</p>
          )}
        </div>
      </div>

      {/* Will Content Display */}
      {isContentLoaded && (
        <div className="bg-white border rounded p-6">
          <h2 className="text-xl font-bold mb-4">
            {String(t('title'))}
          </h2>

          <div className="mb-4 text-sm text-gray-600">
            <p><strong>{String(t('jurisdiction'))}:</strong> {jurisdiction === 'CZ' ? 'Česká republika' : 'Slovenská republika'}</p>
            <p><strong>{String(t('language'))}:</strong> {uiLanguage === 'cs' ? 'Čeština' : uiLanguage === 'sk' ? 'Slovenčina' : 'English'}</p>
          </div>

          <div className="prose max-w-none">
            {/* Legal Notice */}
            <div className="bg-yellow-50 p-3 rounded mb-4">
              <p className="text-sm">{String(t('legalNotice'))}</p>
            </div>

            {/* Testator Section */}
            <section className="mb-6">
              <h3 className="font-semibold">{String(t('sections.testator.title'))}</h3>
              <p>{String(t('sections.testator.declaration', testData))}</p>
              <p>{String(t('sections.testator.mentalCapacity'))}</p>
            </section>

            {/* Forced Heirs Section (jurisdiction-specific) */}
            <section className="mb-6">
              <h3 className="font-semibold">{String(t('sections.forcedHeirs.title'))}</h3>
              <p>{String(t('sections.forcedHeirs.notice'))}</p>
              <ul className="list-disc ml-6">
                <li>{String(t('sections.forcedHeirs.minorChildren'))}</li>
                <li>{String(t('sections.forcedHeirs.adultChildren'))}</li>
              </ul>
            </section>

            {/* Legal Requirements */}
            <section className="mb-6">
              <h3 className="font-semibold">Legal Requirements</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium">Holographic</h4>
                  <p>{String(t('legalRequirements.formTypes.holographic'))}</p>
                </div>
                <div>
                  <h4 className="font-medium">Allographic</h4>
                  <p>{String(t('legalRequirements.formTypes.allographic'))}</p>
                </div>
                <div>
                  <h4 className="font-medium">Notarial</h4>
                  <p>{String(t('legalRequirements.formTypes.notarial'))}</p>
                </div>
              </div>
            </section>

            {/* Signature Section */}
            <section className="mb-6">
              <h3 className="font-semibold">{String(t('sections.signature.title'))}</h3>
              <p>{String(t('sections.signature.date', testData))}</p>
            </section>
          </div>
        </div>
      )}

      {/* Test Scenarios */}
      <div className="mt-6 bg-blue-50 p-4 rounded">
        <h3 className="font-semibold mb-3">Test Scenarios</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>SK + Slovak:</strong> Slovak law in Slovak language (native)
          </li>
          <li>
            <strong>SK + Czech:</strong> Slovak law in Czech language (cross-border)
          </li>
          <li>
            <strong>CZ + Czech:</strong> Czech law in Czech language (native)
          </li>
          <li>
            <strong>CZ + Slovak:</strong> Czech law in Slovak language (cross-border)
          </li>
          <li>
            <strong>Any + English:</strong> Fallback to English if translation missing
          </li>
        </ul>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Currency Formatting Test</h4>
          <p>Amount: {formatCurrency(15000)}</p>
          <p className="text-xs text-gray-600">
            (Should show EUR for SK, CZK for CZ)
          </p>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Fallback Chain</h4>
          <ol className="list-decimal list-inside text-xs">
            <li>User selected language + jurisdiction</li>
            <li>Jurisdiction default language</li>
            <li>English (global fallback)</li>
            <li>UI namespace (ultimate fallback)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default JurisdictionAwareWillExample;
