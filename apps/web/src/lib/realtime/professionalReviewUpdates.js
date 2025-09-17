import { toast } from '@/hooks/use-toast';
import { logger } from '@schwalbe/shared/lib/logger';
import React from 'react';
class ProfessionalReviewRealtimeService {
    channel = null;
    callbacks = new Map();
    notificationCallbacks = new Map();
    /**
     * Subscribe to real-time review updates for a specific user
     */
    async subscribeToUserReviews(userId, callback) {
        try {
            this.callbacks.set(userId, callback);
            // Create channel for user's reviews
            this.channel = supabase
                .channel(`professional_reviews_${userId}`)
                .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'documents',
                filter: `user_id=eq.${userId}`,
            }, payload => {
                this.handleReviewUpdate(payload);
            })
                .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'professional_reviews',
                filter: `user_id=eq.${userId}`,
            }, payload => {
                this.handleReviewTableUpdate(payload);
            })
                .subscribe();
            logger.info(`Subscribed to real-time reviews for user: ${userId}`);
        }
        catch (error) {
            logger.error('Failed to subscribe to review updates:', error);
        }
    }
    /**
     * Subscribe to review notifications
     */
    subscribeToNotifications(userId, callback) {
        this.notificationCallbacks.set(userId, callback);
    }
    /**
     * Unsubscribe from real-time updates
     */
    async unsubscribe() {
        if (this.channel) {
            await this.channel.unsubscribe();
            this.channel = null;
        }
        this.callbacks.clear();
        this.notificationCallbacks.clear();
    }
    /**
     * Handle document table updates (professional review status changes)
     */
    handleReviewUpdate(payload) {
        try {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            if (eventType === 'UPDATE' && newRecord && oldRecord) {
                // Check if professional review fields changed
                const hasReviewChange = newRecord.professional_review_status !== oldRecord.professional_review_status ||
                    newRecord.professional_review_score !== oldRecord.professional_review_score ||
                    newRecord.review_findings !== oldRecord.review_findings;
                if (hasReviewChange) {
                    const updateData = {
                        review_id: newRecord.id,
                        document_id: newRecord.id,
                        status: newRecord.professional_review_status,
                        progress_percentage: this.calculateProgressFromStatus(newRecord.professional_review_status),
                        findings: newRecord.review_findings || [],
                        recommendations: newRecord.review_recommendations || [],
                        completion_date: newRecord.professional_review_date,
                        score: newRecord.professional_review_score,
                    };
                    // Notify subscribers
                    this.callbacks.forEach((callback, userId) => {
                        if (newRecord.user_id === userId) {
                            callback(updateData);
                        }
                    });
                    // Create notification
                    this.createNotification(newRecord, oldRecord);
                    // Show toast notification
                    this.showToastNotification(updateData);
                }
            }
        }
        catch (error) {
            logger.error('Error handling review update:', error);
        }
    }
    /**
     * Handle professional_reviews table updates (if exists)
     */
    handleReviewTableUpdate(payload) {
        try {
            const { eventType, new: newRecord } = payload;
            if (eventType === 'INSERT' || eventType === 'UPDATE') {
                const updateData = {
                    review_id: newRecord.id,
                    document_id: newRecord.document_id,
                    status: newRecord.status,
                    reviewer_name: newRecord.reviewer_name,
                    progress_percentage: newRecord.progress_percentage,
                    findings: newRecord.findings || [],
                    recommendations: newRecord.recommendations || [],
                    completion_date: newRecord.completion_date,
                    score: newRecord.score,
                };
                // Notify subscribers
                this.callbacks.forEach((callback, userId) => {
                    if (newRecord.user_id === userId) {
                        callback(updateData);
                    }
                });
            }
        }
        catch (error) {
            logger.error('Error handling professional review table update:', error);
        }
    }
    /**
     * Calculate progress percentage from status
     */
    calculateProgressFromStatus(status) {
        switch (status) {
            case 'none':
                return 0;
            case 'requested':
                return 25;
            case 'in_progress':
                return 50;
            case 'completed':
                return 100;
            case 'cancelled':
                return 0;
            default:
                return 0;
        }
    }
    /**
     * Create notification for review update
     */
    createNotification(newRecord, oldRecord) {
        try {
            let notification = null;
            if (oldRecord.professional_review_status !== newRecord.professional_review_status) {
                notification = {
                    id: `review_${newRecord.id}_${Date.now()}`,
                    type: 'status_change',
                    title: 'Review Status Updated',
                    message: this.getStatusChangeMessage(newRecord.professional_review_status),
                    data: {
                        review_id: newRecord.id,
                        document_id: newRecord.id,
                        status: newRecord.professional_review_status,
                        progress_percentage: this.calculateProgressFromStatus(newRecord.professional_review_status),
                    },
                    timestamp: new Date().toISOString(),
                    read: false,
                };
            }
            else if (newRecord.professional_review_score && !oldRecord.professional_review_score) {
                notification = {
                    id: `review_${newRecord.id}_completed_${Date.now()}`,
                    type: 'completion',
                    title: 'Review Completed',
                    message: `Your document has been reviewed with a score of ${newRecord.professional_review_score}/100`,
                    data: {
                        review_id: newRecord.id,
                        document_id: newRecord.id,
                        status: newRecord.professional_review_status,
                        score: newRecord.professional_review_score,
                        completion_date: newRecord.professional_review_date,
                    },
                    timestamp: new Date().toISOString(),
                    read: false,
                };
            }
            if (notification) {
                this.notificationCallbacks.forEach((callback, userId) => {
                    if (newRecord.user_id === userId) {
                        callback(notification);
                    }
                });
                // Persisting notifications can be implemented later if needed
            }
        }
        catch (error) {
            logger.error('Error creating notification:', error);
        }
    }
    /**
     * Get status change message
     */
    getStatusChangeMessage(status) {
        switch (status) {
            case 'requested':
                return 'Your document review request has been submitted and is awaiting assignment';
            case 'in_progress':
                return 'A professional is now reviewing your document';
            case 'completed':
                return 'Your document review has been completed';
            case 'cancelled':
                return 'Your document review has been cancelled';
            default:
                return 'Your document review status has been updated';
        }
    }
    /**
     * Show toast notification for review updates
     */
    showToastNotification(data) {
        try {
            let title = '';
            let description = '';
            switch (data.status) {
                case 'requested':
                    title = '📋 Review Requested';
                    description = 'Your document has been submitted for professional review';
                    break;
                case 'in_progress':
                    title = '⚡ Review In Progress';
                    description = 'A professional is now reviewing your document';
                    break;
                case 'completed':
                    title = '✅ Review Completed';
                    description = data.score ? `Review completed with score: ${data.score}/100` : 'Your document review has been completed';
                    break;
                case 'cancelled':
                    title = '❌ Review Cancelled';
                    description = 'Your document review has been cancelled';
                    break;
            }
            if (title) {
                toast({ title, description, duration: 5000 });
            }
        }
        catch (error) {
            logger.error('Error showing toast notification:', error);
        }
    }
    /**
     * Send real-time update to specific user
     */
    async broadcastUpdateToUser(userId, data) {
        try {
            await supabase.channel(`professional_reviews_${userId}`).send({
                type: 'broadcast',
                event: 'review_update',
                payload: data,
            });
        }
        catch (error) {
            logger.error('Failed to broadcast update to user:', error);
        }
    }
    /**
     * Update review progress
     */
    async updateReviewProgress(documentId, _progress, status) {
        try {
            const updates = {};
            if (status) {
                updates.professional_review_status = status;
            }
            const { error } = await supabase.from('documents').update(updates).eq('id', documentId);
            if (error) {
                logger.error('Failed to update review progress:', error);
            }
        }
        catch (error) {
            logger.error('Error updating review progress:', error);
        }
    }
    /**
     * Complete review with findings and score
     */
    async completeReview(documentId, score, findings, recommendations) {
        try {
            const { error } = await supabase
                .from('documents')
                .update({
                professional_review_status: 'completed',
                professional_review_score: score,
                professional_review_date: new Date().toISOString(),
                review_findings: findings,
                review_recommendations: recommendations,
            })
                .eq('id', documentId);
            if (error) {
                logger.error('Failed to complete review:', error);
                throw error;
            }
        }
        catch (error) {
            logger.error('Error completing review:', error);
            throw error;
        }
    }
}
// Export singleton instance
export const professionalReviewRealtimeService = new ProfessionalReviewRealtimeService();
// React hook for using the real-time service
export function useProfessionalReviewUpdates(userId) {
    const [notifications, setNotifications] = React.useState([]);
    const [reviewUpdates, setReviewUpdates] = React.useState([]);
    React.useEffect(() => {
        // Subscribe to review updates
        professionalReviewRealtimeService.subscribeToUserReviews(userId, data => {
            setReviewUpdates(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 updates
        });
        // Subscribe to notifications
        professionalReviewRealtimeService.subscribeToNotifications(userId, notification => {
            setNotifications(prev => [notification, ...prev]);
        });
        return () => {
            professionalReviewRealtimeService.unsubscribe();
        };
    }, [userId]);
    const markNotificationAsRead = (notificationId) => {
        setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
    };
    const clearNotifications = () => {
        setNotifications([]);
    };
    return {
        notifications,
        reviewUpdates,
        markNotificationAsRead,
        clearNotifications,
        unreadCount: notifications.filter(n => !n.read).length,
    };
}
