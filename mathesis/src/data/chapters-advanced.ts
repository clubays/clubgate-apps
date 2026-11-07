import { Chapter } from "../types/curriculum";

export const CHAPTERS_ADV: Chapter[] = [
  {
    id: "diff-eq",
    no: 5,
    title: "Differential Equations",
    blurb:
      "Change that depends on itself: separable equations, exponential growth, slope fields, and Newton’s cooling.",
    status: "ready",
    lessons: [
      {
        id: "separable",
        title: "Introduction & Separable Equations",
        minutes: 18,
        level: "Intermediate",
        blocks: [
          {
            type: "p",
            x: "Until now, calculus has treated functions $y = f(x)$ whose formulas are directly given, letting us calculate derivatives or integrals straightforwardly. In the natural world, however, fundamental physical laws rarely dictate the value of a quantity directly—instead, they govern how that quantity **changes in response to itself and its surroundings**.",
          },
          {
            type: "callout",
            k: "definition",
            title: "Ordinary Differential Equation (ODE)",
            x: "An ordinary differential equation relates an unknown function $y(x)$ to one or more of its derivatives: $F(x, y, y', y'', \\dots, y^{(n)}) = 0$. The order of the differential equation is determined by the highest derivative present.",
          },
          {
            type: "h2",
            x: "Separation of Variables",
          },
          {
            type: "p",
            x: "The most direct analytical technique for first-order ODEs applies when the rate of change can be factored into a product of a function of $x$ alone and a function of $y$ alone: $\\frac{dy}{dx} = g(x) h(y)$.",
          },
          {
            type: "eq",
            x: String.raw`\frac{dy}{dx} = g(x) h(y) \implies \int \frac{1}{h(y)}\,dy = \int g(x)\,dx + C`,
            sheet: true,
            name: "Separation of Variables",
          },
          {
            type: "p",
            x: "By algebraically grouping all terms involving the dependent variable $y$ with $dy$ on the left, and all terms involving the independent variable $x$ with $dx$ on the right, both sides can be integrated independently.",
          },
          {
            type: "example",
            title: "Solving dy/dx = 2xy with Initial Condition y(0) = 3",
            steps: [
              "Separate the variables: divide both sides by $y$ (for $y \\ne 0$) and multiply by $dx$: $\\frac{1}{y}\\,dy = 2x\\,dx$.",
              "Integrate both sides: $\\int \\frac{1}{y}\\,dy = \\int 2x\\,dx \\implies \\ln|y| = x^2 + C_1$.",
              "Exponentiate both sides to isolate $y$: $|y| = e^{x^2 + C_1} = e^{C_1} e^{x^2} \\implies y = A e^{x^2}$, where $A = \\pm e^{C_1}$. Note that $y=0$ is also a trivial solution, so $A$ can be any real constant.",
              "Apply the initial condition $y(0) = 3$: $3 = A e^{0^2} = A \\cdot 1 \\implies A = 3$.",
            ],
            answer: String.raw`y(x) = 3e^{x^2}`,
          },
          {
            type: "mistakes",
            items: [
              "Do not add $+C$ at the very end after solving for $y$. In $\\ln|y| = x^2 + C$, exponentiating yields $y = e^{x^2+C} = Ae^{x^2}$, NOT $e^{x^2} + C$.",
              "Watch for division by zero when separating variables: any values of $y$ where $h(y) = 0$ represent equilibrium constant solutions.",
            ],
          },
          {
            type: "practice",
            items: [
              {
                q: "Find the particular solution to $\\frac{dy}{dx} = 3x^2 y$ given initial condition $y(0) = 5$.",
                steps: [
                  "Separate variables: $\\frac{1}{y}\\,dy = 3x^2\\,dx$.",
                  "Integrate both sides: $\\ln|y| = x^3 + C$.",
                  "Exponentiate: $y = A e^{x^3}$.",
                  "Plug in $y(0) = 5$: $5 = A e^0 = A$.",
                ],
                a: String.raw`y = 5e^{x^3}`,
              },
            ],
          },
          {
            type: "recap",
            items: [
              "Differential equations relate an unknown function to its rates of change.",
              "Separable equations take the form $\\frac{dy}{dx} = g(x)h(y)$ and are solved by integrating $\\int \\frac{1}{h(y)}\\,dy = \\int g(x)\\,dx$.",
              "The constant $+C$ must enter during the integration step, before algebraic isolation.",
              "Initial conditions $y(x_0) = y_0$ pick out a single trajectory from the infinite family of solutions.",
            ],
          },
        ],
      },
      {
        id: "slope-fields",
        title: "Slope Fields & Numerical Euler Method",
        minutes: 22,
        level: "Intermediate",
        blocks: [
          {
            type: "p",
            x: "Many differential equations encountered in physics and engineering cannot be solved in terms of elementary functions. Even when an explicit formula is elusive, the differential equation $\\frac{dy}{dx} = f(x, y)$ gives us something extraordinary: **a geometric prescription of the slope at every single coordinate $(x, y)$**.",
          },
          {
            type: "callout",
            k: "definition",
            title: "Slope Field (Direction Field)",
            x: "A graphical representation of the differential equation $\\frac{dy}{dx} = f(x, y)$, constructed by evaluating the slope $f(x, y)$ on a lattice grid of points in the plane and drawing a short line segment with that slope at each coordinate.",
          },
          {
            type: "p",
            x: "Any valid solution curve $y(x)$ must be everywhere tangent to these segments. In the interactive canvas below, observe how the directional arrows guide the path of the solution curve starting from the seed coordinate $(x_0, y_0)$.",
          },
          {
            type: "widget",
            id: "slopefield",
            props: { preset: "linear", initialX0: -2, initialY0: 0.5 },
          },
          {
            type: "h2",
            x: "Euler’s Numerical Method",
          },
          {
            type: "p",
            x: "Leonhard Euler turned this visual intuition into a concrete computational algorithm. Beginning at initial point $(x_0, y_0)$, we follow the tangent line with slope $f(x_0, y_0)$ for a small step $\\Delta x = h$ to arrive at $(x_1, y_1)$, then repeat.",
          },
          {
            type: "eq",
            x: String.raw`x_{n+1} = x_n + h, \quad y_{n+1} = y_n + h \cdot f(x_n, y_n)`,
            sheet: true,
            name: "Euler’s Method Step Formula",
          },
          {
            type: "example",
            title: "Approximating y(0.2) for y' = x + y with y(0) = 1, h = 0.1",
            steps: [
              "Step 0: Start at $(x_0, y_0) = (0, 1)$. Compute slope: $f(0, 1) = 0 + 1 = 1$.",
              "Compute step 1: $x_1 = 0 + 0.1 = 0.1$; $y_1 = 1 + 0.1(1) = 1.10$.",
              "Compute slope at $(x_1, y_1)$: $f(0.1, 1.10) = 0.1 + 1.10 = 1.20$.",
              "Compute step 2: $x_2 = 0.1 + 0.1 = 0.2$; $y_2 = 1.10 + 0.1(1.20) = 1.22$.",
              "Compare to exact solution $y(x) = 2e^x - x - 1$: $y(0.2) = 2e^{0.2} - 0.2 - 1 \\approx 1.2428$.",
            ],
            answer: String.raw`y(0.2) \approx 1.22`,
          },
          {
            type: "mistakes",
            items: [
              "Euler's method is a first-order method: global truncation error accumulates proportionally to step size $h$.",
              "Using a step size $h$ that is too large can lead to numerical instability and wild oscillation around unstable equilibria.",
            ],
          },
          {
            type: "recap",
            items: [
              "Slope fields provide immediate qualitative insights into stability, equilibria, and asymptotic behavior.",
              "Solution curves are trajectories that flow along the direction field tangent lines.",
              "Euler's method approximates continuous flow with tangent chord steps: $y_{n+1} = y_n + h f(x_n, y_n)$.",
            ],
          },
        ],
      },
      {
        id: "applications-ode",
        title: "Growth, Decay & Newton’s Cooling",
        minutes: 20,
        level: "Intermediate",
        blocks: [
          {
            type: "p",
            x: "Differential equations model fundamental natural phenomena ranging from thermal diffusion and radioactive decay to population biology and financial compound growth. Here we examine two archetypal models.",
          },
          {
            type: "h2",
            x: "1. Exponential Growth and Decay",
          },
          {
            type: "p",
            x: "When a quantity changes at a rate strictly proportional to its current size: $\\frac{dy}{dt} = k y$. Separating variables and integrating gives $\\ln|y| = kt + C \\implies y(t) = y_0 e^{kt}$. If $k > 0$, growth accelerates indefinitely; if $k < 0$, it decays exponentially toward zero.",
          },
          {
            type: "eq",
            x: String.raw`\frac{dy}{dt} = ky \implies y(t) = y_0 e^{kt}`,
            sheet: true,
            name: "Exponential Growth & Decay Law",
          },
          {
            type: "h2",
            x: "2. Newton’s Law of Cooling",
          },
          {
            type: "p",
            x: "Isaac Newton observed that the rate of heat loss of a body is proportional to the difference between its temperature $T(t)$ and the ambient temperature of its surroundings $T_{\\text{env}}$:",
          },
          {
            type: "eq",
            x: String.raw`\frac{dT}{dt} = -k(T - T_{\text{env}}) \implies T(t) = T_{\text{env}} + (T_0 - T_{\text{env}})e^{-kt}`,
            sheet: true,
            name: "Newton’s Law of Cooling",
          },
          {
            type: "example",
            title: "Forensic Cooling: Estimating Time of Death",
            steps: [
              "A body is discovered in a temperature-controlled room kept at $T_{\\text{env}} = 20^\\circ\\text{C}$.",
              "At discovery ($t = 0$), its temperature is $30^\\circ\\text{C}$. Two hours later ($t = 2$), its temperature is $26^\\circ\\text{C}$.",
              "Model: $T(t) = 20 + (30 - 20)e^{-kt} = 20 + 10e^{-kt}$.",
              "Find $k$ using $T(2) = 26$: $26 = 20 + 10e^{-2k} \\implies 10e^{-2k} = 6 \\implies e^{-2k} = 0.6 \\implies k = -\\frac{\\ln(0.6)}{2} \\approx 0.2554\\,\\text{hr}^{-1}$.",
              "Normal living body temperature is $37^\\circ\\text{C}$. Solve for elapsed time $t_{\\text{elapsed}}$ before discovery: $37 = 20 + 10e^{-k(-t_{\\text{elapsed}})} \\implies 10e^{0.2554 t} = 17 \\implies t_{\\text{elapsed}} = \\frac{\\ln(1.7)}{0.2554} \\approx 2.08\\,\\text{hours}$.",
            ],
            answer: String.raw`t_{\text{death}} \approx 2.08 \text{ hours prior}`,
          },
          {
            type: "h2",
            x: "3. Logistic Population Growth",
          },
          {
            type: "p",
            x: "Unchecked exponential growth $\\frac{dP}{dt} = rP$ becomes unrealistic in finite environments. Adding a carrying capacity term $K$ produces the **Logistic Differential Equation** $\\frac{dP}{dt} = rP\\left(1 - \\frac{P}{K}\\right)$. When $P \\ll K$, growth is exponential; as $P \\to K$, growth decelerates to zero, creating a sigmoidal S-shaped curve.",
          },
          {
            type: "eq",
            x: String.raw`\frac{dP}{dt} = rP\left(1 - \frac{P}{K}\right) \implies P(t) = \frac{K}{1 + A e^{-rt}}`,
            sheet: true,
            name: "Logistic Population Model",
          },
          {
            type: "recap",
            items: [
              "Proportional growth $\\frac{dy}{dt} = ky$ has closed-form exponential solution $y(t) = y_0 e^{kt}$.",
              "Newton's cooling $T(t) = T_{\\text{env}} + (T_0 - T_{\\text{env}})e^{-kt}$ asymptotically relaxes toward thermal equilibrium.",
              "Logistic growth introduces saturation at carrying capacity $K$, stabilizing long-term dynamics.",
            ],
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
    status: "ready",
    lessons: [
      {
        id: "sequences-series",
        title: "Sequences & Infinite Series",
        minutes: 18,
        level: "Intermediate",
        blocks: [
          {
            type: "p",
            x: "Can an infinite list of positive numbers add up to a finite number? This foundational paradox, contemplated since Zeno's dichotomy, lies at the heart of modern mathematical analysis.",
          },
          {
            type: "callout",
            k: "definition",
            title: "Sequence vs. Series",
            x: "A **sequence** $\\{a_n\\}$ is an ordered infinite list of numbers $a_1, a_2, a_3, \\dots$. A **series** $\\sum_{n=1}^\\infty a_n$ is the formal sum of the sequence terms. Its value is rigorously defined as the limit of its sequence of partial sums: $S_N = \\sum_{n=1}^N a_n$, so $\\sum_{n=1}^\\infty a_n = \\lim_{N \\to \\infty} S_N$.",
          },
          {
            type: "h2",
            x: "The Geometric Series",
          },
          {
            type: "p",
            x: "The most important series in all of mathematics is the geometric series, where each term is obtained by multiplying the previous term by a common ratio $r$.",
          },
          {
            type: "eq",
            x: String.raw`\sum_{n=0}^\infty a r^n = a + ar + ar^2 + \dots = \frac{a}{1 - r} \quad \text{for } |r| < 1`,
            sheet: true,
            name: "Geometric Series Sum Formula",
          },
          {
            type: "example",
            title: "Evaluating 1 + 1/2 + 1/4 + 1/8 + ...",
            steps: [
              "Identify first term: $a = 1$.",
              "Identify common ratio: $r = 1/2$.",
              "Check convergence condition: $|r| = |1/2| = 0.5 < 1$, so the series converges.",
              "Compute sum: $S = \\frac{a}{1 - r} = \\frac{1}{1 - 1/2} = \\frac{1}{1/2} = 2$.",
            ],
            answer: String.raw`S = 2`,
          },
          {
            type: "callout",
            k: "theorem",
            title: "Divergence Test (n-th Term Test)",
            x: "If $\\lim_{n \\to \\infty} a_n \\neq 0$ (or does not exist), then the series $\\sum_{n=1}^\\infty a_n$ diverges.",
          },
          {
            type: "mistakes",
            items: [
              "The converse of the Divergence Test is FALSE! Terms tending to zero ($\\\\lim a_n = 0$) does NOT guarantee convergence. The classic counterexample is the Harmonic Series $\\\\sum 1/n = \\\\infty$.",
              "Geometric series formula only works when $|r| < 1$. Never use $a/(1-r)$ when $|r| \\\\ge 1$.",
            ],
          },
          {
            type: "recap",
            items: [
              "A series converges if its sequence of partial sums $S_N = \\sum_{n=1}^N a_n$ tends to a finite limit.",
              "Geometric series $\\sum a r^n$ converges to $\\frac{a}{1-r}$ if and only if $|r| < 1$.",
              "If the terms $a_n$ do not decay to 0, the series diverged immediately. If they do decay to 0, deeper tests are required.",
            ],
          },
        ],
      },
      {
        id: "convergence-tests",
        title: "Convergence Tests & p-Series",
        minutes: 24,
        level: "Advanced",
        blocks: [
          {
            type: "p",
            x: "To determine whether general series $\\sum a_n$ converge or diverge without explicitly computing partial sums, mathematicians developed a systematic toolbox of convergence tests.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "The p-Series Theorem",
            x: "The $p$-series $\\sum_{n=1}^\\infty \\frac{1}{n^p} = \\frac{1}{1^p} + \\frac{1}{2^p} + \\frac{1}{3^p} + \\dots$ converges if $p > 1$, and diverges if $p \\le 1$.",
          },
          {
            type: "eq",
            x: String.raw`\sum_{n=1}^\infty \frac{1}{n^p} \quad \begin{cases} \text{Converges} & p > 1 \\ \text{Diverges} & p \le 1 \end{cases}`,
            sheet: true,
            name: "p-Series Test",
          },
          {
            type: "h2",
            x: "Comparison & Limit Comparison Tests",
          },
          {
            type: "p",
            x: "If $0 \\le a_n \\le b_n$ for all $n$: if $\\sum b_n$ converges, then $\\sum a_n$ must converge. If $\\sum a_n$ diverges, then $\\sum b_n$ must diverge. For polynomials and rational fractions, the **Limit Comparison Test** is even more convenient: if $\\lim_{n \\to \\infty} \\frac{a_n}{b_n} = L \\in (0, \\infty)$, both series behave identically.",
          },
          {
            type: "h2",
            x: "The Ratio Test",
          },
          {
            type: "p",
            x: "The Ratio Test is the premier tool for series involving factorials ($n!$) or exponential powers ($k^n$):",
          },
          {
            type: "eq",
            x: String.raw`L = \lim_{n \to \infty} \left| \frac{a_{n+1}}{a_n} \right| \implies \begin{cases} L < 1 & \text{Converges absolutely} \\ L > 1 & \text{Diverges} \\ L = 1 & \text{Inconclusive} \end{cases}`,
            sheet: true,
            name: "The Ratio Test",
          },
          {
            type: "example",
            title: "Testing Convergence of Σ n! / 3ⁿ",
            steps: [
              "Form the consecutive ratio: $\\left| \\frac{a_{n+1}}{a_n} \\right| = \\frac{(n+1)!}{3^{n+1}} \\cdot \\frac{3^n}{n!}$.",
              "Simplify factorials and powers: $\\frac{(n+1) \\cdot n!}{n!} \\cdot \\frac{3^n}{3 \\cdot 3^n} = \\frac{n+1}{3}$.",
              "Compute the limit: $\\lim_{n \\to \\infty} \\frac{n+1}{3} = \\infty$.",
              "Since $L = \\infty > 1$, the terms explode far too fast.",
            ],
            answer: String.raw`\text{Diverges by Ratio Test}`,
          },
          {
            type: "h2",
            x: "Alternating Series Test (Leibniz’s Rule)",
          },
          {
            type: "p",
            x: "An alternating series $\\sum (-1)^{n+1} b_n$ (with $b_n > 0$) converges if: (1) $b_{n+1} \\le b_n$ for all $n$, and (2) $\\lim_{n \\to \\infty} b_n = 0$. For instance, the **Alternating Harmonic Series** $1 - \\frac{1}{2} + \\frac{1}{3} - \\frac{1}{4} + \\dots$ converges conditionally to $\\ln 2$.",
          },
          {
            type: "recap",
            items: [
              "p-series $\\sum 1/n^p$ converges if and only if $p > 1$.",
              "Ratio test $L = \\lim |a_{n+1}/a_n|$ is ideal for factorials and exponential terms.",
              "Alternating series converge whenever terms decrease monotonically to zero.",
              "Absolute convergence $\\sum |a_n| < \\infty$ is stronger than conditional convergence.",
            ],
          },
        ],
      },
      {
        id: "taylor-series",
        title: "Power Series & Taylor Polynomials",
        minutes: 26,
        level: "Advanced",
        blocks: [
          {
            type: "p",
            x: "How do pocket calculators and computers compute $\\sin(0.42)$, $\\sqrt{e}$, or $\\ln(2.7)$ in microseconds using only addition and multiplication? The answer is **Taylor Series**: transforming transcendental functions into infinite polynomials.",
          },
          {
            type: "callout",
            k: "definition",
            title: "Taylor & Maclaurin Series",
            x: "If $f(x)$ has derivatives of all orders at $x = a$, its Taylor Series centered at $a$ is: $f(x) = \\sum_{n=0}^\\infty \\frac{f^{(n)}(a)}{n!} (x - a)^n$. When the expansion center is $a = 0$, it is specifically called a **Maclaurin Series**.",
          },
          {
            type: "eq",
            x: String.raw`P_n(x) = f(a) + f'(a)(x-a) + \frac{f''(a)}{2!}(x-a)^2 + \dots + \frac{f^{(n)}(a)}{n!}(x-a)^n`,
            sheet: true,
            name: "Taylor Polynomial Expansion",
          },
          {
            type: "p",
            x: "In the interactive widget below, adjust the degree $n$ slider to observe how higher-order polynomial terms wrap around and hug the true function curves.",
          },
          {
            type: "widget",
            id: "taylor",
            props: { initialPreset: "sin", initialN: 3 },
          },
          {
            type: "h2",
            x: "The Fundamental Maclaurin Expansions",
          },
          {
            type: "eq",
            x: String.raw`e^x = \sum_{n=0}^\infty \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \dots, \quad R = \infty`,
            sheet: true,
            name: "Maclaurin Series for eˣ",
          },
          {
            type: "eq",
            x: String.raw`\sin(x) = \sum_{n=0}^\infty \frac{(-1)^n x^{2n+1}}{(2n+1)!} = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \dots, \quad R = \infty`,
            sheet: true,
            name: "Maclaurin Series for sin(x)",
          },
          {
            type: "eq",
            x: String.raw`\cos(x) = \sum_{n=0}^\infty \frac{(-1)^n x^{2n}}{(2n)!} = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \dots, \quad R = \infty`,
            sheet: true,
            name: "Maclaurin Series for cos(x)",
          },
          {
            type: "eq",
            x: String.raw`\frac{1}{1 - x} = \sum_{n=0}^\infty x^n = 1 + x + x^2 + x^3 + \dots, \quad R = 1`,
            sheet: true,
            name: "Geometric Series Expansion",
          },
          {
            type: "recap",
            items: [
              "Taylor polynomials match all derivatives of $f(x)$ at center $x = a$ up to order $n$.",
              "The radius of convergence $R$ defines the interval $|x - a| < R$ where the infinite series converges.",
              "Maclaurin series for $\\sin(x)$, $\\cos(x)$, and $e^x$ converge for every real number $x \\in \\mathbb{R}$.",
              "Taylor's theorem bridges calculus with modern scientific computing and numerical analysis.",
            ],
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
    status: "ready",
    lessons: [
      {
        id: "multi-functions",
        title: "Functions of Several Variables & 3D Geometry",
        minutes: 18,
        level: "Intermediate",
        blocks: [
          {
            type: "p",
            x: "In the single-variable world, an input $x$ produces an output $y = f(x)$, tracing a curve in the 2D Cartesian plane. Real-world physical systems, however, are governed by multiple inputs: temperature depends on latitude, longitude, and elevation; economic output depends on capital and labor.",
          },
          {
            type: "callout",
            k: "definition",
            title: "Function of Two Variables & 3D Surface",
            x: "A function $z = f(x, y)$ assigns a unique real number $z$ to each ordered pair $(x, y)$ in its domain $D \\subset \\mathbb{R}^2$. Its graph forms a surface in 3-dimensional Euclidean space $\\mathbb{R}^3$.",
          },
          {
            type: "h2",
            x: "Level Curves and Contour Maps",
          },
          {
            type: "p",
            x: "Visualizing 3D surfaces on flat screens or paper is achieved through **contour maps** (level curves). Setting $f(x, y) = c$ for various constant heights $c$ slices the 3D surface with horizontal planes, projecting the intersection lines down onto the $xy$-plane—just like topographical elevation lines on a hiker's trail map.",
          },
          {
            type: "example",
            title: "Identifying Contours of z = x² + y²",
            steps: [
              "Set $z = c$: $x^2 + y^2 = c$.",
              "For $c < 0$: No real points satisfy the equation (surface lies strictly above $z=0$).",
              "For $c = 0$: $x^2 + y^2 = 0 \\implies (0, 0)$ (the lowest vertex point).",
              "For $c > 0$: $x^2 + y^2 = (\\sqrt{c})^2$, which is a circle centered at origin with radius $r = \\sqrt{c}$.",
            ],
            answer: String.raw`\text{Concentric circles } x^2 + y^2 = c`,
          },
          {
            type: "recap",
            items: [
              "Functions $z = f(x, y)$ map 2D coordinates to 3D surface elevations.",
              "Level curves $f(x, y) = c$ visualize 3D topography in 2D.",
              "Closely spaced contour lines indicate steep cliffs; widely spaced lines denote gentle slopes.",
            ],
          },
        ],
      },
      {
        id: "partial-derivatives",
        title: "Partial Derivatives & Tangent Planes",
        minutes: 22,
        level: "Intermediate",
        blocks: [
          {
            type: "p",
            x: "On a single-variable curve, you can only move forward or backward. On a 3D terrain, you can hike north, south, east, west, or along any diagonal compass heading. How do we quantify rates of change in multiple dimensions?",
          },
          {
            type: "callout",
            k: "definition",
            title: "Partial Derivatives",
            x: "The partial derivative of $f(x, y)$ with respect to $x$ is obtained by treating $y$ as a fixed constant and differentiating with respect to $x$: $\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x+h, y) - f(x, y)}{h}$. Similarly, $\\frac{\\partial f}{\\partial y}$ holds $x$ fixed and differentiates with respect to $y$.",
          },
          {
            type: "example",
            title: "Computing Partial Derivatives of f(x, y) = x³y² + 4x - 5y",
            steps: [
              "To find $\\frac{\\partial f}{\\partial x}$, treat $y$ as a constant: $\\frac{\\partial}{\\partial x}(x^3 y^2 + 4x - 5y) = 3x^2 y^2 + 4 - 0 = 3x^2 y^2 + 4$.",
              "To find $\\frac{\\partial f}{\\partial y}$, treat $x$ as a constant: $\\frac{\\partial}{\\partial y}(x^3 y^2 + 4x - 5y) = x^3(2y) + 0 - 5 = 2x^3 y - 5$.",
            ],
            answer: String.raw`f_x = 3x^2 y^2 + 4, \quad f_y = 2x^3 y - 5`,
          },
          {
            type: "callout",
            k: "theorem",
            title: "Clairaut’s Theorem on Mixed Partials",
            x: "If the second-order mixed partial derivatives $f_{xy} = \\frac{\\partial^2 f}{\\partial y \\partial x}$ and $f_{yx} = \\frac{\\partial^2 f}{\\partial x \\partial y}$ are continuous on an open disk around $(a, b)$, then the order of differentiation does not matter: $f_{xy}(a, b) = f_{yx}(a, b)$.",
          },
          {
            type: "h2",
            x: "The Tangent Plane",
          },
          {
            type: "p",
            x: "Just as single-variable calculus approximates a curve with a tangent line $y - y_0 = f'(x_0)(x - x_0)$, multivariable calculus approximates a smooth 3D surface near $(x_0, y_0)$ with a 2D **tangent plane**:",
          },
          {
            type: "eq",
            x: String.raw`z - z_0 = f_x(x_0, y_0)(x - x_0) + f_y(x_0, y_0)(y - y_0)`,
            sheet: true,
            name: "Tangent Plane Equation",
          },
          {
            type: "recap",
            items: [
              "Partial derivatives measure directional slope parallel to the coordinate axes.",
              "When computing $\\frac{\\partial f}{\\partial x}$, treat all other variables as constants.",
              "Clairaut's theorem guarantees $f_{xy} = f_{yx}$ for smooth continuous functions.",
              "The tangent plane provides the optimal linear approximation $L(x, y) \\approx f(x, y)$.",
            ],
          },
        ],
      },
      {
        id: "gradients",
        title: "The Gradient & Directional Derivatives",
        minutes: 24,
        level: "Advanced",
        blocks: [
          {
            type: "p",
            x: "Partial derivatives give slopes purely in the parallel directions of the $x$ and $y$ coordinate axes. But what is the slope if you hike along an arbitrary compass angle $\\theta$ specified by a unit vector $\\mathbf{u} = \\langle u_1, u_2 \\rangle$?",
          },
          {
            type: "callout",
            k: "definition",
            title: "The Gradient Vector ∇f",
            x: "The gradient of a differentiable scalar function $f(x, y)$ is the vector-valued function of its partial derivatives: $\\nabla f(x, y) = \\left\\langle \\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y} \\right\\rangle = f_x \\hat{\\mathbf{i}} + f_y \\hat{\\mathbf{j}}$.",
          },
          {
            type: "eq",
            x: String.raw`D_{\mathbf{u}} f(x, y) = \nabla f(x, y) \cdot \mathbf{u} = \|\nabla f\| \cos\theta`,
            sheet: true,
            name: "Directional Derivative via Gradient",
          },
          {
            type: "callout",
            k: "theorem",
            title: "Fundamental Gradient Theorem",
            x: "1. The gradient vector $\\nabla f(x, y)$ points in the direction of **maximum rate of increase** (steepest ascent).\n2. The maximum rate of increase is exactly the magnitude $\\|\\nabla f\\| = \\sqrt{f_x^2 + f_y^2}$.\n3. The gradient vector $\\nabla f$ is everywhere **perpendicular (orthogonal)** to the level curve $f(x, y) = c$ passing through that point.",
          },
          {
            type: "p",
            x: "Explore this fundamental relationship in the interactive widget below. Move the probe point across the terrain to inspect how the gradient arrow aligns with steepest ascent and stands perpendicular to contour curves.",
          },
          {
            type: "widget",
            id: "gradient",
            props: { initialPreset: "paraboloid", initialX: 1.5, initialY: 1.0 },
          },
          {
            type: "recap",
            items: [
              "The gradient packs all spatial rates of change into a single vector $\\nabla f = \\langle f_x, f_y \\rangle$.",
              "Directional derivative along unit direction $\\mathbf{u}$ is the dot product $D_{\\mathbf{u}} f = \\nabla f \\cdot \\mathbf{u}$.",
              "$\\nabla f$ is orthogonal to contour lines and guides gradient descent algorithms used in machine learning.",
            ],
          },
        ],
      },
      {
        id: "double-integrals",
        title: "Double Integrals & Volume",
        minutes: 20,
        level: "Advanced",
        blocks: [
          {
            type: "p",
            x: "In single-variable calculus, integrating $\\int_a^b f(x)\\,dx$ computes the 2D area under a curve. In multivariable calculus, integrating a positive surface $z = f(x, y)$ over a 2D planar region $R$ computes the **3D volume under the surface**.",
          },
          {
            type: "callout",
            k: "definition",
            title: "Double Integral over a Region",
            x: "The double integral over region $R$ is defined as the limit of 2D Riemann sums: $\\iint_R f(x, y)\\,dA = \\lim_{\\Delta A \\to 0} \\sum_{i=1}^m \\sum_{j=1}^n f(x_i^*, y_j^*) \\,\\Delta x \\,\\Delta y$, representing volume under surface $z = f(x, y)$.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "Fubini’s Theorem",
            x: "If $f(x, y)$ is continuous on the rectangular region $R = [a, b] \\times [c, d]$, then the double integral equals the iterated integral evaluated in either order: $\\iint_R f(x, y)\\,dA = \\int_a^b \\left( \\int_c^d f(x, y)\\,dy \\right) dx = \\int_c^d \\left( \\int_a^b f(x, y)\\,dx \\right) dy$.",
          },
          {
            type: "eq",
            x: String.raw`\iint_R f(x, y)\,dA = \int_a^b \int_c^d f(x, y)\,dy\,dx = \int_c^d \int_a^b f(x, y)\,dx\,dy`,
            sheet: true,
            name: "Fubini’s Iterated Integral Theorem",
          },
          {
            type: "example",
            title: "Evaluating ∬_R (2x + 6y) dA over [0, 2] × [0, 1]",
            steps: [
              "Set up iterated integral: $\\int_0^2 \\int_0^1 (2x + 6y)\\,dy\\,dx$.",
              "Inner integration with respect to $y$: $\\int_0^1 (2x + 6y)\\,dy = \\left[ 2xy + 3y^2 \\right]_{y=0}^{y=1} = (2x(1) + 3(1)^2) - 0 = 2x + 3$.",
              "Outer integration with respect to $x$: $\\int_0^2 (2x + 3)\\,dx = \\left[ x^2 + 3x \\right]_{x=0}^{x=2} = (2^2 + 3(2)) - 0 = 4 + 6 = 10$.",
            ],
            answer: String.raw`\text{Volume} = 10`,
          },
          {
            type: "recap",
            items: [
              "Double integrals $\\iint f(x, y)\\,dA$ compute total volume, mass, or accumulated density over a 2D domain.",
              "Fubini's theorem enables evaluation via nested single-variable iterated integrals.",
              "In polar coordinates, the differential area element scales by the Jacobian determinant: $dA = r\\,dr\\,d\\theta$.",
            ],
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
    status: "ready",
    lessons: [
      {
        id: "vectors-dot-product",
        title: "Vectors, Geometry & Dot Products",
        minutes: 18,
        level: "Beginner",
        blocks: [
          {
            type: "p",
            x: "Linear algebra is the foundational mathematical language of modern computing, graphics engines, data science, and quantum physics. It begins with **vectors**: mathematical arrows possessing both length (magnitude) and direction.",
          },
          {
            type: "callout",
            k: "definition",
            title: "Vector in ℝⁿ",
            x: "A vector $\\mathbf{v} = \\begin{pmatrix} v_1 \\\\ v_2 \\end{pmatrix}$ represents a displacement or coordinate in space. Vector addition adds corresponding components: $\\mathbf{u} + \\mathbf{v} = \\begin{pmatrix} u_1 + v_1 \\\\ u_2 + v_2 \\end{pmatrix}$. Scalar multiplication stretches or reflects the vector: $c\\mathbf{v} = \\begin{pmatrix} cv_1 \\\\ cv_2 \\end{pmatrix}$.",
          },
          {
            type: "h2",
            x: "The Dot Product and Angles",
          },
          {
            type: "p",
            x: "How do we compute the geometric angle $\\theta$ between two multi-dimensional vectors? The dot product provides a direct algebraic bridge between coordinates and geometry.",
          },
          {
            type: "eq",
            x: String.raw`\mathbf{u} \cdot \mathbf{v} = u_1 v_1 + u_2 v_2 + \dots + u_n v_n = \|\mathbf{u}\| \|\mathbf{v}\| \cos\theta`,
            sheet: true,
            name: "Dot Product & Angle Identity",
          },
          {
            type: "callout",
            k: "theorem",
            title: "Orthogonality Criterion",
            x: "Two non-zero vectors $\\mathbf{u}$ and $\\mathbf{v}$ are perpendicular (orthogonal) if and only if their dot product vanishes: $\\mathbf{u} \\cdot \\mathbf{v} = 0$.",
          },
          {
            type: "example",
            title: "Testing Orthogonality of u = (3, -2) and v = (4, 6)",
            steps: [
              "Compute dot product: $\\mathbf{u} \\cdot \\mathbf{v} = (3)(4) + (-2)(6) = 12 - 12 = 0$.",
              "Since the dot product equals 0, $\\cos\\theta = 0 \\implies \\theta = 90^\\circ$.",
            ],
            answer: String.raw`\mathbf{u} \perp \mathbf{v} \quad (\theta = 90^\circ)`,
          },
          {
            type: "recap",
            items: [
              "Vectors represent directed magnitudes combined via component-wise addition and scalar scaling.",
              "Dot product $\\mathbf{u} \\cdot \\mathbf{v} = \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|\\cos\\theta$ measures geometric directional alignment.",
              "A zero dot product indicates orthogonal (perpendicular) vectors.",
            ],
          },
        ],
      },
      {
        id: "matrix-transforms",
        title: "Matrix Transformations & The Plane",
        minutes: 24,
        level: "Intermediate",
        blocks: [
          {
            type: "p",
            x: "Rather than viewing a matrix as merely a static rectangular array of numbers, the revolutionary insight of linear algebra is that **every $2 \\times 2$ matrix represents a geometric transformation of the entire 2D coordinate plane**.",
          },
          {
            type: "callout",
            k: "definition",
            title: "Linear Transformation",
            x: "A transformation $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ is linear if it keeps the origin fixed and preserves straight, parallel grid lines: $T(c\\mathbf{u} + d\\mathbf{v}) = c T(\\mathbf{u}) + d T(\\mathbf{v})$.",
          },
          {
            type: "p",
            x: "Because any vector can be written as a linear combination of the standard unit basis vectors $\\mathbf{v} = x\\hat{\\mathbf{i}} + y\\hat{\\mathbf{j}}$, **a linear transformation is completely and uniquely determined by where it sends $\\hat{\\mathbf{i}} = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$ and $\\hat{\\mathbf{j}} = \\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}$**!",
          },
          {
            type: "eq",
            x: String.raw`A = \begin{pmatrix} a & b \\ c & d \end{pmatrix} \implies T(\hat{\mathbf{i}}) = \begin{pmatrix} a \\ c \end{pmatrix}, \quad T(\hat{\mathbf{j}}) = \begin{pmatrix} b \\ d \end{pmatrix}`,
            sheet: true,
            name: "Matrix as Basis Transformation",
          },
          {
            type: "p",
            x: "The first column of $A$ is the landing coordinate of $\\hat{\\mathbf{i}}$. The second column of $A$ is the landing coordinate of $\\hat{\\mathbf{j}}$. In the interactive widget below, slide the transformation progress or switch presets to witness rotations, shears, scalings, and reflections morph the coordinate grid.",
          },
          {
            type: "widget",
            id: "matrix",
            props: { initialPreset: "shear" },
          },
          {
            type: "recap",
            items: [
              "Linear transformations map the plane while keeping grid lines straight and origin anchored.",
              "Matrix columns specify where the basis vectors $\\hat{\\mathbf{i}}$ and $\\hat{\\mathbf{j}}$ land.",
              "Matrix multiplication corresponds geometrically to composing sequential transformations: $B(A\\mathbf{v}) = (BA)\\mathbf{v}$.",
            ],
          },
        ],
      },
      {
        id: "determinants",
        title: "Determinants, Inverses & Area Scaling",
        minutes: 20,
        level: "Intermediate",
        blocks: [
          {
            type: "p",
            x: "When a matrix transformation stretches and shears the coordinate plane, geometric shapes are distorted. By what exact factor do 2D areas grow or shrink under the transformation? The answer is given by the **determinant**.",
          },
          {
            type: "callout",
            k: "definition",
            title: "Determinant of a 2×2 Matrix",
            x: "For $A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$, its determinant is the scalar: $\\det(A) = ad - bc$.",
          },
          {
            type: "callout",
            k: "theorem",
            title: "Geometric Meaning of the Determinant",
            x: "1. The absolute value $|\\det(A)|$ is the exact **area scaling factor** of the transformation. A unit square with area 1 is transformed into a parallelogram of area $|\\det(A)|$.\n2. The sign of $\\det(A)$ indicates orientation: $\\det(A) > 0$ preserves orientation; $\\det(A) < 0$ flips the plane inside out like a mirror reflection.",
          },
          {
            type: "eq",
            x: String.raw`\det \begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc = \text{Signed Area Scaling Factor}`,
            sheet: true,
            name: "2×2 Determinant Formula",
          },
          {
            type: "h2",
            x: "Invertibility and Singularity",
          },
          {
            type: "p",
            x: "If $\\det(A) = 0$, the transformation collapses 2D area into a 1D line or a 0D point. Information is irrevocably lost, so the transformation cannot be undone. Thus, a matrix is invertible if and only if its determinant is non-zero:",
          },
          {
            type: "eq",
            x: String.raw`A^{-1} = \frac{1}{ad - bc} \begin{pmatrix} d & -b \\ -c & a \end{pmatrix} \quad \text{for } \det(A) \neq 0`,
            sheet: true,
            name: "2×2 Matrix Inverse Formula",
          },
          {
            type: "recap",
            items: [
              "Determinant $\\det(A) = ad - bc$ measures the factor by which areas scale.",
              "Negative determinant indicates a reflection that flips geometric chirality/orientation.",
              "$\\det(A) = 0$ means the matrix squashes space into fewer dimensions and possesses no inverse.",
            ],
          },
        ],
      },
      {
        id: "eigenvalues",
        title: "Eigenvalues & Eigenvectors",
        minutes: 26,
        level: "Advanced",
        blocks: [
          {
            type: "p",
            x: "During a general linear transformation, most vectors get knocked off their original span line, changing both length and direction. But almost every transformation possesses certain special, privileged directions that **remain on their own span line**, experiencing nothing more than pure scalar stretching or shrinking.",
          },
          {
            type: "callout",
            k: "definition",
            title: "Eigenvector and Eigenvalue",
            x: "A non-zero vector $\\mathbf{v}$ is an **eigenvector** of square matrix $A$ with **eigenvalue** $\\lambda$ if multiplying by $A$ merely scales $\\mathbf{v}$: $A\\mathbf{v} = \\lambda\\mathbf{v}$.",
          },
          {
            type: "eq",
            x: String.raw`A \mathbf{v} = \lambda \mathbf{v} \iff (A - \lambda I)\mathbf{v} = \mathbf{0}`,
            sheet: true,
            name: "The Eigenvalue Equation",
          },
          {
            type: "h2",
            x: "The Characteristic Equation",
          },
          {
            type: "p",
            x: "Rewriting the eigenvalue equation as $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$, we see that non-trivial solutions $\\mathbf{v} \\neq \\mathbf{0}$ exist if and only if the matrix $(A - \\lambda I)$ is singular (has zero determinant):",
          },
          {
            type: "eq",
            x: String.raw`\det(A - \lambda I) = 0 \implies \lambda^2 - \operatorname{tr}(A)\lambda + \det(A) = 0`,
            sheet: true,
            name: "Characteristic Equation",
          },
          {
            type: "example",
            title: "Finding Eigenvalues of A = [[3, 1], [0, 2]]",
            steps: [
              "Set up characteristic determinant: $\\det \\begin{pmatrix} 3-\\lambda & 1 \\\\ 0 & 2-\\lambda \\end{pmatrix} = 0$.",
              "Compute determinant: $(3 - \\lambda)(2 - \\lambda) - (1)(0) = (3 - \\lambda)(2 - \\lambda) = 0$.",
              "Solve roots: $\\lambda_1 = 3$ and $\\lambda_2 = 2$.",
              "Find eigenvector for $\\lambda = 3$: $(A - 3I)\\mathbf{v} = \\begin{pmatrix} 0 & 1 \\\\ 0 & -1 \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix} \\implies y = 0$. Any vector $\\mathbf{v}_1 = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$ is an eigenvector.",
            ],
            answer: String.raw`\lambda_1 = 3, \quad \lambda_2 = 2`,
          },
          {
            type: "recap",
            items: [
              "Eigenvectors $A\\mathbf{v} = \\lambda\\mathbf{v}$ are vectors that maintain their orientation under transformation.",
              "Eigenvalues are roots of the characteristic polynomial $\\det(A - \\lambda I) = 0$.",
              "Diagonalizing a matrix into its eigenbasis uncouples complex high-dimensional systems into simple independent 1D scalings.",
            ],
          },
        ],
      },
    ],
  },
];
