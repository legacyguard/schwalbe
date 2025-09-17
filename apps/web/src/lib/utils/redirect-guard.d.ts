export interface RedirectSimulationTarget {
    code: string;
    host: string;
    url: string;
}
export interface RedirectOutcome {
    didRedirect: boolean;
    simulationTargets?: RedirectSimulationTarget[];
}
declare class RedirectGuardClass {
    private redirectHistory;
    private readonly maxRedirects;
    private readonly timeWindow;
    canRedirect(path: string): boolean;
    reset(): void;
}
export declare const RedirectGuard: RedirectGuardClass;
export declare function redirectToCountryOrSimulate(code: string): RedirectOutcome;
export {};
//# sourceMappingURL=redirect-guard.d.ts.map