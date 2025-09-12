/**
 * Professional Network Service
 * Handles attorney applications, verification, and marketplace operations
 */
type Database = any;
type ProfessionalReviewer = Database['public']['Tables']['professional_reviewers']['Row'];
type ProfessionalOnboarding = Database['public']['Tables']['professional_onboarding']['Row'];
type ProfessionalOnboardingInsert = Database['public']['Tables']['professional_onboarding']['Insert'];
type DocumentReview = Database['public']['Tables']['document_reviews']['Row'];
type ReviewRequest = Database['public']['Tables']['review_requests']['Row'];
type ReviewRequestInsert = Database['public']['Tables']['review_requests']['Insert'];
type ReviewResultInsert = Database['public']['Tables']['review_results']['Insert'];
type ProfessionalSpecialization = Database['public']['Tables']['professional_specializations']['Row'];
type ProfessionalSpecializationInsert = Database['public']['Tables']['professional_specializations']['Insert'];
type Consultation = Database['public']['Tables']['consultations']['Row'];
export declare class ProfessionalService {
    private static instance;
    static getInstance(): ProfessionalService;
    submitApplication(application: Omit<ProfessionalOnboardingInsert, 'created_at' | 'id' | 'updated_at'>): Promise<ProfessionalOnboarding>;
    getApplication(id: string): Promise<null | ProfessionalOnboarding>;
    getApplicationByUserId(userId: string): Promise<null | ProfessionalOnboarding>;
    updateApplicationStatus(id: string, status: ProfessionalOnboarding['verification_status'], reviewNotes?: string): Promise<ProfessionalOnboarding>;
    createReviewerProfile(onboarding: ProfessionalOnboarding, _userId: string): Promise<ProfessionalReviewer>;
    getReviewer(id: string): Promise<null | ProfessionalReviewer>;
    updateReviewer(id: string, updates: Partial<ProfessionalReviewer>): Promise<ProfessionalReviewer>;
    searchReviewers(filters: {
        jurisdiction?: string;
        ratingMin?: number;
        specializations?: string[];
        verified?: boolean;
    }): Promise<ProfessionalReviewer[]>;
    createReviewRequest(request: Omit<ReviewRequestInsert, 'created_at' | 'id' | 'updated_at'>): Promise<ReviewRequest>;
    assignReviewRequest(requestId: string, reviewerId: string): Promise<DocumentReview>;
    updateDocumentReview(reviewId: string, status: DocumentReview['status'], result?: Partial<ReviewResultInsert>): Promise<DocumentReview>;
    getNetworkDirectory(filters?: {
        jurisdiction?: string;
        rating?: number;
        specialization?: string;
    }): Promise<ProfessionalReviewer[]>;
    getReviewPricing(): Promise<{
        basic: number;
        certified: number;
        comprehensive: number;
    }>;
    bookConsultation(professionalId: string, userId: string, consultationType: Consultation['consultation_type'], scheduledTime: string, duration?: number): Promise<Consultation>;
    getSpecializations(): Promise<ProfessionalSpecialization[]>;
    createSpecialization(specialization: Omit<ProfessionalSpecializationInsert, 'created_at' | 'id' | 'updated_at'>): Promise<ProfessionalSpecialization>;
    private createReviewResult;
    getCachedReviews(userId: string): Promise<DocumentReview[]>;
    getCachedReviewById(reviewId: string): Promise<DocumentReview | null>;
    getCachedProfessionalReviewers(): Promise<ProfessionalReviewer[]>;
    invalidateUserReviewCache(userId: string): Promise<void>;
    invalidateReviewCache(reviewId: string): Promise<void>;
    refreshProfessionalReviewersCache(): Promise<void>;
    private notifyAdminNewApplication;
    private notifyApplicantStatusChange;
    private sendEmail;
    private logNotification;
    private logFailedEmail;
    private formatStatusForDisplay;
    private getNextStepsForStatus;
    private calculateExpectedCompletion;
}
export declare const professionalService: ProfessionalService;
export {};
//# sourceMappingURL=professionalService.d.ts.map