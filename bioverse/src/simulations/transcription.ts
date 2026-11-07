/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranscriptionState {
  dnaTemplate: string;
  cursor: number;
  mrnaTranscript: string;
  isComplete: boolean;
  polymeraseBound: boolean;
}

export function createInitialTranscriptionState(dnaTemplate: string = 'TACGGCATACGTATT'): TranscriptionState {
  return {
    dnaTemplate: dnaTemplate.toUpperCase(),
    cursor: 0,
    mrnaTranscript: '',
    isComplete: false,
    polymeraseBound: true,
  };
}

export function stepTranscription(state: TranscriptionState): TranscriptionState {
  if (state.cursor >= state.dnaTemplate.length) {
    return { ...state, isComplete: true, polymeraseBound: false };
  }

  const base = state.dnaTemplate[state.cursor];
  const rnaMap: Record<string, string> = {
    A: 'U',
    T: 'A',
    C: 'G',
    G: 'C',
  };
  const rnaBase = rnaMap[base] || 'N';

  const nextCursor = state.cursor + 1;
  return {
    ...state,
    cursor: nextCursor,
    mrnaTranscript: state.mrnaTranscript + rnaBase,
    isComplete: nextCursor >= state.dnaTemplate.length,
    polymeraseBound: true,
  };
}
