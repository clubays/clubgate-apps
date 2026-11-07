/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Model3DProps } from '@/types';

export function Heart({
  highlightedParts = [],
  exploded = 0,
}: Model3DProps) {
  const isRightHighlighted = highlightedParts.includes('right');
  const isLeftHighlighted = highlightedParts.includes('left');

  // Aorta arch curve
  const aortaCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(0.2, 1.4, -0.1),
      new THREE.Vector3(-0.3, 1.8, -0.2),
      new THREE.Vector3(-0.8, 1.5, -0.4),
      new THREE.Vector3(-0.9, 0.4, -0.5),
    ]);
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Left Ventricle (Thick muscular apex wall - Systemic) */}
      <group position={[0.5 + exploded * 0.6, -0.4, 0]}>
        <mesh rotation={[0, 0, -0.3]}>
          <coneGeometry args={[1.0, 1.8, 16]} />
          <meshStandardMaterial
            color={isLeftHighlighted ? '#f43f5e' : '#be123c'}
            emissive={isLeftHighlighted ? '#f43f5e' : '#4c0519'}
            emissiveIntensity={isLeftHighlighted ? 0.6 : 0.2}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* 2. Right Ventricle (Thinner anterior wall - Pulmonary) */}
      <group position={[-0.5 - exploded * 0.6, -0.3, 0.3]}>
        <mesh rotation={[0, 0, 0.2]}>
          <coneGeometry args={[0.85, 1.5, 16]} />
          <meshStandardMaterial
            color={isRightHighlighted ? '#0284c7' : '#0369a1'}
            emissive={isRightHighlighted ? '#0284c7' : '#082f49'}
            emissiveIntensity={isRightHighlighted ? 0.6 : 0.2}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* 3. Left Atrium (Top right in anatomical anterior view) */}
      <mesh position={[0.6 + exploded * 0.4, 0.8, -0.3]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color="#9f1239" roughness={0.4} />
      </mesh>

      {/* 4. Right Atrium (Receiving Vena Cava) */}
      <mesh position={[-0.8 - exploded * 0.4, 0.7, 0.1]}>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} />
      </mesh>

      {/* 5. Aorta Arch */}
      <mesh position={[0, 0, 0]}>
        <tubeGeometry args={[aortaCurve, 32, 0.22, 12, false]} />
        <meshStandardMaterial
          color="#e11d48"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* 6. Pulmonary Trunk (Crossing anterior to aorta) */}
      <mesh position={[-0.1, 0.8, 0.35]} rotation={[0.4, 0, -0.4]}>
        <cylinderGeometry args={[0.2, 0.22, 1.2, 14]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} />
      </mesh>

      {/* 7. Superior Vena Cava */}
      <mesh position={[-0.9, 1.3, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.9, 12]} />
        <meshStandardMaterial color="#0369a1" roughness={0.4} />
      </mesh>
    </group>
  );
}
