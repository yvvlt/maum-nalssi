"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WEATHER_MAP } from "@/lib/constants";
import { toMonthStr, formatDisplayDate } from "@/lib/date";
import type { MoodRecord } from "@/lib/types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function buildCalendarGrid(year: number, month: number) {
  // month: 0-indexed (Date 기준)
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthStr = toMonthStr(cursor);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/moods?month=${monthStr}`);
        const json = await res.json();
        if (!cancelled) setRecords(json.data ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [monthStr]);

  const recordsByDate = useMemo(() => {
    const map = new Map<string, MoodRecord>();
    for (const record of records) map.set(record.date, record);
    return map;
  }, [records]);

  const cells = useMemo(() => buildCalendarGrid(year, month), [year, month]);
  const selectedRecord = selectedDate ? recordsByDate.get(selectedDate) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="rounded-full px-3 py-1 text-slate-500 hover:bg-slate-100"
        >
          ← 이전 달
        </button>
        <h1 className="font-semibold">
          {year}년 {month + 1}월
        </h1>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="rounded-full px-3 py-1 text-slate-500 hover:bg-slate-100"
        >
          다음 달 →
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={idx} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const record = recordsByDate.get(dateStr);
            const weather = record ? WEATHER_MAP[record.weather] : null;
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-xs transition-colors ${
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "hover:bg-slate-100"
                }`}
              >
                <span className={isSelected ? "text-white" : "text-slate-400"}>
                  {day}
                </span>
                <span className="text-base leading-none">
                  {weather?.emoji ?? "·"}
                </span>
              </button>
            );
          })}
        </div>
        {loading && (
          <p className="mt-2 text-center text-xs text-slate-400">
            불러오는 중...
          </p>
        )}
      </div>

      {selectedDate && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">
            {formatDisplayDate(selectedDate)}
          </p>
          {selectedRecord ? (
            <div className="mt-2 space-y-1">
              <p className="text-2xl">
                {WEATHER_MAP[selectedRecord.weather].emoji}{" "}
                {WEATHER_MAP[selectedRecord.weather].label}
              </p>
              <p className="text-slate-700">
                {selectedRecord.memo || (
                  <span className="text-slate-400">메모 없음</span>
                )}
              </p>
              <p className="text-xs text-slate-400">
                기분 {selectedRecord.mood_score}/5
              </p>
              <Link
                href="/history"
                className="inline-block pt-2 text-sm underline decoration-dotted underline-offset-4"
              >
                기록 수정·삭제는 History에서 →
              </Link>
            </div>
          ) : (
            <p className="mt-2 text-slate-400">이 날짜에는 기록이 없어요.</p>
          )}
        </div>
      )}
    </div>
  );
}
