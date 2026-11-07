import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/stix-two-text/latin-400.css";
import "@fontsource/stix-two-text/latin-600.css";
import "@fontsource/stix-two-text/latin-400-italic.css";

import "katex/dist/katex.min.css";
import katex from "katex";
import renderMathInElement from "katex/contrib/auto-render";
import { create, evaluateDependencies, derivativeDependencies } from "mathjs";
const math = create({ evaluateDependencies, derivativeDependencies });

// only needed if the rest of your code uses the old CDN globals
window.katex = katex;
window.renderMathInElement = renderMathInElement;
window.math = math;

import { CHAPTERS_DIFF } from "./chapters-diff.js";
import { CHAPTERS_INT } from "./chapters-int.js";
import { WIDGET_REGISTRY } from "./widgets.js";

export const CHAPTERS = [...CHAPTERS_DIFF, ...CHAPTERS_INT];

// Storage Helper
const STORAGE_KEY = "mathesis:v1";
let state = {
  theme: "paper",
  done: {},
  last: "diff/derivative",
  open: { diff: true },
};

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    state = Object.assign(state, parsed);
  } else {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      state.theme = "board";
    }
  }
} catch (_) {}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

// Flat list of ready lessons for linear prev/next
export function getFlatLessons() {
  const list = [];
  for (const chap of CHAPTERS) {
    if (chap.status === "soon") continue;
    for (const les of chap.lessons) {
      list.push({ chapter: chap, lesson: les, path: `${chap.id}/${les.id}` });
    }
  }
  return list;
}

// Total progress calculations
export function getProgress() {
  const ready = getFlatLessons();
  if (ready.length === 0) return { pct: 0, completed: 0, total: 0 };
  let doneCount = 0;
  for (const item of ready) {
    if (state.done[item.path]) doneCount++;
  }
  const pct = Math.round((doneCount / ready.length) * 100);
  return { pct, completed: doneCount, total: ready.length };
}

export function getChapterProgress(chap) {
  if (chap.status === "soon") return { pct: 0, done: 0, total: 0 };
  let done = 0;
  for (const l of chap.lessons) {
    if (state.done[`${chap.id}/${l.id}`]) done++;
  }
  const pct =
    chap.lessons.length > 0
      ? Math.round((done / chap.lessons.length) * 100)
      : 0;
  return { pct, done, total: chap.lessons.length };
}

// Progress Ring Renderer
function renderProgressRing(size, pct, content = "") {
  const r = size / 2 - 2.5;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const isDone = pct >= 100;

  return `
    <div class="ring ${isDone ? "done" : ""}" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="2"/>
        <circle class="val" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="2"
          stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
      </svg>
      <div class="ring-txt" style="font-size:${size <= 24 ? "10px" : "9px"}">${content}</div>
    </div>
  `;
}

// Toast
let toastTimer = null;
export function showToast(msg) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1400);
}

// Theme handling
export function applyTheme(theme) {
  state.theme = theme;
  saveState();
  const html = document.documentElement;
  const themeBtn = document.querySelector("#theme");
  const themeIco = document.querySelector("#theme-ico use");

  if (theme === "board") {
    html.setAttribute("data-theme", "board");
    if (themeBtn) themeBtn.setAttribute("aria-label", "Switch to paper");
    if (themeIco) themeIco.setAttribute("href", "#i-sun");
  } else {
    html.removeAttribute("data-theme");
    if (themeBtn) themeBtn.setAttribute("aria-label", "Switch to blackboard");
    if (themeIco) themeIco.setAttribute("href", "#i-moon");
  }

  // Trigger redraw on all active plots
  window.dispatchEvent(new Event("themechange"));
}

