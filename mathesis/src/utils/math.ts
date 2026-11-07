// Numerical derivative
export function numDeriv(f: (x: number) => number, x: number, h = 1e-5): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

// Numerical integration Simpson 4000 strips
export function simpson(f: (x: number) => number, a: number, b: number, n = 4000): number {
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i += 2) s += 4 * f(a + i * h);
  for (let i = 2; i < n; i += 2) s += 2 * f(a + i * h);
  return (s * h) / 3;
}
