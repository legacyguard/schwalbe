import { useEffect, useMemo, useState } from 'react';
import { logger } from '@schwalbe/shared/lib/logger';

import { supabase } from '@/lib/supabase';

export type AssetCategory = 'property' | 'vehicle' | 'financial' | 'business' | 'personal';

export type Asset = {
  id: string;
  user_id: string;
  category: AssetCategory;
  name?: string;
  estimated_value?: number | null;
  currency?: string | null;
  acquired_at?: string | null;
  notes?: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

export type UpsertAsset = {
  category: AssetCategory;
  name?: string;
  estimated_value?: number | null;
  currency?: string | null;
  acquired_at?: string | null;
  notes?: string | null;
  metadata?: Record<string, any> | null;
};

export const categoryTemplates: Record<AssetCategory, { name: string; notes: string; metadata: Record<string, any> }> = {
  property: { name: 'Primary Residence', notes: 'Address, ownership %, mortgage details.', metadata: { fields: ['address', 'ownership', 'mortgage'] } },
  vehicle: { name: 'Car', notes: 'Make, model, VIN, mileage.', metadata: { fields: ['make', 'model', 'vin'] } },
  financial: { name: 'Bank Account', notes: 'Bank, account type, last 4 digits.', metadata: { fields: ['bank', 'type', 'last4'] } },
  business: { name: 'Business Interest', notes: 'Entity type, % ownership, valuation.', metadata: { fields: ['entityType', 'ownership'] } },
  personal: { name: 'Personal Item', notes: 'Description and sentimental value.', metadata: { fields: ['description'] } },
};

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('assets').select('*').order('updated_at', { ascending: false });
      if (!mounted) return;
      if (error) setError(error.message);
      else setAssets((data || []) as Asset[]);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return { assets, loading, error };
}

export function useAssetById(id?: string) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('assets').select('*').eq('id', id).single();
      if (!mounted) return;
      if (error) {
        logger.error('Failed to load asset', { action: 'load_asset_failed', metadata: { assetId: id, error: error.message } });
        setAsset(null);
      } else setAsset(data as Asset);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);
  return { asset, loading };
}

export function useCreateAsset() {
  const [creating, setCreating] = useState(false);
  async function createAsset(input: UpsertAsset) {
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    const user_id = user?.id as string;
    const payload = { ...input, user_id };
    const { error } = await supabase.from('assets').insert(payload);
    if (error) throw error;
    setCreating(false);
  }
  return { createAsset, creating };
}

export function useUpdateAsset() {
  const [updating, setUpdating] = useState(false);
  async function updateAsset(id: string, input: UpsertAsset) {
    setUpdating(true);
    const { error } = await supabase.from('assets').update(input).eq('id', id);
    if (error) throw error;
    setUpdating(false);
  }
  return { updateAsset, updating };
}

export function useDeleteAsset() {
  async function deleteAsset(id: string) {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) throw error;
  }
  return { deleteAsset };
}

export function useAssetsSummary() {
  const { assets, loading, error } = useAssets();
  const summary = useMemo(() => {
    const totalCount = assets.length;
    const totalValue = assets.reduce((sum, a) => sum + (a.estimated_value || 0), 0);
    const currency = assets[0]?.currency || 'USD';
    const byCategoryMap = new Map<string, number>();
    assets.forEach(a => {
      const key = a.category;
      byCategoryMap.set(key, (byCategoryMap.get(key) || 0) + (a.estimated_value || 0));
    });
    const byCategory = Array.from(byCategoryMap.entries()).map(([label, value]) => ({ label, value }));
    return {
      totalCount,
      totalValue,
      currency,
      categoryCount: byCategory.length,
      byCategory,
    };
  }, [assets]);
  return { summary, loading, error };
}
