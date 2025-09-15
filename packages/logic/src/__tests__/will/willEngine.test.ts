import { WillEngine } from '../../will/engine'
import type { WillInput } from '../../will/engine'

describe('WillEngine CZ/SK validation', () => {
  const engine = new WillEngine()

  const base: Omit<WillInput, 'jurisdiction' | 'language'> = {
    form: 'typed',
    testator: { id: 't1', fullName: 'Jan Novak', age: 30, address: 'Prague, CZ' },
    beneficiaries: [
      { id: 'b1', name: 'Anna Novak' },
    ],
    executorName: 'Petr Sef',
    signatures: { testatorSigned: true, witnessesSigned: true },
    witnesses: [
      { id: 'w1', fullName: 'Witness One', age: 25 },
      { id: 'w2', fullName: 'Witness Two', age: 26 },
    ],
  }

  test('CZ typed will passes with 2 witnesses and signatures', () => {
    const res = engine.generate({ ...base, jurisdiction: 'CZ', language: 'cs' })
    expect(res.validation.isValid).toBe(true)
    expect(res.content).toContain('Poslední vůle') // cs header
  })

  test('CZ typed will fails with beneficiary as witness', () => {
    const res = engine.generate({
      ...base,
      jurisdiction: 'CZ',
      language: 'cs',
      witnesses: [
        { id: 'w1', fullName: 'Witness One', age: 25, isBeneficiary: true },
        { id: 'w2', fullName: 'Witness Two', age: 26 },
      ],
    })
    expect(res.validation.isValid).toBe(false)
    expect(res.validation.errors.find((e) => e.code === 'WITNESS_CONFLICT_BENEFICIARY')).toBeTruthy()
  })

  test('CZ holographic will requires no witnesses but testator signature', () => {
    const res = engine.generate({
      ...base,
      form: 'holographic',
      jurisdiction: 'CZ',
      language: 'cs',
      signatures: { testatorSigned: true, witnessesSigned: false },
      witnesses: [],
    })
    expect(res.validation.isValid).toBe(true)
  })

  test('SK typed will passes with 2 witnesses and signatures', () => {
    const res = engine.generate({ ...base, jurisdiction: 'SK', language: 'sk' })
    expect(res.validation.isValid).toBe(true)
    expect(res.content).toContain('Závet') // sk header
  })

  test('SK typed will fails missing witness signatures', () => {
    const res = engine.generate({
      ...base,
      jurisdiction: 'SK',
      language: 'sk',
      signatures: { testatorSigned: true, witnessesSigned: false },
    })
    expect(res.validation.isValid).toBe(false)
    expect(res.validation.errors.find((e) => e.code === 'MISSING_WITNESS_SIGNATURES')).toBeTruthy()
  })

  test('Age constraints enforced for typed vs holographic', () => {
    const tooYoungTyped = engine.generate({
      ...base,
      jurisdiction: 'CZ',
      language: 'cs',
      testator: { id: 't2', fullName: 'Young', age: 17 },
    })
    expect(tooYoungTyped.validation.isValid).toBe(false)
    expect(tooYoungTyped.validation.errors.find((e) => e.code === 'TESTATOR_AGE_TYPED_MIN_18')).toBeTruthy()

    const holographic15 = engine.generate({
      ...base,
      jurisdiction: 'SK',
      language: 'sk',
      form: 'holographic',
      testator: { id: 't3', fullName: 'Teen', age: 15 },
      signatures: { testatorSigned: true },
      witnesses: [],
    })
    expect(holographic15.validation.isValid).toBe(true)
  })
})
