import { useEffect, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on touch outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setHovered(null);
        onPreview(null);
      }
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [isOpen, onPreview]);

  // Desktop hover handlers (mouse only)
  const handleMouseOpen = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setIsOpen(true);
  };
  const handleMouseClose = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    setIsOpen(false);
    setHovered(null);
    onPreview(null);
  };

  // Touch toggle on main button
  const handleMainPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch") return;
    if (isOpen) {
      setIsOpen(false);
      setHovered(null);
      onPreview(null);
    } else {
      setIsOpen(true);
    }
  };

  // Icon hover (mouse only)
  const handleIconEnter = (e: React.PointerEvent, t: Theme) => {
    if (e.pointerType !== "mouse") return;
    setHovered(t);
    onPreview(t);
  };
  const handleIconLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
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
    <div
      ref={containerRef}
      className="relative z-10"
      onPointerEnter={handleMouseOpen}
      onPointerLeave={handleMouseClose}
    >
      {/* Main trigger */}
      <button
        className={`${btnBase} text-fg`}
        style={size}
        onPointerDown={handleMainPointerDown}
      >
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
            onPointerEnter={(e) => handleIconEnter(e, t)}
            onPointerLeave={handleIconLeave}
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
            onPointerEnter={(e) => handleIconEnter(e, t)}
            onPointerLeave={handleIconLeave}
            onClick={() => handleConfirm(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
