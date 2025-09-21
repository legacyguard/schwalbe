
import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface VaultAsset {
  bundle?: undefined | {
    category: string;
    name: string;
  };
  category: string;
  createdAt: string;
  description?: string;
  documentType: string;
  id: string;
  tags: string[];
  title: string;
  value?: number;
}

interface VaultAssetSelectorProps {
  assetType?:
    | 'all'
    | 'bankAccounts'
    | 'personalProperty'
    | 'realEstate'
    | 'vehicles';
  onAssetsSelected: (assets: string[]) => void;
  onClose: () => void;
  selectedAssets?: string[];
}

export const VaultAssetSelector: React.FC<VaultAssetSelectorProps> = ({
  onAssetsSelected,
  onClose,
  selectedAssets = [],
  assetType = 'all',
}) => {
  const { t } = useTranslation('ui/vault-asset-selector');
  const { userId } = useAuth();
  const [assets, setAssets] = useState<VaultAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedAssets);

  // Asset type filters
  const assetTypeFilters = {
    realEstate: [
      'property',
      'deed',
      'real estate',
      'house',
      'apartment',
      'land',
    ],
    vehicles: ['vehicle', 'car', 'motorcycle', 'boat', 'registration', 'title'],
    bankAccounts: [
      'bank',
      'account',
      'statement',
      'financial',
      'investment',
      'savings',
    ],
    personalProperty: [
      'jewelry',
      'art',
      'collectible',
      'personal',
      'valuable',
      'antique',
    ],
  };

  useEffect(() => {
    if (userId) {
      fetchVaultAssets();
    }
  }, [userId, assetType]);

  const fetchVaultAssets = async () => {
    try {
      setLoading(true);

      // Fetch documents and bundles from the vault
      const { data: documents, error } = await supabase
        .from('documents')
        .select(
          `
          id,
          title,
          description,
          document_type,
          category,
          tags,
          created_at,
          file_name,
          bundle_documents (
            bundle_id,
            bundles (
              bundle_name,
              bundle_category
            )
          )
        `
        )
        .eq('user_id', userId!)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vault assets:', error);
        return;
      }

      // Transform documents into assets
      const transformedAssets: VaultAsset[] =
        documents?.map((doc: any) => ({
          id: doc.id,
          title: doc.title || doc.file_name || 'Untitled Document',
          description: doc.description || undefined,
          documentType: doc.document_type || 'General',
          category: doc.category || 'Other',
          tags: doc.tags || [],
          createdAt: doc.created_at,
          bundle: doc.bundle_documents?.[0]?.bundles
            ? {
                name: doc.bundle_documents[0].bundles.bundle_name,
                category: doc.bundle_documents[0].bundles.bundle_category,
              }
            : undefined,
        })) || [];

      // Filter assets based on type
      let filteredAssets = transformedAssets;
      if (assetType !== 'all' && assetTypeFilters[assetType]) {
        const keywords = assetTypeFilters[assetType];
        filteredAssets = transformedAssets.filter(asset => {
          const searchText =
            `${asset.title} ${asset.description || ''} ${asset.category} ${asset.documentType} ${asset.tags.join(' ')}`.toLowerCase();
          return keywords.some(keyword =>
            searchText.includes(keyword.toLowerCase())
          );
        });
      }

      setAssets(filteredAssets);
    } catch (error) {
      console.error('Error fetching vault assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetToggle = (assetId: string) => {
    setSelectedIds(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleConfirmSelection = () => {
    const selectedAssetDescriptions = assets
      .filter(asset => selectedIds.includes(asset.id))
      .map(asset => {
        let description = asset.title;
        if (asset.description) {
          description += ` (${asset.description})`;
        }
        if (asset.bundle) {
          description += ` - ${t('bundlePrefix', { name: asset.bundle.name })}`;
        }
        return description;
      });

    onAssetsSelected(selectedAssetDescriptions);
  };

  const filteredAssets = assets.filter(asset => {
    const searchText =
      `${asset.title} ${asset.description || ''} ${asset.category}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });

  const getAssetIcon = (asset: VaultAsset) => {
    const type = asset.documentType.toLowerCase();
    const category = asset.category.toLowerCase();

    if (
      type.includes('property') ||
      type.includes('deed') ||
      category.includes('real estate')
    ) {
      return 'home';
    }
    if (
      type.includes('vehicle') ||
      type.includes('car') ||
      category.includes('vehicle')
    ) {
      return 'car';
    }
    if (
      type.includes('bank') ||
      type.includes('account') ||
      category.includes('financial')
    ) {
      return 'credit-card';
    }
    if (
      type.includes('jewelry') ||
      type.includes('art') ||
      category.includes('personal')
    ) {
      return 'star';
    }
    return 'document-text';
  };

  const getAssetTypeLabel = () => {
    return t(`assetTypes.${assetType}`);
  };

  return (
    <div className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50'>
      <div className='fixed inset-4 bg-background border border-border rounded-lg shadow-lg flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-border'>
          <div>
            <h2 className='text-xl font-semibold'>
              {t('header.title')}
            </h2>
            <p className='text-sm text-muted-foreground mt-1'>
              {t('header.subtitle', { assetType: getAssetTypeLabel().toLowerCase() })}
            </p>
          </div>
          <Button onClick={onClose} variant='ghost' size='sm'>
            <Icon name="x" className='w-4 h-4' />
          </Button>
        </div>

        {/* Search */}
        <div className='p-6 border-b border-border'>
          <div className='relative'>
            <Icon
              name="search"
              className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground'
            />
            <Input
              placeholder={t('search.placeholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        {/* Asset List */}
        <div className='flex-1 overflow-y-auto p-6'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <Icon
                  name="loader"
                  className='w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground'
                />
                <p className='text-muted-foreground'>{t('loading.message')}</p>
              </div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className='text-center py-12'>
              <Icon
                name="folder-open"
                className='w-12 h-12 mx-auto mb-4 text-muted-foreground'
              />
              <h3 className='font-semibold mb-2'>{t('empty.title')}</h3>
              <p className='text-muted-foreground'>
                {searchTerm
                  ? t('empty.searchMessage')
                  : t('empty.noAssetsMessage', { assetType: getAssetTypeLabel().toLowerCase() })}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {filteredAssets.map(asset => (
                <Card
                  key={asset.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedIds.includes(asset.id)
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleAssetToggle(asset.id)}
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedIds.includes(asset.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <Icon name={getAssetIcon(asset)} className='w-5 h-5' />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <h4 className='font-medium truncate'>{asset.title}</h4>
                      {asset.description && (
                        <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                          {asset.description}
                        </p>
                      )}

                      <div className='flex items-center gap-2 mt-2'>
                        <Badge variant='secondary' className='text-xs'>
                          {asset.documentType}
                        </Badge>
                        {asset.bundle && (
                          <Badge variant='outline' className='text-xs'>
                            {asset.bundle.name}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {selectedIds.includes(asset.id) && (
                      <div className='text-primary'>
                        <Icon
                          name="check-circle"
                          className='w-5 h-5'
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-border'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              {t('footer.selected', {
                count: selectedIds.length,
                plural: selectedIds.length !== 1 ? t('footer.selectedPlural') : t('footer.selectedSingular')
              })}
            </p>
            <div className='flex items-center gap-2'>
              <Button onClick={onClose} variant='outline'>
                {t('footer.cancelButton')}
              </Button>
              <Button
                onClick={handleConfirmSelection}
                disabled={selectedIds.length === 0}
                className='bg-primary hover:bg-primary-hover text-primary-foreground'
              >
                <Icon name="check" className='w-4 h-4 mr-2' />
                {t('footer.confirmButton')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
