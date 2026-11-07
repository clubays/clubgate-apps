export interface PlotOptions {
  xmin?: number;
  xmax?: number;
  ymin?: number;
  ymax?: number;
  equal?: boolean;
  showGrid?: boolean;
  showAxes?: boolean;
}

export interface Bounds {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

export class Plot {
  container: HTMLElement;
  options: Required<PlotOptions>;
  initialBounds: Bounds;
  bounds: Bounds;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  isDragging = false;
  dragStart = { x: 0, y: 0 };
  boundsStart: Bounds;
  width = 0;
  height = 0;
  dpr = 1;
  private _raf: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private renderFn: ((p: Plot) => void) | null = null;

  constructor(container: HTMLElement | string, options: PlotOptions = {}) {
    this.container =
      typeof container === "string"
        ? (document.querySelector(container) as HTMLElement)
        : container;

    this.options = {
      xmin: options.xmin ?? -5,
      xmax: options.xmax ?? 5,
      ymin: options.ymin ?? -5,
      ymax: options.ymax ?? 5,
      equal: options.equal ?? false,
      showGrid: options.showGrid ?? true,
      showAxes: options.showAxes ?? true,
    };

    this.initialBounds = {
      xmin: this.options.xmin,
      xmax: this.options.xmax,
      ymin: this.options.ymin,
      ymax: this.options.ymax,
    };
    this.bounds = { ...this.initialBounds };
    this.boundsStart = { ...this.bounds };

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
    this.container.appendChild(this.canvas);

    this.initEvents();
    this.resize();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
  }

  initEvents() {
    this.canvas.addEventListener("pointerdown", (e) => {
      this.isDragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.boundsStart = { ...this.bounds };
      try {
        this.canvas.setPointerCapture(e.pointerId);
      } catch (_) {}
    });

    this.canvas.addEventListener("pointermove", (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      const xSpan = this.boundsStart.xmax - this.boundsStart.xmin;
      const ySpan = this.boundsStart.ymax - this.boundsStart.ymin;
      const worldDx = (dx / (this.width || 1)) * xSpan;
      const worldDy = (dy / (this.height || 1)) * ySpan;

      this.bounds.xmin = this.boundsStart.xmin - worldDx;
      this.bounds.xmax = this.boundsStart.xmax - worldDx;
      this.bounds.ymin = this.boundsStart.ymin + worldDy;
      this.bounds.ymax = this.boundsStart.ymax + worldDy;

      this.requestDraw();
    });

    const stopDrag = (e: PointerEvent) => {
      if (this.isDragging) {
        this.isDragging = false;
        try {
          this.canvas.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    };
    this.canvas.addEventListener("pointerup", stopDrag);
    this.canvas.addEventListener("pointercancel", stopDrag);

    // Zoom on Ctrl/Cmd + wheel
    this.canvas.addEventListener(
      "wheel",
      (e) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const world = this.toWorld(mouseX, mouseY);

        this.bounds.xmin = world.x + (this.bounds.xmin - world.x) * zoomFactor;
        this.bounds.xmax = world.x + (this.bounds.xmax - world.x) * zoomFactor;
        this.bounds.ymin = world.y + (this.bounds.ymin - world.y) * zoomFactor;
        this.bounds.ymax = world.y + (this.bounds.ymax - world.y) * zoomFactor;

        this.requestDraw();
      },
      { passive: false },
    );

    // Double click to reset
    this.canvas.addEventListener("dblclick", () => {
      this.resetView();
    });
  }

  resetView() {
    this.bounds = { ...this.initialBounds };
    this.requestDraw();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.requestDraw();
  }

  toScreen(wx: number, wy: number) {
    let xmin = this.bounds.xmin,
      xmax = this.bounds.xmax;
    let ymin = this.bounds.ymin,
      ymax = this.bounds.ymax;

    if (this.options.equal) {
      const wSpan = xmax - xmin;
      const hSpan = ymax - ymin;
      const aspect = (this.width || 1) / (this.height || 1);
      if (wSpan / hSpan < aspect) {
        const extra = (hSpan * aspect - wSpan) / 2;
        xmin -= extra;
        xmax += extra;
      } else {
        const extra = (wSpan / aspect - hSpan) / 2;
        ymin -= extra;
        ymax += extra;
      }
    }

    const sx = ((wx - xmin) / (xmax - xmin)) * this.width;
    const sy = ((ymax - wy) / (ymax - ymin)) * this.height;
    return { x: sx, y: sy };
  }

  toWorld(sx: number, sy: number) {
    let xmin = this.bounds.xmin,
      xmax = this.bounds.xmax;
    let ymin = this.bounds.ymin,
      ymax = this.bounds.ymax;

    if (this.options.equal) {
      const wSpan = xmax - xmin;
      const hSpan = ymax - ymin;
      const aspect = (this.width || 1) / (this.height || 1);
      if (wSpan / hSpan < aspect) {
        const extra = (hSpan * aspect - wSpan) / 2;
        xmin -= extra;
        xmax += extra;
      } else {
        const extra = (wSpan / aspect - hSpan) / 2;
        ymin -= extra;
        ymax += extra;
      }
    }

    const wx = xmin + (sx / (this.width || 1)) * (xmax - xmin);
    const wy = ymax - (sy / (this.height || 1)) * (ymax - ymin);
    return { x: wx, y: wy };
  }

  getColors() {
    const s = getComputedStyle(document.documentElement);
    return {
      bg: s.getPropertyValue("--bg").trim() || "#f6f3ea",
      panel: s.getPropertyValue("--panel").trim() || "#fffdf7",
      line: s.getPropertyValue("--line").trim() || "#d9d3c0",
      ink: s.getPropertyValue("--ink").trim() || "#14213d",
      muted: s.getPropertyValue("--muted").trim() || "#5b6477",
      accent: s.getPropertyValue("--accent").trim() || "#c2371d",
      accentTint: s.getPropertyValue("--accent-tint").trim() || "#f6dfd7",
      grid: s.getPropertyValue("--grid").trim() || "rgba(52,90,140,.10)",
      gridStrong:
        s.getPropertyValue("--grid-strong").trim() || "rgba(52,90,140,.18)",
      cf: s.getPropertyValue("--c-f").trim() || "#1d5fa8",
      cd: s.getPropertyValue("--c-d").trim() || "#2a7f62",
      cdd: s.getPropertyValue("--c-dd").trim() || "#b7791f",
      cArea: s.getPropertyValue("--c-area").trim() || "rgba(29,95,168,.18)",
      mono: s.getPropertyValue("--mono").trim() || "monospace",
    };
  }

  requestDraw() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => {
      this.draw();
    });
  }

