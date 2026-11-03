# 마음날씨 (Maum Nalssi)

> "오늘 당신의 마음 날씨는 어떤가요?"

하루의 감정을 날씨 아이콘으로 간단하게 기록하고, 달력과 통계로 감정 흐름을 돌아볼 수 있는 감정 기록 웹앱입니다.

## 기술 스택

- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS
- Backend: Next.js API Routes
- Database: Supabase (PostgreSQL)
- 배포: GitHub + Vercel

## 처음 시작하기

### 1. 의존성 설치

이 프로젝트는 아직 `npm install`을 실행하지 않은 상태입니다. **VS Code 터미널에서 직접 실행해주세요.**

```bash
npm install
```

### 2. Supabase 프로젝트 만들기

1. https://supabase.com 에서 새 프로젝트를 생성합니다.
2. 프로젝트의 **SQL Editor**에 들어가 `supabase/schema.sql` 파일 내용을 그대로 붙여넣고 실행해 `mood_records` 테이블을 만듭니다.
3. **Project Settings > API** 메뉴에서 `Project URL`과 `anon public` 키를 확인합니다.

### 3. 환경 변수 설정

`.env.local.example` 파일을 복사해 `.env.local` 파일을 만들고 값을 채워주세요.

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버(API Route)에서만 쓰는 비밀 키입니다. RLS가 켜져 있어 이 키가 없으면 저장/조회가 실패합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속하면 됩니다.

## 폴더 구조

```
src/
  app/
    page.tsx              # HOME - 오늘의 마음날씨 기록
    calendar/page.tsx      # CALENDAR - 월간 캘린더
    history/page.tsx       # HISTORY - 전체 기록 / 필터 / 수정 / 삭제
    statistics/page.tsx    # STATISTICS - 월간 통계
    api/moods/route.ts         # GET(목록) / POST(생성)
    api/moods/[id]/route.ts    # GET(단건) / PUT(수정) / DELETE(삭제)
  components/           # WeatherPicker, MoodScoreSelector, Nav, MoodCard
  lib/
    constants.ts         # 날씨 종류, 감정 점수 라벨, 테마
    types.ts              # MoodRecord 타입
    date.ts               # 날짜 포맷 유틸
    supabase/             # Supabase client/server 헬퍼
supabase/schema.sql     # mood_records 테이블 생성 SQL
```

## 현재 구현된 기능

- 오늘의 마음날씨 기록 (날씨 선택 + 감정 점수 1~5 + 한 줄 메모)
- 하루 1개 기록 제한 및 중복 확인 (이미 기록이 있으면 수정으로 전환)
- 월간 캘린더에서 날짜별 마음날씨 아이콘 확인
- 전체 기록 목록, 날씨별 필터, 날짜/메모 검색, 수정, 삭제
- 월간 통계 (총 기록일수, 날씨별 분포, 가장 많은 마음날씨, 평균 기분, 최근 감정 변화)
- 선택한 마음날씨에 따라 홈 화면 배경 테마 변경

## 다음에 하면 좋은 것들 (TODO)

- Vercel 배포 및 환경 변수 설정
- 반응형 레이아웃 다듬기 (모바일 화면 점검)
- 에러/로딩 상태 UI 다듬기
- (선택) 날씨 이모지를 실제 SVG 일러스트로 교체
