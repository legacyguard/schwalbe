declare class RedirectGuardClass {
    private redirectHistory;
    private readonly maxRedirects;
    private readonly timeWindow;
    canRedirect(path: string): boolean;
    reset(): void;
}
export declare const RedirectGuard: RedirectGuardClass;
export {};
//# sourceMappingURL=redirect-guard.d.ts.map