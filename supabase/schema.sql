-- 마음날씨 mood_records 테이블
-- Supabase 대시보드 > SQL Editor 에서 이 파일 내용을 그대로 실행하세요.

create extension if not exists "pgcrypto";

create table if not exists public.mood_records (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  weather text not null check (
    weather in ('sunny', 'partly_cloudy', 'cloudy', 'rainy', 'stormy', 'rainbow')
  ),
  mood_score smallint not null check (mood_score between 1 and 5),
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mood_records_date_idx on public.mood_records (date desc);

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_mood_records_updated_at on public.mood_records;
create trigger set_mood_records_updated_at
  before update on public.mood_records
  for each row
  execute function public.set_updated_at();

-- 로그인 기능이 없는 개인/과제용 프로젝트이므로 RLS를 비활성화합니다.
-- 여러 명이 함께 쓰는 배포 환경이라면 RLS를 켜고 적절한 정책을 추가하세요.
alter table public.mood_records disable row level security;
