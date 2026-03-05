import React from "react";

export function BagMock({
  label,
  sticker,
}: {
  label: string;
  sticker: { text: string; color: string };
}) {
  return (
    <svg
      viewBox="0 0 220 260"
      className="w-full h-auto"
      aria-label={label}
      role="img"
    >
      {/* Bag */}
      <path
        d="M42 36c0-10 8-18 18-18h100c10 0 18 8 18 18v24l10 26v142c0 12-10 22-22 22H54c-12 0-22-10-22-22V86l10-26V36z"
        fill="color-mix(in oklab, var(--color-fg) 14%, var(--color-bg))"
        stroke="color-mix(in oklab, var(--color-fg) 30%, transparent)"
        strokeWidth="2"
      />
      <path
        d="M52 60h116"
        stroke="color-mix(in oklab, var(--color-fg) 28%, transparent)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Label */}
      <rect
        x="62"
        y="106"
        width="96"
        height="86"
        rx="10"
        fill="color-mix(in oklab, var(--color-bg) 92%, white)"
        stroke="color-mix(in oklab, var(--color-fg) 18%, transparent)"
        strokeWidth="2"
      />
      <text
        x="110"
        y="140"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="22"
        fill="var(--color-fg)"
      >
        {"Café"}
      </text>
      <text
        x="110"
        y="164"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="26"
        fill="var(--color-fg)"
      >
        {"del Rey"}
      </text>
      <text
        x="110"
        y="186"
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="10"
        letterSpacing="0.28em"
        fill="color-mix(in oklab, var(--color-fg) 70%, transparent)"
      >
        {label.toUpperCase()}
      </text>

      {/* Sticker */}
      <circle
        cx="72"
        cy="98"
        r="20"
        fill={sticker.color}
        stroke="color-mix(in oklab, var(--color-fg) 25%, transparent)"
        strokeWidth="2"
      />
      <text
        x="72"
        y="94"
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="9"
        letterSpacing="0.12em"
        fill="var(--color-fg)"
      >
        {sticker.text.split(" ")[0]?.toUpperCase()}
      </text>
      <text
        x="72"
        y="107"
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="9"
        letterSpacing="0.12em"
        fill="var(--color-fg)"
      >
        {sticker.text.split(" ").slice(1).join(" ").toUpperCase()}
      </text>
    </svg>
  );
}
