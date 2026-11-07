import { Chapter } from "../types/curriculum";

export const CHAPTERS_INT: Chapter[] = [
  {
    id: "integration",
    no: 3,
    title: "Integration",
    blurb:
      "How much has accumulated? Reversing differentiation, calculating net area, and the Fundamental Theorem.",
    status: "ready",
    lessons: [
      {
        id: "antiderivatives",
        title: "Antiderivatives and the indefinite integral",
        minutes: 12,
        level: "Beginner",
        widget: {
          id: "family",
          caption:
            "Adjust C to shift the parabola vertically. All curves share the identical derivative f(x) = 2x.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "If a speedometer reads a constant 60 mph for two hours, you know you travelled 120 miles. But where did you start? In London, New York, or Paris? Differentiation destroys the initial starting position because the derivative of any constant is zero.",
          },
          {
            type: "p",
            x: "The antiderivative is the reverse operation of differentiation. Because any constant $C$ could have been added before differentiating, indefinite integration yields an entire vertical family of parallel curves.",
          },
          {
            type: "callout",
            k: "definition",
            title: "The Indefinite Integral",
            x: "If $F'(x) = f(x)$, then $\\int f(x)\\,dx = F(x) + C$, where $C$ is the arbitrary constant of integration.",
          },
          {
            type: "eq",
            x: String.raw`\int x^n\,dx = \frac{x^{n+1}}{n+1} + C \quad (n \ne -1),\qquad \int \frac{1}{x}\,dx = \ln|x| + C`,
            sheet: true,
            name: "Power Rule for Integration",
          },
          { type: "widget", id: "family" },
          {
            type: "details",
            title: "Where this comes from (Reversing the power rule)",
            x: String.raw`Since $\frac{d}{dx}\left[\frac{x^{n+1}}{n+1}\right] = \frac{(n+1)x^n}{n+1} = x^n$, integrating both sides reverses the differentiation:
$$\int x^n\,dx = \frac{x^{n+1}}{n+1} + C$$
For $n = -1$, the power rule would divide by zero. Instead, since $\frac{d}{dx}\ln|x| = \frac{1}{x}$, we have $\int \frac{1}{x}\,dx = \ln|x| + C$.`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Integrate 3x² + 2x + 1",
            steps: [
              "Integrate term by term: $\\int 3x^2\\,dx = 3\\left(\\frac{x^3}{3}\\right) = x^3$.",
              "Next: $\\int 2x\\,dx = 2\\left(\\frac{x^2}{2}\\right) = x^2$.",
              "Next: $\\int 1\\,dx = x$.",
              "Add the integration constant $C$: $x^3 + x^2 + x + C$.",
            ],
            answer: String.raw`x^3 + x^2 + x + C`,
          },
          {
            type: "example",
            title: "Integrate eˣ + cos x",
            steps: [
              "Recall that $\\frac{d}{dx}e^x = e^x$, so $\\int e^x\\,dx = e^x$.",
              "Recall that $\\frac{d}{dx}\\sin x = \\cos x$, so $\\int \\cos x\\,dx = \\sin x$.",
              "Combine: $e^x + \\sin x + C$.",
            ],
            answer: String.raw`e^x + \sin x + C`,
          },
          {
            type: "example",
            title: "Initial value problem: f′(x) = 2x with f(1) = 3",
            steps: [
              "Antidifferentiate: $f(x) = \\int 2x\\,dx = x^2 + C$.",
              "Substitute the initial condition $f(1) = 3$: $1^2 + C = 3 \\implies 1 + C = 3 \\implies C = 2$.",
              "Write the specific solution: $f(x) = x^2 + 2$.",
            ],
            answer: String.raw`f(x) = x^2 + 2`,
          },
          {
            type: "mistakes",
            items: [
              "Forgetting $+ C$ in indefinite integrals: without $+C$, you have only named one curve in an infinite family.",
              "Writing $\\int \\frac{1}{x}\\,dx = \\frac{x^0}{0}$: the power rule does not apply when $n = -1$; use $\\ln|x|$.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Evaluate $\\int (4x^3 - 6x)\\,dx$.",
                steps: [
                  "$4\\left(\\frac{x^4}{4}\\right) - 6\\left(\\frac{x^2}{2}\\right) + C = x^4 - 3x^2 + C$.",
                ],
                a: String.raw`x^4 - 3x^2 + C`,
              },
              {
                q: "Evaluate $\\int \\frac{1}{\\sqrt{x}}\\,dx$.",
                steps: [
                  "Rewrite as $\\int x^{-1/2}\\,dx = \\frac{x^{1/2}}{1/2} + C = 2\\sqrt{x} + C$.",
                ],
                a: String.raw`2\sqrt{x} + C`,
              },
              {
                q: "Evaluate $\\int \\sin x\\,dx$.",
                steps: [
                  "Since $(\\cos x)' = -\\sin x$, $\\int \\sin x\\,dx = -\\cos x + C$.",
                ],
                a: String.raw`-\cos x + C`,
              },
              {
                q: "Given $f'(x) = 6x^2 - 2$ with $f(0) = 5$, find $f(x)$.",
                steps: [
                  "$f(x) = 2x^3 - 2x + C$. At $x=0$, $C = 5 \\implies f(x) = 2x^3 - 2x + 5$.",
                ],
                a: String.raw`f(x) = 2x^3 - 2x + 5`,
              },
              {
                q: "Evaluate $\\int (x + 1)^2\\,dx$.",
                steps: [
                  "Expand to $\\int (x^2 + 2x + 1)\\,dx = \\frac{x^3}{3} + x^2 + x + C = \\frac{(x+1)^3}{3} + C$.",
                ],
                a: String.raw`\frac{(x+1)^3}{3} + C`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Integration reverses differentiation.",
              "Always append $+ C$ to indefinite integrals.",
              "An initial condition picks out a single specific curve from the family.",
            ],
          },
        ],
      },
      {
        id: "substitution",
        title: "Integration by substitution",
        minutes: 16,
        level: "Intermediate",
        widget: {
          id: "derivlab",
          props: { mode: "antiderivative", preset: "2*x*cos(x^2)" },
          caption:
            "Test u-substitution antiderivatives directly in the verification lab.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "Just as the product rule led to integration by parts, the chain rule gives rise to integration by substitution (u-substitution). It is the reverse chain rule: when you spot an inner function $u = g(x)$ alongside its derivative $g'(x)\\,dx$, you can collapse the messy integral into a clean, simple form in $u$.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "Integration by Substitution",
            x: "Let $u = g(x)$, so $du = g'(x)\\,dx$. The integral transforms as $\\int f(g(x))g'(x)\\,dx = \\int f(u)\\,du$.",
          },
          {
            type: "eq",
            x: String.raw`\int f(g(x))g'(x)\,dx = \int f(u)\,du`,
            sheet: true,
            name: "Substitution Rule",
          },
          {
            type: "widget",
            id: "derivlab",
            props: { mode: "antiderivative", preset: "2*x*cos(x^2)" },
          },
          {
            type: "details",
            title: "Where this comes from (Chain rule reversal)",
            x: String.raw`By the chain rule, $\frac{d}{dx}[F(g(x))] = F'(g(x))g'(x) = f(g(x))g'(x)$.
Integrating both sides with respect to $x$:
$$\int f(g(x))g'(x)\,dx = F(g(x)) + C = \int f(u)\,du$$`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Integrate 2x cos(x²)",
            steps: [
              "Let $u = x^2$. Then $du = 2x\\,dx$.",
              "Substitute: $\\int \\cos(u)\\,du$.",
              "Integrate: $\\sin(u) + C$.",
              "Substitute back $u = x^2$: $\\sin(x^2) + C$.",
            ],
            answer: String.raw`\sin(x^2) + C`,
          },
          {
            type: "example",
            title: "Integrate (3x + 1)⁴",
            steps: [
              "Let $u = 3x + 1$, so $du = 3\\,dx \\implies dx = \\frac{du}{3}$.",
              "Substitute: $\\int u^4 \\frac{du}{3} = \\frac{1}{3}\\int u^4\\,du$.",
              "Integrate: $\\frac{1}{3}\\left(\\frac{u^5}{5}\\right) + C = \\frac{u^5}{15} + C$.",
              "Substitute back: $\\frac{(3x+1)^5}{15} + C$.",
            ],
            answer: String.raw`\frac{(3x+1)^5}{15} + C`,
          },
          {
            type: "example",
            title: "Integrate x / (x² + 1)",
            steps: [
              "Let $u = x^2 + 1$, so $du = 2x\\,dx \\implies x\\,dx = \\frac{du}{2}$.",
              "Substitute: $\\int \\frac{1}{u} \\frac{du}{2} = \\frac{1}{2}\\ln|u| + C$.",
              "Since $x^2 + 1 > 0$, we have $\\frac{1}{2}\\ln(x^2+1) + C$.",
              "Note: similarly, $\\int \\tan x\\,dx = \\int \\frac{\\sin x}{\\cos x}\\,dx = -\\ln|\\cos x| + C$.",
            ],
            answer: String.raw`\frac{1}{2}\ln(x^2+1) + C;\; \text{also } \int\tan x\,dx = -\ln|\cos x| + C`,
          },
          {
            type: "mistakes",
            items: [
              "Forgetting to replace $dx$: you must express $dx$ in terms of $du$ (including constant factors).",
              "Leaving $x$ in terms of $u$: the entire integrand must be converted to $u$ before integrating.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Evaluate $\\int e^{3x}\\,dx$.",
                steps: [
                  "$u = 3x \\implies dx = du/3$. Result: $\\frac{e^{3x}}{3} + C$.",
                ],
                a: String.raw`\frac{e^{3x}}{3} + C`,
              },
              {
                q: "Evaluate $\\int x\\sqrt{x^2+1}\\,dx$.",
                steps: [
                  "$u = x^2+1, du = 2x\\,dx$. $\\frac{1}{2}\\int u^{1/2}\\,du = \\frac{1}{2}\\frac{u^{3/2}}{3/2} + C = \\frac{1}{3}(x^2+1)^{3/2} + C$.",
                ],
                a: String.raw`\frac{1}{3}(x^2+1)^{3/2} + C`,
              },
              {
                q: "Evaluate $\\int \\cos 2x\\,dx$.",
                steps: ["$u = 2x \\implies \\frac{1}{2}\\sin 2x + C$."],
                a: String.raw`\frac{1}{2}\sin 2x + C`,
              },
              {
                q: "Evaluate $\\int \\frac{\\ln x}{x}\\,dx$.",
                steps: [
                  "$u = \\ln x, du = \\frac{1}{x}dx$. $\\int u\\,du = \\frac{u^2}{2} + C = \\frac{(\\ln x)^2}{2} + C$.",
                ],
                a: String.raw`\frac{(\\ln x)^2}{2} + C`,
              },
              {
                q: "Evaluate $\\int \\sin x\\cos x\\,dx$.",
                steps: [
                  "$u = \\sin x, du = \\cos x\\,dx$. $\\int u\\,du = \\frac{\\sin^2 x}{2} + C$.",
                ],
                a: String.raw`\frac{\sin^2 x}{2} + C`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Look for an inner function whose derivative also appears in the integrand.",
              "Substitute $u = g(x)$ and $du = g'(x)\\,dx$.",
              "Convert back to $x$ at the end for indefinite integrals.",
            ],
          },
        ],
      },
      {
        id: "by-parts",
        title: "Integration by parts",
        minutes: 16,
        level: "Advanced",
        widget: {
          id: "derivlab",
          props: { mode: "antiderivative", preset: "x*exp(x)" },
          caption: "Verify your integration by parts solutions numerically.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "When two functions are multiplied together—such as $x e^x$ or $x \\sin x$—u-substitution fails because neither part is the derivative of the other. To crack these integrals, we run the product rule in reverse.",
          },
          {
            type: "p",
            x: "Integration by parts trades a difficult integral $\\int u\\,dv$ for a much simpler one $\\int v\\,du$. The art lies in choosing which part gets differentiated ($u$) and which part gets integrated ($dv$).",
          },
          {
            type: "callout",
            k: "theorem",
            title: "Integration by Parts Formula",
            x: "For differentiable functions $u(x)$ and $v(x)$, $\\int u\\,dv = uv - \\int v\\,du$. Use the LIATE rule to choose $u$: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential.",
          },
          {
            type: "eq",
            x: String.raw`\int u\,dv = uv - \int v\,du`,
            sheet: true,
            name: "Integration by Parts",
          },
          {
            type: "widget",
            id: "derivlab",
            props: { mode: "antiderivative", preset: "x*exp(x)" },
          },
          {
            type: "details",
            title: "Where this comes from (Product rule integration)",
            x: String.raw`Start with the product rule:
$$\frac{d}{dx}[uv] = u\frac{dv}{dx} + v\frac{du}{dx}$$
Integrating both sides with respect to $x$:
$$uv = \int u\,dv + \int v\,du \implies \int u\,dv = uv - \int v\,du$$`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Integrate x eˣ",
            steps: [
              "Choose $u = x$ (algebraic) and $dv = e^x\\,dx$ (exponential).",
              "Differentiate $u$: $du = dx$. Integrate $dv$: $v = e^x$.",
              "Apply formula: $\\int x e^x\\,dx = x e^x - \\int e^x\\,dx$.",
              "Evaluate remaining integral: $x e^x - e^x + C = (x - 1)e^x + C$.",
            ],
            answer: String.raw`(x - 1)e^x + C`,
          },
          {
            type: "example",
            title: "Integrate ln x",
            steps: [
              "Treat as a product: $\\int (\\ln x)(1)\\,dx$.",
              "Choose $u = \\ln x$ and $dv = dx$.",
              "Then $du = \\frac{1}{x}\\,dx$ and $v = x$.",
              "Apply formula: $x\\ln x - \\int x\\left(\\frac{1}{x}\\right)dx = x\\ln x - \\int 1\\,dx = x\\ln x - x + C$.",
            ],
            answer: String.raw`x\ln x - x + C`,
          },
          {
            type: "example",
            title: "Integrate x² eˣ (Repeated Parts)",
            steps: [
              "First pass: $u = x^2, dv = e^x\\,dx \\implies du = 2x\\,dx, v = e^x$.",
              "Result: $x^2 e^x - 2\\int x e^x\\,dx$.",
              "Second pass: we know $\\int x e^x\\,dx = (x - 1)e^x$.",
              "Combine: $x^2 e^x - 2(x - 1)e^x + C = e^x(x^2 - 2x + 2) + C$.",
            ],
            answer: String.raw`e^x(x^2 - 2x + 2) + C`,
          },
          {
            type: "mistakes",
            items: [
              "Choosing $u$ that gets more complicated upon differentiation.",
              "Forgetting to distribute negative signs when integrating by parts repeatedly.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Evaluate $\\int x\\sin x\\,dx$.",
                steps: [
                  "$u = x, dv = \\sin x\\,dx \\implies du = dx, v = -\\cos x$. $uv - \\int v\\,du = -x\\cos x + \\int \\cos x\\,dx = -x\\cos x + \\sin x + C$.",
                ],
                a: String.raw`-x\cos x + \sin x + C`,
              },
              {
                q: "Evaluate $\\int x\\ln x\\,dx$.",
                steps: [
                  "$u = \\ln x, dv = x\\,dx \\implies du = \\frac{1}{x}dx, v = \\frac{x^2}{2}$. $\\frac{x^2}{2}\\ln x - \\int \\frac{x}{2}\\,dx = \\frac{x^2}{2}\\ln x - \\frac{x^2}{4} + C$.",
                ],
                a: String.raw`\frac{x^2}{2}\ln x - \frac{x^2}{4} + C`,
              },
              {
                q: "Evaluate $\\int x e^{2x}\\,dx$.",
                steps: [
                  "$u = x, dv = e^{2x}dx \\implies du = dx, v = \\frac{e^{2x}}{2}$. $\\frac{x e^{2x}}{2} - \\int \\frac{e^{2x}}{2}dx = \\frac{e^{2x}(2x-1)}{4} + C$.",
                ],
                a: String.raw`\frac{e^{2x}(2x-1)}{4} + C`,
              },
              {
                q: "Evaluate $\\int e^x \\sin x\\,dx$ (Cyclic integration by parts).",
                steps: [
                  "Apply parts twice to recover the original integral $I$: $I = e^x\\sin x - e^x\\cos x - I \\implies 2I = e^x(\\sin x - \\cos x) \\implies I = \\frac{e^x(\\sin x - \\cos x)}{2} + C$.",
                ],
                a: String.raw`\frac{e^x(\sin x - \cos x)}{2} + C`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Formula: $\\int u\\,dv = uv - \\int v\\,du$.",
              "LIATE prioritizes choice of $u$: Logarithmic, Inverse trig, Algebraic, Trig, Exponential.",
              "Cyclic integrals (like $e^x \\sin x$) are solved algebraically after two passes.",
            ],
          },
        ],
      },
      {
        id: "riemann-sums",
        title: "Definite integrals and Riemann sums",
        minutes: 16,
        level: "Intermediate",
        widget: {
          id: "riemann",
          caption:
            "Increase strips n from 4 to 200 to watch approximating rectangles coalesce into exact area.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "Archimedes approximated the area of curved shapes by filling them with polygons. In modern calculus, Bernhard Riemann formalized this: partition an interval $[a, b]$ into $n$ narrow vertical slices of width $\\Delta x$, erect rectangles under the curve, and sum their areas.",
          },
          {
            type: "p",
            x: "As the number of strips $n \\to \\infty$, the width $\\Delta x \\to 0$. The error vanishes, and the Riemann sum converges to the exact definite integral.",
          },
          {
            type: "callout",
            k: "definition",
            title: "The Definite Integral",
            x: "The definite integral is the limit of Riemann sums over finer and finer partitions.",
          },
          {
            type: "eq",
            x: String.raw`\int_a^b f(x)\,dx = \lim_{n \to \infty} \sum_{i=1}^n f(x_i^*) \Delta x`,
            sheet: true,
            name: "Riemann Integral Definition",
          },
          { type: "widget", id: "riemann" },
          {
            type: "details",
            title:
              "Where this comes from (Convergence of upper and lower Darboux sums)",
            x: String.raw`For any continuous function on $[a,b]$, the lower sum $L_n$ and upper sum $U_n$ bracket the true area:
$$L_n \le \text{Area} \le U_n$$
Because $f$ is uniformly continuous on $[a, b]$, $\lim_{n\to\infty}(U_n - L_n) = 0$. The squeeze theorem proves the limit exists uniquely, which we denote as $\int_a^b f(x)\,dx$.`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Riemann sums for ∫₀² x² dx with n = 4",
            steps: [
              "Width of each subinterval: $\\Delta x = \\frac{2 - 0}{4} = 0.5$. Grid points: $0, 0.5, 1.0, 1.5, 2.0$.",
              "Left sum: $0.5[f(0) + f(0.5) + f(1.0) + f(1.5)] = 0.5[0.5 + 0.25 + 1 + 2.25] = 0.5(3.5) = 1.75$.",
              "Right sum: $0.5[f(0.5) + f(1.0) + f(1.5) + f(2.0)] = 0.5[0.25 + 1 + 2.25 + 4] = 0.5(7.5) = 3.75$.",
              "Midpoint sum: midpoints are $0.25, 0.75, 1.25, 1.75$. Sum $= 0.5[0.0625 + 0.5625 + 1.5625 + 3.0625] = 0.5(5.25) = 2.625$.",
              "The exact value is $\\left[\\frac{x^3}{3}\\right]_0^2 = \\frac{8}{3} \\approx 2.667$.",
            ],
            answer: String.raw`\text{left } 1.75,\; \text{right } 3.75,\; \text{midpoint } 2.625;\; \text{exact } \frac{8}{3} \approx 2.667`,
          },
          {
            type: "mistakes",
            items: [
              "Confusing net signed area with total physical area: regions below the x-axis count as negative area in a definite integral.",
              "Calculating $\\Delta x$ incorrectly: $\\Delta x = \\frac{b - a}{n}$, not $\\frac{b}{n}$.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Calculate the right Riemann sum for $f(x) = x$ on $[0, 2]$ with $n = 4$.",
                steps: [
                  "$\\Delta x = 0.5$. Right endpoints: $0.5, 1.0, 1.5, 2.0$. Sum $= 0.5(0.5 + 1 + 1.5 + 2) = 0.5(5) = 2.5$.",
                ],
                a: String.raw`2.5`,
              },
              {
                q: "Calculate the midpoint sum of $\\int_0^2 x\\,dx$ with $n = 2$.",
                steps: [
                  "$\\Delta x = 1$. Midpoints: $0.5, 1.5$. Sum $= 1(0.5 + 1.5) = 2$ (exact for linear functions!).",
                ],
                a: String.raw`2`,
              },
              {
                q: "Evaluate $\\int_0^3 2\\,dx$ as an area of a rectangle.",
                steps: [
                  "Width $= 3 - 0 = 3$, height $= 2$. Area $= 3 \\times 2 = 6$.",
                ],
                a: String.raw`6`,
              },
              {
                q: "Evaluate $\\int_{-1}^1 x\\,dx$ using symmetry.",
                steps: [
                  "$f(x) = x$ is an odd function; the negative area on $[-1, 0]$ cancels the positive area on $[0, 1]$. Net area $= 0$.",
                ],
                a: String.raw`0`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Riemann sum: $\\sum f(x_i^*)\\Delta x$.",
              "As $n \\to \\infty$, the sum converges to $\\int_a^b f(x)\\,dx$.",
              "Definite integrals calculate net signed area.",
            ],
          },
        ],
      },
      {
        id: "ftc",
        title: "The Fundamental Theorem of Calculus",
        minutes: 16,
        level: "Advanced",
        widget: {
          id: "ftc",
          caption:
            "Sweep upper limit x: notice the rate of growth of accumulated area A(x) matches curve height f(x).",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "For centuries, the problem of slopes (differentiation) and the problem of areas (integration) were thought to be completely separate branches of mathematics. Isaac Newton and Gottfried Leibniz made the astonishing discovery that connects them: differentiation and integration are exact inverse operations.",
          },
          {
            type: "p",
            x: "If you accumulate area under a curve $f(t)$ from $a$ to $x$, the speed at which that area grows as you push the right edge forward is precisely the current height of the curve $f(x)$.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "The Fundamental Theorem of Calculus",
            x: "Part 1: $\\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x)$. Part 2: $\\int_a^b f(x)\\,dx = F(b) - F(a)$, where $F'(x) = f(x)$.",
          },
          {
            type: "eq",
            x: String.raw`\frac{d}{dx}\int_a^x f(t)\,dt = f(x),\qquad \int_a^b f(x)\,dx = F(b) - F(a)`,
            sheet: true,
            name: "Fundamental Theorem of Calculus",
          },
          { type: "widget", id: "ftc" },
          {
            type: "details",
            title:
              "Where this comes from (Derivative of accumulation function)",
            x: String.raw`Let $A(x) = \int_a^x f(t)\,dt$. By the definition of the derivative:
$$A'(x) = \lim_{h\to0} \frac{A(x+h) - A(x)}{h} = \lim_{h\to0} \frac{1}{h}\int_x^{x+h} f(t)\,dt$$
For continuous $f$, the Mean Value Theorem for integrals states $\int_x^{x+h} f(t)\,dt = f(c)h$ for some $c \in [x, x+h]$.
Therefore:
$$A'(x) = \lim_{h\to0} \frac{f(c)h}{h} = \lim_{c\to x} f(c) = f(x)$$`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Evaluate ∫₀² x² dx via FTC Part 2",
            steps: [
              "Find an antiderivative: $F(x) = \\frac{x^3}{3}$.",
              "Apply evaluation brackets: $\\left[\\frac{x^3}{3}\\right]_0^2$.",
              "Substitute upper and lower limits: $F(2) - F(0) = \\frac{2^3}{3} - \\frac{0^3}{3} = \\frac{8}{3}$.",
            ],
            answer: String.raw`\frac{8}{3}`,
          },
          {
            type: "example",
            title: "Evaluate ∫₀^π sin x dx",
            steps: [
              "Antiderivative of $\\sin x$ is $-\\cos x$.",
              "Evaluate on $[0, \\pi]$: $[-\\cos x]_0^\\pi = (-\\cos \\pi) - (-\\cos 0)$.",
              "Since $\\cos \\pi = -1$ and $\\cos 0 = 1$: $(-(-1)) - (-1) = 1 + 1 = 2$.",
            ],
            answer: String.raw`2`,
          },
          {
            type: "example",
            title:
              "Differentiate ∫₀^{x²} sin t dt using FTC Part 1 and Chain Rule",
            steps: [
              "Let $u = x^2$. Then $\\frac{d}{dx} \\int_0^{x^2} \\sin t\\,dt = \\frac{d}{du}\\left[\\int_0^u \\sin t\\,dt\\right] \\cdot \\frac{du}{dx}$.",
              "By FTC Part 1, $\\frac{d}{du}\\int_0^u \\sin t\\,dt = \\sin u$.",
              "By the power rule, $\\frac{du}{dx} = 2x$.",
              "Multiply together: $\\sin(x^2) \\cdot 2x = 2x\\sin(x^2)$.",
            ],
            answer: String.raw`2x\sin(x^2)`,
          },
          {
            type: "mistakes",
            items: [
              "Forgetting the chain rule when the limit is a function of $x$: $\\frac{d}{dx}\\int_a^{g(x)}f(t)\\,dt = f(g(x))g'(x)$.",
              "Subtracting in reverse order in FTC Part 2: it is always $F(b) - F(a)$ (Upper minus Lower).",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Evaluate $\\int_1^3 (2x + 1)\\,dx$.",
                steps: [
                  "$[x^2 + x]_1^3 = (3^2 + 3) - (1^2 + 1) = 12 - 2 = 10$.",
                ],
                a: String.raw`10`,
              },
              {
                q: "Evaluate $\\int_0^1 e^x\\,dx$.",
                steps: ["$[e^x]_0^1 = e^1 - e^0 = e - 1$."],
                a: String.raw`e - 1`,
              },
              {
                q: "Evaluate $\\int_1^e \\frac{1}{x}\\,dx$.",
                steps: ["$[\\ln x]_1^e = \\ln e - \\ln 1 = 1 - 0 = 1$."],
                a: String.raw`1`,
              },
              {
                q: "Find $\\frac{d}{dx}\\int_2^x \\sqrt{1 + t^2}\\,dt$.",
                steps: [
                  "Direct application of FTC Part 1: replace dummy variable $t$ with $x \\implies \\sqrt{1 + x^2}$.",
                ],
                a: String.raw`\sqrt{1 + x^2}`,
              },
              {
                q: "Evaluate $\\int_0^{\\pi/2} \\cos x\\,dx$.",
                steps: [
                  "$[\\sin x]_0^{\\pi/2} = \\sin(\\pi/2) - \\sin(0) = 1 - 0 = 1$.",
                ],
                a: String.raw`1`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "FTC Part 1: $\\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x)$.",
              "FTC Part 2: $\\int_a^b f(x)\\,dx = F(b) - F(a)$.",
              "Definite integrals can be evaluated without Riemann sums by finding antiderivatives.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "int-applications",
    no: 4,
    title: "Applications of Integration",
    blurb:
      "Area, volume, average: measuring complex shapes, solids of revolution, and improper integrals.",
    status: "ready",
    lessons: [
      {
        id: "area-between",
        title: "Area between curves",
        minutes: 14,
        level: "Intermediate",
        widget: {
          id: "area",
          caption:
            "Identify the intersection points and integrate top curve minus bottom curve.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "Definite integrals find the area between a curve and the x-axis. If we want the area trapped between two curves $f(x)$ and $g(x)$, we imagine slicing the region into thin vertical strips of height $[f(x) - g(x)]$ and width $dx$.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "Area Between Two Curves",
            x: "If $f(x) \\ge g(x)$ on $[a, b]$, the area enclosed is $A = \\int_a^b [f(x) - g(x)]\\,dx$.",
          },
          {
            type: "eq",
            x: String.raw`A = \int_a^b \big(f(x) - g(x)\big)\,dx`,
            sheet: true,
            name: "Area Between Curves",
          },
          { type: "widget", id: "area" },
          {
            type: "details",
            title: "Where this comes from (Strip superposition)",
            x: String.raw`Each vertical strip at $x$ has width $dx$ and height $h(x) = f(x) - g(x)$.
The differential area of the strip is $dA = [f(x) - g(x)]dx$.
Summing all strips from $x = a$ to $x = b$:
$$A = \int_a^b [f(x) - g(x)]\,dx$$`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Area between y = x and y = x²",
            steps: [
              "Find intersections: $x = x^2 \\implies x(x - 1) = 0 \\implies x = 0$ and $x = 1$.",
              "On $[0, 1]$, $x \\ge x^2$.",
              "Integrate top minus bottom: $\\int_0^1 (x - x^2)\\,dx$.",
              "Evaluate: $\\left[\\frac{x^2}{2} - \\frac{x^3}{3}\\right]_0^1 = \\frac{1}{2} - \\frac{1}{3} = \\frac{1}{6}$.",
            ],
            answer: String.raw`\frac{1}{6}`,
          },
          {
            type: "example",
            title: "Area between y = x² and y = 4",
            steps: [
              "Find intersections: $x^2 = 4 \\implies x = -2$ and $x = 2$.",
              "Top curve is $y = 4$; bottom curve is $y = x^2$.",
              "Integrate: $\\int_{-2}^2 (4 - x^2)\\,dx = 2\\int_0^2 (4 - x^2)\\,dx$ by symmetry.",
              "Evaluate: $2\\left[4x - \\frac{x^3}{3}\\right]_0^2 = 2\\left(8 - \\frac{8}{3}\\right) = 2\\left(\\frac{16}{3}\\right) = \\frac{32}{3}$.",
            ],
            answer: String.raw`\frac{32}{3}`,
          },
          {
            type: "mistakes",
            items: [
              "Failing to find where curves cross: if $f$ and $g$ cross within the interval, you must split the integral.",
              "Subtracting bottom minus top: results in a negative area.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Find the area between $y = x^2$ and $y = 2x$.",
                steps: [
                  "Intersections: $x^2 = 2x \\implies x = 0, 2$. Area $= \\int_0^2 (2x - x^2)\\,dx = [x^2 - x^3/3]_0^2 = 4 - 8/3 = 4/3$.",
                ],
                a: String.raw`\frac{4}{3}`,
              },
              {
                q: "Find the area under $y = \\sin x$ from $0$ to $\\pi$.",
                steps: [
                  "$\\int_0^\\pi \\sin x\\,dx = [-\\cos x]_0^\\pi = -(-1) - (-1) = 2$.",
                ],
                a: String.raw`2`,
              },
              {
                q: "Find the area between $y = \\sqrt{x}$ and $y = x$.",
                steps: [
                  "Intersections: $\\sqrt{x} = x \\implies x = 0, 1$. Top is $\\sqrt{x}$. $\\int_0^1 (x^{1/2} - x)\\,dx = [\\frac{2}{3}x^{3/2} - \\frac{x^2}{2}]_0^1 = \\frac{2}{3} - \\frac{1}{2} = \\frac{1}{6}$.",
                ],
                a: String.raw`\frac{1}{6}`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Find boundaries by solving $f(x) = g(x)$.",
              "Integrand is always $(\\text{Top} - \\text{Bottom})$.",
              "Use symmetry to simplify calculations where appropriate.",
            ],
          },
        ],
      },
      {
        id: "volumes",
        title: "Volumes of revolution",
        minutes: 16,
        level: "Advanced",
        widget: {
          id: "revolve",
          caption:
            "Rotate the 2D curve about the x-axis to assemble a solid from circular discs of volume π [f(x)]² dx.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "When a potter spins clay on a wheel, a 2D profile swept through 360 degrees forms a symmetric 3D solid. In calculus, we calculate the volume of such a solid of revolution by slicing it into circular discs perpendicular to the axis of rotation.",
          },
          {
            type: "p",
            x: "Each slice at position $x$ has radius $r = f(x)$ and thickness $dx$. Its volume is that of a thin cylinder: $dV = \\pi r^2 dx = \\pi [f(x)]^2 dx$.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "Disc Method Formula",
            x: "The volume of the solid generated by revolving $y = f(x)$ on $[a, b]$ about the x-axis is $V = \\pi \\int_a^b [f(x)]^2\\,dx$.",
          },
          {
            type: "eq",
            x: String.raw`V = \pi \int_a^b [f(x)]^2\,dx`,
            sheet: true,
            name: "Disc Method for Volume",
          },
          { type: "widget", id: "revolve" },
          {
            type: "details",
            title: "Where this comes from (Summing cylindrical discs)",
            x: String.raw`A cylinder of radius $R$ and height $h$ has volume $\pi R^2 h$.
At each position $x_i$, a disc of thickness $\Delta x$ has radius $f(x_i)$.
The Riemann sum of all discs is $\sum \pi [f(x_i)]^2 \Delta x$.
Taking the limit as $\Delta x \to 0$ yields the definite integral:
$$V = \lim_{n\to\infty} \sum_{i=1}^n \pi [f(x_i^*)]^2 \Delta x = \pi \int_a^b [f(x)]^2\,dx$$`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Volume of cone: revolve y = x on [0, 1] about x-axis",
            steps: [
              "Formula: $V = \\pi \\int_0^1 [x]^2\\,dx = \\pi \\int_0^1 x^2\\,dx$.",
              "Evaluate: $\\pi \\left[\\frac{x^3}{3}\\right]_0^1 = \\pi\\left(\\frac{1}{3} - 0\\right) = \\frac{\\pi}{3}$.",
              "Notice this matches standard cone geometry: $\\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi (1^2)(1) = \\frac{\\pi}{3}$.",
            ],
            answer: String.raw`\frac{\pi}{3}`,
          },
          {
            type: "example",
            title: "Revolve y = √x on [0, 4] about x-axis",
            steps: [
              "Square the function: $[\\sqrt{x}]^2 = x$.",
              "Integral: $V = \\pi \\int_0^4 x\\,dx$.",
              "Evaluate: $\\pi \\left[\\frac{x^2}{2}\\right]_0^4 = \\pi\\left(\\frac{16}{2}\\right) = 8\\pi$.",
            ],
            answer: String.raw`8\pi`,
          },
          {
            type: "example",
            title: "Revolve y = x² on [0, 1] about x-axis",
            steps: [
              "Square the function: $[x^2]^2 = x^4$.",
              "Integral: $V = \\pi \\int_0^1 x^4\\,dx$.",
              "Evaluate: $\\pi \\left[\\frac{x^5}{5}\\right]_0^1 = \\frac{\\pi}{5}$.",
            ],
            answer: String.raw`\frac{\pi}{5}`,
          },
          {
            type: "mistakes",
            items: [
              "Forgetting the factor of $\\pi$: the cross-section is a circle with area $\\pi r^2$, not $r^2$.",
              "Squaring after integrating instead of before: $\\pi \\int [f(x)]^2\\,dx \\ne \\pi \\left[\\int f(x)\\,dx\\right]^2$.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Find the volume generated by revolving $y = 2$ on $[0, 3]$ about the x-axis.",
                steps: [
                  "$V = \\pi \\int_0^3 2^2\\,dx = \\pi \\int_0^3 4\\,dx = 4\\pi(3) = 12\\pi$. (A cylinder of radius 2 and length 3).",
                ],
                a: String.raw`12\pi`,
              },
              {
                q: "Derive the volume of a sphere of radius 3 by revolving $y = \\sqrt{9 - x^2}$ on $[-3, 3]$.",
                steps: [
                  "$V = \\pi \\int_{-3}^3 (9 - x^2)\\,dx = 2\\pi [9x - x^3/3]_0^3 = 2\\pi (27 - 9) = 36\\pi$.",
                ],
                a: String.raw`36\pi`,
              },
              {
                q: "Find the volume when $y = e^x$ on $[0, 1]$ is revolved about the x-axis.",
                steps: [
                  "$[e^x]^2 = e^{2x}$. $V = \\pi \\int_0^1 e^{2x}\\,dx = \\pi [\\frac{e^{2x}}{2}]_0^1 = \\frac{\\pi(e^2 - 1)}{2}$.",
                ],
                a: String.raw`\frac{\pi(e^2-1)}{2}`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Disc method formula: $V = \\pi \\int_a^b [f(x)]^2\\,dx$.",
              "Always square the radius function $f(x)$ before integrating.",
              "If the solid has a hole, use the washer method: $\\pi \\int (R^2 - r^2)\\,dx$.",
            ],
          },
        ],
      },
      {
        id: "average-improper",
        title: "Average value and improper integrals",
        minutes: 14,
        level: "Advanced",
        widget: {
          id: "riemann",
          props: {
            showAverage: true,
            preset: "x2",
            range: [0, 3],
            rule: "mid",
            n: 30,
          },
          caption:
            "The dashed line marks the average value of x² over [0, 3], which is 3.0.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "If temperature varies continuously throughout the day, what was the average temperature? You cannot simply add a few thermometer readings and divide. Calculus defines the average of a continuous function as the total accumulated integral divided by the length of the interval.",
          },
          {
            type: "p",
            x: "Furthermore, can an infinite region have a finite area? Improper integrals extend integration to unbounded intervals like $[1, \\infty)$ or over vertical asymptotes. If the tail shrinks fast enough (like $1/x^2$), the total area converges to a crisp finite number.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "Average Value and p-Integrals",
            x: "The average value is $f_{\\text{avg}} = \\frac{1}{b-a}\\int_a^b f(x)\\,dx$. The improper integral $\\int_1^\\infty x^{-p}\\,dx$ converges if and only if $p > 1$.",
          },
          {
            type: "eq",
            x: String.raw`f_{\text{avg}} = \frac{1}{b-a}\int_a^b f(x)\,dx,\qquad \int_1^\infty \frac{1}{x^p}\,dx \text{ converges} \iff p > 1`,
            sheet: true,
            name: "Average Value & p-Test",
          },
          {
            type: "widget",
            id: "riemann",
            props: {
              showAverage: true,
              preset: "x2",
              range: [0, 3],
              rule: "mid",
              n: 30,
            },
          },
          {
            type: "details",
            title: "Where this comes from (Limit of improper integral)",
            x: String.raw`By definition:
$$\int_1^\infty \frac{1}{x^p}\,dx = \lim_{t\to\infty}\int_1^t x^{-p}\,dx$$
For $p \ne 1$: $\left[\frac{x^{1-p}}{1-p}\right]_1^t = \frac{t^{1-p}-1}{1-p}$.
If $p > 1$, $1-p < 0$, so $t^{1-p} \to 0$ as $t \to \infty$, giving finite area $\frac{1}{p-1}$.
If $p \le 1$, $t^{1-p}$ grows without bound (or $\ln t \to \infty$ for $p=1$), so the integral diverges.`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Average value of x² on [0, 3]",
            steps: [
              "Formula: $f_{\\text{avg}} = \\frac{1}{3 - 0}\\int_0^3 x^2\\,dx$.",
              "Evaluate integral: $\\int_0^3 x^2\\,dx = \\left[\\frac{x^3}{3}\\right]_0^3 = \\frac{27}{3} = 9$.",
              "Divide by interval length: $f_{\\text{avg}} = \\frac{1}{3}(9) = 3$.",
            ],
            answer: String.raw`3`,
          },
          {
            type: "example",
            title: "Evaluate improper integral ∫₁^∞ 1/x² dx",
            steps: [
              "Express as limit: $\\lim_{t\\to\\infty} \\int_1^t x^{-2}\\,dx$.",
              "Antiderivative: $[-x^{-1}]_1^t = \\left[-\\frac{1}{x}\\right]_1^t = -\\frac{1}{t} - (-1) = 1 - \\frac{1}{t}$.",
              "Take limit as $t \\to \\infty$: $\\lim_{t\\to\\infty} \\left(1 - \\frac{1}{t}\\right) = 1 - 0 = 1$.",
            ],
            answer: String.raw`1`,
          },
          {
            type: "example",
            title: "Divergence of ∫₁^∞ 1/x dx and convergence of ∫₀¹ 1/√x dx",
            steps: [
              "For $\\int_1^\\infty \\frac{1}{x}\\,dx$: $\\lim_{t\\to\\infty}[\\ln x]_1^t = \\lim_{t\\to\\infty}(\\ln t - 0) = \\infty$ (diverges!).",
              "For vertical asymptote at 0 in $\\int_0^1 x^{-1/2}\\,dx$: $\\lim_{t\\to0^+}[2\\sqrt{x}]_t^1 = 2\\sqrt{1} - 2\\sqrt{0} = 2$.",
            ],
            answer: String.raw`\int_1^\infty\frac{1}{x}\,dx \text{ diverges;}\quad \int_0^1\frac{1}{\sqrt{x}}\,dx \to 2`,
          },
          {
            type: "mistakes",
            items: [
              "Assuming $1/x$ converges because its height tends to 0: $1/x$ shrinks too slowly, so its total area is infinite.",
              "Ignoring interior vertical asymptotes: evaluating $\\int_{-1}^1 \\frac{1}{x^2}\\,dx$ without splitting at 0 gives false negative numbers.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Find the average value of $\\sin x$ on $[0, \\pi]$.",
                steps: [
                  "$\\frac{1}{\\pi - 0}\\int_0^\\pi \\sin x\\,dx = \\frac{1}{\\pi}[-\\cos x]_0^\\pi = \\frac{1}{\\pi}(1 - (-1)) = \\frac{2}{\\pi}$.",
                ],
                a: String.raw`\frac{2}{\pi}`,
              },
              {
                q: "Evaluate $\\int_0^\\infty e^{-x}\\,dx$.",
                steps: [
                  "$\\lim_{t\\to\\infty}[-e^{-x}]_0^t = \\lim_{t\\to\\infty}(-e^{-t} - (-1)) = 0 + 1 = 1$.",
                ],
                a: String.raw`1`,
              },
              {
                q: "Evaluate $\\int_1^\\infty x^{-3}\\,dx$.",
                steps: [
                  "$\\lim_{t\\to\\infty}\\left[-\\frac{1}{2x^2}\\right]_1^t = 0 - \\left(-\\frac{1}{2}\\right) = \\frac{1}{2}$.",
                ],
                a: String.raw`\frac{1}{2}`,
              },
              {
                q: "Determine whether $\\int_1^\\infty \\frac{1}{\\sqrt{x}}\\,dx$ converges or diverges.",
                steps: [
                  "$p = 1/2 \\le 1$. $\\lim_{t\\to\\infty}[2\\sqrt{x}]_1^t = \\infty$. It diverges.",
                ],
                a: String.raw`\text{diverges}`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Average value: $\\frac{1}{b-a}\\int_a^b f(x)\\,dx$.",
              "Improper integrals are defined as limits of bounded integrals.",
              "$\\int_1^\\infty x^{-p}\\,dx$ converges if and only if $p > 1$.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "diff-eq",
    no: 5,
    title: "Differential Equations",
    blurb:
      "Change that depends on itself: separable equations, exponential growth, slope fields, and Newton’s cooling.",
    status: "soon",
    lessons: [
      {
        id: "soon",
        title: "Coming soon",
        minutes: 0,
        level: "Intermediate",
        blocks: [
          {
            type: "p",
            x: "Differential equations link an unknown function directly to its own rates of change. From radioactive decay and epidemiological spread to planetary orbits and vibrating strings, this upcoming chapter will explore analytical and numerical solutions to differential systems.",
          },
        ],
      },
    ],
  },
  {
    id: "series",
    no: 6,
    title: "Sequences and Series",
    blurb:
      "Infinite sums and Taylor: convergence tests, power series, and approximating functions with polynomials.",
    status: "soon",
    lessons: [
      {
        id: "soon",
        title: "Coming soon",
        minutes: 0,
        level: "Advanced",
        blocks: [
          {
            type: "p",
            x: "Can infinitely many numbers add up to a finite total? This upcoming chapter dives into convergence tests, geometric and harmonic series, power series, and Taylor/Maclaurin series expansions that enable modern computer calculators.",
          },
        ],
      },
    ],
  },
  {
    id: "multivariable",
    no: 7,
    title: "Multivariable Calculus",
    blurb:
      "Calculus in more than one variable: partial derivatives, gradients, double integrals, and vector fields.",
    status: "soon",
    lessons: [
      {
        id: "soon",
        title: "Coming soon",
        minutes: 0,
        level: "Advanced",
        blocks: [
          {
            type: "p",
            x: "Real-world physical systems operate in 3D space with multiple inputs. This upcoming chapter explores partial derivatives, gradient vectors, tangent planes, Lagrange multipliers, and surface integrals.",
          },
        ],
      },
    ],
  },
  {
    id: "linear-algebra",
    no: 8,
    title: "Linear Algebra",
    blurb:
      "Vectors, matrices, eigenvalues: transformations, systems of equations, and the geometry of high dimensions.",
    status: "soon",
    lessons: [
      {
        id: "soon",
        title: "Coming soon",
        minutes: 0,
        level: "Beginner",
        blocks: [
          {
            type: "p",
            x: "Linear algebra is the mathematical language of quantum mechanics, graphics engines, and machine learning. This upcoming chapter will cover matrix transformations, determinants, vector spaces, and eigenvalues.",
          },
        ],
      },
    ],
  },
];
