/**
 * Attorney Dashboard for Document Review
 * Professional interface for attorneys to manage document reviews
 */
import type { DocumentReview, ProfessionalReviewer } from '@schwalbe/types/professional';
interface AttorneyDashboardProps {
    className?: string;
    completedReviews: DocumentReview[];
    onAcceptReview: (reviewId: string) => void;
    onDeclineReview: (reviewId: string) => void;
    onReviewDocument: (reviewId: string) => void;
    pendingReviews: DocumentReview[];
    reviewer: ProfessionalReviewer;
}
export declare function AttorneyDashboard({ reviewer, pendingReviews, completedReviews, onReviewDocument, onAcceptReview, onDeclineReview, className, }: AttorneyDashboardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AttorneyDashboard.d.ts.map