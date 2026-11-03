"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WeatherPicker } from "@/components/WeatherPicker";
import { MoodScoreSelector } from "@/components/MoodScoreSelector";
import { DEFAULT_THEME, WEATHER_MAP, type Weather } from "@/lib/constants";
import { toDateStr, formatDisplayDate } from "@/lib/date";
import type { MoodRecord } from "@/lib/types";

export default function HomePage() {
  const today = toDateStr(new Date());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<MoodRecord | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [moodScore, setMoodScore] = useState(0);
  const [memo, setMemo] = useState("");
  const [savedJustNow, setSavedJustNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadToday() {
      try {
        const res = await fetch(`/api/moods?date=${today}`);
        const json = await res.json();
        const record: MoodRecord | undefined = json.data?.[0];
        if (record) {
          setExisting(record);
          setWeather(record.weather);
          setMoodScore(record.mood_score);
          setMemo(record.memo ?? "");
        }
      } catch {
        setError("오늘의 기록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }
    loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const theme = weather ? WEATHER_MAP[weather].theme : DEFAULT_THEME;

  async function handleSave() {
    if (!weather || !moodScore) {
      setError("마음날씨와 오늘의 기분을 모두 선택해주세요.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (existing) {
        const res = await fetch(`/api/moods/${existing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weather, mood_score: moodScore, memo }),
        });
        if (!res.ok) throw new Error("수정 중 오류가 발생했습니다.");
        const json = await res.json();
        setExisting(json.data);
      } else {
        const res = await fetch(`/api/moods`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: today,
            weather,
            mood_score: moodScore,
            memo,
          }),
        });
        const json = await res.json();
        if (res.status === 409) {
          // 기능 5: 날짜 중복 확인
          const confirmed = window.confirm(json.message);
          if (confirmed) {
            const putRes = await fetch(`/api/moods/${json.existingId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ weather, mood_score: moodScore, memo }),
            });
            const putJson = await putRes.json();
            setExisting(putJson.data);
          } else {
            setSaving(false);
            return;
          }
        } else if (!res.ok) {
          throw new Error(json.error ?? "저장 중 오류가 발생했습니다.");
        } else {
          setExisting(json.data);
        }
      }
      setSavedJustNow(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-400">불러오는 중...</p>;
  }

  return (
    <div
      className={`-mx-4 -mt-6 min-h-[calc(100vh-4rem)] bg-gradient-to-b px-4 pt-8 pb-10 sm:rounded-3xl ${theme.gradient} ${theme.text}`}
    >
      <div className="mx-auto max-w-xl space-y-8">
        <div>
          <p className="text-sm opacity-70">{formatDisplayDate(today)}</p>
          <h1 className="mt-1 text-2xl font-semibold">
            오늘 당신의 마음 날씨는 어떤가요?
          </h1>
          {existing && (
            <p className="mt-2 text-sm opacity-70">
              오늘 이미 기록한 마음날씨가 있어요. 아래에서 수정할 수 있어요.
            </p>
          )}
        </div>

        <section>
          <WeatherPicker value={weather} onChange={setWeather} />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium opacity-70">오늘의 기분</h2>
          <MoodScoreSelector value={moodScore} onChange={setMoodScore} />
        </section>

        <section>
          <label className="mb-2 block text-sm font-medium opacity-70">
            오늘 하루는 어땠나요?
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="한 줄로 짧게 남겨보세요 (선택)"
            className="w-full resize-none rounded-2xl border border-black/10 bg-white/70 p-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          />
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-slate-900 px-6 py-2.5 font-medium text-white transition-opacity disabled:opacity-50"
          >
            {saving ? "저장 중..." : "기록하기"}
          </button>
          {savedJustNow && (
            <Link
              href="/calendar"
              className="text-sm underline decoration-dotted underline-offset-4"
            >
              저장 완료! 캘린더에서 확인하기 →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
