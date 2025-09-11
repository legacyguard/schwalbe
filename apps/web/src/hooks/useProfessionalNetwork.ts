/**
 * Professional Network Hooks
 * React hooks for professional network operations and B2B2C revenue streams
 */

import { useCallback, useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Mock react-query hooks
const useQuery = ({ queryKey: _queryKey, queryFn: _queryFn, staleTime: _staleTime }: any) => ({
  data: null,
  isLoading: false,
  error: null,
  refetch: () => Promise.resolve(),
});

const useMutation = ({ mutationFn, onSuccess }: any) => ({
  mutateAsync: async (variables: any) => {
    const result = await mutationFn(variables);
    if (onSuccess) onSuccess(result, variables);
    return result;
  },
  isPending: false,
  error: null,
});

const useQueryClient = () => ({
  setQueryData: (_key: any, _data: any) => {},
  getQueryData: (_key: any) => null,
  invalidateQueries: (_key: any) => Promise.resolve(),
});

import type { WillData } from '@schwalbe/types/will';
import {
  type ConsultationOffer,
  type NotaryMatch,
  professionalNetwork,
  type ProfessionalType,
  type ReviewFeedback,
  type ReviewPriority,
  type ReviewRequest,
} from '@schwalbe/lib/professional-review-network';

interface AttorneyReviewOptions {
  budget?: { currency: string; max: number; min: number };
  preferredLanguage?: string;
  priority?: ReviewPriority;
  specificConcerns?: string[];
  timeline?: string;
}

interface NotarySearchOptions {
  language?: string;
  serviceType?:
    | 'document_certification'
    | 'full_notarization'
    | 'will_witnessing';
  timeframe?: string;
}

export const useProfessionalNetwork = () => {
  const queryClient = useQueryClient();

  // Request attorney review
  const attorneyReviewMutation = useMutation({
    mutationFn: ({
      willData,
      jurisdiction,
      options,
    }: {
      jurisdiction: string;
      options?: AttorneyReviewOptions;
      willData: WillData;
    }) =>
      professionalNetwork.requestAttorneyReview(
        willData,
        jurisdiction,
        options
      ),
    onSuccess: (data: ReviewRequest) => {
      queryClient.setQueryData(['review-request', data.id], data);
    },
  });

  // Get estate planner consultation offers
  const consultationOffersMutation = useMutation({
    mutationFn: (willData: WillData) =>
      professionalNetwork.getEstateplannerConsultation(willData),
    onSuccess: (data: ConsultationOffer[]) => {
      queryClient.setQueryData(['consultation-offers'], data);
    },
  });

  // Find notary services
  const notarySearchMutation = useMutation({
    mutationFn: ({
      location,
      willData,
      preferences,
    }: {
      location: string;
      preferences?: NotarySearchOptions;
      willData?: WillData;
    }) =>
      professionalNetwork.connectWithNotary(location, willData, preferences),
    onSuccess: (data: NotaryMatch[]) => {
      queryClient.setQueryData(['notary-matches'], data);
    },
  });

  // Submit will for review
  const submitReviewMutation = useMutation({
    mutationFn: (reviewRequest: ReviewRequest) =>
      professionalNetwork.submitForReview(reviewRequest),
    onSuccess: (data: ReviewFeedback, reviewRequest: ReviewRequest) => {
      queryClient.setQueryData(['review-feedback', reviewRequest.id], data);
    },
  });

  // Search professionals by type and filters
  const useSearchProfessionals = (
    type: ProfessionalType,
    filters: {
      availability?: string;
      jurisdiction?: string;
      language?: string;
      maxRate?: number;
      specialization?: string;
    } = {}
  ) => {
    return useQuery({
      queryKey: ['professionals', type, filters],
      queryFn: () => professionalNetwork.searchProfessionals(type, filters),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Hook for attorney review workflow
  const useAttorneyReview = () => {
    const [currentRequest, setCurrentRequest] = useState<null | ReviewRequest>(
      null
    );

    const requestReview = useCallback(
      async (
        willData: WillData,
        jurisdiction: string,
        options?: AttorneyReviewOptions
      ) => {
        try {
          const request = await attorneyReviewMutation.mutateAsync({
            willData,
            jurisdiction,
            options,
          });
          setCurrentRequest(request);
          return request;
        } catch (error) {
          console.error('Failed to request attorney review:', error);
          throw error;
        }
      },
      []
    );

    const submitForReview = useCallback(
      async (reviewRequest: ReviewRequest) => {
        try {
          const feedback =
            await submitReviewMutation.mutateAsync(reviewRequest);
          return feedback;
        } catch (error) {
          console.error('Failed to submit for review:', error);
          throw error;
        }
      },
      []
    );

    return {
      currentRequest,
      requestReview,
      submitForReview,
      isLoading:
        attorneyReviewMutation.isPending || submitReviewMutation.isPending,
      error: attorneyReviewMutation.error || submitReviewMutation.error,
    };
  };

  // Hook for estate planning consultation
  const useEstatePlanningConsultation = () => {
    const [currentOffers, setCurrentOffers] = useState<ConsultationOffer[]>([]);

    const getConsultationOffers = useCallback(async (willData: WillData) => {
      try {
        const offers = await consultationOffersMutation.mutateAsync(willData);
        setCurrentOffers(offers);
        return offers;
      } catch (error) {
        console.error('Failed to get consultation offers:', error);
        throw error;
      }
    }, []);

    return {
      currentOffers,
      getConsultationOffers,
      isLoading: consultationOffersMutation.isPending,
      error: consultationOffersMutation.error,
    };
  };

  // Hook for notary services
  const useNotaryServices = () => {
    const [currentMatches, setCurrentMatches] = useState<NotaryMatch[]>([]);

    const findNotaries = useCallback(
      async (
        location: string,
        willData?: WillData,
        preferences?: NotarySearchOptions
      ) => {
        try {
          const matches = await notarySearchMutation.mutateAsync({
            location,
            willData,
            preferences,
          });
          setCurrentMatches(matches);
          return matches;
        } catch (error) {
          console.error('Failed to find notaries:', error);
          throw error;
        }
      },
      []
    );

    return {
      currentMatches,
      findNotaries,
      isLoading: notarySearchMutation.isPending,
      error: notarySearchMutation.error,
    };
  };

  // Composite hook for complete professional network workflow
  const useProfessionalReviewWorkflow = (
    willData: WillData,
    jurisdiction: string
  ) => {
    const [activeService, setActiveService] = useState<
      'attorney' | 'notary' | 'planner' | null
    >(null);
    const [reviewHistory, setReviewHistory] = useState<ReviewFeedback[]>([]);

    const attorneyReview = useAttorneyReview();
    const estatePlanning = useEstatePlanningConsultation();
    const notaryServices = useNotaryServices();

    const startAttorneyReview = useCallback(
      async (options?: AttorneyReviewOptions) => {
        setActiveService('attorney');
        const request = await attorneyReview.requestReview(
          willData,
          jurisdiction,
          options
        );

        // Auto-submit for review if assigned
        if (request.status === 'assigned') {
          setTimeout(async () => {
            const feedback = await attorneyReview.submitForReview(request);
            setReviewHistory(prev => [...prev, feedback]);
          }, 3000); // Simulate review time
        }

        return request;
      },
      [willData, jurisdiction, attorneyReview]
    );

    const startEstatePlanning = useCallback(async () => {
      setActiveService('planner');
      return await estatePlanning.getConsultationOffers(willData);
    }, [willData, estatePlanning]);

    const startNotarySearch = useCallback(
      async (location: string, preferences?: NotarySearchOptions) => {
        setActiveService('notary');
        return await notaryServices.findNotaries(
          location,
          willData,
          preferences
        );
      },
      [willData, notaryServices]
    );

    const isAnyServiceLoading =
      attorneyReview.isLoading ||
      estatePlanning.isLoading ||
      notaryServices.isLoading;

    const hasAnyError =
      attorneyReview.error || estatePlanning.error || notaryServices.error;

    return {
      activeService,
      reviewHistory,
      attorneyReview,
      estatePlanning,
      notaryServices,
      startAttorneyReview,
      startEstatePlanning,
      startNotarySearch,
      isLoading: isAnyServiceLoading,
      error: hasAnyError,
    };
  };

  return {
    useSearchProfessionals,
    useAttorneyReview,
    useEstatePlanningConsultation,
    useNotaryServices,
    useProfessionalReviewWorkflow,

    // Direct mutations for advanced use cases
    attorneyReviewMutation,
    consultationOffersMutation,
    notarySearchMutation,
    submitReviewMutation,
  };
};

// Export individual hooks for specific use cases
export const useAttorneyReview = () => {
  const { useAttorneyReview } = useProfessionalNetwork();
  return useAttorneyReview();
};

export const useEstatePlanningConsultation = () => {
  const { useEstatePlanningConsultation } = useProfessionalNetwork();
  return useEstatePlanningConsultation();
};

export const useNotaryServices = () => {
  const { useNotaryServices } = useProfessionalNetwork();
  return useNotaryServices();
};

export const useProfessionalReviewWorkflow = (
  willData: WillData,
  jurisdiction: string
) => {
  const { useProfessionalReviewWorkflow } = useProfessionalNetwork();
  return useProfessionalReviewWorkflow(willData, jurisdiction);
};