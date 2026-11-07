/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Model3DProps } from '@/types';
import { BASE_COLORS } from '@/utils/color';

const BASE_PAIR_SEQUENCE = [
  ['A', 'T'],
  ['G', 'C'],
  ['T', 'A'],
  ['C', 'G'],
  ['A', 'T'],
  ['A', 'T'],
  ['C', 'G'],
  ['G', 'C'],
  ['T', 'A'],
  ['G', 'C'],
  ['A', 'T'],
  ['C', 'G'],
  ['T', 'A'],
  ['G', 'C'],
];

export function DnaHelix({
  highlightedParts = [],
  exploded = 0,
}: Model3DProps) {
  const numPairs = BASE_PAIR_SEQUENCE.length;
  const radius = 1.3;
  const height = 6.5;
  const turns = 2;

  // Generate helical rungs and backbones
  const { rungs, backbone1Points, backbone2Points } = useMemo(() => {
    const rungsData: {
      pos1: [number, number, number];
      pos2: [number, number, number];
      mid: [number, number, number];
      base1: string;
      base2: string;
      angle: number;
    }[] = [];

    const b1: THREE.Vector3[] = [];
    const b2: THREE.Vector3[] = [];

    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * turns * Math.PI * 2;
      const y = (t - 0.5) * height;
      b1.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      b2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));
    }

    for (let i = 0; i < numPairs; i++) {
      const t = i / (numPairs - 1);
      const angle = t * turns * Math.PI * 2;
      const y = (t - 0.5) * (height - 0.8);
      const [base1, base2] = BASE_PAIR_SEQUENCE[i];

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      rungsData.push({
        pos1: [x1, y, z1],
        pos2: [x2, y, z2],
        mid: [0, y, 0],
        base1,
        base2,
        angle,
      });
    }

    return {
      rungs: rungsData,
      backbone1Points: b1,
      backbone2Points: b2,
    };
  }, [numPairs, radius, height, turns]);

  const curve1 = useMemo(() => new THREE.CatmullRomCurve3(backbone1Points), [backbone1Points]);
  const curve2 = useMemo(() => new THREE.CatmullRomCurve3(backbone2Points), [backbone2Points]);

  const isBackboneHighlighted = highlightedParts.includes('backbone');
  const isBasesHighlighted = highlightedParts.includes('bases');

  return (
    <group position={[0, 0, 0]}>
      {/* Backbone Strand 1 (5' to 3') */}
      <mesh position={[exploded * 0.8, 0, 0]}>
        <tubeGeometry args={[curve1, 64, 0.12, 10, false]} />
        <meshStandardMaterial
          color={isBackboneHighlighted ? '#f59e0b' : '#38bdf8'}
          emissive={isBackboneHighlighted ? '#f59e0b' : '#000000'}
          emissiveIntensity={isBackboneHighlighted ? 0.4 : 0}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Backbone Strand 2 (3' to 5') */}
      <mesh position={[-exploded * 0.8, 0, 0]}>
        <tubeGeometry args={[curve2, 64, 0.12, 10, false]} />
        <meshStandardMaterial
          color={isBackboneHighlighted ? '#f59e0b' : '#818cf8'}
          emissive={isBackboneHighlighted ? '#f59e0b' : '#000000'}
          emissiveIntensity={isBackboneHighlighted ? 0.4 : 0}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Base Pairs (Rungs) */}
      {rungs.map((r, i) => {
        const color1 = BASE_COLORS[r.base1] || '#94a3b8';
        const color2 = BASE_COLORS[r.base2] || '#94a3b8';

        return (
          <group key={i} position={r.mid} rotation={[0, -r.angle, 0]}>
            {/* Left Base Cylinder */}
            <mesh position={[-radius * 0.45 - exploded * 0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, radius * 0.9, 12]} />
              <meshStandardMaterial
                color={color1}
                emissive={isBasesHighlighted ? color1 : '#000000'}
                emissiveIntensity={isBasesHighlighted ? 0.5 : 0}
                roughness={0.4}
                metalness={0.1}
              />
            </mesh>

            {/* Hydrogen Bond Center Gap / Node */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>

            {/* Right Base Cylinder */}
            <mesh position={[radius * 0.45 + exploded * 0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, radius * 0.9, 12]} />
              <meshStandardMaterial
                color={color2}
                emissive={isBasesHighlighted ? color2 : '#000000'}
                emissiveIntensity={isBasesHighlighted ? 0.5 : 0}
                roughness={0.4}
                metalness={0.1}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
