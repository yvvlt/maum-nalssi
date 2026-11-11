import { redirect } from "next/navigation";

// 홈 화면이 캘린더로 바뀌어서, 예전 /calendar 주소는 홈으로 보냅니다.
export default function CalendarRedirectPage() {
  redirect("/");
}
