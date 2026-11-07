/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Model3DProps } from '@/types';
import { Cell } from './Cell';
import { Membrane } from './Membrane';
import { Mitochondrion } from './Mitochondrion';
import { DnaHelix } from './DnaHelix';
import { Ribosome } from './Ribosome';
import { Neuron } from './Neuron';
import { Synapse } from './Synapse';
import { Heart } from './Heart';

export const MODEL_REGISTRY: Record<string, React.ComponentType<Model3DProps>> = {
  cell: Cell,
  membrane: Membrane,
  mitochondrion: Mitochondrion,
  dna: DnaHelix,
  ribosome: Ribosome,
  neuron: Neuron,
  synapse: Synapse,
  heart: Heart,
};

export {
  Cell,
  Membrane,
  Mitochondrion,
  DnaHelix,
  Ribosome,
  Neuron,
  Synapse,
  Heart,
};
