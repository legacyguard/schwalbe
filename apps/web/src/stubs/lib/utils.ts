export const cn = (...a: Array<string | undefined | null | false>) => a.filter(Boolean).join(' ');
