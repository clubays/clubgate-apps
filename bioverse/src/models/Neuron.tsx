/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Model3DProps } from '@/types';
import { NEURON_COLORS } from '@/utils/color';

export function Neuron({
  highlightedParts = [],
  simulationState,
  exploded = 0,
}: Model3DProps) {
  const isDendritesHighlighted = highlightedParts.includes('dendrites');
  const isAxonHighlighted = highlightedParts.includes('axon');
  const isMyelinHighlighted = highlightedParts.includes('myelin');

  // Simulation electrical pulse position
  const waveProgress = simulationState?.waveProgress ?? 0;
  // Axon extends from x = -0.8 to x = 3.2 (length 4.0)
  const pulseX = -0.8 + waveProgress * 4.0;
  const isFiring = waveProgress > 0 && waveProgress < 1;

  // Generate dendritic tree branch coordinates
  const dendriteBranches = useMemo(() => {
    return [
      // Top branch
      [[-1.8, 0.4, 0], [-2.3, 1.1, 0.2], [-2.8, 1.6, 0.4]],
      [[-2.3, 1.1, 0.2], [-2.6, 1.3, -0.3]],
      // Upper back branch
      [[-1.9, 0.2, 0.4], [-2.5, 0.6, 0.9], [-3.1, 0.8, 1.2]],
      // Lower front branch
      [[-1.8, -0.3, -0.3], [-2.4, -0.8, -0.7], [-3.0, -1.2, -0.9]],
      [[-2.4, -0.8, -0.7], [-2.8, -0.6, -1.2]],
      // Bottom branch
      [[-1.7, -0.5, 0.1], [-2.1, -1.2, 0.3], [-2.6, -1.7, 0.5]],
    ];
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Soma (Cell Body) */}
      <group position={[-1.6, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.75, 20, 20]} />
          <meshStandardMaterial
            color={NEURON_COLORS.soma}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>

        {/* Nucleus inside soma */}
        <mesh position={[0, 0, 0.1]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#d97706" roughness={0.3} />
        </mesh>
      </group>

      {/* 2. Dendrites */}
      <group>
        {dendriteBranches.map((pts, i) => {
          const vectors = pts.map(([x, y, z]) => new THREE.Vector3(x, y, z));
          const curve = new THREE.CatmullRomCurve3(vectors);
          return (
            <mesh key={i}>
              <tubeGeometry args={[curve, 16, 0.08, 8, false]} />
              <meshStandardMaterial
                color={isDendritesHighlighted ? '#38bdf8' : NEURON_COLORS.dendrite}
                emissive={isDendritesHighlighted ? '#38bdf8' : '#000000'}
                emissiveIntensity={isDendritesHighlighted ? 0.6 : 0}
                roughness={0.3}
              />
            </mesh>
          );
        })}
      </group>

      {/* 3. Axon Hillock (Tapered cone from soma to axon) */}
      <mesh position={[-0.95, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.4, 0.6, 16]} />
        <meshStandardMaterial
          color={NEURON_COLORS.axon}
          roughness={0.4}
        />
      </mesh>

      {/* 4. Long Axon Core Cylinder */}
      <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 4.0, 16]} />
        <meshStandardMaterial
          color={isAxonHighlighted ? '#f97316' : '#ea580c'}
          emissive={isAxonHighlighted ? '#f97316' : '#000000'}
          emissiveIntensity={isAxonHighlighted ? 0.6 : 0}
          roughness={0.4}
        />
      </mesh>

      {/* 5. Myelin Sheaths (Schwann Cells along axon separated by nodes of Ranvier) */}
      {[
        { x: -0.3, label: 'Sheath 1' },
        { x: 0.6, label: 'Sheath 2' },
        { x: 1.5, label: 'Sheath 3' },
        { x: 2.4, label: 'Sheath 4' },
      ].map((seg, idx) => (
        <group
          key={idx}
          position={[seg.x, exploded * 0.4 * (idx % 2 === 0 ? 1 : -1), 0]}
        >
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.68, 16]} />
            <meshStandardMaterial
              color={isMyelinHighlighted ? '#a3e635' : NEURON_COLORS.myelin}
              emissive={isMyelinHighlighted ? '#84cc16' : '#000000'}
              emissiveIntensity={isMyelinHighlighted ? 0.5 : 0}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
          {/* Node of Ranvier indicator gap on right */}
          <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.13, 0.02, 8, 12]} />
            <meshStandardMaterial color="#65a30d" />
          </mesh>
        </group>
      ))}

      {/* 6. Action Potential Traveling Wave Glow */}
      {isFiring && (
        <mesh position={[pulseX, 0, 0]}>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={1.8}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* 7. Axon Terminals & Synaptic Boutons */}
      <group position={[3.3, 0, 0]}>
        {/* Branch 1 */}
        <mesh position={[0.3, 0.35, 0.2]} rotation={[0, 0, 0.6]}>
          <cylinderGeometry args={[0.06, 0.08, 0.7, 10]} />
          <meshStandardMaterial color={NEURON_COLORS.terminal} />
        </mesh>
        <mesh position={[0.6, 0.65, 0.3]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color={NEURON_COLORS.terminal} roughness={0.3} />
        </mesh>

        {/* Branch 2 */}
        <mesh position={[0.3, -0.3, -0.2]} rotation={[0, 0, -0.6]}>
          <cylinderGeometry args={[0.06, 0.08, 0.7, 10]} />
          <meshStandardMaterial color={NEURON_COLORS.terminal} />
        </mesh>
        <mesh position={[0.6, -0.6, -0.3]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color={NEURON_COLORS.terminal} roughness={0.3} />
        </mesh>

        {/* Branch 3 */}
        <mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.07, 0.6, 10]} />
          <meshStandardMaterial color={NEURON_COLORS.terminal} />
        </mesh>
        <mesh position={[0.7, 0, 0]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color={NEURON_COLORS.terminal} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
