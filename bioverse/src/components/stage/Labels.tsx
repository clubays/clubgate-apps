/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Hotspot } from '@/types';
import { HotspotMarker } from './HotspotMarker';

interface LabelsProps {
  hotspots: Hotspot[];
  selectedHotspot: string | null;
  onSelectHotspot: (id: string) => void;
  showLabels: boolean;
}

export function Labels({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  showLabels,
}: LabelsProps) {
  if (!hotspots || hotspots.length === 0) return null;

  return (
    <group>
      {hotspots.map((hs) => (
        <HotspotMarker
          key={hs.id}
          hotspot={hs}
          isSelected={selectedHotspot === hs.id}
          onSelect={onSelectHotspot}
          showLabel={showLabels}
        />
      ))}
    </group>
  );
}
