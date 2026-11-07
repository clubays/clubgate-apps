/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Model3DProps } from '@/types';

export function Membrane({
  highlightedParts = [],
  exploded = 0,
}: Model3DProps) {
  const isChannelHighlighted = highlightedParts.includes('channel');
  const isPhosphoHighlighted = highlightedParts.includes('phospholipids');

  // Generate grid of phospholipid heads
  const { topHeads, bottomHeads } = useMemo(() => {
    const top: [number, number, number][] = [];
    const bottom: [number, number, number][] = [];
    const size = 6;
    const spacing = 0.65;

    for (let x = -size / 2; x <= size / 2; x++) {
      for (let z = -size / 2; z <= size / 2; z++) {
        // Leave central opening for transmembrane protein channel
        if (Math.abs(x) < 1.3 && Math.abs(z) < 1.3) continue;
        top.push([x * spacing, 0.9, z * spacing]);
        bottom.push([x * spacing, -0.9, z * spacing]);
      }
    }
    return { topHeads: top, bottomHeads: bottom };
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Top Leaflet Phospholipid Heads & Tails */}
      <group position={[0, exploded * 0.6, 0]}>
        {topHeads.map((pos, idx) => (
          <group key={`top-${idx}`} position={pos}>
            {/* Hydrophilic Head */}
            <mesh>
              <sphereGeometry args={[0.22, 10, 10]} />
              <meshStandardMaterial
                color={isPhosphoHighlighted ? '#38bdf8' : '#f97316'}
                emissive={isPhosphoHighlighted ? '#38bdf8' : '#000000'}
                emissiveIntensity={isPhosphoHighlighted ? 0.4 : 0}
                roughness={0.4}
              />
            </mesh>
            {/* Fatty Acid Tail 1 */}
            <mesh position={[-0.07, -0.4, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
              <meshStandardMaterial color="#fed7aa" roughness={0.6} />
            </mesh>
            {/* Fatty Acid Tail 2 */}
            <mesh position={[0.07, -0.4, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
              <meshStandardMaterial color="#fed7aa" roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 2. Bottom Leaflet Phospholipid Heads & Tails */}
      <group position={[0, -exploded * 0.6, 0]}>
        {bottomHeads.map((pos, idx) => (
          <group key={`bot-${idx}`} position={pos}>
            {/* Hydrophilic Head */}
            <mesh>
              <sphereGeometry args={[0.22, 10, 10]} />
              <meshStandardMaterial
                color={isPhosphoHighlighted ? '#38bdf8' : '#ea580c'}
                emissive={isPhosphoHighlighted ? '#38bdf8' : '#000000'}
                emissiveIntensity={isPhosphoHighlighted ? 0.4 : 0}
                roughness={0.4}
              />
            </mesh>
            {/* Fatty Acid Tail 1 */}
            <mesh position={[-0.07, 0.4, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
              <meshStandardMaterial color="#fed7aa" roughness={0.6} />
            </mesh>
            {/* Fatty Acid Tail 2 */}
            <mesh position={[0.07, 0.4, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
              <meshStandardMaterial color="#fed7aa" roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 3. Central Transmembrane Channel Protein Complex */}
      <group position={[0, 0, 0]}>
        {/* Barrel / Pore Wall made of 6 alpha helices */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          const r = 0.75;
          const x = Math.cos(angle) * r;
          const z = Math.sin(angle) * r;

          return (
            <mesh key={i} position={[x, 0, z]}>
              <cylinderGeometry args={[0.18, 0.18, 2.4, 12]} />
              <meshStandardMaterial
                color={isChannelHighlighted ? '#14b8a6' : '#0d9488'}
                emissive={isChannelHighlighted ? '#14b8a6' : '#042f2e'}
                emissiveIntensity={isChannelHighlighted ? 0.6 : 0.2}
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>
          );
        })}

        {/* Central Pore Tube Guide */}
        <mesh>
          <cylinderGeometry args={[0.45, 0.45, 2.2, 16, 1, true]} />
          <meshStandardMaterial color="#5eead4" side={2} transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
}
