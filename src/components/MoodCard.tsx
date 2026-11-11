"use client";

import { WEATHER_MAP } from "@/lib/constants";
import type { MoodRecord } from "@/lib/types";

interface MoodCardProps {
  record: MoodRecord;
  onEdit?: (record: MoodRecord) => void;
  onDelete?: (record: MoodRecord) => void;
}

export function MoodCard({ record, onEdit, onDelete }: MoodCardProps) {
  const weather = WEATHER_MAP[record.weather];

  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/70 bg-white/80 backdrop-blur-sm p-4">
      <div className="flex gap-3">
        <span className="text-2xl" aria-hidden>
          {weather?.emoji ?? "❓"}
        </span>
        <div>
          <p className="text-sm text-slate-500">{record.date}</p>
          <p className="mt-1 text-slate-800">
            {record.memo || <span className="text-slate-400">메모 없음</span>}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            기분 {record.mood_score}/5
          </p>
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex shrink-0 gap-2 text-sm">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(record)}
              className="rounded-full px-2 py-1 text-slate-500 hover:bg-slate-100"
            >
              수정
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(record)}
              className="rounded-full px-2 py-1 text-red-500 hover:bg-red-50"
            >
              삭제
            </button>
          )}
        </div>
      )}
    </div>
  );
}
