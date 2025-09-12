/**
 * Review Request Workflow Component
 * Email-based workflow for requesting professional document reviews
 */
import type { ProfessionalReviewer, ReviewRequest } from '@schwalbe/types/professional';
interface ReviewRequestWorkflowProps {
    availableReviewers: ProfessionalReviewer[];
    className?: string;
    documentId: string;
    documentName: string;
    documentType: string;
    familyContext: {
        business_interests: boolean;
        complex_assets: boolean;
        family_members_count: number;
        minor_children: boolean;
    };
    onCancel?: () => void;
    onRequestSubmitted: (request: Omit<ReviewRequest, 'created_at' | 'id' | 'updated_at' | 'user_id'>) => void;
}
export declare function ReviewRequestWorkflow({ documentId, documentType, documentName, familyContext, availableReviewers, onRequestSubmitted, onCancel, className, }: ReviewRequestWorkflowProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ReviewRequestWorkflow.d.ts.map