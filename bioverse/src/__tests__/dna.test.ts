/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  isValidDna,
  getComplementaryStrand,
  transcribeCodingDnaToMrna,
  translateMrna,
  classifyMutation,
} from '@/functions/dna';

describe('DNA & Translation Pure Functions', () => {
  it('validates DNA sequence characters correctly', () => {
    expect(isValidDna('ATGC')).toBe(true);
    expect(isValidDna('atgc')).toBe(true);
    expect(isValidDna('ATGX')).toBe(false);
    expect(isValidDna('123')).toBe(false);
    expect(isValidDna('')).toBe(false);
  });

  it('computes complementary DNA strand with A-T and C-G pairing', () => {
    expect(getComplementaryStrand('ATGC')).toBe('TACG');
    expect(getComplementaryStrand('AAAA')).toBe('TTTT');
    expect(getComplementaryStrand('GCGC')).toBe('CGCG');
  });

  it('transcribes coding DNA strand to mRNA by replacing T with U', () => {
    expect(transcribeCodingDnaToMrna('ATGCCAGCTTAA')).toBe('AUGCCAGCUUAA');
  });

  it('translates mRNA codons into amino acids and stops at Stop codon', () => {
    // AUG (Met) CCU (Pro) GCA (Ala) UGA (Stop)
    const result = translateMrna('AUGCCUGCAUGA');
    expect(result.abbreviations).toEqual(['Met', 'Pro', 'Ala']);
    expect(result.stoppedEarly).toBe(true);
  });

  it('classifies silent, missense, and nonsense mutations correctly', () => {
    const orig = 'ATGCCAGCTTAA'; // AUG CCA GCU UAA (Met Pro Ala Stop)

    // Silent: CCU also codes for Pro
    const silentDna = 'ATGCCTGCTTAA';
    const silentResult = classifyMutation(orig, silentDna);
    expect(silentResult.type).toBe('silent');

    // Missense: GCA (Ala) -> GAA (Glu)
    const missenseDna = 'ATGCCAGAATAA';
    const missenseResult = classifyMutation(orig, missenseDna);
    expect(missenseResult.type).toBe('missense');

    // Nonsense: CCA (Pro) -> UGA (Stop) => TGA
    const nonsenseDna = 'ATGTGAACTTAA';
    const nonsenseResult = classifyMutation(orig, nonsenseDna);
    expect(nonsenseResult.type).toBe('nonsense');
  });
});
