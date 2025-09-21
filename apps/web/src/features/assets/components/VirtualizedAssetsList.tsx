/**
 * Virtualized Assets List Component
 * Performance optimization for large asset lists using react-window
 */

import React, { memo, useMemo, useCallback } from 'react'
import { FixedSizeList } from 'react-window'
import { Link } from 'react-router-dom'

interface Asset {
  id: string
  name: string
  category: string
  estimated_value?: number
  currency?: string
  acquired_at?: string
}

interface AssetRowProps {
  index: number
  style: React.CSSProperties
  data: {
    assets: Asset[]
    onDelete: (id: string) => void
  }
}

// Memoized asset row component to prevent unnecessary re-renders
const AssetRow = memo<AssetRowProps>(({ index, style, data }) => {
  const asset = data.assets[index]

  const handleDelete = useCallback(() => {
    data.onDelete(asset.id)
  }, [data.onDelete, asset.id])

  return (
    <div
      style={style}
      className="flex items-center border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors"
    >
      <div className="flex-1 p-2 min-w-0">
        <div className="font-medium text-white truncate">{asset.name}</div>
        <div className="text-sm text-zinc-400 capitalize">{asset.category}</div>
      </div>

      <div className="w-32 p-2 text-right">
        {asset.estimated_value ? (
          <span className="text-green-400">
            {asset.estimated_value.toLocaleString(undefined, {
              style: 'currency',
              currency: asset.currency || 'USD'
            })}
          </span>
        ) : (
          <span className="text-zinc-500">—</span>
        )}
      </div>

      <div className="w-32 p-2 text-sm text-zinc-400">
        {asset.acquired_at ? new Date(asset.acquired_at).toLocaleDateString() : '—'}
      </div>

      <div className="w-32 p-2 flex gap-2">
        <Link
          className="text-sky-300 hover:text-sky-200 transition-colors text-sm underline"
          to={`/assets/${asset.id}/edit`}
        >
          Edit
        </Link>
        <button
          className="text-red-300 hover:text-red-200 transition-colors text-sm underline"
          onClick={handleDelete}
          aria-label={`Delete asset ${asset.name}`}
        >
          Delete
        </button>
      </div>
    </div>
  )
})

AssetRow.displayName = 'AssetRow'

interface VirtualizedAssetsListProps {
  assets: Asset[]
  onDelete: (id: string) => void
  height?: number
  itemHeight?: number
  className?: string
}

export const VirtualizedAssetsList = memo<VirtualizedAssetsListProps>(({
  assets,
  onDelete,
  height = 400,
  itemHeight = 60,
  className = ''
}) => {
  // Memoize the data object to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    assets,
    onDelete
  }), [assets, onDelete])

  if (assets.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <div className="text-lg mb-2">No assets found</div>
        <div className="text-sm">Add your first asset to get started</div>
      </div>
    )
  }

  return (
    <div className={`bg-zinc-900 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center bg-zinc-800 border-b border-zinc-700 font-medium text-zinc-200">
        <div className="flex-1 p-3">Name & Category</div>
        <div className="w-32 p-3 text-right">Value</div>
        <div className="w-32 p-3">Acquired</div>
        <div className="w-32 p-3">Actions</div>
      </div>

      {/* Virtualized list */}
      <FixedSizeList
        height={Math.min(height, assets.length * itemHeight)}
        itemCount={assets.length}
        itemSize={itemHeight}
        itemData={itemData}
        className="scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800"
      >
        {AssetRow}
      </FixedSizeList>

      {/* Footer with count */}
      <div className="bg-zinc-800 border-t border-zinc-700 px-3 py-2 text-sm text-zinc-400">
        Showing {assets.length} {assets.length === 1 ? 'asset' : 'assets'}
      </div>
    </div>
  )
})

VirtualizedAssetsList.displayName = 'VirtualizedAssetsList'