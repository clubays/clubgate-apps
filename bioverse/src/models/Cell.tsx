/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Model3DProps } from '@/types';

export function Cell({
  highlightedParts = [],
  exploded = 0,
}: Model3DProps) {
  const isNucleusHighlighted = highlightedParts.includes('nucleus');
  const isMitoHighlighted = highlightedParts.includes('mitochondria');
  const isMembraneHighlighted = highlightedParts.includes('membrane');

  // Generate random ribosome coordinates
  const ribosomePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 45; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.0 + Math.random() * 1.5;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = (r * Math.sin(phi) * Math.sin(theta)) * 0.45; // flatten cell slightly
      const z = r * Math.cos(phi);
      if (Math.sqrt(x * x + y * y + z * z) > 0.9) {
        pts.push([x, y, z]);
      }
    }
    return pts;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Translucent Outer Cell Membrane (Cutaway view) */}
      <mesh
        rotation={[Math.PI * 0.25, 0, 0]}
        position={[0, exploded * 0.8, 0]}
      >
        <sphereGeometry args={[2.7, 32, 24, 0, Math.PI * 1.6, 0, Math.PI]} />
        <meshStandardMaterial
          color={isMembraneHighlighted ? '#38bdf8' : '#94a3b8'}
          transparent
          opacity={0.35}
          roughness={0.2}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Cytoplasm Floor Base */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.6, 0.4, 32]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.8}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* 3. Central Nucleus */}
      <group position={[0, 0.2 + exploded * 0.4, 0]}>
        {/* Outer Nuclear Membrane */}
        <mesh>
          <sphereGeometry args={[0.9, 24, 24]} />
          <meshStandardMaterial
            color={isNucleusHighlighted ? '#f59e0b' : '#6366f1'}
            emissive={isNucleusHighlighted ? '#f59e0b' : '#312e81'}
            emissiveIntensity={isNucleusHighlighted ? 0.6 : 0.2}
            roughness={0.4}
          />
        </mesh>

        {/* Nucleolus Core */}
        <mesh position={[0.2, 0.2, 0.2]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#4338ca" roughness={0.3} />
        </mesh>
      </group>

      {/* 4. Endoplasmic Reticulum (ER Sheets around nucleus) */}
      <group position={[-1.1, 0.1, -0.2]}>
        <mesh rotation={[0.4, 0.2, 0.6]}>
          <torusGeometry args={[0.7, 0.15, 12, 24, Math.PI * 1.4]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.4} />
        </mesh>
        <mesh rotation={[-0.3, 0.5, 0.2]} position={[0, -0.2, 0.2]}>
          <torusGeometry args={[0.9, 0.12, 12, 24, Math.PI * 1.2]} />
          <meshStandardMaterial color="#0891b2" roughness={0.4} />
        </mesh>
      </group>

      {/* 5. Mitochondria (Bean-shaped capsules) */}
      <group position={[1.6 + exploded * 0.5, -0.1, 0.8]} rotation={[0.3, 0.8, 0.2]}>
        <mesh>
          <capsuleGeometry args={[0.24, 0.7, 8, 16]} />
          <meshStandardMaterial
            color={isMitoHighlighted ? '#f97316' : '#ea580c'}
            emissive={isMitoHighlighted ? '#f97316' : '#000000'}
            emissiveIntensity={isMitoHighlighted ? 0.6 : 0}
            roughness={0.3}
          />
        </mesh>
        {/* Internal Cristae folds */}
        <mesh position={[0, 0, 0.05]}>
          <torusGeometry args={[0.18, 0.04, 8, 16]} />
          <meshStandardMaterial color="#fdba74" roughness={0.2} />
        </mesh>
      </group>

      <group position={[-0.9 - exploded * 0.5, -0.2, 1.4]} rotation={[-0.4, -0.6, 0.3]}>
        <mesh>
          <capsuleGeometry args={[0.22, 0.6, 8, 16]} />
          <meshStandardMaterial
            color={isMitoHighlighted ? '#f97316' : '#ea580c'}
            emissive={isMitoHighlighted ? '#f97316' : '#000000'}
            emissiveIntensity={isMitoHighlighted ? 0.6 : 0}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* 6. Golgi Apparatus (Stacks of curved flattened cisternae) */}
      <group position={[1.2, 0.6 + exploded * 0.3, -0.9]} rotation={[0.4, -0.5, 0.2]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.08, 16]} />
          <meshStandardMaterial color="#10b981" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.07, 16]} />
          <meshStandardMaterial color="#059669" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.06, 16]} />
          <meshStandardMaterial color="#047857" roughness={0.3} />
        </mesh>

        {/* Secretory Vesicles */}
        <mesh position={[0.4, 0.3, 0.2]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#34d399" />
        </mesh>
        <mesh position={[-0.3, 0.2, 0.3]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#34d399" />
        </mesh>
      </group>

      {/* 7. Centrosome / Centriole pair */}
      <group position={[-0.8, 0.8, -1.0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.3, 10]} />
          <meshStandardMaterial color="#eab308" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.15, 0.1]}>
          <cylinderGeometry args={[0.07, 0.07, 0.3, 10]} />
          <meshStandardMaterial color="#ca8a04" />
        </mesh>
      </group>

      {/* 8. Cytosolic Ribosomes */}
      {ribosomePoints.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#ec4899" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
