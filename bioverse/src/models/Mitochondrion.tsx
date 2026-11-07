/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as THREE from 'three';
import { Model3DProps } from '@/types';

export function Mitochondrion({
  highlightedParts = [],
  exploded = 0,
}: Model3DProps) {
  const isCristaeHighlighted = highlightedParts.includes('cristae');

  return (
    <group position={[0, 0, 0]} rotation={[0.2, 0.4, 0]}>
      {/* 1. Outer Membrane (Capsule cutaway) */}
      <mesh position={[0, exploded * 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[1.3, 2.6, 16, 24]} />
        <meshStandardMaterial
          color="#ea580c"
          roughness={0.4}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Inner Membrane & Matrix Core */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[1.1, 2.3, 16, 24]} />
        <meshStandardMaterial
          color="#c2410c"
          roughness={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 3. Cristae Folds (Series of convoluted transverse pleats) */}
      {[-1.0, -0.5, 0.0, 0.5, 1.0].map((x, idx) => (
        <group key={idx} position={[x, 0, 0]}>
          {/* Upper fold */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.15, 0.75, 1.4]} />
            <meshStandardMaterial
              color={isCristaeHighlighted ? '#fbbf24' : '#f97316'}
              emissive={isCristaeHighlighted ? '#f59e0b' : '#7c2d12'}
              emissiveIntensity={isCristaeHighlighted ? 0.7 : 0.2}
              roughness={0.3}
            />
          </mesh>

          {/* Lower fold (interleaved) */}
          <mesh position={[0, -0.45, 0]}>
            <boxGeometry args={[0.15, 0.75, 1.4]} />
            <meshStandardMaterial
              color={isCristaeHighlighted ? '#fbbf24' : '#f97316'}
              emissive={isCristaeHighlighted ? '#f59e0b' : '#7c2d12'}
              emissiveIntensity={isCristaeHighlighted ? 0.7 : 0.2}
              roughness={0.3}
            />
          </mesh>

          {/* ATP Synthase Knobs */}
          <mesh position={[0.1, 0.85, 0.3]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} />
          </mesh>
          <mesh position={[-0.1, -0.85, -0.3]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* 4. Circular mtDNA Loop in Matrix */}
      <mesh position={[0.2, 0, 0]} rotation={[Math.PI / 3, 0.2, 0]}>
        <torusGeometry args={[0.5, 0.03, 8, 24]} />
        <meshStandardMaterial color="#a855f7" roughness={0.3} />
      </mesh>
    </group>
  );
}
