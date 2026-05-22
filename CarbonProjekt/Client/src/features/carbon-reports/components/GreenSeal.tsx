import React from "react";

interface GreenSealProps {
  size?: "sm" | "md" | "lg";
}

export default function GreenSeal({ size = "md" }: GreenSealProps) {
  // Tailwind-Klassen als vollständige Strings ausschreiben, damit der Compiler sie erkennt
  const sizeClasses =
    size === "sm"
      ? "w-16 h-16 text-[8px]"
      : size === "lg"
        ? "w-36 h-36 text-[14px]"
        : "w-24 h-24 text-[11px]"; // md als Fallback

  const strokeWidth = size === "lg" ? 4 : 3;

  return (
    <div
      className={`${sizeClasses} relative flex flex-col items-center justify-center rounded-full border-2 border-dashed border-emerald-500 bg-emerald-50/50 p-1 font-sans font-bold tracking-wider text-emerald-600 shadow-sm`}
      aria-label="Nachhaltigkeitssiegel: Low CO2"
      role="img"
    >
      {/* Innerer Zier-Doppelring */}
      <div className="absolute inset-0.5 rounded-full border border-emerald-400/40 pointer-events-none" />

      {/* SVG Checkmark */}
      <svg
        className="w-1/2 h-1/2 text-emerald-500 drop-shadow-sm transform -translate-y-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>

      {/* Text-Label */}
      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap uppercase font-extrabold select-none bg-white px-1 rounded-sm shadow-sm text-center leading-none">
        Low CO₂
      </span>
    </div>
  );
}
