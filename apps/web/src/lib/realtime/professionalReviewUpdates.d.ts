export {};
export interface ReviewUpdateData {
    completion_date?: string;
    document_id: string;
    findings?: any[];
    progress_percentage?: number;
    recommendations?: any[];
    review_id: string;
    reviewer_name?: string;
    score?: number;
    status: 'cancelled' | 'completed' | 'in_progress' | 'requested';
}
export interface ReviewNotification {
    data: ReviewUpdateData;
    id: string;
    message: string;
    read: boolean;
    timestamp: string;
    title: string;
    type: 'completion' | 'new_finding' | 'progress_update' | 'status_change';
}
declare class ProfessionalReviewRealtimeService {
    private channel;
    private callbacks;
    private notificationCallbacks;
    /**
     * Subscribe to real-time review updates for a specific user
     */
    subscribeToUserReviews(userId: string, callback: (data: ReviewUpdateData) => void): Promise<void>;
    /**
     * Subscribe to review notifications
     */
    subscribeToNotifications(userId: string, callback: (notification: ReviewNotification) => void): void;
    /**
     * Unsubscribe from real-time updates
     */
    unsubscribe(): Promise<void>;
    /**
     * Handle document table updates (professional review status changes)
     */
    private handleReviewUpdate;
    /**
     * Handle professional_reviews table updates (if exists)
     */
    private handleReviewTableUpdate;
    /**
     * Calculate progress percentage from status
     */
    private calculateProgressFromStatus;
    /**
     * Create notification for review update
     */
    private createNotification;
    /**
     * Get status change message
     */
    private getStatusChangeMessage;
    /**
     * Show toast notification for review updates
     */
    private showToastNotification;
    /**
     * Send real-time update to specific user
     */
    broadcastUpdateToUser(userId: string, data: ReviewUpdateData): Promise<void>;
    /**
     * Update review progress
     */
    updateReviewProgress(documentId: string, _progress: number, status?: string): Promise<void>;
    /**
     * Complete review with findings and score
     */
    completeReview(documentId: string, score: number, findings: any[], recommendations: any[]): Promise<void>;
}
export declare const professionalReviewRealtimeService: ProfessionalReviewRealtimeService;
export declare function useProfessionalReviewUpdates(userId: string): {
    notifications: ReviewNotification[];
    reviewUpdates: ReviewUpdateData[];
    markNotificationAsRead: (notificationId: string) => void;
    clearNotifications: () => void;
    unreadCount: number;
};
//# sourceMappingURL=professionalReviewUpdates.d.ts.map