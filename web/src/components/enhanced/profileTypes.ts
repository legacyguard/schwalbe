
export interface ProfileData {
  address?: string;
  avatar?: string;
  completionPercentage?: number;
  dateOfBirth?: string;
  email?: string;
  id: string;
  metadata?: Record<string, unknown>;
  name: string;
  phone?: string;
  relationship?: string;
  roles?: string[];
  status?: 'active' | 'inactive' | 'pending';
}
