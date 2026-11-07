/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodonTableEntry } from '@/types';

// Standard genetic code codon table
export const CODON_TABLE: Record<string, { aa: string; abbr: string; name: string; isStart?: boolean; isStop?: boolean }> = {
  // U
  UUU: { aa: 'F', abbr: 'Phe', name: 'Phenylalanine' },
  UUC: { aa: 'F', abbr: 'Phe', name: 'Phenylalanine' },
  UUA: { aa: 'L', abbr: 'Leu', name: 'Leucine' },
  UUG: { aa: 'L', abbr: 'Leu', name: 'Leucine' },
  UCU: { aa: 'S', abbr: 'Ser', name: 'Serine' },
  UCC: { aa: 'S', abbr: 'Ser', name: 'Serine' },
  UCA: { aa: 'S', abbr: 'Ser', name: 'Serine' },
  UCG: { aa: 'S', abbr: 'Ser', name: 'Serine' },
  UAU: { aa: 'Y', abbr: 'Tyr', name: 'Tyrosine' },
  UAC: { aa: 'Y', abbr: 'Tyr', name: 'Tyrosine' },
  UAA: { aa: 'Stop', abbr: 'Stop', name: 'Stop Codon (Ochre)', isStop: true },
  UAG: { aa: 'Stop', abbr: 'Stop', name: 'Stop Codon (Amber)', isStop: true },
  UGU: { aa: 'C', abbr: 'Cys', name: 'Cysteine' },
  UGC: { aa: 'C', abbr: 'Cys', name: 'Cysteine' },
  UGA: { aa: 'Stop', abbr: 'Stop', name: 'Stop Codon (Opal)', isStop: true },
  UGG: { aa: 'W', abbr: 'Trp', name: 'Tryptophan' },

  // C
  CUU: { aa: 'L', abbr: 'Leu', name: 'Leucine' },
  CUC: { aa: 'L', abbr: 'Leu', name: 'Leucine' },
  CUA: { aa: 'L', abbr: 'Leu', name: 'Leucine' },
  CUG: { aa: 'L', abbr: 'Leu', name: 'Leucine' },
  CCU: { aa: 'P', abbr: 'Pro', name: 'Proline' },
  CCC: { aa: 'P', abbr: 'Pro', name: 'Proline' },
  CCA: { aa: 'P', abbr: 'Pro', name: 'Proline' },
  CCG: { aa: 'P', abbr: 'Pro', name: 'Proline' },
  CAU: { aa: 'H', abbr: 'His', name: 'Histidine' },
  CAC: { aa: 'H', abbr: 'His', name: 'Histidine' },
  CAA: { aa: 'Q', abbr: 'Gln', name: 'Glutamine' },
  CAG: { aa: 'Q', abbr: 'Gln', name: 'Glutamine' },
  CGU: { aa: 'R', abbr: 'Arg', name: 'Arginine' },
  CGC: { aa: 'R', abbr: 'Arg', name: 'Arginine' },
  CGA: { aa: 'R', abbr: 'Arg', name: 'Arginine' },
  CGG: { aa: 'R', abbr: 'Arg', name: 'Arginine' },

  // A
  AUU: { aa: 'I', abbr: 'Ile', name: 'Isoleucine' },
  AUC: { aa: 'I', abbr: 'Ile', name: 'Isoleucine' },
  AUA: { aa: 'I', abbr: 'Ile', name: 'Isoleucine' },
  AUG: { aa: 'M', abbr: 'Met', name: 'Methionine (Start)', isStart: true },
  ACU: { aa: 'T', abbr: 'Thr', name: 'Threonine' },
  ACC: { aa: 'T', abbr: 'Thr', name: 'Threonine' },
  ACA: { aa: 'T', abbr: 'Thr', name: 'Threonine' },
  ACG: { aa: 'T', abbr: 'Thr', name: 'Threonine' },
  AAU: { aa: 'N', abbr: 'Asn', name: 'Asparagine' },
  AAC: { aa: 'N', abbr: 'Asn', name: 'Asparagine' },
  AAA: { aa: 'K', abbr: 'Lys', name: 'Lysine' },
  AAG: { aa: 'K', abbr: 'Lys', name: 'Lysine' },
  AGU: { aa: 'S', abbr: 'Ser', name: 'Serine' },
  AGC: { aa: 'S', abbr: 'Ser', name: 'Serine' },
  AGA: { aa: 'R', abbr: 'Arg', name: 'Arginine' },
  AGG: { aa: 'R', abbr: 'Arg', name: 'Arginine' },

  // G
  GUU: { aa: 'V', abbr: 'Val', name: 'Valine' },
  GUC: { aa: 'V', abbr: 'Val', name: 'Valine' },
  GUA: { aa: 'V', abbr: 'Val', name: 'Valine' },
  GUG: { aa: 'V', abbr: 'Val', name: 'Valine' },
  GCU: { aa: 'A', abbr: 'Ala', name: 'Alanine' },
  GCC: { aa: 'A', abbr: 'Ala', name: 'Alanine' },
  GCA: { aa: 'A', abbr: 'Ala', name: 'Alanine' },
  GCG: { aa: 'A', abbr: 'Ala', name: 'Alanine' },
  GAU: { aa: 'D', abbr: 'Asp', name: 'Aspartic Acid' },
  GAC: { aa: 'D', abbr: 'Asp', name: 'Aspartic Acid' },
  GAA: { aa: 'E', abbr: 'Glu', name: 'Glutamic Acid' },
  GAG: { aa: 'E', abbr: 'Glu', name: 'Glutamic Acid' },
  GGU: { aa: 'G', abbr: 'Gly', name: 'Glycine' },
  GGC: { aa: 'G', abbr: 'Gly', name: 'Glycine' },
  GGA: { aa: 'G', abbr: 'Gly', name: 'Glycine' },
  GGG: { aa: 'G', abbr: 'Gly', name: 'Glycine' },
};

export const CODON_LIST: CodonTableEntry[] = Object.entries(CODON_TABLE).map(
  ([codon, info]) => ({
    codon,
    aminoAcid: info.aa,
    abbreviation: info.abbr,
    fullName: info.name,
    isStart: info.isStart,
    isStop: info.isStop,
  })
);
