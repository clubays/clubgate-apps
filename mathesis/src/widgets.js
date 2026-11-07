import { Plot } from "./plot.js";

// Numerical derivative
function numDeriv(f, x, h = 1e-5) {
  return (f(x + h) - f(x - h)) / (2 * h);
}

// Numerical integration Simpson 4000 strips
export function simpson(f, a, b, n = 4000) {
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i += 2) s += 4 * f(a + i * h);
  for (let i = 2; i < n; i += 2) s += 2 * f(a + i * h);
  return (s * h) / 3;
}

export const WIDGET_REGISTRY = {
  // 1. Secant
  secant(container, props = {}) {
    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · Secant to Tangent</span>
        <button class="widget-reset" title="Reset view"><svg class="ico" style="width:14px;height:14px"><use href="#i-reset"/></svg></button>
      </div>
      <div class="widget-canvas-wrap"></div>
      <div class="widget-controls">
        <div class="control-row">
          <label class="control-label">Function</label>
          <select class="ctrl-select f-select">
            <option value="x2">f(x) = x²</option>
            <option value="x3">f(x) = x³</option>
            <option value="sin">f(x) = sin x</option>
            <option value="exp">f(x) = eˣ</option>
          </select>
          <button class="play-btn"><svg class="ico" style="width:12px;height:12px"><use href="#i-play"/></svg> Play h → 0</button>
        </div>
        <div class="control-row">
          <label class="control-label">x₀: <span class="val x0-val">1.00</span></label>
          <input type="range" class="x0-range" min="-3" max="3" step="0.05" value="1">
        </div>
        <div class="control-row">
          <label class="control-label">h: <span class="val h-val">1.500</span></label>
          <input type="range" class="h-range" min="0" max="1" step="0.005" value="0.04">
        </div>
      </div>
      <div class="readout-grid">
        <div class="readout-cell"><span class="lbl">Secant slope</span><span class="num sec-slope">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">True f′(x₀)</span><span class="num true-slope">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">Gap |Δ|</span><span class="num slope-gap">0.0000</span></div>
      </div>
      <figcaption class="widget-caption">Drag h toward 0 to watch the secant line snap to the true tangent.</figcaption>
    `;

    const canvasWrap = container.querySelector(".widget-canvas-wrap");
    const fSelect = container.querySelector(".f-select");
    const x0Range = container.querySelector(".x0-range");
    const hRange = container.querySelector(".h-range");
    const x0Val = container.querySelector(".x0-val");
    const hVal = container.querySelector(".h-val");
    const secSlopeEl = container.querySelector(".sec-slope");
    const trueSlopeEl = container.querySelector(".true-slope");
    const slopeGapEl = container.querySelector(".slope-gap");
    const playBtn = container.querySelector(".play-btn");
    const resetBtn = container.querySelector(".widget-reset");

    const funcs = {
      x2: { f: (x) => x * x, df: (x) => 2 * x },
      x3: { f: (x) => x * x * x, df: (x) => 3 * x * x },
      sin: { f: (x) => Math.sin(x), df: (x) => Math.cos(x) },
      exp: { f: (x) => Math.exp(x), df: (x) => Math.exp(x) },
    };

    let fKey = "x2";
    let x0 = 1.0;
    // h mapped log scale from 2 down to 0.001
    // t from 0 to 1 -> h = 2 * (0.001 / 2)^t
    function tToH(t) {
      return 2 * Math.pow(0.001 / 2, t);
    }
    function hToT(h) {
      return Math.log(h / 2) / Math.log(0.001 / 2);
    }

    let h = 1.5;
    hRange.value = hToT(h);

    const plot = new Plot(canvasWrap, { xmin: -4, xmax: 4, ymin: -2, ymax: 6 });

    function update() {
      const { f, df } = funcs[fKey];
      const secSlope = (f(x0 + h) - f(x0)) / h;
      const trueSlope = df(x0);
      const gap = Math.abs(secSlope - trueSlope);

      x0Val.textContent = x0.toFixed(2);
      hVal.textContent = h.toFixed(3);
      secSlopeEl.textContent = secSlope.toFixed(4);
      trueSlopeEl.textContent = trueSlope.toFixed(4);
      slopeGapEl.textContent = gap.toFixed(4);

      plot.setRender((p) => {
        const c = p.getColors();
        p.curve(f, c.cf, 2);

        // Points P & Q
        const py = f(x0);
        const qx = x0 + h;
        const qy = f(qx);

        // Tangent faint dashed
        p.line(x0, py, x0 + 1, py + trueSlope, c.accent, 1.2, [4, 4]);

        // Secant red pencil
        p.line(x0, py, qx, qy, c.accent, 2);

        p.dot(x0, py, 4.5, c.cf);
        p.label("P", x0, py, { dx: -12, dy: -6, color: c.ink });
        p.dot(qx, qy, 4.5, c.accent);
        p.label("Q", qx, qy, { dx: 8, dy: -6, color: c.accent });
      });
    }

    fSelect.addEventListener("change", () => {
      fKey = fSelect.value;
      update();
    });
    x0Range.addEventListener("input", () => {
      x0 = parseFloat(x0Range.value);
      update();
    });
    hRange.addEventListener("input", () => {
      h = tToH(parseFloat(hRange.value));
      update();
    });
    resetBtn.addEventListener("click", () => plot.resetView());

    let animId = null;
    playBtn.addEventListener("click", () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
        return;
      }
      const startT = performance.now();
      const dur = 4000;
      function step(now) {
        const elapsed = now - startT;
        const p = Math.min(1, elapsed / dur);
        // Exponential ease in
        const ease = 1 - Math.exp(-3.5 * p);
        hRange.value = ease;
        h = tToH(ease);
        update();
        if (p < 1) animId = requestAnimationFrame(step);
        else animId = null;
      }
      animId = requestAnimationFrame(step);
    });

    update();
    return plot;
  },

  // 2. Tangent & Derivative Trace
  tangent(container, props = {}) {
    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · Tangent & Derivative Trace</span>
        <button class="widget-reset" title="Reset view"><svg class="ico" style="width:14px;height:14px"><use href="#i-reset"/></svg></button>
      </div>
      <div class="widget-canvas-wrap"></div>
      <div class="widget-controls">
        <div class="control-row">
          <label class="control-label">Function</label>
          <select class="ctrl-select f-select">
            <option value="x2">f(x) = x²</option>
            <option value="cubic">f(x) = x³ − 3x</option>
            <option value="sin">f(x) = sin x</option>
            <option value="exp">f(x) = eˣ</option>
            <option value="inv">f(x) = 1/x</option>
          </select>
          <span style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-left:auto">Drag canvas or use ← / → keys</span>
        </div>
      </div>
      <div class="readout-grid">
        <div class="readout-cell"><span class="lbl">x</span><span class="num out-x">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">f(x)</span><span class="num out-fx">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">f′(x) (slope)</span><span class="num out-dfx">0.0000</span></div>
      </div>
      <figcaption class="widget-caption">Move the point along f(x) (blue); the lower plot simultaneously traces f′(x) (green).</figcaption>
    `;

    const canvasWrap = container.querySelector(".widget-canvas-wrap");
    const fSelect = container.querySelector(".f-select");
    const outX = container.querySelector(".out-x");
    const outFx = container.querySelector(".out-fx");
    const outDfx = container.querySelector(".out-dfx");
    const resetBtn = container.querySelector(".widget-reset");

    const funcs = {
      x2: { f: (x) => x * x, df: (x) => 2 * x },
      cubic: { f: (x) => x * x * x - 3 * x, df: (x) => 3 * x * x - 3 },
      sin: { f: (x) => Math.sin(x), df: (x) => Math.cos(x) },
      exp: { f: (x) => Math.exp(x), df: (x) => Math.exp(x) },
      inv: { f: (x) => 1 / x, df: (x) => -1 / (x * x) },
    };

    let fKey = props.preset || "x2";
    fSelect.value = fKey;
    let currX = 1.0;

    const plot = new Plot(canvasWrap, { xmin: -4, xmax: 4, ymin: -3, ymax: 5 });

    function update() {
      const { f, df } = funcs[fKey];
      const y = f(currX);
      const slope = df(currX);

      outX.textContent = currX.toFixed(4);
      outFx.textContent = y.toFixed(4);
      outDfx.textContent = slope.toFixed(4);

      plot.setRender((p) => {
        const c = p.getColors();
        const ctx = p.ctx;

        // Draw f(x) on upper 60%
        p.curve(f, c.cf, 2);

        // Tangent line drawn +-1.6 units
        const tLen = 1.6;
        const dx = tLen / Math.sqrt(1 + slope * slope);
        const dy = slope * dx;
        p.segment(currX - dx, y - dy, currX + dx, y + dy, c.accent, 2);
        p.dot(currX, y, 5, c.accent);

        // Divider for lower f' plot (40% height)
        const dividerY = p.height * 0.6;
        ctx.save();
        ctx.strokeStyle = c.line;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, dividerY);
        ctx.lineTo(p.width, dividerY);
        ctx.stroke();
        ctx.restore();

        p.label("f′(x) trace", p.bounds.xmin + 0.3, p.bounds.ymin + 0.4, {
          color: c.cd,
        });

        // Draw f' in green
        p.curve(df, c.cd, 2);
        p.dot(currX, slope, 4.5, c.cd);

        // Vertical link between upper point and lower derivative point
        p.segment(currX, y, currX, slope, c.muted, 1, [2, 3]);
      });
    }

    fSelect.addEventListener("change", () => {
      fKey = fSelect.value;
      update();
    });
    resetBtn.addEventListener("click", () => plot.resetView());

    // Drag or click to change currX
    canvasWrap.addEventListener("pointermove", (e) => {
      if (e.buttons > 0) {
        const rect = canvasWrap.getBoundingClientRect();
        const world = plot.toWorld(e.clientX - rect.left, e.clientY - rect.top);
        currX = Math.max(plot.bounds.xmin, Math.min(plot.bounds.xmax, world.x));
        update();
      }
    });
    canvasWrap.addEventListener("pointerdown", (e) => {
      const rect = canvasWrap.getBoundingClientRect();
      const world = plot.toWorld(e.clientX - rect.left, e.clientY - rect.top);
      currX = Math.max(plot.bounds.xmin, Math.min(plot.bounds.xmax, world.x));
      update();
    });

    // Arrow keys
    window.addEventListener("keydown", (e) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.key === "ArrowLeft") {
        currX -= 0.05;
        update();
      } else if (e.key === "ArrowRight") {
        currX += 0.05;
        update();
      }
    });

    update();
    return plot;
  },

  // 3. Symbolic Plotter
  plotter(container, props = {}) {
    const showF2 = props.showFDoublePrime || false;
    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · Function & Derivative Plotter</span>
        <button class="widget-reset" title="Reset view"><svg class="ico" style="width:14px;height:14px"><use href="#i-reset"/></svg></button>
      </div>
      <div class="widget-canvas-wrap"></div>
      <div class="widget-controls">
        <div class="control-row">
          <label class="control-label">f(x) =</label>
          <input type="text" class="ctrl-input expr-input" style="flex:1" value="${props.initialExpr || "sin(x)"}">
        </div>
        <div class="control-row chips-row" style="gap:6px">
          <span style="font-family:var(--mono);font-size:11px;color:var(--muted)">Presets:</span>
          ${["x^2", "sin(x)", "x^3 - 3x", "e^x", "log(x)", "1/x", "x*sin(x)"].map((p) => `<button class="chip preset-chip">${p}</button>`).join("")}
        </div>
        <div class="control-row" style="gap:12px">
          <button class="chip toggle-d1 active" style="color:var(--c-d)">✓ Show f′(x)</button>
          <button class="chip toggle-d2 ${showF2 ? "active" : ""}" style="color:var(--c-dd)">${showF2 ? "✓" : ""} Show f″(x)</button>
        </div>
      </div>
      <div class="readout-grid" style="grid-template-columns:1fr">
        <div class="readout-cell">
          <span class="lbl">Symbolic Derivative</span>
          <div class="latex-out" style="min-height:24px;margin-top:4px"></div>
          <div class="error-msg" style="color:var(--accent);font-family:var(--mono);font-size:11px;display:none;margin-top:4px">Couldn't read that expression</div>
        </div>
      </div>
      <figcaption class="widget-caption">Edit f(x) with any standard expression; math.js computes symbolic derivatives live.</figcaption>
    `;

    const canvasWrap = container.querySelector(".widget-canvas-wrap");
    const exprInput = container.querySelector(".expr-input");
    const latexOut = container.querySelector(".latex-out");
    const errorMsg = container.querySelector(".error-msg");
    const toggleD1 = container.querySelector(".toggle-d1");
    const toggleD2 = container.querySelector(".toggle-d2");
    const presetChips = container.querySelectorAll(".preset-chip");
    const resetBtn = container.querySelector(".widget-reset");

    let showD1 = true;
    let showD2 = showF2;

    const plot = new Plot(canvasWrap, { xmin: -5, xmax: 5, ymin: -4, ymax: 4 });

    function compileAndPlot() {
      if (!window.math) {
        errorMsg.textContent = "math.js library not loaded";
        errorMsg.style.display = "block";
        return;
      }
      try {
        const raw = exprInput.value.trim();
        const node = window.math.parse(raw);
        const compiled = node.compile();

        const dNode = window.math.derivative(node, "x");
        const compiledD1 = dNode.compile();

        const d2Node = window.math.derivative(dNode, "x");
        const compiledD2 = d2Node.compile();

        errorMsg.style.display = "none";

        // Typeset LaTeX
        if (window.katex) {
          try {
            latexOut.innerHTML = window.katex.renderToString(
              `f'(x) = ${dNode.toTex()}`,
              { throwOnError: false },
            );
          } catch (_) {
            latexOut.textContent = `f'(x) = ${dNode.toString()}`;
          }
        } else {
          latexOut.textContent = `f'(x) = ${dNode.toString()}`;
        }

        const fn = (x) => compiled.evaluate({ x, e: Math.E, pi: Math.PI });
        const dfn = (x) => compiledD1.evaluate({ x, e: Math.E, pi: Math.PI });
        const d2fn = (x) => compiledD2.evaluate({ x, e: Math.E, pi: Math.PI });

        plot.setRender((p) => {
          const c = p.getColors();
          p.curve(fn, c.cf, 2);
          if (showD1) p.curve(dfn, c.cd, 1.8);
          if (showD2) p.curve(d2fn, c.cdd, 1.8);
        });
      } catch (err) {
        errorMsg.style.display = "block";
      }
    }

    exprInput.addEventListener("input", compileAndPlot);
    presetChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        exprInput.value = chip.textContent;
        compileAndPlot();
      });
    });

    toggleD1.addEventListener("click", () => {
      showD1 = !showD1;
      toggleD1.textContent = (showD1 ? "✓ " : "") + "Show f′(x)";
      toggleD1.classList.toggle("active", showD1);
      compileAndPlot();
    });

    toggleD2.addEventListener("click", () => {
      showD2 = !showD2;
      toggleD2.textContent = (showD2 ? "✓ " : "") + "Show f″(x)";
      toggleD2.classList.toggle("active", showD2);
      compileAndPlot();
    });

    resetBtn.addEventListener("click", () => plot.resetView());

    compileAndPlot();
    return plot;
  },

  // 4. Chain rule
  chain(container) {
    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · The Chain Rule</span>
        <button class="widget-reset" title="Reset view"><svg class="ico" style="width:14px;height:14px"><use href="#i-reset"/></svg></button>
      </div>
      <div class="widget-canvas-wrap"></div>
      <div class="widget-controls">
        <div class="control-row">
          <label class="control-label">Composition</label>
          <select class="ctrl-select comp-select">
            <option value="sin_x2">f(x) = sin(x²)</option>
            <option value="exp_mx2">f(x) = exp(−x²)</option>
            <option value="sqrt_x2p1">f(x) = √(x² + 1)</option>
            <option value="cube_2xp1">f(x) = (2x + 1)³</option>
          </select>
        </div>
        <div class="control-row">
          <label class="control-label">x: <span class="val x-val">1.00</span></label>
          <input type="range" class="x-range" min="-2.5" max="2.5" step="0.05" value="1">
        </div>
      </div>
      <div class="readout-grid">
        <div class="readout-cell"><span class="lbl">g′(u) (outer)</span><span class="num out-gu">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">u′(x) (inner)</span><span class="num out-ux">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">Product g′·u′</span><span class="num out-prod">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">Numeric f′(x)</span><span class="num out-num">0.0000</span></div>
      </div>
      <figcaption class="widget-caption">Amber: inner u(x); Blue: composite f(x)=g(u(x)); Green: derivative f′(x). Notice g′(u)·u′(x) exactly equals f′(x).</figcaption>
    `;

    const canvasWrap = container.querySelector(".widget-canvas-wrap");
    const compSelect = container.querySelector(".comp-select");
    const xRange = container.querySelector(".x-range");
    const xVal = container.querySelector(".x-val");
    const outGu = container.querySelector(".out-gu");
    const outUx = container.querySelector(".out-ux");
    const outProd = container.querySelector(".out-prod");
    const outNum = container.querySelector(".out-num");
    const resetBtn = container.querySelector(".widget-reset");

    const comps = {
      sin_x2: {
        u: (x) => x * x,
        du: (x) => 2 * x,
        g: (u) => Math.sin(u),
        dg: (u) => Math.cos(u),
      },
      exp_mx2: {
        u: (x) => -x * x,
        du: (x) => -2 * x,
        g: (u) => Math.exp(u),
        dg: (u) => Math.exp(u),
      },
      sqrt_x2p1: {
        u: (x) => x * x + 1,
        du: (x) => 2 * x,
        g: (u) => Math.sqrt(u),
        dg: (u) => 1 / (2 * Math.sqrt(u)),
      },
      cube_2xp1: {
        u: (x) => 2 * x + 1,
        du: (x) => 2,
        g: (u) => u * u * u,
        dg: (u) => 3 * u * u,
      },
    };

    let key = "sin_x2";
    let x = 1.0;

    const plot = new Plot(canvasWrap, { xmin: -3, xmax: 3, ymin: -3, ymax: 4 });

    function update() {
      const c = comps[key];
      const uVal = c.u(x);
      const duVal = c.du(x);
      const dgVal = c.dg(uVal);
      const prod = dgVal * duVal;

      const f = (t) => c.g(c.u(t));
      const numF = numDeriv(f, x);

      xVal.textContent = x.toFixed(2);
      outGu.textContent = dgVal.toFixed(4);
      outUx.textContent = duVal.toFixed(4);
      outProd.textContent = prod.toFixed(4);
      outNum.textContent = numF.toFixed(4);

      plot.setRender((p) => {
        const col = p.getColors();
        p.curve(c.u, col.cdd, 1.6); // u(x) amber
        p.curve(f, col.cf, 2); // f(x) blue
        p.curve((t) => c.dg(c.u(t)) * c.du(t), col.cd, 1.8); // f' green

        // Dot on f
        p.dot(x, f(x), 5, col.accent);
        p.dot(x, c.u(x), 4, col.cdd);
      });
    }

    compSelect.addEventListener("change", () => {
      key = compSelect.value;
      update();
    });
    xRange.addEventListener("input", () => {
      x = parseFloat(xRange.value);
      update();
    });
    resetBtn.addEventListener("click", () => plot.resetView());

    update();
    return plot;
  },

  // 5. Implicit Differentiation Circle
  circle(container) {
    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · Implicit Differentiation (x² + y² = 25)</span>
        <button class="widget-reset" title="Reset view"><svg class="ico" style="width:14px;height:14px"><use href="#i-reset"/></svg></button>
      </div>
      <div class="widget-canvas-wrap"></div>
      <div class="widget-controls">
        <div class="control-row">
          <label class="control-label">Angle θ: <span class="val angle-val">53°</span></label>
          <input type="range" class="angle-range" min="0" max="360" step="1" value="53">
        </div>
      </div>
      <div class="readout-grid">
        <div class="readout-cell"><span class="lbl">(x, y)</span><span class="num out-pt">(3.00, 4.00)</span></div>
        <div class="readout-cell"><span class="lbl">dy/dx = −x/y</span><span class="num out-slope">−0.7500</span></div>
        <div class="readout-cell"><span class="lbl">Normal slope</span><span class="num out-norm">+1.3333</span></div>
      </div>
      <figcaption class="widget-caption">At (3, 4), the tangent has slope −3/4. Notice where y=0 gives a vertical tangent.</figcaption>
    `;

    const canvasWrap = container.querySelector(".widget-canvas-wrap");
    const angleRange = container.querySelector(".angle-range");
    const angleVal = container.querySelector(".angle-val");
    const outPt = container.querySelector(".out-pt");
    const outSlope = container.querySelector(".out-slope");
    const outNorm = container.querySelector(".out-norm");
    const resetBtn = container.querySelector(".widget-reset");

    const plot = new Plot(canvasWrap, {
      xmin: -7,
      xmax: 7,
      ymin: -7,
      ymax: 7,
      equal: true,
    });

    function update() {
      const deg = parseFloat(angleRange.value);
      const rad = (deg * Math.PI) / 180;
      const x = 5 * Math.cos(rad);
      const y = 5 * Math.sin(rad);

      angleVal.textContent = `${deg}°`;
      outPt.textContent = `(${x.toFixed(2)}, ${y.toFixed(2)})`;

      if (Math.abs(y) < 0.02) {
        outSlope.textContent = "vertical tangent";
        outNorm.textContent = "0.0000";
      } else {
        const slope = -x / y;
        outSlope.textContent = slope.toFixed(4);
        outNorm.textContent = (y / x).toFixed(4);
      }

      plot.setRender((p) => {
        const c = p.getColors();
        const ctx = p.ctx;

        // Draw Circle
        const origin = p.toScreen(0, 0);
        const rPt = p.toScreen(5, 0);
        const rPx = Math.abs(rPt.x - origin.x);

        ctx.save();
        ctx.strokeStyle = c.cf;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, rPx, 0, Math.PI * 2);
        ctx.stroke();

        // Normal (radius vector)
        p.segment(0, 0, x, y, c.muted, 1, [3, 3]);

        // Tangent
        if (Math.abs(y) < 0.02) {
          p.segment(x, -6, x, 6, c.accent, 2);
        } else {
          const slope = -x / y;
          p.line(x, y, x + 1, y + slope, c.accent, 2);
        }

        // Point
        p.dot(x, y, 5, c.accent);
        ctx.restore();
      });
    }

    angleRange.addEventListener("input", update);
    resetBtn.addEventListener("click", () => plot.resetView());

    update();
    return plot;
  },

  // 6. DerivLab (Interactive Answer Checker)
  derivlab(container, props = {}) {
    const isAnti = props.mode === "antiderivative";
    const preset = props.preset || (isAnti ? "2*x*cos(x^2)" : "x^2*sin(x)");

    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · ${isAnti ? "Antiderivative Lab" : "Derivative Lab"}</span>
      </div>
      <div class="widget-controls" style="border-top:none">
        <div class="control-row">
          <label class="control-label">Target f(x)</label>
          <input type="text" class="ctrl-input target-input" style="flex:1" value="${preset}">
        </div>
        <div class="control-row">
          <label class="control-label">Your answer</label>
          <input type="text" class="ctrl-input answer-input" style="flex:1" placeholder="${isAnti ? "e.g. sin(x^2)" : "e.g. 2*x*sin(x) + x^2*cos(x)"}">
        </div>
      </div>
      <div class="readout-grid" style="grid-template-columns:1fr">
        <div class="readout-cell">
          <span class="lbl">${isAnti ? "Target Antiderivative ∫ f(x) dx" : "Exact Derivative d/dx f(x)"}</span>
          <div class="symbolic-out" style="min-height:24px;margin-top:4px"></div>
        </div>
        <div class="readout-cell">
          <span class="lbl">Result Checker</span>
          <div class="check-result" style="font-family:var(--mono);font-size:14px;margin-top:4px;font-weight:600">Enter an answer above</div>
        </div>
      </div>
      <figcaption class="widget-caption">Test your algebra! The engine evaluates your answer across 25 sample points (ignoring arbitrary constant + C in integration mode).</figcaption>
    `;

    const targetInput = container.querySelector(".target-input");
    const answerInput = container.querySelector(".answer-input");
    const symbolicOut = container.querySelector(".symbolic-out");
    const checkResult = container.querySelector(".check-result");

    function check() {
      if (!window.math) return;
      try {
        const rawTarget = targetInput.value.trim();
        const targetNode = window.math.parse(rawTarget);
        const compiledTarget = targetNode.compile();

        if (!isAnti) {
          const dNode = window.math.derivative(targetNode, "x");
          if (window.katex) {
            symbolicOut.innerHTML = window.katex.renderToString(dNode.toTex(), {
              throwOnError: false,
            });
          } else {
            symbolicOut.textContent = dNode.toString();
          }
        } else {
          symbolicOut.innerHTML = `<span style="font-family:var(--serif);color:var(--muted)">∫ (${rawTarget}) dx</span>`;
        }

        const rawAns = answerInput.value.trim();
        if (!rawAns) {
          checkResult.textContent = "Type an expression above";
          checkResult.style.color = "var(--muted)";
          return;
        }

        const ansNode = window.math.parse(rawAns);
        const compiledAns = ansNode.compile();

        // Sample 25 points in [-2.5, 2.5]
        const samples = [];
        for (let i = 0; i < 25; i++) {
          const x = -2.4 + (i * 4.8) / 24;
          if (Math.abs(x) < 0.05) continue;
          samples.push(x);
        }

        let matches = true;
        let failSample = null;

        if (!isAnti) {
          // Compare ans(x) with derivative of target
          const dNode = window.math.derivative(targetNode, "x");
          const compiledD = dNode.compile();
          for (const x of samples) {
            const expected = compiledD.evaluate({ x });
            const got = compiledAns.evaluate({ x });
            if (isNaN(expected) || !isFinite(expected)) continue;
            if (Math.abs(expected - got) > 1e-3) {
              matches = false;
              failSample = { x, expected, got };
              break;
            }
          }
        } else {
          // Compare d/dx(ans(x)) with target(x)
          const dAns = window.math.derivative(ansNode, "x");
          const compiledDAns = dAns.compile();
          for (const x of samples) {
            const expected = compiledTarget.evaluate({ x });
            const got = compiledDAns.evaluate({ x });
            if (isNaN(expected) || !isFinite(expected)) continue;
            if (Math.abs(expected - got) > 1e-3) {
              matches = false;
              failSample = { x, expected, got };
              break;
            }
          }
        }

        if (matches) {
          checkResult.textContent = "✓ Matches";
          checkResult.style.color = "var(--c-d)";
        } else {
          checkResult.textContent = `✗ Not quite (at x = ${failSample.x.toFixed(2)}: got ${failSample.got.toFixed(3)}, expected ${failSample.expected.toFixed(3)})`;
          checkResult.style.color = "var(--accent)";
        }
      } catch (err) {
        checkResult.textContent = "Expression incomplete or invalid";
        checkResult.style.color = "var(--accent)";
      }
    }

    targetInput.addEventListener("input", check);
    answerInput.addEventListener("input", check);
    check();
    return null;
  },

  // 7. Extrema & First Derivative Test
  extrema(container) {
    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · Extrema & Sign of f′</span>
        <button class="widget-reset" title="Reset view"><svg class="ico" style="width:14px;height:14px"><use href="#i-reset"/></svg></button>
      </div>
      <div class="widget-canvas-wrap"></div>
      <div class="widget-controls">
        <div class="control-row">
          <label class="control-label">Function</label>
          <select class="ctrl-select f-select">
            <option value="cubic">f(x) = x³ − 3x</option>
            <option value="quartic">f(x) = x⁴ − 4x³</option>
            <option value="cubic2">f(x) = 2x³ − 9x² + 12x</option>
          </select>
        </div>
        <div class="control-row">
          <label class="control-label">Marker: <span class="val mark-val">0.00</span></label>
          <input type="range" class="mark-range" min="-3" max="4" step="0.05" value="0">
        </div>
      </div>
      <div class="readout-grid">
        <div class="readout-cell"><span class="lbl">x</span><span class="num out-x">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">f(x)</span><span class="num out-fx">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">f′(x)</span><span class="num out-dfx">0.0000</span></div>
      </div>
      <figcaption class="widget-caption">Shaded band: green where f′&gt;0 (function increasing ↑), red where f′&lt;0 (decreasing ↓). Critical points marked with labels.</figcaption>
    `;

    const canvasWrap = container.querySelector(".widget-canvas-wrap");
    const fSelect = container.querySelector(".f-select");
    const markRange = container.querySelector(".mark-range");
    const markVal = container.querySelector(".mark-val");
    const outX = container.querySelector(".out-x");
    const outFx = container.querySelector(".out-fx");
    const outDfx = container.querySelector(".out-dfx");
    const resetBtn = container.querySelector(".widget-reset");

    const funcs = {
      cubic: {
        f: (x) => x * x * x - 3 * x,
        df: (x) => 3 * x * x - 3,
        crit: [
          { x: -1, y: 2, type: "local max (−1, 2)" },
          { x: 1, y: -2, type: "local min (1, −2)" },
        ],
        bounds: { xmin: -3, xmax: 3, ymin: -4, ymax: 4 },
      },
      quartic: {
        f: (x) => Math.pow(x, 4) - 4 * Math.pow(x, 3),
        df: (x) => 4 * Math.pow(x, 3) - 12 * x * x,
        crit: [
          { x: 0, y: 0, type: "stationary (no extremum)" },
          { x: 3, y: -27, type: "local min (3, −27)" },
        ],
        bounds: { xmin: -1.5, xmax: 4.5, ymin: -30, ymax: 10 },
      },
      cubic2: {
        f: (x) => 2 * Math.pow(x, 3) - 9 * x * x + 12 * x,
        df: (x) => 6 * x * x - 18 * x + 12,
        crit: [
          { x: 1, y: 5, type: "local max (1, 5)" },
          { x: 2, y: 4, type: "local min (2, 4)" },
        ],
        bounds: { xmin: -0.5, xmax: 3.5, ymin: -2, ymax: 8 },
      },
    };

    let fKey = "cubic";
    let mx = 0;

    let plot = new Plot(canvasWrap, funcs[fKey].bounds);

    function update() {
      const data = funcs[fKey];
      const y = data.f(mx);
      const slope = data.df(mx);

      markVal.textContent = mx.toFixed(2);
      outX.textContent = mx.toFixed(4);
      outFx.textContent = y.toFixed(4);
      outDfx.textContent = slope.toFixed(4);

      plot.setRender((p) => {
        const c = p.getColors();
        const ctx = p.ctx;

        // Band along x axis indicating sign of f'
        const bandH = 14;
        const originY = p.toScreen(0, 0).y;
        const bandTop = Math.min(
          p.height - bandH,
          Math.max(0, originY - bandH / 2),
        );

        for (let sx = 0; sx < p.width; sx += 4) {
          const wx = p.toWorld(sx, 0).x;
          const s = data.df(wx);
          ctx.fillStyle = s > 0 ? "rgba(42,127,98,.25)" : "rgba(194,55,29,.25)";
          ctx.fillRect(sx, bandTop, 4, bandH);
        }

        // Curves
        p.curve(data.f, c.cf, 2);
        p.curve(data.df, c.cd, 1.5);

        // Critical points
        for (const pt of data.crit) {
          p.dot(pt.x, pt.y, 5, c.accent);
          p.label(pt.type, pt.x, pt.y, { dy: -8, color: c.ink, bg: c.panel });
        }

        // Tangent at marker
        p.line(mx, y, mx + 1, y + slope, c.accent, 1.8);
        p.dot(mx, y, 5, c.accent);
      });
    }

    fSelect.addEventListener("change", () => {
      fKey = fSelect.value;
      plot.bounds = { ...funcs[fKey].bounds };
      plot.initialBounds = { ...funcs[fKey].bounds };
      markRange.min = plot.bounds.xmin;
      markRange.max = plot.bounds.xmax;
      mx = (plot.bounds.xmin + plot.bounds.xmax) / 2;
      markRange.value = mx;
      update();
    });

    markRange.addEventListener("input", () => {
      mx = parseFloat(markRange.value);
      update();
    });
    resetBtn.addEventListener("click", () => plot.resetView());

    update();
    return plot;
  },

  // 8. Box Optimisation
  box(container) {
    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · Maximising Box Volume</span>
        <button class="widget-reset" title="Reset view"><svg class="ico" style="width:14px;height:14px"><use href="#i-reset"/></svg></button>
      </div>
      <div class="widget-canvas-wrap"></div>
      <div class="widget-controls">
        <div class="control-row">
          <label class="control-label">Cut size x: <span class="val cut-val">1.00</span></label>
          <input type="range" class="cut-range" min="0" max="6" step="0.05" value="1">
        </div>
      </div>
      <div class="readout-grid">
        <div class="readout-cell"><span class="lbl">Cut x</span><span class="num out-x">1.00</span></div>
        <div class="readout-cell"><span class="lbl">Base side (12−2x)</span><span class="num out-base">10.00</span></div>
        <div class="readout-cell"><span class="lbl">Volume V(x)</span><span class="num out-vol">100.00</span></div>
        <div class="readout-cell"><span class="lbl">Max Volume</span><span class="num">128.00 (x = 2)</span></div>
      </div>
      <figcaption class="widget-caption">Left: 12×12 cardboard sheet with corner cutouts; Right: V(x) = x(12−2x)². The apex is at x = 2 with V = 128.</figcaption>
    `;

    const canvasWrap = container.querySelector(".widget-canvas-wrap");
    const cutRange = container.querySelector(".cut-range");
    const cutVal = container.querySelector(".cut-val");
    const outX = container.querySelector(".out-x");
    const outBase = container.querySelector(".out-base");
    const outVol = container.querySelector(".out-vol");
    const resetBtn = container.querySelector(".widget-reset");

    let x = 1.0;
    const plot = new Plot(canvasWrap, {
      xmin: -1,
      xmax: 7,
      ymin: -10,
      ymax: 145,
    });

    function update() {
      const base = 12 - 2 * x;
      const vol = x * base * base;

      cutVal.textContent = x.toFixed(2);
      outX.textContent = x.toFixed(2);
      outBase.textContent = base.toFixed(2);
      outVol.textContent = vol.toFixed(2);

      plot.setRender((p) => {
        const c = p.getColors();
        const ctx = p.ctx;

        // Draw left side: 12x12 sheet diagram
        const midW = p.width * 0.42;
        const sheetSize = Math.min(midW - 40, p.height - 40);
        const ox = 25;
        const oy = (p.height - sheetSize) / 2;
        const scale = sheetSize / 12;

        ctx.save();
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ox, oy, sheetSize, sheetSize);

        // Cutout corners shaded
        const cutPx = x * scale;
        ctx.fillStyle = c.accentTint;
        ctx.fillRect(ox, oy, cutPx, cutPx);
        ctx.fillRect(ox + sheetSize - cutPx, oy, cutPx, cutPx);
        ctx.fillRect(ox, oy + sheetSize - cutPx, cutPx, cutPx);
        ctx.fillRect(
          ox + sheetSize - cutPx,
          oy + sheetSize - cutPx,
          cutPx,
          cutPx,
        );

        // Fold lines dashed
        ctx.strokeStyle = c.accent;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(
          ox + cutPx,
          oy + cutPx,
          sheetSize - 2 * cutPx,
          sheetSize - 2 * cutPx,
        );
        ctx.restore();

        // Right side: Graph of V(x) = x(12-2x)^2
        const V = (t) => (t >= 0 && t <= 6 ? t * Math.pow(12 - 2 * t, 2) : 0);
        p.curve(V, c.cf, 2);

        // Highlight max at (2, 128)
        p.dot(2, 128, 4.5, c.cd);
        p.label("Max (2, 128)", 2, 128, { dy: -8, color: c.cd, bg: c.panel });

        // Operating point
        p.dot(x, vol, 5, c.accent);
        p.label(`V = ${vol.toFixed(1)}`, x, vol, {
          dy: -8,
          color: c.accent,
          bg: c.panel,
        });
      });
    }

    cutRange.addEventListener("input", () => {
      x = parseFloat(cutRange.value);
      update();
    });
    resetBtn.addEventListener("click", () => plot.resetView());

    update();
    return plot;
  },

  // 9. Related Rates Ladder
  ladder(container) {
    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · Sliding Ladder (5m)</span>
        <button class="widget-reset" title="Reset view"><svg class="ico" style="width:14px;height:14px"><use href="#i-reset"/></svg></button>
      </div>
      <div class="widget-canvas-wrap"></div>
      <div class="widget-controls">
        <div class="control-row">
          <label class="control-label">Base x: <span class="val base-val">3.00 m</span></label>
          <input type="range" class="base-range" min="0.5" max="4.8" step="0.05" value="3.0">
          <button class="play-btn"><svg class="ico" style="width:12px;height:12px"><use href="#i-play"/></svg> Slide (dx/dt = 0.5 m/s)</button>
        </div>
      </div>
      <div class="readout-grid">
        <div class="readout-cell"><span class="lbl">Base x</span><span class="num out-x">3.000 m</span></div>
        <div class="readout-cell"><span class="lbl">Height y</span><span class="num out-y">4.000 m</span></div>
        <div class="readout-cell"><span class="lbl">dx/dt</span><span class="num">+0.500 m/s</span></div>
        <div class="readout-cell"><span class="lbl">dy/dt = −(x/y)dx/dt</span><span class="num out-dydt">−0.375 m/s</span></div>
      </div>
      <figcaption class="widget-caption">As x increases at constant rate, the top accelerates downward: dy/dt = −(x/y)(dx/dt).</figcaption>
    `;

    const canvasWrap = container.querySelector(".widget-canvas-wrap");
    const baseRange = container.querySelector(".base-range");
    const baseVal = container.querySelector(".base-val");
    const outX = container.querySelector(".out-x");
    const outY = container.querySelector(".out-y");
    const outDydt = container.querySelector(".out-dydt");
    const playBtn = container.querySelector(".play-btn");
    const resetBtn = container.querySelector(".widget-reset");

    let x = 3.0;
    const L = 5.0;
    const dxdt = 0.5;

    const plot = new Plot(canvasWrap, {
      xmin: -1,
      xmax: 6,
      ymin: -1,
      ymax: 6,
      equal: true,
    });

    function update() {
      const y = Math.sqrt(Math.max(0, L * L - x * x));
      const dydt = y > 0 ? -(x / y) * dxdt : -Infinity;

      baseVal.textContent = `${x.toFixed(2)} m`;
      outX.textContent = `${x.toFixed(3)} m`;
      outY.textContent = `${y.toFixed(3)} m`;
      outDydt.textContent = `${dydt.toFixed(3)} m/s`;

      plot.setRender((p) => {
        const c = p.getColors();
        const ctx = p.ctx;

        // Ground and wall
        p.segment(-0.5, 0, 5.5, 0, c.ink, 3);
        p.segment(0, -0.5, 0, 5.5, c.ink, 3);

        // Ladder
        p.segment(x, 0, 0, y, c.accent, 4);
        p.dot(x, 0, 5, c.accent);
        p.dot(0, y, 5, c.accent);

        // Arc & dimensions
        p.label(`x = ${x.toFixed(2)}`, x / 2, -0.4, {
          align: "center",
          color: c.ink,
        });
        p.label(`y = ${y.toFixed(2)}`, -0.4, y / 2, {
          align: "right",
          color: c.ink,
        });
        p.label(`L = 5m`, x / 2 + 0.3, y / 2 + 0.3, { color: c.accent });
      });
    }

    baseRange.addEventListener("input", () => {
      x = parseFloat(baseRange.value);
      update();
    });
    resetBtn.addEventListener("click", () => plot.resetView());

    let animId = null;
    playBtn.addEventListener("click", () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
        return;
      }
      let lastTime = performance.now();
      function step(now) {
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        x += dxdt * dt;
        if (x >= 4.85) {
          x = 4.85;
          animId = null;
        } else {
          animId = requestAnimationFrame(step);
        }
        baseRange.value = x;
        update();
      }
      animId = requestAnimationFrame(step);
    });

    update();
    return plot;
  },

  // 10. Family of Antiderivatives
  family(container) {
    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · Family of Curves F(x) = x² + C</span>
        <button class="widget-reset" title="Reset view"><svg class="ico" style="width:14px;height:14px"><use href="#i-reset"/></svg></button>
      </div>
      <div class="widget-canvas-wrap"></div>
      <div class="widget-controls">
        <div class="control-row">
          <label class="control-label">Constant C: <span class="val c-val">0</span></label>
          <input type="range" class="c-range" min="-3" max="3" step="1" value="0">
        </div>
      </div>
      <div class="readout-grid">
        <div class="readout-cell"><span class="lbl">Derivative f(x)</span><span class="num" style="color:var(--c-d)">2x</span></div>
        <div class="readout-cell"><span class="lbl">Initial condition</span><span class="num out-init">Click on plot</span></div>
        <div class="readout-cell"><span class="lbl">Unique Solution</span><span class="num out-unique">F(x) = x² + 0</span></div>
      </div>
      <figcaption class="widget-caption">All blue parabolas have the same slope f(x)=2x at any x. Click anywhere to nail down the constant C with an initial condition.</figcaption>
    `;

    const canvasWrap = container.querySelector(".widget-canvas-wrap");
    const cRange = container.querySelector(".c-range");
    const cVal = container.querySelector(".c-val");
    const outInit = container.querySelector(".out-init");
    const outUnique = container.querySelector(".out-unique");
    const resetBtn = container.querySelector(".widget-reset");

    let currentC = 0;
    let customPoint = null;

    const plot = new Plot(canvasWrap, { xmin: -4, xmax: 4, ymin: -5, ymax: 9 });

    function update() {
      cVal.textContent = currentC.toString();
      if (customPoint) {
        outInit.textContent = `(${customPoint.x.toFixed(2)}, ${customPoint.y.toFixed(2)})`;
        outUnique.textContent = `F(x) = x² ${customPoint.c >= 0 ? "+ " + customPoint.c.toFixed(2) : "− " + Math.abs(customPoint.c).toFixed(2)}`;
      } else {
        outUnique.textContent = `F(x) = x² ${currentC >= 0 ? "+ " + currentC : "− " + Math.abs(currentC)}`;
      }

      plot.setRender((p) => {
        const c = p.getColors();
        // Derivative line f(x) = 2x in green
        p.curve((x) => 2 * x, c.cd, 1.8);

        // Family F(x) = x^2 + k
        for (let k = -3; k <= 3; k++) {
          const isHighlighted = k === currentC && !customPoint;
          p.curve((x) => x * x + k, c.cf, isHighlighted ? 2.5 : 1);
        }

        // Custom curve if clicked
        if (customPoint) {
          p.curve((x) => x * x + customPoint.c, c.accent, 2.5);
          p.dot(customPoint.x, customPoint.y, 5, c.accent);
        }
      });
    }

    cRange.addEventListener("input", () => {
      currentC = parseInt(cRange.value, 10);
      customPoint = null;
      update();
    });

    canvasWrap.addEventListener("pointerdown", (e) => {
      const rect = canvasWrap.getBoundingClientRect();
      const world = plot.toWorld(e.clientX - rect.left, e.clientY - rect.top);
      const c = world.y - world.x * world.x;
      customPoint = { x: world.x, y: world.y, c };
      update();
    });

    resetBtn.addEventListener("click", () => {
      customPoint = null;
      plot.resetView();
      update();
    });

    update();
    return plot;
  },

  // 11. Riemann Sums & Definite Integrals
  riemann(container, props = {}) {
    const showAvg = props.showAverage || false;
    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · Riemann Sums</span>
        <button class="widget-reset" title="Reset view"><svg class="ico" style="width:14px;height:14px"><use href="#i-reset"/></svg></button>
      </div>
      <div class="widget-canvas-wrap"></div>
      <div class="widget-controls">
        <div class="control-row">
          <label class="control-label">Function</label>
          <select class="ctrl-select f-select">
            <option value="x2">f(x) = x²</option>
            <option value="x">f(x) = x</option>
            <option value="sin">f(x) = sin x</option>
            <option value="sqrt">f(x) = √x</option>
            <option value="exp">f(x) = eˣ</option>
          </select>
          <div class="seg-group rule-group">
            <button class="seg-btn" data-rule="left">Left</button>
            <button class="seg-btn" data-rule="right">Right</button>
            <button class="seg-btn active" data-rule="mid">Midpoint</button>
            <button class="seg-btn" data-rule="trap">Trapezoid</button>
          </div>
        </div>
        <div class="control-row">
          <label class="control-label">[a, b]</label>
          <input type="number" class="ctrl-input a-input" style="width:70px" value="${props.range ? props.range[0] : 0}" step="0.5">
          <input type="number" class="ctrl-input b-input" style="width:70px" value="${props.range ? props.range[1] : 2}" step="0.5">
          <label class="control-label" style="margin-left:auto">n: <span class="val n-val">4</span></label>
          <input type="range" class="n-range" min="1" max="200" step="1" value="${props.n || 4}" style="width:160px">
        </div>
      </div>
      <div class="readout-grid">
        <div class="readout-cell"><span class="lbl">Riemann Sum</span><span class="num out-sum">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">Exact Integral</span><span class="num out-exact">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">Error</span><span class="num out-err">0.0000</span></div>
      </div>
      <figcaption class="widget-caption">${showAvg ? "Dashed horizontal line marks the average value f_avg on [a, b]." : "Shaded strips show the approximating rectangles or trapezoids."}</figcaption>
    `;

    const canvasWrap = container.querySelector(".widget-canvas-wrap");
    const fSelect = container.querySelector(".f-select");
    const ruleBtns = container.querySelectorAll(".rule-group .seg-btn");
    const aInput = container.querySelector(".a-input");
    const bInput = container.querySelector(".b-input");
    const nRange = container.querySelector(".n-range");
    const nVal = container.querySelector(".n-val");
    const outSum = container.querySelector(".out-sum");
    const outExact = container.querySelector(".out-exact");
    const outErr = container.querySelector(".out-err");
    const resetBtn = container.querySelector(".widget-reset");

    const funcs = {
      x2: (x) => x * x,
      x: (x) => x,
      sin: (x) => Math.sin(x),
      sqrt: (x) => (x >= 0 ? Math.sqrt(x) : NaN),
      exp: (x) => Math.exp(x),
    };

    let fKey = props.preset || "x2";
    fSelect.value = fKey;
    let rule = props.rule || "mid";
    let a = props.range ? props.range[0] : 0;
    let b = props.range ? props.range[1] : 2;
    let n = props.n || 4;

    const plot = new Plot(canvasWrap, { xmin: -1, xmax: 4, ymin: -1, ymax: 6 });

    function update() {
      const f = funcs[fKey];
      const dx = (b - a) / n;
      let sum = 0;

      for (let i = 0; i < n; i++) {
        const xL = a + i * dx;
        const xR = xL + dx;
        if (rule === "left") sum += f(xL) * dx;
        else if (rule === "right") sum += f(xR) * dx;
        else if (rule === "mid") sum += f((xL + xR) / 2) * dx;
        else if (rule === "trap") sum += ((f(xL) + f(xR)) / 2) * dx;
      }

      const exact = simpson(f, a, b, 4000);
      const err = Math.abs(sum - exact);

      nVal.textContent = n.toString();
      outSum.textContent = sum.toFixed(4);
      outExact.textContent = exact.toFixed(4);
      outErr.textContent = err.toFixed(4);

      plot.setRender((p) => {
        const c = p.getColors();
        const ctx = p.ctx;

        // Draw strips
        for (let i = 0; i < n; i++) {
          const xL = a + i * dx;
          const xR = xL + dx;
          let yVal = 0;
          if (rule === "left") yVal = f(xL);
          else if (rule === "right") yVal = f(xR);
          else if (rule === "mid") yVal = f((xL + xR) / 2);

          if (rule === "trap") {
            const y1 = f(xL),
              y2 = f(xR);
            const p1 = p.toScreen(xL, 0);
            const p2 = p.toScreen(xL, y1);
            const p3 = p.toScreen(xR, y2);
            const p4 = p.toScreen(xR, 0);

            ctx.save();
            ctx.fillStyle = c.cArea;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.closePath();
            ctx.fill();
            if (n <= 60) {
              ctx.strokeStyle = c.cf;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
            ctx.restore();
          } else {
            p.rect(xL, 0, dx, yVal, c.cArea, n <= 60 ? c.cf : null);
          }
        }

        // Curve f(x)
        p.curve(f, c.cf, 2);

        // Optional Average value line
        if (showAvg && b !== a) {
          const avg = exact / (b - a);
          p.segment(a, avg, b, avg, c.accent, 2, [5, 4]);
          p.label(`f_avg = ${avg.toFixed(3)}`, b + 0.1, avg, {
            color: c.accent,
            bg: c.panel,
          });
        }
      });
    }

    fSelect.addEventListener("change", () => {
      fKey = fSelect.value;
      update();
    });
    ruleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        ruleBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        rule = btn.dataset.rule;
        update();
      });
    });
    aInput.addEventListener("change", () => {
      a = parseFloat(aInput.value);
      update();
    });
    bInput.addEventListener("change", () => {
      b = parseFloat(bInput.value);
      update();
    });
    nRange.addEventListener("input", () => {
      n = parseInt(nRange.value, 10);
      update();
    });
    resetBtn.addEventListener("click", () => plot.resetView());

    update();
    return plot;
  },

  // 12. FTC (Fundamental Theorem of Calculus)
  ftc(container) {
    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · Fundamental Theorem of Calculus</span>
        <button class="widget-reset" title="Reset view"><svg class="ico" style="width:14px;height:14px"><use href="#i-reset"/></svg></button>
      </div>
      <div class="widget-canvas-wrap"></div>
      <div class="widget-controls">
        <div class="control-row">
          <label class="control-label">Rate f(t)</label>
          <select class="ctrl-select f-select">
            <option value="t2">f(t) = t²</option>
            <option value="cost">f(t) = cos t</option>
            <option value="expt">f(t) = eᵗ</option>
          </select>
          <button class="play-btn"><svg class="ico" style="width:12px;height:12px"><use href="#i-play"/></svg> Sweep x</button>
        </div>
        <div class="control-row">
          <label class="control-label">Upper limit x: <span class="val x-val">1.50</span></label>
          <input type="range" class="x-range" min="0" max="3" step="0.05" value="1.5">
        </div>
      </div>
      <div class="readout-grid">
        <div class="readout-cell"><span class="lbl">Area A(x) = ∫₀ˣ f</span><span class="num out-a">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">Curve height f(x)</span><span class="num out-fx">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">Slope of A at x</span><span class="num out-slope">0.0000</span></div>
      </div>
      <figcaption class="widget-caption">Top: area accumulating under f(t); Bottom: accumulation A(x). The slope of A(x) exactly equals f(x)!</figcaption>
    `;

    const canvasWrap = container.querySelector(".widget-canvas-wrap");
    const fSelect = container.querySelector(".f-select");
    const xRange = container.querySelector(".x-range");
    const xVal = container.querySelector(".x-val");
    const outA = container.querySelector(".out-a");
    const outFx = container.querySelector(".out-fx");
    const outSlope = container.querySelector(".out-slope");
    const playBtn = container.querySelector(".play-btn");
    const resetBtn = container.querySelector(".widget-reset");

    const funcs = {
      t2: { f: (t) => t * t, F: (x) => Math.pow(x, 3) / 3 },
      cost: { f: (t) => Math.cos(t), F: (x) => Math.sin(x) },
      expt: { f: (t) => Math.exp(t), F: (x) => Math.exp(x) - 1 },
    };

    let fKey = "t2";
    let x = 1.5;

    const plot = new Plot(canvasWrap, {
      xmin: -0.5,
      xmax: 3.5,
      ymin: -2,
      ymax: 8,
    });

    function update() {
      const { f, F } = funcs[fKey];
      const area = F(x);
      const fx = f(x);
      const slopeA = numDeriv(F, x);

      xVal.textContent = x.toFixed(2);
      outA.textContent = area.toFixed(4);
      outFx.textContent = fx.toFixed(4);
      outSlope.textContent = slopeA.toFixed(4);

      plot.setRender((p) => {
        const c = p.getColors();
        const ctx = p.ctx;

        // Top: Shaded region under f(t) from 0 to x
        p.fillBetween(f, null, 0, x, c.cArea);
        p.curve(f, c.cf, 2);

        // Lower plot divider
        const divY = p.height * 0.55;
        ctx.save();
        ctx.strokeStyle = c.line;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, divY);
        ctx.lineTo(p.width, divY);
        ctx.stroke();
        ctx.restore();

        // Bottom: Accumulation function A(x) in amber
        p.curve(F, c.cdd, 2);
        p.dot(x, area, 5, c.cdd);

        // Tangent on A(x) showing slope = f(x)
        p.segment(
          x - 0.6,
          area - 0.6 * fx,
          x + 0.6,
          area + 0.6 * fx,
          c.accent,
          2,
        );
        p.label(`Slope = ${fx.toFixed(2)}`, x + 0.1, area - 0.5, {
          color: c.accent,
          bg: c.panel,
        });
      });
    }

    fSelect.addEventListener("change", () => {
      fKey = fSelect.value;
      update();
    });
    xRange.addEventListener("input", () => {
      x = parseFloat(xRange.value);
      update();
    });
    resetBtn.addEventListener("click", () => plot.resetView());

    let animId = null;
    playBtn.addEventListener("click", () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
        return;
      }
      let forward = true;
      function step() {
        x += forward ? 0.02 : -0.02;
        if (x >= 3.0) forward = false;
        if (x <= 0.1) {
          forward = true;
          animId = null;
        }
        xRange.value = x;
        update();
        if (animId) animId = requestAnimationFrame(step);
      }
      animId = requestAnimationFrame(step);
    });

    update();
    return plot;
  },

  // 13. Area Between Curves
  area(container) {
    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · Area Between Two Curves</span>
        <button class="widget-reset" title="Reset view"><svg class="ico" style="width:14px;height:14px"><use href="#i-reset"/></svg></button>
      </div>
      <div class="widget-canvas-wrap"></div>
      <div class="widget-controls">
        <div class="control-row">
          <label class="control-label">Curves</label>
          <select class="ctrl-select pair-select">
            <option value="p1">y = x and y = x²</option>
            <option value="p2">y = x² and y = 4</option>
            <option value="p3">y = x² and y = 2x</option>
            <option value="p4">y = √x and y = x</option>
          </select>
        </div>
      </div>
      <div class="readout-grid">
        <div class="readout-cell"><span class="lbl">Intersections</span><span class="num out-pts">[0, 1]</span></div>
        <div class="readout-cell"><span class="lbl">Numerical Area</span><span class="num out-num">0.1667</span></div>
        <div class="readout-cell"><span class="lbl">Exact Area</span><span class="num out-exact">1/6</span></div>
      </div>
      <figcaption class="widget-caption">The region where f(x) ≥ g(x) is integrated from the left intersection to the right intersection.</figcaption>
    `;

    const canvasWrap = container.querySelector(".widget-canvas-wrap");
    const pairSelect = container.querySelector(".pair-select");
    const outPts = container.querySelector(".out-pts");
    const outNum = container.querySelector(".out-num");
    const outExact = container.querySelector(".out-exact");
    const resetBtn = container.querySelector(".widget-reset");

    const pairs = {
      p1: {
        f: (x) => x,
        g: (x) => x * x,
        a: 0,
        b: 1,
        exact: "1/6",
        bounds: { xmin: -0.5, xmax: 1.5, ymin: -0.5, ymax: 1.5 },
      },
      p2: {
        f: (x) => 4,
        g: (x) => x * x,
        a: -2,
        b: 2,
        exact: "32/3",
        bounds: { xmin: -3, xmax: 3, ymin: -1, ymax: 5 },
      },
      p3: {
        f: (x) => 2 * x,
        g: (x) => x * x,
        a: 0,
        b: 2,
        exact: "4/3",
        bounds: { xmin: -0.5, xmax: 2.5, ymin: -0.5, ymax: 5 },
      },
      p4: {
        f: (x) => Math.sqrt(Math.max(0, x)),
        g: (x) => x,
        a: 0,
        b: 1,
        exact: "1/6",
        bounds: { xmin: -0.5, xmax: 1.5, ymin: -0.5, ymax: 1.5 },
      },
    };

    let pKey = "p1";
    let plot = new Plot(canvasWrap, pairs[pKey].bounds);

    function update() {
      const data = pairs[pKey];
      const area = simpson(
        (x) => Math.abs(data.f(x) - data.g(x)),
        data.a,
        data.b,
        2000,
      );

      outPts.textContent = `[${data.a}, ${data.b}]`;
      outNum.textContent = area.toFixed(4);
      outExact.textContent = data.exact;

      plot.setRender((p) => {
        const c = p.getColors();
        // Shade between
        p.fillBetween(data.f, data.g, data.a, data.b, c.cArea);

        // Curves
        p.curve(data.f, c.cf, 2);
        p.curve(data.g, c.cd, 2);

        // Intersection dots
        p.dot(data.a, data.f(data.a), 5, c.accent);
        p.dot(data.b, data.f(data.b), 5, c.accent);
      });
    }

    pairSelect.addEventListener("change", () => {
      pKey = pairSelect.value;
      plot.bounds = { ...pairs[pKey].bounds };
      plot.initialBounds = { ...pairs[pKey].bounds };
      update();
    });

    resetBtn.addEventListener("click", () => plot.resetView());

    update();
    return plot;
  },

  // 14. Volumes of Revolution
  revolve(container) {
    container.innerHTML = `
      <div class="widget-head">
        <span class="widget-title-tag">Interactive · Solid of Revolution (Disc Method)</span>
        <button class="widget-reset" title="Reset view"><svg class="ico" style="width:14px;height:14px"><use href="#i-reset"/></svg></button>
      </div>
      <div class="widget-canvas-wrap"></div>
      <div class="widget-controls">
        <div class="control-row">
          <label class="control-label">Curve</label>
          <select class="ctrl-select f-select">
            <option value="x">y = x on [0, 1]</option>
            <option value="sqrt">y = √x on [0, 4]</option>
            <option value="x2">y = x² on [0, 1]</option>
            <option value="sin">y = sin x on [0, π]</option>
          </select>
          <label class="control-label" style="margin-left:auto">Discs: <span class="val n-val">12</span></label>
          <input type="range" class="n-range" min="1" max="60" step="1" value="12" style="width:140px">
        </div>
      </div>
      <div class="readout-grid">
        <div class="readout-cell"><span class="lbl">Disc Sum π Σ f² Δx</span><span class="num out-sum">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">Exact π ∫ f² dx</span><span class="num out-exact">0.0000</span></div>
        <div class="readout-cell"><span class="lbl">Error</span><span class="num out-err">0.0000</span></div>
      </div>
      <figcaption class="widget-caption">Top: 2D function sliced into discs; Bottom: pseudo-3D stack of cylindrical discs revolving about the x-axis.</figcaption>
    `;

    const canvasWrap = container.querySelector(".widget-canvas-wrap");
    const fSelect = container.querySelector(".f-select");
    const nRange = container.querySelector(".n-range");
    const nVal = container.querySelector(".n-val");
    const outSum = container.querySelector(".out-sum");
    const outExact = container.querySelector(".out-exact");
    const outErr = container.querySelector(".out-err");
    const resetBtn = container.querySelector(".widget-reset");

    const funcs = {
      x: {
        f: (x) => x,
        a: 0,
        b: 1,
        exact: Math.PI / 3,
        bounds: { xmin: -0.2, xmax: 1.2, ymin: -1.2, ymax: 1.2 },
      },
      sqrt: {
        f: (x) => Math.sqrt(Math.max(0, x)),
        a: 0,
        b: 4,
        exact: 8 * Math.PI,
        bounds: { xmin: -0.5, xmax: 4.5, ymin: -2.5, ymax: 2.5 },
      },
      x2: {
        f: (x) => x * x,
        a: 0,
        b: 1,
        exact: Math.PI / 5,
        bounds: { xmin: -0.2, xmax: 1.2, ymin: -1.2, ymax: 1.2 },
      },
      sin: {
        f: (x) => Math.sin(x),
        a: 0,
        b: Math.PI,
        exact: (Math.PI * Math.PI) / 2,
        bounds: { xmin: -0.5, xmax: 3.5, ymin: -1.2, ymax: 1.2 },
      },
    };

    let fKey = "x";
    let n = 12;

    let plot = new Plot(canvasWrap, funcs[fKey].bounds);

    function update() {
      const data = funcs[fKey];
      const dx = (data.b - data.a) / n;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const mid = data.a + (i + 0.5) * dx;
        const r = data.f(mid);
        sum += Math.PI * r * r * dx;
      }
      const err = Math.abs(sum - data.exact);

      nVal.textContent = n.toString();
      outSum.textContent = sum.toFixed(4);
      outExact.textContent = data.exact.toFixed(4);
      outErr.textContent = err.toFixed(4);

      plot.setRender((p) => {
        const c = p.getColors();
        const ctx = p.ctx;

        // Top 2D curve
        p.curve(data.f, c.cf, 2);

        // Center line (axis of revolution)
        p.segment(p.bounds.xmin, 0, p.bounds.xmax, 0, c.ink, 1.5, [2, 2]);

        // Draw 3D discs as stacked ellipses
        for (let i = 0; i < n; i++) {
          const xL = data.a + i * dx;
          const xMid = xL + 0.5 * dx;
          const r = data.f(xMid);
          if (r <= 0) continue;

          const pt = p.toScreen(xMid, 0);
          const topPt = p.toScreen(xMid, r);
          const rx = Math.abs(p.toScreen(xMid + dx / 2, 0).x - pt.x);
          const ry = Math.abs(topPt.y - pt.y);

          ctx.save();
          // Disc cylinder face
          ctx.fillStyle = c.cArea;
          ctx.strokeStyle = c.cf;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(pt.x, pt.y, Math.max(2, rx), ry, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      });
    }

    fSelect.addEventListener("change", () => {
      fKey = fSelect.value;
      plot.bounds = { ...funcs[fKey].bounds };
      plot.initialBounds = { ...funcs[fKey].bounds };
      update();
    });
    nRange.addEventListener("input", () => {
      n = parseInt(nRange.value, 10);
      update();
    });
    resetBtn.addEventListener("click", () => plot.resetView());

    update();
    return plot;
  },

  // 15. Home Hero Plot
  hero(container) {
    const plot = new Plot(container, { xmin: -7, xmax: 7, ymin: -2, ymax: 2 });
    let animId = null;
    let t = 0;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function renderFrame() {
      const x = reducedMotion ? 1.0 : 6 * Math.sin(t * 0.35);
      const y = Math.sin(x);
      const slope = Math.cos(x);

      // Update readout
      const readout = container.querySelector(".hero-readout");
      if (readout) {
        readout.textContent = `f′(x) = cos x = ${slope.toFixed(2)}`;
      }

      plot.setRender((p) => {
        const c = p.getColors();
        p.curve(Math.sin, c.cf, 2);

        // Tangent +- 1.6 units
        const tLen = 1.6;
        const dx = tLen / Math.sqrt(1 + slope * slope);
        const dy = slope * dx;
        p.segment(x - dx, y - dy, x + dx, y + dy, c.accent, 2);

        // Traveling dot
        p.dot(x, y, 5, c.accent);
      });

      if (!reducedMotion) {
        t += 0.02;
        animId = requestAnimationFrame(renderFrame);
      }
    }

    renderFrame();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId);
      } else if (!reducedMotion) {
        animId = requestAnimationFrame(renderFrame);
      }
    });

    return plot;
  },
};
