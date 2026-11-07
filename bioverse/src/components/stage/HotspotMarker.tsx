/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Html } from '@react-three/drei';
import { Hotspot } from '@/types';

interface HotspotMarkerProps {
  hotspot: Hotspot;
  isSelected: boolean;
  onSelect: (id: string) => void;
  showLabel?: boolean;
}

export function HotspotMarker({
  hotspot,
  isSelected,
  onSelect,
  showLabel = true,
}: HotspotMarkerProps) {
  return (
    <group position={hotspot.position}>
      {/* 3D Pulsing Bead */}
      <mesh onClick={(e) => { e.stopPropagation(); onSelect(hotspot.id); }}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          color={isSelected ? '#ea580c' : '#38bdf8'}
          emissive={isSelected ? '#f97316' : '#0284c7'}
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Outer subtle ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.11, 0.14, 16]} />
        <meshBasicMaterial
          color={isSelected ? '#f97316' : '#38bdf8'}
          side={2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* HTML Overlay Label */}
      {showLabel && (
        <Html
          position={[0, 0.22, 0]}
          center
          distanceFactor={9}
          style={{ pointerEvents: 'auto' }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(hotspot.id);
            }}
            className={`whitespace-nowrap px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer shadow-xs border ${
              isSelected
                ? 'bg-amber-600 text-white border-amber-500 ring-2 ring-amber-400/40 scale-105'
                : 'bg-white/95 dark:bg-stone-900/95 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:border-amber-400'
            }`}
          >
            {hotspot.label}
          </button>
        </Html>
      )}
    </group>
  );
}
