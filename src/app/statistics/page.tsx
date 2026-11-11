"use client";

import { useEffect, useMemo, useState } from "react";
import { WEATHER_OPTIONS, WEATHER_MAP, type Weather } from "@/lib/constants";
import { toMonthStr } from "@/lib/date";
import type { MoodRecord } from "@/lib/types";

export default function StatisticsPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const monthStr = toMonthStr(cursor);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

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

  const stats = useMemo(() => {
    const weatherCounts: Partial<Record<Weather, number>> = {};
    let scoreSum = 0;
    for (const r of records) {
      weatherCounts[r.weather] = (weatherCounts[r.weather] ?? 0) + 1;
      scoreSum += r.mood_score;
    }
    const topEntry = Object.entries(weatherCounts).sort(
      (a, b) => b[1] - a[1]
    )[0] as [Weather, number] | undefined;

    const maxCount = Math.max(1, ...Object.values(weatherCounts));
    const recentTrend = [...records]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    return {
      totalDays: records.length,
      weatherCounts,
      topWeather: topEntry?.[0] ?? null,
      averageMoodScore: records.length ? scoreSum / records.length : 0,
      maxCount,
      recentTrend,
    };
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 backdrop-blur-sm p-4">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="rounded-full px-3 py-1 text-slate-500 hover:bg-slate-100"
        >
          ← 이전 달
        </button>
        <h1 className="font-semibold">
          {year}년 {month + 1}월 마음날씨 통계
        </h1>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="rounded-full px-3 py-1 text-slate-500 hover:bg-slate-100"
        >
          다음 달 →
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400">불러오는 중...</p>
      ) : stats.totalDays === 0 ? (
        <p className="text-slate-400">이 달에는 기록이 없어요.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-sm p-4">
              <p className="text-xs text-slate-400">총 기록 일수</p>
              <p className="mt-1 text-2xl font-semibold">
                {stats.totalDays}일
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-sm p-4">
              <p className="text-xs text-slate-400">평균 기분</p>
              <p className="mt-1 text-2xl font-semibold">
                {stats.averageMoodScore.toFixed(1)} / 5
              </p>
            </div>
          </div>

          {stats.topWeather && (
            <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-sm p-4 text-center">
              <p className="text-xs text-slate-400">가장 많았던 마음날씨</p>
              <p className="mt-1 text-3xl">
                {WEATHER_MAP[stats.topWeather].emoji}
              </p>
              <p className="text-sm text-slate-600">
                {WEATHER_MAP[stats.topWeather].label}
              </p>
            </div>
          )}

          <div className="space-y-2 rounded-2xl border border-white/70 bg-white/80 backdrop-blur-sm p-4">
            <p className="text-xs text-slate-400">마음날씨 분포</p>
            {WEATHER_OPTIONS.map((option) => {
              const count = stats.weatherCounts[option.value] ?? 0;
              const width = (count / stats.maxCount) * 100;
              return (
                <div key={option.value} className="flex items-center gap-2">
                  <span className="w-6 text-center">{option.emoji}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-800"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs text-slate-500">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 rounded-2xl border border-white/70 bg-white/80 backdrop-blur-sm p-4">
            <p className="text-xs text-slate-400">최근 감정 변화</p>
            <div className="flex items-end gap-2">
              {stats.recentTrend.map((r) => (
                <div key={r.date} className="flex flex-col items-center gap-1">
                  <div
                    className="w-6 rounded-t bg-slate-800"
                    style={{ height: `${r.mood_score * 8}px` }}
                  />
                  <span className="text-[10px] text-slate-400">
                    {r.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
