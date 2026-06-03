/*
File purpose: encapsulate the reusable math and number formatting behind the landing-page calculator.
Why this exists: the comparison needs to stay consistent across UI states, while the business assumptions remain easy to tune later.
What it does: calculates the self-managed and assisted project scenarios, including time, hours, money, and a blended complexity score.
Connected to: `src/widgets/calculator/BenefitCalculator.astro` and any future estimation widgets that should reuse the same model.
*/

export interface BenefitCalculatorInput {
  positions: number;
  hourlyRate: number;
  employees: number;
}

export interface BenefitScenario {
  months: number;
  hours: number;
  cost: number;
}

export interface BenefitComparison {
  complexity: number;
  self: BenefitScenario;
  agency: BenefitScenario;
  savings: BenefitScenario;
  selfLoadFactor: number;
  agencyLoadFactor: number;
}

const WORK_HOURS_IN_MONTH = 160;

/*
 * Clamp any numeric input to a safe range so the calculator stays stable while the sliders move.
 * This protects the business model from empty states, out-of-range values, and manual input noise.
 */
export function clampInput(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

/*
 * Convert the raw slider values into a normalized complexity score.
 * The formula intentionally grows nonlinearly so that extra positions and team members increase load faster than a plain linear model.
 */
function getComplexityScore(input: BenefitCalculatorInput): number {
  const positions = clampInput(input.positions, 1, 5);
  const employees = clampInput(input.employees, 1, 5);

  const positionsFactor = (positions - 1) / 4;
  const employeesFactor = (employees - 1) / 4;
  const interactionFactor = positionsFactor * employeesFactor;

  return clampInput(
    0.12 + positionsFactor * 0.48 + employeesFactor * 0.32 + interactionFactor * 0.24,
    0,
    1,
  );
}

/*
 * Derive the project duration in months from the complexity score.
 * The output stays inside the business ranges we want to communicate: 9-12 months for the self-managed path and 3-6 months for the assisted one.
 */
function getMonthsFromComplexity(baseMonths: number, complexity: number): number {
  return Math.round(baseMonths + complexity * 3);
}

/*
 * Estimate work hours for each scenario.
 * The self-managed path carries extra coordination overhead, while the assisted path stays closer to a compact expert workflow.
 */
function getScenarioHours(
  months: number,
  positions: number,
  employees: number,
  baseMultiplier: number,
  positionWeight: number,
  employeeWeight: number,
  interactionWeight: number,
): number {
  const positionsFactor = (positions - 1) / 4;
  const employeesFactor = (employees - 1) / 4;
  const interactionFactor = positionsFactor * employeesFactor;

  return Math.round(
    months *
      WORK_HOURS_IN_MONTH *
      (baseMultiplier +
        positionsFactor * positionWeight +
        employeesFactor * employeeWeight +
        interactionFactor * interactionWeight),
  );
}

/*
 * Estimate the monetary value of a scenario from the calculated hours and the user's hourly rate.
 * The model adds a small fixed overhead so the numbers reflect coordination, validation, and rework rather than raw labor only.
 */
function getScenarioCost(
  hours: number,
  hourlyRate: number,
  baseMultiplier: number,
  positions: number,
  employees: number,
  positionOverhead: number,
  employeeOverhead: number,
  fixedOverhead: number,
): number {
  return Math.round(
    hours * hourlyRate * baseMultiplier +
      positions * positionOverhead +
      employees * employeeOverhead +
      fixedOverhead,
  );
}

/*
 * Build the comparison object consumed by the calculator widget.
 * This keeps the display layer simple and gives us one place to tune the business assumptions if the pricing model changes later.
 */
export function calculateBenefitComparison(input: BenefitCalculatorInput): BenefitComparison {
  const positions = clampInput(input.positions, 1, 5);
  const hourlyRate = clampInput(input.hourlyRate, 500, 3000);
  const employees = clampInput(input.employees, 1, 5);
  const complexity = getComplexityScore({ positions, hourlyRate, employees });

  const selfMonths = getMonthsFromComplexity(9, complexity);
  const agencyMonths = getMonthsFromComplexity(3, complexity);

  const selfHours = getScenarioHours(selfMonths, positions, employees, 0.95, 0.16, 0.11, 0.08);
  const agencyHours = getScenarioHours(agencyMonths, positions, employees, 1.04, 0.08, 0.05, 0.04);

  const selfCost = getScenarioCost(selfHours, hourlyRate, 0.38, positions, employees, 25_000, 12_000, 0);
  const agencyCost = getScenarioCost(agencyHours, hourlyRate, 0.22, positions, employees, 20_000, 10_000, 90_000);

  const savings = {
    months: Math.max(0, selfMonths - agencyMonths),
    hours: Math.max(0, selfHours - agencyHours),
    cost: Math.max(0, selfCost - agencyCost),
  };

  return {
    complexity,
    selfLoadFactor: 1 + complexity * 0.22,
    agencyLoadFactor: 1 + complexity * 0.08,
    self: {
      months: selfMonths,
      hours: selfHours,
      cost: selfCost,
    },
    agency: {
      months: agencyMonths,
      hours: agencyHours,
      cost: agencyCost,
    },
    savings,
  };
}

/*
 * Format a plain number for the Russian UI.
 * The calculator uses this for slider labels, counters, and any non-monetary numeric output.
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(value);
}

/*
 * Format an hour count for the comparison cards.
 * Keeping the suffix in one helper prevents the widget from repeating the same string logic in multiple places.
 */
export function formatHours(value: number): string {
  return `${formatNumber(value)} ч`;
}

/*
 * Format a month count for the comparison cards.
 * The output stays intentionally compact because the card headline needs to remain easy to scan.
 */
export function formatMonths(value: number): string {
  return `${formatNumber(value)} мес.`;
}

/*
 * Format currency in full rubles for dense details and fallback text.
 * This mirrors the existing project-wide locale formatting approach and stays compatible with the rest of the site.
 */
export function formatRubles(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

/*
 * Format large ruble values in compact business language.
 * This is used in the calculator cards so the user sees clean million/thousand labels instead of long digit strings.
 */
export function formatCompactRubles(value: number): string {
  const absoluteValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absoluteValue >= 1_000_000) {
    return `${sign}${formatDecimal(absoluteValue / 1_000_000)} млн ₽`;
  }

  if (absoluteValue >= 1_000) {
    return `${sign}${formatDecimal(absoluteValue / 1_000)} тыс. ₽`;
  }

  return `${sign}${formatNumber(absoluteValue)} ₽`;
}

/*
 * Format a decimal value with a single meaningful fraction digit.
 * This keeps compact monetary labels readable without introducing noisy precision.
 */
function formatDecimal(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}
