import { useRef, useState } from "react";
import { useDevice } from "../context/DeviceContext";

const THEMES_LEFT = ["dark", "light"] as const;
const THEMES_UP = ["blue", "warm", "amber", "digital"] as const;

export type Theme = typeof THEMES_LEFT[number] | typeof THEMES_UP[number];

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
  const { isMobile } = useDevice();
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState<Theme | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gestureActiveRef = useRef(false);

  const close = () => {
    setIsOpen(false);
    setHovered(null);
    onPreview(null);
  };

  const handleConfirm = (t: Theme) => {
    onConfirm(t);
    close();
  };

  // Mobile: one continuous gesture — press opens, drag previews, lift confirms or cancels
  const handleMobilePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    gestureActiveRef.current = true;
    setIsOpen(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleMobilePointerMove = (e: React.PointerEvent) => {
    if (!gestureActiveRef.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const btn = el?.closest("[data-theme]") as HTMLElement | null;
    const t = (btn?.dataset.theme as Theme) ?? null;
    setHovered(t);
    onPreview(t);
  };

  const handleMobilePointerUp = (e: React.PointerEvent) => {
    if (!gestureActiveRef.current) return;
    gestureActiveRef.current = false;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const btn = el?.closest("[data-theme]") as HTMLElement | null;
    const t = btn?.dataset.theme as Theme | undefined;
    if (t) handleConfirm(t);
    else close();
  };

  const handleMobilePointerCancel = () => {
    gestureActiveRef.current = false;
    close();
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

  const upStyle: React.CSSProperties = {
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? "translateY(0)" : "translateY(8px)",
    transition: "opacity 120ms ease-out, transform 120ms ease-out",
    pointerEvents: isOpen ? "auto" : "none",
  };

  return (
    <div
      ref={containerRef}
      className="relative z-10"
      style={isMobile ? { touchAction: "none" } : undefined}
      onPointerDown={isMobile ? handleMobilePointerDown : undefined}
      onPointerMove={isMobile ? handleMobilePointerMove : undefined}
      onPointerUp={isMobile ? handleMobilePointerUp : undefined}
      onPointerCancel={isMobile ? handleMobilePointerCancel : undefined}
      onPointerEnter={isMobile ? undefined : () => setIsOpen(true)}
      onPointerLeave={isMobile ? undefined : close}
    >
      {/* Main trigger */}
      <button className={`${btnBase} text-fg`} style={size} aria-label={`Tema activo: ${active}. Cambiar tema`} aria-expanded={isOpen}>
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
            data-theme={t}
            className={btnBase}
            style={{ ...size, color: THEME_COLORS[t], opacity: hovered === t ? 1 : 0.5 }}
            onPointerEnter={isMobile ? undefined : () => { setHovered(t); onPreview(t); }}
            onPointerLeave={isMobile ? undefined : () => { setHovered(null); onPreview(null); }}
            onClick={isMobile ? undefined : () => handleConfirm(t)}
            aria-label={`Tema ${t}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Up arm: [main] ↑ blue ↑ warm ↑ amber ↑ digital */}
      <div
        className="absolute bottom-full right-0 flex flex-col items-center gap-1 pb-1"
        style={upStyle}
      >
        {THEMES_UP.map(t => (
          <button
            key={t}
            data-theme={t}
            className={btnBase}
            style={{ ...size, color: THEME_COLORS[t], opacity: hovered === t ? 1 : 0.5 }}
            onPointerEnter={isMobile ? undefined : () => { setHovered(t); onPreview(t); }}
            onPointerLeave={isMobile ? undefined : () => { setHovered(null); onPreview(null); }}
            onClick={isMobile ? undefined : () => handleConfirm(t)}
            aria-label={`Tema ${t}`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
