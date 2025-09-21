
// Sofia Action Router - Handles actions from search without OpenAI
import type { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';
import i18n from '@/lib/i18n/config';
import { faqResponses, type SofiaAction } from './sofia-search-dictionary';
import type { DocumentFilter } from '../contexts/DocumentFilterContext';

export interface SofiaActionContext {
  navigate: NavigateFunction;
  onSofiaMessage?: (userMessage: string, sofiaResponse: string) => void;
  setDocumentFilter?: (filter: DocumentFilter) => void;
  userId?: string;
}

export const executeSofiaAction = async (
  action: SofiaAction,
  context: SofiaActionContext
): Promise<void> => {
  const {
    navigate,
    userId: _userId,
    setDocumentFilter,
    onSofiaMessage,
  } = context;

  switch (action.actionId) {
    case 'navigate':
      // Simple navigation
      const path = typeof action.payload === 'string' ? action.payload : '/';
      navigate(path);
      toast.success(`Navigated to ${path}`);

      if (onSofiaMessage) {
        onSofiaMessage(
          action.text,
          `Perfect! I've taken you to ${path}. What would you like to do here?`
        );
      }
      break;

    case 'filter_category': {
      // Filter documents by category
      navigate('/vault');

      const category = typeof action.payload === 'string' ? action.payload : 'all';
      const categoryDisplayName =
        category.charAt(0).toUpperCase() + category.slice(1);

      // Apply filter via context
      if (setDocumentFilter) {
        setDocumentFilter({ category });
      }

      if (onSofiaMessage) {
        onSofiaMessage(
          action.text,
          `Perfect! I've filtered your documents to show only ${categoryDisplayName} category. ${
            category === 'insurance'
              ? 'These are your insurance policies and related documents.'
              : category === 'legal'
                ? 'These are your legal documents including contracts and official papers.'
                : category === 'financial'
                  ? 'These are your financial documents including bank statements and tax records.'
                  : category === 'medical'
                    ? 'These are your healthcare documents and medical records.'
                    : category === 'personal'
                      ? 'These are your personal identification documents.'
                      : 'These are your important documents in this category.'
          }`
        );
      }

      toast.success(`Showing ${categoryDisplayName} documents`);
      break;
    }

    case 'filter_document_type': {
      // Filter documents by specific type
      navigate('/vault');

      const docType = typeof action.payload === 'string' ? action.payload : 'document';
      const typeDisplayName = docType
        .replace('_', ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase());

      // Apply document type filter
      if (setDocumentFilter) {
        setDocumentFilter({ documentType: docType });
      }

      if (onSofiaMessage) {
        onSofiaMessage(
          action.text,
          `Perfect! I've found your ${typeDisplayName} documents. ${
            docType === 'passport'
              ? 'Remember to check the expiration date and renew if needed.'
              : docType === 'bank_statement'
                ? 'These statements help track your financial history.'
                : 'These documents are important for your records.'
          }`
        );
      }

      toast.success(`Showing ${typeDisplayName} documents`);
      break;
    }

    case 'filter_expiring': {
      // Show documents expiring soon
      navigate('/vault');

      const payload = typeof action.payload === 'object' ? action.payload : {};
      const days = payload.days || 30;

      // Apply expiring filter
      if (setDocumentFilter) {
        setDocumentFilter({ isExpiring: true, expiringDays: days });
      }

      if (onSofiaMessage) {
        onSofiaMessage(
          action.text,
          `Perfect! Here are documents expiring within ${days} days. I recommend setting calendar reminders for renewal dates. Your guardians can also help you keep track of important expiration dates.`
        );
      }

      toast.success(`Showing documents expiring in ${days} days`);
      break;
    }

    case 'navigate_and_suggest': {
      // Navigate and provide contextual suggestion
      const payload = typeof action.payload === 'object' ? action.payload : {};
      const { url, suggestion, category: _suggestedCategory } = payload as {
        category?: string;
        suggestion: string;
        url: string;
      };
      navigate(url || '/');

      if (onSofiaMessage) {
        let suggestionText = '';
        if (
          suggestion.includes('poistka') ||
          suggestion.includes('insurance')
        ) {
          suggestionText = `I see you want to add insurance documents. Click "AI Scan Mode" to automatically extract policy details, or use "Manual Entry" if you prefer to enter information yourself. I can help categorize it properly.`;
        } else if (
          suggestion.includes('guardian') ||
          suggestion.includes('strážcu')
        ) {
          suggestionText = `Adding a guardian is a wise decision! Click "Add Guardian" and I'll guide you through selecting someone who truly understands your values and will honor your wishes.`;
        } else {
          suggestionText = `I've brought you here to help with "${suggestion}". Look for the relevant buttons or forms on this page, and I'm here if you need guidance.`;
        }

        onSofiaMessage(action.text, suggestionText);
      }

      toast.success(`Ready to help with: ${suggestion}`);
      break;
    }

    case 'show_faq': {
      // Display FAQ response
      const faqKey = typeof action.payload === 'string' ? action.payload : 'general';
      const response = faqResponses[faqKey];

      if (response && onSofiaMessage) {
        onSofiaMessage(action.text, response);
      } else {
        toast.error('Information not available at the moment');
      }
      break;
    }

    case 'filter_learned_category': {
      // Filter by category learned from user's documents
      navigate('/vault');

      const payload = typeof action.payload === 'object' ? action.payload : {};
      const { searchTerm, category, matchedCount } = payload as {
        category: string;
        matchedCount: number;
        searchTerm: string;
      };

      if (setDocumentFilter) {
        setDocumentFilter({ category });
      }

      if (onSofiaMessage) {
        onSofiaMessage(
          action.text,
          `Perfect! I found ${matchedCount} documents related to "${searchTerm}". I've filtered your vault to show only these relevant documents. This is exactly the kind of intelligent assistance I love providing - learning from your document patterns to help you faster!`
        );
      }

      toast.success(
        `Found ${matchedCount} documents related to "${searchTerm}"`
      );
      break;
    }

    case 'open_specific_document': {
      // Navigate to vault and highlight specific document
      navigate('/vault');

      const payload = typeof action.payload === 'object' ? action.payload : {};
      const { documentId: _documentId, documentTitle } = payload as {
        documentId: string;
        documentTitle: string;
      };

      // TODO: Implement document highlighting in vault
      // For now, just navigate and provide feedback

      if (onSofiaMessage) {
        onSofiaMessage(
          action.text,
          `I've taken you to your vault and located "${documentTitle}". This is one of the documents I remembered from your search. Smart document discovery like this is one of my favorite features - I learn from your document library to provide instant access to what you need!`
        );
      }

      toast.success(`Opening "${documentTitle}"`);
      break;
    }

    case 'create_smart_filter': {
      // Create a smart filter based on learned patterns
      navigate('/vault');

      const payload = typeof action.payload === 'object' ? action.payload : {};
      const { searchTerm, category, documentIds } = payload as {
        category: string;
        documentIds: string[];
        searchTerm: string;
      };

      // Apply the smart filter
      if (setDocumentFilter) {
        setDocumentFilter({
          category,
          searchQuery: searchTerm, // Custom search filter
        });
      }

      if (onSofiaMessage) {
        onSofiaMessage(
          action.text,
          `Brilliant! I've created a smart filter for your "${searchTerm}" documents. This filter will help you quickly find similar documents in the future. I'm constantly learning from your document patterns to make your experience more intuitive. You now have ${documentIds.length} documents in this smart collection!`
        );
      }

      toast.success(`Created smart filter for "${searchTerm}" documents`);
      break;
    }

    case 'celebrate_milestone': {
      // Celebrate milestone achievement
      const payload = typeof action.payload === 'object' ? action.payload : {};
      const { milestoneName, milestoneDescription } = payload as {
        milestoneDescription: string;
        milestoneName: string;
      };

      if (onSofiaMessage) {
        onSofiaMessage(
          action.text,
          `🎉 Amazing! You've just unlocked the milestone "${milestoneName}"! ${milestoneDescription} This is truly a beautiful moment on your Path of Serenity.`
        );
      }

      toast.success(
        i18n.t('features.sofia.guidance:milestones.unlocked', { milestoneName })
      );
      break;
    }

    case 'start_challenge': {
      // Start a 5-minute challenge
      const payload = typeof action.payload === 'object' ? action.payload : {};
      const { challengeTitle, navigationTarget } = payload as {
        challengeTitle: string;
        navigationTarget: string;
      };

      navigate(navigationTarget);

      if (onSofiaMessage) {
        onSofiaMessage(
          action.text,
          `We've started the challenge "${challengeTitle}"! I'll guide you step by step. Regardless of how you feel, remember - every small step is progress toward greater certainty for your family.`
        );
      }

      toast.success(
        i18n.t('features.sofia.guidance:challenges.started', { challengeTitle })
      );
      break;
    }

    case 'show_serenity_guidance': {
      // Provide guidance about Path of Serenity
      if (onSofiaMessage) {
        onSofiaMessage(
          action.text,
          `The Path of Serenity is not about percentages or numbers - it's about the certainty and peace you create for your family. Every milestone you unlock is proof of your love and care. It doesn't matter how quickly you progress, but that you continue.`
        );
      }
      break;
    }

    case 'filter_bundle': {
      // Filter documents by bundle
      navigate('/vault');

      const payload = typeof action.payload === 'object' ? action.payload : {};
      const { bundleName, primaryEntity } = payload as {
        bundleName: string;
        primaryEntity?: string;
      };

      // Apply bundle filter
      if (setDocumentFilter) {
        setDocumentFilter({
          bundleName: bundleName,
          searchQuery: primaryEntity, // Search by entity too
        });
      }

      if (onSofiaMessage) {
        onSofiaMessage(
          action.text,
          `Perfect! I've found your "${bundleName}" bundle. ${primaryEntity ? `This contains all documents related to ${primaryEntity}.` : ''} Bundle organization helps keep related documents together automatically. What would you like to do with these documents?`
        );
      }

      toast.success(`Showing bundle: ${bundleName}`);
      break;
    }

    case 'show_bundle_info': {
      // Display information about bundles
      if (onSofiaMessage) {
        onSofiaMessage(
          action.text,
          `📦 Document bundles are smart collections that automatically group related documents. For example:\n\n• Vehicle bundles contain insurance, registration, service records\n• Property bundles include deeds, insurance, utility bills\n• Financial bundles group bank statements, contracts, cards\n\nAI creates these automatically when you upload documents, making organization effortless!`
        );
      }
      break;
    }

    case 'list_user_bundles': {
      // This would require actual database query in real implementation
      // For now, provide general guidance
      navigate('/vault');

      if (onSofiaMessage) {
        onSofiaMessage(
          action.text,
          `I've taken you to your vault where you can see all your document bundles. Each bundle represents a real-world entity like a vehicle, property, or financial account. You can click on any bundle to see all related documents grouped together.`
        );
      }

      toast.success('Showing your document bundles');
      break;
    }

    default:
      console.warn('Unknown Sofia action:', action.actionId);
      toast.error('Action not recognized');
  }
};

// Helper to create user-friendly messages based on search context
export const generateContextualMessage = (
  searchQuery: string,
  action: SofiaAction
): string => {
  const query = searchQuery.toLowerCase();

  if (query.includes('poistka') || query.includes('insurance')) {
    return `I understand you're looking for insurance-related information. Let me help you ${action.text.toLowerCase()}.`;
  }

  if (query.includes('pas') || query.includes('passport')) {
    return `Looking for passport information? I'll ${action.text.toLowerCase()} for you.`;
  }

  if (query.includes('guardian') || query.includes('strážca')) {
    return `Guardian-related question detected. Let me ${action.text.toLowerCase()}.`;
  }

  return `Based on your search for "${searchQuery}", I'll ${action.text.toLowerCase()}.`;
};
