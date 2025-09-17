export interface StepStatus {
    errors: number;
    warnings: number;
}
export declare function Progress({ currentIndex, labels, statuses }: {
    currentIndex: number;
    labels: string[];
    statuses?: StepStatus[];
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Progress.d.ts.map