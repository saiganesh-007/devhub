"use client";

export function LandingAmbient() {
  return (
    <div className="landing-atmosphere" aria-hidden="true">
      <div className="atmosphere-grid" />
      <div className="atmosphere-noise" />
      <div className="atmosphere-light-cyan" />
      <div className="atmosphere-light-violet" />
      <div className="atmosphere-light-amber" />
      <div className="atmosphere-orbit orbit-a" />
      <div className="atmosphere-orbit orbit-b" />
      <div className="atmosphere-orbit orbit-c" />
      <svg className="atmosphere-lines" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice">
        <path d="M38 530 C210 360 325 515 472 345 S770 158 1150 292" />
        <path d="M110 190 C310 86 402 275 610 210 S930 62 1110 152" />
        <path d="M120 660 C315 485 520 610 720 468 S990 270 1175 390" />
      </svg>
    </div>
  );
}
