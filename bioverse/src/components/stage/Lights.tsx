/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export function Lights() {
  return (
    <>
      {/* Cool Sky / Warm Ground Hemisphere fill */}
      <hemisphereLight
        color="#e0f2fe"
        groundColor="#fef3c7"
        intensity={0.8}
      />

      {/* Warm Key Light */}
      <directionalLight
        position={[6, 8, 5]}
        intensity={1.4}
        castShadow={false}
      />

      {/* Cool Fill Light */}
      <directionalLight
        position={[-6, -2, -4]}
        intensity={0.6}
        color="#bae6fd"
      />

      {/* Soft Rim / Back Light */}
      <directionalLight
        position={[0, 5, -8]}
        intensity={0.8}
        color="#ffffff"
      />
    </>
  );
}
