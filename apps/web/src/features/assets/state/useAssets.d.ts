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
export declare const categoryTemplates: Record<AssetCategory, {
    name: string;
    notes: string;
    metadata: Record<string, any>;
}>;
export declare function useAssets(): {
    assets: Asset[];
    loading: boolean;
    error: any;
};
export declare function useAssetById(id?: string): {
    asset: Asset | null;
    loading: boolean;
};
export declare function useCreateAsset(): {
    createAsset: (input: UpsertAsset) => Promise<void>;
    creating: boolean;
};
export declare function useUpdateAsset(): {
    updateAsset: (id: string, input: UpsertAsset) => Promise<void>;
    updating: boolean;
};
export declare function useDeleteAsset(): {
    deleteAsset: (id: string) => Promise<void>;
};
export declare function useAssetsSummary(): {
    summary: {
        totalCount: number;
        totalValue: number;
        currency: string;
        categoryCount: number;
        byCategory: {
            label: string;
            value: number;
        }[];
    };
    loading: boolean;
    error: any;
};
//# sourceMappingURL=useAssets.d.ts.map