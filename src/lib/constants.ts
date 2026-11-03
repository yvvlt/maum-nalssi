export type Weather =
  | "sunny"
  | "partly_cloudy"
  | "cloudy"
  | "rainy"
  | "stormy"
  | "rainbow";

export interface WeatherOption {
  value: Weather;
  label: string;
  emoji: string;
  /** 기능 13: 선택한 마음날씨에 따른 화면 분위기 */
  theme: {
    gradient: string;
    text: string;
  };
}

export const WEATHER_OPTIONS: WeatherOption[] = [
  {
    value: "sunny",
    label: "맑음",
    emoji: "☀️",
    theme: {
      gradient: "from-amber-100 via-yellow-50 to-sky-100",
      text: "text-amber-900",
    },
  },
  {
    value: "partly_cloudy",
    label: "구름 조금",
    emoji: "🌤️",
    theme: {
      gradient: "from-sky-100 via-slate-50 to-sky-50",
      text: "text-sky-900",
    },
  },
  {
    value: "cloudy",
    label: "흐림",
    emoji: "☁️",
    theme: {
      gradient: "from-slate-200 via-slate-100 to-slate-50",
      text: "text-slate-700",
    },
  },
  {
    value: "rainy",
    label: "비",
    emoji: "🌧️",
    theme: {
      gradient: "from-slate-400 via-slate-300 to-slate-200",
      text: "text-slate-900",
    },
  },
  {
    value: "stormy",
    label: "폭풍",
    emoji: "⛈️",
    theme: {
      gradient: "from-slate-700 via-slate-600 to-slate-500",
      text: "text-white",
    },
  },
  {
    value: "rainbow",
    label: "무지개",
    emoji: "🌈",
    theme: {
      gradient: "from-pink-100 via-yellow-50 to-sky-100",
      text: "text-purple-900",
    },
  },
];

export const WEATHER_MAP: Record<Weather, WeatherOption> = WEATHER_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option;
    return acc;
  },
  {} as Record<Weather, WeatherOption>
);

export const MOOD_SCORE_LABELS: Record<number, string> = {
  1: "매우 좋지 않음",
  2: "좋지 않음",
  3: "보통",
  4: "좋음",
  5: "매우 좋음",
};

export const DEFAULT_THEME = {
  gradient: "from-slate-100 via-white to-slate-50",
  text: "text-slate-800",
};
