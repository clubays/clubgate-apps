/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CODON_TABLE } from '@/data/codonTable';

/**
 * Validates that string only contains standard DNA bases (A, C, G, T)
 */
export function isValidDna(sequence: string): boolean {
  if (!sequence) return false;
  return /^[ACGT]+$/i.test(sequence.trim());
}

/**
 * Computes complementary DNA strand (5' to 3' matching)
 * A <-> T, C <-> G
 */
export function getComplementaryStrand(dna: string): string {
  const map: Record<string, string> = {
    A: 'T',
    T: 'A',
    C: 'G',
    G: 'C',
    a: 't',
    t: 'a',
    c: 'g',
    g: 'c',
  };
  return dna
    .split('')
    .map((char) => map[char] || char)
    .join('');
}

/**
 * Transcribes coding DNA to mRNA (T -> U)
 * Or template DNA (3'->5') to mRNA (5'->3')
 */
export function transcribeCodingDnaToMrna(codingDna: string): string {
  return codingDna.toUpperCase().replace(/T/g, 'U');
}

export function transcribeTemplateDnaToMrna(templateDna: string): string {
  const map: Record<string, string> = {
    A: 'U',
    T: 'A',
    C: 'G',
    G: 'C',
  };
  return templateDna
    .toUpperCase()
    .split('')
    .map((b) => map[b] || b)
    .join('');
}

/**
 * Splits mRNA into triplets (codons)
 */
export function getCodons(mrna: string): string[] {
  const clean = mrna.toUpperCase().replace(/[^ACGU]/g, '');
  const codons: string[] = [];
  for (let i = 0; i < clean.length; i += 3) {
    if (i + 3 <= clean.length) {
      codons.push(clean.slice(i, i + 3));
    }
  }
  return codons;
}

/**
 * Translates mRNA codons into amino acid sequence
 */
export function translateMrna(mrna: string): {
  aminoAcids: string[];
  abbreviations: string[];
  fullNames: string[];
  codons: string[];
  stoppedEarly: boolean;
} {
  const codons = getCodons(mrna);
  const aminoAcids: string[] = [];
  const abbreviations: string[] = [];
  const fullNames: string[] = [];
  let stoppedEarly = false;

  for (const codon of codons) {
    const entry = CODON_TABLE[codon];
    if (!entry) {
      aminoAcids.push('?');
      abbreviations.push('?');
      fullNames.push('Unknown');
      continue;
    }
    if (entry.isStop) {
      stoppedEarly = true;
      break;
    }
    aminoAcids.push(entry.aa);
    abbreviations.push(entry.abbr);
    fullNames.push(entry.name);
  }

  return {
    aminoAcids,
    abbreviations,
    fullNames,
    codons,
    stoppedEarly,
  };
}

export type MutationType = 'silent' | 'missense' | 'nonsense' | 'frameshift';

/**
 * Classifies a point mutation given wildtype and mutated coding DNA
 */
export function classifyMutation(
  originalDna: string,
  mutatedDna: string
): {
  type: MutationType;
  description: string;
  originalAa: string[];
  mutatedAa: string[];
} {
  if (originalDna.length !== mutatedDna.length) {
    const origTrans = translateMrna(transcribeCodingDnaToMrna(originalDna));
    const mutTrans = translateMrna(transcribeCodingDnaToMrna(mutatedDna));
    return {
      type: 'frameshift',
      description: 'Frameshift mutation: Indel altered the triplet reading frame downstream.',
      originalAa: origTrans.abbreviations,
      mutatedAa: mutTrans.abbreviations,
    };
  }

  const origMrna = transcribeCodingDnaToMrna(originalDna);
  const mutMrna = transcribeCodingDnaToMrna(mutatedDna);

  const origTrans = translateMrna(origMrna);
  const mutTrans = translateMrna(mutMrna);

  // Compare translated chains
  const origCodons = getCodons(origMrna);
  const mutCodons = getCodons(mutMrna);

  let firstDiffIdx = -1;
  for (let i = 0; i < origCodons.length; i++) {
    if (origCodons[i] !== mutCodons[i]) {
      firstDiffIdx = i;
      break;
    }
  }

  if (firstDiffIdx === -1) {
    return {
      type: 'silent',
      description: 'No sequence change detected.',
      originalAa: origTrans.abbreviations,
      mutatedAa: mutTrans.abbreviations,
    };
  }

  const origEntry = CODON_TABLE[origCodons[firstDiffIdx]];
  const mutEntry = CODON_TABLE[mutCodons[firstDiffIdx]];

  if (mutEntry?.isStop && !origEntry?.isStop) {
    return {
      type: 'nonsense',
      description: `Nonsense mutation: Codon ${mutCodons[firstDiffIdx]} creates a premature stop codon, truncating the polypeptide.`,
      originalAa: origTrans.abbreviations,
      mutatedAa: mutTrans.abbreviations,
    };
  }

  if (origEntry?.abbr === mutEntry?.abbr) {
    return {
      type: 'silent',
      description: `Silent (synonymous) mutation: Codon ${origCodons[firstDiffIdx]} → ${mutCodons[firstDiffIdx]} codes for the same amino acid (${origEntry?.name}).`,
      originalAa: origTrans.abbreviations,
      mutatedAa: mutTrans.abbreviations,
    };
  }

  return {
    type: 'missense',
    description: `Missense mutation: Codon changed from ${origCodons[firstDiffIdx]} (${origEntry?.abbr}) to ${mutCodons[firstDiffIdx]} (${mutEntry?.abbr}), substituting an amino acid.`,
    originalAa: origTrans.abbreviations,
    mutatedAa: mutTrans.abbreviations,
  };
}
