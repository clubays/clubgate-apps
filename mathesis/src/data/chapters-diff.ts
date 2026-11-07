import { Chapter } from "../types/curriculum";

export const CHAPTERS_DIFF: Chapter[] = [
  {
    id: "diff",
    no: 1,
    title: "Differentiation",
    blurb:
      "How fast is it changing? Master limits, slopes, tangents, and the algebra of change.",
    status: "ready",
    lessons: [
      {
        id: "derivative",
        title: "Rate of change and the derivative",
        minutes: 14,
        level: "Beginner",
        widget: {
          id: "secant",
          caption:
            "Drag h toward 0 to watch the secant line snap to the true tangent.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "Imagine driving down a highway. Your speedometer does not report how far you have travelled over the past hour; it reports your instantaneous velocity right now, in this single split-second. But how can anything move in a single instant of time? If zero seconds elapse, you travel zero distance, yielding the indeterminate fraction 0/0.",
          },
          {
            type: "p",
            x: "Calculus resolves this paradox by stepping back. We first calculate the average speed over a tiny window of time $h$. Then, we observe what that average approaches as $h$ shrinks toward zero. That limiting value is the derivative.",
          },
          {
            type: "callout",
            k: "definition",
            title: "The Derivative at a Point",
            x: "The derivative $f'(x)$ represents the instantaneous rate of change of $f$ with respect to $x$, defined as the limit of the secant slopes as the interval $h$ approaches zero.",
          },
          {
            type: "eq",
            x: String.raw`f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}`,
            sheet: true,
            name: "Definition of the derivative",
          },
          { type: "widget", id: "secant" },
          {
            type: "details",
            title: "Where this comes from (First Principles)",
            x: String.raw`Consider two points on the curve $y = f(x)$: the fixed point $P(x, f(x))$ and a neighbouring point $Q(x+h, f(x+h))$. The slope of the secant line connecting $P$ and $Q$ is the rise over run:
$$\text{Slope}_{PQ} = \frac{\Delta y}{\Delta x} = \frac{f(x+h) - f(x)}{h}$$
As $Q$ slides along the curve toward $P$, $h \to 0$. The secant line tilts until it coincides with the tangent line at $P$. The slope of this tangent line is precisely $f'(x)$.`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "First principles for f(x) = x²",
            steps: [
              "Write the difference quotient: $\\frac{f(x+h)-f(x)}{h} = \\frac{(x+h)^2 - x^2}{h}$.",
              "Expand the numerator: $\\frac{x^2 + 2xh + h^2 - x^2}{h} = \\frac{2xh + h^2}{h}$.",
              "Factor out $h$ and divide: $\\frac{h(2x + h)}{h} = 2x + h$ (valid for $h \\ne 0$).",
              "Take the limit as $h \\to 0$: $\\lim_{h \\to 0} (2x + h) = 2x$.",
            ],
            answer: String.raw`f'(x) = 2x`,
          },
          {
            type: "example",
            title: "Slope and tangent line of x² at x = 3",
            steps: [
              "Evaluate the derivative at $x = 3$: $m = f'(3) = 2(3) = 6$.",
              "Find the point on the curve: $y_0 = f(3) = 3^2 = 9$, so the point is $(3, 9)$.",
              "Use point-slope form: $y - 9 = 6(x - 3) = 6x - 18$.",
              "Solve for $y$: $y = 6x - 9$.",
            ],
            answer: String.raw`\text{slope } 6,\; \text{tangent } y = 6x - 9`,
          },
          {
            type: "example",
            title: "First principles for f(x) = 1/x",
            steps: [
              "Form the quotient: $\\frac{\\frac{1}{x+h} - \\frac{1}{x}}{h}$.",
              "Find a common denominator: $\\frac{x - (x+h)}{x(x+h)h} = \\frac{-h}{x(x+h)h}$.",
              "Cancel $h$: $\\frac{-1}{x(x+h)}$.",
              "Take the limit as $h \\to 0$: $\\lim_{h \\to 0} \\frac{-1}{x(x+h)} = -\\frac{1}{x^2}$.",
            ],
            answer: String.raw`-\frac{1}{x^2}`,
          },
          {
            type: "mistakes",
            items: [
              "Dividing by zero before simplifying: never plug in $h=0$ into $\\frac{f(x+h)-f(x)}{h}$ directly without cancelling $h$ first.",
              "Confusing average rate with instantaneous rate: $\\frac{f(b)-f(a)}{b-a}$ is over an interval; the derivative is at a single point.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Find the derivative of $f(x) = 3x + 2$ from first principles.",
                steps: [
                  "$\\frac{(3(x+h)+2) - (3x+2)}{h} = \\frac{3h}{h} = 3$. Taking $h \\to 0$ gives $3$.",
                ],
                a: String.raw`3`,
              },
              {
                q: "Differentiate $f(x) = x^2 + x$ from first principles.",
                steps: [
                  "$\\frac{(x+h)^2 + (x+h) - (x^2 + x)}{h} = \\frac{2xh + h^2 + h}{h} = 2x + h + 1$. Limit is $2x + 1$.",
                ],
                a: String.raw`2x + 1`,
              },
              {
                q: "Calculate the average rate of change of $f(x) = x^3$ on the interval $[1, 3]$.",
                steps: [
                  "$\\frac{f(3)-f(1)}{3-1} = \\frac{27 - 1}{2} = \\frac{26}{2} = 13$.",
                ],
                a: String.raw`13`,
              },
              {
                q: "A ball travels $s(t) = 5t^2$ metres. Find its instantaneous velocity at $t = 2$ s.",
                steps: [
                  "$v(t) = s'(t) = 10t$. At $t=2$, $v(2) = 10(2) = 20$ m/s.",
                ],
                a: String.raw`20\text{ m/s}`,
              },
              {
                q: "Find the derivative of $f(x) = \\sqrt{x}$ from first principles by multiplying by the conjugate.",
                steps: [
                  "$\\frac{\\sqrt{x+h}-\\sqrt{x}}{h} \\cdot \\frac{\\sqrt{x+h}+\\sqrt{x}}{\\sqrt{x+h}+\\sqrt{x}} = \\frac{(x+h)-x}{h(\\sqrt{x+h}+\\sqrt{x})} = \\frac{1}{\\sqrt{x+h}+\\sqrt{x}} \\to \\frac{1}{2\\sqrt{x}}$.",
                ],
                a: String.raw`\frac{1}{2\sqrt{x}}`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "The secant line connects two points; the tangent line touches at one point.",
              "The derivative is the limit of the difference quotient as the interval $h$ tends to 0.",
              "Graphically, the derivative is the exact slope of the tangent line to the curve.",
            ],
          },
        ],
      },
      {
        id: "power-rule",
        title: "Power rule and basic rules",
        minutes: 12,
        level: "Beginner",
        widget: {
          id: "tangent",
          props: { preset: "x2" },
          caption:
            "Drag along the curve to see the tangent slope match the derivative rule.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "Evaluating difference quotients with algebra every time is slow and exhausting. Fortunately, polynomial functions follow clean algebraic patterns. By observing the derivatives of $x^1, x^2, x^3, x^4$, a universal shortcut emerges: bring the power down as a multiplier and reduce the exponent by one.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "The Power Rule",
            x: "For any real exponent $n$, the derivative of $x^n$ is $n x^{n-1}$. Differentiation is linear: constants factor out, and sums differentiate term by term.",
          },
          {
            type: "eq",
            x: String.raw`\frac{d}{dx} x^n = n x^{n-1}`,
            sheet: true,
            name: "Power Rule",
          },
          { type: "widget", id: "tangent", props: { preset: "x2" } },
          {
            type: "details",
            title: "Where this comes from (Binomial Theorem)",
            x: String.raw`Using the definition of the derivative for $f(x) = x^n$:
$$\lim_{h\to0} \frac{(x+h)^n - x^n}{h}$$
By the binomial expansion: $(x+h)^n = x^n + n x^{n-1}h + \frac{n(n-1)}{2}x^{n-2}h^2 + \dots$
Subtracting $x^n$ and dividing each remaining term by $h$:
$$\frac{n x^{n-1}h + \mathcal{O}(h^2)}{h} = n x^{n-1} + \mathcal{O}(h)$$
As $h \to 0$, all terms with higher powers of $h$ vanish, leaving $n x^{n-1}$.`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Differentiate 5x⁴ − 3x² + 7",
            steps: [
              "Apply the power rule term by term: $\\frac{d}{dx}(5x^4) = 5 \\cdot 4x^3 = 20x^3$.",
              "Next term: $\\frac{d}{dx}(-3x^2) = -3 \\cdot 2x = -6x$.",
              "The derivative of the constant $7$ is $0$.",
              "Combine terms: $20x^3 - 6x$.",
            ],
            answer: String.raw`20x^3 - 6x`,
          },
          {
            type: "example",
            title: "Differentiate √(x) + 1/x²",
            steps: [
              "Rewrite using fractional and negative powers: $x^{1/2} + x^{-2}$.",
              "Differentiate $x^{1/2}$: $\\frac{1}{2}x^{1/2 - 1} = \\frac{1}{2}x^{-1/2} = \\frac{1}{2\\sqrt{x}}$.",
              "Differentiate $x^{-2}$: $-2x^{-2 - 1} = -2x^{-3} = -\\frac{2}{x^3}$.",
              "Combine the results.",
            ],
            answer: String.raw`\frac{1}{2\sqrt{x}} - \frac{2}{x^3}`,
          },
          {
            type: "example",
            title: "Slope of y = x³ − 3x at x = 2",
            steps: [
              "Compute the derivative: $\\frac{dy}{dx} = 3x^2 - 3$.",
              "Substitute $x = 2$: $3(2^2) - 3 = 3(4) - 3 = 12 - 3 = 9$.",
            ],
            answer: String.raw`9`,
          },
          {
            type: "mistakes",
            items: [
              "Applying the power rule to exponential functions: $\\frac{d}{dx}2^x \\ne x 2^{x-1}$. The base must be the variable and the exponent must be a constant.",
              "Forgetting that $\\frac{d}{dx}(c) = 0$: constants with no variable do not stay in the derivative.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Differentiate $7x^3 - 2x + 9$.",
                steps: ["$7(3x^2) - 2(1) + 0 = 21x^2 - 2$."],
                a: String.raw`21x^2 - 2`,
              },
              {
                q: "Differentiate $x^{5/2}$.",
                steps: ["$\\frac{5}{2}x^{5/2 - 1} = \\frac{5}{2}x^{3/2}$."],
                a: String.raw`\frac{5}{2}x^{3/2}`,
              },
              {
                q: "Differentiate $\\frac{4}{x^3}$.",
                steps: [
                  "Rewrite as $4x^{-3}$. Derivative is $4(-3x^{-4}) = -\\frac{12}{x^4}$.",
                ],
                a: String.raw`-\frac{12}{x^4}`,
              },
              {
                q: "Where is the tangent to $y = x^2 - 4x + 5$ horizontal?",
                steps: [
                  "$y' = 2x - 4 = 0 \\implies x = 2$. At $x=2$, $y = 2^2 - 4(2) + 5 = 1$. The point is $(2, 1)$.",
                ],
                a: String.raw`x = 2, \text{ point } (2, 1)`,
              },
              {
                q: "Differentiate $\\frac{x^2+1}{x}$ by simplifying first.",
                steps: [
                  "Rewrite as $\\frac{x^2}{x} + \\frac{1}{x} = x + x^{-1}$. Differentiating yields $1 - x^{-2} = 1 - \\frac{1}{x^2}$.",
                ],
                a: String.raw`1 - \frac{1}{x^2}`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Bring power down, reduce exponent by 1: $\\frac{d}{dx} x^n = n x^{n-1}$.",
              "Constant multiple rule: $(cf)' = c f'$. Sum rule: $(f + g)' = f' + g'$.",
              "Always rewrite radicals and fractions with rational and negative powers before differentiating.",
            ],
          },
        ],
      },
      {
        id: "standard",
        title: "Derivatives of standard functions",
        minutes: 12,
        level: "Beginner",
        widget: {
          id: "plotter",
          props: { initialExpr: "sin(x)" },
          caption:
            "Inspect the sine and cosine derivatives; switch between trigonometric and exponential functions.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "Beyond polynomials, calculus models natural cycles (trigonometry) and natural growth (exponentials). The exponential function $e^x$ is the crown jewel of calculus: it is the unique non-trivial function that equals its own rate of change. As for sine and cosine, differentiation acts like a 90-degree phase shift in a continuous cycle.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "Standard Derivatives",
            x: "Trigonometric and transcendental functions follow fundamental derivative rules that form the building blocks for all of physics and engineering.",
          },
          {
            type: "eq",
            x: String.raw`(\sin x)' = \cos x,\quad (\cos x)' = -\sin x,\quad (e^x)' = e^x,\quad (\ln x)' = \frac{1}{x}`,
            sheet: true,
            name: "Standard Derivatives",
          },
          { type: "widget", id: "plotter", props: { initialExpr: "sin(x)" } },
          {
            type: "details",
            title: "Where this comes from (Geometric limit of sin x / x)",
            x: String.raw`From first principles:
$$(\sin x)' = \lim_{h\to0} \frac{\sin(x+h) - \sin x}{h} = \lim_{h\to0} \frac{\sin x \cos h + \cos x \sin h - \sin x}{h}$$
Regrouping:
$$=\sin x \left(\lim_{h\to0}\frac{\cos h - 1}{h}\right) + \cos x \left(\lim_{h\to0}\frac{\sin h}{h}\right)$$
Using the fundamental geometric limits $\lim_{h\to0}\frac{\sin h}{h}=1$ and $\lim_{h\to0}\frac{\cos h - 1}{h}=0$:
$$= \sin x(0) + \cos x(1) = \cos x$$`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Differentiate 3eˣ − 2 sin x",
            steps: [
              "$(3e^x)' = 3(e^x)' = 3e^x$.",
              "$(-2\\sin x)' = -2(\\cos x)$.",
              "Combine: $3e^x - 2\\cos x$.",
            ],
            answer: String.raw`3e^x - 2\cos x`,
          },
          {
            type: "example",
            title: "Differentiate 2ˣ",
            steps: [
              "Recall that $2^x = e^{x \\ln 2}$.",
              "By the exponential rule for general base $a$: $(a^x)' = a^x \\ln a$.",
              "Substitute $a = 2$: $2^x \\ln 2$.",
            ],
            answer: String.raw`2^x \ln 2`,
          },
          {
            type: "example",
            title: "Differentiate ln x + cos x",
            steps: [
              "The derivative of $\\ln x$ is $\\frac{1}{x}$ for $x > 0$.",
              "The derivative of $\\cos x$ is $-\\sin x$.",
              "Combine: $\\frac{1}{x} - \\sin x$.",
            ],
            answer: String.raw`\frac{1}{x} - \sin x`,
          },
          {
            type: "mistakes",
            items: [
              "Missing the negative sign in the derivative of cosine: $(\\cos x)' = -\\sin x$, never $+\\sin x$.",
              "Confusing $(e^x)' = e^x$ with power rule $(x^e)' = e x^{e-1}$.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Differentiate $5\\cos x + \\ln x$.",
                steps: [
                  "$5(-\\sin x) + \\frac{1}{x} = -5\\sin x + \\frac{1}{x}$.",
                ],
                a: String.raw`-5\sin x + \frac{1}{x}`,
              },
              {
                q: "Differentiate $e^x + x^e$.",
                steps: [
                  "$(e^x)' = e^x$ and $(x^e)' = e x^{e-1}$ by the power rule.",
                ],
                a: String.raw`e^x + e\,x^{e-1}`,
              },
              {
                q: "Differentiate $3^x$.",
                steps: ["Using $(a^x)' = a^x \\ln a$, we get $3^x \\ln 3$."],
                a: String.raw`3^x \ln 3`,
              },
              {
                q: "Find the slope of $y = \\sin x$ at $x = \\pi/3$.",
                steps: [
                  "$y' = \\cos x$. At $x = \\pi/3$, $\\cos(\\pi/3) = 1/2$.",
                ],
                a: String.raw`\frac{1}{2}`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Exponential: $(e^x)' = e^x$, $(a^x)' = a^x \\ln a$.",
              "Logarithmic: $(\\ln x)' = 1/x$.",
              "Trigonometric: $(\\sin x)' = \\cos x$, $(\\cos x)' = -\\sin x$.",
            ],
          },
        ],
      },
      {
        id: "product-quotient",
        title: "Product and quotient rules",
        minutes: 15,
        level: "Intermediate",
        widget: {
          id: "derivlab",
          props: { mode: "derivative", preset: "x^2*sin(x)" },
          caption:
            "Test your product and quotient rule derivatives in the interactive verification lab.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "A common early misconception is that the derivative of a product is the product of the derivatives. If that were true, the derivative of $x \\cdot x = x^2$ would be $1 \\cdot 1 = 1$, which contradicts $2x$.",
          },
          {
            type: "p",
            x: "Think of the area of an expanding rectangle with sides $u$ and $v$: $\\text{Area} = uv$. If both sides grow by small increments $\\Delta u$ and $\\Delta v$, the new area gains two strips: one strip of area $u \\Delta v$ and another of area $v \\Delta u$. Thus, the rate of change is $u'v + uv'$.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "Product and Quotient Rules",
            x: "The product of two functions differentiates as the sum of each function multiplied by the other’s derivative. The quotient rule follows from dividing rates.",
          },
          {
            type: "eq",
            x: String.raw`(uv)' = u'v + uv',\qquad \left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^2}`,
            sheet: true,
            name: "Product and Quotient Rules",
          },
          {
            type: "widget",
            id: "derivlab",
            props: { mode: "derivative", preset: "x^2*sin(x)" },
          },
          {
            type: "details",
            title: "Where this comes from (Rectangle expansion proof)",
            x: String.raw`Consider $\Delta(uv) = (u + \Delta u)(v + \Delta v) - uv = u \Delta v + v \Delta u + \Delta u \Delta v$.
Dividing by $\Delta x$:
$$\frac{\Delta(uv)}{\Delta x} = u \frac{\Delta v}{\Delta x} + v \frac{\Delta u}{\Delta x} + \Delta u \frac{\Delta v}{\Delta x}$$
As $\Delta x \to 0$, $\Delta u \to 0$, so the cross-term vanishes, leaving $(uv)' = u v' + v u'$.`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Differentiate x² sin x",
            steps: [
              "Let $u = x^2$ and $v = \\sin x$.",
              "Differentiate each: $u' = 2x$, $v' = \\cos x$.",
              "Apply the product rule: $u'v + uv' = (2x)(\\sin x) + (x^2)(\\cos x)$.",
            ],
            answer: String.raw`2x\sin x + x^2\cos x`,
          },
          {
            type: "example",
            title: "Differentiate eˣ / x",
            steps: [
              "Let $u = e^x$ and $v = x$. Then $u' = e^x$ and $v' = 1$.",
              "Apply quotient rule: $\\frac{u'v - uv'}{v^2} = \\frac{(e^x)(x) - (e^x)(1)}{x^2}$.",
              "Factor out $e^x$: $\\frac{e^x(x - 1)}{x^2}$.",
            ],
            answer: String.raw`\frac{e^x(x-1)}{x^2}`,
          },
          {
            type: "example",
            title: "Derive (tan x)′ from sin x / cos x",
            steps: [
              "Set $u = \\sin x$, $v = \\cos x$. Then $u' = \\cos x$, $v' = -\\sin x$.",
              "Quotient rule: $\\frac{(\\cos x)(\\cos x) - (\\sin x)(-\\sin x)}{\\cos^2 x}$.",
              "Simplify numerator: $\\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x} = \\sec^2 x$.",
            ],
            answer: String.raw`\sec^2 x`,
          },
          {
            type: "mistakes",
            items: [
              "Subtracting in the wrong order in quotient rule: it is $(u'v - uv')/v^2$, never $(uv' - u'v)/v^2$.",
              "Forgetting to square the denominator $v^2$ in the quotient rule.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Differentiate $x^3 e^x$.",
                steps: [
                  "$u=x^3, v=e^x \\implies 3x^2 e^x + x^3 e^x = x^2 e^x(x + 3)$.",
                ],
                a: String.raw`x^2 e^x(x+3)`,
              },
              {
                q: "Differentiate $\\frac{x+1}{x-1}$.",
                steps: [
                  "$\\frac{(1)(x-1) - (x+1)(1)}{(x-1)^2} = \\frac{x - 1 - x - 1}{(x-1)^2} = -\\frac{2}{(x-1)^2}$.",
                ],
                a: String.raw`-\frac{2}{(x-1)^2}`,
              },
              {
                q: "Differentiate $x \\ln x$.",
                steps: ["$(1)(\\ln x) + x(1/x) = \\ln x + 1$."],
                a: String.raw`\ln x + 1`,
              },
              {
                q: "Differentiate $\\sin x \\cos x$.",
                steps: [
                  "$(\\cos x)(\\cos x) + (\\sin x)(-\\sin x) = \\cos^2 x - \\sin^2 x = \\cos 2x$.",
                ],
                a: String.raw`\cos^2 x - \sin^2 x = \cos 2x`,
              },
              {
                q: "Differentiate $\\frac{x^2}{x^2+1}$.",
                steps: [
                  "$\\frac{2x(x^2+1) - x^2(2x)}{(x^2+1)^2} = \\frac{2x^3 + 2x - 2x^3}{(x^2+1)^2} = \\frac{2x}{(x^2+1)^2}$.",
                ],
                a: String.raw`\frac{2x}{(x^2+1)^2}`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Product: $(uv)' = u'v + uv'$.",
              "Quotient: $(u/v)' = (u'v - uv') / v^2$.",
              'Remember mnemonic: "Low d-High minus High d-Low, over the square of what is below".',
            ],
          },
        ],
      },
      {
        id: "chain-rule",
        title: "The chain rule",
        minutes: 16,
        level: "Intermediate",
        widget: {
          id: "chain",
          caption:
            "Adjust x to see how rate multipliers cascade: outer rate g′(u) times inner rate u′(x).",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "Imagine three gears meshed in a train: gear A turns gear B, which turns gear C. If gear A turns 3 times faster than B, and gear B turns 4 times faster than C, then gear A turns $3 \\times 4 = 12$ times faster than gear C. Rates of change multiply through composition.",
          },
          {
            type: "p",
            x: "When functions are nested, $y = f(g(x))$, we differentiate the outer layer with respect to the inside, and multiply by the derivative of the inside layer.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "The Chain Rule",
            x: "If $y = f(u)$ and $u = g(x)$, the overall derivative is the product of the intermediate derivatives.",
          },
          {
            type: "eq",
            x: String.raw`\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx},\qquad [f(g(x))]' = f'(g(x)) \, g'(x)`,
            sheet: true,
            name: "Chain Rule",
          },
          { type: "widget", id: "chain" },
          {
            type: "details",
            title: "Where this comes from (Ratio of small changes)",
            x: String.raw`For small non-zero increments $\Delta x$, let $\Delta u = g(x+\Delta x) - g(x)$ and $\Delta y = f(u+\Delta u) - f(u)$.
$$\frac{\Delta y}{\Delta x} = \frac{\Delta y}{\Delta u} \cdot \frac{\Delta u}{\Delta x}$$
Taking the limit as $\Delta x \to 0$ (which forces $\Delta u \to 0$ by continuity of $g$):
$$\lim_{\Delta x \to 0} \frac{\Delta y}{\Delta x} = \left(\lim_{\Delta u \to 0} \frac{\Delta y}{\Delta u}\right) \cdot \left(\lim_{\Delta x \to 0} \frac{\Delta u}{\Delta x}\right) = \frac{dy}{du} \cdot \frac{du}{dx}$$`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Differentiate (3x + 1)⁵",
            steps: [
              "Let $u = 3x + 1$, so $y = u^5$.",
              "Outer derivative: $\\frac{dy}{du} = 5u^4$.",
              "Inner derivative: $\\frac{du}{dx} = 3$.",
              "Multiply together: $5(3x+1)^4 \\cdot 3 = 15(3x+1)^4$.",
            ],
            answer: String.raw`15(3x+1)^4`,
          },
          {
            type: "example",
            title: "Differentiate sin(x²)",
            steps: [
              "Outer function: $\\sin(u)$ with derivative $\\cos(u)$.",
              "Inner function: $u = x^2$ with derivative $2x$.",
              "Chain rule: $\\cos(x^2) \\cdot 2x = 2x\\cos(x^2)$.",
            ],
            answer: String.raw`2x\cos(x^2)`,
          },
          {
            type: "example",
            title: "Differentiate e^(−x²)",
            steps: [
              "Outer function: $e^u$ with derivative $e^u$.",
              "Inner function: $u = -x^2$ with derivative $-2x$.",
              "Product: $e^{-x^2} \\cdot (-2x) = -2xe^{-x^2}$.",
              "Note: similarly, $(\\ln(x^2+1))' = \\frac{1}{x^2+1} \\cdot 2x = \\frac{2x}{x^2+1}$.",
            ],
            answer: String.raw`-2xe^{-x^2}`,
          },
          {
            type: "mistakes",
            items: [
              "Forgetting to multiply by the inside derivative: writing $(\\sin(x^2))' = \\cos(x^2)$ instead of $2x\\cos(x^2)$.",
              "Differentiating the inside prematurely: writing $(\\sin(x^2))' = \\cos(2x)$ is invalid.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Differentiate $(2x - 5)^7$.",
                steps: ["$7(2x-5)^6 \\cdot 2 = 14(2x-5)^6$."],
                a: String.raw`14(2x-5)^6`,
              },
              {
                q: "Differentiate $\\cos 3x$.",
                steps: ["$-\\sin(3x) \\cdot 3 = -3\\sin 3x$."],
                a: String.raw`-3\sin 3x`,
              },
              {
                q: "Differentiate $\\sqrt{x^2+4}$.",
                steps: [
                  "$\\frac{1}{2\\sqrt{x^2+4}} \\cdot 2x = \\frac{x}{\\sqrt{x^2+4}}$.",
                ],
                a: String.raw`\frac{x}{\sqrt{x^2+4}}`,
              },
              {
                q: "Differentiate $e^{\\sin x}$.",
                steps: [
                  "$e^{\\sin x} \\cdot \\cos x = \\cos x\\, e^{\\sin x}$.",
                ],
                a: String.raw`\cos x\,e^{\sin x}`,
              },
              {
                q: "Differentiate $\\sin^2 x$.",
                steps: [
                  "$2\\sin x \\cdot (\\sin x)' = 2\\sin x \\cos x = \\sin 2x$.",
                ],
                a: String.raw`2\sin x\cos x = \sin 2x`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Work from outside in: differentiate outer, leave inside alone, multiply by inside derivative.",
              "Leibniz notation: $\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$.",
              "General power rule: $[g(x)^n]' = n g(x)^{n-1} g'(x)$.",
            ],
          },
        ],
      },
      {
        id: "implicit",
        title: "Implicit differentiation",
        minutes: 14,
        level: "Intermediate",
        widget: {
          id: "circle",
          caption:
            "Rotate the angle θ around the circle x² + y² = 25 to observe dy/dx = −x/y.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "Many geometric curves cannot be written as a single function $y = f(x)$. For example, a circle $x^2 + y^2 = 25$ fails the vertical line test: for every $x$, there are two $y$ values. Must we split it into separate top and bottom square-root functions?",
          },
          {
            type: "p",
            x: "No. Implicit differentiation treats $y$ as an implicit function of $x$. We differentiate both sides of the equation with respect to $x$, using the chain rule on any term containing $y$ (giving a factor of $y'$), and then algebraically isolate $y'$.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "Implicit Differentiation",
            x: "Differentiate both sides with respect to $x$, applying the chain rule: $\\frac{d}{dx}[y^n] = n y^{n-1} \\frac{dy}{dx}$. Group all $\\frac{dy}{dx}$ terms on one side and solve.",
          },
          {
            type: "eq",
            x: String.raw`\frac{d}{dx} [y^2] = 2y \frac{dy}{dx},\qquad x^2 + y^2 = R^2 \implies \frac{dy}{dx} = -\frac{x}{y}`,
            sheet: true,
            name: "Implicit Rule for Circle",
          },
          { type: "widget", id: "circle" },
          {
            type: "details",
            title: "Where this comes from (Chain rule on dependent variables)",
            x: String.raw`Since $y = y(x)$, any expression $F(y)$ is a composite function $F(y(x))$.
By the chain rule:
$$\frac{d}{dx}[F(y)] = F'(y) \frac{dy}{dx}$$
Differentiating $x^2 + y^2 = 25$ with respect to $x$:
$$\frac{d}{dx}[x^2] + \frac{d}{dx}[y^2] = \frac{d}{dx}[25] \implies 2x + 2y y' = 0 \implies y' = -\frac{x}{y}$$`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Slope of x² + y² = 25 at (3, 4)",
            steps: [
              "Differentiate implicitly: $2x + 2y y' = 0 \\implies y' = -\\frac{x}{y}$.",
              "Substitute $(x, y) = (3, 4)$: $y' = -\\frac{3}{4}$.",
              "The tangent slope is $-3/4$.",
            ],
            answer: String.raw`y' = -\frac{x}{y},\; \text{slope at } (3,4) \text{ is } -\frac{3}{4}`,
          },
          {
            type: "example",
            title: "Differentiate x³ + y³ = 6xy (Folium of Descartes)",
            steps: [
              "Differentiate left side: $3x^2 + 3y^2 y'$.",
              "Differentiate right side using product rule: $6(1 \\cdot y + x \\cdot y') = 6y + 6x y'$.",
              "Equate: $3x^2 + 3y^2 y' = 6y + 6x y'$. Divide by 3: $x^2 + y^2 y' = 2y + 2x y'$.",
              "Group $y'$ terms: $y'(y^2 - 2x) = 2y - x^2 \\implies y' = \\frac{2y - x^2}{y^2 - 2x}$.",
            ],
            answer: String.raw`y' = \frac{2y - x^2}{y^2 - 2x}`,
          },
          {
            type: "example",
            title: "Differentiate sin y = x to find the derivative of arcsin",
            steps: [
              "Differentiate both sides with respect to $x$: $\\cos(y) \\cdot y' = 1$.",
              "Solve for $y'$: $y' = \\frac{1}{\\cos y}$.",
              "Since $\\cos^2 y + \\sin^2 y = 1$ and $\\sin y = x$, $\\cos y = \\sqrt{1 - x^2}$.",
              "Substitute back: $y' = \\frac{1}{\\sqrt{1-x^2}}$.",
            ],
            answer: String.raw`y' = \frac{1}{\cos y} = \frac{1}{\sqrt{1-x^2}}`,
          },
          {
            type: "mistakes",
            items: [
              "Missing the $y'$ factor when differentiating $y$: $\\frac{d}{dx}[y^2] = 2y y'$, not simply $2y$.",
              "Failing to use the product rule on mixed terms like $xy$: $\\frac{d}{dx}[xy] = y + x y'$.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Find the slope of $x^2 + y^2 = 25$ at $(-4, 3)$.",
                steps: ["$y' = -x/y = -(-4)/3 = 4/3$."],
                a: String.raw`\frac{4}{3}`,
              },
              {
                q: "Find $\\frac{dy}{dx}$ for $xy = 1$ via implicit differentiation.",
                steps: [
                  "$1 \\cdot y + x y' = 0 \\implies y' = -y/x$. Since $y = 1/x$, $y' = -\\frac{1/x}{x} = -\\frac{1}{x^2}$.",
                ],
                a: String.raw`-\frac{1}{x^2}`,
              },
              {
                q: "Find $y'$ for $x^2 + xy + y^2 = 7$.",
                steps: [
                  "$2x + (y + xy') + 2y y' = 0 \\implies y'(x + 2y) = -(2x + y) \\implies y' = -\\frac{2x+y}{x+2y}$.",
                ],
                a: String.raw`y' = -\frac{2x+y}{x+2y}`,
              },
              {
                q: "Find the equation of the tangent line to $x^2 + y^2 = 25$ at $(3, 4)$.",
                steps: [
                  "$m = -3/4$. Line: $y - 4 = -\\frac{3}{4}(x - 3) \\implies 4y - 16 = -3x + 9 \\implies 3x + 4y = 25$.",
                ],
                a: String.raw`3x + 4y = 25`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Implicit differentiation handles curves where $y$ cannot easily be isolated.",
              "Every time you differentiate a term with $y$, attach $\\frac{dy}{dx}$ via the chain rule.",
              "Solve algebraically for $\\frac{dy}{dx}$ at the end.",
            ],
          },
        ],
      },
      {
        id: "higher-order",
        title: "Higher-order derivatives",
        minutes: 10,
        level: "Intermediate",
        widget: {
          id: "plotter",
          props: { initialExpr: "x^4 - 3x^2 + 2", showFDoublePrime: true },
          caption:
            "Blue: f(x); Green: f′(x); Amber: f″(x). Watch inflection points where f″ crosses zero.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "Because the derivative $f'(x)$ is itself a function, we can differentiate it again. The second derivative $f''(x)$ tells us how the slope itself is changing. In physics, if position is $s(t)$, the first derivative is velocity $v(t)$, and the second derivative is acceleration $a(t)$.",
          },
          {
            type: "p",
            x: "Geometrically, $f''(x)$ measures concavity: whether the curve bends upward like a cup ($f'' > 0$) or downward like an umbrella ($f'' < 0$). Points where concavity changes are inflection points.",
          },
          {
            type: "callout",
            k: "definition",
            title: "Second and Higher Derivatives",
            x: "The $n$-th derivative $f^{(n)}(x)$ is obtained by iteratively differentiating $n$ times. Notations include $f''(x), \\frac{d^2y}{dx^2}$, and $f^{(n)}(x)$.",
          },
          {
            type: "eq",
            x: String.raw`f''(x) = \frac{d}{dx}[f'(x)] = \frac{d^2 y}{dx^2}`,
            sheet: true,
            name: "Second Derivative",
          },
          {
            type: "widget",
            id: "plotter",
            props: { initialExpr: "x^4 - 3x^2 + 2", showFDoublePrime: true },
          },
          {
            type: "details",
            title: "Where this comes from (Physical acceleration)",
            x: String.raw`When you step on the gas pedal in a car, your position $s(t)$ changes.
Your speedometer reads the first derivative $v(t) = s'(t)$.
The force you feel pressing you back into your seat is proportional to acceleration:
$$a(t) = v'(t) = \frac{d}{dt}\left[\frac{ds}{dt}\right] = \frac{d^2 s}{dt^2}$$`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "First three derivatives of x⁴ − 3x² + 2",
            steps: [
              "First derivative: $f'(x) = 4x^3 - 6x$.",
              "Second derivative: $f''(x) = \\frac{d}{dx}(4x^3 - 6x) = 12x^2 - 6$.",
              "Third derivative: $f'''(x) = \\frac{d}{dx}(12x^2 - 6) = 24x$.",
            ],
            answer: String.raw`f' = 4x^3 - 6x,\; f'' = 12x^2 - 6,\; f''' = 24x`,
          },
          {
            type: "example",
            title: "Motion: s(t) = t³ − 6t² + 9t. When is acceleration zero?",
            steps: [
              "Velocity: $v(t) = s'(t) = 3t^2 - 12t + 9$.",
              "Acceleration: $a(t) = v'(t) = 6t - 12$.",
              "Set $a(t) = 0$: $6t - 12 = 0 \\implies 6t = 12 \\implies t = 2$.",
            ],
            answer: String.raw`v = 3t^2 - 12t + 9,\; a = 6t - 12,\; a = 0 \text{ at } t = 2`,
          },
          {
            type: "example",
            title: "Cycles of sin x and exponential eˣ",
            steps: [
              "For $\\sin x$: $f' = \\cos x$, $f'' = -\\sin x$, $f''' = -\\cos x$, $f^{(4)} = \\sin x$. It repeats in a 4-step cycle.",
              "For $e^x$: $\\frac{d^n}{dx^n} e^x = e^x$ for all $n$.",
            ],
            answer: String.raw`\text{cycle of } \sin x \text{ of period 4, and } \frac{d^n}{dx^n}e^x = e^x`,
          },
          {
            type: "mistakes",
            items: [
              "Confusing notation: $f^{(2)}$ means second derivative, not $f(x)^2$ (the square of $f$).",
              "Assuming $f''(x)=0$ always guarantees an inflection point: $y = x^4$ has $y''(0)=0$ but does not change concavity.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Find $f''(x)$ for $f(x) = x^5$.",
                steps: ["$f' = 5x^4 \\implies f'' = 20x^3$."],
                a: String.raw`20x^3`,
              },
              {
                q: "Find $f''(x)$ for $f(x) = e^{2x}$.",
                steps: ["$f' = 2e^{2x} \\implies f'' = 4e^{2x}$."],
                a: String.raw`4e^{2x}`,
              },
              {
                q: "Find $f''(x)$ for $f(x) = \\sin 3x$.",
                steps: ["$f' = 3\\cos 3x \\implies f'' = -9\\sin 3x$."],
                a: String.raw`-9\sin 3x`,
              },
              {
                q: "For $s = 2t^3 - 9t^2 + 12t$, find when acceleration is zero.",
                steps: [
                  "$v = 6t^2 - 18t + 12 \\implies a = 12t - 18$. Setting $12t - 18 = 0$ gives $t = 18/12 = 3/2$.",
                ],
                a: String.raw`a = 12t - 18,\; t = \frac{3}{2}`,
              },
              {
                q: "Find the 4th derivative $f^{(4)}(x)$ of $\\cos x$.",
                steps: [
                  "$(\\cos x)' = -\\sin x \\to -\\cos x \\to \\sin x \\to \\cos x$.",
                ],
                a: String.raw`\cos x`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Second derivative $f''$ is the rate of change of $f'$.",
              "Concave up: $f'' > 0$; Concave down: $f'' < 0$.",
              "Position $s(t) \\to$ Velocity $v(t) = s'(t) \\to$ Acceleration $a(t) = s''(t)$.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "applications",
    no: 2,
    title: "Applications of Differentiation",
    blurb:
      "Using the derivative: tangents, normals, curve sketching, extreme values, optimisation, and related rates.",
    status: "ready",
    lessons: [
      {
        id: "tangents-normals",
        title: "Tangents and normals",
        minutes: 10,
        level: "Beginner",
        widget: {
          id: "tangent",
          props: { preset: "x2" },
          caption:
            "The tangent line touches the curve; the normal line intersects perpendicularly.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "When a car rounds a sharp bend on a wet road and slips on ice, it skids in the exact direction of the tangent line. The tangent line is the best linear approximation to the curve at a point.",
          },
          {
            type: "p",
            x: "Perpendicular to this direction is the normal line. In optics, reflection and refraction (Snell’s law) are always measured relative to the surface normal.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "Normal Line Equation",
            x: "If a curve has tangent slope $m = f'(x_0) \\ne 0$, its perpendicular normal line has slope $m_{\\text{normal}} = -1/m$.",
          },
          {
            type: "eq",
            x: String.raw`y - y_0 = m(x - x_0),\qquad y - y_0 = -\frac{1}{m}(x - x_0)`,
            sheet: true,
            name: "Tangent and Normal Equations",
          },
          { type: "widget", id: "tangent", props: { preset: "x2" } },
          {
            type: "details",
            title: "Where this comes from (Perpendicular gradient condition)",
            x: String.raw`Two lines with non-zero slopes $m_1$ and $m_2$ are perpendicular if and only if $m_1 m_2 = -1$.
Therefore:
$$m_{\text{normal}} = -\frac{1}{m_{\text{tangent}}} = -\frac{1}{f'(x_0)}$$`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Tangent and normal to y = x² at x = 1",
            steps: [
              "Point: $x_0 = 1, y_0 = 1^2 = 1$, so $(1, 1)$.",
              "Derivative: $y' = 2x$. At $x=1$, $m = 2(1) = 2$.",
              "Tangent line: $y - 1 = 2(x - 1) \\implies y = 2x - 1$.",
              "Normal slope: $m_{\\perp} = -1/2$.",
              "Normal line: $y - 1 = -\\frac{1}{2}(x - 1) \\implies y = -\\frac{x}{2} + \\frac{3}{2}$.",
            ],
            answer: String.raw`\text{tangent } y = 2x - 1,\; \text{normal } y = -\frac{x}{2} + \frac{3}{2}`,
          },
          {
            type: "example",
            title: "Horizontal tangents of x³ − 3x",
            steps: [
              "Horizontal tangents occur where slope $f'(x) = 0$.",
              "Compute derivative: $f'(x) = 3x^2 - 3$.",
              "Solve $3x^2 - 3 = 0 \\implies x^2 = 1 \\implies x = \\pm 1$.",
            ],
            answer: String.raw`x = \pm 1`,
          },
          {
            type: "mistakes",
            items: [
              "Forgetting the negative in negative reciprocal: the normal slope is $-1/m$, not $1/m$.",
              "At points with horizontal tangents ($m=0$), the normal line is vertical: $x = x_0$.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Find the equation of the tangent line to $y = x^3$ at $x = 1$.",
                steps: [
                  "$y_0 = 1$. $y' = 3x^2 \\implies m = 3$. Equation: $y - 1 = 3(x - 1) \\implies y = 3x - 2$.",
                ],
                a: String.raw`y = 3x - 2`,
              },
              {
                q: "Find the equation of the normal line to $y = \\sqrt{x}$ at $x = 4$.",
                steps: [
                  "$y_0 = 2$. $y' = \\frac{1}{2\\sqrt{x}} \\implies m = \\frac{1}{4}$. Normal slope $m_\\perp = -4$. Equation: $y - 2 = -4(x - 4) \\implies y = -4x + 18$.",
                ],
                a: String.raw`y = -4x + 18`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Tangent line matches the instantaneous slope of the curve.",
              "Normal line is perpendicular to the tangent ($m_\\perp = -1/m$).",
              "Horizontal tangent when $f'(x) = 0$; vertical tangent when $f'(x)$ is undefined.",
            ],
          },
        ],
      },
      {
        id: "extrema",
        title: "Increasing, decreasing, maxima and minima",
        minutes: 16,
        level: "Intermediate",
        widget: {
          id: "extrema",
          caption:
            "Observe the sign of f′: green where f′>0 (rising), red where f′<0 (falling).",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "If you hike along a mountain ridge, you know you have reached a summit when the trail stops going up and starts going down. At the exact peak, your slope is zero.",
          },
          {
            type: "p",
            x: "In calculus, critical points occur where $f'(x) = 0$ or $f'(x)$ does not exist. By inspecting whether $f'$ changes from positive to negative (or vice-versa), we determine local extrema.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "First and Second Derivative Tests",
            x: "First Derivative Test: if $f'$ flips from $+$ to $-$, $f$ has a local maximum; from $-$ to $+$, a local minimum. Second Derivative Test: if $f'(c)=0$ and $f''(c)<0$, $c$ is a local maximum; if $f''(c)>0$, a local minimum.",
          },
          {
            type: "eq",
            x: String.raw`f'(c) = 0 \text{ and } f''(c) < 0 \implies \text{local max};\quad f'(c) = 0 \text{ and } f''(c) > 0 \implies \text{local min}`,
            sheet: true,
            name: "Second Derivative Test",
          },
          { type: "widget", id: "extrema" },
          {
            type: "details",
            title: "Where this comes from (Taylor polynomial sketch)",
            x: String.raw`Near a critical point $c$ where $f'(c) = 0$, the quadratic approximation is:
$$f(c + h) \approx f(c) + f'(c)h + \frac{1}{2}f''(c)h^2 = f(c) + \frac{1}{2}f''(c)h^2$$
If $f''(c) < 0$, then $\frac{1}{2}f''(c)h^2 < 0$ for all small $h \ne 0$, so $f(c+h) < f(c)$, establishing a local maximum.`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Extrema of f(x) = x³ − 3x",
            steps: [
              "Differentiate: $f'(x) = 3x^2 - 3$.",
              "Set $3x^2 - 3 = 0 \\implies x = \\pm 1$.",
              "Second derivative: $f''(x) = 6x$.",
              "At $x = -1$: $f''(-1) = -6 < 0 \\implies$ local maximum with value $f(-1) = (-1)^3 - 3(-1) = 2$.",
              "At $x = 1$: $f''(1) = 6 > 0 \\implies$ local minimum with value $f(1) = 1 - 3 = -2$.",
            ],
            answer: String.raw`f' = 3x^2 - 3,\; \max \text{ at } x = -1 \text{ (val } 2),\; \min \text{ at } x = 1 \text{ (val } -2)`,
          },
          {
            type: "example",
            title: "Extrema of f(x) = x⁴ − 4x³",
            steps: [
              "Differentiate: $f'(x) = 4x^3 - 12x^2 = 4x^2(x - 3)$.",
              "Critical points: $x = 0$ and $x = 3$.",
              "Test sign around $x = 0$: for $x < 0$, $f' < 0$; for $0 < x < 3$, $f' < 0$. No sign change at $x = 0$, so no extremum!",
              "Test sign around $x = 3$: for $x < 3$, $f' < 0$; for $x > 3$, $f' > 0$. Sign changes from $-$ to $+$, so local minimum.",
              "Value at $x = 3$: $f(3) = 3^4 - 4(3^3) = 81 - 108 = -27$.",
            ],
            answer: String.raw`f' = 4x^2(x-3);\; x = 0 \text{ no extremum},\; x = 3 \text{ min with value } -27`,
          },
          {
            type: "mistakes",
            items: [
              "Assuming $f'(c)=0$ always creates an extremum: $y = x^3$ has $y'(0)=0$, but $x=0$ is a saddle/inflection, not a max or min.",
              "Forgetting to check whether endpoints of a closed interval yield the absolute maximum or minimum.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Find the minimum of $x^2 - 6x + 8$.",
                steps: [
                  "$f' = 2x - 6 = 0 \\implies x = 3$. Value $f(3) = 9 - 18 + 8 = -1$.",
                ],
                a: String.raw`\min \text{ at } x = 3, \text{ value } -1`,
              },
              {
                q: "Find the local extrema of $2x^3 - 9x^2 + 12x$.",
                steps: [
                  "$f' = 6x^2 - 18x + 12 = 6(x-1)(x-2) = 0 \\implies x = 1, 2$. $f(1) = 2 - 9 + 12 = 5$ (max); $f(2) = 16 - 36 + 24 = 4$ (min).",
                ],
                a: String.raw`\text{local max at } x = 1 \text{ (value } 5),\; \text{local min at } x = 2 \text{ (value } 4)`,
              },
              {
                q: "Find the minimum of $x + \\frac{1}{x}$ for $x > 0$.",
                steps: [
                  "$f' = 1 - 1/x^2 = 0 \\implies x^2 = 1 \\implies x = 1$. Value $1 + 1 = 2$.",
                ],
                a: String.raw`\min \text{ at } x = 1, \text{ value } 2`,
              },
              {
                q: "Where is $f(x) = x^3 - 12x$ decreasing?",
                steps: [
                  "$f' = 3x^2 - 12 < 0 \\implies x^2 < 4 \\implies -2 < x < 2$.",
                ],
                a: String.raw`-2 < x < 2`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Critical points occur where $f'(x) = 0$ or is undefined.",
              "First derivative sign change dictates max (+$ \\to -$) or min ($- \\to +$).",
              "Second derivative sign indicates concavity at stationary points.",
            ],
          },
        ],
      },
      {
        id: "optimisation",
        title: "Optimisation",
        minutes: 18,
        level: "Intermediate",
        widget: {
          id: "box",
          caption:
            "Drag cut size x to find the cut that maximizes volume from a 12×12 cardboard sheet.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "Optimisation is applied calculus at its finest: how do you design a can to hold maximum soup with minimum tin? How do you schedule delivery trucks to burn the least fuel? By expressing the goal as a single function and finding its peak with derivatives, we find the optimal balance.",
          },
          {
            type: "callout",
            k: "tip",
            title: "Optimisation Strategy",
            x: "1. Identify the quantity to maximize/minimize. 2. Write an equation in terms of one variable using constraints. 3. Find critical points. 4. Verify extremum in context.",
          },
          { type: "widget", id: "box" },
          {
            type: "details",
            title: "Where this comes from (Extreme Value Theorem)",
            x: String.raw`The Extreme Value Theorem guarantees that any continuous function on a closed, bounded interval $[a, b]$ attains an absolute maximum and minimum. The extremum must occur at either a critical point in $(a, b)$ or at the boundaries $a$ or $b$.`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Open box from a 12×12 sheet",
            steps: [
              "Cutting corners of side $x$ leaves a base of side $12 - 2x$ and height $x$.",
              "Volume: $V(x) = x(12 - 2x)^2 = x(144 - 48x + 4x^2) = 4x^3 - 48x^2 + 144x$ on domain $x \\in [0, 6]$.",
              "Differentiate: $V'(x) = 12x^2 - 96x + 144 = 12(x^2 - 8x + 12) = 12(x - 2)(x - 6)$.",
              "Setting $V'=0$ in the interior gives $x = 2$.",
              "Maximum volume: $V(2) = 2(12 - 4)^2 = 2(64) = 128$.",
            ],
            answer: String.raw`V = x(12-2x)^2,\; x = 2,\; V_{\max} = 128`,
          },
          {
            type: "example",
            title: "Rectangle of perimeter 40 with maximum area",
            steps: [
              "Perimeter: $2x + 2y = 40 \\implies y = 20 - x$.",
              "Area: $A(x) = x(20 - x) = 20x - x^2$.",
              "Differentiate: $A'(x) = 20 - 2x = 0 \\implies x = 10$.",
              "Then $y = 20 - 10 = 10$. Area $= 10 \\times 10 = 100$.",
            ],
            answer: String.raw`10 \times 10,\; \text{area } 100`,
          },
          {
            type: "example",
            title: "Closed can of volume 1000 cm³ with minimum surface area",
            steps: [
              "Volume: $V = \\pi r^2 h = 1000 \\implies h = \\frac{1000}{\\pi r^2}$.",
              "Surface area: $S = 2\\pi r^2 + 2\\pi r h = 2\\pi r^2 + \\frac{2000}{r}$.",
              "Differentiate: $S'(r) = 4\\pi r - \\frac{2000}{r^2} = 0 \\implies 4\\pi r^3 = 2000 \\implies r^3 = \\frac{500}{\\pi}$.",
              "Radius: $r = (500/\\pi)^{1/3} \\approx 5.42$ cm.",
              "Height: $h = \\frac{1000}{\\pi r^2} = 2r \\approx 10.84$ cm.",
            ],
            answer: String.raw`r = \left(\frac{500}{\pi}\right)^{1/3} \approx 5.42\text{ cm},\; h = 2r \approx 10.84\text{ cm}`,
          },
          {
            type: "mistakes",
            items: [
              "Forgetting the domain restrictions: negative lengths or cuts larger than the material are physically impossible.",
              "Not verifying whether the critical point is a maximum or minimum.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Find two non-negative numbers summing to 20 with maximum product.",
                steps: [
                  "$P(x) = x(20-x) \\implies P' = 20 - 2x = 0 \\implies x = 10$. Numbers are 10 and 10; product is 100.",
                ],
                a: String.raw`10, 10,\; \text{product } 100`,
              },
              {
                q: "You have 100 m of fence for three sides of a rectangular field against a straight wall. Maximize the area.",
                steps: [
                  "$2x + y = 100 \\implies y = 100 - 2x$. $A = x(100 - 2x) = 100x - 2x^2 \\implies A' = 100 - 4x = 0 \\implies x = 25$ m, $y = 50$ m. Area $= 1250$ m².",
                ],
                a: String.raw`\text{width } 25\text{ m},\; \text{length } 50\text{ m},\; \text{area } 1250\text{ m}^2`,
              },
              {
                q: "Minimise $f(x) = x^2 + \\frac{16}{x}$ for $x > 0$.",
                steps: [
                  "$f'(x) = 2x - 16/x^2 = 0 \\implies 2x^3 = 16 \\implies x^3 = 8 \\implies x = 2$. $f(2) = 4 + 8 = 12$.",
                ],
                a: String.raw`x = 2,\; \text{value } 12`,
              },
              {
                q: "Find the point on $y = x^2$ closest to $(0, 1)$.",
                steps: [
                  "Distance squared $D = x^2 + (y - 1)^2 = y + (y - 1)^2 = y^2 - y + 1$. Minimum at $y = 1/2$. Then $x^2 = 1/2 \\implies x = \\pm \\frac{\\sqrt{2}}{2}$. Distance is $\\sqrt{1/2 + 1/4} = \\frac{\\sqrt{3}}{2}$.",
                ],
                a: String.raw`\left(\pm\frac{\sqrt{2}}{2}, \frac{1}{2}\right),\; \text{distance } \frac{\sqrt{3}}{2}`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Model: express objective function in terms of one variable.",
              "Differentiate, solve $f'(x) = 0$, test critical points.",
              "Always check physical boundaries of your domain.",
            ],
          },
        ],
      },
      {
        id: "related-rates",
        title: "Related rates",
        minutes: 16,
        level: "Intermediate",
        widget: {
          id: "ladder",
          caption:
            "Slide the ladder base outward at 0.5 m/s to observe the top plunge downward.",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "If you inflate a spherical balloon at a steady rate of 100 cm³ of air per second, does the radius grow at a constant speed? No. When the balloon is tiny, the radius expands quickly; when it is huge, the same volume causes only a microscopic expansion.",
          },
          {
            type: "p",
            x: "In related rates, two or more geometric variables are linked by an equation. By differentiating with respect to time $t$, we relate their speeds.",
          },
          {
            type: "callout",
            k: "tip",
            title: "Related Rates Method",
            x: "1. Draw a diagram and label variables. 2. Write an equation relating the variables. 3. Differentiate implicitly with respect to time $t$. 4. Substitute known instantaneous values and solve.",
          },
          { type: "widget", id: "ladder" },
          {
            type: "details",
            title: "Where this comes from (Chain rule with respect to time)",
            x: String.raw`For the ladder against a wall, the Pythagorean theorem holds at all times:
$$x(t)^2 + y(t)^2 = L^2$$
Differentiating both sides with respect to $t$:
$$2x \frac{dx}{dt} + 2y \frac{dy}{dt} = 0 \implies \frac{dy}{dt} = -\frac{x}{y} \frac{dx}{dt}$$`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "Expanding sphere with dV/dt = 100 cm³/s at r = 10 cm",
            steps: [
              "Volume formula: $V = \\frac{4}{3}\\pi r^3$.",
              "Differentiate with respect to $t$: $\\frac{dV}{dt} = 4\\pi r^2 \\frac{dr}{dt}$.",
              "Substitute $\\frac{dV}{dt} = 100$ and $r = 10$: $100 = 4\\pi (10^2) \\frac{dr}{dt} = 400\\pi \\frac{dr}{dt}$.",
              "Solve for $\\frac{dr}{dt}$: $\\frac{dr}{dt} = \\frac{100}{400\\pi} = \\frac{1}{4\\pi} \\approx 0.0796$ cm/s.",
            ],
            answer: String.raw`\frac{dr}{dt} = \frac{1}{4\pi} \approx 0.0796\text{ cm/s}`,
          },
          {
            type: "example",
            title: "5 m ladder, bottom 3 m out sliding at 0.5 m/s",
            steps: [
              "Pythagorean relation: $x^2 + y^2 = 5^2 = 25$.",
              "When $x = 3$, $y = \\sqrt{25 - 9} = 4$ m.",
              "Differentiate: $2x \\frac{dx}{dt} + 2y \\frac{dy}{dt} = 0 \\implies \\frac{dy}{dt} = -\\frac{x}{y} \\frac{dx}{dt}$.",
              "Substitute $x = 3, y = 4, \\frac{dx}{dt} = 0.5$: $\\frac{dy}{dt} = -\\frac{3}{4}(0.5) = -0.375$ m/s.",
            ],
            answer: String.raw`\text{top slides down at } 0.375\text{ m/s}`,
          },
          {
            type: "mistakes",
            items: [
              "Plugging in numbers before differentiating: if you substitute $x=3$ before differentiating, its derivative becomes 0!",
              "Forgetting the negative sign indicating decrease: $\\frac{dy}{dt} < 0$ when height decreases.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "A circle radius grows at 2 cm/s. Find $\\frac{dA}{dt}$ when $r = 5$ cm.",
                steps: [
                  "$A = \\pi r^2 \\implies \\frac{dA}{dt} = 2\\pi r \\frac{dr}{dt} = 2\\pi(5)(2) = 20\\pi \\approx 62.83$ cm²/s.",
                ],
                a: String.raw`20\pi \approx 62.83\text{ cm}^2/\text{s}`,
              },
              {
                q: "A cube edge grows at 3 cm/s. Find $\\frac{dV}{dt}$ when edge length is 4 cm.",
                steps: [
                  "$V = s^3 \\implies \\frac{dV}{dt} = 3s^2 \\frac{ds}{dt} = 3(4^2)(3) = 144$ cm³/s.",
                ],
                a: String.raw`144\text{ cm}^3/\text{s}`,
              },
              {
                q: "A 13 ft ladder has its bottom 5 ft out, sliding at 2 ft/s. How fast does the top fall?",
                steps: [
                  "$x^2 + y^2 = 169$. When $x=5$, $y=12$. $2x(dx/dt) + 2y(dy/dt) = 0 \\implies dy/dt = -\\frac{5}{12}(2) = -\\frac{5}{6}$ ft/s.",
                ],
                a: String.raw`\frac{5}{6}\text{ ft/s}`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Never plug in fixed values before differentiating with respect to $t$.",
              "Apply chain rule to all variables: $x \\to \\frac{dx}{dt}, y \\to \\frac{dy}{dt}$.",
              "Interpret the sign of the rate in the physical context.",
            ],
          },
        ],
      },
      {
        id: "mvt-lhopital",
        title: "Mean Value Theorem and L'Hôpital's rule",
        minutes: 14,
        level: "Advanced",
        widget: {
          id: "plotter",
          props: { initialExpr: "x^2" },
          caption:
            "Verify where instantaneous slope matches the secant slope on [1, 3].",
        },
        blocks: [
          { type: "h2", x: "The idea" },
          {
            type: "p",
            x: "If you average 70 mph on a toll road, you must have been travelling at exactly 70 mph at least once during your journey. This is the Mean Value Theorem: average rate of change must equal instantaneous rate of change at some point.",
          },
          {
            type: "p",
            x: "Meanwhile, when evaluating tricky limits of indeterminate forms $0/0$ or $\\infty/\\infty$, L’Hôpital’s rule lets us take derivatives of the numerator and denominator separately to uncover the true limit.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "MVT and L'Hôpital's Rule",
            x: "MVT: If $f$ is continuous on $[a, b]$ and differentiable on $(a, b)$, then there exists $c \\in (a, b)$ such that $f'(c) = \\frac{f(b)-f(a)}{b-a}$. L'Hôpital: For indeterminate forms $0/0$ or $\\infty/\\infty$, $\\lim \\frac{f(x)}{g(x)} = \\lim \\frac{f'(x)}{g'(x)}$.",
          },
          {
            type: "eq",
            x: String.raw`f'(c) = \frac{f(b)-f(a)}{b-a},\qquad \lim_{x\to a}\frac{f(x)}{g(x)} = \lim_{x\to a}\frac{f'(x)}{g'(x)}`,
            sheet: true,
            name: "MVT and L'Hôpital",
          },
          { type: "widget", id: "plotter", props: { initialExpr: "x^2" } },
          {
            type: "details",
            title: "Where this comes from (Rolle’s Theorem)",
            x: String.raw`Define the tilt function $h(x) = f(x) - \left[f(a) + \frac{f(b)-f(a)}{b-a}(x - a)\right]$.
Notice $h(a) = 0$ and $h(b) = 0$. By Rolle’s Theorem, $h'(c) = 0$ for some $c \in (a, b)$.
Differentiating: $h'(c) = f'(c) - \frac{f(b)-f(a)}{b-a} = 0 \implies f'(c) = \frac{f(b)-f(a)}{b-a}$.`,
          },
          { type: "h2", x: "Worked examples" },
          {
            type: "example",
            title: "MVT for x² on [1, 3]",
            steps: [
              "Average slope: $\\frac{f(3) - f(1)}{3 - 1} = \\frac{9 - 1}{2} = 4$.",
              "Derivative: $f'(x) = 2x$.",
              "Set $2c = 4 \\implies c = 2$.",
              "Notice $c = 2$ lies in the interval $(1, 3)$.",
            ],
            answer: String.raw`c = 2`,
          },
          {
            type: "example",
            title: "Limits: sin x / x and (1 − cos x) / x² as x → 0",
            steps: [
              "For $\\lim_{x\\to0}\\frac{\\sin x}{x}$: form is $0/0$. By L’Hôpital: $\\lim_{x\\to0}\\frac{\\cos x}{1} = 1$.",
              "For $\\lim_{x\\to0}\\frac{1-\\cos x}{x^2}$: form is $0/0$. First L’Hôpital: $\\lim_{x\\to0}\\frac{\\sin x}{2x}$.",
              "Still $0/0$. Second L’Hôpital: $\\lim_{x\\to0}\\frac{\\cos x}{2} = \\frac{1}{2}$.",
            ],
            answer: String.raw`\lim_{x\to0}\frac{\sin x}{x} = 1,\; \lim_{x\to0}\frac{1-\cos x}{x^2} = \frac{1}{2}`,
          },
          {
            type: "example",
            title: "Limit: x / eˣ as x → ∞",
            steps: [
              "Form is $\\infty/\\infty$.",
              "Apply L’Hôpital: differentiate numerator and denominator: $\\lim_{x\\to\\infty} \\frac{1}{e^x}$.",
              "As $x \\to \\infty$, $e^x \\to \\infty$, so $\\frac{1}{\\infty} \\to 0$.",
            ],
            answer: String.raw`0`,
          },
          {
            type: "mistakes",
            items: [
              "Applying L’Hôpital when not indeterminate: if the fraction evaluates to $2/3$, applying L’Hôpital gives nonsense!",
              "Using the quotient rule inside L’Hôpital: differentiate top and bottom separately: $\\frac{f'(x)}{g'(x)}$, not $(f/g)'$.",
            ],
          },
          { type: "h2", x: "Practice" },
          {
            type: "practice",
            items: [
              {
                q: "Evaluate $\\lim_{x\\to2}\\frac{x^2-4}{x-2}$.",
                steps: [
                  "Form $0/0$. L’Hôpital: $\\lim_{x\\to2} \\frac{2x}{1} = 4$.",
                ],
                a: String.raw`4`,
              },
              {
                q: "Evaluate $\\lim_{x\\to0}\\frac{e^{2x}-1}{x}$.",
                steps: [
                  "Form $0/0$. L’Hôpital: $\\lim_{x\\to0} \\frac{2e^{2x}}{1} = 2$.",
                ],
                a: String.raw`2`,
              },
              {
                q: "Evaluate $\\lim_{x\\to\\infty}\\frac{\\ln x}{x}$.",
                steps: [
                  "Form $\\infty/\\infty$. L’Hôpital: $\\lim_{x\\to\\infty} \\frac{1/x}{1} = 0$.",
                ],
                a: String.raw`0`,
              },
              {
                q: "Find the MVT value $c$ for $f(x) = x^3$ on $[0, 2]$.",
                steps: [
                  "Average slope: $\\frac{8-0}{2-0} = 4$. Derivative: $3c^2 = 4 \\implies c^2 = 4/3 \\implies c = \\frac{2}{\\sqrt{3}} \\approx 1.155$.",
                ],
                a: String.raw`c = \frac{2}{\sqrt{3}} \approx 1.155`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "MVT guarantees tangent is parallel to secant at some interior point.",
              "L’Hôpital only applies to indeterminate forms $0/0$ and $\\infty/\\infty$.",
              "Differentiate numerator and denominator separately.",
            ],
          },
        ],
      },
    ],
  },
];
