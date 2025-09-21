import React from 'react';

interface Key3DProps {
  name?: string;
  className?: string;
}

export default function Key3D({ name = '', className = '' }: Key3DProps) {
  return (
    <div className={`w-full h-64 ${className}`}>
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg border-2 border-yellow-300">
        <div className="text-center">
          <div className="text-4xl mb-2">🔑</div>
          <div className="text-lg font-semibold text-yellow-800">
            {name ? `Key for ${name}` : 'Key of Trust'}
          </div>
        </div>
      </div>
    </div>
  );
}
