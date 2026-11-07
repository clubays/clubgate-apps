/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ActionPotentialState {
  time: number; // in milliseconds
  voltage: number; // in millivolts (-70 mV resting)
  stimulusStrength: number; // 0 to 100
  threshold: number; // -55 mV
  restingPotential: number; // -70 mV
  peakPotential: number; // +35 mV
  hyperpolarizationPotential: number; // -80 mV
  phase: 'resting' | 'depolarization' | 'peak' | 'repolarization' | 'hyperpolarization' | 'refractory';
  naChannelsOpen: boolean;
  kChannelsOpen: boolean;
  isMyelinated: boolean;
  waveProgress: number; // 0 to 1 along the axon
  history: { t: number; v: number }[];
}

export const INITIAL_AP_STATE: ActionPotentialState = {
  time: 0,
  voltage: -70,
  stimulusStrength: 65,
  threshold: -55,
  restingPotential: -70,
  peakPotential: 35,
  hyperpolarizationPotential: -80,
  phase: 'resting',
  naChannelsOpen: false,
  kChannelsOpen: false,
  isMyelinated: true,
  waveProgress: 0,
  history: [{ t: 0, v: -70 }],
};

/**
 * Steps the action potential by dt (ms).
 * Strictly enforces all-or-none threshold behavior:
 * If stimulus < 50 (sub-threshold, voltage doesn't cross -55mV), only passive graded potential occurs.
 * If stimulus >= 50, fires a full stereotyped action potential!
 */
export function stepActionPotential(
  state: ActionPotentialState,
  triggerStimulus: boolean,
  dt: number = 0.1
): ActionPotentialState {
  let {
    time,
    voltage,
    stimulusStrength,
    threshold,
    restingPotential,
    peakPotential,
    hyperpolarizationPotential,
    phase,
    naChannelsOpen,
    kChannelsOpen,
    isMyelinated,
    waveProgress,
    history,
  } = { ...state };

  time += dt;

  // Conduction velocity is much faster with myelin (saltatory conduction)
  const conductionSpeed = isMyelinated ? 1.8 : 0.6;

  if (triggerStimulus && phase === 'resting') {
    if (stimulusStrength >= 50) {
      // Reaches threshold: all-or-none triggered!
      phase = 'depolarization';
      naChannelsOpen = true;
      kChannelsOpen = false;
      waveProgress = 0.05;
    } else {
      // Sub-threshold passive graded depolarization
      voltage = restingPotential + (stimulusStrength / 50) * 10;
      phase = 'resting';
      naChannelsOpen = false;
      kChannelsOpen = false;
    }
  }

  if (phase === 'depolarization') {
    // Voltage-gated Na+ channels rapidly open, Na+ rushes into cell
    voltage += 3.5 * (dt / 0.1);
    waveProgress = Math.min(1, waveProgress + 0.015 * conductionSpeed);
    if (voltage >= peakPotential) {
      voltage = peakPotential;
      phase = 'peak';
      naChannelsOpen = false; // Inactivation gate closes
      kChannelsOpen = true;   // Voltage-gated K+ channels open
    }
  } else if (phase === 'peak') {
    phase = 'repolarization';
    kChannelsOpen = true;
  } else if (phase === 'repolarization') {
    // K+ rushes out of cell, bringing membrane potential back down
    voltage -= 2.8 * (dt / 0.1);
    waveProgress = Math.min(1, waveProgress + 0.02 * conductionSpeed);
    if (voltage <= hyperpolarizationPotential) {
      voltage = hyperpolarizationPotential;
      phase = 'hyperpolarization';
      kChannelsOpen = false; // K+ channels close slowly
    }
  } else if (phase === 'hyperpolarization') {
    // Relative refractory period: Na+/K+ pump restores -70 mV
    voltage += 0.8 * (dt / 0.1);
    if (voltage >= restingPotential) {
      voltage = restingPotential;
      phase = 'resting';
      waveProgress = 0;
    }
  } else if (phase === 'resting') {
    // Exponential decay back to resting if disturbed
    voltage += (restingPotential - voltage) * 0.1;
    waveProgress = 0;
  }

  // Keep sliding window of history (last 100 points)
  const newHistory = [...history, { t: Math.round(time * 10) / 10, v: Math.round(voltage * 10) / 10 }];
  if (newHistory.length > 80) {
    newHistory.shift();
  }

  return {
    ...state,
    time,
    voltage,
    phase,
    naChannelsOpen,
    kChannelsOpen,
    waveProgress,
    history: newHistory,
  };
}
