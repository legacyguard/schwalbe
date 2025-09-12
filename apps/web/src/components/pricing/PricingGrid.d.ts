interface PlanSpec {
    plan: string;
    price: string;
    period?: string;
    features?: string[];
    highlight?: boolean;
}
interface PricingGridProps {
    plans: PlanSpec[];
}
export declare function PricingGrid({ plans }: PricingGridProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PricingGrid.d.ts.map