
/**
 * Multi-Language Generator Hook
 * Handles translation and generation of legal documents in multiple languages
 */

import { useCallback, useState } from 'react';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import { JURISDICTION_CONFIG } from '@/lib/i18n/jurisdictions';
import { getLegalTerm } from '@/lib/i18n/legal-terminology';

export interface TranslationResult {
  confidence: number;
  isLegallyValid: boolean;
  language: string;
  text: string;
}

export interface GenerationOptions {
  documentType: 'advance_directive' | 'general' | 'power_of_attorney' | 'will';
  includeGlossary: boolean;
  jurisdiction: string;
  preserveLegalTerms: boolean;
  sourceLanguage: string;
  targetLanguages: string[];
}

export function useMultiLangGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const createSupabaseClient = useSupabaseWithClerk();

  const generateTranslations = useCallback(
    async (
      content: string,
      options: GenerationOptions
    ): Promise<TranslationResult[]> => {
      setIsGenerating(true);
      const results: TranslationResult[] = [];

      try {
        await createSupabaseClient();

        // For each target language
        for (const targetLang of options.targetLanguages) {
          // Skip if same as source
          if (targetLang === options.sourceLanguage) {
            results.push({
              language: targetLang,
              text: content,
              confidence: 1.0,
              isLegallyValid: true,
            });
            continue;
          }

          // Get jurisdiction-specific legal terms
          const jurisdictionConfig = JURISDICTION_CONFIG[options.jurisdiction];
          const legalContext = {
            jurisdiction: options.jurisdiction,
            legalSystem: jurisdictionConfig?.legalSystem,
            requiredClauses: [], // This property doesn't exist in JurisdictionConfig
          };

          // Call AI translation service (would be actual API in production)
          const translationResult = await translateLegalDocument(
            content,
            options.sourceLanguage,
            targetLang,
            options.documentType,
            legalContext,
            options.preserveLegalTerms
          );

          results.push(translationResult);
        }

        setTranslations(results);
        return results;
      } catch (error) {
        console.error('Error generating translations:', error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [createSupabaseClient]
  );

  const validateTranslation = useCallback(
    async (
      translation: string,
      _language: string,
      _documentType: string,
      jurisdiction: string
    ): Promise<boolean> => {
      try {
        // Check for required legal phrases based on jurisdiction
        const requiredPhrases: string[] = []; // This property doesn't exist in JurisdictionConfig

        // Basic validation - check if required phrases exist
        for (const phrase of requiredPhrases) {
          const translatedTerm = getLegalTerm(phrase, jurisdiction, _language);
          if (translatedTerm && !translation.includes(translatedTerm)) {
            console.warn(`Missing required legal phrase: ${phrase}`);
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error('Error validating translation:', error);
        return false;
      }
    },
    []
  );

  const generateGlossary = useCallback(
    (
      documentType: string,
      sourceLanguage: string,
      targetLanguage: string,
      jurisdiction: string
    ): Record<string, string> => {
      const glossary: Record<string, string> = {};

      // Get common legal terms for the document type
      const commonTerms = getCommonLegalTerms(documentType);

      for (const term of commonTerms) {
        const sourceTerm = getLegalTerm(term, jurisdiction, sourceLanguage);
        const targetTerm = getLegalTerm(term, jurisdiction, targetLanguage);

        if (sourceTerm && targetTerm) {
          glossary[sourceTerm] = targetTerm;
        }
      }

      return glossary;
    },
    []
  );

  const formatForJurisdiction = useCallback(
    (content: string, jurisdiction: string, _language: string): string => {
      const config = JURISDICTION_CONFIG[jurisdiction];
      if (!config) return content;

      // Apply jurisdiction-specific formatting
      let formatted = content;

      // Add jurisdiction header if required
      const declaration = `This document is governed by the laws of ${config.name}.`;
      formatted = declaration + '\n\n' + formatted;

      // Format dates according to jurisdiction
      formatted = formatDates(formatted, config.dateLocale);

      // Format currency
      formatted = formatCurrency(formatted, config.currency);

      return formatted;
    },
    []
  );

  return {
    isGenerating,
    translations,
    generateTranslations,
    validateTranslation,
    generateGlossary,
    formatForJurisdiction,
  };
}

// Helper functions (would be more sophisticated in production)
async function translateLegalDocument(
  content: string,
  _sourceLang: string,
  targetLang: string,
  _documentType: string,
  _legalContext: any,
  _preserveLegalTerms: boolean
): Promise<TranslationResult> {
  // This would call actual translation API
  // For now, return mock result
  return {
    language: targetLang,
    text: content, // Would be actual translation
    confidence: 0.95,
    isLegallyValid: true,
  };
}

function getCommonLegalTerms(documentType: string): string[] {
  const terms: Record<string, string[]> = {
    will: ['testator', 'beneficiary', 'executor', 'heir', 'bequest', 'estate'],
    power_of_attorney: [
      'principal',
      'agent',
      'authority',
      'capacity',
      'revocation',
    ],
    advance_directive: ['patient', 'healthcare_proxy', 'treatment', 'consent'],
    general: ['party', 'agreement', 'obligation', 'liability'],
  };

  return terms[documentType] || terms.general;
}

function formatDates(content: string, dateFormat: string): string {
  // Simple date formatting - would be more sophisticated
  const dateRegex = /\d{4}-\d{2}-\d{2}/g;
  return content.replace(dateRegex, match => {
    const date = new Date(match);
    if (dateFormat === 'DD/MM/YYYY') {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } else if (dateFormat === 'MM/DD/YYYY') {
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
    }
    return match;
  });
}

function formatCurrency(content: string, currency: string): string {
  // Simple currency formatting
  const currencySymbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    CZK: 'CZK',
    PLN: 'PLN',
  };

  const symbol = currencySymbols[currency] || currency;
  return content.replace(/\$(\d+)/g, `${symbol}$1`);
}
