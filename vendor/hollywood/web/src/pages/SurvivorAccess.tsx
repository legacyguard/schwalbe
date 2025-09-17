
import { useParams, useSearchParams } from 'react-router-dom';
import SurvivorInterface from '@/components/emergency/SurvivorInterface';

/**
 * Route component for survivor/family access to memorial resources
 * URL: /survivor/:token or /memorial/:token
 */
export default function SurvivorAccess() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();

  // Check if this is public memorial access
  const isPublic = searchParams.get('public') === 'true';

  return (
    <div className='min-h-screen'>
      <SurvivorInterface accessToken={token} isPublicAccess={isPublic} />
    </div>
  );
}
