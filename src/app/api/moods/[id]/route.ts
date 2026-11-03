import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MoodRecordInput } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/moods/:id
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("mood_records")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ data });
}

// PUT /api/moods/:id  (기능 8: 기록 수정 - 마음날씨/감정 점수/한 줄 메모)
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const body: Partial<MoodRecordInput> = await request.json();

  const { data, error } = await supabase
    .from("mood_records")
    .update({
      ...(body.weather ? { weather: body.weather } : {}),
      ...(body.mood_score ? { mood_score: body.mood_score } : {}),
      ...(body.memo !== undefined ? { memo: body.memo } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE /api/moods/:id (기능 9: 기록 삭제)
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("mood_records").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
