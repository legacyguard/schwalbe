interface PricingCardProps {
    plan: string;
    price: string;
    period?: string;
    features?: string[];
    highlight?: boolean;
    ctaLabel?: string;
    onSelect?: () => void;
}
export declare function PricingCard({ plan, price, period, features, highlight, ctaLabel, onSelect }: PricingCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PricingCard.d.ts.map