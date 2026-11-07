/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Generate points along a double helix
 */
export function generateHelixPoints(
  radius: number = 1.2,
  pitch: number = 3.4,
  turns: number = 2.5,
  pointsPerTurn: number = 30,
  phaseOffset: number = 0
): THREE.Vector3[] {
  const totalPoints = Math.round(turns * pointsPerTurn);
  const points: THREE.Vector3[] = [];
  const totalHeight = turns * pitch;
  const startY = -totalHeight / 2;

  for (let i = 0; i <= totalPoints; i++) {
    const fraction = i / totalPoints;
    const angle = fraction * turns * Math.PI * 2 + phaseOffset;
    const y = startY + fraction * totalHeight;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}

/**
 * Sample uniform random point on unit sphere
 */
export function randomOnSphere(radius: number = 1): [number, number, number] {
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  const x = r * sinPhi * Math.cos(theta);
  const y = r * sinPhi * Math.sin(theta);
  const z = r * Math.cos(phi);
  return [x, y, z];
}

/**
 * Creates a CatmullRomCurve3 from vector tuples
 */
export function createCurveFromPoints(coords: [number, number, number][]): THREE.CatmullRomCurve3 {
  const vectors = coords.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  return new THREE.CatmullRomCurve3(vectors);
}
