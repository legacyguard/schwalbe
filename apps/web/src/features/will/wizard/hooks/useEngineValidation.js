import { useMemo } from 'react';
import { WillEngine } from '@schwalbe/logic/will/engine';
export function useEngineValidation(input) {
    const engine = useMemo(() => new WillEngine(), []);
    return useMemo(() => engine.validate(input), [engine, input]);
}
export function useEngineDraft(input) {
    const engine = useMemo(() => new WillEngine(), []);
    return useMemo(() => engine.generate(input), [engine, input]);
}
