/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getComplementaryStrand } from '@/functions/dna';

export interface ReplicationState {
  originalStrand: string;
  forkPosition: number; // 0 to length
  leadingStrand: string;
  laggingStrand: string;
  isComplete: boolean;
  helicaseActive: boolean;
}

export function createInitialReplicationState(sequence: string = 'ATGCGATACGCTA'): ReplicationState {
  return {
    originalStrand: sequence.toUpperCase(),
    forkPosition: 0,
    leadingStrand: '',
    laggingStrand: '',
    isComplete: false,
    helicaseActive: false,
  };
}

export function stepReplication(state: ReplicationState): ReplicationState {
  if (state.forkPosition >= state.originalStrand.length) {
    return { ...state, isComplete: true, helicaseActive: false };
  }

  const nextPos = state.forkPosition + 1;
  const currentSub = state.originalStrand.slice(0, nextPos);
  const comp = getComplementaryStrand(currentSub);

  return {
    ...state,
    forkPosition: nextPos,
    leadingStrand: comp,
    laggingStrand: currentSub,
    helicaseActive: true,
    isComplete: nextPos >= state.originalStrand.length,
  };
}
