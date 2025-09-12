/**
 * Professional Network Hooks
 * React hooks for professional network operations and B2B2C revenue streams
 */
import { useCallback, useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Mock react-query hooks
const useQuery = ({ queryKey: _queryKey, queryFn: _queryFn, staleTime: _staleTime }) => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
});
const useMutation = ({ mutationFn, onSuccess }) => ({
    mutateAsync: async (variables) => {
        const result = await mutationFn(variables);
        if (onSuccess)
            onSuccess(result, variables);
        return result;
    },
    isPending: false,
    error: null,
});
const useQueryClient = () => ({
    setQueryData: (_key, _data) => { },
    getQueryData: (_key) => null,
    invalidateQueries: (_key) => Promise.resolve(),
});
import { professionalNetwork, } from '@schwalbe/lib/professional-review-network';
export const useProfessionalNetwork = () => {
    const queryClient = useQueryClient();
    // Request attorney review
    const attorneyReviewMutation = useMutation({
        mutationFn: ({ willData, jurisdiction, options, }) => professionalNetwork.requestAttorneyReview(willData, jurisdiction, options),
        onSuccess: (data) => {
            queryClient.setQueryData(['review-request', data.id], data);
        },
    });
    // Get estate planner consultation offers
    const consultationOffersMutation = useMutation({
        mutationFn: (willData) => professionalNetwork.getEstateplannerConsultation(willData),
        onSuccess: (data) => {
            queryClient.setQueryData(['consultation-offers'], data);
        },
    });
    // Find notary services
    const notarySearchMutation = useMutation({
        mutationFn: ({ location, willData, preferences, }) => professionalNetwork.connectWithNotary(location, willData, preferences),
        onSuccess: (data) => {
            queryClient.setQueryData(['notary-matches'], data);
        },
    });
    // Submit will for review
    const submitReviewMutation = useMutation({
        mutationFn: (reviewRequest) => professionalNetwork.submitForReview(reviewRequest),
        onSuccess: (data, reviewRequest) => {
            queryClient.setQueryData(['review-feedback', reviewRequest.id], data);
        },
    });
    // Search professionals by type and filters
    const useSearchProfessionals = (type, filters = {}) => {
        return useQuery({
            queryKey: ['professionals', type, filters],
            queryFn: () => professionalNetwork.searchProfessionals(type, filters),
            staleTime: 5 * 60 * 1000, // 5 minutes
        });
    };
    // Hook for attorney review workflow
    const useAttorneyReview = () => {
        const [currentRequest, setCurrentRequest] = useState(null);
        const requestReview = useCallback(async (willData, jurisdiction, options) => {
            try {
                const request = await attorneyReviewMutation.mutateAsync({
                    willData,
                    jurisdiction,
                    options,
                });
                setCurrentRequest(request);
                return request;
            }
            catch (error) {
                console.error('Failed to request attorney review:', error);
                throw error;
            }
        }, []);
        const submitForReview = useCallback(async (reviewRequest) => {
            try {
                const feedback = await submitReviewMutation.mutateAsync(reviewRequest);
                return feedback;
            }
            catch (error) {
                console.error('Failed to submit for review:', error);
                throw error;
            }
        }, []);
        return {
            currentRequest,
            requestReview,
            submitForReview,
            isLoading: attorneyReviewMutation.isPending || submitReviewMutation.isPending,
            error: attorneyReviewMutation.error || submitReviewMutation.error,
        };
    };
    // Hook for estate planning consultation
    const useEstatePlanningConsultation = () => {
        const [currentOffers, setCurrentOffers] = useState([]);
        const getConsultationOffers = useCallback(async (willData) => {
            try {
                const offers = await consultationOffersMutation.mutateAsync(willData);
                setCurrentOffers(offers);
                return offers;
            }
            catch (error) {
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
        const [currentMatches, setCurrentMatches] = useState([]);
        const findNotaries = useCallback(async (location, willData, preferences) => {
            try {
                const matches = await notarySearchMutation.mutateAsync({
                    location,
                    willData,
                    preferences,
                });
                setCurrentMatches(matches);
                return matches;
            }
            catch (error) {
                console.error('Failed to find notaries:', error);
                throw error;
            }
        }, []);
        return {
            currentMatches,
            findNotaries,
            isLoading: notarySearchMutation.isPending,
            error: notarySearchMutation.error,
        };
    };
    // Composite hook for complete professional network workflow
    const useProfessionalReviewWorkflow = (willData, jurisdiction) => {
        const [activeService, setActiveService] = useState(null);
        const [reviewHistory, setReviewHistory] = useState([]);
        const attorneyReview = useAttorneyReview();
        const estatePlanning = useEstatePlanningConsultation();
        const notaryServices = useNotaryServices();
        const startAttorneyReview = useCallback(async (options) => {
            setActiveService('attorney');
            const request = await attorneyReview.requestReview(willData, jurisdiction, options);
            // Auto-submit for review if assigned
            if (request.status === 'assigned') {
                setTimeout(async () => {
                    const feedback = await attorneyReview.submitForReview(request);
                    setReviewHistory(prev => [...prev, feedback]);
                }, 3000); // Simulate review time
            }
            return request;
        }, [willData, jurisdiction, attorneyReview]);
        const startEstatePlanning = useCallback(async () => {
            setActiveService('planner');
            return await estatePlanning.getConsultationOffers(willData);
        }, [willData, estatePlanning]);
        const startNotarySearch = useCallback(async (location, preferences) => {
            setActiveService('notary');
            return await notaryServices.findNotaries(location, willData, preferences);
        }, [willData, notaryServices]);
        const isAnyServiceLoading = attorneyReview.isLoading ||
            estatePlanning.isLoading ||
            notaryServices.isLoading;
        const hasAnyError = attorneyReview.error || estatePlanning.error || notaryServices.error;
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
export const useProfessionalReviewWorkflow = (willData, jurisdiction) => {
    const { useProfessionalReviewWorkflow } = useProfessionalNetwork();
    return useProfessionalReviewWorkflow(willData, jurisdiction);
};
