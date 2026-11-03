import type { Weather } from "./constants";

export interface MoodRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weather: Weather;
  mood_score: number; // 1~5
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export interface MoodRecordInput {
  date: string;
  weather: Weather;
  mood_score: number;
  memo?: string | null;
}

export interface MonthlyStatistics {
  totalDays: number;
  weatherCounts: Record<Weather, number>;
  topWeather: Weather | null;
  averageMoodScore: number;
  recentTrend: { date: string; mood_score: number }[];
}
