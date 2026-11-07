/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PunnettResult {
  parent1Gametes: [string, string];
  parent2Gametes: [string, string];
  grid: [
    [string, string],
    [string, string]
  ];
  genotypeCounts: Record<string, number>;
  genotypePercentages: Record<string, number>;
  phenotypeCounts: { dominant: number; recessive: number };
  phenotypePercentages: { dominant: number; recessive: number };
}

/**
 * Standardize genotype allele ordering (e.g. 'bB' -> 'Bb')
 */
export function normalizeGenotype(g: string): string {
  const chars = g.split('');
  if (chars.length !== 2) return g;
  // Uppercase first if heterozygous
  if (chars[0].toLowerCase() === chars[1].toLowerCase()) {
    if (chars[0] !== chars[1]) {
      return chars[0] === chars[0].toUpperCase() ? chars[0] + chars[1] : chars[1] + chars[0];
    }
  }
  return chars.sort().join('');
}

/**
 * Calculates a single monohybrid Punnett square
 */
export function calculateMonohybridCross(p1: string, p2: string): PunnettResult {
  const g1 = p1.trim();
  const g2 = p2.trim();

  const p1Gametes: [string, string] = [g1[0] || 'B', g1[1] || 'b'];
  const p2Gametes: [string, string] = [g2[0] || 'B', g2[1] || 'b'];

  const grid: [[string, string], [string, string]] = [
    [normalizeGenotype(p1Gametes[0] + p2Gametes[0]), normalizeGenotype(p1Gametes[0] + p2Gametes[1])],
    [normalizeGenotype(p1Gametes[1] + p2Gametes[0]), normalizeGenotype(p1Gametes[1] + p2Gametes[1])],
  ];

  const genotypeCounts: Record<string, number> = {};
  for (const row of grid) {
    for (const cell of row) {
      genotypeCounts[cell] = (genotypeCounts[cell] || 0) + 1;
    }
  }

  const genotypePercentages: Record<string, number> = {};
  for (const [key, count] of Object.entries(genotypeCounts)) {
    genotypePercentages[key] = (count / 4) * 100;
  }

  // Dominant trait has at least one uppercase letter
  let dominantCount = 0;
  let recessiveCount = 0;

  for (const row of grid) {
    for (const cell of row) {
      if (cell.split('').some((c) => c === c.toUpperCase() && c.toLowerCase() !== c.toUpperCase())) {
        dominantCount++;
      } else {
        recessiveCount++;
      }
    }
  }

  return {
    parent1Gametes: p1Gametes,
    parent2Gametes: p2Gametes,
    grid,
    genotypeCounts,
    genotypePercentages,
    phenotypeCounts: {
      dominant: dominantCount,
      recessive: recessiveCount,
    },
    phenotypePercentages: {
      dominant: (dominantCount / 4) * 100,
      recessive: (recessiveCount / 4) * 100,
    },
  };
}
