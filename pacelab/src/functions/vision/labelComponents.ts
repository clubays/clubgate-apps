export interface ConnectedBlob {
  id: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  area: number;
  cx: number;
  cy: number;
  circularity: number;
  perimeter: number;
}

/**
 * Connected Component Labeling using a fast two-pass disjoint-set algorithm.
 * Reuses internal Int32Array buffers to eliminate GC churn on high-speed frame loops.
 */
export class ConnectedComponentLabeler {
  private labels: Int32Array;
  private parent: Int32Array;
  private width: number;
  private height: number;
  private maxComponents: number;

  constructor(width: number, height: number, maxComponents = 10000) {
    this.width = width;
    this.height = height;
    this.maxComponents = maxComponents;
    this.labels = new Int32Array(width * height);
    this.parent = new Int32Array(maxComponents);
  }

  private find(x: number): number {
    let root = x;
    while (this.parent[root] > 0) {
      root = this.parent[root];
    }
    // Path compression
    let curr = x;
    while (curr !== root && this.parent[curr] > 0) {
      const nxt = this.parent[curr];
      this.parent[curr] = root;
      curr = nxt;
    }
    return root;
  }

  private union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX !== rootY) {
      if (rootX < rootY) {
        this.parent[rootY] = rootX;
      } else {
        this.parent[rootX] = rootY;
      }
    }
  }

  public label(mask: Uint8Array): ConnectedBlob[] {
    const w = this.width;
    const h = this.height;
    const labels = this.labels;
    const parent = this.parent;

    labels.fill(0);
    parent.fill(0);

    let nextLabel = 1;

    // First Pass: raster scan with 4-connectivity (left and top)
    for (let y = 0; y < h; y++) {
      const rowOffset = y * w;
      for (let x = 0; x < w; x++) {
        const idx = rowOffset + x;
        if (mask[idx] === 0) continue;

        const leftLabel = x > 0 ? labels[idx - 1] : 0;
        const topLabel = y > 0 ? labels[idx - w] : 0;

        if (leftLabel === 0 && topLabel === 0) {
          if (nextLabel < this.maxComponents - 1) {
            labels[idx] = nextLabel;
            nextLabel++;
          }
        } else if (leftLabel !== 0 && topLabel === 0) {
          labels[idx] = leftLabel;
        } else if (leftLabel === 0 && topLabel !== 0) {
          labels[idx] = topLabel;
        } else {
          labels[idx] = leftLabel;
          if (leftLabel !== topLabel) {
            this.union(leftLabel, topLabel);
          }
        }
      }
    }

    if (nextLabel <= 1) return [];

    // Second Pass: resolve roots and accumulate stats
    // We map root labels to consecutive blob indices
    const rootToIdx = new Map<number, number>();
    const stats: Array<{
      id: number;
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
      area: number;
      sumX: number;
      sumY: number;
      perimeter: number;
    }> = [];

    for (let y = 0; y < h; y++) {
      const rowOffset = y * w;
      for (let x = 0; x < w; x++) {
        const idx = rowOffset + x;
        const lbl = labels[idx];
        if (lbl === 0) continue;

        const root = this.find(lbl);
        let sIdx = rootToIdx.get(root);
        if (sIdx === undefined) {
          sIdx = stats.length;
          rootToIdx.set(root, sIdx);
          stats.push({
            id: sIdx + 1,
            minX: x,
            minY: y,
            maxX: x,
            maxY: y,
            area: 0,
            sumX: 0,
            sumY: 0,
            perimeter: 0,
          });
        }

        const s = stats[sIdx];
        s.area++;
        s.sumX += x;
        s.sumY += y;
        if (x < s.minX) s.minX = x;
        if (x > s.maxX) s.maxX = x;
        if (y < s.minY) s.minY = y;
        if (y > s.maxY) s.maxY = y;

        // Perimeter check: has background neighbor in 4-neighborhood
        const isBorder =
          x === 0 || x === w - 1 || y === 0 || y === h - 1 ||
          mask[idx - 1] === 0 || mask[idx + 1] === 0 ||
          mask[idx - w] === 0 || mask[idx + w] === 0;

        if (isBorder) {
          s.perimeter++;
        }
      }
    }

    const blobs: ConnectedBlob[] = [];
    for (const s of stats) {
      if (s.area < 2) continue;
      const bw = s.maxX - s.minX + 1;
      const bh = s.maxY - s.minY + 1;
      const maxDim = Math.max(bw, bh);
      const minDim = Math.min(bw, bh);

      // Circularity metric tailored for motion-blurred projectiles:
      // Combines aspect ratio with density inside bounding ellipse
      const ellipseArea = (Math.PI * bw * bh) / 4;
      const fillFactor = Math.min(1.0, s.area / Math.max(1, ellipseArea));
      const aspectFactor = Math.min(1.0, (minDim / Math.max(1, maxDim)) * 1.5);
      const circularity = Math.max(0, Math.min(1.0, fillFactor * 0.5 + aspectFactor * 0.5));

      blobs.push({
        id: s.id,
        minX: s.minX,
        minY: s.minY,
        maxX: s.maxX,
        maxY: s.maxY,
        width: bw,
        height: bh,
        area: s.area,
        cx: s.sumX / s.area,
        cy: s.sumY / s.area,
        circularity,
        perimeter: s.perimeter,
      });
    }

    return blobs;
  }
}
