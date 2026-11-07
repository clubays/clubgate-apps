/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StageCanvas } from '@/components/stage/StageCanvas';
import { LESSONS } from '@/data/lessons';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ArrowRight, Layers, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModelMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  parts: string[];
  relatedLessonIds: string[];
}

const MODELS_CATALOG: ModelMeta[] = [
  {
    id: 'cell',
    name: 'Eukaryotic Animal Cell',
    category: 'Cellular Biology',
    description: 'A cross-section model showing the plasma membrane, double-membrane nucleus, endoplasmic reticulum, Golgi body, mitochondria, and cytosolic ribosomes.',
    parts: ['Plasma Membrane', 'Nucleus & Nucleolus', 'Endoplasmic Reticulum', 'Golgi Apparatus', 'Mitochondria', 'Centrioles'],
    relatedLessonIds: ['cell-intro', 'cell-division-mitosis'],
  },
  {
    id: 'membrane',
    name: 'Phospholipid Bilayer & Channel',
    category: 'Biochemistry',
    description: 'Dual leaflet array of amphipathic phospholipid molecules with hydrophilic polar heads, hydrophobic fatty acid chains, and a transmembrane ion channel.',
    parts: ['Hydrophilic Phosphate Heads', 'Hydrophobic Hydrocarbon Tails', 'Alpha-Helical Transmembrane Pore'],
    relatedLessonIds: ['cell-membrane'],
  },
  {
    id: 'mitochondrion',
    name: 'Mitochondrion with Cristae',
    category: 'Bioenergetics',
    description: 'Double-membrane powerhouse organelle with porous outer membrane, extensively pleated cristae folds, matrix enzymes, and rotary ATP synthases.',
    parts: ['Outer Membrane', 'Inner Cristae Folds', 'Matrix', 'ATP Synthase Complexes', 'Circular mtDNA Loop'],
    relatedLessonIds: ['mitochondria-energy'],
  },
  {
    id: 'dna',
    name: 'DNA Double Helix',
    category: 'Genetics',
    description: 'Watson-Crick antiparallel right-handed double helix. Visualizes sugar-phosphate ribbons and color-coded Adenine, Thymine, Guanine, and Cytosine base pairs.',
    parts: ['5′-to-3′ Sugar-Phosphate Backbone', 'Adenine-Thymine (A-T) Pairs', 'Guanine-Cytosine (G-C) Pairs', 'Major & Minor Grooves'],
    relatedLessonIds: ['dna-double-helix', 'base-pairing-game', 'dna-replication', 'transcription', 'mutations', 'punnett-squares'],
  },
  {
    id: 'ribosome',
    name: 'Ribosome & tRNA Complex',
    category: 'Molecular Biology',
    description: 'Large (50S/60S) and small (30S/40S) ribosomal subunits gripping an mRNA transcript with aminoacyl and peptidyl tRNAs forming peptide bonds.',
    parts: ['Large Catalytic Subunit', 'Small Decoding Subunit', 'mRNA Guide Channel', 'P & A Site tRNAs', 'Nascent Polypeptide'],
    relatedLessonIds: ['translation'],
  },
  {
    id: 'neuron',
    name: 'Multipolar Motor Neuron',
    category: 'Neuroscience',
    description: 'Excitable neural cell body with extensive dendritic spines, axon hillock trigger zone, long axon core, Schwann cell myelin sheaths, and synaptic boutons.',
    parts: ['Dendritic Tree', 'Soma (Cell Body)', 'Axon Hillock', 'Myelin Sheaths', 'Nodes of Ranvier', 'Axon Boutons'],
    relatedLessonIds: ['neuron-anatomy', 'action-potential', 'reflex-arc'],
  },
  {
    id: 'synapse',
    name: 'Chemical Synapse Junction',
    category: 'Neuroscience',
    description: 'Presynaptic terminal bulb containing neurotransmitter vesicles, the 20nm microscopic synaptic cleft, and postsynaptic ligand-gated receptors.',
    parts: ['Presynaptic Terminal Bulb', 'Synaptic Vesicles', 'Active Zone Exocytosis', 'Synaptic Cleft', 'Postsynaptic Receptors'],
    relatedLessonIds: ['synapse'],
  },
  {
    id: 'heart',
    name: 'Four-Chambered Heart',
    category: 'Physiology',
    description: 'Mammalian cardiac anatomy featuring right atrium and ventricle (pulmonary circuit), thick left ventricle (systemic circuit), and the aortic arch.',
    parts: ['Right Atrium & Ventricle', 'Left Ventricle (Thick Myocardium)', 'Left Atrium', 'Aortic Arch', 'Pulmonary Trunk'],
    relatedLessonIds: ['heart-circulation'],
  },
];

