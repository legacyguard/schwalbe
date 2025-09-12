/**
 * Professional Network Hooks
 * React hooks for professional network operations and B2B2C revenue streams
 */
import type { WillData } from '@schwalbe/types/will';
import { type ProfessionalType, type ReviewPriority, type ReviewRequest } from '@schwalbe/lib/professional-review-network';
interface AttorneyReviewOptions {
    budget?: {
        currency: string;
        max: number;
        min: number;
    };
    preferredLanguage?: string;
    priority?: ReviewPriority;
    specificConcerns?: string[];
    timeline?: string;
}
interface NotarySearchOptions {
    language?: string;
    serviceType?: 'document_certification' | 'full_notarization' | 'will_witnessing';
    timeframe?: string;
}
export declare const useProfessionalNetwork: () => {
    useSearchProfessionals: (type: ProfessionalType, filters?: {
        availability?: string;
        jurisdiction?: string;
        language?: string;
        maxRate?: number;
        specialization?: string;
    }) => {
        data: null;
        isLoading: boolean;
        error: null;
        refetch: () => Promise<void>;
    };
    useAttorneyReview: () => {
        currentRequest: any;
        requestReview: (willData: WillData, jurisdiction: string, options?: AttorneyReviewOptions) => Promise<any>;
        submitForReview: (reviewRequest: ReviewRequest) => Promise<any>;
        isLoading: boolean;
        error: null;
    };
    useEstatePlanningConsultation: () => {
        currentOffers: ConsultationOffer[];
        getConsultationOffers: (willData: WillData) => Promise<any>;
        isLoading: boolean;
        error: null;
    };
    useNotaryServices: () => {
        currentMatches: NotaryMatch[];
        findNotaries: (location: string, willData?: WillData, preferences?: NotarySearchOptions) => Promise<any>;
        isLoading: boolean;
        error: null;
    };
    useProfessionalReviewWorkflow: (willData: WillData, jurisdiction: string) => {
        activeService: "attorney" | "notary" | "planner" | null;
        reviewHistory: ReviewFeedback[];
        attorneyReview: {
            currentRequest: any;
            requestReview: (willData: WillData, jurisdiction: string, options?: AttorneyReviewOptions) => Promise<any>;
            submitForReview: (reviewRequest: ReviewRequest) => Promise<any>;
            isLoading: boolean;
            error: null;
        };
        estatePlanning: {
            currentOffers: ConsultationOffer[];
            getConsultationOffers: (willData: WillData) => Promise<any>;
            isLoading: boolean;
            error: null;
        };
        notaryServices: {
            currentMatches: NotaryMatch[];
            findNotaries: (location: string, willData?: WillData, preferences?: NotarySearchOptions) => Promise<any>;
            isLoading: boolean;
            error: null;
        };
        startAttorneyReview: (options?: AttorneyReviewOptions) => Promise<any>;
        startEstatePlanning: () => Promise<any>;
        startNotarySearch: (location: string, preferences?: NotarySearchOptions) => Promise<any>;
        isLoading: boolean;
        error: null;
    };
    attorneyReviewMutation: {
        mutateAsync: (variables: any) => Promise<any>;
        isPending: boolean;
        error: null;
    };
    consultationOffersMutation: {
        mutateAsync: (variables: any) => Promise<any>;
        isPending: boolean;
        error: null;
    };
    notarySearchMutation: {
        mutateAsync: (variables: any) => Promise<any>;
        isPending: boolean;
        error: null;
    };
    submitReviewMutation: {
        mutateAsync: (variables: any) => Promise<any>;
        isPending: boolean;
        error: null;
    };
};
export declare const useAttorneyReview: () => {
    currentRequest: any;
    requestReview: (willData: WillData, jurisdiction: string, options?: AttorneyReviewOptions) => Promise<any>;
    submitForReview: (reviewRequest: ReviewRequest) => Promise<any>;
    isLoading: boolean;
    error: null;
};
export declare const useEstatePlanningConsultation: () => {
    currentOffers: ConsultationOffer[];
    getConsultationOffers: (willData: WillData) => Promise<any>;
    isLoading: boolean;
    error: null;
};
export declare const useNotaryServices: () => {
    currentMatches: NotaryMatch[];
    findNotaries: (location: string, willData?: WillData, preferences?: NotarySearchOptions) => Promise<any>;
    isLoading: boolean;
    error: null;
};
export declare const useProfessionalReviewWorkflow: (willData: WillData, jurisdiction: string) => {
    activeService: "attorney" | "notary" | "planner" | null;
    reviewHistory: ReviewFeedback[];
    attorneyReview: {
        currentRequest: any;
        requestReview: (willData: WillData, jurisdiction: string, options?: AttorneyReviewOptions) => Promise<any>;
        submitForReview: (reviewRequest: ReviewRequest) => Promise<any>;
        isLoading: boolean;
        error: null;
    };
    estatePlanning: {
        currentOffers: ConsultationOffer[];
        getConsultationOffers: (willData: WillData) => Promise<any>;
        isLoading: boolean;
        error: null;
    };
    notaryServices: {
        currentMatches: NotaryMatch[];
        findNotaries: (location: string, willData?: WillData, preferences?: NotarySearchOptions) => Promise<any>;
        isLoading: boolean;
        error: null;
    };
    startAttorneyReview: (options?: AttorneyReviewOptions) => Promise<any>;
    startEstatePlanning: () => Promise<any>;
    startNotarySearch: (location: string, preferences?: NotarySearchOptions) => Promise<any>;
    isLoading: boolean;
    error: null;
};
export {};
//# sourceMappingURL=useProfessionalNetwork.d.ts.map