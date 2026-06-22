export type MissionCategory = "organização" | "economia" | "dívidas" | "aprendizado";

export interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  points: number;
  category: MissionCategory;
  completed: boolean;
}

export interface GamificationState {
  weekKey: string;
  points: number;
  weeklyBonusClaimed: boolean;
  streak: number;
  lastCompletedWeek: string | null;
  missions: WeeklyMission[];
}

export const getWeekKey = (date = new Date()) => {
  const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((current.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${current.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

export const defaultMissions = (): WeeklyMission[] => [
  { id: "review-week", title: "Revisar meus gastos", description: "Reserve 10 minutos para conferir as movimentações da semana.", points: 40, category: "organização", completed: false },
  { id: "no-spend", title: "Fazer um dia sem gastos", description: "Escolha um dia para não realizar nenhuma compra não essencial.", points: 60, category: "economia", completed: false },
  { id: "save-value", title: "Guardar um pequeno valor", description: "Transfira qualquer valor possível para sua meta principal.", points: 80, category: "economia", completed: false },
  { id: "money-conversation", title: "Tomar uma decisão consciente", description: "Adie, renegocie ou planeje uma compra antes de realizá-la.", points: 70, category: "aprendizado", completed: false },
];

export const createInitialGamification = (): GamificationState => ({
  weekKey: getWeekKey(),
  points: 0,
  weeklyBonusClaimed: false,
  streak: 0,
  lastCompletedWeek: null,
  missions: defaultMissions(),
});

export const getLevel = (points: number) => {
  const levels = [
    { name: "Primeiro passo", min: 0, next: 300 },
    { name: "Em movimento", min: 300, next: 800 },
    { name: "Consistente", min: 800, next: 1500 },
    { name: "Vida em ordem", min: 1500, next: 2500 },
    { name: "Mestre do recomeço", min: 2500, next: 4000 },
  ];
  return [...levels].reverse().find((level) => points >= level.min) || levels[0];
};

export const getBadges = (state: GamificationState) => [
  { name: "Primeira vitória", description: "Conclua sua primeira missão.", unlocked: state.missions.some((mission) => mission.completed) || state.points > 0 },
  { name: "Semana completa", description: "Conclua todas as missões semanais.", unlocked: state.weeklyBonusClaimed },
  { name: "Ritmo de mudança", description: "Mantenha uma sequência de 2 semanas.", unlocked: state.streak >= 2 },
  { name: "Centena consciente", description: "Acumule 500 pontos.", unlocked: state.points >= 500 },
];
