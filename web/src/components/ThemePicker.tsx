import { useState } from "react";

const THEMES_LEFT = ["dark", "light"] as const;
const THEMES_DOWN = ["digital", "amber", "warm", "blue"] as const;

export type Theme = typeof THEMES_LEFT[number] | typeof THEMES_DOWN[number];

const THEME_COLORS: Record<Theme, string> = {
  dark:    "#ffffff",
  light:   "#2c2418",
  digital: "#39e05b",
  amber:   "#ffb300",
  warm:    "#ff7a2a",
  blue:    "#4fc3f7",
};

interface Props {
  active: Theme;
  onPreview: (theme: Theme | null) => void;
  onConfirm: (theme: Theme) => void;
}

export default function ThemePicker({ active, onPreview, onConfirm }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState<Theme | null>(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setHovered(null);
    onPreview(null);
  };

  const handleEnter = (t: Theme) => {
    setHovered(t);
    onPreview(t);
  };

  const handleLeaveBtn = () => {
    setHovered(null);
    onPreview(null);
  };

  const handleConfirm = (t: Theme) => {
    onConfirm(t);
    setIsOpen(false);
    setHovered(null);
  };

  const btnBase =
    "border-none cursor-pointer bg-panel-light rounded-full text-[10px] font-bold tracking-wider uppercase shrink-0 transition-colors duration-100";
  const size: React.CSSProperties = {
    width: "var(--button-size)",
    height: "var(--button-size)",
  };

  const leftStyle: React.CSSProperties = {
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? "translateX(0)" : "translateX(8px)",
    transition: "opacity 120ms ease-out, transform 120ms ease-out",
    pointerEvents: isOpen ? "auto" : "none",
  };

  const downStyle: React.CSSProperties = {
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? "translateY(0)" : "translateY(-8px)",
    transition: "opacity 120ms ease-out, transform 120ms ease-out",
    pointerEvents: isOpen ? "auto" : "none",
  };

  return (
    <div className="relative z-10" onMouseEnter={handleOpen} onMouseLeave={handleClose}>
      {/* Main trigger */}
      <button className={`${btnBase} text-fg`} style={size}>
        {active}
      </button>

      {/* Left arm: light ← dark ← [main] */}
      <div
        className="absolute right-full top-0 flex flex-row items-center gap-1 pr-1"
        style={leftStyle}
      >
        {[...THEMES_LEFT].reverse().map(t => (
          <button
            key={t}
            className={`${btnBase} text-fg-muted`}
            style={{ ...size, ...(hovered === t ? { color: THEME_COLORS[t] } : {}) }}
            onMouseEnter={() => handleEnter(t)}
            onMouseLeave={handleLeaveBtn}
            onClick={() => handleConfirm(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Down arm: [main] ↓ digital ↓ amber ↓ warm ↓ blue */}
      <div
        className="absolute top-full right-0 flex flex-col items-center gap-1 pt-1"
        style={downStyle}
      >
        {THEMES_DOWN.map(t => (
          <button
            key={t}
            className={`${btnBase} text-fg-muted`}
            style={{ ...size, ...(hovered === t ? { color: THEME_COLORS[t] } : {}) }}
            onMouseEnter={() => handleEnter(t)}
            onMouseLeave={handleLeaveBtn}
            onClick={() => handleConfirm(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
