/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Model3DProps } from '@/types';

export function Ribosome({
  highlightedParts = [],
  exploded = 0,
}: Model3DProps) {
  const isTrnaHighlighted = highlightedParts.includes('trna');

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Large Ribosomal Subunit (50S/60S) */}
      <group position={[0, 0.9 + exploded * 0.8, 0]}>
        {/* Main Dome */}
        <mesh>
          <sphereGeometry args={[1.3, 20, 20]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>

        {/* Central Protuberance */}
        <mesh position={[0, 1.1, -0.2]}>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshStandardMaterial color="#0369a1" roughness={0.4} />
        </mesh>

        {/* L1 Stalk */}
        <mesh position={[-1.2, 0.6, 0.2]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.2, 0.35, 0.9, 12]} />
          <meshStandardMaterial color="#075985" roughness={0.4} />
        </mesh>

        {/* Nascent Polypeptide Chain Emerging from Exit Tunnel */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0.2, 1.2 + i * 0.25, -0.4 + i * 0.1]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* 2. mRNA Ribbon Strand in the Interface */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 3.8, 16]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#7e22ce"
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* 3. tRNAs in P and A Sites */}
      <group position={[-0.3, 0.3, 0]}>
        {/* P-Site tRNA (L-shaped) */}
        <group>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 10]} />
            <meshStandardMaterial
              color={isTrnaHighlighted ? '#10b981' : '#059669'}
              emissive={isTrnaHighlighted ? '#10b981' : '#000000'}
              emissiveIntensity={isTrnaHighlighted ? 0.6 : 0}
              roughness={0.3}
            />
          </mesh>
          {/* Amino Acid Cargo */}
          <mesh position={[0, 0.85, 0]}>
            <sphereGeometry args={[0.14, 10, 10]} />
            <meshStandardMaterial color="#f97316" roughness={0.2} />
          </mesh>
        </group>

        {/* A-Site tRNA */}
        <group position={[0.6, 0, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 10]} />
            <meshStandardMaterial
              color={isTrnaHighlighted ? '#10b981' : '#047857'}
              emissive={isTrnaHighlighted ? '#10b981' : '#000000'}
              emissiveIntensity={isTrnaHighlighted ? 0.6 : 0}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <sphereGeometry args={[0.14, 10, 10]} />
            <meshStandardMaterial color="#f97316" roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* 4. Small Ribosomal Subunit (30S/40S) */}
      <group position={[0, -0.9 - exploded * 0.8, 0]}>
        <mesh>
          <boxGeometry args={[2.0, 0.9, 1.6]} />
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
        {/* Head of 30S */}
        <mesh position={[0, 0.35, 0.3]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
