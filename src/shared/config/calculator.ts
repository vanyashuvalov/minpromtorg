/*
File purpose: keep the calculator-specific copy and defaults in one reusable source of truth.
Why this exists: the benefit widget needs its own business language, labels, and starting values without mixing them into the global site content model.
What it does: exports the title, explanation, slider labels, comparison captions, and default input values for the calculator widget.
Connected to: `src/widgets/calculator/BenefitCalculator.astro` and the shared calculation helpers in `src/shared/lib/benefit-calculator.ts`.
*/

export const calculatorContent = {
  title: "Калькулятор выгоды",
  lead:
    "Сравните самостоятельное прохождение и сопровождение под ключ по срокам, трудозатратам и бюджету. Модель учитывает, что рост сложности идет нелинейно, когда увеличиваются позиции и число вовлеченных специалистов.",
  sliders: {
    positions: {
      label: "Количество позиций",
      hint: "От 1 до 5",
    },
    hourlyRate: {
      label: "Стоимость часа специалиста",
      hint: "От 500 до 3000 ₽",
    },
    employees: {
      label: "Сотрудников в процессе",
      hint: "От 1 до 5",
    },
  },
  summary: {
    self: {
      label: "Сами",
      title: "Сами внутри компании",
      description:
        "Обычно это 9-12 месяцев, высокая внутренняя загрузка и риск повторных итераций.",
    },
    agency: {
      label: "С нами",
      title: "С нами под ключ",
      description:
        "Обычно это 3-6 месяцев и более короткий путь к результату.",
    },
  },
  benefits: {
    title: "Что показывает блок",
    items: [
      "Срок проекта в месяцах для обоих сценариев",
      "Трудозатраты в часах и экономию времени",
      "Стоимость самостоятельного пути и сопровождения под ключ",
      "Нелинейный рост сложности при увеличении позиций и команды",
    ],
  },
  note:
    "Для самостоятельной работы модель закладывает полную загрузку внутренних специалистов. Для сопровождения учитывается более короткий проектный цикл.",
  cta: {
    label: "Получить КП",
  },
  defaults: {
    positions: 3,
    hourlyRate: 1500,
    employees: 3,
  },
} as const;
