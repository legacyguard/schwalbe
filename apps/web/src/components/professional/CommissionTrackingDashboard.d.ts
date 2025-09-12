/**
 * Commission Tracking Dashboard
 * Real-time tracking of referral commissions for professional network
 */
interface CommissionTrackingDashboardProps {
    className?: string;
    isAdmin?: boolean;
    onExportData?: () => void;
    onProcessPayment?: (commissionId: string) => void;
    reviewerId?: string;
}
export declare function CommissionTrackingDashboard({ isAdmin, reviewerId, onExportData, onProcessPayment, className, }: CommissionTrackingDashboardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=CommissionTrackingDashboard.d.ts.map