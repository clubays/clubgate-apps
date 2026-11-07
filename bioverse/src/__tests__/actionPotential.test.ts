/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  INITIAL_AP_STATE,
  stepActionPotential,
} from '@/simulations/actionPotential';

describe('Action Potential All-or-None Simulation', () => {
  it('starts at resting membrane potential (-70 mV) with closed channels', () => {
    expect(INITIAL_AP_STATE.voltage).toBe(-70);
    expect(INITIAL_AP_STATE.phase).toBe('resting');
    expect(INITIAL_AP_STATE.naChannelsOpen).toBe(false);
    expect(INITIAL_AP_STATE.kChannelsOpen).toBe(false);
  });

  it('fails to trigger action potential on sub-threshold stimulus (all-or-none principle)', () => {
    const subState = {
      ...INITIAL_AP_STATE,
      stimulusStrength: 30, // Sub-threshold (< 50)
    };

    const next = stepActionPotential(subState, true, 0.1);
    expect(next.phase).toBe('resting');
    expect(next.naChannelsOpen).toBe(false);
    // Voltage changes passively but doesn't reach depolarization phase
    expect(next.voltage).toBeLessThan(-55);
  });

  it('fires full action potential and opens Na+ channels on supra-threshold stimulus', () => {
    const strongState = {
      ...INITIAL_AP_STATE,
      stimulusStrength: 75, // Supra-threshold
    };

    let state = stepActionPotential(strongState, true, 0.1);
    expect(state.phase).toBe('depolarization');
    expect(state.naChannelsOpen).toBe(true);

    // Step through depolarization to peak
    for (let i = 0; i < 40; i++) {
      state = stepActionPotential(state, false, 0.1);
      if (state.phase === 'peak' || state.phase === 'repolarization') break;
    }

    expect(['peak', 'repolarization']).toContain(state.phase);
    expect(state.voltage).toBeGreaterThan(0);
  });
});
