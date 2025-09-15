import { useMemo } from 'react'
import { WillEngine } from '@schwalbe/logic/will/engine'
import type { WillInput } from '@schwalbe/logic/will/engine'

export function useEngineValidation(input: WillInput) {
  const engine = useMemo(() => new WillEngine(), [])
  return useMemo(() => engine.validate(input), [engine, input])
}

export function useEngineDraft(input: WillInput) {
  const engine = useMemo(() => new WillEngine(), [])
  return useMemo(() => engine.generate(input), [engine, input])
}

// Convenience type guards
export type EngineIssue = ReturnType<typeof useEngineValidation> extends infer R
  ? R extends { errors: infer E; warnings: infer W }
    ? (E extends Array<infer EI> ? EI : never) | (W extends Array<infer WI> ? WI : never)
    : never
  : never
