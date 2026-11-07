/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Hotspot = {
  id: string;
  label: string;
  position: [number, number, number];
  description: string;
  glossaryId?: string;
};

export type Step = {
  id: string;
  title: string;
  body: string;
  focus?: {
    camera: [number, number, number];
    target: [number, number, number];
  };
  highlight?: string[];
  simulationState?: Record<string, unknown>;
  callout?: {
    type: 'definition' | 'idea' | 'warning' | 'fact';
    title: string;
    text: string;
  };
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type LessonLevel = 'Beginner' | 'Intermediate';

export type Lesson = {
  id: string;
  unit: string;
  order: number;
  title: string;
  summary: string;
  minutes: number;
  level: LessonLevel;
  objectives: string[];
  modelId: string;
  hotspots: Hotspot[];
  steps: Step[];
  quiz: QuizQuestion[];
  glossary: string[];
  simulationType?: 'diffusion' | 'atp' | 'mitosis' | 'actionPotential' | 'synapse' | 'replication' | 'transcription' | 'translation' | 'mutation' | 'punnett' | 'cardiacCycle';
};

export type Unit = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  color: string;
  lessonIds: string[];
};

export type GlossaryEntry = {
  id: string;
  term: string;
  pronunciation?: string;
  category: 'cell' | 'genetics' | 'neuroscience' | 'physiology' | 'general';
  definition: string;
  etymology?: string;
  relatedLessons: string[];
  relatedTerms?: string[];
};

export type CodonTableEntry = {
  codon: string;
  aminoAcid: string;
  abbreviation: string;
  fullName: string;
  isStart?: boolean;
  isStop?: boolean;
};

export type Model3DProps = {
  highlightedParts?: string[];
  selectedHotspot?: string | null;
  onSelectHotspot?: (id: string) => void;
  simulationState?: any;
  showLabels?: boolean;
  exploded?: number; // 0 to 1
};

export type SearchResult = {
  id: string;
  type: 'lesson' | 'glossary' | 'model';
  title: string;
  subtitle: string;
  snippet: string;
  link: string;
  score: number;
};
