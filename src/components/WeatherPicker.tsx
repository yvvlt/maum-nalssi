"use client";

import { WEATHER_OPTIONS, type Weather } from "@/lib/constants";

interface WeatherPickerProps {
  value: Weather | null;
  onChange: (weather: Weather) => void;
}

export function WeatherPicker({ value, onChange }: WeatherPickerProps) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {WEATHER_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={`flex flex-col items-center gap-1 rounded-2xl border p-3 transition-all ${
                selected
                  ? "border-slate-900 bg-slate-900/5 scale-105 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="text-2xl" aria-hidden>
                {option.emoji}
              </span>
              <span className="text-xs text-slate-600">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
