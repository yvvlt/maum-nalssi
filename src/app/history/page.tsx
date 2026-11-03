"use client";

import { useEffect, useMemo, useState } from "react";
import { MoodCard } from "@/components/MoodCard";
import { WeatherPicker } from "@/components/WeatherPicker";
import { MoodScoreSelector } from "@/components/MoodScoreSelector";
import { WEATHER_OPTIONS, type Weather } from "@/lib/constants";
import type { MoodRecord } from "@/lib/types";

export default function HistoryPage() {
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [weatherFilter, setWeatherFilter] = useState<Weather | "all">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<MoodRecord | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (weatherFilter !== "all") params.set("weather", weatherFilter);
      const res = await fetch(`/api/moods?${params.toString()}`);
      const json = await res.json();
      setRecords(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherFilter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.trim().toLowerCase();
    return records.filter(
      (r) => r.date.includes(q) || (r.memo ?? "").toLowerCase().includes(q)
    );
  }, [records, search]);

  async function handleDelete(record: MoodRecord) {
    const confirmed = window.confirm("이 기록을 삭제하시겠습니까?");
    if (!confirmed) return;
    await fetch(`/api/moods/${record.id}`, { method: "DELETE" });
    setRecords((prev) => prev.filter((r) => r.id !== record.id));
  }

  async function handleSaveEdit() {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/moods/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weather: editing.weather,
          mood_score: editing.mood_score,
          memo: editing.memo,
        }),
      });
      const json = await res.json();
      setRecords((prev) =>
        prev.map((r) => (r.id === editing.id ? json.data : r))
      );
      setEditing(null);
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">지난 마음 기록</h1>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="날짜 또는 메모 검색 (예: 2026-09 또는 발표)"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
        <div className="flex flex-wrap gap-1.5 text-sm">
          <button
            type="button"
            onClick={() => setWeatherFilter("all")}
            className={`rounded-full px-3 py-1 ${
              weatherFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            전체
          </button>
          {WEATHER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setWeatherFilter(option.value)}
              className={`rounded-full px-3 py-1 ${
                weatherFilter === option.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {option.emoji} {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400">불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-400">기록이 없어요.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => (
            <MoodCard
              key={record.id}
              record={record}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5">
            <h2 className="font-semibold">{editing.date} 기록 수정</h2>
            <WeatherPicker
              value={editing.weather}
              onChange={(weather) =>
                setEditing((prev) => (prev ? { ...prev, weather } : prev))
              }
            />
            <MoodScoreSelector
              value={editing.mood_score}
              onChange={(mood_score) =>
                setEditing((prev) => (prev ? { ...prev, mood_score } : prev))
              }
            />
            <textarea
              value={editing.memo ?? ""}
              onChange={(e) =>
                setEditing((prev) =>
                  prev ? { ...prev, memo: e.target.value } : prev
                )
              }
              rows={3}
              maxLength={200}
              className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full px-4 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {savingEdit ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