  setRender(fn: (p: Plot) => void) {
    this.renderFn = fn;
    this.requestDraw();
  }

  clear() {
    this.ctx.save();
    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawAxesAndGrid() {
    const c = this.getColors();
    const ctx = this.ctx;

    // Determine grid step
    const xSpan = this.bounds.xmax - this.bounds.xmin;
    const rawStep = xSpan / 8;
    const power = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const fraction = rawStep / power;
    let step = power;
    if (fraction > 5) step = 5 * power;
    else if (fraction > 2) step = 2 * power;

    // Draw Grid Lines
    const startX = Math.floor(this.bounds.xmin / step) * step;
    const endX = Math.ceil(this.bounds.xmax / step) * step;

    ctx.lineWidth = 1;
    for (let x = startX; x <= endX; x += step) {
      const p1 = this.toScreen(x, this.bounds.ymin);
      const p2 = this.toScreen(x, this.bounds.ymax);
      const isMajor = Math.abs(Math.round(x / step)) % 5 === 0;
      ctx.strokeStyle = isMajor ? c.gridStrong : c.grid;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    const ySpan = this.bounds.ymax - this.bounds.ymin;
    const rawYStep = ySpan / 6;
    const yPower = Math.pow(10, Math.floor(Math.log10(rawYStep)));
    const yFrac = rawYStep / yPower;
    let yStep = yPower;
    if (yFrac > 5) yStep = 5 * yPower;
    else if (yFrac > 2) yStep = 2 * yPower;

    const startY = Math.floor(this.bounds.ymin / yStep) * yStep;
    const endY = Math.ceil(this.bounds.ymax / yStep) * yStep;

    for (let y = startY; y <= endY; y += yStep) {
      const p1 = this.toScreen(this.bounds.xmin, y);
      const p2 = this.toScreen(this.bounds.xmax, y);
      const isMajor = Math.abs(Math.round(y / yStep)) % 5 === 0;
      ctx.strokeStyle = isMajor ? c.gridStrong : c.grid;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Axes
    if (this.options.showAxes) {
      const origin = this.toScreen(0, 0);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = c.ink;
      ctx.globalAlpha = 0.6;

      // X Axis
      if (origin.y >= 0 && origin.y <= this.height) {
        ctx.beginPath();
        ctx.moveTo(0, origin.y);
        ctx.lineTo(this.width, origin.y);
        ctx.stroke();
      }
      // Y Axis
      if (origin.x >= 0 && origin.x <= this.width) {
        ctx.beginPath();
        ctx.moveTo(origin.x, 0);
        ctx.lineTo(origin.x, this.height);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // Ticks & labels
      ctx.font = `10.5px ${c.mono}`;
      ctx.fillStyle = c.muted;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      const labelY = Math.min(Math.max(origin.y + 4, 4), this.height - 16);
      for (let x = startX; x <= endX; x += step) {
        if (Math.abs(x) < 1e-9) continue;
        const p = this.toScreen(x, 0);
        const txt = Number(x.toFixed(4)).toString();
        ctx.fillText(txt, p.x, labelY);
      }

      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const labelX = Math.min(Math.max(origin.x - 6, 32), this.width - 4);
      for (let y = startY; y <= endY; y += yStep) {
        if (Math.abs(y) < 1e-9) continue;
        const p = this.toScreen(0, y);
        const txt = Number(y.toFixed(4)).toString();
        ctx.fillText(txt, labelX, p.y);
      }
    }
  }

  curve(fn: (x: number) => number, color: string, width = 2, stepPx = 1.5) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    let started = false;
    let prevY: number | null = null;
    const maxJump = this.height * 1.5;

    for (let sx = 0; sx <= this.width; sx += stepPx) {
      const wx = this.toWorld(sx, 0).x;
      let wy: number;
      try {
        wy = fn(wx);
      } catch (_) {
        wy = NaN;
      }

      if (isNaN(wy) || !isFinite(wy)) {
        started = false;
        continue;
      }

      const sy = this.toScreen(wx, wy).y;

      if (!started) {
        ctx.moveTo(sx, sy);
        started = true;
      } else {
        if (prevY !== null && Math.abs(sy - prevY) > maxJump) {
          ctx.moveTo(sx, sy);
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      prevY = sy;
    }
    ctx.stroke();
    ctx.restore();
  }

  line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width = 1.5,
    dashed: number[] = [],
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dashed.length) ctx.setLineDash(dashed);

    const dx = x2 - x1;
    const dy = y2 - y1;
    if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) {
      ctx.restore();
      return;
    }

    const t = 1000;
    const pA = this.toScreen(x1 - dx * t, y1 - dy * t);
    const pB = this.toScreen(x2 + dx * t, y2 + dy * t);

    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.stroke();
    ctx.restore();
  }

  segment(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width = 1.5,
    dashed: number[] = [],
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dashed.length) ctx.setLineDash(dashed);

    const p1 = this.toScreen(x1, y1);
    const p2 = this.toScreen(x2, y2);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  }

  dot(x: number, y: number, r = 4.5, color: string = "#c2371d", ringColor = "#ffffff") {
    const ctx = this.ctx;
    const p = this.toScreen(x, y);
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, r + 2, 0, Math.PI * 2);
    ctx.fillStyle = ringColor;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  fillBetween(
    f: (x: number) => number,
    g: ((x: number) => number) | null,
    a: number,
    b: number,
    color: string,
    stepPx = 1.5,
  ) {
    const ctx = this.ctx;
    const pA = this.toScreen(a, 0);
    const pB = this.toScreen(b, 0);
    const startSx = Math.min(pA.x, pB.x);
    const endSx = Math.max(pA.x, pB.x);

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();

    // Top boundary along f
    let started = false;
    for (let sx = startSx; sx <= endSx; sx += stepPx) {
      const wx = this.toWorld(sx, 0).x;
      const wy = f(wx);
      const sy = this.toScreen(wx, wy).y;
      if (!started) {
        ctx.moveTo(sx, sy);
        started = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }

    // Bottom boundary back along g
    for (let sx = endSx; sx >= startSx; sx -= stepPx) {
      const wx = this.toWorld(sx, 0).x;
      const wy = g ? g(wx) : 0;
      const sy = this.toScreen(wx, wy).y;
      ctx.lineTo(sx, sy);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  rect(x: number, y: number, w: number, h: number, fill?: string | null, stroke?: string | null) {
    const p1 = this.toScreen(x, y + h);
    const p2 = this.toScreen(x + w, y);
    const rx = Math.min(p1.x, p2.x);
    const ry = Math.min(p1.y, p2.y);
    const rw = Math.abs(p2.x - p1.x);
    const rh = Math.abs(p2.y - p1.y);

    const ctx = this.ctx;
    ctx.save();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(rx, ry, rw, rh);
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.strokeRect(rx, ry, rw, rh);
    }
    ctx.restore();
  }

  label(
    text: string,
    x: number,
    y: number,
    opts: {
      font?: string;
      color?: string;
      align?: CanvasTextAlign;
      baseline?: CanvasTextBaseline;
      bg?: string;
      dx?: number;
      dy?: number;
    } = {},
  ) {
    const ctx = this.ctx;
    const c = this.getColors();
    const p = this.toScreen(x, y);
    ctx.save();
    ctx.font = opts.font || `11px ${c.mono}`;
    ctx.fillStyle = opts.color || c.ink;
    ctx.textAlign = opts.align || "left";
    ctx.textBaseline = opts.baseline || "bottom";

    if (opts.bg) {
      const metrics = ctx.measureText(text);
      const pad = 3;
      ctx.fillStyle = opts.bg;
      ctx.fillRect(
        p.x - pad + (opts.dx || 0),
        p.y - 12 - pad + (opts.dy || 0),
        metrics.width + pad * 2,
        14 + pad * 2,
      );
      ctx.fillStyle = opts.color || c.ink;
    }
    ctx.fillText(text, p.x + (opts.dx || 0), p.y + (opts.dy || 0));
    ctx.restore();
  }

  draw() {
    this.clear();
    if (this.options.showGrid) this.drawAxesAndGrid();
    if (this.renderFn) this.renderFn(this);
    this.ctx.restore();
  }

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }
}
