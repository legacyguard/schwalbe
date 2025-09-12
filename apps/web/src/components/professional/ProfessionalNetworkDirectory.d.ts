/**
 * Professional Network Directory
 * Comprehensive directory of verified legal professionals
 */
import type { ProfessionalReviewer } from '@schwalbe/types/professional';
interface ProfessionalProfile extends ProfessionalReviewer {
    achievements?: string[];
    availability: 'available' | 'busy' | 'unavailable';
    featuredReview?: {
        clientName: string;
        comment: string;
        date: string;
        rating: number;
    };
    languages?: string[];
    rating: number;
    responseTime: string;
    reviewCount: number;
    services: Array<{
        description: string;
        startingPrice: number;
        type: 'consultation' | 'retainer' | 'review';
    }>;
}
interface ProfessionalNetworkDirectoryProps {
    className?: string;
    onBookConsultation: (professional: ProfessionalProfile) => void;
    onRequestReview: (professional: ProfessionalProfile) => void;
    onSelectProfessional: (professional: ProfessionalProfile) => void;
}
export declare function ProfessionalNetworkDirectory({ onSelectProfessional, onBookConsultation, onRequestReview, className, }: ProfessionalNetworkDirectoryProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ProfessionalNetworkDirectory.d.ts.map