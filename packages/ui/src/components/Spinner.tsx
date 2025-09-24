
import { type GetProps, Spinner as TamaguiSpinner } from '@tamagui/core';

// Simple wrapper around Tamagui Spinner
export const Spinner = TamaguiSpinner;

export type SpinnerProps = GetProps<typeof TamaguiSpinner>;
