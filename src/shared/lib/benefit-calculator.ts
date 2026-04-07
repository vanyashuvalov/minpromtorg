/*
File purpose: encapsulate the math behind the minimal landing-page calculator.
Why this exists: the cost comparison should stay consistent across UI blocks and be easy to tune when the assumptions change.
What it does: calculates the projected cost of handling the registry work internally versus turning it over to our team, then formats the numbers for the Russian locale.
Connected to: `src/widgets/calculator/BenefitCalculator.astro` and any future estimation widgets that need the same simplified pricing model.
*/

export interface CalculatorInput {
  positions: number;
  hourlyRate: number;
  employees: number;
}

export interface CalculatorResult {
  selfCost: number;
  agencyCost: number;
  savings: number;
}

/*
 * Normalize user input so the calculator stays stable even when a field is cleared or typed into manually.
 * This protects the visual model in the widget and keeps the math predictable on every keystroke.
 */
export function clampInput(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

/*
 * Calculate a compact cost comparison for the landing page.
 * The model intentionally stays simple: it scales work by the number of positions and people involved, then compares internal labor against a turnkey service estimate.
 * This is enough for the page’s UX goal, which is to show a clear directional difference without pretending to be an invoice.
 */
export function calculateBenefitComparison(input: CalculatorInput): CalculatorResult {
  const positions = clampInput(input.positions, 1, 24);
  const hourlyRate = clampInput(input.hourlyRate, 800, 20000);
  const employees = clampInput(input.employees, 1, 50);

  const workload = positions * employees;

  const selfCost = Math.round(workload * hourlyRate * 5.2 + positions * 8500);
  const agencyCost = Math.round(24000 + positions * 3200 + employees * 900 + workload * hourlyRate * 0.12);
  const savings = Math.max(0, selfCost - agencyCost);

  return {
    selfCost,
    agencyCost,
    savings,
  };
}

/*
 * Format money values for the Russian UI.
 * The widget and the result cards use this shared formatter so all figures look consistent and readable.
 */
export function formatRubles(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

/*
 * Format plain numbers for the calculator inputs and summaries.
 * This keeps the labels tidy while avoiding separate local formatting code in the widget.
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(value);
}
