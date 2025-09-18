import { isHollywoodLandingEnabled } from '@/config/flags'
import LandingV2 from '@/components/landing/LandingV2'
import { notFound } from 'next/navigation'

export default function LandingV2Page() {
  if (!isHollywoodLandingEnabled()) return notFound()
  return <LandingV2 />
}