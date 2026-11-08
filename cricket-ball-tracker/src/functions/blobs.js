/**
 * Connected components labeling (Union-Find two-pass), moments, circularity, bounding box
 */

export function extractBlobs(mask, width, height, rgbaData = null) {
  const size = width * height;
  const labels = new Int32Array(size); // 0 = background, >0 = label
  const parent = [0]; // 1-indexed disjoint set

  function find(i) {
    let root = i;
    while (root !== parent[root]) {
      root = parent[root];
    }
    // Path compression
    let curr = i;
    while (curr !== root) {
      const nxt = parent[curr];
      parent[curr] = root;
      curr = nxt;
    }
    return root;
  }

  function union(i, j) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      if (rootI < rootJ) {
        parent[rootJ] = rootI;
      } else {
        parent[rootI] = rootJ;
      }
    }
  }

  let nextLabel = 1;

  // Pass 1: Assign provisional labels
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x;
      if (mask[idx] === 0) continue;

      const leftLabel = x > 0 ? labels[idx - 1] : 0;
      const topLabel = y > 0 ? labels[idx - width] : 0;

      if (leftLabel === 0 && topLabel === 0) {
        labels[idx] = nextLabel;
        parent.push(nextLabel);
        nextLabel++;
      } else if (leftLabel !== 0 && topLabel === 0) {
        labels[idx] = leftLabel;
      } else if (leftLabel === 0 && topLabel !== 0) {
        labels[idx] = topLabel;
      } else {
        // Both neighbors have labels
        labels[idx] = leftLabel;
        if (leftLabel !== topLabel) {
          union(leftLabel, topLabel);
        }
      }
    }
  }

  if (nextLabel === 1) return [];

  // Pass 2: Canonical roots and blob stats accumulation
  const blobStats = new Map();

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x;
      const l = labels[idx];
      if (l === 0) continue;

      const root = find(l);
      labels[idx] = root;

      let stat = blobStats.get(root);
      if (!stat) {
        stat = {
          label: root,
          area: 0,
          sumX: 0,
          sumY: 0,
          minX: x,
          maxX: x,
          minY: y,
          maxY: y,
          perimeter: 0,
          sumR: 0,
          sumG: 0,
          sumB: 0,
        };
        blobStats.set(root, stat);
      }

      stat.area++;
      stat.sumX += x;
      stat.sumY += y;
      if (x < stat.minX) stat.minX = x;
      if (x > stat.maxX) stat.maxX = x;
      if (y < stat.minY) stat.minY = y;
      if (y > stat.maxY) stat.maxY = y;

      // Check boundary for perimeter (if border pixel or any 4-neighbor is background)
      const isBorder =
        x === 0 || x === width - 1 || y === 0 || y === height - 1 ||
        mask[idx - 1] === 0 || mask[idx + 1] === 0 ||
        mask[idx - width] === 0 || mask[idx + width] === 0;

      if (isBorder) stat.perimeter++;

      if (rgbaData) {
        const p4 = idx * 4;
        stat.sumR += rgbaData[p4];
        stat.sumG += rgbaData[p4 + 1];
        stat.sumB += rgbaData[p4 + 2];
      }
    }
  }

  const results = [];
  for (const stat of blobStats.values()) {
    // Filter tiny 1-2 pixel noise
    if (stat.area < 3) continue;

    const A = stat.area;
    const P = Math.max(stat.perimeter, 1);
    // Circularity = 4 * PI * A / (P^2). Clamped to [0, 1]
    const rawCircularity = (4 * Math.PI * A) / (P * P);
    const circularity = Math.min(1.0, Math.max(0.01, rawCircularity));

    const radius = Math.sqrt(A / Math.PI);
    const meanR = rgbaData ? stat.sumR / A : 128;
    const meanG = rgbaData ? stat.sumG / A : 128;
    const meanB = rgbaData ? stat.sumB / A : 128;

    results.push({
      id: stat.label,
      area: A,
      x: stat.sumX / A,
      y: stat.sumY / A,
      minX: stat.minX,
      maxX: stat.maxX,
      minY: stat.minY,
      maxY: stat.maxY,
      width: stat.maxX - stat.minX + 1,
      height: stat.maxY - stat.minY + 1,
      radius,
      diameter: radius * 2,
      circularity,
      meanR,
      meanG,
      meanB,
    });
  }

  return results;
}
