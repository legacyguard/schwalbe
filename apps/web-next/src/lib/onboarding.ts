import type { Answer } from '@schwalbe/onboarding';

export function deriveAnswersFromLocalStorage(): Answer[] {
  try {
    const raw =
      (typeof localStorage !== 'undefined' && (localStorage.getItem('onb_state_en') || localStorage.getItem('onb_state_sk') || localStorage.getItem('onb_state_cs'))) ||
      null;
    let answers: Answer[] = [
      { key: 'priority', value: 'safety' },
      { key: 'timeAvailable', value: '10m' },
    ];
    if (raw) {
      const parsed = JSON.parse(raw);
      const pri = parsed?.boxItems
        ? 'organization'
        : parsed?.trustedName
        ? 'family'
        : 'safety';
      answers = [
        { key: 'priority', value: pri },
        { key: 'timeAvailable', value: '10m' },
      ];
    }
    return answers;
  } catch {
    return [
      { key: 'priority', value: 'safety' },
      { key: 'timeAvailable', value: '10m' },
    ];
  }
}