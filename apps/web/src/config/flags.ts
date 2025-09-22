import { features } from '@/lib/env';

export const isLandingEnabled = (): boolean => features.landing;
