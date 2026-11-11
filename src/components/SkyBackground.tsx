/**
 * 하늘 그림 같은 배경. 화면 뒤에 고정되어 있고, 구름이 아주 천천히 흘러갑니다.
 * (움직임 줄이기 설정을 켠 사용자에게는 구름이 멈춘 채로 보입니다.)
 */
const CLOUDS = [
  { top: "6%", width: 220, opacity: 0.9, duration: 140, delay: -30 },
  { top: "20%", width: 150, opacity: 0.75, duration: 110, delay: -85 },
  { top: "42%", width: 260, opacity: 0.8, duration: 170, delay: -120 },
  { top: "63%", width: 170, opacity: 0.7, duration: 130, delay: -10 },
  { top: "82%", width: 230, opacity: 0.85, duration: 155, delay: -95 },
];

function Cloud() {
  return (
    <svg viewBox="0 0 200 80" width="100%" height="100%" aria-hidden="true">
      <g fill="#ffffff">
        <circle cx="52" cy="50" r="26" />
        <circle cx="92" cy="38" r="33" />
        <circle cx="138" cy="48" r="28" />
        <rect x="28" y="50" width="134" height="28" rx="14" />
      </g>
    </svg>
  );
}

export function SkyBackground() {
  return (
    <div className="sky-bg" aria-hidden="true">
      <div className="sky-sun" />
      {CLOUDS.map((cloud, i) => (
        <div
          key={i}
          className="sky-cloud"
          style={{
            top: cloud.top,
            width: cloud.width,
            height: cloud.width * 0.4,
            opacity: cloud.opacity,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
          }}
        >
          <Cloud />
        </div>
      ))}
    </div>
  );
}
