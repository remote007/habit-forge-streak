
export type UserAuth = {
  id: string;
  email: string;
  password: string;
};

export type BadgeInfo = {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiredStreak: number;
};

export type HabitStatus = "completed" | "missed" | null;

export type HabitHistory = Record<string, HabitStatus>;

export type Habit = {
  id: string;
  userId: string;
  name: string;
  targetDays: string[];
  startDate: string;
  history: HabitHistory;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
};

export type HabitFormValues = {
  name: string;
  targetDays: string[];
  startDate: string;
};