// Sidebar rendering
export function updateSidebar(activeChapId = null, activeLessonId = null) {
  const side = document.querySelector("aside.side");
  if (!side) return;

  const overall = getProgress();
  const overallRing = document.querySelector("#overall");
  if (overallRing) {
    overallRing.innerHTML = renderProgressRing(
      30,
      overall.pct,
      `${overall.pct}%`,
    );
  }

  let html = "";
  for (const chap of CHAPTERS) {
    const isSoon = chap.status === "soon";
    const isOpen = state.open[chap.id] || activeChapId === chap.id;
    const cp = getChapterProgress(chap);

    html += `
      <section class="chap ${isSoon ? "soon" : ""} ${isOpen ? "open" : ""}" data-chap="${chap.id}">
        <button class="chead" data-chap="${chap.id}" aria-expanded="${isOpen}">
          ${renderProgressRing(22, cp.pct, chap.no)}
          <div class="meta">
            <div class="title">
              <span>${chap.title}</span>
              ${isSoon ? '<svg class="ico" style="width:13px;height:13px;display:inline"><use href="#i-lock"/></svg>' : ""}
            </div>
            <small>${isSoon ? "Coming soon" : `${chap.lessons.length} lessons · ${chap.lessons.reduce((a, b) => a + (b.minutes || 0), 0)} min`}</small>
          </div>
          ${!isSoon ? '<svg class="ico chev"><use href="#i-chev"/></svg>' : ""}
        </button>
        <div class="chap-lessons">
          <div class="chap-lessons-inner">
            ${
              isSoon
                ? ""
                : chap.lessons
                    .map((l) => {
                      const path = `${chap.id}/${l.id}`;
                      const isCurrent =
                        activeChapId === chap.id && activeLessonId === l.id;
                      const isDone = !!state.done[path];
                      const lessonNo = `${chap.no}.${l.no || chap.lessons.indexOf(l) + 1}`;
                      return `
                <a href="#/${path}" class="lesson-link" ${isCurrent ? 'aria-current="page"' : ""}>
                  <span class="num">${lessonNo}</span>
                  <span class="name">${l.title}</span>
                  ${isDone ? '<svg class="ico chk"><use href="#i-check"/></svg>' : ""}
                </a>
              `;
                    })
                    .join("")
            }
          </div>
        </div>
      </section>
    `;
  }

  side.innerHTML = html;

  // Add accordion click listeners
  side.querySelectorAll(".chead").forEach((btn) => {
    btn.addEventListener("click", () => {
      const chapId = btn.dataset.chap;
      const chap = CHAPTERS.find((c) => c.id === chapId);
      if (chap.status === "soon") {
        location.hash = `#/${chapId}`;
        return;
      }
      const sec = btn.closest(".chap");
      const willOpen = !sec.classList.contains("open");
      sec.classList.toggle("open", willOpen);
      btn.setAttribute("aria-expanded", willOpen);
      state.open[chapId] = willOpen;
      saveState();
    });
  });
}

