import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const COLORS = {
  // ── Surfaces ──
  bg:           "#0D1117",
  surface:      "#161D2B",
  surfaceAlt:   "#1C2438",
  surfaceSunk:  "#222D44",
  surfaceGlass: "rgba(22,29,43,0.92)",
  card:         "#EEE8DC",
  cardText:     "#111827",
  cardMuted:    "#4A5568",
  // ── Borders ──
  border:       "#D8D0C0",
  borderMid:    "#C4BAA6",
  borderStrong: "#A89E8A",
  // ── Sidebar ──
  sidebar:           "#090E16",
  sidebarBorder:     "#111A28",
  sidebarIcon:       "#58708C",
  sidebarIconHover:  "#8FB7E0",
  sidebarIconActive: "#C49A3C",
  // ── Brand accent (warm gold) ──
  accent:         "#C49A3C",
  accentDim:      "#8A6418",
  accentBright:   "#D4A84E",
  accentLight:    "#2A2210",
  accentSoft:     "#1E1A0C",
  accentGlow:     "rgba(196,154,60,0.18)",
  accentGradient: "linear-gradient(135deg, #8A6418 0%, #C49A3C 100%)",
  // ── Navy (dark text on cream cards) ──
  navy:    "#111827",
  navyMid: "#1E2D42",
  navyLow: "#2D3F57",
  // ── Text ──
  text:      "#E7EEF8",
  textMuted: "#93A4BA",
  textDim:   "#64748B",
  textFaint: "#3F4E63",
  // ── Semantic ──
  green:       "#2DD4A0",
  greenLight:  "#0A2218",
  red:         "#F06B78",
  redLight:    "#2A1018",
  blue:        "#60A5E8",
  blueLight:   "#0A1E30",
  purple:      "#A78BF5",
  purpleLight: "#18143A",
  // ── Elevation ──
  shadowXs: "0 1px 2px rgba(0,0,0,0.3)",
  shadow:   "0 1px 2px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.25)",
  shadowMd: "0 2px 4px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.28), 0 16px 32px rgba(0,0,0,0.20)",
  shadowLg: "0 4px 8px rgba(0,0,0,0.35), 0 12px 28px rgba(0,0,0,0.35), 0 32px 64px rgba(0,0,0,0.25)",
  shadowXl: "0 8px 16px rgba(0,0,0,0.40), 0 24px 48px rgba(0,0,0,0.40), 0 56px 112px rgba(0,0,0,0.30)",
  shadowAccent:   "0 1px 2px rgba(196,154,60,0.15), 0 4px 14px rgba(196,154,60,0.20), 0 8px 28px rgba(196,154,60,0.10)",
  shadowAccentLg: "0 2px 4px rgba(196,154,60,0.18), 0 8px 22px rgba(196,154,60,0.28), 0 16px 40px rgba(196,154,60,0.14)",
  // ── Focus ring ──
  ring: "0 0 0 3px rgba(196,154,60,0.25)",
};

const LIVE = {
  bg:         "#050A12",
  bgGrad:     "linear-gradient(180deg, #050A12 0%, #080E1A 100%)",
  surface:    "#0B1220",
  surfaceAlt: "#0E1629",
  card:       "#101A2C",
  cardGlass:  "rgba(16,26,44,0.88)",
  border:     "#162033",
  borderMid:  "#1F2C44",
  borderGlow: "rgba(120,183,255,0.22)",
  text:       "#EEE8E0",
  textMuted:  "#7993AD",
  textDim:    "#3E566E",
  textFaint:  "#2A3C52",
};

// SVG noise texture (inline, tiny, tileable)
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Inter:wght@300;400;450;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --font-display: 'Inter Tight', 'Inter', -apple-system, sans-serif;
    --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  }

  html { font-size: 16px; }

  body {
    background: ${COLORS.bg};
    background-image: ${NOISE_SVG};
    color: ${COLORS.text};
    font-family: var(--font-body);
    font-feature-settings: "cv11", "ss01", "ss03";
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: ${COLORS.borderMid};
    border-radius: 8px;
    border: 2px solid ${COLORS.bg};
  }
  ::-webkit-scrollbar-thumb:hover { background: ${COLORS.textDim}; }

  ::selection { background: ${COLORS.accentLight}; color: ${COLORS.accentDim}; }

  :focus-visible { outline: none; box-shadow: ${COLORS.ring}; border-radius: 8px; }
  button:focus { outline: none; }
  button:focus-visible { box-shadow: ${COLORS.ring}; }

  .app-container {
    display: flex;
    height: 100vh;
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  .sidebar {
    width: 60px;
    background: ${COLORS.sidebar};
    background-image: ${NOISE_SVG};
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 0 14px;
    gap: 3px;
    flex-shrink: 0;
    z-index: 200;
    overflow: visible;
    border-right: 1px solid ${COLORS.sidebarBorder};
    box-shadow: 2px 0 32px rgba(0,0,0,0.18);
    position: relative;
  }

  .sidebar-logo {
    position: relative;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 11px;
    margin-bottom: 16px;
    background: linear-gradient(135deg, rgba(62,127,199,0.20) 0%, rgba(120,183,255,0.08) 100%);
    border: 1px solid rgba(62,127,199,0.35);
    box-shadow: 0 2px 10px rgba(62,127,199,0.20), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(120,183,255,0.12);
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .sidebar-logo::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 15px;
    background: radial-gradient(circle at center, rgba(120,183,255,0.15) 0%, transparent 70%);
    pointer-events: none;
    opacity: 0.6;
    transition: opacity 0.2s;
  }
  .sidebar-logo:hover { background: linear-gradient(135deg, rgba(62,127,199,0.30) 0%, rgba(120,183,255,0.15) 100%); transform: scale(1.04); }
  .sidebar-logo:hover::after { opacity: 1; }
  .sidebar-logo svg { position: relative; z-index: 1; }

  .nav-btn {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    border: none;
    background: transparent;
    color: ${COLORS.sidebarIcon};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }
  .nav-btn:hover { background: rgba(255,255,255,0.06); color: ${COLORS.sidebarIconHover}; }
  .nav-btn.active {
    background: linear-gradient(135deg, rgba(62,127,199,0.20) 0%, rgba(120,183,255,0.10) 100%);
    color: ${COLORS.accentBright};
    box-shadow: inset 0 1px 0 rgba(120,183,255,0.12), 0 0 0 1px rgba(120,183,255,0.15);
  }
  .nav-btn.active::before {
    content: '';
    position: absolute;
    left: -9px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 20px;
    background: ${COLORS.accentBright};
    border-radius: 0 3px 3px 0;
    box-shadow: 0 0 8px rgba(120,183,255,0.5);
  }

  .nav-tooltip {
    position: absolute;
    left: 62px;
    background: linear-gradient(135deg, #0C1A2D 0%, #162238 100%);
    color: #EEE8E0;
    padding: 8px 14px;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    border: 1px solid #1E3248;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease, transform 0.15s ease;
    transform: translateX(-4px);
    z-index: 1000;
    box-shadow: 0 12px 32px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3);
    font-family: var(--font-body);
    letter-spacing: 0.2px;
  }
  .nav-tooltip::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid #1E3248;
  }
  .nav-tooltip::after {
    content: '';
    position: absolute;
    left: -5px;
    top: 50%;
    transform: translateY(-50%);
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-right: 5px solid #162238;
  }
  .nav-btn:hover .nav-tooltip,
  .search-btn:hover .nav-tooltip,
  .sidebar-logo:hover .nav-tooltip { opacity: 1; transform: translateX(0); }

  .nav-divider {
    width: 28px;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${COLORS.sidebarBorder} 30%, ${COLORS.sidebarBorder} 70%, transparent);
    margin: 6px 0;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 32px 24px;
    background: ${COLORS.bg};
    background-image: ${NOISE_SVG};
    min-width: 0;
  }

  .page-header { margin-bottom: 36px; }

  .page-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: ${COLORS.accent};
    margin-bottom: 12px;
    font-family: var(--font-body);
  }
  .page-eyebrow::before {
    content: '';
    width: 22px;
    height: 2px;
    background: ${COLORS.accentGradient};
    border-radius: 2px;
    flex-shrink: 0;
  }

  .page-title {
    font-family: var(--font-display);
    font-size: 38px;
    font-weight: 700;
    color: ${COLORS.text};
    line-height: 1.08;
    letter-spacing: -0.8px;
    font-optical-sizing: auto;
  }

  .page-sub {
    font-size: 15px;
    color: ${COLORS.textMuted};
    margin-top: 12px;
    line-height: 1.6;
    max-width: 580px;
    font-weight: 500;
  }

  .card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    padding: 22px;
    box-shadow: ${COLORS.shadow};
    transition: box-shadow 0.25s ease, border-color 0.2s ease, transform 0.2s ease;
    position: relative;
  }
  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    background: linear-gradient(160deg, rgba(255,255,255,0.4) 0%, transparent 55%);
    pointer-events: none;
  }
  button.card { cursor: pointer; text-align: left; width: 100%; font-family: var(--font-body); }
  .card:hover { border-color: ${COLORS.borderMid}; box-shadow: ${COLORS.shadowMd}; transform: translateY(-1px); }

  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }

  .card-title {
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 700;
    color: ${COLORS.navy};
    margin-bottom: 6px;
    letter-spacing: -0.25px;
  }
  .card-desc { font-size: 13.5px; color: #4A5568; line-height: 1.55; font-weight: 500; }

  .card-icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, ${COLORS.accentLight} 0%, ${COLORS.accentSoft} 100%);
    border: 1px solid rgba(62,127,199,0.18);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(62,127,199,0.10), inset 0 1px 0 rgba(255,255,255,0.5);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.16s cubic-bezier(0.3, 0, 0.2, 1);
    border: none;
    font-family: var(--font-body);
    letter-spacing: 0.1px;
    position: relative;
    overflow: hidden;
    user-select: none;
    white-space: nowrap;
  }
  .btn:active { transform: translateY(1px); }

  .btn-primary { background: ${COLORS.accentGradient}; color: #fff; box-shadow: ${COLORS.shadowAccent}; }
  .btn-primary::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 50%);
    pointer-events: none;
  }
  .btn-primary:hover { filter: brightness(1.06); transform: translateY(-1px); box-shadow: ${COLORS.shadowAccentLg}; }
  .btn-primary:active { filter: brightness(0.96); transform: translateY(0); }

  .btn-secondary {
    background: linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%);
    color: #fff;
    box-shadow: 0 1px 2px rgba(8,15,26,0.20), 0 4px 12px rgba(8,15,26,0.18);
  }
  .btn-secondary::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 50%);
    pointer-events: none;
  }
  .btn-secondary:hover { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 2px 4px rgba(8,15,26,0.20), 0 8px 24px rgba(8,15,26,0.28); }

  .btn-ghost {
    background: rgba(255,255,255,0.05);
    color: ${COLORS.textMuted};
    border: 1px solid ${COLORS.border};
    box-shadow: ${COLORS.shadowXs};
  }
  .btn-ghost:hover { color: ${COLORS.text}; border-color: ${COLORS.borderMid}; background: rgba(255,255,255,0.08); box-shadow: ${COLORS.shadow}; }

  .section-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: ${COLORS.textDim};
    margin: 32px 0 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .section-label::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, ${COLORS.border}, transparent 70%); }

  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.2px; font-family: var(--font-body); }
  .badge-gold { background: linear-gradient(135deg, ${COLORS.accentLight} 0%, ${COLORS.accentSoft} 100%); color: ${COLORS.accent}; border: 1px solid rgba(62,127,199,0.22); }
  .badge-green { background: ${COLORS.greenLight}; color: ${COLORS.green}; border: 1px solid rgba(27,101,64,0.20); }
  .badge-blue { background: ${COLORS.blueLight}; color: ${COLORS.blue}; border: 1px solid rgba(26,89,145,0.20); }
  .badge-red { background: ${COLORS.redLight}; color: ${COLORS.red}; border: 1px solid rgba(176,46,60,0.20); }
  .badge-navy { background: rgba(8,15,26,0.06); color: ${COLORS.navy}; border: 1px solid rgba(8,15,26,0.12); }

  .progress-track { background: ${COLORS.surfaceSunk}; border-radius: 4px; height: 4px; overflow: hidden; margin-top: 12px; box-shadow: inset 0 1px 2px rgba(8,15,26,0.06); }
  .progress-fill { height: 100%; background: ${COLORS.accentGradient}; border-radius: 4px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); box-shadow: 0 0 8px rgba(120,183,255,0.25); }

  .detail-panel { background: ${COLORS.card}; border: 1px solid ${COLORS.border}; border-radius: 16px; overflow: hidden; box-shadow: ${COLORS.shadow}; }
  .detail-header { padding: 20px 24px; border-bottom: 1px solid ${COLORS.border}; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(180deg, ${COLORS.surfaceAlt} 0%, ${COLORS.surface} 100%); }
  .detail-body { padding: 24px; }

  .accordion-item { border-bottom: 1px solid ${COLORS.border}; }
  .accordion-item:last-child { border-bottom: none; }
  .accordion-trigger { width: 100%; background: none; border: none; padding: 16px 0; display: flex; align-items: center; justify-content: space-between; cursor: pointer; color: #111827; font-family: var(--font-body); font-size: 14px; font-weight: 500; text-align: left; transition: color 0.15s; gap: 12px; }
  .accordion-trigger:hover { color: ${COLORS.accent}; }
  .accordion-chevron { color: ${COLORS.textDim}; transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); font-size: 11px; flex-shrink: 0; }
  .accordion-chevron.open { transform: rotate(180deg); color: ${COLORS.accent}; }
  .accordion-content { padding-bottom: 18px; font-size: 14px; color: #374151; line-height: 1.75; font-weight: 500; }

  .chat-container { display: flex; flex-direction: column; gap: 14px; max-height: 460px; overflow-y: auto; padding-right: 4px; }
  .chat-bubble { padding: 13px 16px; border-radius: 14px; font-size: 13.5px; line-height: 1.65; max-width: 86%; }
  .chat-bubble.user { background: linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%); color: #EEE8E0; align-self: flex-end; border-bottom-right-radius: 4px; box-shadow: 0 2px 8px rgba(8,15,26,0.2); }
  .chat-bubble.ai { background: ${COLORS.surfaceAlt}; border: 1px solid ${COLORS.border}; color: ${COLORS.text}; align-self: flex-start; border-bottom-left-radius: 4px; }
  .chat-bubble.loading { background: ${COLORS.surfaceAlt}; border: 1px solid ${COLORS.border}; color: ${COLORS.textDim}; align-self: flex-start; font-style: italic; }

  .chat-input-row { display: flex; gap: 10px; margin-top: 16px; }
  .chat-input { flex: 1; background: ${COLORS.surfaceAlt}; border: 1.5px solid ${COLORS.border}; border-radius: 12px; padding: 11px 16px; color: ${COLORS.text}; font-family: var(--font-body); font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; resize: none; min-height: 46px; max-height: 120px; }
  .chat-input:focus { border-color: ${COLORS.accent}; box-shadow: ${COLORS.ring}; background: ${COLORS.surface}; }
  .chat-input::placeholder { color: ${COLORS.textDim}; }

  .scenario-card { background: ${COLORS.card}; border: 1px solid ${COLORS.border}; border-radius: 16px; padding: 20px; cursor: pointer; transition: all 0.22s ease; box-shadow: ${COLORS.shadow}; position: relative; overflow: hidden; }
  .scenario-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(160deg, rgba(255,255,255,0.03) 0%, transparent 50%); pointer-events: none; }
  .scenario-card:hover { border-color: rgba(120,183,255,0.40); box-shadow: ${COLORS.shadowMd}, 0 0 0 1px rgba(120,183,255,0.10); transform: translateY(-3px); }

  .ref-table { width: 100%; border-collapse: collapse; }
  .ref-table th { text-align: left; padding: 12px 16px; font-size: 10.5px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: ${COLORS.textDim}; border-bottom: 1px solid ${COLORS.border}; background: linear-gradient(180deg, ${COLORS.surfaceAlt} 0%, ${COLORS.surface} 100%); }
  .ref-table td { padding: 13px 16px; font-size: 13px; border-bottom: 1px solid ${COLORS.border}; vertical-align: top; line-height: 1.55; color: #4A5568; font-weight: 500; }
  .ref-table tr:last-child td { border-bottom: none; }
  .ref-table tr:hover td { background: ${COLORS.surfaceAlt}; }
  .call-code { font-family: var(--font-mono); color: ${COLORS.accent}; font-size: 12.5px; font-weight: 500; }

  .roadmap-phase { display: flex; gap: 20px; padding: 22px 0; border-bottom: 1px solid ${COLORS.border}; align-items: flex-start; }
  .roadmap-phase:last-child { border-bottom: none; }
  .phase-number { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 18px; font-weight: 600; flex-shrink: 0; }
  .phase-title { font-weight: 700; font-size: 15px; margin-bottom: 3px; color: #111827; font-family: var(--font-display); }
  .phase-timing { font-size: 11px; color: ${COLORS.accent}; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 10px; }
  .phase-items { font-size: 13px; color: #374151; line-height: 1.9; font-weight: 600; }

  .onboard-step { display: flex; gap: 20px; padding: 20px 0; border-bottom: 1px solid ${COLORS.border}; }
  .onboard-step:last-child { border-bottom: none; }
  .step-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
  .step-dot.complete { background: ${COLORS.green}; color: #fff; box-shadow: 0 2px 8px rgba(27,101,64,0.30); }
  .step-dot.active { background: ${COLORS.accentGradient}; color: #fff; box-shadow: ${COLORS.shadowAccent}; }
  .step-dot.upcoming { background: ${COLORS.surfaceAlt}; color: ${COLORS.textDim}; border: 1.5px solid ${COLORS.border}; }
  .step-line { width: 1.5px; flex: 1; background: linear-gradient(180deg, ${COLORS.border}, transparent); margin: 4px 0; min-height: 20px; }

  .search-overlay { position: fixed; inset: 0; background: rgba(8,15,26,0.55); backdrop-filter: blur(12px) saturate(1.2); -webkit-backdrop-filter: blur(12px) saturate(1.2); z-index: 9500; display: flex; align-items: flex-start; justify-content: center; padding-top: 80px; }
  .search-modal { background: rgba(14,16,20,0.97); backdrop-filter: blur(20px) saturate(1.5); -webkit-backdrop-filter: blur(20px) saturate(1.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; width: 100%; max-width: 520px; margin: 0 20px; overflow: hidden; box-shadow: ${COLORS.shadowXl}, 0 0 0 1px rgba(8,15,26,0.04); }
  .search-input-row { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .search-input-field { flex: 1; background: transparent; border: none; outline: none; color: ${COLORS.text}; font-family: var(--font-body); font-size: 16px; font-weight: 400; }
  .search-input-field::placeholder { color: ${COLORS.textDim}; }
  .search-results { max-height: 360px; overflow-y: auto; }
  .search-result-item { display: flex; align-items: center; gap: 12px; padding: 11px 20px; cursor: pointer; transition: background 0.1s; border: none; background: transparent; width: 100%; text-align: left; font-family: var(--font-body); }
  .search-result-item:hover { background: rgba(255,255,255,0.05); }
  .search-result-item.highlighted { background: ${COLORS.accentLight}; }
  .search-result-icon { width: 34px; height: 34px; border-radius: 9px; background: ${COLORS.surfaceAlt}; border: 1px solid ${COLORS.border}; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
  .search-result-label { font-size: 14px; font-weight: 500; color: ${COLORS.text}; }
  .search-result-type { font-size: 11px; color: ${COLORS.textDim}; margin-top: 1px; }
  .search-result-item.highlighted .search-result-label { color: ${COLORS.accent}; }
  .search-empty { padding: 28px 20px; text-align: center; font-size: 13px; color: ${COLORS.textDim}; }

  .search-btn { width: 40px; height: 40px; border-radius: 11px; border: none; background: transparent; color: ${COLORS.sidebarIcon}; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease; position: relative; flex-shrink: 0; overflow: visible; }
  .search-btn:hover { background: rgba(255,255,255,0.06); color: ${COLORS.sidebarIconHover}; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeUp 0.32s cubic-bezier(0.2, 0.6, 0.2, 1) forwards; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  .pulsing { animation: pulse 1.6s ease-in-out infinite; }
  @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
  @keyframes slowDrift { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(6px, -4px) rotate(0.5deg); } }

  .stat-pill { display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; background: ${COLORS.surfaceGlass}; border: 1px solid ${COLORS.border}; border-radius: 24px; box-shadow: ${COLORS.shadowXs}; backdrop-filter: blur(8px); }

  .field-input { width: 100%; background: ${COLORS.surfaceAlt}; border: 1.5px solid ${COLORS.border}; border-radius: 10px; padding: 10px 14px; color: ${COLORS.text}; font-family: var(--font-body); font-size: 14px; font-weight: 400; outline: none; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; }
  .field-input:focus { border-color: ${COLORS.accent}; box-shadow: ${COLORS.ring}; background: ${COLORS.surface}; }
  .field-input::placeholder { color: ${COLORS.textDim}; }

  .page-content { max-width: 840px; margin: 0 auto; width: 100%; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  @media (min-width: 1024px) { .main-content { padding: 48px 56px; } .page-title { font-size: 44px; } .two-col { gap: 16px; } }
  @media (min-width: 768px) and (max-width: 1023px) { .main-content { padding: 36px 40px; } }
  @media (max-width: 640px) { .main-content { padding: 22px 16px; } .card-grid { grid-template-columns: 1fr; } .page-title { font-size: 28px; letter-spacing: -0.4px; } .two-col { grid-template-columns: 1fr; } }

  .hero-banner { position: relative; border-radius: 24px; overflow: hidden; margin-bottom: 36px; background: linear-gradient(135deg, #050A12 0%, #0B1624 40%, #0E1A2B 70%, #080F1C 100%); box-shadow: 0 4px 20px rgba(8,15,26,0.30), 0 20px 60px rgba(8,15,26,0.20), inset 0 1px 0 rgba(255,255,255,0.04); }
  .hero-banner::before { content: ''; position: absolute; top: -80px; left: -40px; width: 440px; height: 300px; background: radial-gradient(ellipse, rgba(62,127,199,0.24) 0%, rgba(120,183,255,0.08) 45%, transparent 70%); pointer-events: none; }
  .hero-banner::after { content: ''; position: absolute; bottom: -40px; right: -30px; width: 320px; height: 220px; background: radial-gradient(ellipse, rgba(26,89,145,0.18) 0%, transparent 65%); pointer-events: none; }
  .hero-banner-inner { position: relative; z-index: 2; padding: 40px 40px 36px; }
  @media (max-width: 640px) { .hero-banner-inner { padding: 30px 24px 26px; } }
  .hero-stage-line { position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(62,127,199,0.45), rgba(120,183,255,0.30), transparent); z-index: 3; }

  .section-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(120,183,255,0.30), rgba(120,183,255,0.50), rgba(120,183,255,0.30), transparent); margin: 36px 0; position: relative; }
  .section-divider::after { content: ''; position: absolute; top: -3px; left: 50%; transform: translateX(-50%); width: 6px; height: 6px; border-radius: 50%; background: ${COLORS.accent}; opacity: 0.5; }

  .feature-spotlight { position: relative; border-radius: 20px; overflow: hidden; background: linear-gradient(135deg, ${COLORS.navy} 0%, #0D1B2E 60%, #162033 100%); padding: 28px; box-shadow: ${COLORS.shadowMd}; }
  .feature-spotlight::before { content: ''; position: absolute; top: -40px; right: -40px; width: 220px; height: 220px; background: radial-gradient(ellipse, rgba(62,127,199,0.15) 0%, transparent 65%); pointer-events: none; }
  .feature-spotlight-inner { position: relative; z-index: 2; }
`


// ─── SVG ICON SYSTEM ─────────────────────────────────────────────────────────
// All icons are inline SVG — consistent 20px stroke-based design
// color defaults to "currentColor" so they inherit from parent

const Icon = ({ name, size = 20, color = "currentColor", strokeWidth = 1.6 }) => {
  const s = { width: size, height: size, display: "block", flexShrink: 0 };
  const p = { fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };

  const icons = {
    // ── NAVIGATION ──
    home: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 22V12h6v10"/>
      </svg>
    ),
    starthere: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 3"/>
        <circle cx="12" cy="12" r="1" fill={color} stroke="none"/>
      </svg>
    ),
    training: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M3 6l9-3 9 3v2L12 11 3 8V6z"/>
        <path d="M3 8v7c0 2 3.5 4 9 4s9-2 9-4V8"/>
        <path d="M21 6v6"/>
        <circle cx="21" cy="13" r="1" fill={color} stroke="none"/>
      </svg>
    ),
    mdsystem: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="8" r="3"/>
        <path d="M6 20v-1a6 6 0 0112 0v1"/>
        <path d="M17 8h4M19 6v4"/>
      </svg>
    ),
    manual: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        <path d="M9 7h6M9 11h6M9 15h4"/>
      </svg>
    ),
    vocab: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        <path d="M9 9h.01M12 9h.01M15 9h.01"/>
      </svg>
    ),
    onboarding: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    coaching: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    builder: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    ),
    services: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
    live: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="12" r="9"/>
        <polygon points="10 8 16 12 10 16 10 8" fill={color} stroke="none"/>
      </svg>
    ),
    roadmap: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M3 17l4-12 4 8 4-4 4 8"/>
        <circle cx="3" cy="17" r="1.5" fill={color} stroke="none"/>
        <circle cx="7" cy="5" r="1.5" fill={color} stroke="none"/>
        <circle cx="11" cy="13" r="1.5" fill={color} stroke="none"/>
        <circle cx="15" cy="9" r="1.5" fill={color} stroke="none"/>
        <circle cx="19" cy="17" r="1.5" fill={color} stroke="none"/>
      </svg>
    ),
    pilots: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <circle cx="9" cy="7" r="3"/>
        <circle cx="17" cy="7" r="2"/>
        <path d="M3 21v-1a6 6 0 0112 0v1"/>
        <path d="M17 9c2.5 0 4 1.5 4 4v1"/>
        <path d="M12 12h4"/>
        <path d="M12 15h2"/>
      </svg>
    ),
    search: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <circle cx="11" cy="11" r="7"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
    ),

    videos: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <rect x="2" y="4" width="20" height="14" rx="2"/>
        <path d="M10 9l5 3-5 3V9z" fill={color} stroke="none"/>
        <path d="M8 20h8"/>
        <path d="M12 18v2"/>
      </svg>
    ),
    foundation: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M12 2l9 4v4H3V6l9-4z"/>
        <path d="M5 10v8M10 10v8M14 10v8M19 10v8"/>
        <path d="M3 18h18"/>
      </svg>
    ),
    partnership: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1"/>
        <path d="M7 16H3a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v2"/>
      </svg>
    ),
    technical: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
      </svg>
    ),
    language: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    responsibilities: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
    rehearsal: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l4 2"/>
      </svg>
    ),
    tools: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    pathway: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M12 22V12"/>
        <path d="M12 12C12 7 17 4 17 4s-1 5-5 8z"/>
        <path d="M12 12C12 7 7 4 7 4s1 5 5 8z"/>
        <path d="M5 22h14"/>
        <path d="M8 18l4-4 4 4"/>
      </svg>
    ),
    playback: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <circle cx="12" cy="12" r="3"/>
        <path d="M6 12h.01M18 12h.01"/>
      </svg>
    ),
    conduct: (
      <svg style={s} viewBox="0 0 24 24" {...p}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  };

  return icons[name] || (
    <svg style={s} viewBox="0 0 24 24" {...p}>
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 8v4M12 16h.01"/>
    </svg>
  );
};

// ─── DATA ──────────────────────────────────────────────────────────────────

const VOCAB_DATA = [
  // ── NAVIGATION ──
  { call: "Stand by — [section]", meaning: "Advance warning 2 bars before the next section change. The most important call you make.", category: "Navigation" },
  { call: "Back to the top", meaning: "Loop back to song intro or verse 1", category: "Navigation" },
  { call: "Hold — sustain", meaning: "Hold current chord; everyone sustains until released", category: "Navigation" },
  { call: "Vamp / Loop it", meaning: "Repeat current section indefinitely until cued off", category: "Navigation" },
  { call: "Tag it", meaning: "Repeat the last phrase or ending one more time", category: "Navigation" },
  { call: "One more time", meaning: "Repeat the current full section once more", category: "Navigation" },
  { call: "On me", meaning: "MD will cue the next move — band watches and waits", category: "Navigation" },
  // ── DYNAMICS ──
  { call: "Full build", meaning: "Everyone at full capacity — maximum energy", category: "Dynamics" },
  { call: "Strip back / Strip it down", meaning: "Drop to minimal — vocals and one or two instruments", category: "Dynamics" },
  { call: "Bring it down", meaning: "Pull the whole band back dynamically; reduce energy across the board", category: "Dynamics" },
  { call: "Pads only", meaning: "Keys hold the room with sustained chords — everything else rests", category: "Dynamics" },
  { call: "Half-time", meaning: "Feel drops to half (groove slows, tempo stays)", category: "Dynamics" },
  // ── ENDINGS ──
  { call: "Fade it out", meaning: "Band lets the final chord ring and gradually drop to silence — no hard cutoff", category: "Endings" },
  { call: "Cold stop", meaning: "Everyone cuts off together on the same beat — clean and precise", category: "Endings" },
  { call: "Crash on the 1", meaning: "Hit the final chord hard on beat 1 and let it ring", category: "Endings" },
  // ── DRUMMER CUES ──
  { call: "Big snap", meaning: "Big snare hit + crash — punctuates a build or launches into a bigger section. A musical exclamation mark.", category: "Drummer Cues" },
  { call: "Take it to time", meaning: "Transition from a building section into full groove — lock to the click and land it", category: "Drummer Cues" },
  { call: "Kick on 1", meaning: "Kick on beat 1 only — re-anchors the band to the grid", category: "Drummer Cues" },
  { call: "Downbeats — 1, 2, 3, 4", meaning: "MD calls the count aloud to re-sync the band to click after drift", category: "Drummer Cues" },
  // ── INSTRUMENT CUES ──
  { call: "Bass drop out", meaning: "Bassist pulls out of the mix completely — creates space that makes the re-entry land harder", category: "Instrument Cues" },
  { call: "Bring in bass", meaning: "Bassist re-enters the mix", category: "Instrument Cues" },
  // ── THEORY CALLS ──
  { call: "Sus 2", meaning: "Replace the 3rd of the chord with a 2nd — creates an open, unresolved feel. Common in builds and pads.", category: "Theory Calls" },
  { call: "Sus 4", meaning: "Replace the 3rd of the chord with a 4th — creates tension that wants to resolve back to the root chord.", category: "Theory Calls" },
  { call: "Add the 2 / Add 9", meaning: "Layer the 2nd on top of a major chord without removing the 3rd — fuller, more colour without tension.", category: "Theory Calls" },
  { call: "Major 7", meaning: "Add the major 7th to a chord — smooth, lush feel. Common on the 1 chord in slower worship moments.", category: "Theory Calls" },
  { call: "Go to the 2 minor", meaning: "MD calls the ii chord — adds movement and colour within the key. Common in bridge progressions.", category: "Theory Calls" },
  // ── PLAYBACK ──
  { call: "Kill the track", meaning: "Cut the backing track immediately — band goes fully live", category: "Playback" },
  { call: "Loop the track", meaning: "Loop the current section in Playback — holds the space during spontaneous moments", category: "Playback" },
  { call: "Stand by — [specific cue]", meaning: "Use 'stand by' for anything coming that needs preparation — not just section changes. 'Stand by, key change.' 'Stand by, 2 minor.' 'Stand by, drum break.' If the band needs to be ready for it, warn them first.", category: "Navigation" },
  { call: "Wash it", meaning: "Drummer opens the hi-hats or ride into a full cymbal wash while keys and guitar sustain open chords — creates a swelling, atmospheric texture. Common in builds and extended worship moments.", category: "Dynamics" },
  { call: "Celebrate", meaning: "Full band locks on one chord and holds it while a lead instrument — guitar or piano — rips through licks, runs, or scales over the top. Everyone else sustains at full energy underneath. The chord doesn't move; the melody does. Used at the peak of a set or a triumphant ending.", category: "Dynamics" },
  { call: "Half-time drums", meaning: "Drummer drops to a half-time groove — snare moves from beats 2 & 4 to beat 3 only. Creates a heavier, slower feel while the rest of the band stays in time.", category: "Drummer Cues" },
  { call: "Drum break", meaning: "Full band drops out and lets the drummer hold it alone — usually a driving tom groove under the vocals. One of the most powerful moments in a worship set when it lands right.", category: "Drummer Cues" },
  { call: "Loop ending", meaning: "The loop has been turned off — band is now playing through to the next section. No more repeats; follow the track out.", category: "Playback" },
];

const PARTS_DATA = [
  {
    id: 1, title: "Foundation — Who Is the MD?", icon: "foundation",
    summary: "Core identity: Navigator and Servant Leader. The MD charts the course and calls the turns — keeping the band unified, confident, and spiritually present.",
    content: [
      { q: "What are the 5 foundational principles of the MD role?", a: "1. Serve the vision, not the spotlight — your job is to help the room worship, not flex. 2. Prepare the band before rehearsal — charts, keys, tempos sent early = peace in the room. 3. Control dynamics, not volume — less in the verses, save the lift for the right moment. 4. Be the musical bridge — translate the WL's heart to the band in real time. 5. Lead people, not just music — encourage, protect unity, and create a safe environment to worship." },
      { q: "What is the MD's primary metaphor?", a: "The Navigator. The WL is the captain setting the destination; the MD charts the course and calls out the turns — the 'Google Maps Mandate.' Even when the band knows the route, you provide the background safety net. Like GPS, you instruct a turn before they reach it, keeping everyone unified and confident." },
      { q: "What is the foundational principle?", a: "Confidence Over Perfection. A wrong cue given with 100% confidence is a pivot — a right cue with hesitation can be a train wreck. The band needs to feel your certainty, not your uncertainty." },
      { q: "What is relational equity and why does it matter?", a: "Relational equity is the trust you build with your team through care, consistency, and investment mid-week. You cannot lead a team that doesn't trust you. Without relationship, correction can feel like an attack. Build trust before you need to use authority — the WL must also publicly hand the keys to the MD so the team knows who to follow." },
    ]
  },
  {
    id: 2, title: "The WL/MD Partnership", icon: "partnership",
    summary: "WL and MD function as a single leadership unit. If the band detects a split, they hesitate. Unified front is non-negotiable.",
    content: [
      { q: "What is the weekly planning conversation?", a: "A structured 15–20 min conversation before Sunday to align on: setlist order, any spontaneous possibilities, transitions, who's calling what, and any team flags. Never go into Sunday without this conversation." },
      { q: "What is the 10-Minute Huddle?", a: "A pre-service sync. Happens after full soundcheck, before the service begins. Confirms the order, any last-minute changes, and realigns WL + MD. The team hears it together. Creates shared certainty." },
      { q: "How does the MD support the WL in real-time?", a: "Monitor the WL's body language and face constantly. If they're lingering — extend. If they're moving forward — get the band ready. Anticipate the call before they make it. You should be one step ahead, not reacting." },
      { q: "What does 'Unified Front' mean in practice?", a: "Disagreements happen after the service, never during. If the WL calls something unexpected mid-service, execute it without hesitation and process it afterward. The band must never see conflict or uncertainty between WL and MD." },
    ]
  },
  {
    id: 3, title: "Technical Standards", icon: "technical",
    summary: "Two-way talkback, IEM priorities, stage positioning, and Playback mastery. Technical failure is a leadership failure.",
    content: [
      { q: "What are the IEM mix priorities for the MD?", a: "1. Click track (crystal clear — this is your anchor). 2. Your own instrument (guitar/keys). 3. Vocals. 4. Kick and bass. The click must be unmistakable and always present. Everything else is secondary." },
      { q: "What is the two-way talkback requirement?", a: "MD must have talkback to the sound booth — not just the band. The engineer needs to hear MD calls to anticipate transitions. Without this, you're flying blind on the technical side. Test it every rehearsal." },
      { q: "What is the MD's ideal stage position?", a: "Stage left or center, facing the band. Never with your back to the room. You must see the WL, the drummer, and the congregation simultaneously. Your position is a leadership position." },
      { q: "What is the kill track protocol?", a: "If tracks fail: 1. MD calls 'Kill the track' to operator. 2. Drummer locks to click in IEM only (if available) or holds time. 3. MD calls the band back to a simple loop. 4. Rebuild when stable. Never panic — call it calm and clear." },
    ]
  },
  {
    id: 4, title: "The Language — Standardized Calls", icon: "language",
    summary: "One vocabulary. Every MD speaks it. The band responds the same way regardless of who's calling.",
    content: [
      { q: "Why restrict vocabulary rather than improvise calls?", a: "Improvised calls in the moment require the band to decode rather than respond. Standardized language becomes muscle memory — the band acts on the call before they consciously process it. That 0.5-second gap is the difference between a tight transition and a train wreck." },
      { q: "What is the 2-bars-early rule?", a: "All navigation calls must happen 2 bars before the change, not at the change. 'Stand by — Chorus' with 2 bars remaining. This gives the band time to prepare physically and mentally, especially drummers and keys who need to set up fills and pads." },
      { q: "How does the rhythmic 'and' system work?", a: "When calling beats aloud to re-sync: '1 and 2 and 3 and 4 and' — the AND subdivisions lock the band to the click grid faster than calling downbeats alone. Use this whenever the band drifts from click, especially after a spontaneous moment." },
      { q: "What are the visual cues to standardize?", a: "Hand signals that mirror verbal calls: pointed finger up = going up a section, palm down = strip back, fist = full stop, circular motion = vamp/loop, thumb across throat = kill/end. Agree on these in rehearsal — they're lifesavers when talkback fails." },
    ]
  },
  {
    id: 5, title: "Core MD Responsibilities", icon: "responsibilities",
    summary: "The MD role spans the entire week — not just Sunday morning. Pre, during, and post-service responsibilities.",
    content: [
      { q: "What are the pre-service responsibilities?", a: "Track preparation and PCO notes reviewed during the week. WL planning conversation covering Energy Map, Exit Strategy, and Extended Worship Moments. Sunday morning: Production Point-to-Point coordination meeting with the full production team, then 10-Minute Huddle with band, IEM check, and talkback test. Nothing should be unknown walking into service." },
      { q: "What is the Production Point-to-Point Huddle?", a: "A Sunday morning coordination meeting between MD, WL, sound tech, production, and any other Sunday roles. Everyone aligns on the full service order, transitions, any special elements, and communication protocols." },
      { q: "What is the post-service worship huddle?", a: "A quick team check-in immediately after service — not just with the WL but with the whole team. Celebrate what went well, flag anything that needs addressing. Keep it brief and encouraging." },
      { q: "What is the quarterly macro-review?", a: "A longer review every quarter with the WL and core team leads. Review patterns, vocabulary gaps, team development progress, emerging MDs, and recurring technical issues. This is how the system improves over time." },
    ]
  },
  {
    id: 6, title: "The 90-Minute Rehearsal Blueprint", icon: "rehearsal",
    summary: "Rehearsal is for rehearsing the flow, not learning parts. Parts are learned at home. Begins with a devotional led by the WL.",
    content: [
      { q: "What is the 'Crash Through' and why does it matter?", a: "30 minutes: run the entire setlist without stopping, no matter what breaks. MD Rule — only stop if the train is completely off the tracks. Let musicians self-correct. MD takes notes on train-wreck moments. The band learns to recover and keep flow, which is the actual Sunday skill." },
      { q: "What is 'Targeted Fixes & Transitions' time?", a: "25 minutes after the crash-through. MD identifies the train-wreck moments and addresses them specifically. Key focus: song-to-song transitions are practiced and polished here. This is where transitions get rehearsed, not just flagged." },
      { q: "How should the Full Worship Run conclude rehearsal?", a: "25 minutes: zero stopping, treat it like Sunday. Full spiritual engagement — not just a technical run-through. WL leads from the front, MD practices spontaneous cues, WL can test spontaneous moments." },
      { q: "What does the MD do during Sound Check?", a: "10 minutes: line checks for all instruments and vocals. MD confirms they can be heard by all musicians. Test talkback mic and confirm IEM mix priorities. This is the technical foundation the rest of rehearsal depends on." },
    ]
  },
  {
    id: 7, title: "Tools — PCO, Spontaneous Framework & MC Groove", icon: "tools",
    summary: "The systems that make Sunday flow. When the structure is solid, spontaneous moments have room to breathe.",
    content: [
      { q: "What is the Spontaneous Moment Framework?", a: "4 phases: Phase 1 — Recognition: WL makes eye contact or gives a signal. Phase 2 — Anchor: MD calls 'Vamp [current chord]' and locks the band to a steady groove. Phase 3 — Space: MD holds the loop, reads the WL's body language and the room. Phase 4 — Exit: WL signals resolve, MD calls the return. Never assume the exit — always get the signal." },
      { q: "What is MC Groove (The Jam)?", a: "Background music played while a speaker addresses the congregation. Key: same as previous song. Tempo: 96 BPM or less. Progression: simple 4-chord pattern, commonly 1-4-6m-5 or 1-5-6m-4. Key of G: G, C, Em, D. Avoid consecutive minor chords and the 2 chord." },
      { q: "What is the Play Out / Pull Back dynamic in The Jam?", a: "'Play Out': when the speaker invites congregation to greet — 50–60% energy, full rhythm section. 'Pull Back': when speaker resumes talking — 30–40% energy, drummer to light hi-hat, bass to roots, keys to pads." },
      { q: "What is the weekly prep checklist?", a: "Coordinate with WL on Energy Map, Exit Strategy, and Extended Worship Moments. Build setlist in Playback. Test all tracks, confirm loops, save to cloud. Add MD notes to PCO for every song. Plan song-to-song transitions. Confirm talkback mic and IEM mix with sound tech." },
    ]
  },
  {
    id: 8, title: "The MD Development Pathway", icon: "pathway",
    summary: "We don't throw volunteers into the MD role — we build them systematically. 5-week incubator with clear benchmarks.",
    content: [
      { q: "What are the 5 weeks of the MD Incubator?", a: "Week 1: Vocabulary immersion — shadow a full service, observe only, memorize all navigation calls. Week 2: Shadow + call privately in IEM during a live service. Week 3: Call 2–3 songs live with backup MD on standby. Week 4: Lead first half of full set, MD observes. Week 5: Lead full Sunday service with MD on standby only." },
      { q: "What are the three skill development areas?", a: "Musical: confident counting and cueing, reading the room and WL simultaneously. Leadership: clear decisive communication, calm presence when things go off-script. Technical: Playback platform mastery, PCO navigation, track troubleshooting." },
      { q: "What are MD Scenario Training Nights?", a: "Quarterly 2–3 hour sessions where all MDs rotate through live scenarios while the band stays consistent. 7 scenarios: Track failure mid-song, Unrehearsed song request, WL extends spontaneous moment, Band/track out of sync, Last-minute setlist change, Key change between songs, and Difficult performance conversation role-play." },
      { q: "How does the MD adapt to different skill levels?", a: "Advanced musicians: open-ended cues, comfortable with Nashville Numbers. Intermediate musicians: need clear verbal cues and support for spontaneous moments. Developing musicians: very specific instructions, chord names instead of numbers. Test during sound check: 'We'll be using Nashville Numbers today — everyone comfortable?'" },
    ]
  },
  {
    id: 9, title: "Playback Technical Mastery", icon: "playback",
    summary: "MD must be so comfortable with Playback that operating it becomes second nature. On Sunday, your focus must be on leading — not fumbling with software.",
    content: [
      { q: "What are the Playback basics every MD must master?", a: "Login and access church account. Understand the interface: Setlist Panel, Transport Controls, Mixer Panel, Arrangement Panel, Click/Guide Controls. Load songs, set correct key and tempo. Control loops — set loop points, activate/deactivate cleanly. Manage individual track volumes. The MD who fumbles with Playback during a service has split their attention at the worst possible time. Master the interface before Sunday." },
      { q: "How does audio routing work — what goes to IEMs vs. the house?", a: "This is the most important technical rule in Playback: Click and Guide tracks NEVER go to the house speakers. They go to IEMs only.\n\nThree routing options depending on your setup:\n\n1. Headphone jack + stereo splitter cable (simplest): Auto Pan routes Click/Guide to the left channel, tracks to the right. Split cable sends left to IEM mixer, right to FOH. Great starting point.\n\n2. USB audio interface (recommended): Multi-output lets you assign each stem to its own output channel. Route Click to bus 1, Guide to bus 2, stems to buses 3 and up. More control, cleaner separation.\n\n3. Full multi-out rig: Separate buses for Drums, Keys, Pads, Bass, etc. — each going to individual console channels. MD or tech booth has full stem control from the console.\n\nTest your routing every rehearsal. The congregation should never hear click or guide cues." },
      { q: "How do you use the Stem Mixer and when should you mute stems?", a: "The Stem Mixer gives you per-song faders for every instrument and vocal stem. This is where you tailor the track to your live team.\n\nKey principle: if a musician is playing it live, mute or reduce that stem in the mix. Doubling live instruments with tracks sounds artificial and clutters the house mix.\n\nCommon muting decisions:\n- Turn off piano stem if your keys player is strong\n- Mute guitar stems if your guitarist covers it\n- Keep pad stems in for atmospheric fill even with live keys\n- Keep bass stem only if your bassist needs support\n- Drums stem: typically off if you have a live drummer\n\nReview every song's stems before rehearsal and set the mixer to complement your specific team that week — not every team has the same personnel." },
      { q: "What is the pre-service Playback setup checklist?", a: "30 minutes before service:\n- All songs loaded in correct order\n- Each song's key and tempo verified\n- Loop points tested on songs that may extend\n- Stem mixer set for this week's personnel\n- Click track audible in MD IEM\n- Guide cues audible and correctly routed (IEMs only)\n- Cloud sync confirmed complete\n- Talkback tested with sound tech\n- Backup device or plan ready\n\nIf you haven't run through this checklist before soundcheck, you're not ready." },
      { q: "What MIDI and automation capabilities should MDs know about?", a: "Playback's automation and MIDI features allow hands-free service leadership — these are underused by most worship teams.\n\nAutomation cues: Place cues on the timeline that automatically fire volume fades, mute/unmute stems, or trigger pad layers at specific moments. Pre-program transitions so the mix changes happen without touching the iPad.\n\nMIDI output: Playback can trigger ProPresenter to advance lyrics automatically, fire lighting scenes, or sync with Ableton — all locked to the playhead. No manual button presses mid-song.\n\nMIDI input: Foot pedals and controllers (useful for MDs who want hands-free transport control from stage). Next song, play/pause, loop toggles — all from a pedal on the floor.\n\nThese are Pro/Premium features, but for churches running MIDI-triggered lyrics and lights, they eliminate a whole category of human error." },
      { q: "How do you introduce tracks to a team that hasn't used them before?", a: "Don't start with full tracks in the house mix. That's the most common mistake — it makes the band sound like a backing track rather than a live team.\n\nThe right rollout sequence:\n\n1. Start with Click + Guide only (nothing in the house). Run them in IEMs for the band. Focus entirely on timing and getting comfortable with the click.\n\n2. Add IEM stems gradually. Let individual musicians hear a pad or reference part in their own ear mix. Still nothing in the house.\n\n3. Introduce subtle house stems if needed — pads, light percussion, ambient layers. Only what the live band genuinely can't cover. Keep the levels low.\n\n4. One new song every few weeks. Don't overwhelm the team.\n\nAddress the question everyone's thinking: 'Are tracks replacing musicians?' The honest answer is no — tracks fill gaps and add consistency. They should make the live team sound better, not replace them. Communicate this clearly before rolling out.\n\nAlways have an acoustic fallback plan. If tracks fail and the team isn't comfortable going fully live, you need a plan for how the service continues." },
      { q: "What are the 7 common technical issues and solutions?", a: "1. Track won't play — check cloud sync is complete, restart app, verify audio interface connection.\n2. Click not audible in IEM — check routing configuration, Auto Pan settings.\n3. Wrong key — transpose before service; verify key in PCO notes match Playback.\n4. Loop won't activate cleanly — set and test loop points during soundcheck, not during service.\n5. Track cuts out mid-song — call 'Kill the track,' band continues live. Stay calm.\n6. Wrong song loaded — call vamp while reloading. Never show panic.\n7. App crashes — have backup device ready with setlist pre-loaded and synced.\n\nMost issues can be prevented by a thorough soundcheck and pre-service checklist. Crashes are rare with updated software — but backup devices are non-negotiable." },
      { q: "What is the Emergency Protocol for operating without tracks?", a: "If tracks fail completely: MD calls 'Kill the track' immediately — don't let silence linger even for 2 seconds. Drummer locks to click in IEM if still available, or holds time by feel. MD calls 'Vamp on 1 and 4' and gives the key. Band locks to a simple groove.\n\nMD stays calm and confident — a steady voice is the difference between a hiccup and a service disaster. The congregation won't know tracks failed if you don't show it on your face or in your voice.\n\nWL decides whether to continue the song live or move to the next element. MD supports whatever decision is made without hesitation." },
    ]
  },
  {
    id: 10, title: "The Code of Conduct", icon: "conduct",
    summary: "The standards that define how a high-functioning worship team carries itself. Non-negotiable expectations for every member.",
    content: [
      { q: "What does 'Calmness is Power' mean for the MD?", a: "Your emotional tone sets the band's temperature. If you're anxious, the band is anxious. If you're steady, the band is steady. This is not suppression — it's leadership. Process anxiety before or after the service. During the service, your calm is a gift to the team." },
      { q: "What is the 'Drumstick Rule'?", a: "Be assertive in the moment; kind after. During service, your call is decisive — no softening. After service, follow up privately with anyone who received a sharp correction. Close the loop always." },
      { q: "What is the private correction standard?", a: "No corrections in front of the team or congregation. Pull the person aside privately — always begin with genuine praise before addressing the issue. Public correction destroys dignity. Private correction builds trust." },
      { q: "What is 'One Common Goal: Leave Pride Off the Stage'?", a: "Together the team serves one singular purpose — glorifying God and leading others to do the same. Corrections serve the whole team's excellence. Check your ego at the door, accept feedback with grace. Excellence without pride." },
    ]
  },
];

const SCENARIOS = [
  {
    id: 1, title: "Tracks fail mid-song", difficulty: "High", category: "Emergency",
    prompt: "The backing track cuts out completely at bar 16 of the second song. You're 3 songs into the set. The WL is mid-vocal.",
    callSequence: ["Kill the track immediately — don't let silence linger", "Talkback: 'We're going live — flow on 1 and 4'", "Cue drummer: basic groove, match current energy", "Call the key: 'Key of G, 1 and 4'", "Watch WL — support wherever they take it", "Count everyone back in cleanly on the next downbeat"],
    whyItWorks: "Silence is the enemy. The moment the track dies, your job is to fill it with something musical and confident. 'Flow on 1 and 4' is your universal safety net — every player knows it, it works in any key, and it buys you time. The congregation won't know tracks failed if you don't show it on your face.",
    commonMistake: "Freezing for 2–3 seconds trying to fix the track instead of immediately going live. By the time you decide, the moment is already broken."
  },
  {
    id: 2, title: "Drummer drifts off click", difficulty: "Medium", category: "Sync",
    prompt: "The drummer has drifted 10–15 BPM below click tempo during the bridge. The band is following the drummer, not the click.",
    callSequence: ["Don't panic — assess how far off they are", "Talkback: 'Watch the click' (soft reminder first)", "If no response: 'Lock to the click — on me'", "Start calling downbeats: '1... 2... 3... 4...'", "Hold for 2–4 bars until drummer realigns", "Stop calling once locked — don't over-correct"],
    whyItWorks: "The 2-step approach (soft reminder → firm correction) protects the drummer's dignity while solving the problem fast. Calling downbeats out loud gives them an audible anchor that cuts through IEM mix. Most drift is unintentional — a calm correction fixes it in 2 bars.",
    commonMistake: "Going straight to 'Lock to the click' without the soft reminder first, which embarrasses the drummer in front of the team and damages trust. Or calling full subdivisions (1 & 2 & 3 & 4 &) when simple downbeats are clearer."
  },
  {
    id: 3, title: "WL extends a moment unexpectedly", difficulty: "Medium", category: "Spontaneous",
    prompt: "You're in the final chorus. The WL holds up a hand and steps back from the mic — clearly going into a spontaneous moment. No pre-planned signal.",
    callSequence: ["Immediately: 'Vamp here' — loop the current chord progression", "Talkback: 'Pads only — stay light'", "Watch the WL constantly for transition cues", "Listen to their vocal mic — they'll often cue the next move verbally", "'Stand by to bring it back' when you sense movement", "Count the band back in 2 bars early: 'Chorus in 2... 1, 2, Chorus'"],
    whyItWorks: "The hand signal is your cue — the WL is reading the Spirit, your job is to create space for it. 'Vamp here' keeps everyone musical without locking them into a moving track. Pads-only creates intimacy and lets the congregation be heard. Watch for the exhale — WLs often take a deep breath right before they're ready to re-engage.",
    commonMistake: "Letting the track keep running while the WL extends — the track will eventually force the moment to end. Kill it or loop it. Also: over-calling during the moment and breaking the atmosphere."
  },
  {
    id: 4, title: "Key change between songs with no gap", difficulty: "Medium", category: "Transitions",
    prompt: "Song 2 ends in G major. Song 3 starts in Eb major. The WL wants to go directly from one to the other with no spoken moment.",
    callSequence: ["Song 2 ends — crash on the 1, sustain", "Talkback: 'Keys — take us to Eb, bridge chord'", "Keys plays D major (bridge chord — 5 of G, exists in Eb context)", "Keys moves through Bb to Eb — let it breathe (4–6 bars)", "Once Eb is established: fire the click for Song 3", "Count the band in 2 bars early"],
    whyItWorks: "The bridge chord method uses a chord that exists in both keys to smooth the harmonic journey. The congregation barely notices the key change — they just feel the worship continue. The keys player leads, you watch and fire the click at the right moment. Never rush the transition — let it breathe.",
    commonMistake: "Firing the click before keys has established the new key — the band comes in dissonantly. Or cutting the transition too short because you're nervous about dead air. That space is part of the arrangement — don't fill it with anxiety."
  },
  {
    id: 5, title: "Late entrance — wrong section", difficulty: "High", category: "Emergency",
    prompt: "Guitarist comes in on verse 2 instead of the bridge. The drummer is locked but the bassist started following the guitarist. You have 4 bars to resolve this.",
    callSequence: ["Assess immediately: who's right, who's wrong", "Talkback to guitarist: 'Bridge — we're in the bridge'", "Talkback to bassist: 'Follow the drummer'", "If confusion spreads: 'Hold — everyone on me'", "Call a clean restart of the section: 'Bridge from the top, in 2'", "Count in crisply — '1, 2, Bridge'"],
    whyItWorks: "You have one job: stop the bleeding fast. Address the wrong player first (guitarist), then the one who followed them (bassist). If it's already spreading, a clean section restart is better than trying to fix it mid-flight. The congregation barely notices. That's the win.",
    commonMistake: "Trying to fix it while everyone keeps playing — this turns a 4-bar problem into a 16-bar disaster. Don't be afraid to call a reset. Confidence over perfection: a clean restart is always available to you."
  },
  {
    id: 6, title: "Last-minute setlist change", difficulty: "Low", category: "Preparation",
    prompt: "2 minutes before service, WL tells you they're cutting song 4 and adding a song the band has played before but didn't rehearse today.",
    callSequence: ["Stay calm — don't let your reaction set the band's anxiety", "Immediately confirm key and tempo with WL", "Talkback to band: 'Change — Song 4 is [title], key of [X], [BPM] tempo'", "Confirm who knows it: 'Does everyone know this?'", "If yes: 'Follow vocals, Nashville Numbers, I'll call it'", "Load or skip the track in Playback — decide now, not during the song"],
    whyItWorks: "Two minutes is enough time if you don't waste it. Calm communication to the band prevents panic. The key question is track vs. no track — decide before you walk on stage. If no track, 'vamp on 1 and 4' gets you through the intro while everyone finds their footing.",
    commonMistake: "Spending the 2 minutes trying to find the track in Playback and saying nothing to the band. They walk on stage not knowing what's happening. Communication first, logistics second."
  },
  {
    id: 7, title: "Spontaneous moment — reading the exit", difficulty: "High", category: "Spontaneous",
    prompt: "You've been vamping on the tonic chord for 4 minutes during a spontaneous moment. The WL is praying. The congregation is deeply engaged.",
    callSequence: ["Continue holding space — don't rush the exit", "Watch for WL transition cues: deep breath, shift in body language, eye contact with you", "When you sense movement: 'Stand by to bring it back'", "Listen to the WL's vocal mic for verbal cues to congregation", "Prepare the band: 'Chorus in 4 — stand by'", "Count in 2 bars early when WL signals: '1, 2, Chorus'"],
    whyItWorks: "The exit is where most MDs fail — they either pull out too early (breaking the moment) or too late (the WL has to awkwardly fill). Your cues are the WL's breath, their posture shifting from prayer to proclamation, and their eye contact with you. 'Stand by' is your signal to the band that the exit is coming without disturbing the moment.",
    commonMistake: "Pulling the band out on your own timeline instead of the WL's. The WL is the spiritual authority in that moment. Your job is to follow their exit, not create your own. Also: not using 'Stand by' — the band comes in ragged because they weren't warned."
  },
];


const LIVE_SET_DATA = [
  {
    id: "service-1", title: "Sunday Morning Service",
    songs: [
      {
        id: "song-1", title: "Great Are You Lord", key: "E", bpm: 68,
        sections: [
          { id: "s1",  type: "intro",     label: "Intro",        bars: 4,  repeatCount: 1, note: "Keys only — pads in from bar 1",          headsUp: "Verse coming in 4 bars",      options: ["Extend pads", "Bring in full band"] },
          { id: "s2",  type: "verse",     label: "Verse 1",      bars: 8,  repeatCount: 1, note: "Intimate — guitar and keys only",         headsUp: "Pre-chorus in 2 bars",        options: ["Stay minimal", "Add bass"] },
          { id: "s3",  type: "prechorus", label: "Pre-Chorus",   bars: 4,  repeatCount: 1, note: "Bass and drums enter on beat 1",          headsUp: "Chorus hit — full band",      options: ["Build early", "Hold back"] },
          { id: "s4",  type: "chorus",    label: "Chorus",       bars: 8,  repeatCount: 1, note: "Full band — lift and lock",               headsUp: "Verse 2 — strip back",        options: ["Tag chorus", "Go to verse 2"] },
          { id: "s5",  type: "verse",     label: "Verse 2",      bars: 8,  repeatCount: 1, note: "Pull back — same feel as verse 1",        headsUp: "Pre-chorus again",            options: ["Stay minimal", "Add bass"] },
          { id: "s6",  type: "prechorus", label: "Pre-Chorus 2", bars: 4,  repeatCount: 1, note: "Build same as before",                    headsUp: "Chorus — go big",             options: ["Full build", "Hold pads"] },
          { id: "s7",  type: "chorus",    label: "Chorus 2",     bars: 8,  repeatCount: 1, note: "Full band — peak energy",                 headsUp: "Bridge — watch WL",           options: ["Tag it", "Go to bridge"] },
          { id: "s8",  type: "bridge",    label: "Bridge",       bars: 8,  repeatCount: 1, note: "Watch WL — may extend spontaneously",     headsUp: "Final chorus or vamp likely", options: ["Vamp here", "Push to final chorus"] },
          { id: "s9",  type: "chorus",    label: "Final Chorus", bars: 8,  repeatCount: 2, note: "Everything — big ending",                 headsUp: "Tag x2 then button",          options: ["Tag it 2x", "Soft landing"] },
          { id: "s10", type: "outro",     label: "Outro",        bars: 4,  repeatCount: 1, note: "Ritard into the 1 — soft landing",        headsUp: "Song 2 coming — stay in E",   options: ["Button it", "Hold sustain"] },
        ],
      },
      {
        id: "song-2", title: "What A Beautiful Name", key: "D", bpm: 72,
        sections: [
          { id: "s1",  type: "intro",     label: "Intro",        bars: 4,  repeatCount: 1, note: "Flow from previous — keys hold E to D",   headsUp: "Verse 1 in 8 bars",           options: ["Extend transition", "Jump to verse"] },
          { id: "s2",  type: "verse",     label: "Verse 1",      bars: 8,  repeatCount: 1, note: "Stripped — vocals and keys only",         headsUp: "Pre-chorus building",         options: ["Stay stripped", "Add guitar"] },
          { id: "s3",  type: "prechorus", label: "Pre-Chorus",   bars: 4,  repeatCount: 1, note: "Bass enters — build the anticipation",    headsUp: "Chorus — full band drops",    options: ["Hold build", "Bring drums early"] },
          { id: "s4",  type: "chorus",    label: "Chorus 1",     bars: 8,  repeatCount: 1, note: "Full band — locked to click",             headsUp: "Verse 2 — pull back hard",    options: ["Tag chorus", "Straight to verse"] },
          { id: "s5",  type: "verse",     label: "Verse 2",      bars: 8,  repeatCount: 1, note: "Even more stripped than verse 1",         headsUp: "Pre-chorus build again",      options: ["Vocal only option", "Keys only"] },
          { id: "s6",  type: "prechorus", label: "Pre-Chorus 2", bars: 4,  repeatCount: 1, note: "Same build — trust the pattern",          headsUp: "Big chorus — peak moment",    options: ["Full build", "Half-time feel"] },
          { id: "s7",  type: "chorus",    label: "Chorus 2",     bars: 8,  repeatCount: 1, note: "Full band — peak of service energy",      headsUp: "Bridge — WL will linger here", options: ["Tag it", "Watch WL for bridge"] },
          { id: "s8",  type: "bridge",    label: "Bridge",       bars: 8,  repeatCount: 1, note: "WL always extends here — be ready to vamp", headsUp: "This is the moment — stay present", options: ["Vamp on D", "Free worship pads"] },
          { id: "s9",  type: "chorus",    label: "Final Chorus", bars: 8,  repeatCount: 2, note: "Triumphant — everything in",              headsUp: "Last tag then button",        options: ["Tag x3", "Ritard to end"] },
          { id: "s10", type: "outro",     label: "Outro",        bars: 4,  repeatCount: 1, note: "Button on 1 — clean stop",               headsUp: "Service continues — stay alert", options: ["Button it", "Fade out"] },
        ],
      },
    ],
  },
];

const DEFAULT_BARS_BY_TYPE = {
  intro: 4, verse: 8, prechorus: 4, chorus: 8, bridge: 8,
  tag: 4, outro: 4, turnaround: 2, instrumental: 8, breakdown: 4, vamp: 4,
};

const ONBOARDING_WEEKS = [
  { week: 1, title: "Vocabulary Immersion", tasks: ["Shadow a full service — observe only", "Read Part 4: The Language completely", "Memorize all navigation calls", "Shadow MD in IEM — call privately to yourself"], benchmark: "Can name all calls without reference" },
  { week: 2, title: "Shadow + Private Call", tasks: ["Shadow again — call every transition privately in your IEM", "WL planning conversation with MD present", "Review Part 6: Rehearsal Blueprint", "Practice 2-bars-early rule in home practice"], benchmark: "Calls are timed correctly in private IEM" },
  { week: 3, title: "First Live Reps (Partial)", tasks: ["Call 2–3 songs live; MD on standby in IEM", "Review Part 5: Core Responsibilities", "Fill out a full PCO MD Notes template", "Post-service micro-debrief with MD"], benchmark: "Zero band hesitation in 2–3 songs" },
  { week: 4, title: "Half-Set Independent", tasks: ["Lead first half of full set", "MD observes from stage, no calls", "Review Part 7: Spontaneous Framework", "Identify one area of growth for Week 5"], benchmark: "WL reports consistent confidence" },
  { week: 5, title: "Full Service Deployment", tasks: ["Lead full Sunday service", "MD on standby only — does not call", "Complete self-assessment after service", "Receive full debrief from MD + WL"], benchmark: "All three skill areas rated ready" },
];

// ─── PERSISTENCE ──────────────────────────────────────────────────────────────

const mkId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

const STARTER_SONGS = [
  { id: "ss-1", title: "Great Are You Lord", key: "E", bpm: 68, sections: [
    { id: "ss1-1", type: "intro",   label: "Intro",        bars: 4,  repeatCount: 1, note: "Keys only — pads in from bar 1",              headsUp: "Verse coming",              headsUpBarsBefore: 2, options: [] },
    { id: "ss1-2", type: "verse",   label: "Verse 1",      bars: 8,  repeatCount: 1, note: "Intimate — guitar and keys only",             headsUp: "Pre-chorus — bass enters",  headsUpBarsBefore: 2, options: [] },
    { id: "ss1-3", type: "prechorus",label: "Pre-Chorus",  bars: 4,  repeatCount: 1, note: "Bass and drums enter on beat 1",              headsUp: "Chorus — full band",        headsUpBarsBefore: 2, options: [] },
    { id: "ss1-4", type: "chorus",  label: "Chorus",       bars: 8,  repeatCount: 2, note: "Full band — lift and lock",                   headsUp: "Verse 2 — strip back",      headsUpBarsBefore: 2, options: [] },
    { id: "ss1-5", type: "verse",   label: "Verse 2",      bars: 8,  repeatCount: 1, note: "Pull back — same feel as verse 1",            headsUp: "Pre-chorus again",          headsUpBarsBefore: 2, options: [] },
    { id: "ss1-6", type: "bridge",  label: "Bridge",       bars: 8,  repeatCount: 2, note: "Watch WL — may extend spontaneously",         headsUp: "Final chorus likely",       headsUpBarsBefore: 2, options: [] },
    { id: "ss1-7", type: "chorus",  label: "Final Chorus", bars: 8,  repeatCount: 2, note: "Everything — big ending",                     headsUp: "Tag then button",           headsUpBarsBefore: 2, options: [] },
    { id: "ss1-8", type: "outro",   label: "Outro",        bars: 4,  repeatCount: 1, note: "Ritard into the 1 — soft landing",            headsUp: "Song end",                  headsUpBarsBefore: 2, options: [] },
  ]},
  { id: "ss-2", title: "What A Beautiful Name", key: "D", bpm: 72, sections: [
    { id: "ss2-1", type: "intro",   label: "Intro",        bars: 4,  repeatCount: 1, note: "Keys flow from previous song",                headsUp: "Verse 1 incoming",          headsUpBarsBefore: 2, options: [] },
    { id: "ss2-2", type: "verse",   label: "Verse 1",      bars: 8,  repeatCount: 1, note: "Stripped — vocals and keys only",             headsUp: "Pre-chorus — build",        headsUpBarsBefore: 2, options: [] },
    { id: "ss2-3", type: "prechorus",label: "Pre-Chorus",  bars: 4,  repeatCount: 1, note: "Bass enters — build the anticipation",        headsUp: "Chorus — full band",        headsUpBarsBefore: 2, options: [] },
    { id: "ss2-4", type: "chorus",  label: "Chorus",       bars: 8,  repeatCount: 2, note: "Full band — locked to click",                 headsUp: "Verse 2 — pull back hard",  headsUpBarsBefore: 2, options: [] },
    { id: "ss2-5", type: "verse",   label: "Verse 2",      bars: 8,  repeatCount: 1, note: "Even more stripped than verse 1",             headsUp: "Pre-chorus build again",    headsUpBarsBefore: 2, options: [] },
    { id: "ss2-6", type: "bridge",  label: "Bridge",       bars: 8,  repeatCount: 1, note: "WL always extends here — be ready to vamp",  headsUp: "Watch WL for the exit",     headsUpBarsBefore: 2, options: [] },
    { id: "ss2-7", type: "chorus",  label: "Final Chorus", bars: 8,  repeatCount: 2, note: "Triumphant — everything in",                 headsUp: "Last tag then button",      headsUpBarsBefore: 2, options: [] },
    { id: "ss2-8", type: "outro",   label: "Outro",        bars: 4,  repeatCount: 1, note: "Button on 1 — clean stop",                   headsUp: "Song end",                  headsUpBarsBefore: 2, options: [] },
  ]},
  { id: "ss-3", title: "Graves Into Gardens", key: "G", bpm: 72, sections: [
    { id: "ss3-1", type: "verse",   label: "Verse 1",      bars: 8,  repeatCount: 1, note: "Open feel — keys and soft guitar",            headsUp: "Pre-chorus coming",         headsUpBarsBefore: 2, options: [] },
    { id: "ss3-2", type: "prechorus",label: "Pre-Chorus",  bars: 4,  repeatCount: 1, note: "Energy builds — drums enter",                 headsUp: "Chorus — full band",        headsUpBarsBefore: 2, options: [] },
    { id: "ss3-3", type: "chorus",  label: "Chorus",       bars: 8,  repeatCount: 2, note: "Full groove — bass locked to kick",           headsUp: "Verse 2 — strip",           headsUpBarsBefore: 2, options: [] },
    { id: "ss3-4", type: "verse",   label: "Verse 2",      bars: 8,  repeatCount: 1, note: "Same as verse 1",                             headsUp: "Pre-chorus again",          headsUpBarsBefore: 2, options: [] },
    { id: "ss3-5", type: "prechorus",label: "Pre-Chorus 2",bars: 4,  repeatCount: 1, note: "Same build",                                 headsUp: "Big chorus",                headsUpBarsBefore: 2, options: [] },
    { id: "ss3-6", type: "chorus",  label: "Chorus 2",     bars: 8,  repeatCount: 2, note: "Peak energy",                                headsUp: "Bridge — watch WL",         headsUpBarsBefore: 2, options: [] },
    { id: "ss3-7", type: "bridge",  label: "Bridge",       bars: 8,  repeatCount: 2, note: "High energy — watch WL for extension",       headsUp: "Final chorus or tag",       headsUpBarsBefore: 2, options: [] },
    { id: "ss3-8", type: "chorus",  label: "Final Chorus", bars: 8,  repeatCount: 1, note: "Everything — peak",                          headsUp: "Outro or button",           headsUpBarsBefore: 2, options: [] },
  ]},
  { id: "ss-4", title: "Way Maker", key: "Bb", bpm: 76, sections: [
    { id: "ss4-1", type: "intro",   label: "Intro",        bars: 8,  repeatCount: 1, note: "Signature synth/keys pattern — loop if needed", headsUp: "Verse incoming",          headsUpBarsBefore: 2, options: [] },
    { id: "ss4-2", type: "verse",   label: "Verse 1",      bars: 8,  repeatCount: 1, note: "Minimal — let the lyric breathe",             headsUp: "Chorus — lift",             headsUpBarsBefore: 2, options: [] },
    { id: "ss4-3", type: "chorus",  label: "Chorus",       bars: 8,  repeatCount: 2, note: "Full band — driving groove",                  headsUp: "Verse 2",                   headsUpBarsBefore: 2, options: [] },
    { id: "ss4-4", type: "verse",   label: "Verse 2",      bars: 8,  repeatCount: 1, note: "Same as verse 1",                             headsUp: "Chorus again",              headsUpBarsBefore: 2, options: [] },
    { id: "ss4-5", type: "bridge",  label: "Bridge",       bars: 8,  repeatCount: 3, note: "Watch WL — spontaneous extension common",    headsUp: "Hold or final chorus",      headsUpBarsBefore: 2, options: [] },
    { id: "ss4-6", type: "chorus",  label: "Final Chorus", bars: 8,  repeatCount: 2, note: "Peak energy — triumphant ending",            headsUp: "Tag or button",             headsUpBarsBefore: 2, options: [] },
  ]},
  { id: "ss-5", title: "Goodness of God", key: "A", bpm: 68, sections: [
    { id: "ss5-1", type: "verse",   label: "Verse 1",      bars: 8,  repeatCount: 1, note: "Very stripped — piano and vocal",             headsUp: "Chorus — gentle lift",      headsUpBarsBefore: 2, options: [] },
    { id: "ss5-2", type: "chorus",  label: "Chorus",       bars: 8,  repeatCount: 2, note: "Gentle full band — not overpowering",         headsUp: "Verse 2 — strip back",      headsUpBarsBefore: 2, options: [] },
    { id: "ss5-3", type: "verse",   label: "Verse 2",      bars: 8,  repeatCount: 1, note: "Same as verse 1",                             headsUp: "Chorus",                    headsUpBarsBefore: 2, options: [] },
    { id: "ss5-4", type: "bridge",  label: "Bridge",       bars: 8,  repeatCount: 2, note: "Emotional peak — WL often extends here",     headsUp: "Final chorus or vamp",      headsUpBarsBefore: 2, options: [] },
    { id: "ss5-5", type: "chorus",  label: "Final Chorus", bars: 8,  repeatCount: 2, note: "Full and worshipful — everything in",        headsUp: "Tag or soft landing",       headsUpBarsBefore: 2, options: [] },
  ]},
  { id: "ss-6", title: "Reckless Love", key: "E", bpm: 76, sections: [
    { id: "ss6-1", type: "verse",   label: "Verse 1",      bars: 8,  repeatCount: 1, note: "Minimal — voice and keys",                   headsUp: "Pre-chorus",                headsUpBarsBefore: 2, options: [] },
    { id: "ss6-2", type: "prechorus",label: "Pre-Chorus",  bars: 4,  repeatCount: 1, note: "Build gently",                               headsUp: "Chorus — lift",             headsUpBarsBefore: 2, options: [] },
    { id: "ss6-3", type: "chorus",  label: "Chorus",       bars: 8,  repeatCount: 2, note: "Full band — anthem feel",                    headsUp: "Verse 2",                   headsUpBarsBefore: 2, options: [] },
    { id: "ss6-4", type: "verse",   label: "Verse 2",      bars: 8,  repeatCount: 1, note: "Same as verse 1",                            headsUp: "Pre-chorus",                headsUpBarsBefore: 2, options: [] },
    { id: "ss6-5", type: "bridge",  label: "Bridge",       bars: 8,  repeatCount: 3, note: "High energy — watch for WL spontaneous",    headsUp: "Final chorus",              headsUpBarsBefore: 2, options: [] },
    { id: "ss6-6", type: "chorus",  label: "Final Chorus", bars: 8,  repeatCount: 2, note: "Everything — peak moment",                  headsUp: "Button or tag",             headsUpBarsBefore: 2, options: [] },
  ]},
  { id: "ss-7", title: "Build My Life", key: "D", bpm: 68, sections: [
    { id: "ss7-1", type: "verse",   label: "Verse 1",      bars: 8,  repeatCount: 1, note: "Very intimate — keys and vocal only",        headsUp: "Pre-chorus",                headsUpBarsBefore: 2, options: [] },
    { id: "ss7-2", type: "prechorus",label: "Pre-Chorus",  bars: 4,  repeatCount: 1, note: "Gentle build",                               headsUp: "Chorus — lift",             headsUpBarsBefore: 2, options: [] },
    { id: "ss7-3", type: "chorus",  label: "Chorus",       bars: 8,  repeatCount: 2, note: "Full band — worshipful not loud",            headsUp: "Verse 2 — strip back",      headsUpBarsBefore: 2, options: [] },
    { id: "ss7-4", type: "verse",   label: "Verse 2",      bars: 8,  repeatCount: 1, note: "Same as verse 1",                            headsUp: "Pre-chorus",                headsUpBarsBefore: 2, options: [] },
    { id: "ss7-5", type: "bridge",  label: "Bridge",       bars: 8,  repeatCount: 3, note: "Extended bridge common — watch WL",         headsUp: "Final chorus",              headsUpBarsBefore: 2, options: [] },
    { id: "ss7-6", type: "chorus",  label: "Final Chorus", bars: 8,  repeatCount: 2, note: "Big ending on the G",                       headsUp: "Ending",                    headsUpBarsBefore: 2, options: [] },
  ]},
  { id: "ss-8", title: "This Is Amazing Grace", key: "G", bpm: 134, sections: [
    { id: "ss8-1", type: "verse",   label: "Verse 1",      bars: 8,  repeatCount: 1, note: "Driving feel — full band from top",          headsUp: "Pre-chorus",                headsUpBarsBefore: 2, options: [] },
    { id: "ss8-2", type: "prechorus",label: "Pre-Chorus",  bars: 4,  repeatCount: 1, note: "Energy stays high",                          headsUp: "Chorus — huge",             headsUpBarsBefore: 2, options: [] },
    { id: "ss8-3", type: "chorus",  label: "Chorus",       bars: 8,  repeatCount: 2, note: "Everything — peak energy from the top",     headsUp: "Verse 2",                   headsUpBarsBefore: 2, options: [] },
    { id: "ss8-4", type: "verse",   label: "Verse 2",      bars: 8,  repeatCount: 1, note: "Same as verse 1",                           headsUp: "Pre-chorus",                headsUpBarsBefore: 2, options: [] },
    { id: "ss8-5", type: "bridge",  label: "Bridge",       bars: 8,  repeatCount: 2, note: "Huge shots — watch drummer",                headsUp: "Final chorus",              headsUpBarsBefore: 2, options: [] },
    { id: "ss8-6", type: "chorus",  label: "Final Chorus", bars: 8,  repeatCount: 2, note: "Peak — full everything",                    headsUp: "Button or tag",             headsUpBarsBefore: 2, options: [] },
  ]},
  { id: "ss-9", title: "Good Grace", key: "G", bpm: 140, sections: [
    { id: "ss9-1", type: "verse",   label: "Verse 1",      bars: 8,  repeatCount: 1, note: "Full groove from bar 1 — high energy",      headsUp: "Chorus — keep energy",      headsUpBarsBefore: 2, options: [] },
    { id: "ss9-2", type: "chorus",  label: "Chorus",       bars: 8,  repeatCount: 2, note: "Driving — locked to click",                 headsUp: "Verse 2",                   headsUpBarsBefore: 2, options: [] },
    { id: "ss9-3", type: "verse",   label: "Verse 2",      bars: 8,  repeatCount: 1, note: "Same energy as verse 1",                   headsUp: "Chorus",                    headsUpBarsBefore: 2, options: [] },
    { id: "ss9-4", type: "bridge",  label: "Bridge",       bars: 8,  repeatCount: 2, note: "Watch dynamic instructions in the track",  headsUp: "Final chorus",              headsUpBarsBefore: 2, options: [] },
    { id: "ss9-5", type: "chorus",  label: "Final Chorus", bars: 8,  repeatCount: 2, note: "Full energy to the end",                   headsUp: "Button or tag",             headsUpBarsBefore: 2, options: [] },
  ]},
  { id: "ss-10", title: "Holy Forever", key: "Bb", bpm: 70, sections: [
    { id: "ss10-1", type: "verse",   label: "Verse 1",     bars: 8,  repeatCount: 1, note: "Stripped and reverent — keys and vocal",    headsUp: "Pre-chorus",                headsUpBarsBefore: 2, options: [] },
    { id: "ss10-2", type: "prechorus",label: "Pre-Chorus", bars: 4,  repeatCount: 1, note: "Gentle build",                              headsUp: "Chorus — lift",             headsUpBarsBefore: 2, options: [] },
    { id: "ss10-3", type: "chorus",  label: "Chorus",      bars: 8,  repeatCount: 2, note: "Full and worshipful",                       headsUp: "Verse 2 — strip",           headsUpBarsBefore: 2, options: [] },
    { id: "ss10-4", type: "verse",   label: "Verse 2",     bars: 8,  repeatCount: 1, note: "Same as verse 1",                           headsUp: "Pre-chorus",                headsUpBarsBefore: 2, options: [] },
    { id: "ss10-5", type: "bridge",  label: "Bridge",      bars: 8,  repeatCount: 3, note: "Watch WL — spontaneous extension very common here", headsUp: "Final chorus",     headsUpBarsBefore: 2, options: [] },
    { id: "ss10-6", type: "chorus",  label: "Final Chorus",bars: 8,  repeatCount: 2, note: "Peak — triumphant and full",                headsUp: "Tag or button",             headsUpBarsBefore: 2, options: [] },
  ]},
];

const buildSeedData = () => {
  const songLibrary = STARTER_SONGS;
  const starterService = {
    id: "service-demo",
    title: "My First Service",
    blocks: [
      { id: "b1", type: "song", songId: "ss-1", notes: { arrangement: "", chords: "", dynamics: "", special: "" } },
      { id: "b2", type: "transition", notes: { arrangement: "", chords: "", dynamics: "", special: "" } },
      { id: "b3", type: "song", songId: "ss-2", notes: { arrangement: "", chords: "", dynamics: "", special: "" } },
    ],
    songIds: ["ss-1", "ss-2"],
  };
  return { songLibrary, services: [starterService], activeServiceId: "service-demo" };
};

const loadAppState = () => {
  try { const raw = localStorage.getItem("wp-app-state"); if (raw) return JSON.parse(raw); } catch {}
  return buildSeedData();
};
const saveAppState = (state) => { try { localStorage.setItem("wp-app-state", JSON.stringify(state)); } catch {} };

// ─── MD MODULES ──────────────────────────────────────────────────────────────

const MD_MODULES = [
  {
    id: "role", icon: "foundation", title: "The Role of the MD",
    tagline: "What the MD role actually is, and what it demands of you.",
    outcomes: ["Effectively communicate the purpose of the MD role", "Name the 5 foundational principles that govern every MD decision", "Describe how the WL and MD function as a single leadership unit", "Understand what authority the MD holds and how relational equity makes it work"],
    sections: [
      { heading: "The Navigator — Core Identity", body: "The Musical Director is the Navigator. While the Worship Leader is the captain setting the destination, the MD charts the course and calls out the turns — ensuring the ship stays on track and doesn't hit the rocks.\n\nThis is the Google Maps Mandate: even when the band knows the route, you provide the background safety net. Like GPS, you instruct the turn before they reach it — navigating with the goal of keeping everyone unified and confident.\n\nThe MD serves the Worship Leader's vision while stewarding the team's excellence. The WL sets the spiritual direction. The MD ensures the team executes it with clarity and unity." },
      { heading: "The 5 Foundational Principles", body: "Everything in the MD role flows from these five principles:\n\n• Serve the vision, not the spotlight — your job is to help the room worship, not to demonstrate your musicianship\n• Prepare the band before rehearsal — charts, keys, tempos, and structure sent early creates peace in the room\n• Control dynamics, not volume — less in the verses, save the lift for the right moment\n• Be the musical bridge — translate the Worship Leader's heart to the band in real time\n• Lead people, not just music — encourage, protect unity, and create a safe environment to worship\n\nThese aren't suggestions. They're the operating system of the role." },
      { heading: "The Core Principle: Confidence Over Perfection", body: "A wrong cue given with 100% confidence is a pivot. A right cue given with hesitation can be a train wreck.\n\nThis is the most important single principle in the MD role. The band needs to feel your certainty, especially when things don't go to plan. Your calm is contagious. Your hesitation is too.\n\nOn Sunday, you will make imperfect calls. That's inevitable. What cannot be imperfect is your conviction when you make them. Decide. Call it. Commit. The band will follow a confident wrong call far better than a hesitant right one." },
      { heading: "Authority and Relational Equity", body: "Authority in the MD role is delegated by the Worship Leader. The WL must publicly hand the keys to the MD so the team knows who to follow musically. Without that public delegation, you'll have informal influence at best — and confusion at worst.\n\nBut authority only works if the team trusts you. You cannot lead a team that doesn't know you. Relational equity is built mid-week: knowing your musicians personally, caring about their lives, and investing in the relationship before you ever need to correct them in the moment.\n\nWithout relationship, correction feels like an attack. With relationship, correction feels like coaching. Build trust before you need to use authority." },
      { heading: "The Unified Front", body: "The WL and MD must function as a single leadership unit. If the band detects a split between them — even a moment of uncertainty or silent disagreement — they hesitate. And hesitation on Sunday costs you the moment.\n\nDisagreements happen after the service, never during. If the WL calls something unexpected mid-service, the MD executes it without hesitation and processes it afterward. The band must never see conflict or uncertainty between the WL and MD.\n\nThis requires trust built in the weekly planning conversation — before Sunday, not during it." },
      { heading: "What the MD is NOT", body: "The MD is not the Worship Leader. This distinction matters because confusion here creates problems for the whole team.\n\nThe WL leads the congregation in worship — setting spiritual direction, reading the room spiritually, making Spirit-led decisions.\n\nThe MD leads the band in execution — calling sections, managing dynamics, navigating transitions, reading the WL and translating their direction into musical reality.\n\nWhen both roles are clear, the band has one person to follow for musical execution. That clarity eliminates hesitation and creates a team that moves as one." },
    ],
    practicePrompt: "Open Live Mode and navigate through a full service. Before you press play, say aloud: 'I am the navigator. My job is confidence, not perfection.' Practice calling every transition decisively — even if you're unsure. Call it. Commit. That's the skill.",
  },
  {
    id: "cues", icon: "language", title: "Cue Language & Communication",
    tagline: "Learn the cue language your band responds to — consistently, every Sunday.",
    outcomes: ["Use standardized MD calls that every musician can respond to without thinking", "Apply the 2-bars-early rule to every navigation call", "Call the band back to click using the rhythmic 'and' system", "Execute clean song-to-song transitions using musical bridge chords"],
    sections: [
      { heading: "Why a shared vocabulary beats improvised calls", body: "Improvised calls in the moment require the band to decode what you mean before they respond. That cognitive gap — even half a second — is the difference between a tight transition and a train wreck.\n\nStandardized vocabulary becomes muscle memory. The band acts on the call before they consciously process it. The first time a musician hears 'Stand by — Chorus,' they think about it. The tenth time, their hands move before their mind registers the words.\n\nThe goal is a vocabulary so ingrained that the band functions like a single instrument under your direction — not a group of individuals trying to follow instructions." },
      { heading: "The 2-bars-early rule", body: "Every navigation call must happen 2 bars before the change — not at the change. 'Stand by — Chorus' with 2 bars remaining.\n\nThis gives the band time to physically and mentally prepare. Drummers need to set up fills. Keys players need to set up pad sounds. Guitarists need to shift their hand position. Vocalists need to find the phrase.\n\nA call at the moment of change is already too late. You're reacting instead of leading. The 2-bars-early rule makes you a navigator, not a passenger." },
      { heading: "Navigation calls", body: "These are the core of real-time MD communication. Every musician must know these without hesitation:\n\n• Stand by — [section]: Warning call, 2 bars before the change\n• Going back to the top: Loop to song intro or verse 1\n• Hold — sustain: Hold the current chord until released\n• Vamp / Loop it: Repeat current section indefinitely until called off\n• Tag it: Repeat the last phrase or ending once more\n• One more time: Repeat the current full section" },
      { heading: "Dynamic calls", body: "Dynamics are where great worship moments are built. These calls give you real-time control over the room's energy:\n\n• Full build: Everyone at full capacity — maximum energy\n• Strip back: Drop to minimal — vocals and 1–2 instruments only\n• Half-time: The groove drops to half feel (tempo stays, energy halves)\n• Pads only: Keys hold the room while everything else rests\n• Acoustic feel: Drop electric and electronic elements\n• Pockets only: Drums play minimal; bass and guitar lock to root notes" },
      { heading: "Ending calls", body: "A clean ending honors the moment. A messy one breaks it. Know your ending before you get there.\n\n• Fade it out: Let the final chord ring and gradually drop to silence — no hard cutoff\n• Cold stop: Everyone cuts off together on the same beat — clean and precise\n• Crash on the 1: Hit the final chord hard on beat 1 and let it ring\n\nPre-plan the ending with the WL before the service. Never leave it to chance." },
      { heading: "Drummer and instrument cues", body: "Some calls go directly to specific players. Say the instrument name clearly so the rest of the band knows it's not for everyone:\n\n• Big snap: Drummer hits one big snare + crash — punctuates a build or launches into a bigger section. A musical exclamation mark.\n• Take it to time: Drummer transitions from building into full groove — lock to click and land it\n• Kick on 1: Drummer plays kick on beat 1 only — re-anchors everyone to the grid\n• Bass drop out: Bassist pulls completely out of the mix — creates space that makes the re-entry land harder\n• Bring in bass: Bassist re-enters the mix" },
      { heading: "Re-syncing to click: the rhythmic 'and' system", body: "When the band drifts from click — especially after a spontaneous moment — call the count aloud: '1 and 2 and 3 and 4 and.'\n\nThe AND subdivisions lock the band back to the click grid faster than downbeats alone. When you call only '1 — 2 — 3 — 4,' musicians can drift between beats. The 'and' gives them the subdivision anchor they need.\n\nUse this any time the groove feels unsteady. Don't wait for a full train wreck — call it early, call it calm, and the band will lock in within two bars." },
      { heading: "Song-to-song transitions: the musical runway", body: "The space between songs is where worship flow lives or dies. The transition is not a break — it's part of the set.\n\nBridge chords connect keys between songs. Common examples:\n• G major to D major: hold on A major (the 5 of D) as a pivot chord\n• Bb major to C major: hold on G major as the 5 of C, then resolve\n• A major to E major: hold on B major as the transition pivot\n\nThe process: end Song 1 cleanly, MD calls the bridge chord, keys player sustains, MD counts in Song 2 on the click. Practice every song-to-song transition in rehearsal. Transitions that aren't rehearsed will break on Sunday." },
      { heading: "Theory calls", body: "When the moment calls for harmonic colour, the MD can call musical variations directly. These aren't complicated — you just need the right word at the right time:\n\n• Sus 2: Replace the 3rd with a 2nd — open, unresolved feel. Common on pads and builds\n• Sus 4: Replace the 3rd with a 4th — creates tension that wants to resolve. Great before a chorus\n• Add the 2 / Add 9: Layer the 2nd on top without removing the 3rd — fuller colour, no tension\n• Major 7: Add the major 7th to a chord — smooth, lush. Common on the 1 in slower worship moments\n• Go to the 2 minor: Call the ii chord — adds movement within the key. Common in bridge progressions\n\nCall these with the chord number: 'Sus 2 on the 1' or 'Major 7 on the 4' — the keys player leads, the band follows." },
      { heading: "Visual cues to standardize", body: "Verbal calls are primary, but visual cues are your backup — especially when talkback fails.\n\nStandardize these hand signals with your team in rehearsal:\n• Pointed finger up: going up a section (verse to chorus)\n• Palm down, pushing: strip back, reduce dynamics\n• Closed fist: full stop / button it\n• Circular hand motion: vamp / loop — keep repeating\n• Thumb across throat: kill the track or end\n• Hand on head: going back to the top" },
    ],
    practicePrompt: "Open the Vocabulary Reference in the app and read through every call category. Then open Live Mode and run a full service — calling every transition out loud using the standardized vocabulary. No improvised calls. Every section change gets a 'Stand by' call 2 bars early.",
  },
  {
    id: "rehearsal", icon: "rehearsal", title: "Rehearsal & Preparation",
    tagline: "Structure your week and your rehearsal so Sunday runs without surprises.",
    outcomes: ["Conduct a 90-minute rehearsal using the Crash Through → Targeted Fixes → Full Worship Run structure", "Complete the weekly WL planning conversation covering Energy Map, Exit Strategy, and Extended Worship Moments", "Use the weekly prep checklist so nothing is unknown on Sunday morning", "Execute the Production Point-to-Point Huddle on Sunday morning"],
    sections: [
      { heading: "The fundamental principle", body: "Rehearsal is for rehearsing the flow — not for learning parts.\n\nParts are learned at home during the week. When a musician arrives at rehearsal not knowing their parts, they are using the band's time to do individual work. That's unfair to the rest of the team and it guarantees a shallow rehearsal.\n\nThe MD's job in rehearsal is to make Sunday feel familiar before it arrives — not to teach people their instrument." },
      { heading: "The weekly planning conversation", body: "Before rehearsal, the MD and WL have a dedicated 15–20 minute conversation to align on three key areas:\n\n• Energy Map: How does the set flow emotionally? Where are the lifts? Where do we strip back?\n• Exit Strategy: How does each song end? What's the transition into the next?\n• Extended Worship Moments: Where might the WL extend spontaneously? What sections have flex?\n\nThis conversation also covers any team flags, personnel changes, and any special elements for that week. Never walk into rehearsal without it." },
      { heading: "The 90-minute rehearsal blueprint", body: "Structure your rehearsal time with discipline. Every block has a purpose:\n\n1. Devotional (WL-led, pre-rehearsal): Sets spiritual posture for the room\n2. Sound Check (10 min): Line checks, IEM mixes confirmed, talkback tested\n3. The Crash Through (30 min): Run the full set without stopping\n4. Targeted Fixes & Transitions (25 min): Address only train-wreck moments and song-to-song transitions\n5. Full Worship Run (25 min): Zero stopping — treat it exactly like Sunday" },
      { heading: "The Crash Through — why it matters", body: "The Crash Through is the most important and most misunderstood part of rehearsal.\n\nMD rule: do not stop for a wrong note. Only stop if the train is completely off the tracks. Let musicians self-correct. Take notes on the train-wreck moments — those are what you fix later.\n\nThe point is not to run through the songs perfectly. The point is to build the muscle of recovery and flow. The band learns to keep going when something breaks — which is the actual skill they need on Sunday." },
      { heading: "Targeted Fixes & Transitions", body: "After the Crash Through, you have 25 minutes. Use them surgically.\n\nIdentify the 2–3 moments that genuinely derailed the flow. Not missed notes — train wrecks. Address those specifically: 'The bridge transition was messy, let's run from bar 28.'\n\nCritically: this is where you rehearse song-to-song transitions. The gap between songs is not rehearsed during the Crash Through — that's what this block is for. Every transition that isn't explicitly practiced will be shaky on Sunday." },
      { heading: "The Full Worship Run", body: "The final 25 minutes: zero stopping. Treat it exactly like Sunday morning.\n\nFull spiritual engagement from everyone — not just a technical run-through. The WL leads from the front. The MD makes all cue calls as they will happen live.\n\nThis block locks in the emotional and spiritual context of the set, not just the technical execution. It's the difference between a band that knows the songs and a band that knows how to lead worship." },
      { heading: "The weekly prep checklist", body: "The MD's preparation begins mid-week, not on Sunday morning. Before service, confirm each item:\n\n• WL planning conversation completed — Energy Map, Exit Strategy, Extended Worship Moments\n• Setlist built in Playback with correct arrangements\n• All tracks tested, loops confirmed, saved to cloud\n• MD notes added to PCO for every song\n• Song-to-song transitions planned and communicated\n• Any new or unfamiliar songs reviewed personally\n• Talkback mic and IEM mix confirmed with sound tech\n• Personal preparation complete — spiritually and musically" },
      { heading: "The Production Point-to-Point Huddle", body: "Sunday morning, before soundcheck: the MD facilitates a brief coordination meeting with the entire production team — not just the band.\n\nThis includes: MD, WL, sound tech, production, media/slides, and any other Sunday roles. Everyone aligns on the full service order, transitions, any special elements, and communication protocols.\n\nWithout this meeting, you get gaps, overlapping cues, and avoidable confusion. With it, Sunday runs like a system." },
      { heading: "The 10-minute huddle and post-service debrief", body: "Immediately before the service — after full soundcheck — the MD and WL align one final time. Confirm the set order, flag any last-minute changes, realign on spontaneous possibilities.\n\nAfter service: 2–5 minutes, MD and WL only. What worked? What broke? What changes for second service? Keep it fast and surgical. Three specific observations maximum.\n\nSeparately, after the final service: gather the whole team briefly. Celebrate what went well. Flag anything that needs addressing next week." },
    ],
    practicePrompt: "Open the Service Builder and build a complete service. Before you launch Live Mode, write out your Energy Map — how does the energy move across the set? Where are the lifts and strips? Then run Live Mode calling every transition as you would in a real rehearsal Crash Through. Don't stop. Keep going.",
  },
];

const JOURNEY_STEPS = [
  { step: 1, phase: "Observe", desc: "Understand the MD role before you ever hold the mic. Shadow a full service and absorb the system.", weekIdx: 0, moduleId: "role", moduleLabel: "The Role of the MD", action: { label: "Start Module", target: "training" }, color: "#4A90D9" },
  { step: 2, phase: "Practice", desc: "Learn the standardized cue language. Practice calling transitions privately in your IEM before going live.", weekIdx: 1, moduleId: "cues", moduleLabel: "Cue Language & Communication", action: { label: "Start Module", target: "training" }, color: "#7B68C8" },
  { step: 3, phase: "Assist", desc: "Apply rehearsal structure and preparation systems. Call your first live songs with a backup MD present.", weekIdx: 2, moduleId: "rehearsal", moduleLabel: "Rehearsal & Preparation", action: { label: "Start Module", target: "training" }, color: "#2E9E6A" },
  { step: 4, phase: "Lead (Partial)", desc: "Lead the first half of a real set independently. Run real Sunday scenarios in a safe environment before they happen live.", weekIdx: 3, moduleId: null, moduleLabel: null, action: { label: "Practice Scenarios", target: "coaching" }, color: COLORS.accent },
  { step: 5, phase: "Lead (Full)", desc: "Lead a complete Sunday service. The MD stands by but does not call. You are ready.", weekIdx: 4, moduleId: null, moduleLabel: null, action: { label: "Run Live Mode", target: "live" }, color: "#C0394A" },
];

// ─── ROLE SELECTOR ────────────────────────────────────────────────────────────

const ROLES = [
  { id: "new-md",   label: "New MD",          desc: "I'm learning the Music Director role",          icon: "training",  route: "starthere" },
  { id: "exp-md",   label: "Experienced MD",  desc: "I'm an MD looking to sharpen my system",        icon: "manual",    route: "dashboard" },
  { id: "wl",       label: "Worship Leader",  desc: "I lead worship and want to understand the MD",  icon: "coaching",  route: "manual" },
  { id: "musician", label: "Musician",        desc: "I'm on the worship team and want to grow",      icon: "vocab",     route: "vocab" },
];

const RoleSelector = ({ onSelect }) => {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: `linear-gradient(135deg, #050A12 0%, #0A1220 45%, #0E1A2B 100%)`,
      display: "flex", flexDirection: "column",
      overflow: "auto",
    }}>

      <div style={{
        position: "absolute", top: -120, left: -80,
        width: 520, height: 360,
        background: `radial-gradient(ellipse, rgba(62,127,199,0.22) 0%, rgba(120,183,255,0.07) 45%, transparent 70%)`,
        pointerEvents: "none", animation: "slowDrift 18s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: -80, right: -60,
        width: 440, height: 300,
        background: `radial-gradient(ellipse, rgba(26,89,145,0.18) 0%, transparent 65%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: NOISE_SVG,
        opacity: 0.4, pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", zIndex: 2,
        flex: 1, display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        alignItems: "center", justifyItems: "center",
        padding: "48px 24px",
      }}>
        <div style={{
          width: "100%", maxWidth: 960,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 40,
        }}
        className="role-selector-grid">

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 13,
                background: `linear-gradient(135deg, rgba(62,127,199,0.25) 0%, rgba(120,183,255,0.10) 100%)`,
                border: `1px solid rgba(62,127,199,0.40)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 16px rgba(62,127,199,0.20), inset 0 1px 0 rgba(255,255,255,0.08)`,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L19 20L12 16L5 20L12 3Z" fill="#C49A3C" fillOpacity="0.9"/>
                  <path d="M12 3L19 20L12 16L5 20L12 3Z" stroke="#C49A3C" strokeWidth="0.8" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500,
                  color: "#F0EBE1", lineHeight: 1, letterSpacing: "-0.3px",
                }}>WorshipPilot</div>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 2,
                  textTransform: "uppercase", color: "rgba(120,183,255,0.75)",
                  marginTop: 3,
                }}>MD System · Built for Sunday</div>
              </div>
            </div>

            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 46px)", fontWeight: 400,
              color: "#F0EBE1", lineHeight: 1.05,
              letterSpacing: "-1.2px", marginBottom: 20,
              fontStyle: "italic",
            }}>
              Lead the band.<br />
              <span style={{ color: "#C49A3C", fontStyle: "normal" }}>Free the room.</span>
            </div>

            <div style={{
              fontSize: 15, color: "rgba(240,235,225,0.62)",
              lineHeight: 1.65, maxWidth: 420, marginBottom: 32,
            }}>
              A training and execution system for worship Music Directors.
              Playback handles the audio. WorshipPilot handles the leadership —
              so the band can be confident, and the congregation can encounter Jesus.
            </div>

            <div style={{
              display: "flex", gap: 24, flexWrap: "wrap",
              paddingTop: 24, borderTop: "1px solid rgba(240,235,225,0.08)",
            }}>
              {[
                { n: "10", label: "Manual parts" },
                { n: "45+", label: "Standard calls" },
                { n: "5-wk", label: "Onboarding path" },
              ].map(({ n, label }) => (
                <div key={label}>
                  <div style={{
                    fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500,
                    color: "#C49A3C", letterSpacing: "-0.5px", lineHeight: 1,
                  }}>{n}</div>
                  <div style={{
                    fontSize: 10, color: "rgba(240,235,225,0.45)",
                    letterSpacing: 1.5, textTransform: "uppercase",
                    marginTop: 4, fontWeight: 600,
                  }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: "rgba(11, 18, 32, 0.65)",
            backdropFilter: "blur(24px) saturate(1.3)",
            WebkitBackdropFilter: "blur(24px) saturate(1.3)",
            border: "1px solid rgba(240,235,225,0.10)",
            borderRadius: 20,
            padding: "28px 24px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#C49A3C", marginBottom: 8 }}>
              Get started
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "#F0EBE1", lineHeight: 1.2, letterSpacing: "-0.4px", marginBottom: 6 }}>
              What brings you here?
            </div>
            <div style={{ fontSize: 13, color: "rgba(240,235,225,0.55)", lineHeight: 1.55, marginBottom: 22 }}>
              Pick the closest fit. We'll point you to the right starting place — you can always explore the rest later.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {ROLES.map(role => {
                const isSelected = selected === role.id;
                const isHovered = hovered === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelected(role.id)}
                    onMouseEnter={() => setHovered(role.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "13px 14px",
                      background: isSelected
                        ? "linear-gradient(135deg, rgba(62,127,199,0.22) 0%, rgba(120,183,255,0.08) 100%)"
                        : isHovered ? "rgba(240,235,225,0.04)" : "transparent",
                      border: `1.5px solid ${isSelected ? "#C49A3C" : isHovered ? "rgba(240,235,225,0.15)" : "rgba(240,235,225,0.08)"}`,
                      borderRadius: 12, cursor: "pointer", textAlign: "left",
                      fontFamily: "var(--font-body)",
                      transition: "all 0.18s cubic-bezier(0.2, 0.6, 0.2, 1)",
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: isSelected ? "linear-gradient(135deg, #8A6418 0%, #C49A3C 100%)" : "rgba(240,235,225,0.06)",
                      border: `1px solid ${isSelected ? "rgba(120,183,255,0.5)" : "rgba(240,235,225,0.10)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: isSelected ? "0 4px 14px rgba(62,127,199,0.3)" : "none",
                      transition: "all 0.18s",
                    }}>
                      <Icon name={role.icon} size={17} color={isSelected ? "#fff" : "rgba(240,235,225,0.65)"} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: isSelected ? "#F0EBE1" : "rgba(240,235,225,0.88)", marginBottom: 1, letterSpacing: "-0.1px" }}>
                        {role.label}
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.35, color: isSelected ? "rgba(240,235,225,0.7)" : "rgba(240,235,225,0.45)" }}>
                        {role.desc}
                      </div>
                    </div>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      border: `1.5px solid ${isSelected ? "#C49A3C" : "rgba(240,235,225,0.18)"}`,
                      background: isSelected ? "#C49A3C" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.18s",
                    }}>
                      {isSelected && <span style={{ fontSize: 10, color: "#0A1220", fontWeight: 900 }}>✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => { if (selected) onSelect(selected); }}
              disabled={!selected}
              style={{
                width: "100%", padding: "14px",
                borderRadius: 11, border: "none",
                background: selected ? "linear-gradient(135deg, #8A6418 0%, #C49A3C 100%)" : "rgba(240,235,225,0.06)",
                color: selected ? "#fff" : "rgba(240,235,225,0.35)",
                fontSize: 14, fontWeight: 700,
                cursor: selected ? "pointer" : "not-allowed",
                fontFamily: "var(--font-body)", letterSpacing: 0.2,
                transition: "all 0.2s",
                boxShadow: selected ? "0 4px 16px rgba(62,127,199,0.35)" : "none",
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => { if (selected) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(62,127,199,0.45)"; }}}
              onMouseLeave={e => { if (selected) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(62,127,199,0.35)"; }}}
            >
              {selected ? "Enter the system →" : "Select a role to continue"}
            </button>

            <div style={{
              marginTop: 18, paddingTop: 18,
              borderTop: "1px solid rgba(240,235,225,0.06)",
              fontSize: 11, color: "rgba(240,235,225,0.35)",
              textAlign: "center", lineHeight: 1.5, fontStyle: "italic",
            }}>
              "Sing to Him a new song. Play skillfully with a shout of joy." — Psalm 33:3
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 860px) {
          .role-selector-grid {
            grid-template-columns: 1.1fr 1fr !important;
            gap: 64px !important;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

// ─── MODULE QUIZ DATA ─────────────────────────────────────────────────────────

const MODULE_QUIZZES = {
  role: [
    { q: "What is the MD's primary role on Sunday?", options: ["Lead the congregation in worship", "Navigate the band through the set with clear cues", "Manage the sound board levels", "Choose the songs for the service"], correct: 1 },
    { q: "What does 'Confidence Over Perfection' mean for an MD?", options: ["Play perfectly or don't play at all", "A confident wrong cue is better than a hesitant right one", "Confidence only matters for the Worship Leader", "Perfect practice makes perfect performance"], correct: 1 },
    { q: "Why does the WL need to publicly hand the keys to the MD?", options: ["It's a legal requirement for church teams", "So the team knows who to follow musically", "To transfer pay grade responsibilities", "So the MD can change the setlist"], correct: 1 },
  ],
  cues: [
    { q: "When should navigation calls happen relative to the section change?", options: ["Exactly at the change", "1 bar after the change", "At least 2 bars before the change", "Half a bar before the change"], correct: 2 },
    { q: "What does 'Pads Only' signal to the band?", options: ["Everyone plays at full volume", "Only the drummer plays", "Keys hold the room — everything else rests", "Guitars stop, everyone else continues"], correct: 2 },
    { q: "What is the purpose of the 'and' subdivision when re-syncing to click?", options: ["To slow the tempo down", "To give musicians the subdivision anchor for faster clock-locking", "To signal the drummer to stop", "It's used only in slow songs"], correct: 1 },
  ],
  rehearsal: [
    { q: "What is the MD rule during the Crash Through?", options: ["Stop at every mistake and fix it", "Only stop if the train is completely off the tracks", "Run each song separately before playing the full set", "Never play the full set in rehearsal"], correct: 1 },
    { q: "What are the three key areas covered in the weekly WL/MD planning conversation?", options: ["Keys, tempos, and volume levels", "Energy Map, Exit Strategy, and Extended Worship Moments", "Song order, lighting cues, and offering timing", "Volunteer schedules, track licensing, and set length"], correct: 1 },
    { q: "What is the Production Point-to-Point Huddle?", options: ["A jam session before soundcheck", "A full-team alignment meeting covering the service order and logistics", "The post-service debrief with WL only", "A private meeting between MD and sound tech"], correct: 1 },
  ],
};

const ModuleQuiz = ({ moduleId, onComplete, onSkip }) => {
  const questions = MODULE_QUIZZES[moduleId] || [];
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[qIdx];
  const isCorrect = selected === q?.correct;

  const handleAnswer = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (qIdx < questions.length - 1) {
      setQIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setDone(true);
    }
  };

  if (done) {
    const allCorrect = score === questions.length;
    return (
      <div className="fade-in" style={{ padding: "28px 24px", background: COLORS.card, borderRadius: 18, border: `1px solid ${COLORS.border}`, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>{allCorrect ? "🎯" : "👍"}</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: COLORS.navy, marginBottom: 8 }}>
          {allCorrect ? "Sharp." : "Good work."}
        </div>
        <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
          {score} of {questions.length} correct.{" "}
          {score === questions.length ? "You've got this module." : "Re-read any sections that felt uncertain — it'll click on the second pass."}
        </div>
        <button onClick={onComplete} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
          Mark module complete →
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: "24px", background: COLORS.card, borderRadius: 18, border: `1px solid ${COLORS.border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.textDim }}>Quick Check — {qIdx + 1} of {questions.length}</div>
        <button onClick={onSkip} style={{ fontSize: 11, color: COLORS.textDim, background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Skip →</button>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: COLORS.navy, marginBottom: 20, lineHeight: 1.4 }}>{q.question || q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {q.options.map((opt, i) => {
          let bg = COLORS.surfaceAlt;
          let border = COLORS.border;
          let color = COLORS.text;
          if (answered) {
            if (i === q.correct) { bg = COLORS.greenLight; border = COLORS.green; color = COLORS.green; }
            else if (i === selected) { bg = COLORS.redLight; border = COLORS.red; color = COLORS.red; }
          } else if (selected === i) { bg = COLORS.accentLight; border = COLORS.accent; }
          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: bg, border: `1.5px solid ${border}`, borderRadius: 10, cursor: answered ? "default" : "pointer", textAlign: "left", fontFamily: "'Inter', sans-serif", transition: "all 0.15s" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${border}`, background: answered && i === q.correct ? COLORS.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {answered && i === q.correct && <span style={{ fontSize: 11, color: "#fff", fontWeight: 800 }}>✓</span>}
                {answered && i === selected && i !== q.correct && <span style={{ fontSize: 11, color: COLORS.red, fontWeight: 800 }}>✕</span>}
              </div>
              <span style={{ fontSize: 13, color, lineHeight: 1.4 }}>{opt}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <button onClick={handleNext} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          {qIdx < questions.length - 1 ? "Next question →" : "See results →"}
        </button>
      )}
    </div>
  );
};

// ─── FIRST-TIME HINTS ─────────────────────────────────────────────────────────

const useHint = (key) => {
  const [visible, setVisible] = useState(() => {
    try { return !localStorage.getItem(`wp-hint-${key}`); } catch { return true; }
  });
  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(`wp-hint-${key}`, "1"); } catch {};
  };
  return [visible, dismiss];
};

const Hint = ({ hintKey, text }) => {
  const [visible, dismiss] = useHint(hintKey);
  if (!visible) return null;
  return (
    <div className="fade-in" style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "rgba(196,154,60,0.15)", border: `1px solid rgba(196,154,60,0.35)`, borderRadius: 12, marginBottom: 16 }}>
      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>💡</span>
      <span style={{ fontSize: 13, color: COLORS.navy, lineHeight: 1.5, flex: 1 }}>{text}</span>
      <button onClick={dismiss} style={{ background: "none", border: "none", color: COLORS.textDim, cursor: "pointer", fontSize: 14, flexShrink: 0, padding: 0, lineHeight: 1 }}>✕</button>
    </div>
  );
};



// Renders accordion answer text with structure:
// - Numbered lines (e.g. "1. foo") → bold number + text as block
// - Bullet lines (e.g. "- foo") → indented bullet item
// - Lines ending in ":" that are short → treated as bold section header
// - Blank lines → spacing
// - Everything else → normal paragraph text
const renderAnswerText = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      elements.push(<div key={i} style={{ height: 8 }} />);
    } else if (/^\d+\.\s/.test(line)) {
      // Numbered item — bold the number
      const num = line.match(/^(\d+)\.\s/)[1];
      const rest = line.replace(/^\d+\.\s/, "");
      elements.push(
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7, alignItems: "flex-start" }}>
          <span style={{ fontWeight: 700, color: COLORS.accent, fontSize: 13, minWidth: 18, flexShrink: 0, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.78 }}>{num}.</span>
          <span style={{ fontSize: 13.5, color: COLORS.text, lineHeight: 1.78, fontWeight: 500 }}>{rest}</span>
        </div>
      );
    } else if (/^[-•]\s/.test(line)) {
      // Bullet item
      const rest = line.replace(/^[-•]\s/, "");
      elements.push(
        <div key={i} style={{ display: "flex", gap: 9, marginBottom: 5, alignItems: "flex-start", paddingLeft: 4 }}>
          <span style={{ color: COLORS.accent, fontSize: 11, flexShrink: 0, marginTop: 3, lineHeight: 1 }}>·</span>
          <span style={{ fontSize: 13.5, color: "#4A5568", lineHeight: 1.7, fontWeight: 500 }}>{rest}</span>
        </div>
      );
    } else if (line.endsWith(":") && line.length < 60 && !line.startsWith("e.g")) {
      // Short line ending in colon = section header
      elements.push(
        <div key={i} style={{ fontWeight: 700, color: COLORS.navy, fontSize: 13, marginTop: 14, marginBottom: 6, fontFamily: "var(--font-display)" }}>{line}</div>
      );
    } else {
      // Normal paragraph text
      elements.push(
        <p key={i} style={{ fontSize: 13.5, color: "#4A5568", lineHeight: 1.78, marginBottom: 8, fontWeight: 500 }}>{line}</p>
      );
    }
    i++;
  }
  return <div>{elements}</div>;
};

const Accordion = ({ items }) => {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="accordion-item">
          <button className="accordion-trigger" onClick={() => setOpen(open === i ? null : i)}>
            <span>{item.q}</span>
            <span className={`accordion-chevron ${open === i ? "open" : ""}`}>▾</span>
          </button>
          {open === i && (
            <div className="accordion-content fade-in">
              {renderAnswerText(item.a)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── SCRIPTURE VERSES ────────────────────────────────────────────────────────

const VERSES = {
  dashboard:   { text: "Sing to Him a new song. Play skillfully with a shout of joy.", ref: "Psalm 33:3" },
  training:    { text: "Be strong and courageous. Do not be afraid; do not be discouraged.", ref: "Joshua 1:9" },
  live:        { text: "Whatever you do, work at it with all your heart, as working for the Lord.", ref: "Colossians 3:23" },
  onboarding:  { text: "Whoever wants to become great among you must be your servant.", ref: "Mark 10:43" },
  builder:     { text: "Let the word of Christ dwell in you richly — teaching and admonishing one another with psalms, hymns, and songs.", ref: "Colossians 3:16" },
  manual:      { text: "Do you see someone skilled in their work? They will serve before kings.", ref: "Proverbs 22:29" },
  vocab:       { text: "Let everything be done decently and in order.", ref: "1 Corinthians 14:40" },
  coaching:    { text: "As iron sharpens iron, so one person sharpens another.", ref: "Proverbs 27:17" },
  complete:    { text: "For God has not given us a spirit of fear, but of power, love, and a sound mind.", ref: "2 Timothy 1:7" },
};

const ScriptureVerse = ({ page }) => {
  const verse = VERSES[page];
  if (!verse) return null;
  return (
    <div style={{ textAlign: "center", padding: "28px 24px 8px", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ fontSize: 13, fontStyle: "italic", color: COLORS.textDim, lineHeight: 1.7, marginBottom: 6 }}>
        "{verse.text}"
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.accent, letterSpacing: 0.5, opacity: 0.8 }}>
        — {verse.ref}
      </div>
    </div>
  );
};

// ─── ILLUSTRATIONS (SVG line-art, low opacity) ───────────────────────────────

const IllustrationMic = () => (
  <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", paddingRight: 8, marginBottom: -160, pointerEvents: "none", userSelect: "none", opacity: 0.07 }}>
    <svg viewBox="0 0 200 340" xmlns="http://www.w3.org/2000/svg" width="160" height="272">
      {/* Mic capsule */}
      <rect x="65" y="10" width="70" height="110" rx="35" fill="none" stroke="#C07A0C" strokeWidth="5"/>
      {/* Mic grille lines */}
      <line x1="65" y1="38" x2="135" y2="38" stroke="#C07A0C" strokeWidth="2.5"/>
      <line x1="65" y1="55" x2="135" y2="55" stroke="#C07A0C" strokeWidth="2.5"/>
      <line x1="65" y1="72" x2="135" y2="72" stroke="#C07A0C" strokeWidth="2.5"/>
      <line x1="67" y1="89" x2="133" y2="89" stroke="#C07A0C" strokeWidth="2.5"/>
      <line x1="73" y1="104" x2="127" y2="104" stroke="#C07A0C" strokeWidth="2.5"/>
      {/* Mic body */}
      <rect x="88" y="120" width="24" height="60" rx="4" fill="none" stroke="#C07A0C" strokeWidth="4"/>
      {/* Stand pole */}
      <line x1="100" y1="180" x2="100" y2="270" stroke="#C07A0C" strokeWidth="5"/>
      {/* Stand base tripod */}
      <ellipse cx="100" cy="275" rx="55" ry="12" fill="none" stroke="#C07A0C" strokeWidth="4"/>
      <line x1="45" y1="275" x2="22" y2="310" stroke="#C07A0C" strokeWidth="4"/>
      <line x1="155" y1="275" x2="178" y2="310" stroke="#C07A0C" strokeWidth="4"/>
      <line x1="100" y1="275" x2="100" y2="320" stroke="#C07A0C" strokeWidth="4"/>
      {/* Sound waves right */}
      <path d="M148 42 Q165 65 148 88" fill="none" stroke="#C07A0C" strokeWidth="3.5"/>
      <path d="M158 30 Q182 65 158 100" fill="none" stroke="#C07A0C" strokeWidth="2.5"/>
      {/* Sound waves left */}
      <path d="M52 42 Q35 65 52 88" fill="none" stroke="#C07A0C" strokeWidth="3.5"/>
      <path d="M42 30 Q18 65 42 100" fill="none" stroke="#C07A0C" strokeWidth="2.5"/>
    </svg>
  </div>
);

const IllustrationStageLight = () => (
  <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: -8, pointerEvents: "none", userSelect: "none", opacity: 0.06, overflow: "hidden" }}>
    <svg viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg" width="100%" style={{ maxWidth: 540 }}>
      {/* Rigging bar */}
      <line x1="20" y1="12" x2="480" y2="12" stroke="#C07A0C" strokeWidth="7"/>
      <line x1="20" y1="4" x2="20" y2="20" stroke="#C07A0C" strokeWidth="5"/>
      <line x1="480" y1="4" x2="480" y2="20" stroke="#C07A0C" strokeWidth="5"/>
      {/* Light fixture circles */}
      <circle cx="150" cy="12" r="14" fill="none" stroke="#C07A0C" strokeWidth="5"/>
      <circle cx="250" cy="12" r="14" fill="none" stroke="#C07A0C" strokeWidth="5"/>
      <circle cx="350" cy="12" r="14" fill="none" stroke="#C07A0C" strokeWidth="5"/>
      {/* Light beams */}
      <polygon points="150,26 90,155 210,155" fill="#C07A0C" opacity="0.6"/>
      <polygon points="250,26 170,155 330,155" fill="#C07A0C" opacity="0.7"/>
      <polygon points="350,26 290,155 410,155" fill="#C07A0C" opacity="0.6"/>
    </svg>
  </div>
);

const IllustrationMusicStaff = () => (
  <div style={{ width: "100%", marginTop: 16, pointerEvents: "none", userSelect: "none", opacity: 0.06, overflow: "hidden" }}>
    <svg viewBox="0 0 500 120" xmlns="http://www.w3.org/2000/svg" width="100%">
      {/* Staff lines */}
      <line x1="0" y1="20" x2="500" y2="20" stroke="#080F1A" strokeWidth="2"/>
      <line x1="0" y1="38" x2="500" y2="38" stroke="#080F1A" strokeWidth="2"/>
      <line x1="0" y1="56" x2="500" y2="56" stroke="#080F1A" strokeWidth="2"/>
      <line x1="0" y1="74" x2="500" y2="74" stroke="#080F1A" strokeWidth="2"/>
      <line x1="0" y1="92" x2="500" y2="92" stroke="#080F1A" strokeWidth="2"/>
      {/* Notes */}
      <ellipse cx="120" cy="56" rx="10" ry="8" fill="#080F1A"/>
      <line x1="130" y1="56" x2="130" y2="16" stroke="#080F1A" strokeWidth="3"/>
      <ellipse cx="190" cy="38" rx="10" ry="8" fill="#080F1A"/>
      <line x1="200" y1="38" x2="200" y2="0" stroke="#080F1A" strokeWidth="3"/>
      <ellipse cx="270" cy="74" rx="10" ry="8" fill="#080F1A"/>
      <line x1="280" y1="74" x2="280" y2="34" stroke="#080F1A" strokeWidth="3"/>
      <ellipse cx="350" cy="56" rx="10" ry="8" fill="#080F1A"/>
      <line x1="360" y1="56" x2="360" y2="16" stroke="#080F1A" strokeWidth="3"/>
      <ellipse cx="420" cy="38" rx="10" ry="8" fill="#080F1A"/>
      <line x1="430" y1="38" x2="430" y2="0" stroke="#080F1A" strokeWidth="3"/>
      {/* Beam */}
      <line x1="360" y1="16" x2="430" y2="0" stroke="#080F1A" strokeWidth="5"/>
    </svg>
  </div>
);

const IllustrationHeadphones = () => (
  <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", marginBottom: -120, pointerEvents: "none", userSelect: "none", opacity: 0.07 }}>
    <svg viewBox="0 0 200 170" xmlns="http://www.w3.org/2000/svg" width="140" height="119">
      <path d="M30 100 Q30 30 100 30 Q170 30 170 100" fill="none" stroke="#080F1A" strokeWidth="8" strokeLinecap="round"/>
      <rect x="12" y="90" width="36" height="55" rx="14" fill="none" stroke="#080F1A" strokeWidth="6"/>
      <rect x="152" y="90" width="36" height="55" rx="14" fill="none" stroke="#080F1A" strokeWidth="6"/>
    </svg>
  </div>
);

// ─── START HERE ──────────────────────────────────────────────────────────────

const StartHerePage = ({ setPage }) => {
  const steps = [
    { num: "1", label: "Learn the role", page: "training", desc: "Understand what an MD does and why it matters" },
    { num: "2", label: "Learn the language", page: "vocab", desc: "Master the standardized calls your band responds to" },
    { num: "3", label: "Study MD situations", page: "coaching", desc: "Run through real MD situations and correct responses" },
    { num: "4", label: "Run Live Mode", page: "live", desc: "Execute a real service with the cue engine" },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-eyebrow">WorshipPilot</div>
        <div className="page-title">Start Here</div>
        <div className="page-sub">New to the MD role? This is your entry point.</div>
      </div>

      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 10 }}>What is this app?</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: COLORS.navy, lineHeight: 1.3, marginBottom: 10 }}>A training and execution system for Worship Music Directors.</div>
        <div style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.7 }}>This app trains and equips Music Directors to confidently lead a worship team — both in rehearsal and live on Sunday. It combines structured training modules with a real-time cue engine so you can learn the role and then execute it with clarity.</div>
      </div>

      <div className="section-label">Your path forward</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {steps.map((step, i) => (
          <button key={i} onClick={() => setPage(step.page)}
            style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "'Inter', sans-serif", boxShadow: COLORS.shadow, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(196,154,60,0.15)", border: `1.5px solid rgba(196,154,60,0.35)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: COLORS.accent, flexShrink: 0 }}>{step.num}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy, marginBottom: 2 }}>{step.label}</div>
              <div style={{ fontSize: 12, color: "#4A5568", fontWeight: 500 }}>{step.desc}</div>
            </div>
            <span style={{ color: COLORS.textDim, fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>

      <div className="section-label">Begin MD Training</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {MD_MODULES.map((mod, i) => (
          <button key={mod.id} onClick={() => setPage("training")}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, boxShadow: COLORS.shadow, cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "'Inter', sans-serif", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(196,154,60,0.15)", border: `1px solid rgba(196,154,60,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={mod.icon} size={18} color={COLORS.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: COLORS.navy, marginBottom: 2 }}>Module {i + 1} — {mod.title}</div>
              <div style={{ fontSize: 12, color: COLORS.textDim }}>{mod.tagline}</div>
            </div>
            <span style={{ color: COLORS.accent, fontSize: 16, flexShrink: 0 }}>›</span>
          </button>
        ))}
      </div>

      <div className="section-label">After training</div>
      <div className="two-col">
        {[
          { icon: "coaching", label: "MD Situations", desc: "Run through real scenarios and responses", page: "coaching" },
          { icon: "live",     label: "Live Mode",          desc: "Execute a real service with the timed cue engine", page: "live" },
        ].map((item, i) => (
          <button key={i} onClick={() => setPage(item.page)}
            style={{ padding: "18px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, cursor: "pointer", textAlign: "left", fontFamily: "'Inter', sans-serif", boxShadow: COLORS.shadow, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(196,154,60,0.15)", border: `1px solid rgba(196,154,60,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Icon name={item.icon} size={19} color={COLORS.accent} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: "#4A5568", lineHeight: 1.4, fontWeight: 500 }}>{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── TRAINING JOURNEY ─────────────────────────────────────────────────────────

// ─── UNIFIED TRAINING PAGE ────────────────────────────────────────────────────
// Merges Training Journey (5-step path) + MD Training System (3 modules)
// into one clear, linear experience. No redundancy.

const TrainingPage = ({ setPage, moduleProgress, onCompleteModule }) => {
  const [view, setView] = useState("journey"); // "journey" | module id
  const completedCount = MD_MODULES.filter(m => moduleProgress[m.id]).length;
  const activeModule = MD_MODULES.find(m => m.id === view);

  // ── MODULE DETAIL VIEW ──
  if (activeModule) {
    return (
      <div className="fade-in">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button className="btn btn-ghost" onClick={() => setView("journey")} style={{ padding: "7px 14px" }}>← Training</button>
          {moduleProgress[activeModule.id] && <span className="badge badge-green">✓ Complete</span>}
        </div>

        <div className="page-header">
          <div className="page-eyebrow">MD Training — Module {MD_MODULES.findIndex(m => m.id === view) + 1} of {MD_MODULES.length}</div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(196,154,60,0.15)", border: `1px solid rgba(196,154,60,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, marginTop: 6 }}>
            <Icon name={activeModule.icon} size={24} color={COLORS.accent} />
          </div>
          <div className="page-title">{activeModule.title}</div>
          <div className="page-sub">{activeModule.tagline}</div>
        </div>

        {/* Outcomes */}
        <div style={{ background: "rgba(196,154,60,0.1)", border: `1px solid rgba(196,154,60,0.25)`, borderRadius: 14, padding: "18px 22px", marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 10 }}>After this module you'll be able to:</div>
          {activeModule.outcomes.map((o, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7, fontSize: 13.5, color: COLORS.navy, lineHeight: 1.5 }}>
              <span style={{ color: COLORS.accent, flexShrink: 0 }}>→</span>
              <span>{o}</span>
            </div>
          ))}
        </div>

        {/* Content sections */}
        {activeModule.sections.map((sec, i) => (
          <div key={i} className="card" style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: COLORS.navy, marginBottom: 12 }}>{sec.heading}</div>
            {sec.body.split("\n\n").map((para, j) => (
              <p key={j} style={{ fontSize: 14, color: "#4A5568", lineHeight: 1.75, marginBottom: 10, fontWeight: 500 }}>
                {para.startsWith("•") ? (
                  <span style={{ display: "block" }}>
                    {para.split("\n").map((line, k) => {
                      if (!line.startsWith("•")) return <span key={k}>{line}</span>;
                      const content = line.slice(2); // remove "• "
                      // Bold the term before the first colon
                      const colonIdx = content.indexOf(":");
                      const hasTerm = colonIdx > 0 && colonIdx < 60;
                      return (
                        <span key={k} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <span style={{ color: COLORS.accent, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>·</span>
                          <span>
                            {hasTerm ? (
                              <><strong style={{ color: COLORS.navy, fontWeight: 700 }}>{content.slice(0, colonIdx)}</strong><span style={{ color: COLORS.textMuted }}>{content.slice(colonIdx)}</span></>
                            ) : content}
                          </span>
                        </span>
                      );
                    })}
                  </span>
                ) : para}
              </p>
            ))}
          </div>
        ))}

        {/* Practice CTA */}
        <div className="card" style={{ marginBottom: 16, background: COLORS.surfaceAlt }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 8 }}>Put it into practice</div>
          <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.65, marginBottom: 16 }}>{activeModule.practicePrompt}</div>
          <button onClick={() => setPage("live")} className="btn btn-secondary">▶ Practice in Live Mode</button>
        </div>

        {!moduleProgress[activeModule.id] ? (
          <ModuleQuiz
            moduleId={activeModule.id}
            onComplete={() => { onCompleteModule(activeModule.id); setView("journey"); }}
            onSkip={() => { onCompleteModule(activeModule.id); setView("journey"); }}
          />
        ) : (
          <button onClick={() => setView("journey")}
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
            ← Back to Training Journey
          </button>
        )}
      </div>
    );
  }

  // ── JOURNEY VIEW (default) ──
  return (
    <div className="fade-in">
      {/* Photo hero */}
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 24, height: 200 }}>
        <img src="/drummer.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,12,18,0.97) 0%, rgba(8,12,18,0.5) 55%, rgba(8,12,18,0.15) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 22px 18px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 6 }}>Training · 5-week plan</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px", fontFamily: "var(--font-display)" }}>The MD Journey</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>A linear path from foundations to leading a real service.</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 8 }}>
            {completedCount === 0 ? "Start with Step 1 below" : completedCount === MD_MODULES.length ? "All modules complete — ready to lead" : `${completedCount} of ${MD_MODULES.length} modules complete`}
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${(completedCount / MD_MODULES.length) * 100}%` }} /></div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: COLORS.accent, flexShrink: 0 }}>{completedCount}/{MD_MODULES.length}</div>
      </div>

      {/* 5-step journey spine */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {JOURNEY_STEPS.map((step, i) => {
          const week = ONBOARDING_WEEKS[step.weekIdx];
          const module = step.moduleId ? MD_MODULES.find(m => m.id === step.moduleId) : null;
          const moduleDone = module ? !!moduleProgress[module.id] : false;
          const isLast = i === JOURNEY_STEPS.length - 1;

          return (
            <div key={step.step} style={{ display: "flex", gap: 0 }}>
              {/* Spine */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 48, flexShrink: 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${moduleDone ? COLORS.green : step.color}`, background: moduleDone ? COLORS.green : COLORS.surface, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: moduleDone ? "#fff" : step.color, flexShrink: 0 }}>
                  {moduleDone ? "✓" : step.step}
                </div>
                {!isLast && <div style={{ width: 2, flex: 1, minHeight: 24, background: `${step.color}25`, margin: "3px 0" }} />}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16, paddingLeft: 14 }}>
                <div style={{ paddingTop: 5, paddingBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: step.color }}>Step {step.step}</div>
                    <div style={{ fontSize: 10, color: COLORS.textDim, letterSpacing: 1, textTransform: "uppercase" }}>{step.phase}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{week.title}</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.55, marginBottom: 12, fontWeight: 500 }}>{step.desc}</div>

                  {/* Module card — if this step has a module */}
                  {module && (
                    <button onClick={() => setView(module.id)}
                      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", background: moduleDone ? COLORS.greenLight : COLORS.card, border: `1px solid ${moduleDone ? COLORS.green + "44" : COLORS.border}`, borderRadius: 12, cursor: "pointer", textAlign: "left", fontFamily: "'Inter', sans-serif", boxShadow: COLORS.shadowXs, transition: "all 0.15s", marginBottom: 8 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = moduleDone ? COLORS.green : step.color; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = moduleDone ? COLORS.green + "44" : COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: moduleDone ? COLORS.green : "rgba(196,154,60,0.15)", border: `1px solid ${moduleDone ? COLORS.green : "rgba(196,154,60,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon name={module.icon} size={18} color={moduleDone ? "#fff" : COLORS.accent} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: moduleDone ? COLORS.green : COLORS.textDim, letterSpacing: 0.5, marginBottom: 2 }}>
                          {moduleDone ? "✓ Complete" : "Study Module"}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{module.title}</div>
                      </div>
                      <span style={{ color: COLORS.textDim, fontSize: 16 }}>›</span>
                    </button>
                  )}

                  {/* Non-module steps — action button */}
                  {!module && (
                    <button onClick={() => setPage(step.action.target)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: `1.5px solid ${step.color}`, background: `${step.color}10`, color: step.color, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = `${step.color}22`}
                      onMouseLeave={e => e.currentTarget.style.background = `${step.color}10`}>
                      {step.action.label} →
                    </button>
                  )}
                </div>

                {!isLast && <div style={{ height: 1, background: COLORS.border, marginBottom: 4 }} />}
              </div>
            </div>
          );
        })}
      </div>
      <IllustrationStageLight />
      <ScriptureVerse page="training" />
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

const Dashboard = ({ setPage, setSelectedPart, moduleProgress }) => {
  const completedCount = MD_MODULES.filter(m => moduleProgress?.[m.id]).length;
  const currentStep = JOURNEY_STEPS[Math.min(completedCount, JOURNEY_STEPS.length - 1)];
  const currentWeek = ONBOARDING_WEEKS[currentStep.weekIdx];
  const trainingDone = completedCount >= MD_MODULES.length;
  const isFirstVisit = completedCount === 0;
  const progressPct = Math.round((completedCount / MD_MODULES.length) * 100);

  const pcoConnected = (() => {
    try { return !!localStorage.getItem("wp-pco-connection"); } catch { return false; }
  })();

  const hourNow = new Date().getHours();
  const greeting =
    hourNow < 5  ? "Night watch" :
    hourNow < 12 ? "Good morning" :
    hourNow < 17 ? "Good afternoon" :
    hourNow < 21 ? "Good evening" :
                   "Night watch";

  return (
    <div className="fade-in">

      {/* ── FULL-BLEED HERO ── */}
      <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", marginBottom: 10, height: "clamp(340px, 48vw, 460px)" }}>
        <img src="/keys-man.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 22%" }} />
        {/* Gradient — dark at bottom for text, fades to transparent at top */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,12,18,1) 0%, rgba(8,12,18,0.82) 35%, rgba(8,12,18,0.3) 65%, rgba(8,12,18,0.05) 100%)" }} />

        {/* Top bar — status + date */}
        <div style={{ position: "absolute", top: 20, left: 22, right: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent, boxShadow: `0 0 8px ${COLORS.accent}` }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, fontFamily: "var(--font-body)" }}>
              {isFirstVisit ? "Welcome to WorshipPilot" : `Step ${currentStep.step} of ${JOURNEY_STEPS.length} · ${currentStep.phase}`}
            </span>
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}
          </span>
        </div>

        {/* Bottom content */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px 24px 26px" }}>
          <div style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 700, color: "#fff", lineHeight: 1.08, letterSpacing: "-0.8px", marginBottom: 10, fontFamily: "var(--font-display)" }}>
            {isFirstVisit ? <>Most teams don't lack talent.<br /><span style={{ color: COLORS.accent }}>They lack clarity.</span></> : trainingDone ? <>You're trained.<br /><span style={{ color: COLORS.accent }}>Stay sharp.</span></> : <>Pick up where<br />you left off.</>}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 20, lineHeight: 1.5 }}>
            {isFirstVisit ? "Playback handles the audio. WorshipPilot handles the leadership." : trainingDone ? "Scenarios, Live Mode, and the Manual keep your edge." : `${currentWeek.title} · ${currentStep.phase} phase · Cue Language module`}
          </div>
          {!isFirstVisit && !trainingDone && (
            <div style={{ marginBottom: 20, maxWidth: 320 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Training progress</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.accent, fontFamily: "var(--font-mono)" }}>{completedCount} / {MD_MODULES.length}</span>
              </div>
              <div style={{ height: 3, borderRadius: 3, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: COLORS.accent, borderRadius: 3, transition: "width 0.6s ease" }} />
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setPage(isFirstVisit ? "starthere" : trainingDone ? "coaching" : "training")}
              style={{ padding: "12px 22px", borderRadius: 10, border: "none", background: COLORS.accent, color: "#080C12", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.accentBright}
              onMouseLeave={e => e.currentTarget.style.background = COLORS.accent}>
              {isFirstVisit ? "Start training →" : trainingDone ? "Practice scenarios →" : "Continue training →"}
            </button>
            <button onClick={() => setPage("live")}
              style={{ padding: "12px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
              ▶ Live Mode
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM THREE CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
        {/* Cue Language / Vocab */}
        <button onClick={() => setPage("vocab")}
          style={{ height: 160, borderRadius: 14, border: `1px solid ${COLORS.borderMid}`, cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "16px", background: COLORS.surfaceAlt }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Icon name="vocab" size={18} color={COLORS.textMuted} />
            <span style={{ fontSize: 12, color: COLORS.textDim }}>›</span>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.accent, marginBottom: 5 }}>Cue Language</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", fontFamily: "var(--font-display)", lineHeight: 1.2, marginBottom: 3 }}>Vocabulary</div>
            <div style={{ fontSize: 11, color: "#4A5568", fontWeight: 500 }}>45+ standard calls</div>
          </div>
        </button>

        {/* Situations */}
        <button onClick={() => setPage("coaching")}
          style={{ height: 160, borderRadius: 14, border: `1px solid ${COLORS.borderMid}`, cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "16px", background: COLORS.surfaceAlt }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Icon name="coaching" size={18} color={COLORS.textMuted} />
            <span style={{ fontSize: 12, color: COLORS.textDim }}>›</span>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.accent, marginBottom: 5 }}>MD Reference</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", fontFamily: "var(--font-display)", lineHeight: 1.2, marginBottom: 3 }}>Situations</div>
            <div style={{ fontSize: 11, color: "#4A5568", fontWeight: 500 }}>7 real-world scenarios</div>
          </div>
        </button>

        {/* Service stats */}
        <button onClick={() => setPage("services")}
          style={{ position: "relative", height: 160, borderRadius: 14, overflow: "hidden", border: `1px solid ${COLORS.border}`, cursor: "pointer", background: COLORS.surface, textAlign: "left", padding: "16px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.accent, marginBottom: 8 }}>Service</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, fontFamily: "var(--font-display)", lineHeight: 1, marginBottom: 4 }}>Build your set</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 16 }}>Songs · Transitions · Live Mode</div>
          <div style={{ display: "flex", gap: 2, height: 28, alignItems: "flex-end" }}>
            {[30,55,80,65,45,75,90,70,40,65,85,55,35,60].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 2, background: i === 10 ? COLORS.accent : `${COLORS.accent}30` }} />
            ))}
          </div>
        </button>
      </div>

      {!pcoConnected && (
        <button onClick={() => setPage("services")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", marginBottom: 28, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: COLORS.shadowXs, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#3D7BF4"; e.currentTarget.style.boxShadow = COLORS.shadow; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadowXs; }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(61,123,244,0.10)", border: "1px solid rgba(61,123,244,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#3D7BF4", fontSize: 12, fontWeight: 800, fontFamily: "var(--font-body)" }}>P</span>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, letterSpacing: "-0.1px" }}>Planning Center</div>
              <div style={{ fontSize: 11.5, color: COLORS.textDim, lineHeight: 1.3, marginTop: 1 }}>Import your upcoming services and song lists</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, letterSpacing: 0.2 }}>Connect →</div>
        </button>
      )}

      {/* ── WORKSPACE GRID ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.textDim }}>//</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.textDim }}>Workspace</span>
          <div style={{ flex: 1, height: 1, background: COLORS.border }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
          {[
            { icon: "vocab",      title: "Vocabulary",      sub: "45+ calls",         page: "vocab" },
            { icon: "manual",     title: "Manual",          sub: "10 parts",          page: "manual" },
            { icon: "videos",     title: "Videos",          sub: "40 clips",          page: "videos" },
            { icon: "coaching",   title: "Situations",      sub: "7 scenarios",       page: "coaching" },
            { icon: "builder",    title: "Song Builder",    sub: "4 saved",           page: "builder" },
            { icon: "services",   title: "Service Builder", sub: "active",            page: "services" },
            { icon: "onboarding", title: "Onboarding",      sub: "5-week plan",       page: "onboarding" },
            { icon: "pilots",     title: "Pilots",          sub: "community",         page: "pilots" },
          ].map((item, i) => (
            <button key={i} onClick={() => setPage(item.page)}
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0, padding: "14px 14px 12px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.borderMid; e.currentTarget.style.background = COLORS.surfaceAlt; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.card; }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 16 }}>
                <Icon name={item.icon} size={16} color="#64748B" />
                <span style={{ fontSize: 13, color: COLORS.textDim }}>›</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 2, letterSpacing: "-0.1px" }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "#4A5568" }}>{item.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <ScriptureVerse page="dashboard" />
    </div>
  );
};
// ─── VOCAB PAGE ───────────────────────────────────────────────────────────────

const VocabPage = () => {
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(VOCAB_DATA.map(v => v.category)))];
  const filtered = filter === "All" ? VOCAB_DATA : VOCAB_DATA.filter(v => v.category === filter);
  const fretboardRef = useRef(null);

  return (
    <div className="fade-in">
      {/* Photo hero */}
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 24, height: 180 }}>
        <img src="/keys-woman.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,12,18,0.97) 0%, rgba(8,12,18,0.5) 55%, rgba(8,12,18,0.15) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 22px 18px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 6 }}>Reference</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px", fontFamily: "var(--font-display)" }}>Vocabulary</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>The standardized calls your band responds to without thinking.</div>
        </div>
      </div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div className="page-eyebrow">Reference</div>
            <div className="page-title" style={{ color: COLORS.text }}>Vocabulary Reference</div>
            <div className="page-sub">Every MD team develops its own language — that's normal. Use these calls as a starting point to build your vocabulary, or adopt them as-is to standardize across multiple MDs on your team.</div>
          </div>
          <button
            onClick={() => fretboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            style={{ flexShrink: 0, marginTop: 4, padding: "8px 16px", borderRadius: 20, border: `1.5px solid ${COLORS.accent}`, background: COLORS.accentLight, color: COLORS.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="builder" size={13} color={COLORS.accent} />
            Fretboard ↓
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {categories.map(c => (
          <button key={c} className={`btn ${filter === c ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter(c)} style={{ padding: "7px 14px" }}>{c}</button>
        ))}
      </div>
      <Hint hintKey="vocab" text="These calls are a foundation — every MD team adapts them over time. The goal is a shared language your band can act on without thinking. Fretboard guide is below ↓ for all 12 keys." />

      <div className="detail-panel">
        <table className="ref-table">
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Call</th>
              <th>Meaning</th>
              <th style={{ width: "16%" }}>Category</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i}>
                <td><span className="call-code">{row.call}</span></td>
                <td style={{ color: "#374151", fontWeight: 600 }}>{row.meaning}</td>
                <td><span className="badge badge-gold">{row.category}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-label" style={{ marginTop: 32 }}>Nashville Number Quick Reference</div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 14 }}>All 12 Keys</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 10 }}>
          {[
            ["C",  "C Dm Em F G Am Bdim"],
            ["Db", "Db Ebm Fm Gb Ab Bbm Cdim"],
            ["D",  "D Em F#m G A Bm C#dim"],
            ["Eb", "Eb Fm Gm Ab Bb Cm Ddim"],
            ["E",  "E F#m G#m A B C#m D#dim"],
            ["F",  "F Gm Am Bb C Dm Edim"],
            ["F#", "F# G#m A#m B C# D#m Fdim"],
            ["G",  "G Am Bm C D Em F#dim"],
            ["Ab", "Ab Bbm Cm Db Eb Fm Gdim"],
            ["A",  "A Bm C#m D E F#m G#dim"],
            ["Bb", "Bb Cm Dm Eb F Gm Adim"],
            ["B",  "B C#m D#m E F# G#m A#dim"],
          ].map(([key, chords]) => (
            <div key={key} style={{ background: COLORS.surfaceAlt, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.accent, fontWeight: 600, marginBottom: 6, fontSize: 13 }}>{key} Major</div>
              <div style={{ fontSize: 11, color: "#4A5568", lineHeight: 1.7, fontWeight: 500 }}>
                {chords.split(" ").map((c, i) => (
                  <span key={i}><span style={{ color: "#111827", fontWeight: 700 }}>{i + 1}</span>={c} </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div ref={fretboardRef} className="section-label">Guitar / Bass Fretboard — All 12 Keys</div>
      <FretboardSection />
    </div>
  );
};

// ─── FRETBOARD COMPONENT ──────────────────────────────────────────────────────

const GUITAR_STRING_LABELS = ["E","A","D","G","B","e"]; // low → high
const BASS_STRING_LABELS   = ["E","A","D","G"];

const FRETBOARD_DATA = {
  C : { guitar: [
    [{f:0,d:3,n:"E"},{f:1,d:4,n:"F"},{f:3,d:5,n:"G"},{f:5,d:6,n:"A"},{f:7,d:7,n:"B"},{f:8,d:1,n:"C"},{f:10,d:2,n:"D"},{f:12,d:3,n:"E"}],
    [{f:0,d:6,n:"A"},{f:2,d:7,n:"B"},{f:3,d:1,n:"C"},{f:5,d:2,n:"D"},{f:7,d:3,n:"E"},{f:8,d:4,n:"F"},{f:10,d:5,n:"G"},{f:12,d:6,n:"A"}],
    [{f:0,d:2,n:"D"},{f:2,d:3,n:"E"},{f:3,d:4,n:"F"},{f:5,d:5,n:"G"},{f:7,d:6,n:"A"},{f:9,d:7,n:"B"},{f:10,d:1,n:"C"},{f:12,d:2,n:"D"}],
    [{f:0,d:5,n:"G"},{f:2,d:6,n:"A"},{f:4,d:7,n:"B"},{f:5,d:1,n:"C"},{f:7,d:2,n:"D"},{f:9,d:3,n:"E"},{f:10,d:4,n:"F"},{f:12,d:5,n:"G"}],
    [{f:0,d:7,n:"B"},{f:1,d:1,n:"C"},{f:3,d:2,n:"D"},{f:5,d:3,n:"E"},{f:6,d:4,n:"F"},{f:8,d:5,n:"G"},{f:10,d:6,n:"A"},{f:12,d:7,n:"B"}],
    [{f:0,d:3,n:"E"},{f:1,d:4,n:"F"},{f:3,d:5,n:"G"},{f:5,d:6,n:"A"},{f:7,d:7,n:"B"},{f:8,d:1,n:"C"},{f:10,d:2,n:"D"},{f:12,d:3,n:"E"}],
  ], bass: [
    [{f:0,d:3,n:"E"},{f:1,d:4,n:"F"},{f:3,d:5,n:"G"},{f:5,d:6,n:"A"},{f:7,d:7,n:"B"},{f:8,d:1,n:"C"},{f:10,d:2,n:"D"},{f:12,d:3,n:"E"}],
    [{f:0,d:6,n:"A"},{f:2,d:7,n:"B"},{f:3,d:1,n:"C"},{f:5,d:2,n:"D"},{f:7,d:3,n:"E"},{f:8,d:4,n:"F"},{f:10,d:5,n:"G"},{f:12,d:6,n:"A"}],
    [{f:0,d:2,n:"D"},{f:2,d:3,n:"E"},{f:3,d:4,n:"F"},{f:5,d:5,n:"G"},{f:7,d:6,n:"A"},{f:9,d:7,n:"B"},{f:10,d:1,n:"C"},{f:12,d:2,n:"D"}],
    [{f:0,d:5,n:"G"},{f:2,d:6,n:"A"},{f:4,d:7,n:"B"},{f:5,d:1,n:"C"},{f:7,d:2,n:"D"},{f:9,d:3,n:"E"},{f:10,d:4,n:"F"},{f:12,d:5,n:"G"}],
  ]},
  Db: { guitar: [
    [{f:1,d:3,n:"F"},{f:2,d:4,n:"Gb"},{f:4,d:5,n:"Ab"},{f:6,d:6,n:"Bb"},{f:8,d:7,n:"C"},{f:9,d:1,n:"Db"},{f:11,d:2,n:"Eb"}],
    [{f:1,d:6,n:"Bb"},{f:3,d:7,n:"C"},{f:4,d:1,n:"Db"},{f:6,d:2,n:"Eb"},{f:8,d:3,n:"F"},{f:9,d:4,n:"Gb"},{f:11,d:5,n:"Ab"}],
    [{f:1,d:2,n:"Eb"},{f:3,d:3,n:"F"},{f:4,d:4,n:"Gb"},{f:6,d:5,n:"Ab"},{f:8,d:6,n:"Bb"},{f:10,d:7,n:"C"},{f:11,d:1,n:"Db"}],
    [{f:1,d:5,n:"Ab"},{f:3,d:6,n:"Bb"},{f:5,d:7,n:"C"},{f:6,d:1,n:"Db"},{f:8,d:2,n:"Eb"},{f:10,d:3,n:"F"},{f:11,d:4,n:"Gb"}],
    [{f:1,d:7,n:"C"},{f:2,d:1,n:"Db"},{f:4,d:2,n:"Eb"},{f:6,d:3,n:"F"},{f:7,d:4,n:"Gb"},{f:9,d:5,n:"Ab"},{f:11,d:6,n:"Bb"}],
    [{f:1,d:3,n:"F"},{f:2,d:4,n:"Gb"},{f:4,d:5,n:"Ab"},{f:6,d:6,n:"Bb"},{f:8,d:7,n:"C"},{f:9,d:1,n:"Db"},{f:11,d:2,n:"Eb"}],
  ], bass: [
    [{f:1,d:3,n:"F"},{f:2,d:4,n:"Gb"},{f:4,d:5,n:"Ab"},{f:6,d:6,n:"Bb"},{f:8,d:7,n:"C"},{f:9,d:1,n:"Db"},{f:11,d:2,n:"Eb"}],
    [{f:1,d:6,n:"Bb"},{f:3,d:7,n:"C"},{f:4,d:1,n:"Db"},{f:6,d:2,n:"Eb"},{f:8,d:3,n:"F"},{f:9,d:4,n:"Gb"},{f:11,d:5,n:"Ab"}],
    [{f:1,d:2,n:"Eb"},{f:3,d:3,n:"F"},{f:4,d:4,n:"Gb"},{f:6,d:5,n:"Ab"},{f:8,d:6,n:"Bb"},{f:10,d:7,n:"C"},{f:11,d:1,n:"Db"}],
    [{f:1,d:5,n:"Ab"},{f:3,d:6,n:"Bb"},{f:5,d:7,n:"C"},{f:6,d:1,n:"Db"},{f:8,d:2,n:"Eb"},{f:10,d:3,n:"F"},{f:11,d:4,n:"Gb"}],
  ]},
  D : { guitar: [
    [{f:0,d:2,n:"E"},{f:2,d:3,n:"F#"},{f:3,d:4,n:"G"},{f:5,d:5,n:"A"},{f:7,d:6,n:"B"},{f:9,d:7,n:"C#"},{f:10,d:1,n:"D"},{f:12,d:2,n:"E"}],
    [{f:0,d:5,n:"A"},{f:2,d:6,n:"B"},{f:4,d:7,n:"C#"},{f:5,d:1,n:"D"},{f:7,d:2,n:"E"},{f:9,d:3,n:"F#"},{f:10,d:4,n:"G"},{f:12,d:5,n:"A"}],
    [{f:0,d:1,n:"D"},{f:2,d:2,n:"E"},{f:4,d:3,n:"F#"},{f:5,d:4,n:"G"},{f:7,d:5,n:"A"},{f:9,d:6,n:"B"},{f:11,d:7,n:"C#"},{f:12,d:1,n:"D"}],
    [{f:0,d:4,n:"G"},{f:2,d:5,n:"A"},{f:4,d:6,n:"B"},{f:6,d:7,n:"C#"},{f:7,d:1,n:"D"},{f:9,d:2,n:"E"},{f:11,d:3,n:"F#"},{f:12,d:4,n:"G"}],
    [{f:0,d:6,n:"B"},{f:2,d:7,n:"C#"},{f:3,d:1,n:"D"},{f:5,d:2,n:"E"},{f:7,d:3,n:"F#"},{f:8,d:4,n:"G"},{f:10,d:5,n:"A"},{f:12,d:6,n:"B"}],
    [{f:0,d:2,n:"E"},{f:2,d:3,n:"F#"},{f:3,d:4,n:"G"},{f:5,d:5,n:"A"},{f:7,d:6,n:"B"},{f:9,d:7,n:"C#"},{f:10,d:1,n:"D"},{f:12,d:2,n:"E"}],
  ], bass: [
    [{f:0,d:2,n:"E"},{f:2,d:3,n:"F#"},{f:3,d:4,n:"G"},{f:5,d:5,n:"A"},{f:7,d:6,n:"B"},{f:9,d:7,n:"C#"},{f:10,d:1,n:"D"},{f:12,d:2,n:"E"}],
    [{f:0,d:5,n:"A"},{f:2,d:6,n:"B"},{f:4,d:7,n:"C#"},{f:5,d:1,n:"D"},{f:7,d:2,n:"E"},{f:9,d:3,n:"F#"},{f:10,d:4,n:"G"},{f:12,d:5,n:"A"}],
    [{f:0,d:1,n:"D"},{f:2,d:2,n:"E"},{f:4,d:3,n:"F#"},{f:5,d:4,n:"G"},{f:7,d:5,n:"A"},{f:9,d:6,n:"B"},{f:11,d:7,n:"C#"},{f:12,d:1,n:"D"}],
    [{f:0,d:4,n:"G"},{f:2,d:5,n:"A"},{f:4,d:6,n:"B"},{f:6,d:7,n:"C#"},{f:7,d:1,n:"D"},{f:9,d:2,n:"E"},{f:11,d:3,n:"F#"},{f:12,d:4,n:"G"}],
  ]},
  Eb: { guitar: [
    [{f:1,d:2,n:"F"},{f:3,d:3,n:"G"},{f:4,d:4,n:"Ab"},{f:6,d:5,n:"Bb"},{f:8,d:6,n:"C"},{f:10,d:7,n:"D"},{f:11,d:1,n:"Eb"}],
    [{f:1,d:5,n:"Bb"},{f:3,d:6,n:"C"},{f:5,d:7,n:"D"},{f:6,d:1,n:"Eb"},{f:8,d:2,n:"F"},{f:10,d:3,n:"G"},{f:11,d:4,n:"Ab"}],
    [{f:0,d:7,n:"D"},{f:1,d:1,n:"Eb"},{f:3,d:2,n:"F"},{f:5,d:3,n:"G"},{f:6,d:4,n:"Ab"},{f:8,d:5,n:"Bb"},{f:10,d:6,n:"C"},{f:12,d:7,n:"D"}],
    [{f:0,d:3,n:"G"},{f:1,d:4,n:"Ab"},{f:3,d:5,n:"Bb"},{f:5,d:6,n:"C"},{f:7,d:7,n:"D"},{f:8,d:1,n:"Eb"},{f:10,d:2,n:"F"},{f:12,d:3,n:"G"}],
    [{f:1,d:6,n:"C"},{f:3,d:7,n:"D"},{f:4,d:1,n:"Eb"},{f:6,d:2,n:"F"},{f:8,d:3,n:"G"},{f:9,d:4,n:"Ab"},{f:11,d:5,n:"Bb"}],
    [{f:1,d:2,n:"F"},{f:3,d:3,n:"G"},{f:4,d:4,n:"Ab"},{f:6,d:5,n:"Bb"},{f:8,d:6,n:"C"},{f:10,d:7,n:"D"},{f:11,d:1,n:"Eb"}],
  ], bass: [
    [{f:1,d:2,n:"F"},{f:3,d:3,n:"G"},{f:4,d:4,n:"Ab"},{f:6,d:5,n:"Bb"},{f:8,d:6,n:"C"},{f:10,d:7,n:"D"},{f:11,d:1,n:"Eb"}],
    [{f:1,d:5,n:"Bb"},{f:3,d:6,n:"C"},{f:5,d:7,n:"D"},{f:6,d:1,n:"Eb"},{f:8,d:2,n:"F"},{f:10,d:3,n:"G"},{f:11,d:4,n:"Ab"}],
    [{f:0,d:7,n:"D"},{f:1,d:1,n:"Eb"},{f:3,d:2,n:"F"},{f:5,d:3,n:"G"},{f:6,d:4,n:"Ab"},{f:8,d:5,n:"Bb"},{f:10,d:6,n:"C"},{f:12,d:7,n:"D"}],
    [{f:0,d:3,n:"G"},{f:1,d:4,n:"Ab"},{f:3,d:5,n:"Bb"},{f:5,d:6,n:"C"},{f:7,d:7,n:"D"},{f:8,d:1,n:"Eb"},{f:10,d:2,n:"F"},{f:12,d:3,n:"G"}],
  ]},
  E : { guitar: [
    [{f:0,d:1,n:"E"},{f:2,d:2,n:"F#"},{f:4,d:3,n:"G#"},{f:5,d:4,n:"A"},{f:7,d:5,n:"B"},{f:9,d:6,n:"C#"},{f:11,d:7,n:"D#"},{f:12,d:1,n:"E"}],
    [{f:0,d:4,n:"A"},{f:2,d:5,n:"B"},{f:4,d:6,n:"C#"},{f:6,d:7,n:"D#"},{f:7,d:1,n:"E"},{f:9,d:2,n:"F#"},{f:11,d:3,n:"G#"},{f:12,d:4,n:"A"}],
    [{f:1,d:7,n:"D#"},{f:2,d:1,n:"E"},{f:4,d:2,n:"F#"},{f:6,d:3,n:"G#"},{f:7,d:4,n:"A"},{f:9,d:5,n:"B"},{f:11,d:6,n:"C#"}],
    [{f:1,d:3,n:"G#"},{f:2,d:4,n:"A"},{f:4,d:5,n:"B"},{f:6,d:6,n:"C#"},{f:8,d:7,n:"D#"},{f:9,d:1,n:"E"},{f:11,d:2,n:"F#"}],
    [{f:0,d:5,n:"B"},{f:2,d:6,n:"C#"},{f:4,d:7,n:"D#"},{f:5,d:1,n:"E"},{f:7,d:2,n:"F#"},{f:9,d:3,n:"G#"},{f:10,d:4,n:"A"},{f:12,d:5,n:"B"}],
    [{f:0,d:1,n:"E"},{f:2,d:2,n:"F#"},{f:4,d:3,n:"G#"},{f:5,d:4,n:"A"},{f:7,d:5,n:"B"},{f:9,d:6,n:"C#"},{f:11,d:7,n:"D#"},{f:12,d:1,n:"E"}],
  ], bass: [
    [{f:0,d:1,n:"E"},{f:2,d:2,n:"F#"},{f:4,d:3,n:"G#"},{f:5,d:4,n:"A"},{f:7,d:5,n:"B"},{f:9,d:6,n:"C#"},{f:11,d:7,n:"D#"},{f:12,d:1,n:"E"}],
    [{f:0,d:4,n:"A"},{f:2,d:5,n:"B"},{f:4,d:6,n:"C#"},{f:6,d:7,n:"D#"},{f:7,d:1,n:"E"},{f:9,d:2,n:"F#"},{f:11,d:3,n:"G#"},{f:12,d:4,n:"A"}],
    [{f:1,d:7,n:"D#"},{f:2,d:1,n:"E"},{f:4,d:2,n:"F#"},{f:6,d:3,n:"G#"},{f:7,d:4,n:"A"},{f:9,d:5,n:"B"},{f:11,d:6,n:"C#"}],
    [{f:1,d:3,n:"G#"},{f:2,d:4,n:"A"},{f:4,d:5,n:"B"},{f:6,d:6,n:"C#"},{f:8,d:7,n:"D#"},{f:9,d:1,n:"E"},{f:11,d:2,n:"F#"}],
  ]},
  F : { guitar: [
    [{f:0,d:7,n:"E"},{f:1,d:1,n:"F"},{f:3,d:2,n:"G"},{f:5,d:3,n:"A"},{f:6,d:4,n:"Bb"},{f:8,d:5,n:"C"},{f:10,d:6,n:"D"},{f:12,d:7,n:"E"}],
    [{f:0,d:3,n:"A"},{f:1,d:4,n:"Bb"},{f:3,d:5,n:"C"},{f:5,d:6,n:"D"},{f:7,d:7,n:"E"},{f:8,d:1,n:"F"},{f:10,d:2,n:"G"},{f:12,d:3,n:"A"}],
    [{f:0,d:6,n:"D"},{f:2,d:7,n:"E"},{f:3,d:1,n:"F"},{f:5,d:2,n:"G"},{f:7,d:3,n:"A"},{f:8,d:4,n:"Bb"},{f:10,d:5,n:"C"},{f:12,d:6,n:"D"}],
    [{f:0,d:2,n:"G"},{f:2,d:3,n:"A"},{f:3,d:4,n:"Bb"},{f:5,d:5,n:"C"},{f:7,d:6,n:"D"},{f:9,d:7,n:"E"},{f:10,d:1,n:"F"},{f:12,d:2,n:"G"}],
    [{f:1,d:5,n:"C"},{f:3,d:6,n:"D"},{f:5,d:7,n:"E"},{f:6,d:1,n:"F"},{f:8,d:2,n:"G"},{f:10,d:3,n:"A"},{f:11,d:4,n:"Bb"}],
    [{f:0,d:7,n:"E"},{f:1,d:1,n:"F"},{f:3,d:2,n:"G"},{f:5,d:3,n:"A"},{f:6,d:4,n:"Bb"},{f:8,d:5,n:"C"},{f:10,d:6,n:"D"},{f:12,d:7,n:"E"}],
  ], bass: [
    [{f:0,d:7,n:"E"},{f:1,d:1,n:"F"},{f:3,d:2,n:"G"},{f:5,d:3,n:"A"},{f:6,d:4,n:"Bb"},{f:8,d:5,n:"C"},{f:10,d:6,n:"D"},{f:12,d:7,n:"E"}],
    [{f:0,d:3,n:"A"},{f:1,d:4,n:"Bb"},{f:3,d:5,n:"C"},{f:5,d:6,n:"D"},{f:7,d:7,n:"E"},{f:8,d:1,n:"F"},{f:10,d:2,n:"G"},{f:12,d:3,n:"A"}],
    [{f:0,d:6,n:"D"},{f:2,d:7,n:"E"},{f:3,d:1,n:"F"},{f:5,d:2,n:"G"},{f:7,d:3,n:"A"},{f:8,d:4,n:"Bb"},{f:10,d:5,n:"C"},{f:12,d:6,n:"D"}],
    [{f:0,d:2,n:"G"},{f:2,d:3,n:"A"},{f:3,d:4,n:"Bb"},{f:5,d:5,n:"C"},{f:7,d:6,n:"D"},{f:9,d:7,n:"E"},{f:10,d:1,n:"F"},{f:12,d:2,n:"G"}],
  ]},
  "F#": { guitar: [
    [{f:1,d:7,n:"F"},{f:2,d:1,n:"F#"},{f:4,d:2,n:"G#"},{f:6,d:3,n:"A#"},{f:7,d:4,n:"B"},{f:9,d:5,n:"C#"},{f:11,d:6,n:"D#"}],
    [{f:1,d:3,n:"A#"},{f:2,d:4,n:"B"},{f:4,d:5,n:"C#"},{f:6,d:6,n:"D#"},{f:8,d:7,n:"F"},{f:9,d:1,n:"F#"},{f:11,d:2,n:"G#"}],
    [{f:1,d:6,n:"D#"},{f:3,d:7,n:"F"},{f:4,d:1,n:"F#"},{f:6,d:2,n:"G#"},{f:8,d:3,n:"A#"},{f:9,d:4,n:"B"},{f:11,d:5,n:"C#"}],
    [{f:1,d:2,n:"G#"},{f:3,d:3,n:"A#"},{f:4,d:4,n:"B"},{f:6,d:5,n:"C#"},{f:8,d:6,n:"D#"},{f:10,d:7,n:"F"},{f:11,d:1,n:"F#"}],
    [{f:0,d:4,n:"B"},{f:2,d:5,n:"C#"},{f:4,d:6,n:"D#"},{f:6,d:7,n:"F"},{f:7,d:1,n:"F#"},{f:9,d:2,n:"G#"},{f:11,d:3,n:"A#"},{f:12,d:4,n:"B"}],
    [{f:1,d:7,n:"F"},{f:2,d:1,n:"F#"},{f:4,d:2,n:"G#"},{f:6,d:3,n:"A#"},{f:7,d:4,n:"B"},{f:9,d:5,n:"C#"},{f:11,d:6,n:"D#"}],
  ], bass: [
    [{f:1,d:7,n:"F"},{f:2,d:1,n:"F#"},{f:4,d:2,n:"G#"},{f:6,d:3,n:"A#"},{f:7,d:4,n:"B"},{f:9,d:5,n:"C#"},{f:11,d:6,n:"D#"}],
    [{f:1,d:3,n:"A#"},{f:2,d:4,n:"B"},{f:4,d:5,n:"C#"},{f:6,d:6,n:"D#"},{f:8,d:7,n:"F"},{f:9,d:1,n:"F#"},{f:11,d:2,n:"G#"}],
    [{f:1,d:6,n:"D#"},{f:3,d:7,n:"F"},{f:4,d:1,n:"F#"},{f:6,d:2,n:"G#"},{f:8,d:3,n:"A#"},{f:9,d:4,n:"B"},{f:11,d:5,n:"C#"}],
    [{f:1,d:2,n:"G#"},{f:3,d:3,n:"A#"},{f:4,d:4,n:"B"},{f:6,d:5,n:"C#"},{f:8,d:6,n:"D#"},{f:10,d:7,n:"F"},{f:11,d:1,n:"F#"}],
  ]},
  G : { guitar: [
    [{f:0,d:6,n:"E"},{f:2,d:7,n:"F#"},{f:3,d:1,n:"G"},{f:5,d:2,n:"A"},{f:7,d:3,n:"B"},{f:8,d:4,n:"C"},{f:10,d:5,n:"D"},{f:12,d:6,n:"E"}],
    [{f:0,d:2,n:"A"},{f:2,d:3,n:"B"},{f:3,d:4,n:"C"},{f:5,d:5,n:"D"},{f:7,d:6,n:"E"},{f:9,d:7,n:"F#"},{f:10,d:1,n:"G"},{f:12,d:2,n:"A"}],
    [{f:0,d:5,n:"D"},{f:2,d:6,n:"E"},{f:4,d:7,n:"F#"},{f:5,d:1,n:"G"},{f:7,d:2,n:"A"},{f:9,d:3,n:"B"},{f:10,d:4,n:"C"},{f:12,d:5,n:"D"}],
    [{f:0,d:1,n:"G"},{f:2,d:2,n:"A"},{f:4,d:3,n:"B"},{f:5,d:4,n:"C"},{f:7,d:5,n:"D"},{f:9,d:6,n:"E"},{f:11,d:7,n:"F#"},{f:12,d:1,n:"G"}],
    [{f:0,d:3,n:"B"},{f:1,d:4,n:"C"},{f:3,d:5,n:"D"},{f:5,d:6,n:"E"},{f:7,d:7,n:"F#"},{f:8,d:1,n:"G"},{f:10,d:2,n:"A"},{f:12,d:3,n:"B"}],
    [{f:0,d:6,n:"E"},{f:2,d:7,n:"F#"},{f:3,d:1,n:"G"},{f:5,d:2,n:"A"},{f:7,d:3,n:"B"},{f:8,d:4,n:"C"},{f:10,d:5,n:"D"},{f:12,d:6,n:"E"}],
  ], bass: [
    [{f:0,d:6,n:"E"},{f:2,d:7,n:"F#"},{f:3,d:1,n:"G"},{f:5,d:2,n:"A"},{f:7,d:3,n:"B"},{f:8,d:4,n:"C"},{f:10,d:5,n:"D"},{f:12,d:6,n:"E"}],
    [{f:0,d:2,n:"A"},{f:2,d:3,n:"B"},{f:3,d:4,n:"C"},{f:5,d:5,n:"D"},{f:7,d:6,n:"E"},{f:9,d:7,n:"F#"},{f:10,d:1,n:"G"},{f:12,d:2,n:"A"}],
    [{f:0,d:5,n:"D"},{f:2,d:6,n:"E"},{f:4,d:7,n:"F#"},{f:5,d:1,n:"G"},{f:7,d:2,n:"A"},{f:9,d:3,n:"B"},{f:10,d:4,n:"C"},{f:12,d:5,n:"D"}],
    [{f:0,d:1,n:"G"},{f:2,d:2,n:"A"},{f:4,d:3,n:"B"},{f:5,d:4,n:"C"},{f:7,d:5,n:"D"},{f:9,d:6,n:"E"},{f:11,d:7,n:"F#"},{f:12,d:1,n:"G"}],
  ]},
  Ab: { guitar: [
    [{f:1,d:6,n:"F"},{f:3,d:7,n:"G"},{f:4,d:1,n:"Ab"},{f:6,d:2,n:"Bb"},{f:8,d:3,n:"C"},{f:9,d:4,n:"Db"},{f:11,d:5,n:"Eb"}],
    [{f:1,d:2,n:"Bb"},{f:3,d:3,n:"C"},{f:4,d:4,n:"Db"},{f:6,d:5,n:"Eb"},{f:8,d:6,n:"F"},{f:10,d:7,n:"G"},{f:11,d:1,n:"Ab"}],
    [{f:1,d:5,n:"Eb"},{f:3,d:6,n:"F"},{f:5,d:7,n:"G"},{f:6,d:1,n:"Ab"},{f:8,d:2,n:"Bb"},{f:10,d:3,n:"C"},{f:11,d:4,n:"Db"}],
    [{f:0,d:7,n:"G"},{f:1,d:1,n:"Ab"},{f:3,d:2,n:"Bb"},{f:5,d:3,n:"C"},{f:6,d:4,n:"Db"},{f:8,d:5,n:"Eb"},{f:10,d:6,n:"F"},{f:12,d:7,n:"G"}],
    [{f:1,d:3,n:"C"},{f:2,d:4,n:"Db"},{f:4,d:5,n:"Eb"},{f:6,d:6,n:"F"},{f:8,d:7,n:"G"},{f:9,d:1,n:"Ab"},{f:11,d:2,n:"Bb"}],
    [{f:1,d:6,n:"F"},{f:3,d:7,n:"G"},{f:4,d:1,n:"Ab"},{f:6,d:2,n:"Bb"},{f:8,d:3,n:"C"},{f:9,d:4,n:"Db"},{f:11,d:5,n:"Eb"}],
  ], bass: [
    [{f:1,d:6,n:"F"},{f:3,d:7,n:"G"},{f:4,d:1,n:"Ab"},{f:6,d:2,n:"Bb"},{f:8,d:3,n:"C"},{f:9,d:4,n:"Db"},{f:11,d:5,n:"Eb"}],
    [{f:1,d:2,n:"Bb"},{f:3,d:3,n:"C"},{f:4,d:4,n:"Db"},{f:6,d:5,n:"Eb"},{f:8,d:6,n:"F"},{f:10,d:7,n:"G"},{f:11,d:1,n:"Ab"}],
    [{f:1,d:5,n:"Eb"},{f:3,d:6,n:"F"},{f:5,d:7,n:"G"},{f:6,d:1,n:"Ab"},{f:8,d:2,n:"Bb"},{f:10,d:3,n:"C"},{f:11,d:4,n:"Db"}],
    [{f:0,d:7,n:"G"},{f:1,d:1,n:"Ab"},{f:3,d:2,n:"Bb"},{f:5,d:3,n:"C"},{f:6,d:4,n:"Db"},{f:8,d:5,n:"Eb"},{f:10,d:6,n:"F"},{f:12,d:7,n:"G"}],
  ]},
  A : { guitar: [
    [{f:0,d:5,n:"E"},{f:2,d:6,n:"F#"},{f:4,d:7,n:"G#"},{f:5,d:1,n:"A"},{f:7,d:2,n:"B"},{f:9,d:3,n:"C#"},{f:10,d:4,n:"D"},{f:12,d:5,n:"E"}],
    [{f:0,d:1,n:"A"},{f:2,d:2,n:"B"},{f:4,d:3,n:"C#"},{f:5,d:4,n:"D"},{f:7,d:5,n:"E"},{f:9,d:6,n:"F#"},{f:11,d:7,n:"G#"},{f:12,d:1,n:"A"}],
    [{f:0,d:4,n:"D"},{f:2,d:5,n:"E"},{f:4,d:6,n:"F#"},{f:6,d:7,n:"G#"},{f:7,d:1,n:"A"},{f:9,d:2,n:"B"},{f:11,d:3,n:"C#"},{f:12,d:4,n:"D"}],
    [{f:1,d:7,n:"G#"},{f:2,d:1,n:"A"},{f:4,d:2,n:"B"},{f:6,d:3,n:"C#"},{f:7,d:4,n:"D"},{f:9,d:5,n:"E"},{f:11,d:6,n:"F#"}],
    [{f:0,d:2,n:"B"},{f:2,d:3,n:"C#"},{f:3,d:4,n:"D"},{f:5,d:5,n:"E"},{f:7,d:6,n:"F#"},{f:9,d:7,n:"G#"},{f:10,d:1,n:"A"},{f:12,d:2,n:"B"}],
    [{f:0,d:5,n:"E"},{f:2,d:6,n:"F#"},{f:4,d:7,n:"G#"},{f:5,d:1,n:"A"},{f:7,d:2,n:"B"},{f:9,d:3,n:"C#"},{f:10,d:4,n:"D"},{f:12,d:5,n:"E"}],
  ], bass: [
    [{f:0,d:5,n:"E"},{f:2,d:6,n:"F#"},{f:4,d:7,n:"G#"},{f:5,d:1,n:"A"},{f:7,d:2,n:"B"},{f:9,d:3,n:"C#"},{f:10,d:4,n:"D"},{f:12,d:5,n:"E"}],
    [{f:0,d:1,n:"A"},{f:2,d:2,n:"B"},{f:4,d:3,n:"C#"},{f:5,d:4,n:"D"},{f:7,d:5,n:"E"},{f:9,d:6,n:"F#"},{f:11,d:7,n:"G#"},{f:12,d:1,n:"A"}],
    [{f:0,d:4,n:"D"},{f:2,d:5,n:"E"},{f:4,d:6,n:"F#"},{f:6,d:7,n:"G#"},{f:7,d:1,n:"A"},{f:9,d:2,n:"B"},{f:11,d:3,n:"C#"},{f:12,d:4,n:"D"}],
    [{f:1,d:7,n:"G#"},{f:2,d:1,n:"A"},{f:4,d:2,n:"B"},{f:6,d:3,n:"C#"},{f:7,d:4,n:"D"},{f:9,d:5,n:"E"},{f:11,d:6,n:"F#"}],
  ]},
  Bb: { guitar: [
    [{f:1,d:5,n:"F"},{f:3,d:6,n:"G"},{f:5,d:7,n:"A"},{f:6,d:1,n:"Bb"},{f:8,d:2,n:"C"},{f:10,d:3,n:"D"},{f:11,d:4,n:"Eb"}],
    [{f:0,d:7,n:"A"},{f:1,d:1,n:"Bb"},{f:3,d:2,n:"C"},{f:5,d:3,n:"D"},{f:6,d:4,n:"Eb"},{f:8,d:5,n:"F"},{f:10,d:6,n:"G"},{f:12,d:7,n:"A"}],
    [{f:0,d:3,n:"D"},{f:1,d:4,n:"Eb"},{f:3,d:5,n:"F"},{f:5,d:6,n:"G"},{f:7,d:7,n:"A"},{f:8,d:1,n:"Bb"},{f:10,d:2,n:"C"},{f:12,d:3,n:"D"}],
    [{f:0,d:6,n:"G"},{f:2,d:7,n:"A"},{f:3,d:1,n:"Bb"},{f:5,d:2,n:"C"},{f:7,d:3,n:"D"},{f:8,d:4,n:"Eb"},{f:10,d:5,n:"F"},{f:12,d:6,n:"G"}],
    [{f:1,d:2,n:"C"},{f:3,d:3,n:"D"},{f:4,d:4,n:"Eb"},{f:6,d:5,n:"F"},{f:8,d:6,n:"G"},{f:10,d:7,n:"A"},{f:11,d:1,n:"Bb"}],
    [{f:1,d:5,n:"F"},{f:3,d:6,n:"G"},{f:5,d:7,n:"A"},{f:6,d:1,n:"Bb"},{f:8,d:2,n:"C"},{f:10,d:3,n:"D"},{f:11,d:4,n:"Eb"}],
  ], bass: [
    [{f:1,d:5,n:"F"},{f:3,d:6,n:"G"},{f:5,d:7,n:"A"},{f:6,d:1,n:"Bb"},{f:8,d:2,n:"C"},{f:10,d:3,n:"D"},{f:11,d:4,n:"Eb"}],
    [{f:0,d:7,n:"A"},{f:1,d:1,n:"Bb"},{f:3,d:2,n:"C"},{f:5,d:3,n:"D"},{f:6,d:4,n:"Eb"},{f:8,d:5,n:"F"},{f:10,d:6,n:"G"},{f:12,d:7,n:"A"}],
    [{f:0,d:3,n:"D"},{f:1,d:4,n:"Eb"},{f:3,d:5,n:"F"},{f:5,d:6,n:"G"},{f:7,d:7,n:"A"},{f:8,d:1,n:"Bb"},{f:10,d:2,n:"C"},{f:12,d:3,n:"D"}],
    [{f:0,d:6,n:"G"},{f:2,d:7,n:"A"},{f:3,d:1,n:"Bb"},{f:5,d:2,n:"C"},{f:7,d:3,n:"D"},{f:8,d:4,n:"Eb"},{f:10,d:5,n:"F"},{f:12,d:6,n:"G"}],
  ]},
  B : { guitar: [
    [{f:0,d:4,n:"E"},{f:2,d:5,n:"F#"},{f:4,d:6,n:"G#"},{f:6,d:7,n:"A#"},{f:7,d:1,n:"B"},{f:9,d:2,n:"C#"},{f:11,d:3,n:"D#"},{f:12,d:4,n:"E"}],
    [{f:1,d:7,n:"A#"},{f:2,d:1,n:"B"},{f:4,d:2,n:"C#"},{f:6,d:3,n:"D#"},{f:7,d:4,n:"E"},{f:9,d:5,n:"F#"},{f:11,d:6,n:"G#"}],
    [{f:1,d:3,n:"D#"},{f:2,d:4,n:"E"},{f:4,d:5,n:"F#"},{f:6,d:6,n:"G#"},{f:8,d:7,n:"A#"},{f:9,d:1,n:"B"},{f:11,d:2,n:"C#"}],
    [{f:1,d:6,n:"G#"},{f:3,d:7,n:"A#"},{f:4,d:1,n:"B"},{f:6,d:2,n:"C#"},{f:8,d:3,n:"D#"},{f:9,d:4,n:"E"},{f:11,d:5,n:"F#"}],
    [{f:0,d:1,n:"B"},{f:2,d:2,n:"C#"},{f:4,d:3,n:"D#"},{f:5,d:4,n:"E"},{f:7,d:5,n:"F#"},{f:9,d:6,n:"G#"},{f:11,d:7,n:"A#"},{f:12,d:1,n:"B"}],
    [{f:0,d:4,n:"E"},{f:2,d:5,n:"F#"},{f:4,d:6,n:"G#"},{f:6,d:7,n:"A#"},{f:7,d:1,n:"B"},{f:9,d:2,n:"C#"},{f:11,d:3,n:"D#"},{f:12,d:4,n:"E"}],
  ], bass: [
    [{f:0,d:4,n:"E"},{f:2,d:5,n:"F#"},{f:4,d:6,n:"G#"},{f:6,d:7,n:"A#"},{f:7,d:1,n:"B"},{f:9,d:2,n:"C#"},{f:11,d:3,n:"D#"},{f:12,d:4,n:"E"}],
    [{f:1,d:7,n:"A#"},{f:2,d:1,n:"B"},{f:4,d:2,n:"C#"},{f:6,d:3,n:"D#"},{f:7,d:4,n:"E"},{f:9,d:5,n:"F#"},{f:11,d:6,n:"G#"}],
    [{f:1,d:3,n:"D#"},{f:2,d:4,n:"E"},{f:4,d:5,n:"F#"},{f:6,d:6,n:"G#"},{f:8,d:7,n:"A#"},{f:9,d:1,n:"B"},{f:11,d:2,n:"C#"}],
    [{f:1,d:6,n:"G#"},{f:3,d:7,n:"A#"},{f:4,d:1,n:"B"},{f:6,d:2,n:"C#"},{f:8,d:3,n:"D#"},{f:9,d:4,n:"E"},{f:11,d:5,n:"F#"}],
  ]}
};;

const DEGREE_COLORS = {1:"#C07A0C",2:"#4A90D9",3:"#4A90D9",4:"#7B68C8",5:"#7B68C8",6:"#2E9E6A",7:"#2E9E6A"};

// Portrait fullscreen fretboard — axes swapped so neck runs top→bottom on a phone screen.
// Strings = columns (low E left, high e right). Frets = rows (open top, 12 bottom).
// No CSS rotation needed — SVG viewBox is already portrait-shaped.
const FretboardPortrait = ({ strings, stringLabels, isBass }) => {
  // Display: low E on LEFT → high e on RIGHT (same visual as normal but transposed)
  const displayStrings = strings; // low→high order, now left→right columns
  const displayLabels  = stringLabels;

  const nS     = displayStrings.length;
  const FRETS  = 12;

  // Portrait layout: strings are columns, frets are rows
  const LABEL_H  = 22; // string name row at top
  const OPEN_H   = 34; // open string row below label
  const NUT_H    = 5;
  const ROW_H    = 46; // height per fret row
  const COL_W    = 44; // width per string column — wider for portrait
  const MARKER_W = 20; // left column for fret numbers/markers

  const boardW = MARKER_W + nS * COL_W;
  const boardH = LABEL_H + OPEN_H + NUT_H + FRETS * ROW_H;

  const lookups = displayStrings.map(arr => {
    const m = {};
    arr.forEach(({ f, d, n }) => { m[f] = { degree: d, note: n }; });
    return m;
  });

  const NoteCircle = ({ cx, cy, degree, note, r = 13 }) => {
    const isRoot = degree === 1;
    const color  = DEGREE_COLORS[degree] || "#4A90D9";
    return (
      <g>
        <circle cx={cx} cy={cy} r={isRoot ? r + 1 : r} fill={color} opacity={isRoot ? 1 : 0.88} />
        {isRoot && <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke={color} strokeWidth={2} opacity={0.35} />}
        {isRoot ? (
          <>
            <text x={cx} y={cy - 1} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="800" fontFamily="'Inter', sans-serif">1</text>
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.9)" fontWeight="600" fontFamily="'Inter', sans-serif">{note}</text>
          </>
        ) : (
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize={11} fill="#fff" fontWeight="700" fontFamily="'Inter', sans-serif">{degree}</text>
        )}
      </g>
    );
  };

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${boardW} ${boardH}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
      <rect width={boardW} height={boardH} fill="#0D1924" />

      {/* String name labels — top row */}
      {displayStrings.map((_, si) => {
        const cx = MARKER_W + si * COL_W + COL_W / 2;
        return (
          <text key={si} x={cx} y={LABEL_H - 5} textAnchor="middle" fontSize={11} fill="#4A6A88" fontFamily="'Inter', sans-serif" fontWeight="700">
            {displayLabels[si]}
          </text>
        );
      })}

      {/* "Open" label in marker column */}
      <text x={MARKER_W / 2} y={LABEL_H + OPEN_H / 2 + 4} textAnchor="middle" fontSize={7} fill="#2A4060" fontFamily="'Inter', sans-serif">Opn</text>

      {/* Open string row background */}
      <rect x={MARKER_W} y={LABEL_H} width={nS * COL_W} height={OPEN_H} fill="#0A1520" />

      {/* Open string: note or empty circle per string */}
      {displayStrings.map((_, si) => {
        const cx = MARKER_W + si * COL_W + COL_W / 2;
        const cy = LABEL_H + OPEN_H / 2;
        const lk = lookups[si];
        const openNote = lk[0];
        // String thickness: low E (si=0) thickest
        const thick = 0.8 + (nS - 1 - si) * (isBass ? 0.7 : 0.45);
        return (
          <g key={si}>
            {/* Vertical string line through open zone */}
            <line x1={cx} y1={LABEL_H + 4} x2={cx} y2={LABEL_H + OPEN_H - 4} stroke="#1E3A58" strokeWidth={thick} />
            {openNote
              ? <NoteCircle cx={cx} cy={cy} degree={openNote.degree} note={openNote.note} r={12} />
              : <circle cx={cx} cy={cy} r={7} fill="none" stroke="#2A4060" strokeWidth={1.5} />
            }
          </g>
        );
      })}

      {/* Nut — horizontal bar */}
      <rect x={MARKER_W} y={LABEL_H + OPEN_H} width={nS * COL_W} height={NUT_H} fill="#8AAAC8" />

      {/* String lines through fret area */}
      {displayStrings.map((_, si) => {
        const cx = MARKER_W + si * COL_W + COL_W / 2;
        const thick = 0.8 + (nS - 1 - si) * (isBass ? 0.7 : 0.45);
        return (
          <line key={si} x1={cx} y1={LABEL_H + OPEN_H + NUT_H} x2={cx} y2={boardH} stroke="#1E3A58" strokeWidth={thick} />
        );
      })}

      {/* Fret lines — horizontal */}
      {Array.from({ length: FRETS + 1 }).map((_, fi) => {
        const y = LABEL_H + OPEN_H + NUT_H + fi * ROW_H;
        return <line key={fi} x1={MARKER_W} y1={y} x2={MARKER_W + nS * COL_W} y2={y} stroke="#1A3050" strokeWidth={1} />;
      })}

      {/* Fret numbers + position markers */}
      {Array.from({ length: FRETS }).map((_, fi) => {
        const fret = fi + 1;
        const y = LABEL_H + OPEN_H + NUT_H + fi * ROW_H + ROW_H / 2;
        const hasDot = [3,5,7,9,12].includes(fret);
        const isDouble = fret === 12;
        return (
          <g key={fret}>
            <text x={MARKER_W / 2} y={y + 4} textAnchor="middle" fontSize={9} fill={hasDot ? "#4A7090" : "#2A4060"} fontFamily="'JetBrains Mono', monospace">{fret}</text>
            {hasDot && !isDouble && <circle cx={MARKER_W - 4} cy={y} r={2.5} fill="#2A4060" />}
            {isDouble && <><circle cx={MARKER_W - 4} cy={y - 5} r={2.5} fill="#2A4060" /><circle cx={MARKER_W - 4} cy={y + 5} r={2.5} fill="#2A4060" /></>}
          </g>
        );
      })}

      {/* Fretted notes */}
      {displayStrings.map((_, si) => {
        const cx = MARKER_W + si * COL_W + COL_W / 2;
        const lk = lookups[si];
        return Array.from({ length: FRETS }).map((_, fi) => {
          const nd = lk[fi + 1];
          if (!nd) return null;
          const cy = LABEL_H + OPEN_H + NUT_H + fi * ROW_H + ROW_H / 2;
          return <NoteCircle key={`${si}-${fi}`} cx={cx} cy={cy} degree={nd.degree} note={nd.note} r={13} />;
        });
      })}
    </svg>
  );
};

const Fretboard = ({ strings, stringLabels, isBass }) => {
  // Reverse so low E string renders at bottom
  const displayStrings = [...strings].reverse();
  const displayLabels  = [...stringLabels].reverse();

  const FRETS   = 12;
  const COL_W   = 38;
  const ROW_H   = 30;
  const LABEL_W = 22;
  const OPEN_W  = 36;
  const NUT_W   = 5;
  const HDR_H   = 32;
  const nS      = displayStrings.length;
  const boardW  = LABEL_W + OPEN_W + NUT_W + FRETS * COL_W;
  const boardH  = HDR_H + nS * ROW_H;

  const lookups = displayStrings.map(arr => {
    const m = {};
    arr.forEach(({ f, d, n }) => { m[f] = { degree: d, note: n }; });
    return m;
  });

  const NoteCircle = ({ cx, cy, degree, note, r = 10 }) => {
    const isRoot = degree === 1;
    const color  = DEGREE_COLORS[degree] || "#4A90D9";
    return (
      <g>
        <circle cx={cx} cy={cy} r={isRoot ? r + 1 : r} fill={color} opacity={isRoot ? 1 : 0.88} />
        {isRoot && <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke={color} strokeWidth={1.5} opacity={0.35} />}
        {isRoot ? (
          <>
            <text x={cx} y={cy - 1} textAnchor="middle" fontSize={7.5} fill="#fff" fontWeight="800" fontFamily="'Inter', sans-serif">1</text>
            <text x={cx} y={cy + 7} textAnchor="middle" fontSize={6.5} fill="rgba(255,255,255,0.9)" fontWeight="600" fontFamily="'Inter', sans-serif">{note}</text>
          </>
        ) : (
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="700" fontFamily="'Inter', sans-serif">{degree}</text>
        )}
      </g>
    );
  };

  return (
    <svg width="100%" viewBox={`0 0 ${boardW} ${boardH}`} style={{ display: "block" }}>
      <rect width={boardW} height={boardH} fill="#0D1924" rx="10" />

      {/* Position markers above frets */}
      {[3,5,7,9,12].map(f => {
        const x = LABEL_W + OPEN_W + NUT_W + (f - 0.5) * COL_W;
        return f === 12
          ? <g key={f}><circle cx={x-6} cy={10} r={3} fill="#1E3350"/><circle cx={x+6} cy={10} r={3} fill="#1E3350"/></g>
          : <circle key={f} cx={x} cy={10} r={3} fill="#1E3350"/>;
      })}

      {/* Fret numbers 1–12 */}
      {Array.from({length:FRETS}).map((_,i) => (
        <text key={i} x={LABEL_W+OPEN_W+NUT_W+(i+0.5)*COL_W} y={25} textAnchor="middle" fontSize={9} fill="#2A4060" fontFamily="'JetBrains Mono', monospace">{i+1}</text>
      ))}

      {/* "Open" column label */}
      <text x={LABEL_W+OPEN_W/2} y={25} textAnchor="middle" fontSize={8} fill="#2A4060" fontFamily="'Inter', sans-serif">Open</text>

      {/* Nut */}
      <rect x={LABEL_W+OPEN_W} y={HDR_H} width={NUT_W} height={nS*ROW_H} fill="#8AAAC8" rx={1}/>

      {/* Separator line between open and nut area */}
      <line x1={LABEL_W+OPEN_W} y1={HDR_H} x2={LABEL_W+OPEN_W} y2={HDR_H+nS*ROW_H} stroke="#1A3050" strokeWidth={1}/>

      {/* Fret lines */}
      {Array.from({length:FRETS}).map((_,i) => (
        <line key={i} x1={LABEL_W+OPEN_W+NUT_W+i*COL_W} y1={HDR_H} x2={LABEL_W+OPEN_W+NUT_W+i*COL_W} y2={HDR_H+nS*ROW_H} stroke="#1A3050" strokeWidth={1}/>
      ))}
      <line x1={LABEL_W+OPEN_W+NUT_W+FRETS*COL_W} y1={HDR_H} x2={LABEL_W+OPEN_W+NUT_W+FRETS*COL_W} y2={HDR_H+nS*ROW_H} stroke="#1A3050" strokeWidth={1}/>

      {/* Strings and notes */}
      {displayStrings.map((strArr, si) => {
        const y = HDR_H + si * ROW_H + ROW_H / 2;
        const lk = lookups[si];
        const openNote = lk[0];
        const thick = 0.8 + (nS - 1 - si) * (isBass ? 0.6 : 0.42);
        return (
          <g key={si}>
            {/* String label */}
            <text x={LABEL_W-4} y={y+4} textAnchor="end" fontSize={9} fill="#4A6A88" fontFamily="'Inter', sans-serif" fontWeight="600">{displayLabels[si]}</text>

            {/* String line */}
            <line x1={LABEL_W+4} y1={y} x2={LABEL_W+OPEN_W+NUT_W+FRETS*COL_W} y2={y} stroke="#1E3A58" strokeWidth={thick}/>

            {/* Open string: scale tone or empty circle */}
            {openNote
              ? <NoteCircle cx={LABEL_W+OPEN_W/2} cy={y} degree={openNote.degree} note={openNote.note} r={9}/>
              : <circle cx={LABEL_W+OPEN_W/2} cy={y} r={6} fill="none" stroke="#2A4060" strokeWidth={1.5}/>
            }

            {/* Fretted notes 1–12 */}
            {Array.from({length:FRETS}).map((_,i) => {
              const nd = lk[i+1];
              if (!nd) return null;
              return <NoteCircle key={i} cx={LABEL_W+OPEN_W+NUT_W+(i+0.5)*COL_W} cy={y} degree={nd.degree} note={nd.note} r={10}/>;
            })}
          </g>
        );
      })}
    </svg>
  );
};

const FretboardSection = () => {
  const [activeKey, setActiveKey]   = useState("G");
  const [instrument, setInstrument] = useState("guitar");
  const [fullscreen, setFullscreen] = useState(false);
  const sectionRef = useRef(null);
  const keys    = Object.keys(FRETBOARD_DATA);
  const kd      = FRETBOARD_DATA[activeKey];
  const strings = instrument === "guitar" ? kd.guitar : kd.bass;
  const labels  = instrument === "guitar" ? GUITAR_STRING_LABELS : BASS_STRING_LABELS;

  const scaleTones = (() => {
    const seen = {};
    strings.forEach(arr => arr.forEach(({ d, n }) => { if (!seen[d]) seen[d] = n; }));
    return [1,2,3,4,5,6,7].filter(d => seen[d]).map(d => ({ d, n: seen[d] }));
  })();

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [fullscreen]);

  // ── FULLSCREEN OVERLAY — portrait SVG, no CSS rotation needed ──
  const fullscreenOverlay = fullscreen ? createPortal(
    <div style={{
      position: "fixed", top: 0, left: 0,
      width: "100vw", height: "100vh",
      zIndex: 9999, background: "#0A1520",
      display: "flex", flexDirection: "column",
      padding: "env(safe-area-inset-top, 12px) 14px 12px 14px",
      boxSizing: "border-box", overflow: "hidden",
    }}>

      {/* Top bar: title + close */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#fff" }}>
          {instrument === "guitar" ? "Guitar" : "Bass"} — Key of {activeKey}
        </div>
        <button onClick={() => setFullscreen(false)}
          style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", flexShrink: 0 }}>
          ✕
        </button>
      </div>

      {/* Controls row: key selector + instrument toggle + legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexShrink: 0, flexWrap: "wrap" }}>
        {/* Key buttons */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1 }}>
          {keys.map(k => (
            <button key={k} onClick={() => setActiveKey(k)}
              style={{ padding: "3px 9px", borderRadius: 12, border: `1.5px solid ${activeKey === k ? COLORS.accent : "rgba(255,255,255,0.15)"}`, background: activeKey === k ? COLORS.accent : "transparent", color: activeKey === k ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-display)" }}>
              {k}
            </button>
          ))}
        </div>
        {/* Instrument toggle */}
        <div style={{ display: "flex", borderRadius: 16, border: "1px solid rgba(255,255,255,0.15)", overflow: "hidden", flexShrink: 0 }}>
          {["guitar","bass"].map(inst => (
            <button key={inst} onClick={() => setInstrument(inst)}
              style={{ padding: "4px 12px", border: "none", background: instrument === inst ? COLORS.accent : "transparent", color: instrument === inst ? "#fff" : "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>
              {inst}
            </button>
          ))}
        </div>
      </div>

      {/* Scale tones + legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {scaleTones.map(({ d, n }) => (
            <span key={d} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
              <span style={{ color: d === 1 ? COLORS.accent : "#8AAAC8", fontWeight: 700 }}>{d}</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>=</span>
              <span style={{ color: d === 1 ? COLORS.accent : "#fff", fontWeight: 600 }}>{n}</span>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[{c:"#C07A0C",l:"Root"},{c:"#4A90D9",l:"2,3"},{c:"#7B68C8",l:"4,5"},{c:"#2E9E6A",l:"6,7"}].map(({ c, l }) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Portrait fretboard — fills remaining height */}
      <div style={{ flex: 1, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", minHeight: 0 }}>
        <FretboardPortrait strings={strings} stringLabels={labels} isBass={instrument === "bass"} />
      </div>
    </div>,
    document.body
  ) : null;

  // ── NORMAL CARD VIEW ──
  return (
    <>
      {fullscreenOverlay}
      <div ref={sectionRef} className="card" style={{ padding: "20px 20px 24px" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: COLORS.navy }}>
          {instrument === "guitar" ? "Guitar" : "Bass"} Fretboard — Scale Positions
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", borderRadius: 20, border: `1.5px solid ${COLORS.border}`, overflow: "hidden" }}>
            {["guitar","bass"].map(inst => (
              <button key={inst} onClick={() => setInstrument(inst)}
                style={{ padding: "6px 18px", border: "none", background: instrument === inst ? COLORS.navy : COLORS.card, color: instrument === inst ? "#fff" : COLORS.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.15s", textTransform: "capitalize" }}>
                {inst}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
        All scale tones, frets 0–12. Low string at bottom. Root in amber labeled <span style={{ fontFamily: "'JetBrains Mono', monospace", background: COLORS.accentLight, color: COLORS.accent, padding: "1px 6px", borderRadius: 4, fontSize: 10 }}>1 / note</span>
      </div>

      {/* Key selector */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {keys.map(k => (
          <button key={k} onClick={() => setActiveKey(k)}
            style={{ padding: "6px 15px", borderRadius: 20, border: `1.5px solid ${activeKey === k ? COLORS.accent : COLORS.border}`, background: activeKey === k ? COLORS.accentLight : COLORS.card, color: activeKey === k ? COLORS.accent : COLORS.textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-display)", transition: "all 0.15s" }}>
            {k}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        {[{c:"#C07A0C",l:"1 — Root"},{c:"#4A90D9",l:"2, 3"},{c:"#7B68C8",l:"4, 5"},{c:"#2E9E6A",l:"6, 7"}].map(({ c, l }) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>{l}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", border: `1.5px solid #2A4060`, background: "transparent" }} />
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>Open (not in scale)</span>
        </div>
      </div>

      {/* Fretboard — tap to expand */}
      <div
        onClick={() => setFullscreen(true)}
        style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${COLORS.border}`, cursor: "pointer", position: "relative" }}>
        <Fretboard strings={strings} stringLabels={labels} isBass={instrument === "bass"} />
        {/* Tap hint overlay */}
        <div style={{ position: "absolute", bottom: 8, right: 10, background: "rgba(13,25,36,0.75)", borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(4px)" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Tap to expand ⤢</span>
        </div>
      </div>

      {/* Scale tone summary */}
      <div style={{ marginTop: 14, padding: "12px 16px", background: COLORS.surfaceAlt, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 8 }}>Scale Tones — Key of {activeKey}</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {scaleTones.map(({ d, n }) => (
            <span key={d} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
              <span style={{ color: d === 1 ? COLORS.accent : COLORS.navy, fontWeight: 700 }}>{d}</span>
              <span style={{ color: COLORS.textDim }}>=</span>
              <span style={{ color: d === 1 ? COLORS.accent : COLORS.text, fontWeight: 600 }}>{n}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
    <IllustrationHeadphones />
    <ScriptureVerse page="vocab" />
    </>
  );
};

// ─── ONBOARDING PAGE ──────────────────────────────────────────────────────────

const OnboardingPage = () => {
  const [activeWeek, setActiveWeek] = useState(0);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wp-onboarding") || "{}"); } catch { return {}; }
  });

  const toggleTask = (weekIdx, taskIdx) => {
    const key = `${weekIdx}-${taskIdx}`;
    setCompleted(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem("wp-onboarding", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const weekProgress = (weekIdx) => {
    const tasks = ONBOARDING_WEEKS[weekIdx].tasks;
    const done = tasks.filter((_, ti) => completed[`${weekIdx}-${ti}`]).length;
    return Math.round((done / tasks.length) * 100);
  };

  return (
    <div className="fade-in">
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 24, height: 180 }}>
        <img src="/empty-stage.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 70%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,12,18,0.97) 0%, rgba(8,12,18,0.5) 55%, rgba(8,12,18,0.15) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 22px 18px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 6 }}>Training</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px", fontFamily: "var(--font-display)" }}>MD Onboarding</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>5-week pathway with clear benchmarks at every stage.</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {ONBOARDING_WEEKS.map((w, i) => (
          <button key={i} className={`btn ${activeWeek === i ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveWeek(i)}>
            Week {w.week} {weekProgress(i) === 100 && "✓"}
          </button>
        ))}
      </div>

      <div className="detail-panel">
        <div className="detail-header">
          <div>
            <div style={{ fontSize: 10, color: COLORS.accent, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Week {ONBOARDING_WEEKS[activeWeek].week}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: COLORS.text }}>{ONBOARDING_WEEKS[activeWeek].title}</div>
          </div>
          <span className={`badge ${weekProgress(activeWeek) === 100 ? "badge-green" : "badge-gold"}`}>{weekProgress(activeWeek)}% Complete</span>
        </div>
        <div className="detail-body">
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Tasks</div>
            {ONBOARDING_WEEKS[activeWeek].tasks.map((task, ti) => {
              const key = `${activeWeek}-${ti}`;
              const done = !!completed[key];
              return (
                <div key={ti} onClick={() => toggleTask(activeWeek, ti)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, border: `1.5px solid ${done ? COLORS.green : COLORS.border}`, background: done ? COLORS.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                    {done && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 14, color: done ? "#94A3B8" : "#1E293B", fontWeight: done ? 400 : 600, textDecoration: done ? "line-through" : "none" }}>{task}</span>
                </div>
              );
            })}
          </div>
          <div style={{ background: "rgba(196,154,60,0.1)", border: `1px solid rgba(196,154,60,0.25)`, borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontSize: 10, color: COLORS.accent, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Week Benchmark</div>
            <div style={{ fontSize: 14, color: "#111827", fontWeight: 600 }}>{ONBOARDING_WEEKS[activeWeek].benchmark}</div>
          </div>
          <div className="progress-track" style={{ marginTop: 16 }}>
            <div className="progress-fill" style={{ width: `${weekProgress(activeWeek)}%` }} />
          </div>
        </div>
      </div>

      <div className="section-label" style={{ marginTop: 28 }}>Full Pathway Overview</div>
      <div className="detail-panel">
        <div className="detail-body" style={{ paddingTop: 8 }}>
          {ONBOARDING_WEEKS.map((w, i) => (
            <div key={i} className="onboard-step">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div className={`step-dot ${weekProgress(i) === 100 ? "complete" : activeWeek === i ? "active" : "upcoming"}`}>
                  {weekProgress(i) === 100 ? "✓" : w.week}
                </div>
                {i < ONBOARDING_WEEKS.length - 1 && <div className="step-line" />}
              </div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: activeWeek === i ? COLORS.accent : COLORS.navy }}>{w.week}: {w.title}</div>
                <div style={{ fontSize: 13, color: "#4A5568", fontWeight: 500 }}>{w.benchmark}</div>
                <div className="progress-track" style={{ marginTop: 8, width: "60%" }}>
                  <div className="progress-fill" style={{ width: `${weekProgress(i)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ScriptureVerse page="onboarding" />
    </div>
  );
};

// ─── COACHING PAGE ────────────────────────────────────────────────────────────

const CoachingPage = () => {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const difficultyColor = (d) => d === "High" ? COLORS.red : d === "Medium" ? COLORS.accent : COLORS.green;
  const difficultyBg    = (d) => d === "High" ? COLORS.redLight : d === "Medium" ? COLORS.accentLight : COLORS.greenLight;

  const openScenario = (s) => { setSelected(s); setRevealed(false); };
  const reset = () => { setSelected(null); setRevealed(false); };
  const nextScenario = () => {
    const idx = SCENARIOS.findIndex(s => s.id === selected.id);
    const next = SCENARIOS[(idx + 1) % SCENARIOS.length];
    setSelected(next);
    setRevealed(false);
  };

  // ── SCENARIO LIST ──
  if (!selected) {
    return (
      <div className="fade-in">
      {/* Photo hero */}
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 24, height: 180 }}>
        <img src="/guitarist.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,12,18,0.97) 0%, rgba(8,12,18,0.5) 55%, rgba(8,12,18,0.15) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 22px 18px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 6 }}>MD Reference</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px", fontFamily: "var(--font-display)" }}>MD Situations</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>Real scenarios. Correct responses. Study until instinct.</div>
        </div>
      </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => openScenario(s)}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "'Inter', sans-serif", boxShadow: COLORS.shadow, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = COLORS.shadowMd; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: COLORS.textDim, textTransform: "uppercase" }}>{s.category}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: difficultyColor(s.difficulty), background: difficultyBg(s.difficulty), padding: "2px 8px", borderRadius: 10 }}>{s.difficulty}</span>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: COLORS.navy, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.prompt}</div>
              </div>
              <span style={{ color: COLORS.textDim, fontSize: 18, flexShrink: 0 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── SCENARIO DETAIL ──
  return (
    <div className="fade-in">
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button className="btn btn-ghost" onClick={reset} style={{ padding: "7px 14px" }}>← Situations</button>
        <span style={{ fontSize: 10, fontWeight: 700, color: difficultyColor(selected.difficulty), background: difficultyBg(selected.difficulty), padding: "3px 10px", borderRadius: 20 }}>{selected.difficulty}</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: COLORS.textDim, textTransform: "uppercase" }}>{selected.category}</span>
      </div>

      {/* Situation card */}
      <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", marginBottom: 16 }}>
        <img src="/hands-keys.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(8,12,18,0.94) 0%, rgba(8,12,18,0.88) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: "26px 28px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.accent, marginBottom: 10 }}>The Situation</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "#fff", lineHeight: 1.2, marginBottom: 14 }}>{selected.title}</div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.78)", lineHeight: 1.75 }}>{selected.prompt}</div>
      </div></div>

      {/* Reveal toggle */}
      {!revealed ? (
        <button onClick={() => setRevealed(true)}
          style={{ width: "100%", padding: "16px", borderRadius: 14, border: `2px dashed ${COLORS.accent}`, background: COLORS.accentLight, color: COLORS.accent, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", marginBottom: 16, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = COLORS.accentSoft; }}
          onMouseLeave={e => { e.currentTarget.style.background = COLORS.accentLight; }}>
          Show the correct response →
        </button>
      ) : (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>

          {/* Call sequence */}
          <div style={{ background: COLORS.navy, borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 14 }}>Ideal Call Sequence</div>
            {selected.callSequence.map((call, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < selected.callSequence.length - 1 ? 10 : 0 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{i + 1}</span>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#F0EBE1", lineHeight: 1.6, paddingTop: 2 }}>{call}</div>
              </div>
            ))}
          </div>

          {/* Why it works */}
          <div style={{ background: COLORS.greenLight, border: `1px solid rgba(30,107,66,0.2)`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.green, marginBottom: 10 }}>Why It Works</div>
            <div style={{ fontSize: 14, color: COLORS.navy, lineHeight: 1.75 }}>{selected.whyItWorks}</div>
          </div>

          {/* Common mistake */}
          <div style={{ background: COLORS.redLight, border: `1px solid rgba(184,48,64,0.2)`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.red, marginBottom: 10 }}>Common Mistake</div>
            <div style={{ fontSize: 14, color: COLORS.navy, lineHeight: 1.75 }}>{selected.commonMistake}</div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="two-col" style={{ gap: 10 }}>
        <button className="btn btn-ghost" onClick={reset} style={{ justifyContent: "center", padding: "13px" }}>
          ← All situations
        </button>
        <button className="btn btn-primary" onClick={nextScenario} style={{ justifyContent: "center", padding: "13px" }}>
          Next situation →
        </button>
      </div>
      <ScriptureVerse page="coaching" />
    </div>
  );
};

// ─── MANUAL PAGE ──────────────────────────────────────────────────────────────

const ManualPage = ({ setSelectedPart, setPage }) => (
  <div className="fade-in">

    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {PARTS_DATA.map((part) => (
        <div key={part.id} className="card" style={{ cursor: "pointer" }}
          onClick={() => { setSelectedPart(part); setPage("part-detail"); }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.borderMid; e.currentTarget.style.boxShadow = COLORS.shadowMd; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; e.currentTarget.style.transform = "translateY(0)"; }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(196,154,60,0.15)", border: `1px solid rgba(196,154,60,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={part.icon} size={20} color={COLORS.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span className="badge badge-gold">Part {part.id}</span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>{part.title}</div>
              <div style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.5, fontWeight: 500 }}>{part.summary}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 8, fontWeight: 600 }}>{part.content.length} questions covered ›</div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <IllustrationMusicStaff />
    <ScriptureVerse page="manual" />
  </div>
);

const PartDetail = ({ part, setPage }) => (
  <div className="fade-in">
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
      <button className="btn btn-ghost" onClick={() => setPage("manual")} style={{ padding: "7px 14px" }}>← Manual</button>
      <span className="badge badge-gold">Part {part.id}</span>
    </div>
    <div className="page-header">
      <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(196,154,60,0.15)", border: `1px solid rgba(196,154,60,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <Icon name={part.icon} size={26} color={COLORS.accent} />
      </div>
      <div className="page-title">{part.title}</div>
      <div className="page-sub">{part.summary}</div>
    </div>
    <div className="detail-panel"><div className="detail-body"><Accordion items={part.content} /></div></div>
  </div>
);

// ─── PILOTS PAGE ──────────────────────────────────────────────────────────────

const PILOTS_API = '/.netlify/functions/pilots-page';

const PilotsPage = ({ setPage, songLibrary, onSaveSong }) => {
  const [view, setView] = useState('browse'); // browse | detail | publish | profile
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const [selectedSong, setSelectedSong] = useState(null);
  const [importing, setImporting] = useState(null);
  const [importedIds, setImportedIds] = useState(new Set());
  const [flagging, setFlagging] = useState(null);
  const [publishSongId, setPublishSongId] = useState(null);
  const [publishDesc, setPublishDesc] = useState('');
  const [publishTags, setPublishTags] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [publishDone, setPublishDone] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  const pcoState = (() => { try { return JSON.parse(localStorage.getItem('wp-pco-connection') || 'null'); } catch { return null; } })();
  const STYLE_TAGS = ['Driving', 'Intimate', 'Building', 'Celebratory', 'Reflective', 'High Energy', 'Acoustic', 'Contemporary', 'Traditional'];
  const TYPE_C = { intro:"#4CAF7D",verse:"#6B9FD4",prechorus:"#A07CC5",chorus:"#C49A3C",bridge:"#CF6679",tag:"#B8720A",outro:"#5A8FA0" };

  const fetchSongs = async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ action: 'browse', search, sort });
      const res = await fetch(`${PILOTS_API}?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setSongs(data.songs || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${PILOTS_API}?action=leaderboard`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch {}
  };

  useEffect(() => { fetchSongs(); fetchLeaderboard(); }, [sort]);

  const handleSearch = (e) => { if (e.key === 'Enter') fetchSongs(); };

  const handleImport = async (song) => {
    if (importedIds.has(song.id)) return;
    setImporting(song.id);
    try {
      // Save to local library
      const newSong = {
        id: mkId(),
        title: song.song_title,
        key: song.key || 'G',
        bpm: song.bpm || 120,
        timeSig: song.time_sig || '4/4',
        sections: (song.sections || []).map(s => ({ ...s, id: mkId() })),
        importedFrom: { pilot: song.wp_users?.display_name, church: song.wp_users?.church_name, communityId: song.id },
      };
      onSaveSong(newSong);
      setImportedIds(prev => new Set([...prev, song.id]));

      // Record import in DB
      if (pcoState?.pcoUserId) {
        await fetch(PILOTS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'import', song_id: song.id, importer_pco_user_id: pcoState.pcoUserId }),
        });
        // Update local display count
        setSongs(prev => prev.map(s => s.id === song.id ? { ...s, import_count: (s.import_count || 0) + 1 } : s));
      }
    } catch {}
    finally { setImporting(null); }
  };

  const handlePublish = async () => {
    if (!pcoState?.pcoUserId || !publishSongId) return;
    const song = songLibrary.find(s => s.id === publishSongId);
    if (!song) return;
    setPublishing(true);
    try {
      // Ensure user exists
      await fetch(PILOTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert_user',
          pco_user_id: pcoState.pcoUserId,
          display_name: pcoState.pcoName || 'Worship MD',
          church_name: pcoState.pcoOrg && pcoState.pcoOrg !== 'My Church' ? pcoState.pcoOrg : 'My Church',
        }),
      });
      // Publish song
      const res = await fetch(PILOTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          pco_user_id: pcoState.pcoUserId,
          song: { ...song, description: publishDesc, styleTags: publishTags },
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setPublishDone(true);
      setTimeout(() => { setView('browse'); setPublishDone(false); setPublishDesc(''); setPublishTags([]); fetchSongs(); }, 2000);
    } catch (e) { setError(e.message); }
    finally { setPublishing(false); }
  };

  const handleFlag = async (songId) => {
    if (!pcoState?.pcoUserId) return;
    setFlagging(songId);
    await fetch(PILOTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'flag', song_id: songId, reporter_pco_user_id: pcoState.pcoUserId, reason: 'Inappropriate content' }),
    }).catch(() => {});
    setFlagging(null);
  };

  // ── PUBLISH VIEW ──
  if (view === 'publish') {
    const publishableSongs = songLibrary.filter(s => s.sections?.length > 0);
    return (
      <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => setView('browse')} className="btn btn-ghost" style={{ padding: '7px 14px' }}>← Back</button>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: COLORS.navy }}>Share to The Pilots Page</div>
        </div>
        {!pcoState ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.navy, marginBottom: 8 }}>Connect PCO to publish</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>Your PCO account becomes your Pilots Page identity — your name and church appear on everything you share.</div>
            <button onClick={() => setPage('services')} className="btn btn-primary">Connect Planning Center →</button>
          </div>
        ) : publishDone ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: COLORS.card, borderRadius: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy }}>Published to The Pilots Page!</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8 }}>Other MDs can now find, use, and import your arrangement.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '14px 16px', background: COLORS.accentLight, borderRadius: 12, border: `1px solid ${COLORS.accentDim}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent, marginBottom: 2 }}>Publishing as</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{pcoState.pcoName || 'Worship MD'} · {pcoState.pcoOrg !== 'My Church' ? pcoState.pcoOrg : 'Your Church'}</div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.textDim, marginBottom: 8 }}>Choose a song from your library</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {publishableSongs.length === 0 ? (
                  <div style={{ fontSize: 13, color: COLORS.textMuted, padding: '12px', textAlign: 'center' }}>No songs with sections yet — build one in Song Builder first.</div>
                ) : publishableSongs.map(s => (
                  <button key={s.id} onClick={() => setPublishSongId(s.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: publishSongId === s.id ? COLORS.accentLight : COLORS.card, border: `1.5px solid ${publishSongId === s.id ? COLORS.accent : COLORS.border}`, borderRadius: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: COLORS.textDim }}>Key of {s.key} · {s.bpm} BPM · {s.sections?.length} sections</div>
                    </div>
                    {publishSongId === s.id && <span style={{ color: COLORS.accent, fontSize: 16 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {publishSongId && (
              <>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.textDim, marginBottom: 6 }}>Description (optional)</div>
                  <textarea value={publishDesc} onChange={e => setPublishDesc(e.target.value)}
                    placeholder="Describe your arrangement — what makes it unique? Extended bridge? Drum break? Works great for altar calls?"
                    rows={3} className="field-input" style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.textDim, marginBottom: 8 }}>Style tags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {STYLE_TAGS.map(tag => (
                      <button key={tag} onClick={() => setPublishTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                        style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${publishTags.includes(tag) ? COLORS.accent : COLORS.border}`, background: publishTags.includes(tag) ? COLORS.accentLight : COLORS.card, color: publishTags.includes(tag) ? COLORS.accent : COLORS.textDim, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handlePublish} disabled={publishing} className="btn btn-primary" style={{ justifyContent: 'center', padding: '14px', fontSize: 14 }}>
                  {publishing ? 'Publishing…' : 'Publish to The Pilots Page →'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── SONG DETAIL VIEW ──
  if (view === 'detail' && selectedSong) {
    const s = selectedSong;
    const alreadyImported = importedIds.has(s.id);
    return (
      <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => { setView('browse'); setSelectedSong(null); }} className="btn btn-ghost" style={{ padding: '7px 14px' }}>← The Pilots Page</button>
        </div>

        {/* Song header */}
        <div style={{ background: COLORS.navy, borderRadius: 20, padding: '24px 22px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -20, width: 160, height: 120, background: 'radial-gradient(ellipse, rgba(62,127,199,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: "var(--font-display)", marginBottom: 4 }}>{s.song_title}</div>
          {s.artist && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>{s.artist}</div>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {s.key && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: COLORS.accentGlow, color: COLORS.accent, border: `1px solid ${COLORS.accentDim}` }}>Key of {s.key}</span>}
            {s.bpm && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>{s.bpm} BPM</span>}
            {s.time_sig && s.time_sig !== '4/4' && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>{s.time_sig}</span>}
            {(s.style_tags || []).map(t => <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>{t}</span>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{(s.wp_users?.display_name || 'MD')[0]}</span>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{s.wp_users?.display_name || 'Unknown MD'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{s.wp_users?.church_name}{s.wp_users?.city ? ` · ${s.wp_users.city}` : ''}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.accent }}>{s.import_count || 0}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>imports</div>
            </div>
          </div>
        </div>

        {/* Description */}
        {s.description && (
          <div style={{ padding: '14px 16px', background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>{s.description}</div>
          </div>
        )}

        {/* Sections */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.textDim, marginBottom: 10 }}>Arrangement</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {(s.sections || []).map((sec, i) => {
            const col = TYPE_C[sec.type] || COLORS.textDim;
            return (
              <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '12px 14px', borderLeft: `4px solid ${col}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: sec.note ? 8 : 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: col, textTransform: 'uppercase', letterSpacing: 1 }}>{sec.label}</span>
                  <span style={{ fontSize: 11, color: COLORS.textDim, marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{sec.bars} bars × {sec.repeatCount}</span>
                </div>
                {sec.note && <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5, borderTop: `1px solid ${COLORS.border}`, paddingTop: 8 }}>{sec.note}</div>}
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => handleImport(s)} disabled={importing === s.id || alreadyImported}
            style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: alreadyImported ? COLORS.green : COLORS.accent, color: '#fff', fontSize: 14, fontWeight: 700, cursor: alreadyImported ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' }}>
            {importing === s.id ? 'Importing…' : alreadyImported ? '✓ In Your Library' : '↓ Import to Library'}
          </button>
          <button onClick={() => handleFlag(s.id)} disabled={flagging === s.id}
            style={{ padding: '13px 16px', borderRadius: 12, border: `1px solid ${COLORS.border}`, background: COLORS.card, color: COLORS.textDim, fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            {flagging === s.id ? '…' : '🚩'}
          </button>
        </div>
      </div>
    );
  }

  // ── BROWSE VIEW ──
  return (
    <div className="fade-in">
      {/* Photo hero */}
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 24, height: 200 }}>
        <img src="/band-together.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,12,18,0.97) 0%, rgba(8,12,18,0.5) 55%, rgba(8,12,18,0.1) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 22px 18px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 6 }}>Community</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px", fontFamily: "var(--font-display)" }}>The Pilots Page</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>Song arrangements by MDs, for MDs.</div>
        </div>
      </div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
          <div style={{ display: "none" }}>
          <button onClick={() => setView('publish')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 11, border: 'none', background: COLORS.accentGradient, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", flexShrink: 0, boxShadow: COLORS.shadowAccent }}>
            <span style={{ fontSize: 16 }}>↑</span> Share an Arrangement
          </button>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: COLORS.textDim }}><span style={{ fontWeight: 700, color: COLORS.navy }}>{songs.length}</span> arrangements</div>
          <div style={{ fontSize: 12, color: COLORS.textDim }}><span style={{ fontWeight: 700, color: COLORS.navy }}>{songs.reduce((a, s) => a + (s.import_count || 0), 0)}</span> total imports</div>
        </div>

        {/* Search + sort */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch}
            placeholder="Search by song title… (press Enter)"
            className="field-input" style={{ flex: 1 }} />
          <select value={sort} onChange={e => setSort(e.target.value)} className="field-input" style={{ width: 'auto', flexShrink: 0 }}>
            <option value="popular">Most imported</option>
            <option value="recent">Most recent</option>
          </select>
        </div>
      </div>

      {/* Song cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.textDim }}>Loading arrangements…</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ color: COLORS.red, marginBottom: 12, fontSize: 13 }}>{error}</div>
          <button onClick={fetchSongs} className="btn btn-ghost">Try again</button>
        </div>
      ) : songs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: COLORS.card, borderRadius: 20, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✈️</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: COLORS.navy, marginBottom: 8 }}>Be the first Pilot.</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20, maxWidth: 300, margin: '0 auto 20px' }}>No arrangements here yet. Share yours and start the community.</div>
          <button onClick={() => setView('publish')} className="btn btn-primary">Share an Arrangement →</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {songs.map(song => {
            const alreadyImported = importedIds.has(song.id);
            return (
              <div key={song.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: '16px 16px', boxShadow: COLORS.shadow, transition: 'all 0.15s', cursor: 'pointer' }}
                onClick={() => { setSelectedSong(song); setView('detail'); }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.borderMid; e.currentTarget.style.boxShadow = COLORS.shadowMd; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; e.currentTarget.style.transform = 'translateY(0)'; }}>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, fontFamily: "var(--font-display)", marginBottom: 2 }}>{song.song_title}</div>
                    {song.artist && <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 6 }}>{song.artist}</div>}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {song.key && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: COLORS.accentLight, color: COLORS.accent, border: `1px solid ${COLORS.accentDim}` }}>Key of {song.key}</span>}
                      {song.bpm && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: COLORS.surfaceAlt, color: COLORS.textDim }}>{song.bpm} BPM</span>}
                      {song.time_sig && song.time_sig !== '4/4' && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: COLORS.surfaceAlt, color: COLORS.textDim }}>{song.time_sig}</span>}
                      {(song.style_tags || []).slice(0, 2).map(t => <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: COLORS.surfaceAlt, color: COLORS.textDim }}>{t}</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.accent, lineHeight: 1 }}>{song.import_count || 0}</div>
                    <div style={{ fontSize: 9, color: COLORS.textDim, fontWeight: 600, letterSpacing: 0.5 }}>imports</div>
                  </div>
                </div>

                {/* MD notes preview */}
                {song.md_notes_preview && (
                  <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5, padding: '8px 10px', background: COLORS.surfaceAlt, borderRadius: 8, marginBottom: 10, borderLeft: `3px solid ${COLORS.accent}` }}>
                    {song.md_notes_preview}
                  </div>
                )}

                {/* Section flow bar */}
                {(song.sections || []).length > 0 && (
                  <div style={{ display: 'flex', gap: 2, height: 4, borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                    {song.sections.map((sec, i) => (
                      <div key={i} style={{ flex: (sec.bars || 8) * (sec.repeatCount || 1), background: TYPE_C[sec.type] || COLORS.textDim, minWidth: 3 }} />
                    ))}
                  </div>
                )}

                {/* Contributor + import */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: COLORS.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>{(song.wp_users?.display_name || 'M')[0]}</span>
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textDim }}>
                      <span style={{ fontWeight: 600, color: COLORS.navy }}>{song.wp_users?.display_name || 'Unknown MD'}</span>
                      {song.wp_users?.church_name && <span> · {song.wp_users.church_name}</span>}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleImport(song); }}
                    disabled={importing === song.id || alreadyImported}
                    style={{ padding: '6px 14px', borderRadius: 9, border: `1px solid ${alreadyImported ? COLORS.green : COLORS.accent}`, background: alreadyImported ? COLORS.greenLight : COLORS.accentLight, color: alreadyImported ? COLORS.green : COLORS.accent, fontSize: 11, fontWeight: 700, cursor: alreadyImported ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif", flexShrink: 0, transition: 'all 0.15s' }}>
                    {importing === song.id ? '…' : alreadyImported ? '✓ Imported' : '↓ Import'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: COLORS.textDim, marginBottom: 12 }}>Top Contributors</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {leaderboard.map((u, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? COLORS.accent : i === 1 ? COLORS.borderMid : COLORS.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: i < 2 ? '#fff' : COLORS.textDim }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{u.display_name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textDim }}>{u.church_name}{u.city ? ` · ${u.city}` : ''}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.accent }}>{u.import_count || 0}</div>
                  <div style={{ fontSize: 9, color: COLORS.textDim }}>imports</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ScriptureVerse page="coaching" />
    </div>
  );
};

// ─── ROADMAP PAGE ─────────────────────────────────────────────────────────────

const RoadmapPage = ({ setPage }) => {
  const phases = [
    { num: 1, title: "Foundation", timing: "Weeks 1–2", color: COLORS.accent, items: ["Align on weekly planning conversation format", "Introduce the 10-Minute Huddle", "Begin using standardized vocabulary in rehearsal", "Test two-way talkback communication", "Success: Band recognizes and responds to standard cues consistently"] },
    { num: 2, title: "Tools & Training", timing: "Weeks 3–6", color: COLORS.blue, items: ["Roll out PCO MD Notes template", "Implement 90-min rehearsal blueprint", "Begin training first backup MD through the 5-week incubator", "Add post-service micro-debrief", "Success: Backup MD can lead first 2–3 songs with confidence"] },
    { num: 3, title: "Advanced Systems", timing: "Weeks 7–12", color: COLORS.green, items: ["Practice spontaneous moment framework in rehearsal", "Complete Playback technical mastery", "Implement MC Groove / The Jam", "Roll out IEM mix training system-wide", "Success: Team navigates spontaneous worship seamlessly"] },
    { num: 4, title: "Scale & Refine", timing: "Ongoing", color: "#7B68C8", items: ["Train second backup MD", "Quarterly macro-review with WL and team leads", "Document learnings and version updates", "Share system with other campuses or churches as needed", "Success: Three trained MDs rotating independently"] },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-eyebrow">Implementation</div>
        <div className="page-title" style={{ color: COLORS.text }}>Rollout Roadmap</div>
        <div className="page-sub">Four phases. Start at the foundation — don't skip ahead.</div>
      </div>
      <div className="detail-panel">
        <div className="detail-body" style={{ paddingTop: 4 }}>
          {phases.map((p, i) => (
            <div key={i} className="roadmap-phase">
              <div className="phase-number" style={{ background: `${p.color}12`, border: `1.5px solid ${p.color}40`, color: p.color }}>{p.num}</div>
              <div className="phase-content">
                <div className="phase-title">{p.title}</div>
                <div className="phase-timing">{p.timing}</div>
                <div className="phase-items">
                  {p.items.map((item, j) => (
                    <div key={j} style={{ color: item.startsWith("Success") ? COLORS.accent : "#374151", fontWeight: item.startsWith("Success") ? 600 : 400 }}>
                      {item.startsWith("Success") ? "✓ " : "· "}{item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 24, padding: "20px 22px", background: COLORS.navy, borderRadius: 16, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Start with the training modules.</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16 }}>The roadmap follows.</div>
        <button onClick={() => setPage("training")} className="btn btn-primary">Begin MD Training →</button>
      </div>
    </div>
  );
};

const SECTION_TYPES = ["intro","verse","prechorus","chorus","bridge","tag","outro","turnaround","instrumental","breakdown","vamp"];

const TYPE_COLORS = {
  intro: "#4CAF7D", verse: "#6B9FD4", prechorus: "#A07CC5",
  chorus: "#C49A3C", bridge: "#CF6679", tag: "#B8720A",
  outro: "#5A8FA0", turnaround: "#8A9B6A", instrumental: "#4A8AAA",
  breakdown: "#9A6AAA", vamp: "#6A9A6A",
};

const mkSection = (type, index) => ({
  id: `s-${Date.now()}-${index}`, type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
  bars: DEFAULT_BARS_BY_TYPE[type] || 8, repeatCount: 1,
  note: "", headsUp: "", headsUpBarsBefore: 2,
});

const SectionRow = ({ section, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const color = TYPE_COLORS[section.type] || COLORS.textDim;

  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, marginBottom: 8, overflow: "hidden", boxShadow: COLORS.shadow }}>

      {/* Row 1: color pip + label + expand + delete */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px 8px 14px" }}>
        <div style={{ width: 4, alignSelf: "stretch", borderRadius: 4, background: color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{section.label}</div>
          <div style={{ fontSize: 10, color, marginTop: 2, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{section.type}</div>
        </div>
        <button onClick={() => setExpanded(e => !e)}
          style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${expanded ? COLORS.accent : COLORS.border}`, background: expanded ? COLORS.accentLight : COLORS.surfaceAlt, color: expanded ? COLORS.accent : COLORS.textDim, fontSize: 11, cursor: "pointer", flexShrink: 0 }}>
          {expanded ? "▲" : "▼"}
        </button>
        <button onClick={onDelete}
          style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid rgba(192,57,74,0.2)`, background: COLORS.redLight, color: COLORS.red, fontSize: 14, cursor: "pointer", flexShrink: 0 }}>✕</button>
      </div>

      {/* Row 2: all controls on one clean line */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 14px 12px 18px", gap: 6 }}>

        {/* Bars */}
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <button onClick={() => onChange({ ...section, bars: Math.max(1, section.bars - 2) })}
            style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>−</button>
          <div style={{ minWidth: 32, textAlign: "center", fontSize: 15, fontWeight: 700, color: COLORS.navy, fontFamily: "'JetBrains Mono', monospace" }}>{section.bars}</div>
          <button onClick={() => onChange({ ...section, bars: section.bars + 2 })}
            style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>+</button>
        </div>
        <div style={{ fontSize: 10, color: COLORS.textDim, marginRight: 4 }}>bars</div>

        {/* Thin divider */}
        <div style={{ width: 1, height: 18, background: COLORS.border, flexShrink: 0 }} />

        {/* Repeat */}
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <button onClick={() => onChange({ ...section, repeatCount: Math.max(1, section.repeatCount - 1) })}
            style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 15, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>−</button>
          <div style={{ minWidth: 28, textAlign: "center", fontSize: 13, fontWeight: 700, color: COLORS.accent, fontFamily: "'JetBrains Mono', monospace" }}>×{section.repeatCount}</div>
          <button onClick={() => onChange({ ...section, repeatCount: section.repeatCount + 1 })}
            style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 15, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>+</button>
        </div>

        {/* Reorder — right side */}
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          <button onClick={onMoveUp} disabled={isFirst}
            style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 12, cursor: isFirst ? "default" : "pointer", opacity: isFirst ? 0.25 : 1 }}>↑</button>
          <button onClick={onMoveDown} disabled={isLast}
            style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 12, cursor: isLast ? "default" : "pointer", opacity: isLast ? 0.25 : 1 }}>↓</button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt }}>
          <div style={{ marginTop: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 6 }}>Quick Bar Presets</div>
            <div style={{ display: "flex", gap: 5 }}>
              {[2, 4, 8, 12, 16].map(n => (
                <button key={n} onClick={() => onChange({ ...section, bars: n })}
                  style={{ padding: "5px 11px", borderRadius: 7, border: `1px solid ${section.bars === n ? COLORS.accent : COLORS.border}`, background: section.bars === n ? COLORS.accentLight : COLORS.surface, color: section.bars === n ? COLORS.accent : COLORS.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 4 }}>Label</div>
            <input value={section.label} onChange={e => onChange({ ...section, label: e.target.value })} className="field-input" />
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 4 }}>MD Note (Current Cue in Live Mode)</div>
            <input value={section.note} onChange={e => onChange({ ...section, note: e.target.value })} placeholder="e.g. Full band — lift and lock" className="field-input" />
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 4 }}>Heads Up (shown before next section)</div>
            <input value={section.headsUp} onChange={e => onChange({ ...section, headsUp: e.target.value })} placeholder="e.g. Chorus coming — get ready" className="field-input" />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 6 }}>Cue Early (bars before end)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => onChange({ ...section, headsUpBarsBefore: Math.max(1, (section.headsUpBarsBefore ?? 2) - 1) })}
                style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.surface, color: COLORS.textMuted, fontSize: 14, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>−</button>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.accent, minWidth: 24, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>{section.headsUpBarsBefore ?? 2}</div>
              <button onClick={() => onChange({ ...section, headsUpBarsBefore: Math.min(section.bars, (section.headsUpBarsBefore ?? 2) + 1) })}
                style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.surface, color: COLORS.textMuted, fontSize: 14, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>+</button>
              <div style={{ display: "flex", gap: 5 }}>
                {[1, 2, 4].map(n => (
                  <button key={n} onClick={() => onChange({ ...section, headsUpBarsBefore: n })}
                    style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${(section.headsUpBarsBefore ?? 2) === n ? COLORS.accent : COLORS.border}`, background: (section.headsUpBarsBefore ?? 2) === n ? COLORS.accentLight : COLORS.surface, color: (section.headsUpBarsBefore ?? 2) === n ? COLORS.accent : COLORS.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SongBuilderPage = ({ songLibrary, onSaveSong, onDuplicateSong, editSongId, setPage, navigateTo }) => {
  const editing = editSongId ? songLibrary.find(s => s.id === editSongId) : null;
  const [songTitle, setSongTitle] = useState(editing?.title || "New Song");
  const [songKey, setSongKey] = useState(editing?.key || "G");
  const [songBpm, setSongBpm] = useState(editing?.bpm || 72);
  const [songTimeSig, setSongTimeSig] = useState(editing?.timeSig || '4/4');
  const [sections, setSections] = useState(editing?.sections || [mkSection("intro",0),mkSection("verse",1),mkSection("chorus",2),mkSection("verse",3),mkSection("chorus",4),mkSection("bridge",5),mkSection("chorus",6),mkSection("outro",7)]);
  const [addType, setAddType] = useState("verse");
  const [saved, setSaved] = useState(false);

  const updateSection = (id, updated) => setSections(ss => ss.map(s => s.id === id ? updated : s));
  const deleteSection = (id) => setSections(ss => ss.filter(s => s.id !== id));
  const moveUp = (i) => { if (i === 0) return; const s = [...sections]; [s[i-1],s[i]]=[s[i],s[i-1]]; setSections(s); };
  const moveDown = (i) => { if (i === sections.length-1) return; const s=[...sections]; [s[i],s[i+1]]=[s[i+1],s[i]]; setSections(s); };
  const addSection = () => setSections(ss => [...ss, mkSection(addType, ss.length)]);
  const totalBars = sections.reduce((acc, s) => acc + s.bars * s.repeatCount, 0);
  const KEYS = ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];

  const handleSave = () => {
    const song = { id: editing?.id || mkId(), title: songTitle || "Untitled Song", key: songKey, bpm: songBpm, timeSig: songTimeSig, sections };
    onSaveSong(song);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fade-in">
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 24, height: 180 }}>
        <img src="/guitar-neck.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,12,18,0.97) 0%, rgba(8,12,18,0.5) 55%, rgba(8,12,18,0.1) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 22px 18px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 6 }}>Song Builder</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px", fontFamily: "var(--font-display)" }}>{editing ? "Edit Song" : "New Song"}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>Build song structures for Live Mode.</div>
        </div>
      </div>

      {songLibrary.length > 0 && (
        <>
          <div className="section-label">Song Library</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
            {songLibrary.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: COLORS.card, border: `1px solid ${s.id === editSongId ? COLORS.accent : COLORS.border}`, borderRadius: 12, boxShadow: COLORS.shadow }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: COLORS.textDim }}>Key of {s.key} · {s.bpm} BPM{s.timeSig && s.timeSig !== "4/4" ? ` · ${s.timeSig}` : ""} · {s.sections.length} sections</div>
                </div>
                <button onClick={() => onDuplicateSong && onDuplicateSong(s)} className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }}>Copy</button>
                <button onClick={() => setPage && setPage("builder", s.id)} className="btn btn-primary" style={{ padding: "5px 14px", fontSize: 12 }}>Edit</button>
              </div>
            ))}
          </div>
          <button onClick={() => setPage && setPage("builder", null)} className="btn btn-ghost" style={{ width: "100%", marginBottom: 24, justifyContent: "center" }}>+ Create New Song</button>
        </>
      )}

      {/* Song Meta */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 5 }}>Song Title</div>
            <input value={songTitle} onChange={e => setSongTitle(e.target.value)} className="field-input" />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 5 }}>Key</div>
            <select value={songKey} onChange={e => setSongKey(e.target.value)} className="field-input" style={{ width: "auto" }}>
              {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 5 }}>BPM</div>
            <input type="number" value={songBpm} onChange={e => setSongBpm(Number(e.target.value))} min={40} max={220} className="field-input" style={{ width: 72 }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 5 }}>Time Sig</div>
            <select value={songTimeSig} onChange={e => setSongTimeSig(e.target.value)} className="field-input" style={{ width: "auto" }}>
              <option value="4/4">4/4</option>
              <option value="6/8">6/8</option>
              <option value="3/4">3/4</option>
              <option value="2/4">2/4</option>
              <option value="12/8">12/8</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}><span style={{ fontWeight: 700, color: COLORS.accent }}>{sections.length}</span> sections</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}><span style={{ fontWeight: 700, color: COLORS.accent }}>{totalBars}</span> total bars</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}><span style={{ fontWeight: 700, color: COLORS.accent }}>{Math.round((totalBars / songBpm) * (songTimeSig === "6/8" || songTimeSig === "12/8" ? 6 : songTimeSig === "3/4" ? 3 : songTimeSig === "2/4" ? 2 : 4) * 10) / 10}</span> min est.</div>
        </div>
      </div>

      {/* Visual flow bar */}
      <div style={{ display: "flex", gap: 3, marginBottom: 16, height: 8, borderRadius: 8, overflow: "hidden" }}>
        {sections.map(s => (
          <div key={s.id} style={{ flex: s.bars * s.repeatCount, background: TYPE_COLORS[s.type] || COLORS.textDim, minWidth: 4, transition: "flex 0.3s ease", borderRadius: 2 }} />
        ))}
      </div>

      <div className="section-label">Sections</div>
      {sections.map((s, i) => (
        <SectionRow key={s.id} section={s}
          onChange={updated => updateSection(s.id, updated)}
          onDelete={() => deleteSection(s.id)}
          onMoveUp={() => moveUp(i)} onMoveDown={() => moveDown(i)}
          isFirst={i === 0} isLast={i === sections.length - 1} />
      ))}

      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "14px 16px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, marginBottom: 16, boxShadow: COLORS.shadow }}>
        <select value={addType} onChange={e => setAddType(e.target.value)} className="field-input" style={{ flex: 1 }}>
          {SECTION_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} ({DEFAULT_BARS_BY_TYPE[t]} bars)</option>)}
        </select>
        <button onClick={addSection} className="btn btn-primary">+ Add</button>
      </div>

      {saved && (
        <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", background: COLORS.greenLight, border: `1px solid rgba(30,107,66,0.25)`, borderRadius: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 16, color: COLORS.green }}>✓</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.green }}>Song saved to library</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>"{songTitle}" is ready to use in Service Builder and Live Mode</div>
          </div>
        </div>
      )}

      <button onClick={handleSave}
        style={{ width: "100%", padding: "14px", borderRadius: 12, border: `1px solid ${saved ? COLORS.green : COLORS.accent}`, background: saved ? COLORS.green : COLORS.accentLight, color: saved ? "#fff" : COLORS.accent, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.3s" }}>
        {saved ? "✓ Saved" : editing ? "Save Changes" : "Save to Song Library"}
      </button>
      {saved && (
        <button onClick={() => { if (navigateTo) navigateTo("pilots"); }}
          style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${COLORS.border}`, background: COLORS.card, color: COLORS.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", marginTop: 8, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.color = COLORS.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textMuted; }}>
          ✈️ Share on The Pilots Page
        </button>
      )}
      <ScriptureVerse page="builder" />
    </div>
  );
};

// ─── SERVICE BUILDER ──────────────────────────────────────────────────────────

// ─── SERVICE BUILDER + MD NOTES ───────────────────────────────────────────────

const MOMENT_TYPES = ["Speaking Moment","Welcome","Baptism","Child Dedication","Altar Call","Offering","Communion","Announcement","Custom"];
const JAM_PROGRESSIONS = {
  C:  "1, 1/3, 4… 4, 5, 6m… 1, 1/3, 4… 2m, 1, 5 (C, C/E, F… F, G, Am… Dm, C, G)",
  Db: "1, 4, 6m, 5 (Db, Gb, Bbm, Ab)",
  D:  "1, 1/3, 4, 5 (D, D/F#, G, A)",
  Eb: "1, 4, 6m, 5 (Eb, Ab, Cm, Bb)",
  E:  "1, 4, 1, 5 (E, A, E, B)",
  F:  "6m, 1/3, 4… 4, 5, 1 (Dm, F/A, Bb… Bb, C, F)",
  "F#": "1, 4, 6m, 5 (F#, B, D#m, C#)",
  G:  "1, 4, 6m, 5 (G, C, Em, D)",
  Ab: "1, 4, 6m, 5 (Ab, Db, Fm, Eb)",
  A:  "1, 4, 6m, 5 (A, D, F#m, E)",
  Bb: "1, 4, 6m, 5 (Bb, Eb, Gm, F)",
  B:  "1, 4, 6m, 5 (B, E, G#m, F#)",
};
const KEYS = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];

const mkBlock = (type, extra = {}) => ({
  id: mkId(),
  type,
  notes: { arrangement: "", chords: "", dynamics: "", special: "" },
  ...extra,
});

// Derive songIds from blocks for Live Mode backward compat
const blockSongIds = (blocks) => blocks.filter(b => b.type === "song").map(b => b.songId).filter(Boolean);

// Upgrade legacy service (songIds only) to blocks format
const upgradeService = (svc, songLibrary) => {
  if (svc.blocks) return svc;
  const blocks = [];
  (svc.songIds || []).forEach((songId, i) => {
    if (i > 0) blocks.push(mkBlock("transition"));
    blocks.push(mkBlock("song", { songId }));
  });
  return { ...svc, blocks, songIds: svc.songIds || [] };
};

// Notes panel — shared by all block types
const NotesPanel = ({ notes = {}, onChange, placeholder = {} }) => {
  const fields = [
    { key: "arrangement", label: "Arrangement", ph: placeholder.arrangement || "e.g. AS IS / Extended bridge / Skip intro loop…" },
    { key: "chords", label: "Chord Progressions", ph: placeholder.chords || "e.g. 1, 4, 1/3, 5 (E, A, E/G#, B) — bass plays the G#" },
    { key: "dynamics", label: "Dynamics", ph: placeholder.dynamics || "e.g. First chorus low, second building, third full groove…" },
    { key: "special", label: "Special Moments & Cues", ph: placeholder.special || "e.g. WL will signal when to fire, loop bridge if needed, watch for…" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 16px", background: COLORS.bg, borderRadius: "0 0 14px 14px", borderTop: `1px solid ${COLORS.border}` }}>
      {fields.map(({ key, label, ph }) => (
        <div key={key}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 4 }}>{label}</div>
          <textarea
            value={notes[key] || ""}
            onChange={e => onChange({ ...notes, [key]: e.target.value })}
            placeholder={ph}
            rows={2}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.card, color: COLORS.text, fontSize: 12, fontFamily: "'Inter', sans-serif", lineHeight: 1.5, resize: "vertical", outline: "none", boxSizing: "border-box" }}
          />
        </div>
      ))}
    </div>
  );
};

// Individual block renderers
const SongBlock = ({ block, index, song, songLibrary, onSaveSong, onNotesChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast, total }) => {
  const [open, setOpen] = useState(false);
  const [savedToLib, setSavedToLib] = useState(false);
  const hasNotes = Object.values(block.notes || {}).some(v => v?.trim());
  const isPcoOnly = !song && block.pcoTitle;

  const handleAddToLibrary = () => {
    if (!isPcoOnly || !onSaveSong) return;
    const newSong = {
      id: mkId(),
      title: block.pcoTitle,
      key: block.pcoKey || "G",
      bpm: block.pcoBpm || 120,
      sections: (block.pcoSections || []).length > 0
        ? block.pcoSections.map((sec, i) => ({
            id: mkId(), type: sec.type || "verse",
            label: sec.label || sec.type || "Section",
            bars: sec.bars || DEFAULT_BARS_BY_TYPE[sec.type] || 8,
            repeatCount: 1, note: "", headsUp: "", headsUpBarsBefore: 2,
          }))
        : [
            { id: mkId(), type: "intro",  label: "Intro",   bars: 8,  repeatCount: 1, note: "", headsUp: "", headsUpBarsBefore: 2 },
            { id: mkId(), type: "verse",  label: "Verse 1", bars: 16, repeatCount: 1, note: "", headsUp: "", headsUpBarsBefore: 2 },
            { id: mkId(), type: "chorus", label: "Chorus",  bars: 16, repeatCount: 1, note: "", headsUp: "", headsUpBarsBefore: 2 },
            { id: mkId(), type: "verse",  label: "Verse 2", bars: 16, repeatCount: 1, note: "", headsUp: "", headsUpBarsBefore: 2 },
            { id: mkId(), type: "chorus", label: "Chorus",  bars: 16, repeatCount: 1, note: "", headsUp: "", headsUpBarsBefore: 2 },
            { id: mkId(), type: "bridge", label: "Bridge",  bars: 8,  repeatCount: 1, note: "", headsUp: "", headsUpBarsBefore: 2 },
            { id: mkId(), type: "chorus", label: "Final Chorus", bars: 16, repeatCount: 1, note: "", headsUp: "", headsUpBarsBefore: 2 },
          ],
    };
    onSaveSong(newSong);
    setSavedToLib(true);
    setTimeout(() => setSavedToLib(false), 2500);
  };

  return (
    <div style={{ borderRadius: 14, border: `1px solid ${isPcoOnly ? COLORS.borderMid : COLORS.border}`, background: COLORS.card, boxShadow: COLORS.shadow, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{index + 1}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, fontFamily: "var(--font-display)" }}>{song?.title || block.pcoTitle || "Unknown Song"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {song ? (
              <span style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>Key of {song.key} · {song.bpm} BPM</span>
            ) : block.pcoKey ? (
              <>
                <span style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>Key of {block.pcoKey}</span>
                <span style={{ fontSize: 10, color: COLORS.textDim }}>·</span>
                <input
                  type="number"
                  defaultValue={block.pcoBpm || 120}
                  onBlur={e => { const bpm = parseInt(e.target.value) || 120; onNotesChange({ ...block.notes, _pcoBpm: bpm }); }}
                  onClick={e => e.stopPropagation()}
                  style={{ width: 52, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: COLORS.accent, background: COLORS.accentLight, border: `1px solid ${COLORS.accentDim}`, borderRadius: 5, padding: "1px 5px", textAlign: "center", outline: "none" }}
                />
                <span style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>BPM · from PCO</span>
              </>
            ) : null}
            {hasNotes && <span style={{ fontSize: 11, marginLeft: 4, color: COLORS.accent }}>● notes</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {isPcoOnly && (
            <button onClick={handleAddToLibrary}
              style={{ padding: "4px 9px", borderRadius: 8, border: `1px solid ${savedToLib ? COLORS.green : COLORS.accentDim}`, background: savedToLib ? COLORS.greenLight : COLORS.accentLight, color: savedToLib ? COLORS.green : COLORS.accent, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>
              {savedToLib ? "✓ Saved" : "+ Library"}
            </button>
          )}
          <button onClick={() => onMoveUp()} disabled={isFirst} style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 11, cursor: isFirst ? "default" : "pointer", opacity: isFirst ? 0.3 : 1 }}>↑</button>
          <button onClick={() => onMoveDown()} disabled={isLast} style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 11, cursor: isLast ? "default" : "pointer", opacity: isLast ? 0.3 : 1 }}>↓</button>
          <button onClick={() => setOpen(o => !o)} style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${open ? COLORS.accent : COLORS.border}`, background: open ? COLORS.accentLight : COLORS.surfaceAlt, color: open ? COLORS.accent : COLORS.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
            {open ? "Done" : "Notes"}
          </button>
          <button onClick={() => onRemove()} style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid rgba(192,57,74,0.2)`, background: COLORS.redLight, color: COLORS.red, fontSize: 12, cursor: "pointer" }}>✕</button>
        </div>
      </div>
      {open && <NotesPanel notes={block.notes} onChange={onNotesChange} />}
    </div>
  );
};

const TransitionBlock = ({ block, onNotesChange, onRemove }) => {
  const [open, setOpen] = useState(false);
  const hasNotes = Object.values(block.notes || {}).some(v => v?.trim());
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, borderRadius: 10, border: `1px dashed ${hasNotes ? COLORS.accent : COLORS.border}`, background: hasNotes ? COLORS.accentLight : "transparent", overflow: "hidden" }}>
        <button onClick={() => setOpen(o => !o)} style={{ width: "100%", padding: "8px 14px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
          <div style={{ flex: 1, height: 1, background: hasNotes ? COLORS.accent : COLORS.border, opacity: 0.4 }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: hasNotes ? COLORS.accent : COLORS.textDim, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>
            {hasNotes ? "● Transition" : "+ Transition notes"}
          </span>
          <div style={{ flex: 1, height: 1, background: hasNotes ? COLORS.accent : COLORS.border, opacity: 0.4 }} />
        </button>
        {open && <NotesPanel notes={block.notes} onChange={onNotesChange}
          placeholder={{ arrangement: "e.g. Big crash on the 1, fade out…", chords: "e.g. Bridge chord D→G: play D (5 of G) → C → G", dynamics: "e.g. Cymbal swells, keys vamp on 1", special: "e.g. Silence before next track fires, WL speaks" }} />}
      </div>
      <button onClick={() => { if (!open) onRemove(); }} title="Remove transition" style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textDim, fontSize: 11, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
    </div>
  );
};

const MomentBlock = ({ block, onUpdate, onNotesChange, onRemove }) => {
  const [open, setOpen] = useState(false);
  const hasNotes = Object.values(block.notes || {}).some(v => v?.trim());
  const label = block.momentType || "Moment";
  const customLabel = block.customLabel || "";
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${COLORS.borderMid}`, background: COLORS.card, boxShadow: COLORS.shadow, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: "#4A7090", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 9, color: "#fff" }}>M</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <select value={block.momentType || "Speaking Moment"} onChange={e => onUpdate({ ...block, momentType: e.target.value })}
            style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, background: "transparent", border: "none", outline: "none", cursor: "pointer", fontFamily: "var(--font-display)", width: "100%", padding: 0 }}>
            {MOMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {block.momentType === "Custom" && (
            <input value={customLabel} onChange={e => onUpdate({ ...block, customLabel: e.target.value })} placeholder="Custom label…"
              style={{ fontSize: 11, color: COLORS.textMuted, background: "transparent", border: "none", outline: "none", width: "100%", fontFamily: "'Inter', sans-serif", marginTop: 2 }} />
          )}
          {hasNotes && <div style={{ fontSize: 10, color: COLORS.accent }}>● notes added</div>}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setOpen(o => !o)} style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${open ? "#4A7090" : COLORS.border}`, background: open ? "#EAF0F5" : COLORS.surfaceAlt, color: open ? "#4A7090" : COLORS.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
            {open ? "Done" : "Notes"}
          </button>
          <button onClick={onRemove} style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid rgba(192,57,74,0.2)`, background: COLORS.redLight, color: COLORS.red, fontSize: 12, cursor: "pointer" }}>✕</button>
        </div>
      </div>
      {open && <NotesPanel notes={block.notes} onChange={onNotesChange}
        placeholder={{ arrangement: "e.g. Click off, keys hold progression…", chords: "e.g. Hold on 1 (E), welcome progression: 1, 4, 1/3, 5", dynamics: "e.g. Keys only, very soft, space for speaker", special: "e.g. 8-count beat before returning to verse" }} />}
    </div>
  );
};

const JamBlock = ({ block, onUpdate, onNotesChange, onRemove }) => {
  const [open, setOpen] = useState(false);
  const key = block.jamKey || "G";
  const bpm = block.jamBpm || 96;
  const defaultProg = JAM_PROGRESSIONS[key] || "1, 4, 6m, 5";
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${COLORS.accent}`, background: COLORS.accentLight, boxShadow: COLORS.shadow, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
        <div style={{ fontSize: 16 }}>🍓</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent, fontFamily: "var(--font-display)" }}>MC Groove / The Jam</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
            <select value={key} onChange={e => onUpdate({ ...block, jamKey: e.target.value, jamProgression: "" })}
              style={{ fontSize: 11, fontWeight: 700, color: COLORS.navy, background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "2px 6px", fontFamily: "'JetBrains Mono', monospace" }}>
              {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>Key</span>
            <input type="number" value={bpm} min={60} max={140} onChange={e => onUpdate({ ...block, jamBpm: Number(e.target.value) })}
              style={{ width: 52, fontSize: 11, fontWeight: 700, color: COLORS.navy, background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "2px 6px", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }} />
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>BPM</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setOpen(o => !o)} style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${open ? COLORS.accent : COLORS.border}`, background: open ? COLORS.accentLight : COLORS.card, color: open ? COLORS.accent : COLORS.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
            {open ? "Done" : "Notes"}
          </button>
          <button onClick={onRemove} style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid rgba(192,57,74,0.2)`, background: COLORS.redLight, color: COLORS.red, fontSize: 12, cursor: "pointer" }}>✕</button>
        </div>
      </div>
      {/* Progression preview */}
      <div style={{ padding: "0 14px 10px 14px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 3 }}>Progression</div>
        <input value={block.jamProgression || defaultProg} onChange={e => onUpdate({ ...block, jamProgression: e.target.value })}
          style={{ width: "100%", fontSize: 11, color: COLORS.navy, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "6px 10px", fontFamily: "'JetBrains Mono', monospace", boxSizing: "border-box" }} />
      </div>
      {open && <NotesPanel notes={block.notes} onChange={onNotesChange}
        placeholder={{ arrangement: "e.g. Groove continues through announcements / meet and greet", chords: "", dynamics: "e.g. Full groove during meet and greet, pull back when speaker resumes", special: "e.g. Stand by to simplify, WL will signal when to end" }} />}
    </div>
  );
};

// Format all notes as clean plain text for clipboard
const formatNotesForSend = (blocks, songLibrary, serviceTitle) => {
  const lines = [`MD NOTES — ${serviceTitle.toUpperCase()}`, ""];
  blocks.forEach((block, i) => {
    if (block.type === "song") {
      const song = songLibrary.find(s => s.id === block.songId);
      const title = song ? `${song.title.toUpperCase()} (${song.key})` : "SONG";
      lines.push(`${"─".repeat(40)}`);
      lines.push(title);
      const n = block.notes || {};
      if (n.arrangement?.trim()) lines.push(`Arrangement: ${n.arrangement.trim()}`);
      if (n.chords?.trim()) lines.push(`Chords: ${n.chords.trim()}`);
      if (n.dynamics?.trim()) lines.push(`Dynamics: ${n.dynamics.trim()}`);
      if (n.special?.trim()) lines.push(`Cues: ${n.special.trim()}`);
      lines.push("");
    } else if (block.type === "transition") {
      const n = block.notes || {};
      const hasAny = Object.values(n).some(v => v?.trim());
      if (hasAny) {
        lines.push("↓ TRANSITION");
        if (n.arrangement?.trim()) lines.push(`  ${n.arrangement.trim()}`);
        if (n.chords?.trim()) lines.push(`  ${n.chords.trim()}`);
        if (n.dynamics?.trim()) lines.push(`  ${n.dynamics.trim()}`);
        if (n.special?.trim()) lines.push(`  ${n.special.trim()}`);
        lines.push("");
      }
    } else if (block.type === "moment") {
      const label = block.momentType === "Custom" ? (block.customLabel || "Moment") : (block.momentType || "Moment");
      lines.push(`${"─".repeat(40)}`);
      lines.push(label.toUpperCase());
      const n = block.notes || {};
      if (n.arrangement?.trim()) lines.push(n.arrangement.trim());
      if (n.chords?.trim()) lines.push(`Chords: ${n.chords.trim()}`);
      if (n.dynamics?.trim()) lines.push(`Dynamics: ${n.dynamics.trim()}`);
      if (n.special?.trim()) lines.push(`Cues: ${n.special.trim()}`);
      lines.push("");
    } else if (block.type === "jam") {
      lines.push(`${"─".repeat(40)}`);
      lines.push(`🍓 JAM / MC GROOVE (${block.jamKey || "G"} · ${block.jamBpm || 96} BPM)`);
      lines.push(`Progression: ${block.jamProgression || JAM_PROGRESSIONS[block.jamKey || "G"] || ""}`);
      const n = block.notes || {};
      if (n.dynamics?.trim()) lines.push(`Dynamics: ${n.dynamics.trim()}`);
      if (n.special?.trim()) lines.push(`Cues: ${n.special.trim()}`);
      lines.push("");
    }
  });
  lines.push("─".repeat(40));
  lines.push("Sent via WorshipPilot");
  return lines.join("\n");
};

const ServiceBuilderPage = ({ services, songLibrary, activeServiceId, onSaveService, onDuplicateService, onDeleteService, onSetActive, onLaunch, onSaveSong }) => {
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || null);
  const [editTitle, setEditTitle] = useState("");
  const [addSongId, setAddSongId] = useState(songLibrary[0]?.id || "");
  const [copied, setCopied] = useState(false);
  const [justSetActive, setJustSetActive] = useState(false);
  const serviceListRef = useRef(null);

  const handleSetActive = (id) => {
    onSetActive(id);
    setJustSetActive(true);
    setTimeout(() => setJustSetActive(false), 2500);
    // Scroll service list into view
    if (serviceListRef.current) {
      serviceListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ── PCO Integration state ──
  const [pcoState, setPcoState] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wp-pco-connection") || "null"); } catch { return null; }
  });
  const [pcoPlans, setPcoPlans] = useState([]);
  const [pcoLoading, setPcoLoading] = useState(false);
  const [pcoError, setPcoError] = useState(null);
  const [showPcoImport, setShowPcoImport] = useState(false);

  // Check for PCO callback params on mount — handled at App level
  useEffect(() => {
    // Connection state is read from localStorage on mount
    const stored = localStorage.getItem("wp-pco-connection");
    if (stored && !pcoState) {
      try { setPcoState(JSON.parse(stored)); } catch {}
    }
  }, []);

  const connectPCO = () => {
    window.location.href = "/.netlify/functions/pco-connect";
  };

  const disconnectPCO = () => {
    localStorage.removeItem("wp-pco-connection");
    setPcoState(null);
    setPcoPlans([]);
    setShowPcoImport(false);
  };

  const fetchPcoPlans = async () => {
    if (!pcoState?.pcoUserId) return;
    setPcoLoading(true);
    setPcoError(null);
    try {
      const res = await fetch(`/.netlify/functions/pco-plans?pco_user_id=${pcoState.pcoUserId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch plans");
      setPcoPlans(data.plans || []);
      setShowPcoImport(true);
    } catch (err) {
      setPcoError(err.message);
    } finally {
      setPcoLoading(false);
    }
  };

  const importPcoPlan = (plan) => {
    const newBlocks = [];
    plan.songs.forEach((song, i) => {
      if (i > 0) newBlocks.push(mkBlock("transition"));
      const match = songLibrary.find(s => s.title.toLowerCase() === song.title.toLowerCase());
      newBlocks.push(mkBlock("song", {
        songId: match?.id || null,
        pcoTitle: song.title,
        pcoKey: song.key || '',
        pcoBpm: song.bpm || 120,
        pcoTimeSig: song.timeSig || '4/4',
        pcoSections: song.sections || [],
      }));
    });

    const newSvc = {
      id: mkId(),
      title: `${plan.dates || plan.title} — ${plan.serviceType}`,
      blocks: newBlocks.length > 0 ? newBlocks : [],
      songIds: newBlocks.filter(b => b.type === "song" && b.songId).map(b => b.songId),
      pcoId: plan.id,
      importedFromPco: true,
    };
    onSaveService(newSvc);
    setSelectedServiceId(newSvc.id);
    setShowPcoImport(false);
  };

  const rawService = services.find(s => s.id === selectedServiceId);
  const service = rawService ? upgradeService(rawService, songLibrary) : null;
  const blocks = service?.blocks || [];

  useEffect(() => { if (service) setEditTitle(service.title); }, [selectedServiceId]);

  const save = (updatedBlocks, titleOverride) => {
    const songIds = blockSongIds(updatedBlocks);
    onSaveService({ ...service, title: titleOverride ?? service.title, blocks: updatedBlocks, songIds });
  };

  const updateBlock = (id, updated) => save(blocks.map(b => b.id === id ? updated : b));
  const updateBlockNotes = (id, notes) => save(blocks.map(b => b.id === id ? { ...b, notes } : b));
  const removeBlock = (id) => save(blocks.filter(b => b.id !== id));

  const moveBlock = (id, dir) => {
    const i = blocks.findIndex(b => b.id === id);
    if (i < 0) return;
    const next = [...blocks];
    const swap = i + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[i], next[swap]] = [next[swap], next[i]];
    save(next);
  };

  const addSongBlock = () => {
    if (!addSongId || !service) return;
    const newBlocks = [...blocks];
    if (newBlocks.length > 0) newBlocks.push(mkBlock("transition"));
    newBlocks.push(mkBlock("song", { songId: addSongId }));
    save(newBlocks);
  };

  const addMoment = () => {
    const newBlocks = [...blocks];
    if (newBlocks.length > 0) newBlocks.push(mkBlock("transition"));
    newBlocks.push(mkBlock("moment", { momentType: "Speaking Moment" }));
    save(newBlocks);
  };

  const addJam = () => {
    const newBlocks = [...blocks];
    if (newBlocks.length > 0) newBlocks.push(mkBlock("transition"));
    newBlocks.push(mkBlock("jam", { jamKey: "G", jamBpm: 96, jamProgression: "" }));
    save(newBlocks);
  };

  const createService = () => {
    const newSvc = { id: mkId(), title: "New Service", blocks: [], songIds: [] };
    onSaveService(newSvc);
    setSelectedServiceId(newSvc.id);
  };

  const handleCopyNotes = () => {
    const text = formatNotesForSend(blocks, songLibrary, service.title);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  // Count blocks for service list display
  const countBlocks = (svc) => {
    if (svc.blocks) return svc.blocks.filter(b => b.type === "song").length;
    return (svc.songIds || []).length;
  };

  // Get song index (among song blocks only) for numbering
  const songBlocks = blocks.filter(b => b.type === "song");

  return (
    <div className="fade-in">
      {/* Photo hero */}
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 24, height: 180 }}>
        <img src="/stage-wide.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 55%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,12,18,0.97) 0%, rgba(8,12,18,0.5) 55%, rgba(8,12,18,0.15) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 22px 18px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 6 }}>Service Builder</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px", fontFamily: "var(--font-display)" }}>Build Your Service</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>Assemble your set, add MD notes, send to your band.</div>
        </div>
      </div>
      <Hint hintKey="service-builder" text="Build your set here — songs, transitions, moments, and the Jam. Tap Notes on any song to add your MD brief. Hit Copy Notes to send the whole thing to your band in PCO chat." />

      {/* ── PCO INTEGRATION PANEL ── */}
      <div style={{ marginBottom: 24, padding: "18px 20px", background: pcoState ? COLORS.accentLight : COLORS.card, border: `1.5px solid ${pcoState ? COLORS.accent : COLORS.border}`, borderRadius: 16, boxShadow: COLORS.shadow }}>
        {!pcoState ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, marginBottom: 3 }}>Connect Planning Center</div>
              <div style={{ fontSize: 12, color: "#4A5568", fontWeight: 600 }}>Import your upcoming service plans and song lists directly from PCO.</div>
              {pcoError && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 6 }}>{pcoError}</div>}
            </div>
            <button onClick={connectPCO}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", background: "#3D7BF4", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", flexShrink: 0 }}>
              {/* PCO logo mark */}
              <svg width="18" height="18" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.2"/>
                <text x="20" y="26" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" fontFamily="Arial">P</text>
              </svg>
              Connect to PCO
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: showPcoImport ? 16 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>Connected to {pcoState.pcoOrg && pcoState.pcoOrg !== "My Church" ? pcoState.pcoOrg : "Planning Center"}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{pcoState.pcoName}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={fetchPcoPlans} disabled={pcoLoading}
                  style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: COLORS.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: pcoLoading ? "default" : "pointer", fontFamily: "'Inter', sans-serif", opacity: pcoLoading ? 0.7 : 1 }}>
                  {pcoLoading ? "Loading..." : "↓ Import Plans"}
                </button>
                <button onClick={disconnectPCO}
                  style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.textDim, fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  Disconnect
                </button>
              </div>
            </div>
            {pcoError && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 8 }}>{pcoError}</div>}

            {/* PCO Plans list */}
            {showPcoImport && pcoPlans.length > 0 && (
              <div className="fade-in">
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 10 }}>Upcoming Plans — tap to import</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {pcoPlans.map(plan => (
                    <button key={plan.id} onClick={() => importPcoPlan(plan)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, cursor: "pointer", textAlign: "left", fontFamily: "'Inter', sans-serif", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 2 }}>{plan.dates || plan.title}</div>
                        <div style={{ fontSize: 11, color: COLORS.textDim }}>{plan.serviceType} · {plan.songs.length} song{plan.songs.length !== 1 ? "s" : ""}</div>
                        {plan.songs.length > 0 && (
                          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
                            {plan.songs.slice(0, 4).map(s => s.title).join(" · ")}{plan.songs.length > 4 ? ` +${plan.songs.length - 4} more` : ""}
                          </div>
                        )}
                      </div>
                      <span style={{ color: COLORS.accent, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>Import →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {showPcoImport && pcoPlans.length === 0 && (
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8 }}>No upcoming plans found in PCO.</div>
            )}
          </div>
        )}
      </div>

      {/* Service list */}
      <div className="section-label" ref={serviceListRef}>Services</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {services.map(svc => (
          <div key={svc.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: COLORS.card, border: `1px solid ${selectedServiceId === svc.id ? COLORS.accent : COLORS.border}`, borderRadius: 12, boxShadow: COLORS.shadow }}>
            <button onClick={() => setSelectedServiceId(svc.id)} style={{ flex: 1, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'Inter', sans-serif", padding: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{svc.title}</div>
              <div style={{ fontSize: 11, color: COLORS.textDim }}>{countBlocks(svc)} song{countBlocks(svc) !== 1 ? "s" : ""}</div>
            </button>
            {svc.id === activeServiceId && <span className="badge badge-green">Active</span>}
            <button onClick={() => onDuplicateService?.(svc)} className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }}>Copy</button>
            <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete this service?")) { onDeleteService?.(svc.id); if (selectedServiceId === svc.id) setSelectedServiceId(services.filter(s => s.id !== svc.id)[0]?.id || null); } }} className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12, color: "#B84455" }}>Delete</button>
          </div>
        ))}
        <button onClick={createService} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>+ New Service</button>
        {services.length > 3 && (() => {
          const seen = new Set();
          const dupeCount = services.filter(s => {
            if (seen.has(s.title)) return true;
            seen.add(s.title);
            return false;
          }).length;
          return dupeCount > 0 ? (
            <button onClick={() => {
              const seen2 = new Set();
              const deduped = services.filter(s => {
                if (seen2.has(s.title)) return false;
                seen2.add(s.title);
                return true;
              });
              deduped.forEach(s => onSaveService(s));
              // Remove all then re-add deduped — use a different approach: just keep IDs
              const keepIds = new Set(deduped.map(s => s.id));
              services.filter(s => !keepIds.has(s.id)).forEach(s => onDeleteService(s.id));
            }}
              className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", color: COLORS.red, borderColor: "rgba(192,57,74,0.2)", fontSize: 12 }}>
              Remove {dupeCount} duplicate{dupeCount !== 1 ? "s" : ""}
            </button>
          ) : null;
        })()}
      </div>

      {service && (
        <>
          {/* Service title + send notes */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 6 }}>Service Title</div>
                <input value={editTitle} onChange={e => { setEditTitle(e.target.value); save(blocks, e.target.value); }} className="field-input" />
              </div>
              <button onClick={handleCopyNotes}
                style={{ padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${copied ? COLORS.green : COLORS.accent}`, background: copied ? COLORS.greenLight : COLORS.accentLight, color: copied ? COLORS.green : COLORS.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s" }}>
                {copied ? "✓ Copied!" : "Copy Notes"}
              </button>
            </div>
          </div>

          {/* Block stack */}
          <div className="section-label">Set List & MD Notes</div>
          {blocks.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: COLORS.textDim, fontSize: 13, background: COLORS.card, borderRadius: 12, border: `1px dashed ${COLORS.border}`, marginBottom: 12 }}>
              Add songs, moments, or a jam below to build your service
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {blocks.map((block, i) => {
                const isFirst = i === 0;
                const isLast = i === blocks.length - 1;

                if (block.type === "song") {
                  const song = songLibrary.find(s => s.id === block.songId);
                  const songNum = songBlocks.findIndex(b => b.id === block.id);
                  return (
                    <SongBlock key={block.id} block={block} index={songNum} song={song}
                      songLibrary={songLibrary} onSaveSong={onSaveSong}
                      onNotesChange={notes => updateBlockNotes(block.id, notes)}
                      onRemove={() => removeBlock(block.id)}
                      onMoveUp={() => moveBlock(block.id, -1)}
                      onMoveDown={() => moveBlock(block.id, 1)}
                      isFirst={isFirst} isLast={isLast} total={blocks.length} />
                  );
                }
                if (block.type === "transition") {
                  return (
                    <TransitionBlock key={block.id} block={block}
                      onNotesChange={notes => updateBlockNotes(block.id, notes)}
                      onRemove={() => removeBlock(block.id)} />
                  );
                }
                if (block.type === "moment") {
                  return (
                    <MomentBlock key={block.id} block={block}
                      onUpdate={updated => updateBlock(block.id, updated)}
                      onNotesChange={notes => updateBlockNotes(block.id, notes)}
                      onRemove={() => removeBlock(block.id)} />
                  );
                }
                if (block.type === "jam") {
                  return (
                    <JamBlock key={block.id} block={block}
                      onUpdate={updated => updateBlock(block.id, updated)}
                      onNotesChange={notes => updateBlockNotes(block.id, notes)}
                      onRemove={() => removeBlock(block.id)} />
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Add controls */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            <select value={addSongId} onChange={e => setAddSongId(e.target.value)} className="field-input" style={{ flex: 1, minWidth: 120 }}>
              {songLibrary.map(s => <option key={s.id} value={s.id}>{s.title} — {s.key}</option>)}
            </select>
            <button onClick={addSongBlock} className="btn btn-primary" style={{ flexShrink: 0 }}>+ Song</button>
            <button onClick={addMoment} className="btn btn-ghost" style={{ flexShrink: 0 }}>+ Moment</button>
            <button onClick={addJam} style={{ flexShrink: 0, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.accent}`, background: COLORS.accentLight, color: COLORS.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>🍓 Jam</button>
          </div>

          {/* Launch controls */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => handleSetActive(service.id)}
              style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${service.id === activeServiceId ? COLORS.green : COLORS.border}`, background: service.id === activeServiceId ? (justSetActive ? COLORS.green : COLORS.greenLight) : COLORS.card, color: service.id === activeServiceId ? (justSetActive ? "#fff" : COLORS.green) : COLORS.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", boxShadow: COLORS.shadow, transition: "all 0.3s" }}>
              {service.id === activeServiceId ? (justSetActive ? "✓ Set as Active!" : "✓ Active Service") : "Set as Active"}
            </button>
            <button onClick={() => { onSetActive(service.id); onLaunch(); }} className="btn btn-primary" style={{ flex: 1, justifyContent: "center", padding: "12px" }}>
              ▶ Launch Live Mode
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── LIVE MODE ────────────────────────────────────────────────────────────────
// Live Mode keeps the dark palette for focus — this is intentional

const LiveModePage = ({ activeService, songLibrary, onGoToServiceBuilder }) => {
  // Build song list from blocks (handles both library songs and PCO-imported songs)
  const songs = activeService ? (
    activeService.blocks
      ? activeService.blocks
          .filter(b => b.type === 'song')
          .map(b => {
            const libSong = songLibrary.find(s => s.id === b.songId);
            if (libSong) return libSong;
            // PCO-imported song without library match — build sections from PCO data
            if (b.pcoTitle) {
              // Use pcoSections if available, otherwise build a sensible default structure
              const buildSections = (pcoSecs) => {
                if (pcoSecs && pcoSecs.length > 0) {
                  return pcoSecs.map((sec, i) => ({
                    id: `pco-${i}`,
                    type: sec.type || 'verse',
                    label: sec.label || (sec.type ? sec.type.charAt(0).toUpperCase() + sec.type.slice(1) : 'Section'),
                    bars: sec.bars || DEFAULT_BARS_BY_TYPE[sec.type] || 8,
                    repeatCount: 1, note: '', headsUp: '', headsUpBarsBefore: 2,
                  }));
                }
                // Default worship song structure
                return [
                  { id: 'p0', type: 'intro',   label: 'Intro',         bars: 8,  repeatCount: 1, note: '', headsUp: '', headsUpBarsBefore: 2 },
                  { id: 'p1', type: 'verse',   label: 'Verse 1',       bars: 16, repeatCount: 1, note: '', headsUp: '', headsUpBarsBefore: 2 },
                  { id: 'p2', type: 'chorus',  label: 'Chorus',        bars: 16, repeatCount: 1, note: '', headsUp: '', headsUpBarsBefore: 2 },
                  { id: 'p3', type: 'verse',   label: 'Verse 2',       bars: 16, repeatCount: 1, note: '', headsUp: '', headsUpBarsBefore: 2 },
                  { id: 'p4', type: 'chorus',  label: 'Chorus',        bars: 16, repeatCount: 1, note: '', headsUp: '', headsUpBarsBefore: 2 },
                  { id: 'p5', type: 'bridge',  label: 'Bridge',        bars: 8,  repeatCount: 1, note: '', headsUp: '', headsUpBarsBefore: 2 },
                  { id: 'p6', type: 'chorus',  label: 'Final Chorus',  bars: 16, repeatCount: 1, note: '', headsUp: '', headsUpBarsBefore: 2 },
                  { id: 'p7', type: 'outro',   label: 'Outro',         bars: 8,  repeatCount: 1, note: '', headsUp: '', headsUpBarsBefore: 2 },
                ];
              };
              return {
                id: b.id,
                title: b.pcoTitle,
                key: b.pcoKey || '',
                bpm: b.pcoBpm || 120,
                timeSig: b.pcoTimeSig || '4/4',
                sections: buildSections(b.pcoSections),
              };
            }
            return null;
          })
          .filter(Boolean)
      : activeService.songIds.map(id => songLibrary.find(s => s.id === id)).filter(Boolean)
  ) : [];

  const [songIndex, setSongIndex]     = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [lastCommand, setLastCommand] = useState(null);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [elapsedMs, setElapsedMs]     = useState(0);
  const [beatTick, setBeatTick]       = useState(0);
  const [beatActive, setBeatActive]   = useState(false);
  const [liveLoopActive, setLiveLoopActive]     = useState(false);
  const [liveExtraRepeats, setLiveExtraRepeats] = useState(0);
  const [liveEndingMode, setLiveEndingMode]     = useState(null);
  const [setlistOpen, setSetlistOpen] = useState(false);
  const [metronomeSound, setMetronomeSound] = useState(false);
  const [liveHintDismissed, setLiveHintDismissed] = useState(() => {
    try { return !!localStorage.getItem("wp-hint-live-mode"); } catch { return false; }
  });

  // Web Audio context for metronome click
  const audioCtxRef = useRef(null);
  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };
  const playClick = (isDownbeat) => {
    try {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = isDownbeat ? 1200 : 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(isDownbeat ? 0.35 : 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  };

  const liveLoopRef         = useRef(false);
  const liveExtraRepeatsRef = useRef(0);
  const isPlayingRef        = useRef(false);
  const sectionIdxRef       = useRef(0);
  const songIdxRef          = useRef(0);
  const sectionStartRef     = useRef(null);
  const progressRef         = useRef(null);
  const beatRef             = useRef(null);
  const beatCountRef        = useRef(0);
  const songsRef            = useRef(songs); // keeps songs accessible in interval closure
  // Keep songsRef in sync
  songsRef.current = songs;

  if (!activeService || songs.length === 0) {
    return (
      <div className="fade-in" style={{ maxWidth: 520, margin: "0 auto", paddingTop: 0, textAlign: "center" }}>
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 28, height: 220 }}>
          <img src="/bassist.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,10,18,0.97) 0%, rgba(5,10,18,0.5) 60%, rgba(5,10,18,0.15) 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 22px 18px", textAlign: "left" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 6 }}>Live Mode</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px", fontFamily: "var(--font-display)" }}>Ready when you are.</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Build a service first, then launch it here.</div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: LIVE.text, marginBottom: 8 }}>No Active Service</div>
        <div style={{ fontSize: 14, color: LIVE.textMuted, marginBottom: 28, lineHeight: 1.6 }}>Build a service in the Service Builder, then launch it here.</div>
        <button onClick={onGoToServiceBuilder}
          style={{ padding: "13px 28px", borderRadius: 12, border: `1px solid ${COLORS.accentDim}`, background: COLORS.accentGlow, color: COLORS.accent, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
          → Go to Service Builder
        </button>
      </div>
    );
  }

  const song          = songs[songIndex];
  const section       = song.sections[sectionIndex];
  const nextSection   = song.sections[sectionIndex + 1] || null;
  const totalSongs    = songs.length;
  const totalSections = song.sections.length;

  // beatsPerBar: 4/4=4, 6/8=6 (but BPM is dotted quarter = 2 beats), 3/4=3, 2/4=2, 12/8=12 (dotted quarter)
  const getBeatsPerBar = (timeSig) => {
    if (!timeSig || timeSig === '4/4' || timeSig === '2/4') return 4;
    if (timeSig === '3/4') return 3;
    if (timeSig === '6/8') return 6; // 6 eighth notes, but BPM = dotted quarter so ×2
    if (timeSig === '12/8') return 12;
    return 4;
  };
  const getBpmMultiplier = (timeSig) => {
    // In 6/8 and 12/8, the BPM is usually counted in dotted quarters (= 2 eighth notes each)
    // so effective beat duration = 60/BPM seconds per dotted quarter = 2 eighth notes
    if (timeSig === '6/8' || timeSig === '12/8') return 2;
    return 1;
  };
  const timeSig = song.timeSig || '4/4';
  const beatsPerBar = getBeatsPerBar(timeSig);
  const calcDuration = (sec, bpm, extraRepeats = 0) => {
    const bpmMult = getBpmMultiplier(timeSig);
    return (sec.bars * (sec.repeatCount + extraRepeats) * beatsPerBar / (bpm * bpmMult)) * 60 * 1000;
  };
  const sectionDurationMs = calcDuration(section, song.bpm, liveExtraRepeats);
  const remaining = Math.max(0, sectionDurationMs - elapsedMs);
  const progress = Math.min(1, elapsedMs / sectionDurationMs);

  const headsUpBarsBefore  = section.headsUpBarsBefore ?? 2;
  const totalBarsEffective = section.bars * (section.repeatCount + liveExtraRepeats);
  const currentBarPos      = Math.min(Math.floor(progress * totalBarsEffective), totalBarsEffective - 1);
  const nearingEnd         = isPlaying && (totalBarsEffective - currentBarPos) <= headsUpBarsBefore;

  const metronomeRef = useRef(false);
  metronomeRef.current = metronomeSound;

  const startBeatInterval = (bpm) => {
    if (beatRef.current) clearInterval(beatRef.current);
    beatCountRef.current = 0;
    setBeatTick(0);
    const beatDurMs = Math.round((60 / bpm) * 1000);
    beatRef.current = setInterval(() => {
      if (!isPlayingRef.current) { clearInterval(beatRef.current); return; }
      beatCountRef.current += 1;
      setBeatTick(n => n + 1);
      setBeatActive(true);
      const isDownbeat = beatCountRef.current % 4 === 1;
      if (metronomeRef.current) playClick(isDownbeat);
      setTimeout(() => setBeatActive(false), isDownbeat ? 160 : 85);
    }, beatDurMs);
  };

  const startProgressInterval = () => {
    if (progressRef.current) clearInterval(progressRef.current);
    sectionStartRef.current = Date.now();
    progressRef.current = setInterval(() => {
      if (!isPlayingRef.current) return;
      const elapsed = Date.now() - sectionStartRef.current;
      setElapsedMs(elapsed);
      const curSong    = songsRef.current[songIdxRef.current];
      if (!curSong) return; // safety guard
      const curSection = curSong.sections[sectionIdxRef.current];
      const dur = calcDuration(curSection, curSong.bpm, liveExtraRepeatsRef.current);
      if (elapsed >= dur) {
        if (liveLoopRef.current) {
          sectionStartRef.current = Date.now();
          setElapsedMs(0);
          startBeatInterval(curSong.bpm, curSong.timeSig);
        } else {
          const nextIdx = sectionIdxRef.current + 1;
          if (nextIdx < curSong.sections.length) {
            sectionIdxRef.current = nextIdx;
            setSectionIndex(nextIdx);
            sectionStartRef.current = Date.now();
            setElapsedMs(0);
            liveExtraRepeatsRef.current = 0;
            setLiveExtraRepeats(0);
            startBeatInterval(curSong.bpm, curSong.timeSig);
          } else {
            isPlayingRef.current = false;
            setIsPlaying(false);
            setElapsedMs(0);
            setBeatActive(false);
            clearInterval(progressRef.current);
            clearInterval(beatRef.current);
          }
        }
      }
    }, 100);
  };

  const stopAll = () => { clearInterval(progressRef.current); clearInterval(beatRef.current); progressRef.current = null; beatRef.current = null; };
  useEffect(() => () => stopAll(), []);

  const handlePlay = () => { isPlayingRef.current = true; setIsPlaying(true); startProgressInterval(); startBeatInterval(song.bpm, song.timeSig); };
  const handlePause = () => { isPlayingRef.current = false; setIsPlaying(false); stopAll(); setBeatActive(false); };
  const handleReset = () => { isPlayingRef.current = false; setIsPlaying(false); stopAll(); sectionIdxRef.current = 0; setSectionIndex(0); setElapsedMs(0); setBeatTick(0); setBeatActive(false); setLastCommand(null); };

  const jumpSection = (newIdx) => {
    sectionIdxRef.current = newIdx;
    setSectionIndex(newIdx);
    setElapsedMs(0);
    setBeatTick(0);
    setBeatActive(false);
    beatCountRef.current = 0;
    liveLoopRef.current = false;
    liveExtraRepeatsRef.current = 0;
    setLiveLoopActive(false);
    setLiveExtraRepeats(0);
    if (isPlayingRef.current) { sectionStartRef.current = Date.now(); startBeatInterval(song.bpm); }
  };

  const jumpSong = (newSongIdx, newSecIdx = 0) => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    stopAll();
    songIdxRef.current = newSongIdx;
    sectionIdxRef.current = newSecIdx;
    setSongIndex(newSongIdx);
    setSectionIndex(newSecIdx);
    setElapsedMs(0);
    setBeatTick(0);
    setBeatActive(false);
    setLastCommand(null);
  };

  const goNextSection = () => { if (sectionIndex < totalSections - 1) jumpSection(sectionIndex + 1); };
  const goPrevSection = () => { if (sectionIndex > 0) jumpSection(sectionIndex - 1); };
  const goNextSong    = () => { if (songIndex < totalSongs - 1) jumpSong(songIndex + 1); };
  const goPrevSong    = () => { if (songIndex > 0) jumpSong(songIndex - 1); };
  const tap = (cmd) => setLastCommand(cmd);

  const handleExtendOne = () => { const next = liveExtraRepeats + 1; liveExtraRepeatsRef.current = next; setLiveExtraRepeats(next); };
  const handleToggleLoop = () => { const next = !liveLoopActive; liveLoopRef.current = next; setLiveLoopActive(next); };
  const handleNextChorus = () => { for (let i = sectionIndex + 1; i < song.sections.length; i++) { if (song.sections[i].type === "chorus") { jumpSection(i); return; } } };
  const handleSkipOutro = () => { for (let i = sectionIndex + 1; i < song.sections.length; i++) { if (song.sections[i].type === "outro") { jumpSection(i); return; } } };
  const handleEndSoft  = () => setLiveEndingMode(m => m === "soft"  ? null : "soft");
  const handleEndClean = () => setLiveEndingMode(m => m === "clean" ? null : "clean");
  const clearAllOverrides = () => { liveLoopRef.current = false; liveExtraRepeatsRef.current = 0; setLiveLoopActive(false); setLiveExtraRepeats(0); setLiveEndingMode(null); };

  const sectionColor = (type) => ({
    intro:"#4CAF7D",verse:"#6B9FD4",prechorus:"#A07CC5",chorus:"#C49A3C",
    bridge:"#CF6679",tag:"#B8720A",outro:"#5A8FA0",turnaround:"#8A9B6A",
    instrumental:"#4A8AAA",breakdown:"#9A6AAA",vamp:"#6A9A6A"
  }[type] || "#6B9FD4");

  const jumpToType = (type) => {
    if (type === "top") { jumpSection(0); setLastCommand("Top"); return; }
    for (let i = sectionIndex + 1; i < song.sections.length; i++) { if (song.sections[i].type === type) { jumpSection(i); setLastCommand(type.charAt(0).toUpperCase() + type.slice(1)); return; } }
    for (let i = 0; i < sectionIndex; i++) { if (song.sections[i].type === type) { jumpSection(i); setLastCommand(type.charAt(0).toUpperCase() + type.slice(1)); return; } }
    setLastCommand(type.charAt(0).toUpperCase() + type.slice(1));
  };

  // AI-suggested cues per section type
  const getAISuggestions = (secType, secIndex, totalSecs, songBpm) => {
    const isFirst = secIndex === 0;
    const isLast = secIndex === totalSecs - 1;
    const suggestions = {
      intro:          ["All in on the 1", "Stand by for verse", isFirst ? "Set the energy" : ""].filter(Boolean),
      verse:          ["Drop dynamics", "Watch the click", "Stand by for chorus"],
      prechorus:      ["Stand by for chorus", "Build it", "Layer in"],
      chorus:         ["Full band", "Big snap", isLast ? "Last chorus" : "Stand by for bridge"].filter(Boolean),
      bridge:         ["Start low", "Pads only if WL extends", "Stand by — on me"],
      tag:            ["Last time", "Tag it", "Watch for ending"],
      outro:          ["Soft landing", "Cold stop", "Watch WL"],
      turnaround:     ["On the 1", "Follow the click", "Stand by"],
      instrumental:   ["Follow the track", "Light groove", "Watch WL"],
      breakdown:      ["Strip it down", "Keys and vocals", "Pads only"],
      vamp:           ["Vamp here", "Follow WL", "I'll call the exit"],
    };
    return suggestions[secType] || ["Follow the track", "Watch WL", "Stay locked in"];
  };

  const [showSetlist, setShowSetlist] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showMoreControls, setShowMoreControls] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const fetchAISuggestion = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const prompt = `You are an expert Music Director for a contemporary worship team. Generate a brief MD note for this song section.

Song: ${song.title}
Key: ${song.key}
BPM: ${song.bpm}
Section: ${section.label} (${section.type})
Position: Section ${sectionIndex + 1} of ${totalSections}
${sectionIndex === 0 ? 'This is the opening section.' : ''}
${sectionIndex === totalSections - 1 ? 'This is the final section.' : ''}
${nextSection ? `Next section: ${nextSection.label}` : 'This is the last section of the song.'}

Write 2-3 short, punchy MD notes for this section. Each note should be on its own line starting with "•". 
Focus on: dynamics, what to call, band instructions, WL coordination, or transition cues.
Keep each note under 10 words. Use language from the Evolve MD vocabulary (Build, Pull back, Pads only, Stand by, Full band, Big snap, Loop, Watch WL, etc).
Do not add any preamble or explanation — just the bullet points.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data?.content?.[0]?.text || "";
      setAiSuggestion(text.trim());
    } catch (e) {
      setAiSuggestion("• Full band energy\n• Watch WL for extensions\n• Stand by for next section");
    } finally {
      setAiLoading(false);
    }
  };

  const suggestions = getAISuggestions(section.type, sectionIndex, totalSections, song.bpm);
  const segColor = (type) => ({
    intro:"#4CAF7D", verse:"#6B9FD4", prechorus:"#A07CC5", chorus:"#C49A3C",
    bridge:"#CF6679", tag:"#B8720A", outro:"#5A8FA0", turnaround:"#8A9B6A",
    instrumental:"#4A8AAA", breakdown:"#9A6AAA", vamp:"#6A9A6A"
  }[type] || "#6B9FD4");

  const secColor = segColor(section.type);
  const lighten = (hex, amt) => { const n=parseInt(hex.slice(1),16); const r=Math.min(255,(n>>16)+amt); const g=Math.min(255,((n>>8)&0xff)+amt); const b=Math.min(255,(n&0xff)+amt); return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`; };

  const totalBarsEffectiveDisplay = section.bars * (section.repeatCount + liveExtraRepeats);
  const currentBarDisplay = isPlaying ? Math.min(Math.floor(progress * totalBarsEffectiveDisplay) + 1, totalBarsEffectiveDisplay) : 1;
  const hasOverrides = liveLoopActive || liveExtraRepeats > 0 || !!liveEndingMode;
  const beatPosition = beatTick % 4;

  const PULSE_STRONG = lighten(secColor, 60);
  const PULSE_WEAK   = lighten(secColor, 30);

  // Visual metronome — 4 beat dots, pendulum arm, and BPM display
  const renderMetronome = () => {
    const beat = beatTick % 4; // 0-3
    const isDown = beatCountRef.current % 4 === 1; // true on downbeat
    // Pendulum angle: swings left-right based on beat pair
    const swingLeft = beat === 0 || beat === 3;
    const angle = isPlaying ? (swingLeft ? -22 : 22) : 0;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 12, marginBottom: 14, border: `1px solid rgba(255,255,255,0.07)` }}>

        {/* Pendulum */}
        <div style={{ position: "relative", width: 32, height: 52, flexShrink: 0 }}>
          {/* Pivot point */}
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: COLORS.accent }} />
          {/* Arm */}
          <div style={{
            position: "absolute", top: 3, left: "50%",
            width: 2, height: 40,
            background: `linear-gradient(180deg, ${COLORS.accent}, rgba(62,127,199,0.3))`,
            borderRadius: 2,
            transformOrigin: "top center",
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transition: isPlaying ? `transform ${beatTick === 0 ? 0 : 0.12}s ease-out` : "none",
          }} />
          {/* Bob */}
          <div style={{
            position: "absolute", bottom: 2, left: "50%",
            width: 12, height: 12, borderRadius: "50%",
            background: beatActive && isPlaying ? (beatCountRef.current % 4 === 1 ? COLORS.accent : `${COLORS.accent}99`) : "rgba(62,127,199,0.3)",
            border: `2px solid ${COLORS.accent}`,
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: "top center",
            transition: isPlaying ? "all 0.12s ease-out" : "none",
            boxShadow: beatActive && beatCountRef.current % 4 === 1 ? `0 0 10px ${COLORS.accent}` : "none",
          }} />
        </div>

        {/* Beat dots — 4 per bar */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flex: 1 }}>
          {[0, 1, 2, 3].map(i => {
            const isCurrentBeat = isPlaying && (beatTick % 4) === i && beatActive;
            const isDownbeatDot = i === 0;
            return (
              <div key={i} style={{
                flex: 1, height: isCurrentBeat ? (isDownbeatDot ? 28 : 20) : (isDownbeatDot ? 20 : 14),
                borderRadius: 4,
                background: isCurrentBeat
                  ? (isDownbeatDot ? COLORS.accent : `${COLORS.accent}CC`)
                  : "rgba(255,255,255,0.1)",
                transition: "all 0.06s ease-out",
                boxShadow: isCurrentBeat && isDownbeatDot ? `0 0 12px ${COLORS.accent}80` : "none",
              }} />
            );
          })}
        </div>

        {/* BPM + sound toggle */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: isPlaying ? COLORS.accent : LIVE.textMuted, lineHeight: 1 }}>
            {song.bpm}
          </div>
          <div style={{ fontSize: 9, color: LIVE.textDim, letterSpacing: 1 }}>BPM</div>
          <button onClick={() => {
            // Resume audio context on first interaction
            if (!metronomeSound) getAudioCtx();
            setMetronomeSound(s => !s);
          }} style={{
            marginTop: 2, padding: "3px 7px", borderRadius: 6, fontSize: 9, fontWeight: 700,
            border: `1px solid ${metronomeSound ? COLORS.accent : LIVE.border}`,
            background: metronomeSound ? COLORS.accentGlow : "transparent",
            color: metronomeSound ? COLORS.accent : LIVE.textDim,
            cursor: "pointer", fontFamily: "'Inter', sans-serif", letterSpacing: 0.5,
          }}>
            {metronomeSound ? "♪ ON" : "♪ OFF"}
          </button>
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    const totalBars = totalBarsEffectiveDisplay;
    const currentBar = Math.min(Math.floor(progress * totalBars), totalBars - 1);
    return (
      <div style={{ display: "flex", gap: 2, height: 5, userSelect: "none" }}>
        {Array.from({ length: Math.min(totalBars, 32) }).map((_, i) => {
          const isCurrent = i === currentBar && isPlaying;
          const isPast = i < currentBar;
          const isDownbeat = beatPosition === 0;
          const currentFill = isCurrent && beatActive ? (isDownbeat ? PULSE_STRONG : PULSE_WEAK) : `${secColor}AA`;
          return (
            <div key={i} style={{ flex: 1, borderRadius: 2, position: "relative", overflow: "hidden", background: "rgba(255,255,255,0.08)", border: isCurrent ? `1px solid ${beatActive ? PULSE_WEAK : secColor}` : "1px solid transparent" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: isPast ? "100%" : isCurrent ? `${((progress * totalBars) - currentBar) * 100}%` : "0%", background: isCurrent ? currentFill : isPast ? `${secColor}CC` : "transparent", transition: isCurrent && !beatActive ? "width 0.1s linear" : "none" }} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ maxWidth: fullscreen ? "100vw" : 540, margin: "0 auto", minHeight: "100%", background: LIVE.bgGrad, padding: fullscreen ? "0" : "16px 16px 40px", position: fullscreen ? "fixed" : "relative", top: fullscreen ? 0 : "auto", left: fullscreen ? 0 : "auto", right: fullscreen ? 0 : "auto", bottom: fullscreen ? 0 : "auto", zIndex: fullscreen ? 9999 : "auto", overflowY: fullscreen ? "auto" : "visible" }}>

    {fullscreen ? (
      /* ── FULLSCREEN MODE ── */
      <div style={{ display: "flex", flexDirection: "column", height: "100dvh", padding: "12px 14px 20px", background: LIVE.bgGrad }}>

        {/* Fullscreen top bar — compact */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: LIVE.text }}>{song.title}</div>
            <div style={{ fontSize: 10, color: LIVE.textDim, fontFamily: "'JetBrains Mono', monospace" }}>Key of {song.key} · {song.bpm} BPM · {song.timeSig || '4/4'} · {songIndex + 1}/{totalSongs}</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: isPlaying ? "#4CAF7D" : LIVE.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{isPlaying ? "● LIVE" : "○"}</div>
            {!isPlaying ? (
              <button onClick={handlePlay} style={{ width: 44, height: 40, borderRadius: 10, border: "none", background: COLORS.accent, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>▶</button>
            ) : (
              <button onClick={handlePause} style={{ width: 44, height: 40, borderRadius: 10, border: "none", background: COLORS.accent, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>⏸</button>
            )}
            <button onClick={handleReset} style={{ width: 36, height: 40, borderRadius: 10, border: `1px solid ${LIVE.border}`, background: "transparent", color: LIVE.textMuted, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>⟳</button>
            <button onClick={() => setFullscreen(false)} style={{ width: 36, height: 40, borderRadius: 10, border: `1px solid ${LIVE.border}`, background: "transparent", color: LIVE.textMuted, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>

        {/* Fullscreen main card — takes most of screen */}
        <div style={{ flex: 1, background: LIVE.surface, border: `2px solid ${secColor}50`, borderRadius: 20, padding: "20px 20px 16px", marginBottom: 10, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: secColor, borderRadius: "20px 20px 0 0" }} />

          {/* Section label + bar counter */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: secColor, boxShadow: `0 0 10px ${secColor}` }} />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: secColor }}>{section.label}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 42, fontWeight: 700, color: nearingEnd ? COLORS.accent : LIVE.text, lineHeight: 1, transition: "color 0.3s" }}>
                {currentBarDisplay}
              </div>
              <div style={{ fontSize: 11, color: LIVE.textDim, fontFamily: "'JetBrains Mono', monospace" }}>of {totalBarsEffectiveDisplay}</div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: 12 }}>{renderTimeline()}</div>
          {renderMetronome()}

          {/* MD Notes — BIG */}
          {section.note ? (
            <div style={{ flex: 1, borderLeft: `4px solid ${secColor}`, paddingLeft: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: LIVE.textDim, marginBottom: 10 }}>MD Notes</div>
              <div style={{ fontSize: 20, color: LIVE.text, lineHeight: 1.6, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                {section.note}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, color: LIVE.textDim, marginBottom: 6 }}>No MD notes for this section</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                  {suggestions.map((s, i) => (
                    <span key={i} style={{ fontSize: 13, padding: "5px 12px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: `1px solid ${LIVE.border}`, color: LIVE.textMuted }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen next section strip */}
        {nextSection ? (
          <div style={{ background: nearingEnd ? `${COLORS.accent}18` : LIVE.surface, border: `1px solid ${nearingEnd ? COLORS.accent : LIVE.border}`, borderRadius: 14, padding: "10px 16px", marginBottom: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.3s" }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: nearingEnd ? COLORS.accent : LIVE.textDim, marginBottom: 2 }}>{nearingEnd ? "⚡ Stand by for" : "Up next"}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: segColor(nextSection.type) }} />
                <div style={{ fontFamily: "var(--font-display)", fontSize: nearingEnd ? 22 : 16, fontWeight: 600, color: nearingEnd ? LIVE.text : LIVE.textMuted }}>{nextSection.label}</div>
              </div>
              {nextSection.note && nearingEnd && (
                <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 2, paddingLeft: 15 }}>{nextSection.note.split('\n')[0]}</div>
              )}
            </div>
            {nearingEnd && remaining > 0 && (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: COLORS.accent }}>{Math.ceil(remaining / 1000)}s</div>
            )}
          </div>
        ) : (
          <div style={{ border: `1px solid ${LIVE.border}`, borderRadius: 14, padding: "10px 16px", marginBottom: 10, textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: LIVE.textDim }}>{songIndex < totalSongs - 1 ? `Last section — ${songs[songIndex + 1]?.title} follows` : "Service complete"}</div>
          </div>
        )}

        {/* Fullscreen controls — compact bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 6, flexShrink: 0 }}>
          <button onClick={goPrevSection} disabled={sectionIndex === 0} style={{ padding: "12px 4px", borderRadius: 10, border: `1px solid ${LIVE.border}`, background: "transparent", color: sectionIndex === 0 ? LIVE.textDim : LIVE.text, fontSize: 18, cursor: sectionIndex === 0 ? "default" : "pointer", opacity: sectionIndex === 0 ? 0.25 : 1 }}>◂</button>
          <button onClick={handleToggleLoop} style={{ padding: "12px 4px", borderRadius: 10, border: `1px solid ${liveLoopActive ? "#4A90D9" : LIVE.border}`, background: liveLoopActive ? "rgba(74,144,217,0.15)" : "transparent", color: liveLoopActive ? "#4A90D9" : LIVE.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Loop</button>
          <button onClick={handleExtendOne} style={{ padding: "12px 4px", borderRadius: 10, border: `1px solid ${liveExtraRepeats > 0 ? COLORS.accentDim : LIVE.border}`, background: liveExtraRepeats > 0 ? COLORS.accentGlow : "transparent", color: liveExtraRepeats > 0 ? COLORS.accent : LIVE.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+1</button>
          <button onClick={() => setShowMoreControls(o => !o)} style={{ padding: "12px 4px", borderRadius: 10, border: `1px solid ${LIVE.border}`, background: "transparent", color: LIVE.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>More</button>
          <button onClick={goNextSection} disabled={sectionIndex === totalSections - 1} style={{ padding: "12px 4px", borderRadius: 10, border: `1px solid ${LIVE.border}`, background: "transparent", color: sectionIndex === totalSections - 1 ? LIVE.textDim : LIVE.text, fontSize: 18, cursor: sectionIndex === totalSections - 1 ? "default" : "pointer", opacity: sectionIndex === totalSections - 1 ? 0.25 : 1 }}>▸</button>
        </div>

        {/* More controls panel */}
        {showMoreControls && (
          <div className="fade-in" style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            <button onClick={goPrevSong} disabled={songIndex === 0} style={{ padding: "10px 4px", borderRadius: 10, border: `1px solid ${LIVE.border}`, background: "transparent", color: LIVE.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: songIndex === 0 ? 0.3 : 1 }}>◂◂ Song</button>
            <button onClick={goNextSong} disabled={songIndex === totalSongs - 1} style={{ padding: "10px 4px", borderRadius: 10, border: `1px solid ${LIVE.border}`, background: "transparent", color: LIVE.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: songIndex === totalSongs - 1 ? 0.3 : 1 }}>Song ▸▸</button>
            <button onClick={() => { tap("Kill Track"); }} style={{ padding: "10px 4px", borderRadius: 10, border: `1px solid rgba(192,57,74,0.3)`, background: "rgba(192,57,74,0.08)", color: COLORS.red, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Kill Track</button>
            {["verse","chorus","bridge"].map(type => (
              <button key={type} onClick={() => jumpToType(type)} style={{ padding: "10px 4px", borderRadius: 10, border: `1px solid ${LIVE.border}`, background: "transparent", color: LIVE.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{type}</button>
            ))}
            <button onClick={() => { tap("Count In"); }} style={{ padding: "10px 4px", borderRadius: 10, border: `1px solid rgba(192,57,74,0.3)`, background: "rgba(192,57,74,0.08)", color: COLORS.red, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Count In</button>
          </div>
        )}
      </div>

    ) : (

      /* ── NORMAL MODE ── */
      <div>

      {/* ── TOP BAR ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${LIVE.border}` }}>
        <button onClick={() => setShowSetlist(o => !o)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: LIVE.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</div>
            <span style={{ fontSize: 9, color: LIVE.textDim }}>{showSetlist ? "▲" : "▼"}</span>
          </div>
          <div style={{ fontSize: 10, color: LIVE.textDim, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
            Key of {song.key} · {song.bpm} BPM · {songIndex + 1}/{totalSongs}
          </div>
        </button>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: isPlaying ? "#4CAF7D" : LIVE.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            {isPlaying ? "● LIVE" : "○ PAUSED"}
          </div>
          {!isPlaying ? (
            <button onClick={handlePlay} style={{ width: 40, height: 36, borderRadius: 10, border: "none", background: COLORS.accent, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>▶</button>
          ) : (
            <button onClick={handlePause} style={{ width: 40, height: 36, borderRadius: 10, border: "none", background: COLORS.accent, color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>⏸</button>
          )}
          <button onClick={handleReset} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${LIVE.border}`, background: "transparent", color: LIVE.textMuted, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>⟳</button>
          <button onClick={() => setFullscreen(true)} title="Fullscreen" style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${LIVE.border}`, background: "transparent", color: LIVE.textMuted, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>⛶</button>
        </div>
      </div>

      {/* ── SETLIST DROPDOWN ── */}
      {showSetlist && (
        <div className="fade-in" style={{ marginBottom: 16, background: LIVE.surface, border: `1px solid ${LIVE.border}`, borderRadius: 14, overflow: "hidden" }}>
          {songs.map((s, si) => (
            <div key={si}>
              <button onClick={() => { jumpSong(si); setShowSetlist(false); }}
                style={{ width: "100%", padding: "10px 14px", background: si === songIndex ? `${COLORS.accent}18` : "transparent", border: "none", borderBottom: si < songs.length - 1 ? `1px solid ${LIVE.border}` : "none", cursor: "pointer", textAlign: "left", fontFamily: "'Inter', sans-serif" }}>
                <span style={{ fontSize: 10, color: si === songIndex ? COLORS.accent : LIVE.textDim, marginRight: 8, fontWeight: 700 }}>{si + 1}</span>
                <span style={{ fontSize: 13, color: si === songIndex ? COLORS.accent : LIVE.text, fontWeight: si === songIndex ? 700 : 400 }}>{s.title}</span>
                <span style={{ fontSize: 10, color: LIVE.textDim, marginLeft: 8 }}>Key of {s.key}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── MAIN SECTION CARD ── */}
      <div style={{ background: LIVE.surface, border: `2px solid ${secColor}40`, borderRadius: 20, padding: "20px 18px", marginBottom: 12, position: "relative", overflow: "hidden" }}>
        {/* Section color accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: secColor, borderRadius: "20px 20px 0 0" }} />

        {/* PCO song notice */}
        {!songLibrary.find(s => s.id === songs[songIndex]?.id) && songs[songIndex]?.sections?.[0]?.id?.startsWith('p') && (
          <div style={{ marginBottom: 12, padding: "7px 12px", borderRadius: 8, background: "rgba(62,127,199,0.08)", border: `1px solid rgba(62,127,199,0.2)`, fontSize: 11, color: COLORS.accent }}>
            ⚡ PCO import — bar counts are estimates. Edit in Song Builder before Sunday.
          </div>
        )}

        {/* Section label + bar count */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: secColor, flexShrink: 0, boxShadow: `0 0 8px ${secColor}` }} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: secColor }}>{section.label}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: nearingEnd ? COLORS.accent : LIVE.text, lineHeight: 1, transition: "color 0.3s" }}>
              {currentBarDisplay}
            </div>
            <div style={{ fontSize: 10, color: LIVE.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
              of {totalBarsEffectiveDisplay} bars{liveExtraRepeats > 0 ? ` (+${liveExtraRepeats})` : ""}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: 12 }}>{renderTimeline()}</div>
        {renderMetronome()}

        {/* MD Notes — the main content */}
        {section.note ? (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: LIVE.textDim, marginBottom: 8 }}>MD Notes</div>
            <div style={{ fontSize: 15, color: LIVE.text, lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontWeight: 500, borderLeft: `3px solid ${secColor}`, paddingLeft: 12 }}>
              {section.note}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px dashed ${LIVE.border}` }}>
            <div style={{ fontSize: 12, color: LIVE.textDim, fontStyle: "italic" }}>No MD notes — add them in Song Builder</div>
          </div>
        )}

        {/* AI Suggested Calls */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: LIVE.textDim }}>Suggested Calls</div>
            <button onClick={fetchAISuggestion} disabled={aiLoading}
              style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: `1px solid ${COLORS.accentDim}`, background: COLORS.accentGlow, color: COLORS.accent, cursor: aiLoading ? "default" : "pointer", fontFamily: "'Inter', sans-serif", opacity: aiLoading ? 0.6 : 1 }}>
              {aiLoading ? "..." : "✦ AI"}
            </button>
          </div>
          {aiSuggestion ? (
            <div style={{ fontSize: 12, color: LIVE.textMuted, lineHeight: 1.8, fontFamily: "'Inter', sans-serif" }}>
              {aiSuggestion.split('\n').filter(l => l.trim()).map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <span style={{ color: COLORS.accent, flexShrink: 0 }}>•</span>
                  <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {suggestions.map((s, i) => (
                <span key={i} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: `1px solid ${LIVE.border}`, color: LIVE.textMuted, fontFamily: "'Inter', sans-serif" }}>{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── NEXT SECTION STRIP ── */}
      {nextSection ? (
        <div style={{ background: nearingEnd ? `${COLORS.accent}12` : LIVE.surface, border: `1px solid ${nearingEnd ? COLORS.accent : LIVE.border}`, borderRadius: 14, padding: "12px 16px", marginBottom: 12, transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: nearingEnd ? COLORS.accent : LIVE.textDim, marginBottom: 4 }}>
              {nearingEnd ? "⚡ Stand by for" : "Up next"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: segColor(nextSection.type) }} />
              <div style={{ fontFamily: "var(--font-display)", fontSize: nearingEnd ? 22 : 16, fontWeight: 600, color: nearingEnd ? LIVE.text : LIVE.textMuted, transition: "all 0.3s" }}>{nextSection.label}</div>
            </div>
            {nextSection.note && nearingEnd && (
              <div style={{ fontSize: 11, color: COLORS.accent, marginTop: 4, paddingLeft: 14 }}>{nextSection.note.split('\n')[0]}</div>
            )}
          </div>
          {nearingEnd && remaining > 0 && (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: COLORS.accent }}>{Math.ceil(remaining / 1000)}s</div>
          )}
        </div>
      ) : (
        <div style={{ border: `1px solid ${LIVE.border}`, borderRadius: 14, padding: "10px 16px", marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: LIVE.textDim }}>{songIndex < totalSongs - 1 ? `Last section — ${songs[songIndex + 1].title} follows` : "Service complete"}</div>
        </div>
      )}

      {/* ── CONTROLS ── */}
      <div style={{ borderTop: `1px solid ${LIVE.border}`, paddingTop: 14, marginBottom: 10 }}>

        {/* Override status */}
        {hasOverrides && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, padding: "6px 10px", borderRadius: 8, background: "rgba(74,144,217,0.08)", border: `1px solid rgba(74,144,217,0.2)` }}>
            {liveLoopActive && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "rgba(74,144,217,0.15)", color: "#4A90D9" }}>⟳ LOOP</span>}
            {liveExtraRepeats > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: COLORS.accentGlow, color: COLORS.accent }}>+{liveExtraRepeats}</span>}
            {liveEndingMode && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "rgba(46,125,82,0.12)", color: "#4CAF7D" }}>END: {liveEndingMode.toUpperCase()}</span>}
            <button onClick={clearAllOverrides} style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 6, border: `1px solid ${LIVE.border}`, background: "transparent", color: LIVE.textDim, fontSize: 10, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Clear</button>
          </div>
        )}

        {/* Primary override controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 6 }}>
          {[
            { label: liveLoopActive ? "⟳ Loop ON" : "Loop", action: handleToggleLoop, active: liveLoopActive, activeColor: "#4A90D9" },
            { label: "Extend +1", action: handleExtendOne, active: liveExtraRepeats > 0, activeColor: COLORS.accent },
            { label: liveEndingMode === "soft" ? "✓ Soft End" : liveEndingMode === "clean" ? "✓ Clean End" : "Set Ending", action: () => {
              if (!liveEndingMode) handleEndSoft();
              else if (liveEndingMode === "soft") handleEndClean();
              else setLiveEndingMode(null);
            }, active: !!liveEndingMode, activeColor: "#4CAF7D" },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action} style={{ padding: "9px 6px", borderRadius: 9, border: `1px solid ${btn.active ? btn.activeColor : LIVE.border}`, background: btn.active ? `${btn.activeColor}18` : "transparent", color: btn.active ? btn.activeColor : LIVE.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>{btn.label}</button>
          ))}
        </div>

        {/* Section/Song navigation */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 6 }}>
          {[
            { label: "◂◂ Song", action: goPrevSong, disabled: songIndex === 0 },
            { label: "◂ Prev", action: goPrevSection, disabled: sectionIndex === 0 },
            { label: "Next ▸", action: goNextSection, disabled: sectionIndex === totalSections - 1 },
            { label: "Song ▸▸", action: goNextSong, disabled: songIndex === totalSongs - 1 },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action} disabled={btn.disabled} style={{ padding: "9px 4px", borderRadius: 9, border: `1px solid ${LIVE.border}`, background: "transparent", color: btn.disabled ? LIVE.textDim : LIVE.textMuted, fontSize: 10, fontWeight: 600, cursor: btn.disabled ? "default" : "pointer", fontFamily: "'Inter', sans-serif", opacity: btn.disabled ? 0.25 : 1 }}>
              {btn.label}
            </button>
          ))}
        </div>

        {/* Jump-to nav */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
          {["verse","chorus","bridge","top"].map(type => (
            <button key={type} onClick={() => jumpToType(type)} style={{ padding: "7px 4px", borderRadius: 8, border: `1px solid ${LIVE.border}`, background: "transparent", color: LIVE.textDim, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>
              {type === "top" ? "↑ Top" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── EMERGENCY CALLS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {["Kill Track", "Count In", "Reset"].map(cmd => (
          <button key={cmd} onClick={() => { tap(cmd); if (cmd === "Reset") handleReset(); }} style={{ padding: "9px 4px", borderRadius: 9, border: `1px solid rgba(192,57,74,0.3)`, background: "rgba(192,57,74,0.06)", color: COLORS.red, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>{cmd}</button>
        ))}
      </div>

      {/* Last command echo */}
      {lastCommand && (
        <div style={{ marginTop: 12, padding: "7px 12px", borderRadius: 8, background: COLORS.accentGlow, border: `1px solid ${COLORS.accentDim}`, display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS.accent }} />
          <div style={{ fontSize: 10, color: LIVE.textDim }}>Called: <span style={{ fontWeight: 700, color: COLORS.accent }}>{lastCommand}</span></div>
        </div>
      )}
      {/* Scripture verse at bottom of normal mode */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <div style={{ fontSize: 11, fontStyle: "italic", color: LIVE.textDim, lineHeight: 1.7, marginBottom: 4, opacity: 0.6 }}>
          "Whatever you do, work at it with all your heart, as working for the Lord."
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.accent, opacity: 0.5 }}>— Colossians 3:23</div>
      </div>
    </div>
    )} {/* end normal mode */}
    </div>
  );
};

// ─── VIDEO REFERENCE DATA ─────────────────────────────────────────────────────

const VIDEO_DATA = [
  // ── TEMPO & CLICK ──
  { id:"v1",  category:"Tempo & Click",       length:"~20 min", title:"The Music Director Series (2/3) | Practical Tools (with Live Examples)", url:"https://www.youtube.com/watch?v=fpT02GlaVZE", note:"Live-service examples of an MD counting in, calling entry points, and fixing tempo drift in real time." },
  { id:"v2",  category:"Tempo & Click",       length:"~18 min", title:"Tips for MD's (Music Directors) // SUNDAY VLOG", url:"https://www.youtube.com/watch?v=VjCIw08CGTs", note:"MD mic setup, IEM mixing, and real-time counting/cueing to keep the band locked in with the click." },
  { id:"v3",  category:"Tempo & Click",       length:"~12 min", title:"How To Fix: When The Band Gets Off Click", url:"https://www.youtube.com/watch?v=aNn64GqeF2U", note:"Live Christmas service recovery — MD counts aloud and fixes grid drift so the band realigns instantly." },
  { id:"v27", category:"Tempo & Click",       length:"Short",   title:"Music director guide of the worship team", url:"https://www.youtube.com/shorts/-SXzXxCp7p0", note:"Practical MD guidance and counting cues for keeping the worship band locked in rhythm." },
  { id:"v28", category:"Tempo & Click",       length:"Short",   title:"What the band hears as they follow our music director | @elevationworship", url:"https://www.youtube.com/shorts/ERf3HxZx2Rw", note:"Pure IEM audio of the MD calling counts and cues so the band stays on tempo and grid." },
  // ── TRANSITIONS ──
  { id:"v4",  category:"Transitions",         length:"Short",   title:"How to create smooth transitions in worship", url:"https://www.youtube.com/watch?v=24RmmApPip0", note:"Churchfront demonstrates five practical techniques for MDs to call seamless song-to-song transitions." },
  { id:"v5",  category:"Transitions",         length:"~25 min", title:"Transitions in Worship | An In-Depth Case Study", url:"https://www.youtube.com/watch?v=d_eNgSHGUEY", note:"Full-service transitions with MD cues, click tempo shifts, and pads to keep flow intact between songs." },
  { id:"v6",  category:"Transitions",         length:"Short",   title:"How to Transition Between Songs in a Worship Set", url:"https://www.youtube.com/watch?v=GUVy_6_joMo", note:"Real-time options for fast-to-slow key changes using pads, swells, and MD-style counting." },
  { id:"v7",  category:"Transitions",         length:"Short",   title:"Trust in God (Transitions + MD Cues Incl.) - Elevation Worship", url:"https://www.youtube.com/watch?v=JOwq8sOu06I", note:"MD integrates body language, melodic riffs, and quick cues to call transitions mid-set." },
  { id:"v29", category:"Transitions",         length:"Short",   title:"How Elevation's music director calls chords", url:"https://www.youtube.com/shorts/dfCxJIlXSIs", note:"Real-time chord and section calling (verse/chorus/bridge) from Elevation's MD during live worship." },
  { id:"v30", category:"Transitions",         length:"Short",   title:"Music Directing a Worship Flow Moment #elevationworship", url:"https://www.youtube.com/shorts/jxnUtfgijdw", note:"MD cam clip showing smooth flow and transition cues between song sections." },
  { id:"v31", category:"Transitions",         length:"Short",   title:"Music Directing a Worship Flow Moment #elevationworship", url:"https://www.youtube.com/shorts/Z9BJOxSWWx8", note:"MD verbal and musical cues for navigating worship set transitions in real time." },
  // ── SPONTANEOUS WORSHIP ──
  { id:"v8",  category:"Spontaneous Worship", length:"~30 min", title:"Music Directing A Sunday Service - How I MD Spontaneous Moments", url:"https://www.youtube.com/watch?v=68Bpqm_lAH4", note:"Full live-service IEM mix — MD calling chords and keeping the band calm during unplanned song insertions." },
  { id:"v9",  category:"Spontaneous Worship", length:"~22 min", title:"Music Directing A SPONTANEOUS WORSHIP MOMENT ON THE FLY! w/IEM MIX & Band Cam!", url:"https://www.youtube.com/watch?v=P-RjoBQxh_Q", note:"Last-minute song change mid-set with the MD directing real-time cues, transitions, and dynamics." },
  { id:"v10", category:"Spontaneous Worship", length:"~15 min", title:"How to Flow & Play Spontaneous - Acoustic Guitar Worship Lesson", url:"https://www.youtube.com/watch?v=70SLOV_4H7I", note:"Chord progressions, dynamics, and non-verbal cues for navigating spontaneous bridges or post-song flows." },
  { id:"v11", category:"Spontaneous Worship", length:"~28 min", title:"Music Directing Spontaneous Worship Moments On A Sunday Morning", url:"https://www.youtube.com/watch?v=W-Tlk5vLu9Q", note:"Real Sunday-morning footage — click + track cues guiding the band through spontaneous extensions." },
  { id:"v32", category:"Spontaneous Worship", length:"Short",   title:"How to MD in Spontaneous Worship Moments with Caleb King", url:"https://www.youtube.com/shorts/7zirtl0H44U", note:"Direct tips on how an MD leads and navigates unplanned spontaneous worship flows." },
  { id:"v33", category:"Spontaneous Worship", length:"Short",   title:"Listen to our music director lead our team through a song!", url:"https://www.youtube.com/shorts/F2YytFtFsBU", note:"MD actively leading the team through a worship moment with real-time direction and cues." },
  { id:"v34", category:"Spontaneous Worship", length:"Short",   title:"IEM MIX - KEYS MIX #rooakhworship", url:"https://www.youtube.com/shorts/5xS-6GcUFCs", note:"MD/keys perspective during spontaneous worship with in-ear cues and flow." },
  // ── TRACK FAILURES ──
  { id:"v12", category:"Track Failures",      length:"~12 min", title:"How To Fix: When The Band Gets Off Click", url:"https://www.youtube.com/watch?v=aNn64GqeF2U", note:"Immediate MD counting and fixes when the band drifts off the click during a live service." },
  { id:"v13", category:"Track Failures",      length:"~20 min", title:"My First Time Running Tracks and Automation with Playback", url:"https://www.youtube.com/watch?v=RvuGlKJ6PPA", note:"Churchfront walks through real setup glitches and how to test and recover before going live." },
  { id:"v14", category:"Track Failures",      length:"~16 min", title:"Using Tracks In Worship - The Easy Way", url:"https://www.youtube.com/watch?v=MFYWQG3XrhI", note:"Loop Community covers track management and rehearsal tools to minimize failures on Sunday." },
  // ── DYNAMICS ──
  { id:"v15", category:"Dynamics",            length:"~35 min", title:"Worship Band Workshop - Dynamics and Arranging | Paul Baloche", url:"https://www.youtube.com/watch?v=qMtfq72S8LY", note:"Paul Baloche and band demo instrument layering, restraint, and build/pull-back techniques." },
  { id:"v16", category:"Dynamics",            length:"~10 min", title:"How Great Music Directors Guide Worship Bands", url:"https://www.youtube.com/watch?v=RGDNFXcWLAA", note:"In-ear mix of a top MD calling 'build', 'lift it up', and 'pull back' in real time." },
  { id:"v17", category:"Dynamics",            length:"~20 min", title:"The Music Director Series (2/3) | Practical Tools (with Live Examples)", url:"https://www.youtube.com/watch?v=fpT02GlaVZE", note:"Live examples of an MD calling pads-only and controlling dynamics mid-song." },
  { id:"v35", category:"Dynamics",            length:"Short",   title:"these worship STABS elevate EVERYTHING 🎹", url:"https://www.youtube.com/shorts/GuHUkilVPBw", note:"Dynamic stabs and builds that MDs can call to add energy and contrast in worship." },
  // ── UNREHEARSED SONGS ──
  { id:"v18", category:"Unrehearsed Songs",   length:"~18 min", title:"I Told My Worship Team Nothing… and Introduced a NEW Song Medley", url:"https://www.youtube.com/watch?v=1WObNs2i48U", note:"Custom cues guiding an unrehearsed medley with zero prior notice — confidence under pressure." },
  { id:"v19", category:"Unrehearsed Songs",   length:"Short",   title:"Let it Rise - AGM Worship (From the MD's Chair)", url:"https://www.youtube.com/watch?v=1BXX_w42fzg", note:"Full no-rehearsal live performance from the MD's perspective, using talkback cues for real-time arrangements." },
  { id:"v20", category:"Unrehearsed Songs",   length:"~22 min", title:"Art of A Worship Drummer | No Rehearsal | CCI HQ BAND | JAYBEE", url:"https://www.youtube.com/watch?v=Nq2RQWLHGpw", note:"Unrehearsed gospel worship session — MD calling spontaneous praise, prayer, and song changes." },
  { id:"v36", category:"Unrehearsed Songs",   length:"Short",   title:"Won't Stop Now (Remix) / Elevation Worship MD Short", url:"https://www.youtube.com/shorts/cKOozu4vlik", note:"MD cam clip of directing a worship song arrangement on the fly with minimal prep." },
  // ── REHEARSAL LEADERSHIP ──
  { id:"v21", category:"Rehearsal Leadership",length:"~14 min", title:"How To Lead A Worship Band Rehearsal", url:"https://www.youtube.com/watch?v=2PCaTHmeeNY", note:"Complete rehearsal structure (check-in, devotional, run-through, prayer) that MDs can replicate." },
  { id:"v22", category:"Rehearsal Leadership",length:"~12 min", title:"How To Structure Your Worship Rehearsals", url:"https://www.youtube.com/watch?v=YFZqN3xoZ_8", note:"Exact rehearsal framework to help MDs run focused, efficient band practices." },
  { id:"v23", category:"Rehearsal Leadership",length:"~18 min", title:"Tips for MD's (Music Directors) // SUNDAY VLOG", url:"https://www.youtube.com/watch?v=VjCIw08CGTs", note:"Rehearsal culture, preparation, and WL/MD collaboration." },
  { id:"v37", category:"Rehearsal Leadership",length:"Short",   title:"how to worship MD (pt.1) - HEAD before HANDS 👋", url:"https://www.youtube.com/shorts/Ikbk-do3k5M", note:"Mental preparation and structure MDs need before running effective rehearsals." },
  // ── WL/MD COMMUNICATION ──
  { id:"v24", category:"WL/MD Communication", length:"~20 min", title:"Does our worship band need a music director? (w/ Tracy Stingley)", url:"https://www.youtube.com/watch?v=8dr7Q9Pg-as", note:"Willow Creek MD explains quarterbacking transitions, reading WL cues, and building trust." },
  { id:"v25", category:"WL/MD Communication", length:"Short",   title:"What the band hears during worship with an MD // Battle Belongs IEM Mix", url:"https://www.youtube.com/watch?v=iUEZmBT64Lk", note:"Pure IEM audio of the MD calling verse/chorus counts while the WL leads." },
  { id:"v26", category:"WL/MD Communication", length:"~45 min", title:"The Worship Leader + MD Relationship | Alex Pappas, Nigel Hendroff & Grant Klassen", url:"https://www.youtube.com/watch?v=Fp0CaTjITh0", note:"Hillsong panel on pre-service prep, debriefs, and in-service WL/MD handoffs." },
  { id:"v38", category:"WL/MD Communication", length:"Short",   title:"What Is The Difference Between Worship Director and MD?", url:"https://www.youtube.com/shorts/oFX4O66rWs4", note:"Clearly breaks down roles and highlights the importance of WL + MD communication and collaboration." },
  { id:"v39", category:"WL/MD Communication", length:"Short",   title:"MD WKND Ep 4 | CCI Birmingham Central x West", url:"https://www.youtube.com/shorts/yBM-OrQUKlg", note:"Quick recap of MD duties during a service, showing real-time partnership with the worship leader." },
  { id:"v40", category:"WL/MD Communication", length:"Short",   title:"Did you know there was a music director talking in the ears…", url:"https://www.youtube.com/watch?v=CntiJNNnzR8", note:"Explains the hidden MD talkback role and how cues reach the band during live worship." },
];

const VIDEO_CATEGORIES = ["All", ...Array.from(new Set(VIDEO_DATA.map(v => v.category)))];

// ─── VIDEO REFERENCE PAGE ─────────────────────────────────────────────────────

const VideoPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = activeCategory === "All"
    ? VIDEO_DATA
    : VIDEO_DATA.filter(v => v.category === activeCategory);

  const getYouTubeId = (url) => {
    const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return shortsMatch[1];
    const vMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (vMatch) return vMatch[1];
    return null;
  };

  const isShorts = (url) => url.includes("/shorts/");

  const openVideo = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const CATEGORY_COLORS = {
    "Tempo & Click":        "#4A90D9",
    "Transitions":          "#7B68C8",
    "Spontaneous Worship":  "#2E9E6A",
    "Track Failures":       "#B83040",
    "Dynamics":             "#C07A0C",
    "Unrehearsed Songs":    "#5A8FA0",
    "Rehearsal Leadership": "#2E6EA6",
    "WL/MD Communication":  "#6B5CA5",
  };

  const categoryCounts = VIDEO_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === "All" ? VIDEO_DATA.length : VIDEO_DATA.filter(v => v.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="fade-in">
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 24, height: 180 }}>
        <img src="/tablet-watch.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,12,18,0.97) 0%, rgba(8,12,18,0.5) 55%, rgba(8,12,18,0.1) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 22px 18px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 6 }}>Reference Library</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px", fontFamily: "var(--font-display)" }}>Video Reference</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{VIDEO_DATA.length} curated videos by MD skill area.</div>
        </div>
      </div>

      {/* Category filter — prominent cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginBottom: 24 }}>
        {VIDEO_CATEGORIES.map(cat => {
          const isActive = activeCategory === cat;
          const color = cat === "All" ? COLORS.navy : (CATEGORY_COLORS[cat] || COLORS.accent);
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                padding: "12px 14px", borderRadius: 14, border: `2px solid ${isActive ? color : COLORS.border}`,
                background: isActive ? color : COLORS.card,
                color: isActive ? "#fff" : COLORS.textMuted,
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Inter', sans-serif", transition: "all 0.15s",
                textAlign: "left", lineHeight: 1.3
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textMuted; }}}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 2, color: isActive ? "rgba(255,255,255,0.9)" : color }}>{categoryCounts[cat]}</div>
              {cat}
            </button>
          );
        })}
      </div>

      {/* Video list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(video => {
          const isExpanded = expandedId === video.id;
          const catColor = CATEGORY_COLORS[video.category] || COLORS.accent;
          const videoId = getYouTubeId(video.url);
          const shorts = isShorts(video.url);

          return (
            <div key={video.id} style={{ borderRadius: 14, border: `1.5px solid ${isExpanded ? COLORS.accent : COLORS.border}`, background: COLORS.card, boxShadow: isExpanded ? COLORS.shadowMd : COLORS.shadow, overflow: "hidden", transition: "all 0.15s" }}>

              {/* Row — tap to expand detail, not to navigate away */}
              <button onClick={() => setExpandedId(isExpanded ? null : video.id)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "'Inter', sans-serif" }}>

                {/* Thumbnail */}
                <div style={{ width: 80, height: 52, borderRadius: 10, background: `${catColor}18`, flexShrink: 0, overflow: "hidden", position: "relative" }}>
                  {videoId && (
                    <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  )}
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: 9, marginLeft: 2 }}>▶</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: catColor, padding: "2px 8px", borderRadius: 10 }}>{video.category}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textDim, background: COLORS.surfaceAlt, padding: "2px 7px", borderRadius: 10 }}>{video.length}</span>
                    {shorts && <span style={{ fontSize: 9, fontWeight: 700, color: COLORS.red, background: COLORS.redLight, padding: "2px 6px", borderRadius: 8 }}>SHORT</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{video.title}</div>
                </div>

                <span style={{ color: isExpanded ? COLORS.accent : COLORS.textDim, fontSize: 16, flexShrink: 0 }}>{isExpanded ? "▼" : "›"}</span>
              </button>

              {/* Expanded detail — note + big Watch button */}
              {isExpanded && (
                <div className="fade-in" style={{ padding: "0 18px 18px 18px", borderTop: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.65, marginTop: 14, marginBottom: 16 }}>{video.note}</div>
                  <button
                    onClick={() => openVideo(video.url)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#FF0000", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", boxShadow: "0 4px 14px rgba(255,0,0,0.3)" }}>
                    <span style={{ fontSize: 16 }}>▶</span>
                    Watch on YouTube
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ─── GLOBAL SEARCH ────────────────────────────────────────────────────────────

const SEARCH_INDEX = [
  { label: "Home",            type: "Page", icon: "home",       page: "dashboard" },
  { label: "MD Training",     type: "Page", icon: "training",   page: "training" },
  { label: "Live Mode",       type: "Page", icon: "live",       page: "live" },
  { label: "Vocabulary",      type: "Page", icon: "vocab",      page: "vocab" },
  { label: "MD Onboarding",   type: "Page", icon: "onboarding", page: "onboarding" },
  { label: "MD Situations",   type: "Page", icon: "coaching",   page: "coaching" },
  { label: "System Manual",   type: "Page", icon: "manual",     page: "manual" },
  { label: "Song Builder",    type: "Page", icon: "builder",    page: "builder" },
  { label: "Service Builder", type: "Page", icon: "services",   page: "services" },
  { label: "Video Reference", type: "Page", icon: "videos",     page: "videos" },
  { label: "Roadmap",         type: "Page", icon: "roadmap",    page: "roadmap" },
  // System Manual parts
  ...PARTS_DATA.map(p => ({ label: `Part ${p.id}: ${p.title}`, type: "System Manual", icon: p.icon, page: "part-detail", part: p, keywords: p.summary })),
  // Vocabulary calls — each call is searchable by call name, meaning, and category
  ...VOCAB_DATA.map(v => ({ label: v.call, type: `Vocab — ${v.category}`, icon: "vocab", page: "vocab", keywords: `${v.meaning} ${v.category}` })),
  // MD Training modules
  ...MD_MODULES.map(m => ({ label: m.title, type: "Training Module", icon: "training", page: "training", keywords: m.tagline + " " + m.outcomes.join(" ") })),
  // Module sections — searchable by heading and body content
  ...MD_MODULES.flatMap(m => m.sections.map(s => ({ label: s.heading, type: `Module — ${m.title}`, icon: "training", page: "training", keywords: s.body }))),
];

const GlobalSearch = ({ onNavigate, onClose }) => {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = query.trim() === ""
    ? SEARCH_INDEX.slice(0, 11) // show just pages when empty
    : SEARCH_INDEX.filter(item => {
        const q = query.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          (item.keywords && item.keywords.toLowerCase().includes(q)) ||
          item.type.toLowerCase().includes(q)
        );
      }).slice(0, 20); // cap at 20 results

  useEffect(() => { setHighlighted(0); }, [query]);

  const go = (item) => { if (item.part) onNavigate("part-detail", item.part); else onNavigate(item.page, null); onClose(); };

  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    if (e.key === "Enter")     { if (results[highlighted]) go(results[highlighted]); }
    if (e.key === "Escape")    { onClose(); }
  };

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal fade-in" onClick={e => e.stopPropagation()}>
        <div className="search-input-row">
          <span style={{ fontSize: 16, color: COLORS.textDim }}>⌕</span>
          <input ref={inputRef} className="search-input-field" placeholder="Search vocabulary, modules, manual…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey} />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: COLORS.textDim, cursor: "pointer", fontSize: 14 }}>✕</button>}
        </div>
        <div className="search-results">
          {results.length === 0 ? (
            <div className="search-empty">No results for "{query}"</div>
          ) : (
            results.map((item, i) => (
              <button key={i} className={`search-result-item ${i === highlighted ? "highlighted" : ""}`} onClick={() => go(item)} onMouseEnter={() => setHighlighted(i)}>
                <div className="search-result-icon">
                  <Icon name={item.icon} size={16} color="#64748B" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="search-result-label">{item.label}</div>
                  <div className="search-result-type">{item.type}</div>
                </div>
              </button>
            ))
          )}
        </div>
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 16 }}>
          {[["↑↓","navigate"],["↵","open"],["esc","close"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: COLORS.textDim, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "1px 6px", fontFamily: "'JetBrains Mono', monospace" }}>{k}</span>
              <span style={{ fontSize: 11, color: COLORS.textDim }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage]             = useState("dashboard");
  const [selectedPart, setSelectedPart] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [editSongId, setEditSongId] = useState(null);
  const [toast, setToast]           = useState(null); // { message, type: "success"|"error" }

  // ── PCO OAuth callback detection (app-level) ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("pco_success")) {
      const conn = {
        pcoUserId: params.get("pco_user_id"),
        pcoOrg: params.get("pco_org"),
        pcoName: params.get("pco_name"),
      };
      try { localStorage.setItem("wp-pco-connection", JSON.stringify(conn)); } catch {}
      window.history.replaceState({}, "", window.location.pathname);
      // Navigate to Service Builder and show success toast
      setPage("services");
      setToast({ message: `Connected to ${conn.pcoOrg || "Planning Center"} — tap Import Plans to get started.`, type: "success" });
      setTimeout(() => setToast(null), 5000);
    }
    if (params.get("pco_error")) {
      window.history.replaceState({}, "", window.location.pathname);
      setPage("services");
      setToast({ message: `PCO connection failed. Please try again.`, type: "error" });
      setTimeout(() => setToast(null), 4000);
    }
  }, []);

  // Role selector — shown once on first open
  const [role, setRole] = useState(() => {
    try { return localStorage.getItem("wp-role") || null; } catch { return null; }
  });
  const [showRoleSelector, setShowRoleSelector] = useState(!role);

  const handleRoleSelect = (selectedRole) => {
    try { localStorage.setItem("wp-role", selectedRole); } catch {}
    setRole(selectedRole);
    setShowRoleSelector(false);
    // Route to the right starting page based on role
    const route = ROLES.find(r => r.id === selectedRole)?.route || "dashboard";
    setPage(route);
  };

  const seed = loadAppState();
  const [songLibrary, setSongLibrary]       = useState(seed.songLibrary);
  const [services, setServices]             = useState(seed.services);
  const [activeServiceId, setActiveServiceId] = useState(seed.activeServiceId);
  const [moduleProgress, setModuleProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wp-module-progress") || "{}"); } catch { return {}; }
  });

  useEffect(() => { saveAppState({ songLibrary, services, activeServiceId }); }, [songLibrary, services, activeServiceId]);
  useEffect(() => { try { localStorage.setItem("wp-module-progress", JSON.stringify(moduleProgress)); } catch {} }, [moduleProgress]);

  const handleCompleteModule = (moduleId) => setModuleProgress(prev => ({ ...prev, [moduleId]: true }));
  const activeService = services.find(s => s.id === activeServiceId) || null;

  const handleSaveSong = (song) => setSongLibrary(lib => { const exists = lib.find(s => s.id === song.id); return exists ? lib.map(s => s.id === song.id ? song : s) : [...lib, song]; });
  const handleDuplicateSong = (song) => {
    const clone = { ...song, id: mkId(), title: `${song.title} (Copy)`, sections: song.sections.map(sec => ({ ...sec, id: mkId(), options: sec.options ? [...sec.options] : [] })) };
    setSongLibrary(lib => [...lib, clone]);
  };
  const handleSaveService = (svc) => setServices(svcs => { const exists = svcs.find(s => s.id === svc.id); return exists ? svcs.map(s => s.id === svc.id ? svc : s) : [...svcs, svc]; });
  const handleDuplicateService = (svc) => { const clone = { ...svc, id: mkId(), title: `${svc.title} (Copy)`, blocks: svc.blocks ? svc.blocks.map(b => ({ ...b, id: mkId(), notes: { ...b.notes } })) : [], songIds: [...(svc.songIds || [])] }; setServices(svcs => [...svcs, clone]); };
  const handleDeleteService = (svcId) => { setServices(svcs => svcs.filter(s => s.id !== svcId)); setActiveServiceId(id => id === svcId ? null : id); };

  const navigate = (targetPage, part) => { if (part) { setSelectedPart(part); setPage("part-detail"); } else setPage(targetPage); };

  const nav = [
    { id: "dashboard",  icon: "home",       label: "Home" },
    { id: "training",   icon: "training",   label: "MD Training" },
    { id: "manual",     icon: "manual",     label: "System Manual" },
    { id: "vocab",      icon: "vocab",      label: "Vocabulary" },
    { id: "onboarding", icon: "onboarding", label: "Onboarding" },
    { id: "coaching",   icon: "coaching",   label: "MD Situations" },
    { id: "videos",     icon: "videos",     label: "Video Reference" },
    { id: "builder",    icon: "builder",    label: "Song Builder" },
    { id: "services",   icon: "services",   label: "Service Builder" },
    { id: "live",       icon: "live",       label: "Live Mode" },
    { id: "pilots",     icon: "pilots",     label: "The Pilots Page" },
    { id: "roadmap",    icon: "roadmap",    label: "Roadmap" },
  ];

  const renderPage = () => {
    switch (page) {
      case "dashboard":   return <Dashboard setPage={setPage} setSelectedPart={setSelectedPart} moduleProgress={moduleProgress} />;
      case "starthere":   return <StartHerePage setPage={setPage} />;
      case "training":    return <TrainingPage setPage={setPage} moduleProgress={moduleProgress} onCompleteModule={handleCompleteModule} />;
      case "vocab":       return <VocabPage />;
      case "onboarding":  return <OnboardingPage />;
      case "coaching":    return <CoachingPage />;
      case "manual":      return <ManualPage setSelectedPart={setSelectedPart} setPage={setPage} />;
      case "part-detail": return selectedPart ? <PartDetail part={selectedPart} setPage={setPage} /> : null;
      case "videos":      return <VideoPage />;
      case "pilots":      return <PilotsPage setPage={setPage} songLibrary={songLibrary} onSaveSong={handleSaveSong} />;
      case "roadmap":     return <RoadmapPage setPage={setPage} />;
      case "builder":     return <SongBuilderPage songLibrary={songLibrary} onSaveSong={handleSaveSong} onDuplicateSong={handleDuplicateSong} editSongId={editSongId} setPage={(p, id) => { setEditSongId(id ?? null); setPage(p); }} navigateTo={setPage} />;
      case "services":    return <ServiceBuilderPage services={services} songLibrary={songLibrary} activeServiceId={activeServiceId} onSaveService={handleSaveService} onDuplicateService={handleDuplicateService} onDeleteService={handleDeleteService} onSetActive={setActiveServiceId} onLaunch={() => setPage("live")} onSaveSong={handleSaveSong} />;
      case "live":        return <LiveModePage activeService={activeService} songLibrary={songLibrary} onGoToServiceBuilder={() => setPage("services")} />;
      default:            return <Dashboard setPage={setPage} setSelectedPart={setSelectedPart} />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      {showRoleSelector && createPortal(<RoleSelector onSelect={handleRoleSelect} />, document.body)}

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          zIndex: 99999, maxWidth: 420, width: "calc(100% - 40px)",
          padding: "14px 18px", borderRadius: 14,
          background: toast.type === "success" ? COLORS.navy : "#B84455",
          border: `1px solid ${toast.type === "success" ? COLORS.accent : "rgba(255,255,255,0.2)"}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", gap: 12,
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: toast.type === "success" ? COLORS.accent : "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: "#fff" }}>{toast.type === "success" ? "✓" : "!"}</span>
          </div>
          <div style={{ flex: 1, fontSize: 13, color: "#fff", fontFamily: "'Inter', sans-serif", fontWeight: 500, lineHeight: 1.4 }}>
            {toast.message}
          </div>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 16, cursor: "pointer", flexShrink: 0, padding: 0 }}>✕</button>
        </div>
      )}
      <div className="app-container">
        <nav className="sidebar">
  <button
    className="sidebar-logo"
    onClick={() => setPage("dashboard")}
    aria-label="WorshipPilot — go to dashboard"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L19 20L12 16L5 20L12 3Z" fill="#C49A3C" fillOpacity="0.92"/>
      <path d="M12 3L19 20L12 16L5 20L12 3Z" stroke="#C49A3C" strokeWidth="0.6" strokeLinejoin="round"/>
    </svg>
    <div className="nav-tooltip">WorshipPilot</div>
  </button>
  <div className="nav-divider" />
  {nav.slice(0, 6).map(n => (
    <button
      key={n.id}
      className={`nav-btn ${page === n.id || (page === "part-detail" && n.id === "manual") ? "active" : ""}`}
      onClick={() => setPage(n.id)}
      aria-label={n.label}
    >
      <Icon name={n.icon} size={19} />
      <div className="nav-tooltip">{n.label}</div>
    </button>
  ))}
  <div className="nav-divider" />
  {nav.slice(6).map(n => (
    <button
      key={n.id}
      className={`nav-btn ${page === n.id ? "active" : ""}`}
      onClick={() => setPage(n.id)}
      aria-label={n.label}
    >
      <Icon name={n.icon} size={19} />
      <div className="nav-tooltip">{n.label}</div>
    </button>
  ))}
  <div style={{ flex: 1 }} />
  <div className="nav-divider" />
  <button className="search-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
    <Icon name="search" size={19} />
    <div className="nav-tooltip">Search (⌘K)</div>
  </button>
</nav>
        <main className="main-content" style={{ padding: page === "live" ? 0 : undefined }}>
          <div className={page === "live" ? "" : "page-content"}>
            {renderPage()}
          </div>
        </main>
      </div>
      {searchOpen && <GlobalSearch onNavigate={navigate} onClose={() => setSearchOpen(false)} />}
    </>
  );
}

