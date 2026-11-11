"use client";

import { useEffect, useMemo, useState } from "react";
import { MoodModal } from "@/components/MoodModal";
import { WEATHER_MAP } from "@/lib/constants";
import { toDateStr, toMonthStr } from "@/lib/date";
import type { MoodRecord } from "@/lib/types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function buildCalendarGrid(year: number, month: number) {
  // month: 0-indexed (Date 기준)
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function HomePage() {
  const today = toDateStr(new Date());
  const todayMonth = today.slice(0, 7);

  const [cursor, setCursor] = useState(() => new Date());
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthStr = toMonthStr(cursor);
  const isCurrentMonth = monthStr === todayMonth;
  const isFutureMonth = monthStr > todayMonth;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/moods?month=${monthStr}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "불러오기 실패");
        if (!cancelled) setRecords(json.data ?? []);
      } catch {
        if (!cancelled) setLoadError("기록을 불러오지 못했습니다.");
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
  const todayRecord = recordsByDate.get(today);

  function handleSaved(saved: MoodRecord) {
    setRecords((prev) => {
      const without = prev.filter((r) => r.id !== saved.id && r.date !== saved.date);
      return [...without, saved];
    });
    setSelectedDate(null);
  }

  function handleDeleted(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setSelectedDate(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          오늘 당신의 마음 날씨는 어떤가요?
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {todayRecord
            ? `오늘은 ${WEATHER_MAP[todayRecord.weather].emoji} ${WEATHER_MAP[todayRecord.weather].label}으로 기록했어요. 날짜를 눌러 다른 날도 남겨보세요.`
            : "날짜를 눌러 그날의 마음날씨를 기록해보세요."}
        </p>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 backdrop-blur-sm p-3">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="rounded-full px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
        >
          ← 이전 달
        </button>
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">
            {year}년 {month + 1}월
          </h2>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => setCursor(new Date())}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200"
            >
              오늘
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          disabled={isCurrentMonth || isFutureMonth}
          className="rounded-full px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          다음 달 →
        </button>
      </div>

      <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-sm p-3 sm:p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`blank-${idx}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const record = recordsByDate.get(dateStr);
            const weather = record ? WEATHER_MAP[record.weather] : null;
            const isFuture = dateStr > today;
            const isToday = dateStr === today;

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isFuture}
                onClick={() => setSelectedDate(dateStr)}
                aria-label={
                  record
                    ? `${month + 1}월 ${day}일 ${weather?.label ?? ""} 기록 보기`
                    : isFuture
                      ? `${month + 1}월 ${day}일`
                      : `${month + 1}월 ${day}일 기록하기`
                }
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-xs transition-colors ${
                  isFuture
                    ? "cursor-not-allowed opacity-30"
                    : "hover:bg-slate-100"
                } ${isToday ? "ring-2 ring-slate-900" : ""}`}
              >
                <span
                  className={isToday ? "font-semibold text-slate-900" : "text-slate-400"}
                >
                  {day}
                </span>
                <span className="text-lg leading-none sm:text-xl">
                  {weather?.emoji ?? (isFuture ? "" : "·")}
                </span>
              </button>
            );
          })}
        </div>
        {loading && (
          <p className="mt-2 text-center text-xs text-slate-400">불러오는 중...</p>
        )}
        {loadError && (
          <p className="mt-2 text-center text-xs text-red-600">{loadError}</p>
        )}
      </div>

      {selectedDate && (
        <MoodModal
          key={selectedDate}
          date={selectedDate}
          record={recordsByDate.get(selectedDate) ?? null}
          onClose={() => setSelectedDate(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
