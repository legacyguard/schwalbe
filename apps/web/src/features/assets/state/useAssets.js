import { useEffect, useMemo, useState } from 'react';
import { logger } from '@schwalbe/shared/lib/logger';
import { supabase } from '@/lib/supabase';
export const categoryTemplates = {
    property: { name: 'Primary Residence', notes: 'Address, ownership %, mortgage details.', metadata: { fields: ['address', 'ownership', 'mortgage'] } },
    vehicle: { name: 'Car', notes: 'Make, model, VIN, mileage.', metadata: { fields: ['make', 'model', 'vin'] } },
    financial: { name: 'Bank Account', notes: 'Bank, account type, last 4 digits.', metadata: { fields: ['bank', 'type', 'last4'] } },
    business: { name: 'Business Interest', notes: 'Entity type, % ownership, valuation.', metadata: { fields: ['entityType', 'ownership'] } },
    personal: { name: 'Personal Item', notes: 'Description and sentimental value.', metadata: { fields: ['description'] } },
};
export function useAssets() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            const { data, error } = await supabase.from('assets').select('*').order('updated_at', { ascending: false });
            if (!mounted)
                return;
            if (error)
                setError(error.message);
            else
                setAssets((data || []));
            setLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, []);
    return { assets, loading, error };
}
export function useAssetById(id) {
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(!!id);
    useEffect(() => {
        if (!id)
            return;
        let mounted = true;
        (async () => {
            setLoading(true);
            const { data, error } = await supabase.from('assets').select('*').eq('id', id).single();
            if (!mounted)
                return;
            if (error) {
                logger.error('Failed to load asset', { id, error });
                setAsset(null);
            }
            else
                setAsset(data);
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
    async function createAsset(input) {
        setCreating(true);
        const { data: { user } } = await supabase.auth.getUser();
        const user_id = user?.id;
        const payload = { ...input, user_id };
        const { error } = await supabase.from('assets').insert(payload);
        if (error)
            throw error;
        setCreating(false);
    }
    return { createAsset, creating };
}
export function useUpdateAsset() {
    const [updating, setUpdating] = useState(false);
    async function updateAsset(id, input) {
        setUpdating(true);
        const { error } = await supabase.from('assets').update(input).eq('id', id);
        if (error)
            throw error;
        setUpdating(false);
    }
    return { updateAsset, updating };
}
export function useDeleteAsset() {
    async function deleteAsset(id) {
        const { error } = await supabase.from('assets').delete().eq('id', id);
        if (error)
            throw error;
    }
    return { deleteAsset };
}
export function useAssetsSummary() {
    const { assets, loading, error } = useAssets();
    const summary = useMemo(() => {
        const totalCount = assets.length;
        const totalValue = assets.reduce((sum, a) => sum + (a.estimated_value || 0), 0);
        const currency = assets[0]?.currency || 'USD';
        const byCategoryMap = new Map();
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
