import type { WillInput } from '@schwalbe/logic/will/engine';
export declare function useEngineValidation(input: WillInput): import("@schwalbe/logic/will/engine").ValidationResult;
export declare function useEngineDraft(input: WillInput): import("@schwalbe/logic/will/engine").DraftResult;
export type EngineIssue = ReturnType<typeof useEngineValidation> extends infer R ? R extends {
    errors: infer E;
    warnings: infer W;
} ? (E extends Array<infer EI> ? EI : never) | (W extends Array<infer WI> ? WI : never) : never : never;
//# sourceMappingURL=useEngineValidation.d.ts.map