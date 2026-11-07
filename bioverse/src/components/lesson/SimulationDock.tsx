/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Lesson } from '@/types';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Play, Pause, RotateCcw, Zap, Sparkles } from 'lucide-react';
import {
  INITIAL_AP_STATE,
  stepActionPotential,
  ActionPotentialState,
} from '@/simulations/actionPotential';
import {
  createInitialDiffusionState,
  stepDiffusion,
  DiffusionState,
} from '@/simulations/diffusion';
import {
  classifyMutation,
  isValidDna,
  transcribeCodingDnaToMrna,
  translateMrna,
} from '@/functions/dna';
import { calculateMonohybridCross } from '@/functions/punnett';
import { getBaseColor } from '@/utils/color';

interface SimulationDockProps {
  lesson: Lesson;
  onSimulationStateUpdate?: (state: any) => void;
}

export function SimulationDock({ lesson, onSimulationStateUpdate }: SimulationDockProps) {
  // Action Potential State
  const [apState, setApState] = useState<ActionPotentialState>(INITIAL_AP_STATE);
  const [apStimulusTrigger, setApStimulusTrigger] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Diffusion State
  const [diffState, setDiffState] = useState<DiffusionState>(() => createInitialDiffusionState(28, 4));
  const diffCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDiffPlaying, setIsDiffPlaying] = useState(true);

  // DNA Sequence & Translation State
  const [dnaInput, setDnaInput] = useState('ATGCCAGCTTAA');
  const [mutatedIndex, setMutatedIndex] = useState<number | null>(null);

  // Punnett State
  const [parent1Genotype, setParent1Genotype] = useState('Bb');
  const [parent2Genotype, setParent2Genotype] = useState('Bb');

  // Broadcast simulation state changes to parent/3D stage
  useEffect(() => {
    if (lesson.simulationType === 'actionPotential') {
      onSimulationStateUpdate?.({
        waveProgress: apState.waveProgress,
        voltage: apState.voltage,
        phase: apState.phase,
      });
    }
  }, [apState, lesson.simulationType, onSimulationStateUpdate]);

  // ----------------------------------------------------
  // ACTION POTENTIAL LOOP & RENDER
  // ----------------------------------------------------
  useEffect(() => {
    if (lesson.simulationType !== 'actionPotential') return;

    const interval = setInterval(() => {
      setApState((prev) => {
        const next = stepActionPotential(prev, apStimulusTrigger, 0.2);
        return next;
      });
      if (apStimulusTrigger) {
        setApStimulusTrigger(false);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [lesson.simulationType, apStimulusTrigger]);

  // Draw Voltage Graph on Canvas
  useEffect(() => {
    if (lesson.simulationType !== 'actionPotential') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background & grid lines
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Voltage mapping: -90mV (bottom) to +40mV (top)
    const mapY = (v: number) => {
      const minV = -90;
      const maxV = 45;
      return height - ((v - minV) / (maxV - minV)) * height;
    };

    // Draw reference lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Threshold line (-55 mV)
    const threshY = mapY(-55);
    ctx.beginPath();
    ctx.moveTo(0, threshY);
    ctx.lineTo(width, threshY);
    ctx.stroke();

    // Resting line (-70 mV)
    const restY = mapY(-70);
    ctx.beginPath();
    ctx.moveTo(0, restY);
    ctx.lineTo(width, restY);
    ctx.stroke();

    ctx.setLineDash([]);

    // Line labels
    ctx.fillStyle = '#f59e0b';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('Threshold: -55mV', 8, threshY - 4);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Resting: -70mV', 8, restY - 4);

    // Plot voltage curve
    const history = apState.history;
    if (history.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = apState.voltage > -55 ? '#f97316' : '#38bdf8';
      ctx.lineWidth = 2.5;

      for (let i = 0; i < history.length; i++) {
        const x = (i / (history.length - 1)) * width;
        const y = mapY(history[i].v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Current point head
      const lastX = width;
      const lastY = mapY(apState.voltage);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(lastX - 4, lastY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [apState, lesson.simulationType]);

  // ----------------------------------------------------
  // DIFFUSION LOOP & CANVAS
  // ----------------------------------------------------
  useEffect(() => {
    if (lesson.simulationType !== 'diffusion' || !isDiffPlaying) return;

    const interval = setInterval(() => {
      setDiffState((prev) => stepDiffusion(prev));
    }, 40);

    return () => clearInterval(interval);
  }, [lesson.simulationType, isDiffPlaying]);

  useEffect(() => {
    if (lesson.simulationType !== 'diffusion') return;
    const canvas = diffCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#090b0e';
    ctx.fillRect(0, 0, w, h);

    // Middle membrane line
    ctx.strokeStyle = diffState.permeable ? '#14b8a6' : '#f43f5e';
    ctx.lineWidth = diffState.permeable ? 2 : 4;
    ctx.setLineDash(diffState.permeable ? [6, 6] : []);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw solute particles
    for (const p of diffState.particles) {
      const cx = ((p.x + 1) / 2) * w;
      const cy = ((p.y + 1) / 2) * h;

      ctx.fillStyle = p.x < 0 ? '#ea580c' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [diffState, lesson.simulationType]);

  // ----------------------------------------------------
  // RENDER BASED ON SIMULATION TYPE
  // ----------------------------------------------------

  // 1. ACTION POTENTIAL
  if (lesson.simulationType === 'actionPotential') {
    return (
      <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              Action Potential Oscilloscope
            </span>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-stone-800 text-amber-400">
            {Math.round(apState.voltage)} mV
          </span>
        </div>

        {/* Live Canvas Graph */}
        <canvas
          ref={canvasRef}
          width={360}
          height={130}
          className="w-full h-28 rounded-xl border border-stone-800 bg-stone-950"
        />

        {/* Controls */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-stone-400">Stimulus: {apState.stimulusStrength}%</span>
            <input
              type="range"
              min="10"
              max="100"
              value={apState.stimulusStrength}
              onChange={(e) =>
                setApState((prev) => ({
                  ...prev,
                  stimulusStrength: parseInt(e.target.value),
                }))
              }
              className="accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-stone-400 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={apState.isMyelinated}
                onChange={(e) =>
                  setApState((prev) => ({ ...prev, isMyelinated: e.target.checked }))
                }
                className="accent-lime-500"
              />
              <span>Myelinated</span>
            </label>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setApStimulusTrigger(true)}
              className="text-xs py-1 px-3"
            >
              Stimulate
            </Button>
          </div>
        </div>

        {/* Channel Indicators */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-800 text-stone-400">
          <div>
            Na+ channels:{' '}
            <span className={apState.naChannelsOpen ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
              {apState.naChannelsOpen ? 'OPEN (Depol)' : 'Closed'}
            </span>
          </div>
          <div>
            K+ channels:{' '}
            <span className={apState.kChannelsOpen ? 'text-amber-400 font-bold' : 'text-stone-500'}>
              {apState.kChannelsOpen ? 'OPEN (Repol)' : 'Closed'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. DIFFUSION / OSMOSIS
  if (lesson.simulationType === 'diffusion') {
    return (
      <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
            Membrane Diffusion Simulation
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDiffPlaying((prev) => !prev)}
              className="p-1 h-7 text-xs"
            >
              {isDiffPlaying ? <Pause size={12} /> : <Play size={12} />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDiffState(createInitialDiffusionState(28, 4))}
              className="p-1 h-7 text-xs"
            >
              <RotateCcw size={12} />
            </Button>
          </div>
        </div>

        <canvas
          ref={diffCanvasRef}
          width={360}
          height={120}
          className="w-full h-24 rounded-xl border border-stone-800 bg-stone-950"
        />

        <div className="flex items-center justify-between text-xs text-stone-300">
          <div>
            Left Solute: <span className="font-mono text-amber-400">{diffState.leftSoluteCount}</span>
          </div>
          <button
            onClick={() => setDiffState((p) => ({ ...p, permeable: !p.permeable }))}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
              diffState.permeable
                ? 'bg-teal-950 border-teal-500 text-teal-300'
                : 'bg-rose-950 border-rose-500 text-rose-300'
            }`}
          >
            {diffState.permeable ? 'Permeable Membrane' : 'Impermeable Membrane'}
          </button>
          <div>
            Right Solute: <span className="font-mono text-sky-400">{diffState.rightSoluteCount}</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. DNA TRANSLATION & MUTATION (for DNA, translation, and mutations lessons)
  if (
    lesson.simulationType === 'translation' ||
    lesson.simulationType === 'mutation' ||
    lesson.simulationType === 'transcription' ||
    lesson.simulationType === 'replication'
  ) {
    const isValid = isValidDna(dnaInput);
    const mrna = isValid ? transcribeCodingDnaToMrna(dnaInput) : '';
    const translated = isValid ? translateMrna(mrna) : null;

    const handleMutateBase = (index: number) => {
      const bases = ['A', 'C', 'G', 'T'];
      const current = dnaInput[index].toUpperCase();
      const alternatives = bases.filter((b) => b !== current);
      const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
      const nextDna = dnaInput.substring(0, index) + replacement + dnaInput.substring(index + 1);
      setDnaInput(nextDna);
      setMutatedIndex(index);
    };

    const mutationAnalysis =
      mutatedIndex !== null
        ? classifyMutation('ATGCCAGCTTAA', dnaInput)
        : null;

    return (
      <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              Genetic Code Analyzer & Synthesizer
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDnaInput('ATGCCAGCTTAA');
              setMutatedIndex(null);
            }}
            className="text-[11px] p-1 h-6"
          >
            Reset DNA
          </Button>
        </div>

        {/* Interactive clickable DNA bases */}
        <div>
          <label className="text-[11px] text-stone-400 block mb-1">
            Coding DNA Strand (Click any base to mutate):
          </label>
          <div className="flex flex-wrap gap-1 font-mono text-sm bg-stone-950 p-2 rounded-xl border border-stone-800">
            {dnaInput.split('').map((base, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleMutateBase(idx)}
                className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                  mutatedIndex === idx ? 'ring-2 ring-white scale-105' : ''
                }`}
                style={{
                  backgroundColor: `${getBaseColor(base)}22`,
                  color: getBaseColor(base),
                  border: `1px solid ${getBaseColor(base)}66`,
                }}
                title={`Click to mutate base #${idx + 1}`}
              >
                {base}
              </button>
            ))}
          </div>
        </div>

        {/* mRNA Transcript */}
        <div className="text-xs">
          <span className="text-stone-400">mRNA Transcript: </span>
          <span className="font-mono text-violet-400 tracking-wider font-semibold">
            {mrna || 'Invalid DNA'}
          </span>
        </div>

        {/* Translated Polypeptide */}
        {translated && (
          <div>
            <span className="text-xs text-stone-400 block mb-1">
              Polypeptide Chain:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {translated.fullNames.map((name, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30"
                >
                  {name} ({translated.abbreviations[i]})
                </span>
              ))}
              {translated.stoppedEarly && (
                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  STOP
                </span>
              )}
            </div>
          </div>
        )}

        {/* Mutation Effect Callout */}
        {mutationAnalysis && (
          <div
            className={`p-2.5 rounded-xl text-xs border ${
              mutationAnalysis.type === 'nonsense'
                ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                : mutationAnalysis.type === 'silent'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                : 'bg-amber-950/40 border-amber-800 text-amber-200'
            }`}
          >
            <strong>{mutationAnalysis.type.toUpperCase()}: </strong>
            {mutationAnalysis.description}
          </div>
        )}
      </div>
    );
  }

  // 4. PUNNETT SQUARES
  if (lesson.simulationType === 'punnett') {
    const cross = calculateMonohybridCross(parent1Genotype, parent2Genotype);

    return (
      <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
          Mendelian Monohybrid Cross
        </span>

        {/* Parent genotype selectors */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-stone-400 block mb-1">Parent 1 (Maternal):</label>
            <select
              value={parent1Genotype}
              onChange={(e) => setParent1Genotype(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-100"
            >
              <option value="BB">BB (Homozygous Dominant)</option>
              <option value="Bb">Bb (Heterozygous)</option>
              <option value="bb">bb (Homozygous Recessive)</option>
            </select>
          </div>
          <div>
            <label className="text-stone-400 block mb-1">Parent 2 (Paternal):</label>
            <select
              value={parent2Genotype}
              onChange={(e) => setParent2Genotype(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-100"
            >
              <option value="BB">BB (Homozygous Dominant)</option>
              <option value="Bb">Bb (Heterozygous)</option>
              <option value="bb">bb (Homozygous Recessive)</option>
            </select>
          </div>
        </div>

        {/* 2x2 Punnett Grid */}
        <div className="flex justify-center my-2">
          <div className="grid grid-cols-2 gap-1.5 w-44">
            {cross.grid.flat().map((genotype, i) => {
              const isDom = genotype.includes('B');
              return (
                <div
                  key={i}
                  className={`p-3 text-center rounded-xl font-mono text-base font-bold border ${
                    isDom
                      ? 'bg-amber-950/60 border-amber-600 text-amber-200'
                      : 'bg-teal-950/60 border-teal-600 text-teal-200'
                  }`}
                >
                  {genotype}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ratios summary */}
        <div className="text-xs flex justify-between bg-stone-950 p-2.5 rounded-xl border border-stone-800 text-stone-300">
          <div>
            Dominant (B-): <strong className="text-amber-400">{cross.phenotypePercentages.dominant}%</strong>
          </div>
          <div>
            Recessive (bb): <strong className="text-teal-400">{cross.phenotypePercentages.recessive}%</strong>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for general stage controls
  return null;
}