export default function ModelsPage() {
  const [selectedModelId, setSelectedModelId] = useState('cell');

  const selectedModel =
    MODELS_CATALOG.find((m) => m.id === selectedModelId) || MODELS_CATALOG[0];

  const relatedLessons = LESSONS.filter((l) =>
    selectedModel.relatedLessonIds.includes(l.id)
  );

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row overflow-hidden bg-stone-100 dark:bg-stone-950">
      {/* Left Sidebar: Model selector list */}
      <div className="w-full lg:w-80 h-48 lg:h-full border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-y-auto p-4 shrink-0">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
          <Layers size={14} className="text-amber-600" />
          <span>3D Models Library ({MODELS_CATALOG.length})</span>
        </div>

        <div className="space-y-1.5">
          {MODELS_CATALOG.map((m) => {
            const isSelected = m.id === selectedModelId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedModelId(m.id)}
                className={cn(
                  'w-full text-left p-3 rounded-2xl transition-all border cursor-pointer',
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-stone-900 dark:text-stone-100 shadow-2xs'
                    : 'border-transparent hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-600 dark:text-stone-300'
                )}
              >
                <div className="font-semibold text-xs sm:text-sm">{m.name}</div>
                <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                  {m.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Viewport: Interactive 3D Model View */}
      <div className="flex-1 h-full min-h-0 relative">
        <StageCanvas
          modelId={selectedModel.id}
          hotspots={selectedModel.parts.map((p, i) => ({
            id: `part-${i}`,
            label: p,
            position: [
              Math.sin(i * 1.2) * 1.2,
              Math.cos(i * 1.5) * 0.8,
              Math.sin(i * 2.1) * 0.9,
            ],
            description: `Part of ${selectedModel.name}`,
          }))}
        />
      </div>

      {/* Right Drawer: Model Specifications & Related Lessons */}
      <div className="w-full lg:w-96 border-l border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-5 overflow-y-auto shrink-0 flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <Chip label={selectedModel.category} variant="teal" size="sm" className="mb-2" />
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {selectedModel.name}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-serif leading-relaxed mt-2">
              {selectedModel.description}
            </p>
          </div>

          {/* Constituent parts pill list */}
          <div>
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Anatomical Components:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedModel.parts.map((part, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/80"
                >
                  {part}
                </span>
              ))}
            </div>
          </div>

          {/* Related Lessons */}
          <div>
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Featured in Lessons:
            </div>
            <div className="space-y-2">
              {relatedLessons.map((l) => (
                <Link
                  key={l.id}
                  to={`/lesson/${l.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 bg-stone-50/50 dark:bg-stone-950/40 text-xs text-stone-800 dark:text-stone-200 transition-colors group"
                >
                  <div>
                    <span className="font-mono text-stone-400 mr-2">#{l.order}</span>
                    <span className="font-semibold">{l.title}</span>
                  </div>
                  <ExternalLink size={14} className="text-stone-400 group-hover:text-amber-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        {relatedLessons[0] && (
          <div className="pt-6 mt-6 border-t border-stone-200 dark:border-stone-800">
            <Link to={`/lesson/${relatedLessons[0].id}`}>
              <Button size="md" className="w-full">
                <span>Start Lesson with this Model</span>
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
