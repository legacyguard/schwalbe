import React from 'react';

interface Box3DProps {
  items?: string[];
  className?: string;
}

export default function Box3D({ items = [], className = '' }: Box3DProps) {
  return (
    <div className={`w-full h-64 ${className}`}>
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg border-2 border-amber-300">
        <div className="text-center">
          <div className="text-4xl mb-2">📦</div>
          <div className="text-lg font-semibold text-amber-800 mb-2">
            Box of Certainty
          </div>
          {items.length > 0 && (
            <div className="text-sm text-amber-700 max-w-xs">
              Contains: {items.slice(0, 3).join(', ')}
              {items.length > 3 && ` and ${items.length - 3} more...`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
