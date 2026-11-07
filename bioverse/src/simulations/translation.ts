/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CODON_TABLE } from '@/data/codonTable';
import { getCodons } from '@/functions/dna';

export interface TranslationState {
  mrna: string;
  codons: string[];
  currentCodonIndex: number;
  polypeptide: {
    aminoAcid: string;
    abbr: string;
    fullName: string;
    codon: string;
  }[];
  activeTrnaAnticodon: string;
  isComplete: boolean;
  statusMessage: string;
}

export function createInitialTranslationState(mrna: string = 'AUGCCUGCAUGA'): TranslationState {
  const codons = getCodons(mrna);
  return {
    mrna: mrna.toUpperCase(),
    codons,
    currentCodonIndex: 0,
    polypeptide: [],
    activeTrnaAnticodon: '',
    isComplete: false,
    statusMessage: 'Ribosome ready to scan for Start codon (AUG)',
  };
}

export function stepTranslation(state: TranslationState): TranslationState {
  if (state.currentCodonIndex >= state.codons.length || state.isComplete) {
    return { ...state, isComplete: true, statusMessage: 'Translation finished.' };
  }

  const codon = state.codons[state.currentCodonIndex];
  const info = CODON_TABLE[codon];

  // tRNA anticodon is complement (A-U, C-G)
  const compMap: Record<string, string> = { A: 'U', U: 'A', G: 'C', C: 'G' };
  const anticodon = codon.split('').map((c) => compMap[c] || c).join('');

  if (!info || info.isStop) {
    return {
      ...state,
      currentCodonIndex: state.currentCodonIndex + 1,
      activeTrnaAnticodon: 'RELEASE',
      isComplete: true,
      statusMessage: `Stop codon (${codon}) reached. Release factor binds and frees polypeptide.`,
    };
  }

  const newPolypeptide = [
    ...state.polypeptide,
    {
      aminoAcid: info.aa,
      abbr: info.abbr,
      fullName: info.name,
      codon,
    },
  ];

  const nextIndex = state.currentCodonIndex + 1;
  const isComplete = nextIndex >= state.codons.length;

  return {
    ...state,
    currentCodonIndex: nextIndex,
    polypeptide: newPolypeptide,
    activeTrnaAnticodon: anticodon,
    isComplete,
    statusMessage: `Adding ${info.name} (${info.abbr}) via tRNA matching ${codon}`,
  };
}
