import { supabase } from '@/lib/supabase';
import type { Database } from '@schwalbe/shared/src/types/database';

export type AssetsRow = {
  id: string;
  user_id: string;
  category: 'property' | 'vehicle' | 'financial' | 'business' | 'personal';
  name?: string | null;
  estimated_value?: number | null;
  currency?: string | null;
  acquired_at?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export const AssetsApi = {
  async list() {
    return supabase.from('assets').select('*').order('updated_at', { ascending: false });
  },
  async get(id: string) {
    return supabase.from('assets').select('*').eq('id', id).single();
  },
  async create(input: Omit<AssetsRow, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    const user_id = user?.id as string;
    return supabase.from('assets').insert({ ...input, user_id });
  },
  async update(id: string, input: Partial<Omit<AssetsRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
    return supabase.from('assets').update(input).eq('id', id);
  },
  async remove(id: string) {
    return supabase.from('assets').delete().eq('id', id);
  }
};
