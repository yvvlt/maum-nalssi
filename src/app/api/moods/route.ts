import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MoodRecordInput } from "@/lib/types";

// GET /api/moods?month=YYYY-MM&weather=sunny
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // e.g. 2026-09
    const weather = searchParams.get("weather");
    const date = searchParams.get("date"); // e.g. 2026-09-15

    let query = supabase
      .from("mood_records")
      .select("*")
      .order("date", { ascending: false });

    if (date) {
      query = query.eq("date", date);
    }

    if (month) {
      const start = `${month}-01`;
      const [year, m] = month.split("-").map(Number);
      const endDate = new Date(year, m, 1); // 다음 달 1일
      const end = endDate.toISOString().slice(0, 10);
      query = query.gte("date", start).lt("date", end);
    }

    if (weather) {
      query = query.eq("weather", weather);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "알 수 없는 오류" },
      { status: 500 }
    );
  }
}

// POST /api/moods
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const body: MoodRecordInput = await request.json();

    if (!body.date || !body.weather || !body.mood_score) {
      return NextResponse.json(
        { error: "date, weather, mood_score는 필수입니다." },
        { status: 400 }
      );
    }

    // 미래 날짜는 기록할 수 없다. (서버는 UTC 기준이라 한국 시간 대비 하루 여유를 둔다)
    const latestAllowed = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    if (body.date > latestAllowed) {
      return NextResponse.json(
        { error: "미래 날짜에는 기록할 수 없습니다." },
        { status: 400 }
      );
    }

    // 기능 5: 날짜 중복 확인 - 하루에 하나의 기록만 허용
    const { data: existing, error: existingError } = await supabase
      .from("mood_records")
      .select("id")
      .eq("date", body.date)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        {
          error: "DUPLICATE_DATE",
          message: "오늘의 마음날씨가 이미 기록되어 있습니다. 수정하시겠습니까?",
          existingId: existing.id,
        },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("mood_records")
      .insert({
        date: body.date,
        weather: body.weather,
        mood_score: body.mood_score,
        memo: body.memo ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "알 수 없는 오류" },
      { status: 500 }
    );
  }
}
