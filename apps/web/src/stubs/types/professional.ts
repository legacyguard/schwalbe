export interface ProfessionalProfile {
  user_id: string;
  full_name?: string;
  professional_title?: string;
  law_firm_name?: string;
  specializations?: string[];
  licensed_states?: string[];
  experience_years?: number;
  hourly_rate?: number;
  profile_image_url?: string;
  bio?: string;
  created_at?: string;
}
