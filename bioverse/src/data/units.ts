/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Unit } from '@/types';

export const UNITS: Unit[] = [
  {
    id: 'unit-1',
    order: 1,
    title: 'Unit 1 · The Cell',
    subtitle: 'The fundamental building block of life',
    description: 'Explore cell anatomy, organelle machinery, membrane transport, mitochondria, and cell division through mitosis.',
    iconName: 'Shapes',
    color: '#0d9488', // Teal
    lessonIds: ['cell-intro', 'cell-membrane', 'mitochondria-energy', 'cell-division-mitosis'],
  },
  {
    id: 'unit-2',
    order: 2,
    title: 'Unit 2 · DNA & Genes',
    subtitle: 'The molecular blueprint of heredity',
    description: 'Deconstruct the double helix, base pairing rules, DNA replication, mRNA transcription, ribosome translation, and genetic mutations.',
    iconName: 'Dna',
    color: '#ea580c', // Coral
    lessonIds: [
      'dna-double-helix',
      'base-pairing-game',
      'dna-replication',
      'transcription',
      'translation',
      'mutations',
    ],
  },
  {
    id: 'unit-3',
    order: 3,
    title: 'Unit 3 · The Nervous System',
    subtitle: 'Bioelectric computation & signaling',
    description: 'Tour the neuron, analyze the action potential with live voltage recording, understand synaptic transmission, and trace reflex arcs.',
    iconName: 'Zap',
    color: '#f59e0b', // Amber
    lessonIds: ['neuron-anatomy', 'action-potential', 'synapse', 'reflex-arc'],
  },
  {
    id: 'unit-4',
    order: 4,
    title: 'Unit 4 · Body Systems & Genetics',
    subtitle: 'Organ physiology & inheritance',
    description: 'Simulate heart chambers and valve cycles, then predict genetic inheritance patterns using interactive Punnett squares.',
    iconName: 'Activity',
    color: '#ec4899', // Pink
    lessonIds: ['heart-circulation', 'punnett-squares'],
  },
];