// Math typesetting helper
function renderMath(target) {
  if (window.renderMathInElement) {
    try {
      window.renderMathInElement(target, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    } catch (_) {}
  }
}

// Active Widgets Tracker
let activePlots = [];
function destroyActivePlots() {
  for (const p of activePlots) {
    if (p && p.destroy) p.destroy();
  }
  activePlots = [];
}

// TOC Scroll Spy
let tocObserver = null;
function setupTocScrollSpy() {
  if (tocObserver) tocObserver.disconnect();
  const headings = document.querySelectorAll("main#view h2");
  const tocLinks = document.querySelectorAll(".toc-link");
  if (headings.length === 0 || tocLinks.length === 0) return;

  tocObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${id}`,
            );
          });
        }
      }
    },
    {
      rootMargin: "-30% 0px -60% 0px",
    },
  );

  headings.forEach((h) => tocObserver.observe(h));
}

// Route Renderers
export function renderHome() {
  const view = document.querySelector("main#view");
  destroyActivePlots();
  document.title = "Mathesis — Interactive Calculus Atlas";

  // Crumbs
  const crumbs = document.querySelector(".crumbs");
  if (crumbs) crumbs.innerHTML = "";

  // TOC
  const tocNav = document.querySelector(".toc-nav");
  if (tocNav) tocNav.innerHTML = "";

  const lastLesson = state.last
    ? getFlatLessons().find((l) => l.path === state.last)
    : null;

  let html = `
    <div class="hero">
      <div class="hero-left">
        <div class="eyebrow">Interactive course · Calculus</div>
        <h1 class="hero-h1">Calculus, one idea at a time.</h1>
        <p class="hero-lede">Start with how fast things change. Build up to how much accumulates. Every lesson has graphs you can push around.</p>
        <div class="hero-btns">
          <a href="#/diff/derivative" class="btn-primary">
            Start with Differentiation
            <svg class="ico" style="width:16px;height:16px"><use href="#i-arrow"/></svg>
          </a>
          <a href="#/formulas" class="btn-secondary">Formula sheet</a>
          ${lastLesson ? `<a href="#/${lastLesson.path}" class="continue-link">Continue: ${lastLesson.lesson.title}</a>` : ""}
        </div>
      </div>
      <div class="hero-right">
        <div class="heroplot">
          <div class="corner-bracket tl"></div>
          <div class="corner-bracket tr"></div>
          <div class="corner-bracket bl"></div>
          <div class="corner-bracket br"></div>
          <div class="hero-readout">f′(x) = cos x = 0.87</div>
        </div>
      </div>
    </div>

    <div class="chapter-grid">
      ${CHAPTERS.map((ch) => {
        const isSoon = ch.status === "soon";
        const cp = getChapterProgress(ch);
        return `
          <a href="#/${ch.id}" class="chap-card ${isSoon ? "soon" : ""}">
            <div class="chap-card-eyebrow">CHAPTER ${ch.no}</div>
            <div class="chap-card-title">${ch.title}</div>
            <div class="chap-card-blurb">${ch.blurb}</div>
            <div class="chap-card-foot">
              <span class="lessons-cnt">${isSoon ? "Coming soon" : `${ch.lessons.length} lessons`}</span>
              ${isSoon ? '<svg class="ico" style="width:14px;height:14px"><use href="#i-lock"/></svg>' : renderProgressRing(30, cp.pct, `${cp.pct}%`)}
            </div>
          </a>
        `;
      }).join("")}
    </div>
  `;

  view.innerHTML = html;

  // Render hero plot
  const heroWrap = view.querySelector(".heroplot");
  if (heroWrap && WIDGET_REGISTRY.hero) {
    const heroPlot = WIDGET_REGISTRY.hero(heroWrap);
    activePlots.push(heroPlot);
  }
}

export function renderFormulas(activeFilter = "all") {
  const view = document.querySelector("main#view");
  destroyActivePlots();
  document.title = "Formula sheet — Mathesis";

  const crumbs = document.querySelector(".crumbs");
  if (crumbs) crumbs.innerHTML = "<span>Formulas</span>";
  const tocNav = document.querySelector(".toc-nav");
  if (tocNav) tocNav.innerHTML = "";

  // Extract all formula items
  const readyChaps = CHAPTERS.filter((c) => c.status !== "soon");
  const formulas = [];

  for (const chap of readyChaps) {
    for (const les of chap.lessons) {
      for (const b of les.blocks) {
        if (
          (b.type === "callout" &&
            (b.k === "definition" || b.k === "theorem")) ||
          (b.type === "eq" && b.sheet)
        ) {
          formulas.push({
            chapId: chap.id,
            chapTitle: chap.title,
            lesTitle: les.title,
            name: b.name || b.title || "Formula",
            math: b.x,
          });
        }
      }
    }
  }

  const filtered =
    activeFilter === "all"
      ? formulas
      : formulas.filter((f) => f.chapId === activeFilter);

  view.innerHTML = `
    <div class="formula-header">
      <div class="eyebrow">Course Reference</div>
      <h1>Formula sheet</h1>
      <p>Every definition and theorem in the course, collected.</p>
      <div class="filter-chips">
        <button class="f-chip ${activeFilter === "all" ? "active" : ""}" data-f="all">All</button>
        ${readyChaps
          .map(
            (c) => `
          <button class="f-chip ${activeFilter === c.id ? "active" : ""}" data-f="${c.id}">${c.title}</button>
        `,
          )
          .join("")}
      </div>
    </div>
    <div class="formula-grid">
      ${filtered
        .map(
          (f) => `
        <div class="formula-card">
          <div>
            <div class="formula-eyebrow">${f.chapTitle} · ${f.lesTitle}</div>
            <div class="formula-name">${f.name}</div>
            <div class="formula-math">$$${f.math}$$</div>
          </div>
          <div class="formula-foot">
            <button class="copy-latex-btn" title="Copy LaTeX" data-latex="${encodeURIComponent(f.math)}">
              <svg class="ico" style="width:14px;height:14px"><use href="#i-copy"/></svg>
            </button>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;

  renderMath(view);

  // Filter clicks
  view.querySelectorAll(".f-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      renderFormulas(btn.dataset.f);
    });
  });

  // Copy LaTeX clicks
  view.querySelectorAll(".copy-latex-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const raw = decodeURIComponent(btn.dataset.latex);
      try {
        await navigator.clipboard.writeText(raw);
        showToast("Copied LaTeX");
      } catch (_) {
        showToast("Could not copy to clipboard");
      }
    });
  });
}

export function renderChapterOverview(chapId) {
  const chap = CHAPTERS.find((c) => c.id === chapId);
  if (!chap) {
    render404();
    return;
  }

  const view = document.querySelector("main#view");
  destroyActivePlots();
  document.title = `${chap.title} — Mathesis`;

  const crumbs = document.querySelector(".crumbs");
  if (crumbs)
    crumbs.innerHTML = `<span>Chapter ${chap.no}</span> <span class="sep">/</span> <span>${chap.title}</span>`;
  const tocNav = document.querySelector(".toc-nav");
  if (tocNav) tocNav.innerHTML = "";

  const isSoon = chap.status === "soon";
  const cp = getChapterProgress(chap);

  let html = `
    <div class="article-wrap">
      <div class="eyebrow">CHAPTER ${chap.no}</div>
      <h1 class="lesson-title">${chap.title}</h1>
      <p style="font-family:var(--serif);font-size:18px;color:var(--muted);margin-top:12px">${chap.blurb}</p>

      ${
        isSoon
          ? `
        <div class="callout k-warning" style="margin-top:32px">
          <div class="callout-label">Coming Soon</div>
          <div class="callout-title">Under Construction</div>
          <div class="callout-body">This advanced chapter is currently in development. Interactive figures, derivations, and practice problem sets will be published in the next release.</div>
        </div>
      `
          : `
        <div style="margin-top:36px;display:flex;flex-direction:column;gap:12px">
          ${chap.lessons
            .map((l, idx) => {
              const path = `${chap.id}/${l.id}`;
              const isDone = !!state.done[path];
              return `
              <a href="#/${path}" class="chap-card" style="flex-direction:row;align-items:center;justify-content:space-between;padding:14px 18px">
                <div style="display:flex;align-items:center;gap:16px">
                  <span style="font-family:var(--mono);font-size:12px;color:var(--muted);width:32px">${chap.no}.${idx + 1}</span>
                  <div>
                    <div style="font-family:var(--serif);font-weight:600;font-size:17.5px;color:var(--ink)">${l.title}</div>
                    <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:3px">${l.minutes} min · ${l.level}</div>
                  </div>
                </div>
                ${isDone ? '<svg class="ico" style="color:var(--c-d);width:18px;height:18px"><use href="#i-check"/></svg>' : '<svg class="ico" style="color:var(--muted);width:16px;height:16px"><use href="#i-arrow"/></svg>'}
              </a>
            `;
            })
            .join("")}
        </div>
      `
      }
    </div>
  `;

  view.innerHTML = html;
}

export function renderLesson(chapId, lessonId) {
  const chap = CHAPTERS.find((c) => c.id === chapId);
  if (!chap) {
    render404();
    return;
  }
  const lesson = chap.lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    render404();
    return;
  }

  const view = document.querySelector("main#view");
  destroyActivePlots();
  document.title = `${lesson.title} — Mathesis`;

  state.last = `${chapId}/${lessonId}`;
  state.open[chapId] = true;
  saveState();

  // Topbar Crumbs
  const crumbs = document.querySelector(".crumbs");
  if (crumbs) {
    crumbs.innerHTML = `
      <a href="#/${chap.id}">${chap.title}</a>
      <span class="sep">/</span>
      <span>${lesson.title}</span>
    `;
  }

  // Linear navigation
  const flat = getFlatLessons();
  const currIdx = flat.findIndex(
    (item) => item.path === `${chapId}/${lessonId}`,
  );
  const prevLesson = currIdx > 0 ? flat[currIdx - 1] : null;
  const nextLesson =
    currIdx >= 0 && currIdx < flat.length - 1 ? flat[currIdx + 1] : null;
  const isDone = !!state.done[`${chapId}/${lessonId}`];

  // Build lesson content blocks
  let blocksHtml = "";
  let headingCount = 0;
  const tocItems = [];

  for (let i = 0; i < lesson.blocks.length; i++) {
    const b = lesson.blocks[i];
    const animClass = i < 12 ? `rise" style="--i:${i}` : "";

    if (b.type === "h2") {
      headingCount++;
      const anchorId = `sec-${headingCount}`;
      tocItems.push({ id: anchorId, title: b.x });
      blocksHtml += `<h2 id="${anchorId}" class="${animClass}">${b.x}</h2>`;
    } else if (b.type === "p") {
      blocksHtml += `<p class="${animClass}">${b.x}</p>`;
    } else if (b.type === "callout") {
      blocksHtml += `
        <div class="callout k-${b.k} ${animClass}">
          <div class="callout-label">${b.k === "warning" ? "Watch out" : b.k}</div>
          <div class="callout-title">${b.title}</div>
          <div class="callout-body">${b.x}</div>
        </div>
      `;
    } else if (b.type === "eq") {
      blocksHtml += `<div class="katex-display ${animClass}">$$${b.x}$$</div>`;
    } else if (b.type === "widget") {
      blocksHtml += `<figure class="widget ${animClass}" data-widget="${b.id}" id="widget-mount-${i}"></figure>`;
    } else if (b.type === "details") {
      blocksHtml += `
        <details class="derivation ${animClass}">
          <summary>
            <svg class="ico chev"><use href="#i-chev"/></svg>
            <span>${b.title}</span>
          </summary>
          <div class="derivation-content">${b.x}</div>
        </details>
      `;
    } else if (b.type === "example") {
      blocksHtml += `
        <div class="example-card ${animClass}">
          <div class="example-header">
            <span class="example-no">Example</span>
            <div class="example-title">${b.title}</div>
          </div>
          <div class="example-steps">
            ${b.steps
              .map(
                (st, idx) => `
              <div class="step-row">
                <div class="step-num">${idx + 1}</div>
                <div class="step-text">${st}</div>
              </div>
            `,
              )
              .join("")}
          </div>
          <div class="answer-box">
            <span class="ans-lbl">ANSWER</span>
            <div class="ans-val">$$${b.answer}$$</div>
          </div>
        </div>
      `;
    } else if (b.type === "mistakes") {
      blocksHtml += `
        <div class="mistakes-card ${animClass}">
          <div class="mistakes-title">Watch Out for Common Pitfalls</div>
          ${b.items
            .map(
              (it) => `
            <div class="mistake-item">
              <span class="mistake-x">✕</span>
              <span>${it}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      `;
    } else if (b.type === "practice") {
      blocksHtml += `
        <div class="practice-list ${animClass}">
          ${b.items
            .map(
              (pr, pIdx) => `
            <div class="practice-item">
              <div class="practice-q"><strong>${pIdx + 1}.</strong> ${pr.q}</div>
              <button class="practice-sol-btn">
                <svg class="ico chev"><use href="#i-chev"/></svg>
                <span class="btn-txt">Show solution</span>
              </button>
              <div class="practice-sol-drawer">
                <div class="practice-sol-inner">
                  ${pr.steps.map((s) => `<p style="margin:4px 0">${s}</p>`).join("")}
                  <div class="answer-box" style="margin-top:10px">
                    <span class="ans-lbl">ANSWER</span>
                    <div class="ans-val">$$${pr.a}$$</div>
                  </div>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      `;
    } else if (b.type === "recap") {
      blocksHtml += `
        <div class="recap-panel ${animClass}">
          <div class="recap-eyebrow">Quick recap</div>
          <ul class="recap-list">
            ${b.items.map((rc) => `<li>${rc}</li>`).join("")}
          </ul>
        </div>
      `;
    }
  }

  const lessonHtml = `
    <div class="article-wrap">
      <div class="eyebrow">Chapter ${chap.no} · Lesson ${chap.lessons.indexOf(lesson) + 1}</div>
      <h1 class="lesson-title">${lesson.title}</h1>
      <div class="meta-row">
        <span class="chip">${lesson.minutes} min read</span>
        <span class="chip">${lesson.level}</span>
        <span class="chip interactive">Interactive</span>
      </div>
      <div class="body-text">
        ${blocksHtml}
      </div>

      <button class="complete ${isDone ? "is-done" : ""}">
        <svg class="ico ${isDone ? "pop" : ""}"><use href="#i-check"/></svg>
        <span>${isDone ? "Completed — undo" : "Mark lesson complete"}</span>
      </button>

      <div class="pn">
        ${
          prevLesson
            ? `
          <a href="#/${prevLesson.path}" class="pn-card prev">
            <span class="pn-eyebrow">Previous</span>
            <span class="pn-title">${prevLesson.lesson.title}</span>
          </a>
        `
            : "<div></div>"
        }
        ${
          nextLesson
            ? `
          <a href="#/${nextLesson.path}" class="pn-card next">
            <span class="pn-eyebrow">Next</span>
            <span class="pn-title">${nextLesson.lesson.title}</span>
          </a>
        `
            : "<div></div>"
        }
      </div>
    </div>
  `;

  view.innerHTML = lessonHtml;

  // Mount widgets
  lesson.blocks.forEach((b, idx) => {
    if (b.type === "widget") {
      const mount = view.querySelector(`#widget-mount-${idx}`);
      if (mount && WIDGET_REGISTRY[b.id]) {
        const p = WIDGET_REGISTRY[b.id](mount, lesson.widget?.props || {});
        if (p) activePlots.push(p);
      }
    }
  });

  // Render LaTeX
  renderMath(view);

  // Setup TOC rail
  const tocNav = document.querySelector(".toc-nav");
  if (tocNav) {
    tocNav.innerHTML = tocItems
      .map(
        (item) => `
      <a href="#${item.id}" class="toc-link">${item.title}</a>
    `,
      )
      .join("");
  }
  setupTocScrollSpy();

  // Practice solution toggle buttons
  view.querySelectorAll(".practice-item").forEach((item) => {
    const btn = item.querySelector(".practice-sol-btn");
    const drawer = item.querySelector(".practice-sol-drawer");
    const txt = btn.querySelector(".btn-txt");
    const chev = btn.querySelector(".chev");

    btn.addEventListener("click", () => {
      const isOpen = drawer.classList.contains("open");
      drawer.classList.toggle("open", !isOpen);
      txt.textContent = isOpen ? "Show solution" : "Hide solution";
      chev.style.transform = isOpen ? "rotate(0deg)" : "rotate(90deg)";
    });
  });

  // Complete button
  const completeBtn = view.querySelector("button.complete");
  if (completeBtn) {
    completeBtn.addEventListener("click", () => {
      const key = `${chapId}/${lessonId}`;
      const nowDone = !state.done[key];
      if (nowDone) state.done[key] = true;
      else delete state.done[key];
      saveState();

      completeBtn.classList.toggle("is-done", nowDone);
      completeBtn.querySelector("span").textContent = nowDone
        ? "Completed — undo"
        : "Mark lesson complete";
      const ico = completeBtn.querySelector(".ico");
      if (nowDone) ico.classList.add("pop");
      else ico.classList.remove("pop");

      updateSidebar(chapId, lessonId);
    });
  }
}

export function render404() {
  const view = document.querySelector("main#view");
  destroyActivePlots();
  document.title = "404 Not Found — Mathesis";
  view.innerHTML = `
    <div class="article-wrap" style="text-align:center;padding:80px 0">
      <div class="eyebrow" style="color:var(--accent)">404</div>
      <h1 class="lesson-title" style="margin-top:8px">Nothing at this address.</h1>
      <p style="font-family:var(--serif);font-size:18px;color:var(--muted);margin-top:14px">The mathematical coordinates you entered do not exist on this atlas.</p>
      <div style="margin-top:24px">
        <a href="#/" class="btn-primary">Back to start</a>
      </div>
    </div>
  `;
}

// Global Router
export function route() {
  const hash = location.hash.replace(/^#\/?/, "").trim();
  window.scrollTo(0, 0);

  // Close mobile drawer if open
  closeDrawer();

  if (!hash || hash === "") {
    renderHome();
    updateSidebar(null, null);
    return;
  }

  if (hash === "formulas") {
    renderFormulas();
    updateSidebar(null, null);
    return;
  }

  const parts = hash.split("/");
  if (parts.length === 1) {
    renderChapterOverview(parts[0]);
    updateSidebar(parts[0], null);
    return;
  }

  if (parts.length === 2) {
    renderLesson(parts[0], parts[1]);
    updateSidebar(parts[0], parts[1]);
    return;
  }

  render404();
}

// Drawer helpers for mobile
function openDrawer() {
  document.querySelector("aside.side")?.classList.add("drawer-open");
  document.querySelector(".scrim")?.classList.add("show");
}
function closeDrawer() {
  document.querySelector("aside.side")?.classList.remove("drawer-open");
  document.querySelector(".scrim")?.classList.remove("show");
}

// Search Palette Engine
let searchIndex = [];
export function buildSearchIndex() {
  searchIndex = [];
  for (const chap of CHAPTERS) {
    if (chap.status === "soon") continue;
    for (const les of chap.lessons) {
      let bodyText = "";
      const headings = [];
      for (const b of les.blocks) {
        if (b.type === "h2") headings.push(b.x);
        else if (b.type === "p" || b.type === "callout") {
          const raw = (b.x || "") + " " + (b.title || "");
          bodyText += " " + raw.replace(/\$[^$]+\$/g, "");
        }
      }
      searchIndex.push({
        title: les.title,
        chapTitle: chap.title,
        chapId: chap.id,
        lesId: les.id,
        path: `${chap.id}/${les.id}`,
        headings,
        text: bodyText,
      });
    }
  }
}

let paletteSelection = 0;
let paletteResults = [];

function openPalette() {
  const palette = document.querySelector(".palette");
  const input = document.querySelector(".palette-input");
  if (!palette || !input) return;
  palette.classList.add("open");
  palette.setAttribute("aria-hidden", "false");
  input.value = "";
  paletteSelection = 0;
  runSearch("");
  input.focus();
}

function closePalette() {
  const palette = document.querySelector(".palette");
  if (!palette) return;
  palette.classList.remove("open");
  palette.setAttribute("aria-hidden", "true");
}

function runSearch(query) {
  const resultsEl = document.querySelector(".palette-results");
  if (!resultsEl) return;
  const q = query.trim().toLowerCase();

  if (!q) {
    resultsEl.innerHTML = `<div class="palette-empty">Type terms to search lessons, definitions, and theorems.</div>`;
    paletteResults = [];
    return;
  }

  const terms = q.split(/\s+/).filter(Boolean);
  const scored = [];

  for (const item of searchIndex) {
    const tLower = item.title.toLowerCase();
    const hLower = item.headings.join(" ").toLowerCase();
    const bLower = item.text.toLowerCase();

    let allMatch = true;
    for (const term of terms) {
      if (
        !tLower.includes(term) &&
        !hLower.includes(term) &&
        !bLower.includes(term)
      ) {
        allMatch = false;
        break;
      }
    }
    if (!allMatch) continue;

    let score = 0;
    for (const term of terms) {
      if (tLower.includes(term)) score += 5;
      if (hLower.includes(term)) score += 3;
      if (bLower.includes(term)) score += 1;
    }

    // Extract snippet
    let snippet = "";
    const idx = bLower.indexOf(terms[0]);
    if (idx >= 0) {
      const start = Math.max(0, idx - 40);
      const end = Math.min(item.text.length, idx + 80);
      snippet =
        (start > 0 ? "…" : "") +
        item.text.slice(start, end).trim() +
        (end < item.text.length ? "…" : "");
    } else {
      snippet = item.headings.join(" · ");
    }

    // Highlight terms in snippet
    let highlighted = snippet;
    for (const term of terms) {
      const reg = new RegExp(`(${term})`, "gi");
      highlighted = highlighted.replace(reg, "<mark>$1</mark>");
    }

    scored.push({
      item,
      score,
      snippet: highlighted,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  paletteResults = scored.slice(0, 8);
  paletteSelection = 0;

  if (paletteResults.length === 0) {
    resultsEl.innerHTML = `<div class="palette-empty">No matches. Try “chain rule” or “area”.</div>`;
    return;
  }

  resultsEl.innerHTML = paletteResults
    .map(
      (r, i) => `
    <div class="palette-row ${i === 0 ? "selected" : ""}" data-idx="${i}" data-path="${r.item.path}">
      <div class="palette-row-title">${r.item.title}</div>
      <div class="palette-row-crumbs">${r.item.chapTitle}</div>
      <div class="palette-row-snippet">${r.snippet}</div>
    </div>
  `,
    )
    .join("");

  resultsEl.querySelectorAll(".palette-row").forEach((row) => {
    row.addEventListener("click", () => {
      location.hash = `#/${row.dataset.path}`;
      closePalette();
    });
  });
}

function updatePaletteSelection() {
  const rows = document.querySelectorAll(".palette-row");
  rows.forEach((r, i) => {
    r.classList.toggle("selected", i === paletteSelection);
    if (i === paletteSelection) r.scrollIntoView({ block: "nearest" });
  });
}

// Boot & Event Listeners
window.addEventListener("DOMContentLoaded", () => {
  buildSearchIndex();
  applyTheme(state.theme);

  // Kbd display (Mac vs PC)
  const isMac = navigator.platform?.toUpperCase().indexOf("MAC") >= 0;
  const searchKbd = document.querySelector("#search-kbd");
  if (searchKbd) searchKbd.textContent = isMac ? "⌘K" : "Ctrl K";

  // Theme button
  document.querySelector("#theme")?.addEventListener("click", () => {
    applyTheme(state.theme === "board" ? "paper" : "board");
  });

  // Mobile menu button
  document.querySelector(".topbar .menu")?.addEventListener("click", () => {
    openDrawer();
  });
  document.querySelector(".scrim")?.addEventListener("click", () => {
    closeDrawer();
  });

  // Search button
  document.querySelector(".searchbtn")?.addEventListener("click", openPalette);

  // Search palette keyboard
  const paletteInput = document.querySelector(".palette-input");
  paletteInput?.addEventListener("input", (e) => {
    runSearch(e.target.value);
  });

  paletteInput?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (paletteResults.length > 0) {
        paletteSelection = (paletteSelection + 1) % paletteResults.length;
        updatePaletteSelection();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (paletteResults.length > 0) {
        paletteSelection =
          (paletteSelection - 1 + paletteResults.length) %
          paletteResults.length;
        updatePaletteSelection();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (paletteResults.length > 0 && paletteResults[paletteSelection]) {
        location.hash = `#/${paletteResults[paletteSelection].item.path}`;
        closePalette();
      }
    } else if (e.key === "Escape") {
      closePalette();
    }
  });

  document.querySelector(".palette")?.addEventListener("click", (e) => {
    if (e.target.classList.contains("palette")) closePalette();
  });

  // Global Keybindings
  window.addEventListener("keydown", (e) => {
    // Open palette on ⌘K, Ctrl K, or / (when not in an input)
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openPalette();
      return;
    }
    if (
      e.key === "/" &&
      document.activeElement?.tagName !== "INPUT" &&
      document.activeElement?.tagName !== "TEXTAREA"
    ) {
      e.preventDefault();
      openPalette();
      return;
    }
    if (e.key === "Escape") {
      closePalette();
      closeDrawer();
      return;
    }

    // Previous '[' and Next ']' lesson shortcuts (ignored in inputs)
    if (
      document.activeElement?.tagName !== "INPUT" &&
      document.activeElement?.tagName !== "TEXTAREA"
    ) {
      if (e.key === "[" || e.key === "]") {
        const hash = location.hash.replace(/^#\/?/, "").trim();
        const flat = getFlatLessons();
        const currIdx = flat.findIndex((f) => f.path === hash);
        if (currIdx >= 0) {
          if (e.key === "[" && currIdx > 0) {
            location.hash = `#/${flat[currIdx - 1].path}`;
          } else if (e.key === "]" && currIdx < flat.length - 1) {
            location.hash = `#/${flat[currIdx + 1].path}`;
          }
        }
      }
    }
  });

  // Hash route change
  window.addEventListener("hashchange", route);

  // Redraw plots on theme change
  window.addEventListener("themechange", () => {
    for (const p of activePlots) {
      if (p && p.requestDraw) p.requestDraw();
    }
  });

  // Initial Route
  route();
});
