/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Model3DProps } from '@/types';

export function Synapse({
  highlightedParts = [],
  exploded = 0,
}: Model3DProps) {
  const isVesiclesHighlighted = highlightedParts.includes('vesicles');
  const isReceptorsHighlighted = highlightedParts.includes('receptors');

  // Random vesicle positions inside presynaptic bulb
  const vesicles = useMemo(() => {
    return [
      [-0.4, 1.2, 0.2],
      [0.3, 1.4, -0.3],
      [-0.1, 1.6, 0.1],
      [0.5, 1.1, 0.4],
      [-0.5, 0.9, -0.2],
      [0.1, 0.7, 0.2], // docking near active zone
      [-0.2, 0.6, -0.1], // docking
    ];
  }, []);

  // Neurotransmitter particles in cleft
  const cleftMolecules = useMemo(() => {
    return [
      [-0.4, 0.1, 0.1],
      [0.2, -0.05, -0.2],
      [-0.1, -0.15, 0.3],
      [0.4, 0.05, 0.2],
      [0.0, -0.2, -0.1],
    ];
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Presynaptic Terminal Bulb */}
      <group position={[0, 1.2 + exploded * 0.7, 0]}>
        {/* Terminal bulb shell */}
        <mesh>
          <sphereGeometry args={[1.5, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          <meshStandardMaterial
            color="#ec4899"
            roughness={0.4}
            transparent
            opacity={0.35}
            side={2}
          />
        </mesh>

        {/* Incoming axon trunk */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1.2, 16]} />
          <meshStandardMaterial color="#f97316" roughness={0.4} />
        </mesh>

        {/* Synaptic Vesicles */}
        {vesicles.map((pos, idx) => (
          <group key={idx} position={pos as [number, number, number]}>
            <mesh>
              <sphereGeometry args={[0.16, 12, 12]} />
              <meshStandardMaterial
                color={isVesiclesHighlighted ? '#fbbf24' : '#818cf8'}
                emissive={isVesiclesHighlighted ? '#f59e0b' : '#3730a3'}
                emissiveIntensity={isVesiclesHighlighted ? 0.6 : 0.2}
                roughness={0.3}
              />
            </mesh>
            {/* Small neurotransmitter cargo dot inside */}
            <mesh>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color="#38bdf8" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 2. Synaptic Cleft Molecules */}
      {cleftMolecules.map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* 3. Postsynaptic Dendritic Spine & Receptors */}
      <group position={[0, -0.8 - exploded * 0.7, 0]}>
        {/* Postsynaptic membrane slab */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.6, 1.7, 0.5, 24]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.4} />
        </mesh>

        {/* Ligand-Gated Ion Receptors on surface */}
        {[-0.8, -0.3, 0.3, 0.8].map((x, idx) => (
          <mesh key={idx} position={[x, 0.3, (idx % 2 === 0 ? 0.2 : -0.2)]}>
            <cylinderGeometry args={[0.12, 0.12, 0.25, 12]} />
            <meshStandardMaterial
              color={isReceptorsHighlighted ? '#10b981' : '#059669'}
              emissive={isReceptorsHighlighted ? '#10b981' : '#000000'}
              emissiveIntensity={isReceptorsHighlighted ? 0.6 : 0}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
