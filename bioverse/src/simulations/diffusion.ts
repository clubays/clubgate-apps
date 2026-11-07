/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Particle {
  id: number;
  x: number; // -1 to 1 (left is <0, right is >0)
  y: number; // -1 to 1
  vx: number;
  vy: number;
  type: 'solute' | 'water';
}

export interface DiffusionState {
  permeable: boolean;
  poreSize: number; // 0 to 1
  leftSoluteCount: number;
  rightSoluteCount: number;
  leftWaterCount: number;
  rightWaterCount: number;
  particles: Particle[];
  equilibriumReached: boolean;
  stepCount: number;
}

export function createInitialDiffusionState(
  initialLeftSolute: number = 30,
  initialRightSolute: number = 4
): DiffusionState {
  const particles: Particle[] = [];
  let id = 0;

  // Left compartment: high solute
  for (let i = 0; i < initialLeftSolute; i++) {
    particles.push({
      id: id++,
      x: -0.85 + Math.random() * 0.75,
      y: -0.85 + Math.random() * 1.7,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      type: 'solute',
    });
  }

  // Right compartment: low solute
  for (let i = 0; i < initialRightSolute; i++) {
    particles.push({
      id: id++,
      x: 0.1 + Math.random() * 0.75,
      y: -0.85 + Math.random() * 1.7,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      type: 'solute',
    });
  }

  return {
    permeable: true,
    poreSize: 0.5,
    leftSoluteCount: initialLeftSolute,
    rightSoluteCount: initialRightSolute,
    leftWaterCount: 50,
    rightWaterCount: 50,
    particles,
    equilibriumReached: false,
    stepCount: 0,
  };
}

export function stepDiffusion(state: DiffusionState): DiffusionState {
  const particles = state.particles.map((p) => {
    let x = p.x + p.vx;
    let y = p.y + p.vy;
    let vx = p.vx;
    let vy = p.vy;

    // Bounce off outer boundary box [-0.95, 0.95]
    if (x < -0.95) {
      x = -0.95;
      vx = Math.abs(vx);
    } else if (x > 0.95) {
      x = 0.95;
      vx = -Math.abs(vx);
    }

    if (y < -0.95) {
      y = -0.95;
      vy = Math.abs(vy);
    } else if (y > 0.95) {
      y = 0.95;
      vy = -Math.abs(vy);
    }

    // Membrane is at x = 0
    // If membrane is NOT permeable, particles cannot cross x = 0
    if (!state.permeable) {
      if (p.x < 0 && x >= -0.05) {
        x = -0.05;
        vx = -Math.abs(vx);
      } else if (p.x > 0 && x <= 0.05) {
        x = 0.05;
        vx = Math.abs(vx);
      }
    } else {
      // Chance of crossing membrane depends on poreSize
      if (Math.abs(x) < 0.05 && Math.random() > state.poreSize) {
        vx = -vx;
      }
    }

    // Add tiny Brownian jitter
    vx += (Math.random() - 0.5) * 0.002;
    vy += (Math.random() - 0.5) * 0.002;

    // Cap velocity
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > 0.03) {
      vx = (vx / speed) * 0.03;
      vy = (vy / speed) * 0.03;
    }

    return { ...p, x, y, vx, vy };
  });

  const leftSolute = particles.filter((p) => p.x < 0).length;
  const rightSolute = particles.filter((p) => p.x >= 0).length;
  const equilibrium = Math.abs(leftSolute - rightSolute) <= 3;

  return {
    ...state,
    particles,
    leftSoluteCount: leftSolute,
    rightSoluteCount: rightSolute,
    equilibriumReached: equilibrium,
    stepCount: state.stepCount + 1,
  };
}
