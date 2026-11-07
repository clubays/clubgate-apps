/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { calculateMonohybridCross, normalizeGenotype } from '@/functions/punnett';

describe('Punnett Square Genetic Calculations', () => {
  it('normalizes heterozygous allele order', () => {
    expect(normalizeGenotype('bB')).toBe('Bb');
    expect(normalizeGenotype('Bb')).toBe('Bb');
    expect(normalizeGenotype('BB')).toBe('BB');
    expect(normalizeGenotype('bb')).toBe('bb');
  });

  it('calculates classic 3:1 phenotypic and 1:2:1 genotypic ratios for Bb x Bb', () => {
    const result = calculateMonohybridCross('Bb', 'Bb');

    expect(result.grid).toEqual([
      ['BB', 'Bb'],
      ['Bb', 'bb'],
    ]);

    expect(result.genotypeCounts).toEqual({
      BB: 1,
      Bb: 2,
      bb: 1,
    });

    expect(result.genotypePercentages).toEqual({
      BB: 25,
      Bb: 50,
      bb: 25,
    });

    // Dominant (BB, Bb): 3, Recessive (bb): 1
    expect(result.phenotypeCounts).toEqual({
      dominant: 3,
      recessive: 1,
    });

    expect(result.phenotypePercentages).toEqual({
      dominant: 75,
      recessive: 25,
    });
  });

  it('calculates 100% dominant phenotype for BB x bb cross', () => {
    const result = calculateMonohybridCross('BB', 'bb');
    expect(result.phenotypePercentages.dominant).toBe(100);
    expect(result.phenotypePercentages.recessive).toBe(0);
    expect(result.genotypePercentages['Bb']).toBe(100);
  });
});
