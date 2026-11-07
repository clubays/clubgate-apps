/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Canonical biological color coding
export const BASE_COLORS: Record<string, string> = {
  A: '#f43f5e', // Adenine: Rose / Coral
  T: '#f59e0b', // Thymine: Amber
  G: '#14b8a6', // Guanine: Teal
  C: '#3b82f6', // Cytosine: Blue
  U: '#a855f7', // Uracil: Purple (mRNA)
};

export const BASE_NAMES: Record<string, string> = {
  A: 'Adenine',
  T: 'Thymine',
  G: 'Guanine',
  C: 'Cytosine',
  U: 'Uracil',
};

export const NEURON_COLORS: Record<string, string> = {
  dendrite: '#38bdf8', // Sky
  soma: '#fbbf24',     // Amber
  axon: '#f97316',     // Coral
  myelin: '#84cc16',   // Lime
  terminal: '#ec4899', // Pink
  synapse: '#818cf8',  // Indigo
};

export const CELL_COLORS: Record<string, string> = {
  membrane: '#94a3b8',
  nucleus: '#6366f1',
  nucleolus: '#4338ca',
  mitochondria: '#f97316',
  er: '#06b6d4',
  golgi: '#10b981',
  ribosome: '#ec4899',
  cytoplasm: '#e2e8f0',
};

export function getBaseColor(base: string): string {
  return BASE_COLORS[base.toUpperCase()] ?? '#94a3b8';
}
