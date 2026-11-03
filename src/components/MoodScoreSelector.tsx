"use client";

import { MOOD_SCORE_LABELS } from "@/lib/constants";

interface MoodScoreSelectorProps {
  value: number;
  onChange: (score: number) => void;
}

export function MoodScoreSelector({ value, onChange }: MoodScoreSelectorProps) {
  return (
    <div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            aria-label={`${score}점: ${MOOD_SCORE_LABELS[score]}`}
            onClick={() => onChange(score)}
            className="text-3xl leading-none"
          >
            <span className={score <= value ? "opacity-100" : "opacity-25"}>
              ★
            </span>
          </button>
        ))}
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {value ? MOOD_SCORE_LABELS[value] : "오늘의 기분을 선택해주세요"}
      </p>
    </div>
  );
}
