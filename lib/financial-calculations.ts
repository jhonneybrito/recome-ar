export type MainGoal = "Sair das dívidas" | "Criar uma reserva" | "Realizar um sonho" | "Organizar a vida a dois";

export interface FinancialProfile {
  name: string;
  mainGoal: MainGoal;
  civilStatus: "Solteiro(a)" | "Casado(a)" | "União estável" | "Outro";
  financialMoment: "No limite" | "Apertado" | "Estável" | "Em crescimento";
  monthlyIncome: number;
  otherIncome: number;
  fixedExpenses: number;
  variableExpenses: number;
  debtTotal: number;
  debtMonthlyPayments: number;
  debtType: string;
  goalAmount: number;
  currentSavings: number;
  updatedAt: string;
}

export interface FinancialHealth {
  score: number;
  label: "Crítica" | "Atenção" | "Estável" | "Saudável";
  color: "peach" | "neutral" | "green";
  message: string;
}

export const defaultFinancialProfile: FinancialProfile = {
  name: "Marina",
  mainGoal: "Criar uma reserva",
  civilStatus: "Solteiro(a)",
  financialMoment: "Apertado",
  monthlyIncome: 6800,
  otherIncome: 1400,
  fixedExpenses: 2980,
  variableExpenses: 1380,
  debtTotal: 12480,
  debtMonthlyPayments: 740,
  debtType: "Cartão de crédito",
  goalAmount: 10000,
  currentSavings: 6800,
  updatedAt: new Date().toISOString(),
};

export const calculateTotalIncome = (data: FinancialProfile) =>
  Math.max(0, data.monthlyIncome) + Math.max(0, data.otherIncome);

export const calculateMonthlyExpenses = (data: FinancialProfile) =>
  Math.max(0, data.fixedExpenses) + Math.max(0, data.variableExpenses);

export const calculateDebtTotal = (data: Pick<FinancialProfile, "debtTotal">) =>
  Math.max(0, data.debtTotal);

export const calculateDebtMonthlyPayments = (data: Pick<FinancialProfile, "debtMonthlyPayments">) =>
  Math.max(0, data.debtMonthlyPayments);

export const calculateMonthlyBalance = (data: FinancialProfile) =>
  calculateTotalIncome(data) - calculateMonthlyExpenses(data) - calculateDebtMonthlyPayments(data);

export const calculateIncomeCommitment = (data: FinancialProfile) => {
  const income = calculateTotalIncome(data);
  if (income <= 0) return 100;
  return Math.min(999, ((calculateMonthlyExpenses(data) + calculateDebtMonthlyPayments(data)) / income) * 100);
};

export const calculateFinancialHealth = (data: FinancialProfile): FinancialHealth => {
  const income = calculateTotalIncome(data);
  const balance = calculateMonthlyBalance(data);
  const commitment = calculateIncomeCommitment(data);
  const debtRatio = income > 0 ? data.debtMonthlyPayments / income : 1;
  let score = 100 - commitment * 0.65 - debtRatio * 100 * 0.35;
  if (balance < 0) score -= 25;
  if (data.currentSavings <= 0) score -= 8;
  score = Math.max(0, Math.min(100, Math.round(score)));

  if (score < 35) return { score, label: "Crítica", color: "peach", message: "Seu orçamento pede proteção imediata. O primeiro passo é interromper o crescimento das dívidas." };
  if (score < 55) return { score, label: "Atenção", color: "peach", message: "Existe pressão no mês, mas pequenas decisões já podem devolver espaço e previsibilidade." };
  if (score < 75) return { score, label: "Estável", color: "neutral", message: "Sua base está se formando. Agora vale direcionar o saldo com intenção." };
  return { score, label: "Saudável", color: "green", message: "Você tem margem para acelerar metas sem comprometer a segurança do mês." };
};

export const estimateGoalTime = (target: number, current: number, monthlyContribution: number) => {
  const remaining = Math.max(0, target - current);
  if (remaining === 0) return 0;
  if (monthlyContribution <= 0) return null;
  return Math.ceil(remaining / monthlyContribution);
};

export const estimateDebtPayoffTime = (totalDebt: number, monthlyPayment: number) => {
  if (totalDebt <= 0) return 0;
  if (monthlyPayment <= 0) return null;
  return Math.ceil(totalDebt / monthlyPayment);
};

export const calculateAnnualProjection = (data: FinancialProfile) => {
  const income = calculateTotalIncome(data);
  const expenses = calculateMonthlyExpenses(data);
  const payments = calculateDebtMonthlyPayments(data);
  const currentBalance = calculateMonthlyBalance(data);
  const plannedVariableExpenses = data.variableExpenses * 0.9;
  const plannedBalance = income - data.fixedExpenses - plannedVariableExpenses - payments;

  return {
    current: { income: income * 12, expenses: expenses * 12, debtPayments: payments * 12, balance: currentBalance * 12 },
    planned: { income: income * 12, expenses: (data.fixedExpenses + plannedVariableExpenses) * 12, debtPayments: payments * 12, balance: plannedBalance * 12 },
    potentialSavings: Math.max(0, (plannedBalance - currentBalance) * 12),
  };
};

export const calculateFutureSavings = (initial: number, monthlyContribution: number, years: number, monthlyRate = 0.006) => {
  let total = Math.max(0, initial);
  for (let month = 0; month < years * 12; month += 1) {
    total = total * (1 + monthlyRate) + Math.max(0, monthlyContribution);
  }
  return Math.round(total);
};

export const getEstimatedDate = (months: number | null) => {
  if (months === null) return null;
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
};

export const formatDuration = (months: number | null) => {
  if (months === null) return "sem prazo estimado";
  if (months === 0) return "concluído";
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return `${years} ${years === 1 ? "ano" : "anos"}${rest ? ` e ${rest} meses` : ""}`;
};
