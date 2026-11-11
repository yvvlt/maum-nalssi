"use client";

import { useEffect, useState } from "react";
import { WeatherPicker } from "./WeatherPicker";
import { MoodScoreSelector } from "./MoodScoreSelector";
import { DEFAULT_THEME, WEATHER_MAP, type Weather } from "@/lib/constants";
import { formatDisplayDate } from "@/lib/date";
import type { MoodRecord } from "@/lib/types";

interface MoodModalProps {
  /** YYYY-MM-DD */
  date: string;
  /** 이미 기록이 있으면 수정 모드, 없으면 새 기록 모드 */
  record: MoodRecord | null;
  onClose: () => void;
  onSaved: (record: MoodRecord) => void;
  onDeleted: (id: string) => void;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

export function MoodModal({
  date,
  record,
  onClose,
  onSaved,
  onDeleted,
}: MoodModalProps) {
  const [weather, setWeather] = useState<Weather | null>(
    record?.weather ?? null
  );
  const [moodScore, setMoodScore] = useState(record?.mood_score ?? 0);
  const [memo, setMemo] = useState(record?.memo ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Esc 키로 닫기
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const theme = weather ? WEATHER_MAP[weather].theme : DEFAULT_THEME;

  async function handleSave() {
    if (!weather || !moodScore) {
      setError("마음날씨와 기분 점수를 모두 선택해주세요.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const payload = { weather, mood_score: moodScore, memo };
      let res: Response;

      if (record) {
        res = await fetch(`/api/moods/${record.id}`, {
          method: "PUT",
          headers: JSON_HEADERS,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/moods", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({ date, ...payload }),
        });

        // 기능 5: 날짜 중복 확인 (다른 기기에서 먼저 기록한 경우 등)
        if (res.status === 409) {
          const conflict = await res.json();
          const overwrite = window.confirm(
            "이 날짜의 마음날씨가 이미 기록되어 있습니다. 수정하시겠습니까?"
          );
          if (!overwrite) {
            setBusy(false);
            return;
          }
          res = await fetch(`/api/moods/${conflict.existingId}`, {
            method: "PUT",
            headers: JSON_HEADERS,
            body: JSON.stringify(payload),
          });
        }
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "저장 중 오류가 발생했습니다.");
      onSaved(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!record) return;
    if (!window.confirm("이 기록을 삭제하시겠습니까?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/moods/${record.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 중 오류가 발생했습니다.");
      onDeleted(record.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${formatDisplayDate(date)} 마음날씨 기록`}
      onClick={onClose}
    >
      <div
        className={`max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-gradient-to-b p-6 shadow-xl sm:rounded-3xl ${theme.gradient} ${theme.text}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm opacity-70">{formatDisplayDate(date)}</p>
            <h2 className="mt-1 text-xl font-semibold">
              {record
                ? "이 날의 마음날씨"
                : "이 날의 마음 날씨는 어땠나요?"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-full px-2 py-1 text-xl leading-none opacity-60 hover:bg-black/5 hover:opacity-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <WeatherPicker value={weather} onChange={setWeather} />

          <div>
            <h3 className="mb-2 text-sm font-medium opacity-70">기분</h3>
            <MoodScoreSelector value={moodScore} onChange={setMoodScore} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium opacity-70">
              한 줄 메모
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="한 줄로 짧게 남겨보세요 (선택)"
              className="w-full resize-none rounded-2xl border border-black/10 bg-white/70 p-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between gap-3">
            {record ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="rounded-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                삭제
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="rounded-full px-4 py-2 text-sm opacity-70 hover:bg-black/5 disabled:opacity-40"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={busy}
                className="rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {busy ? "저장 중..." : record ? "수정하기" : "기록하기"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
