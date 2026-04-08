import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const COLORS = {
  bg:          "#F2F0EC",
  surface:     "#FFFFFF",
  surfaceAlt:  "#EDEAE3",
  surfaceGlass:"rgba(255,255,255,0.72)",
  card:        "#FFFFFF",
  border:      "#E4DFD6",
  borderMid:   "#CEC8BC",
  sidebar:     "#080F1A",
  sidebarBorder:"#131F30",
  sidebarIcon: "#3E5870",
  sidebarIconActive: "#E8A838",
  accent:      "#C07A0C",
  accentDim:   "#8A5208",
  accentLight: "#FDF3E3",
  accentGlow:  "rgba(192,122,12,0.12)",
  accentGradient: "linear-gradient(135deg, #C07A0C 0%, #E8A838 100%)",
  navy:        "#080F1A",
  navyMid:     "#1A2E44",
  text:        "#18120C",
  textMuted:   "#635D57",
  textDim:     "#9A948E",
  green:       "#1E6B42",
  greenLight:  "#E6F4EE",
  red:         "#B83040",
  redLight:    "#FCEEF0",
  blue:        "#1E5E96",
  blueLight:   "#E8F1FA",
  // Multi-layer shadow system
  shadow:      "0 1px 2px rgba(8,15,26,0.04), 0 4px 16px rgba(8,15,26,0.06)",
  shadowMd:    "0 2px 4px rgba(8,15,26,0.05), 0 8px 24px rgba(8,15,26,0.09), 0 20px 40px rgba(8,15,26,0.05)",
  shadowLg:    "0 4px 8px rgba(8,15,26,0.06), 0 16px 40px rgba(8,15,26,0.12), 0 40px 80px rgba(8,15,26,0.08)",
  shadowAccent:"0 4px 20px rgba(192,122,12,0.25), 0 1px 3px rgba(192,122,12,0.15)",
};

// Live mode — deep dark, console-like
const LIVE = {
  bg:        "#060D18",
  bgGrad:    "linear-gradient(180deg, #060D18 0%, #090F1E 100%)",
  surface:   "#0C1525",
  card:      "#101A2C",
  cardGlass: "rgba(16,26,44,0.9)",
  border:    "#182236",
  borderGlow:"rgba(232,168,56,0.2)",
  text:      "#EEE8E0",
  textMuted: "#7A9AB8",
  textDim:   "#364E66",
};

// SVG noise texture (inline, tiny, tileable)
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${COLORS.bg};
    background-image: ${NOISE_SVG};
    color: ${COLORS.text};
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.borderMid}; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: ${COLORS.textDim}; }

  .app-container {
    display: flex;
    height: 100vh;
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  /* ── SIDEBAR ── */
  .sidebar {
    width: 56px;
    background: ${COLORS.sidebar};
    background-image: ${NOISE_SVG};
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 14px 0;
    gap: 2px;
    flex-shrink: 0;
    z-index: 200;
    overflow: visible;
    border-right: 1px solid ${COLORS.sidebarBorder};
    box-shadow: 2px 0 20px rgba(0,0,0,0.15);
    position: relative;
  }

  .sidebar-logo {
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: ${COLORS.accent};
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    margin-bottom: 14px;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, rgba(192,122,12,0.15) 0%, rgba(232,168,56,0.08) 100%);
    border: 1px solid rgba(192,122,12,0.3);
    box-shadow: 0 2px 8px rgba(192,122,12,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
    transition: all 0.2s ease;
  }
  .sidebar-logo:hover {
    background: linear-gradient(135deg, rgba(192,122,12,0.25) 0%, rgba(232,168,56,0.15) 100%);
    box-shadow: 0 4px 16px rgba(192,122,12,0.25);
  }

  .nav-btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: ${COLORS.sidebarIcon};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    font-size: 16px;
    position: relative;
    overflow: visible;
  }
  .nav-btn:hover {
    background: rgba(255,255,255,0.06);
    color: #7A9AB8;
  }
  .nav-btn.active {
    background: linear-gradient(135deg, rgba(192,122,12,0.18) 0%, rgba(232,168,56,0.10) 100%);
    color: ${COLORS.accent};
    box-shadow: inset 0 1px 0 rgba(232,168,56,0.1);
  }

  .nav-tooltip {
    position: absolute;
    left: 58px;
    background: linear-gradient(135deg, #0D1B2A 0%, #162033 100%);
    color: #E8E2D8;
    padding: 7px 14px;
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
    box-shadow: 0 8px 24px rgba(0,0,0,0.45);
    font-family: 'Inter', sans-serif;
    letter-spacing: 0.2px;
  }
  .nav-tooltip::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-right: 5px solid #1E3248;
  }
  .nav-tooltip::after {
    content: '';
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-right: 4px solid #162033;
  }
  .nav-btn:hover .nav-tooltip {
    opacity: 1;
    transform: translateX(0);
  }

  .nav-divider {
    width: 24px;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${COLORS.sidebarBorder}, transparent);
    margin: 6px 0;
  }

  /* ── MAIN ── */
  .main-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 28px 24px;
    background: ${COLORS.bg};
    background-image: ${NOISE_SVG};
    min-width: 0;
  }

  /* ── PAGE HEADER ── */
  .page-header { margin-bottom: 32px; }

  .page-eyebrow {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: ${COLORS.accent};
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Outfit', sans-serif;
  }
  .page-eyebrow::before {
    content: '';
    width: 20px;
    height: 2.5px;
    background: ${COLORS.accentGradient};
    border-radius: 2px;
    flex-shrink: 0;
  }

  .page-title {
    font-family: 'Outfit', sans-serif;
    font-size: 36px;
    font-weight: 600;
    color: ${COLORS.navy};
    line-height: 1.1;
    letter-spacing: -0.5px;
  }
  .page-sub {
    font-size: 14px;
    color: ${COLORS.textMuted};
    margin-top: 8px;
    line-height: 1.65;
    max-width: 520px;
    font-weight: 400;
  }

  /* ── CARDS ── */
  .card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 18px;
    padding: 24px;
    box-shadow: ${COLORS.shadow};
    transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
    position: relative;
  }
  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 18px;
    background: linear-gradient(160deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%);
    pointer-events: none;
  }
  button.card { cursor: pointer; text-align: left; width: 100%; font-family: 'Inter', sans-serif; }
  .card:hover {
    border-color: ${COLORS.borderMid};
    box-shadow: ${COLORS.shadowMd};
    transform: translateY(-1px);
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px;
  }

  .card-title {
    font-family: 'Outfit', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: ${COLORS.navy};
    margin-bottom: 6px;
    letter-spacing: -0.1px;
  }
  .card-desc { font-size: 13px; color: ${COLORS.textMuted}; line-height: 1.55; }

  .card-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, ${COLORS.accentLight} 0%, rgba(253,243,227,0.5) 100%);
    border: 1px solid rgba(192,122,12,0.15);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(192,122,12,0.08);
  }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
    border: none;
    font-family: 'Inter', sans-serif;
    letter-spacing: 0.1px;
    position: relative;
    overflow: hidden;
  }
  .btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%);
    pointer-events: none;
  }
  .btn-primary {
    background: ${COLORS.accentGradient};
    color: #fff;
    box-shadow: ${COLORS.shadowAccent};
  }
  .btn-primary:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(192,122,12,0.35), 0 2px 6px rgba(192,122,12,0.2);
  }
  .btn-primary:active { transform: translateY(0); filter: brightness(0.96); }

  .btn-secondary {
    background: linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(8,15,26,0.3), 0 1px 2px rgba(8,15,26,0.2);
  }
  .btn-secondary:hover {
    filter: brightness(1.15);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(8,15,26,0.35);
  }

  .btn-ghost {
    background: ${COLORS.surfaceGlass};
    color: ${COLORS.textMuted};
    border: 1px solid ${COLORS.border};
    box-shadow: ${COLORS.shadow};
    backdrop-filter: blur(8px);
  }
  .btn-ghost:hover {
    color: ${COLORS.text};
    border-color: ${COLORS.borderMid};
    background: ${COLORS.surface};
  }

  /* ── SECTION LABEL ── */
  .section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: ${COLORS.textDim};
    margin: 32px 0 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, ${COLORS.border}, transparent);
  }

  /* ── BADGE ── */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  .badge-gold {
    background: linear-gradient(135deg, ${COLORS.accentLight} 0%, rgba(253,243,227,0.7) 100%);
    color: ${COLORS.accent};
    border: 1px solid rgba(192,122,12,0.2);
  }
  .badge-green {
    background: ${COLORS.greenLight};
    color: ${COLORS.green};
    border: 1px solid rgba(30,107,66,0.2);
  }
  .badge-blue {
    background: ${COLORS.blueLight};
    color: ${COLORS.blue};
    border: 1px solid rgba(30,94,150,0.2);
  }
  .badge-red {
    background: ${COLORS.redLight};
    color: ${COLORS.red};
    border: 1px solid rgba(184,48,64,0.2);
  }
  .badge-navy {
    background: rgba(8,15,26,0.07);
    color: ${COLORS.navy};
    border: 1px solid rgba(8,15,26,0.13);
  }

  /* ── PROGRESS BAR ── */
  .progress-track {
    background: ${COLORS.border};
    border-radius: 4px;
    height: 3px;
    overflow: hidden;
    margin-top: 12px;
  }
  .progress-fill {
    height: 100%;
    background: ${COLORS.accentGradient};
    border-radius: 4px;
    transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── DETAIL PANEL ── */
  .detail-panel {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 18px;
    overflow: hidden;
    box-shadow: ${COLORS.shadow};
  }
  .detail-header {
    padding: 20px 24px;
    border-bottom: 1px solid ${COLORS.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(180deg, ${COLORS.surfaceAlt} 0%, ${COLORS.surface} 100%);
  }
  .detail-body { padding: 24px; }

  /* ── ACCORDION ── */
  .accordion-item { border-bottom: 1px solid ${COLORS.border}; }
  .accordion-trigger {
    width: 100%;
    background: none;
    border: none;
    padding: 16px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    color: ${COLORS.text};
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    text-align: left;
    transition: color 0.15s;
    gap: 12px;
  }
  .accordion-trigger:hover { color: ${COLORS.accent}; }
  .accordion-chevron {
    color: ${COLORS.textDim};
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
    font-size: 11px;
    flex-shrink: 0;
  }
  .accordion-chevron.open { transform: rotate(180deg); color: ${COLORS.accent}; }
  .accordion-content {
    padding-bottom: 18px;
    font-size: 13.5px;
    color: ${COLORS.textMuted};
    line-height: 1.78;
  }

  /* ── COACHING / CHAT ── */
  .chat-container {
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: 460px;
    overflow-y: auto;
    padding-right: 4px;
  }
  .chat-bubble {
    padding: 13px 16px;
    border-radius: 14px;
    font-size: 13.5px;
    line-height: 1.65;
    max-width: 86%;
  }
  .chat-bubble.user {
    background: linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%);
    color: #EEE8E0;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
    box-shadow: 0 2px 8px rgba(8,15,26,0.2);
  }
  .chat-bubble.ai {
    background: ${COLORS.surfaceAlt};
    border: 1px solid ${COLORS.border};
    color: ${COLORS.text};
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  }
  .chat-bubble.loading {
    background: ${COLORS.surfaceAlt};
    border: 1px solid ${COLORS.border};
    color: ${COLORS.textDim};
    align-self: flex-start;
    font-style: italic;
  }

  .chat-input-row { display: flex; gap: 10px; margin-top: 16px; }
  .chat-input {
    flex: 1;
    background: ${COLORS.surfaceAlt};
    border: 1.5px solid ${COLORS.border};
    border-radius: 12px;
    padding: 11px 16px;
    color: ${COLORS.text};
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    resize: none;
    min-height: 46px;
    max-height: 120px;
  }
  .chat-input:focus {
    border-color: ${COLORS.accent};
    box-shadow: 0 0 0 3px rgba(192,122,12,0.1);
  }
  .chat-input::placeholder { color: ${COLORS.textDim}; }

  /* ── SCENARIO CARD ── */
  .scenario-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.22s ease;
    box-shadow: ${COLORS.shadow};
    position: relative;
    overflow: hidden;
  }
  .scenario-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, rgba(255,255,255,0.5) 0%, transparent 50%);
    pointer-events: none;
  }
  .scenario-card:hover {
    border-color: rgba(192,122,12,0.4);
    box-shadow: ${COLORS.shadowMd}, 0 0 0 1px rgba(192,122,12,0.1);
    transform: translateY(-3px);
  }

  /* ── TABLE ── */
  .ref-table { width: 100%; border-collapse: collapse; }
  .ref-table th {
    text-align: left;
    padding: 10px 16px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: ${COLORS.textDim};
    border-bottom: 1px solid ${COLORS.border};
    background: linear-gradient(180deg, ${COLORS.surfaceAlt} 0%, ${COLORS.surface} 100%);
  }
  .ref-table td {
    padding: 12px 16px;
    font-size: 13px;
    border-bottom: 1px solid ${COLORS.border};
    vertical-align: top;
  }
  .ref-table tr:last-child td { border-bottom: none; }
  .ref-table tr:hover td { background: ${COLORS.surfaceAlt}; }
  .call-code {
    font-family: 'JetBrains Mono', monospace;
    color: ${COLORS.accent};
    font-size: 12.5px;
    font-weight: 500;
  }

  /* ── ROADMAP ── */
  .roadmap-phase {
    display: flex;
    gap: 20px;
    padding: 22px 0;
    border-bottom: 1px solid ${COLORS.border};
    align-items: flex-start;
  }
  .phase-number {
    width: 40px; height: 40px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif;
    font-size: 18px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .phase-title { font-weight: 600; font-size: 15px; margin-bottom: 3px; color: ${COLORS.navy}; }
  .phase-timing { font-size: 11px; color: ${COLORS.accent}; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 10px; }
  .phase-items { font-size: 13px; color: ${COLORS.textMuted}; line-height: 1.9; }

  /* ── ONBOARDING ── */
  .onboard-step {
    display: flex;
    gap: 20px;
    padding: 20px 0;
    border-bottom: 1px solid ${COLORS.border};
  }
  .step-dot {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .step-dot.complete { background: ${COLORS.green}; color: #fff; box-shadow: 0 2px 8px rgba(30,107,66,0.3); }
  .step-dot.active { background: ${COLORS.accentGradient}; color: #fff; box-shadow: ${COLORS.shadowAccent}; }
  .step-dot.upcoming { background: ${COLORS.surfaceAlt}; color: ${COLORS.textDim}; border: 1.5px solid ${COLORS.border}; }
  .step-line { width: 1.5px; flex: 1; background: linear-gradient(180deg, ${COLORS.border}, transparent); margin: 4px 0; min-height: 20px; }

  /* ── SEARCH ── */
  .search-overlay {
    position: absolute;
    inset: 0;
    background: rgba(8,15,26,0.55);
    backdrop-filter: blur(12px) saturate(1.2);
    -webkit-backdrop-filter: blur(12px) saturate(1.2);
    z-index: 200;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 80px;
  }
  .search-modal {
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 20px;
    width: 100%;
    max-width: 500px;
    margin: 0 20px;
    overflow: hidden;
    box-shadow: ${COLORS.shadowLg}, 0 0 0 1px rgba(8,15,26,0.04);
  }
  .search-input-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(228,223,214,0.7);
  }
  .search-input-field {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: ${COLORS.text};
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 400;
  }
  .search-input-field::placeholder { color: ${COLORS.textDim}; }
  .search-results { max-height: 360px; overflow-y: auto; }
  .search-result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 20px;
    cursor: pointer;
    transition: background 0.1s;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    font-family: 'Inter', sans-serif;
  }
  .search-result-item:hover { background: rgba(240,238,233,0.8); }
  .search-result-item.highlighted { background: ${COLORS.accentLight}; }
  .search-result-icon {
    width: 34px; height: 34px;
    border-radius: 9px;
    background: ${COLORS.surfaceAlt};
    border: 1px solid ${COLORS.border};
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }
  .search-result-label { font-size: 14px; font-weight: 500; color: ${COLORS.text}; }
  .search-result-type { font-size: 11px; color: ${COLORS.textDim}; margin-top: 1px; }
  .search-result-item.highlighted .search-result-label { color: ${COLORS.accent}; }
  .search-empty { padding: 28px 20px; text-align: center; font-size: 13px; color: ${COLORS.textDim}; }
  .search-btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: ${COLORS.sidebarIcon};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.15s ease;
    position: relative;
    flex-shrink: 0;
    overflow: visible;
  }
  .search-btn:hover { background: rgba(255,255,255,0.06); color: #7A9AB8; }
  .search-btn:hover .nav-tooltip { opacity: 1; transform: translateX(0); }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeUp 0.28s cubic-bezier(0.4,0,0.2,1) forwards; }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
  }
  .pulsing { animation: pulse 1.6s ease-in-out infinite; }

  @keyframes shimmer {
    from { background-position: -200% 0; }
    to   { background-position: 200% 0; }
  }

  /* ── STAT PILL ── */
  .stat-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    background: ${COLORS.surfaceGlass};
    border: 1px solid ${COLORS.border};
    border-radius: 24px;
    box-shadow: ${COLORS.shadow};
    backdrop-filter: blur(8px);
  }

  /* ── INPUT ── */
  .field-input {
    width: 100%;
    background: ${COLORS.surfaceAlt};
    border: 1.5px solid ${COLORS.border};
    border-radius: 10px;
    padding: 10px 14px;
    color: ${COLORS.text};
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 400;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .field-input:focus {
    border-color: ${COLORS.accent};
    box-shadow: 0 0 0 3px rgba(192,122,12,0.1);
    background: ${COLORS.surface};
  }

  /* ── RESPONSIVE ── */
  .page-content {
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (min-width: 1024px) {
    .main-content { padding: 44px 56px; }
    .page-title { font-size: 40px; }
    .two-col { grid-template-columns: 1fr 1fr; gap: 16px; }
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    .main-content { padding: 32px 36px; }
  }
  @media (max-width: 640px) {
    .main-content { padding: 20px 16px; }
    .card-grid { grid-template-columns: 1fr; }
    .page-title { font-size: 26px; }
    .two-col { grid-template-columns: 1fr; }
  }

  /* ── HERO BANNER ── */
  .hero-banner {
    position: relative;
    border-radius: 22px;
    overflow: hidden;
    margin-bottom: 36px;
    background: linear-gradient(135deg, #060D18 0%, #0D1B2E 40%, #111E30 70%, #0A1220 100%);
    box-shadow: 0 8px 40px rgba(8,15,26,0.35), 0 2px 8px rgba(8,15,26,0.2);
  }
  /* Ambient light leak from top-left */
  .hero-banner::before {
    content: '';
    position: absolute;
    top: -60px;
    left: -40px;
    width: 380px;
    height: 260px;
    background: radial-gradient(ellipse, rgba(192,122,12,0.22) 0%, rgba(232,168,56,0.08) 45%, transparent 70%);
    pointer-events: none;
  }
  /* Subtle right-side cool light */
  .hero-banner::after {
    content: '';
    position: absolute;
    bottom: -30px;
    right: -20px;
    width: 280px;
    height: 200px;
    background: radial-gradient(ellipse, rgba(30,94,150,0.18) 0%, transparent 65%);
    pointer-events: none;
  }
  .hero-banner-inner {
    position: relative;
    z-index: 2;
    padding: 36px 36px 32px;
  }
  @media (max-width: 640px) {
    .hero-banner-inner { padding: 28px 22px 24px; }
  }

  /* Stage floor reflection — horizontal line near bottom */
  .hero-stage-line {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(192,122,12,0.4), rgba(232,168,56,0.3), transparent);
    z-index: 3;
  }

  /* ── TRUST BAR ── */
  .trust-bar {
    background: linear-gradient(135deg, #FFFBF5 0%, #FDF5E6 100%);
    border: 1px solid rgba(192,122,12,0.2);
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 32px;
    box-shadow: 0 2px 12px rgba(192,122,12,0.06);
  }

  /* ── VISUAL SECTION DIVIDER ── */
  .section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, ${COLORS.accent}30, ${COLORS.accent}50, ${COLORS.accent}30, transparent);
    margin: 36px 0;
    position: relative;
  }
  .section-divider::after {
    content: '';
    position: absolute;
    top: -3px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${COLORS.accent};
    opacity: 0.5;
  }

  /* ── FEATURE SPOTLIGHT ── */
  .feature-spotlight {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    background: linear-gradient(135deg, ${COLORS.navy} 0%, #0D1B2E 60%, #162033 100%);
    padding: 28px;
    box-shadow: ${COLORS.shadowMd};
  }
  .feature-spotlight::before {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 220px;
    height: 220px;
    background: radial-gradient(ellipse, rgba(192,122,12,0.15) 0%, transparent 65%);
    pointer-events: none;
  }
  .feature-spotlight-inner { position: relative; z-index: 2; }
`;


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
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: COLORS.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.accent, marginBottom: 12 }}>Welcome to WorshipPilot</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 700, color: COLORS.navy, lineHeight: 1.2, marginBottom: 10 }}>What best describes you?</div>
          <div style={{ fontSize: 14, color: COLORS.textMuted }}>We'll point you to the right starting place.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {ROLES.map(role => (
            <button key={role.id} onClick={() => setSelected(role.id)}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", background: COLORS.card, border: `2px solid ${selected === role.id ? COLORS.accent : COLORS.border}`, borderRadius: 14, cursor: "pointer", textAlign: "left", fontFamily: "'Inter', sans-serif", boxShadow: selected === role.id ? COLORS.shadowMd : COLORS.shadow, transition: "all 0.15s" }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: selected === role.id ? COLORS.accentLight : COLORS.surfaceAlt, border: `1px solid ${selected === role.id ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                <Icon name={role.icon} size={18} color={selected === role.id ? COLORS.accent : COLORS.textDim} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: selected === role.id ? COLORS.navy : COLORS.navy, marginBottom: 2, fontFamily: "'Outfit', sans-serif" }}>{role.label}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.4 }}>{role.desc}</div>
              </div>
              {selected === role.id && <div style={{ width: 20, height: 20, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 11, color: "#fff", fontWeight: 800 }}>✓</span></div>}
            </button>
          ))}
        </div>
        <button onClick={() => { if (selected) onSelect(selected); }}
          disabled={!selected}
          style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: selected ? COLORS.accent : COLORS.border, color: selected ? "#fff" : COLORS.textDim, fontSize: 15, fontWeight: 700, cursor: selected ? "pointer" : "default", fontFamily: "'Outfit', sans-serif", transition: "all 0.2s" }}>
          Get started →
        </button>
      </div>
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
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: COLORS.navy, marginBottom: 8 }}>
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
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 600, color: COLORS.navy, marginBottom: 20, lineHeight: 1.4 }}>{q.question || q.q}</div>
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
    <div className="fade-in" style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: COLORS.accentLight, border: `1px solid rgba(192,122,12,0.25)`, borderRadius: 12, marginBottom: 16 }}>
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
          <span style={{ fontSize: 13.5, color: COLORS.textMuted, lineHeight: 1.78 }}>{rest}</span>
        </div>
      );
    } else if (/^[-•]\s/.test(line)) {
      // Bullet item
      const rest = line.replace(/^[-•]\s/, "");
      elements.push(
        <div key={i} style={{ display: "flex", gap: 9, marginBottom: 5, alignItems: "flex-start", paddingLeft: 4 }}>
          <span style={{ color: COLORS.accent, fontSize: 11, flexShrink: 0, marginTop: 3, lineHeight: 1 }}>·</span>
          <span style={{ fontSize: 13.5, color: COLORS.textMuted, lineHeight: 1.7 }}>{rest}</span>
        </div>
      );
    } else if (line.endsWith(":") && line.length < 60 && !line.startsWith("e.g")) {
      // Short line ending in colon = section header
      elements.push(
        <div key={i} style={{ fontWeight: 700, color: COLORS.navy, fontSize: 13, marginTop: 14, marginBottom: 6, fontFamily: "'Outfit', sans-serif" }}>{line}</div>
      );
    } else {
      // Normal paragraph text
      elements.push(
        <p key={i} style={{ fontSize: 13.5, color: COLORS.textMuted, lineHeight: 1.78, marginBottom: 8 }}>{line}</p>
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
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 600, color: COLORS.navy, lineHeight: 1.3, marginBottom: 10 }}>A training and execution system for Worship Music Directors.</div>
        <div style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.7 }}>This app trains and equips Music Directors to confidently lead a worship team — both in rehearsal and live on Sunday. It combines structured training modules with a real-time cue engine so you can learn the role and then execute it with clarity.</div>
      </div>

      <div className="section-label">Your path forward</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {steps.map((step, i) => (
          <button key={i} onClick={() => setPage(step.page)}
            style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "'Inter', sans-serif", boxShadow: COLORS.shadow, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: COLORS.accentLight, border: `1.5px solid rgba(184,114,10,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.accent, flexShrink: 0 }}>{step.num}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy, marginBottom: 2 }}>{step.label}</div>
              <div style={{ fontSize: 12, color: COLORS.textDim }}>{step.desc}</div>
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
            <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.accentLight, border: `1px solid rgba(192,122,12,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={mod.icon} size={18} color={COLORS.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, color: COLORS.navy, marginBottom: 2 }}>Module {i + 1} — {mod.title}</div>
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
            <div style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.accentLight, border: `1px solid rgba(192,122,12,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Icon name={item.icon} size={19} color={COLORS.accent} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: COLORS.textDim, lineHeight: 1.4 }}>{item.desc}</div>
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
          <div style={{ width: 48, height: 48, borderRadius: 14, background: COLORS.accentLight, border: `1px solid rgba(192,122,12,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, marginTop: 6 }}>
            <Icon name={activeModule.icon} size={24} color={COLORS.accent} />
          </div>
          <div className="page-title">{activeModule.title}</div>
          <div className="page-sub">{activeModule.tagline}</div>
        </div>

        {/* Outcomes */}
        <div style={{ background: COLORS.accentLight, border: `1px solid rgba(192,122,12,0.2)`, borderRadius: 14, padding: "18px 22px", marginBottom: 20 }}>
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
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 600, color: COLORS.navy, marginBottom: 12 }}>{sec.heading}</div>
            {sec.body.split("\n\n").map((para, j) => (
              <p key={j} style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.75, marginBottom: 10 }}>
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
      <div className="page-header">
        <div className="page-eyebrow">WorshipPilot</div>
        <div className="page-title">MD Training</div>
        <div className="page-sub">Five steps from observer to deployed Music Director. Study each module, then execute.</div>
      </div>

      {/* Progress bar */}
      <div className="card" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 8 }}>
            {completedCount === 0 ? "Start with Step 1 below" : completedCount === MD_MODULES.length ? "All modules complete — ready to lead" : `${completedCount} of ${MD_MODULES.length} modules complete`}
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${(completedCount / MD_MODULES.length) * 100}%` }} /></div>
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 700, color: COLORS.accent, flexShrink: 0 }}>{completedCount}/{MD_MODULES.length}</div>
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
                <div style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${moduleDone ? COLORS.green : step.color}`, background: moduleDone ? COLORS.green : COLORS.surface, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: moduleDone ? "#fff" : step.color, flexShrink: 0 }}>
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
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 600, color: COLORS.navy, marginBottom: 4 }}>{week.title}</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.55, marginBottom: 12 }}>{step.desc}</div>

                  {/* Module card — if this step has a module */}
                  {module && (
                    <button onClick={() => setView(module.id)}
                      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", background: moduleDone ? COLORS.greenLight : COLORS.card, border: `1px solid ${moduleDone ? COLORS.green + "44" : COLORS.border}`, borderRadius: 12, cursor: "pointer", textAlign: "left", fontFamily: "'Inter', sans-serif", boxShadow: COLORS.shadow, transition: "all 0.15s", marginBottom: 8 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = moduleDone ? COLORS.green : step.color; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = moduleDone ? COLORS.green + "44" : COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: moduleDone ? COLORS.green : COLORS.accentLight, border: `1px solid ${moduleDone ? COLORS.green : "rgba(192,122,12,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon name={module.icon} size={18} color={moduleDone ? "#fff" : COLORS.accent} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: moduleDone ? COLORS.green : COLORS.textDim, letterSpacing: 0.5, marginBottom: 2 }}>
                          {moduleDone ? "✓ Complete" : "Study Module"}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{module.title}</div>
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

  return (
    <div className="fade-in">

      {/* ── CINEMATIC HERO BANNER ── */}
      <div className="hero-banner">
        <div className="hero-stage-line" />
        <div className="hero-banner-inner">
          {/* Eyebrow */}
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: COLORS.accent, marginBottom: 16, fontFamily: "'Outfit', sans-serif", opacity: 0.9 }}>WorshipPilot</div>

          {isFirstVisit ? (
            <>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 700, color: "#F0EBE1", lineHeight: 1.15, marginBottom: 10, letterSpacing: "-0.5px" }}>
                Know what to call.<br />Know when to lead.
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, marginBottom: 16, letterSpacing: 0.2 }}>
                Playback handles the audio. WorshipPilot handles the leadership.
              </div>
              <div style={{ fontSize: 14, color: "rgba(240,235,225,0.6)", lineHeight: 1.7, maxWidth: 480, marginBottom: 24 }}>
                Most worship teams don't struggle with talent — they struggle with clarity. When cues are unclear, the whole band feels it.
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => setPage("starthere")}
                  style={{ padding: "11px 24px", borderRadius: 11, border: "none", background: COLORS.accentGradient, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", boxShadow: COLORS.shadowAccent }}>
                  Get started →
                </button>
                <button onClick={() => setPage("live")}
                  style={{ padding: "11px 20px", borderRadius: 11, border: "1px solid rgba(240,235,225,0.15)", background: "rgba(255,255,255,0.06)", color: "rgba(240,235,225,0.8)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", backdropFilter: "blur(8px)" }}>
                  ▶ Try Live Mode
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700, color: "#F0EBE1", lineHeight: 1.2, marginBottom: 8, letterSpacing: "-0.3px" }}>
                {trainingDone ? "Ready to lead." : "Welcome back."}
              </div>
              <div style={{ fontSize: 14, color: "rgba(240,235,225,0.55)", marginBottom: 20, lineHeight: 1.5 }}>
                {trainingDone
                  ? "All modules complete. Keep your edge with scenarios and Live Mode."
                  : `Step ${currentStep.step} of ${JOURNEY_STEPS.length} — ${currentStep.phase}. ${currentWeek.benchmark}`}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => setPage(trainingDone ? "coaching" : "training")}
                  style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: COLORS.accentGradient, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", boxShadow: COLORS.shadowAccent }}>
                  {trainingDone ? "Practice scenarios →" : "Continue training →"}
                </button>
                <button onClick={() => setPage("live")}
                  style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(240,235,225,0.15)", background: "rgba(255,255,255,0.06)", color: "rgba(240,235,225,0.75)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  ▶ Live Mode
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── PRIMARY ACTIONS ── */}
      <div className="section-label" style={{ marginBottom: 12 }}>Your tools</div>
      <div className="two-col" style={{ marginBottom: 32 }}>
        {/* Training CTA */}
        <button onClick={() => setPage("training")}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "22px 22px", background: COLORS.navy, border: "none", borderRadius: 18, cursor: "pointer", fontFamily: "'Inter', sans-serif", boxShadow: COLORS.shadowMd, transition: "all 0.2s", textAlign: "left", position: "relative", overflow: "hidden" }}
          onMouseEnter={e => { e.currentTarget.style.background = COLORS.navyMid; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = COLORS.shadowLg; }}
          onMouseLeave={e => { e.currentTarget.style.background = COLORS.navy; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}>
          {/* Ambient glow inside card */}
          <div style={{ position: "absolute", top: -30, right: -20, width: 160, height: 120, background: "radial-gradient(ellipse, rgba(192,122,12,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(192,122,12,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, position: "relative" }}>
            <Icon name="training" size={18} color={COLORS.accent} />
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: COLORS.accent, marginBottom: 6, fontFamily: "'Outfit', sans-serif" }}>
            {isFirstVisit ? "Start Here" : trainingDone ? "Training" : `Step ${currentStep.step} of ${JOURNEY_STEPS.length}`}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            {isFirstVisit ? "Begin MD Training" : trainingDone ? "Review Modules" : currentWeek.title}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
            {isFirstVisit ? "Start the 5-step MD pathway" : trainingDone ? "All modules complete" : currentWeek.benchmark}
          </div>
        </button>

          {/* Live Mode CTA */}
          <button onClick={() => setPage("live")}
            style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "22px 22px", background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 18, cursor: "pointer", fontFamily: "'Inter', sans-serif", boxShadow: COLORS.shadow, transition: "all 0.2s", textAlign: "left" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = COLORS.shadowMd; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.accentLight, border: `1px solid rgba(192,122,12,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Icon name="live" size={18} color={COLORS.accent} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: COLORS.accent, marginBottom: 6, fontFamily: "'Outfit', sans-serif" }}>Live Mode</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, marginBottom: 4 }}>Build the confidence to lead before Sunday arrives.</div>
            <div style={{ fontSize: 12, color: COLORS.textDim, lineHeight: 1.5 }}>Current cue, bar position, and upcoming changes — all in real time.</div>
          </button>
        </div>

        {/* ── LIVE MODE SPOTLIGHT ── */}
        <div className="feature-spotlight" style={{ marginBottom: 32 }}>
          <div className="feature-spotlight-inner">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 10, fontFamily: "'Outfit', sans-serif" }}>Your secret weapon</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: "#F0EBE1", marginBottom: 8, lineHeight: 1.2 }}>Live Mode</div>
                <div style={{ fontSize: 13, color: "rgba(240,235,225,0.55)", lineHeight: 1.65, maxWidth: 340 }}>
                  Current section. Next cue. Bar position. Heads-up warning before the change. Everything an MD needs — visible the moment it matters.
                </div>
              </div>
              <button onClick={() => setPage("live")}
                style={{ padding: "12px 22px", borderRadius: 12, border: "1px solid rgba(192,122,12,0.4)", background: "rgba(192,122,12,0.12)", color: COLORS.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", flexShrink: 0, alignSelf: "center", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(192,122,12,0.22)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(192,122,12,0.12)"; }}>
                ▶ Open Live Mode
              </button>
            </div>
            {/* Mini bar visualizer — purely decorative */}
            <div style={{ display: "flex", gap: 3, marginTop: 20, alignItems: "flex-end", height: 28 }}>
              {[40,60,80,100,85,70,90,100,75,55,80,95,60,40,70,85,100,90,65,50].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 2, background: i < 8 ? `rgba(192,122,12,${0.3 + h/250})` : `rgba(192,122,12,${0.08 + h/500})`, transition: "height 0.3s" }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── RESOURCES & TOOLS ── */}
        <div className="section-divider" />
        <div className="section-label">Resources & Tools</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
          {[
            { icon: "training",  title: "MD Training",      sub: "5-step pathway",   page: "training" },
            { icon: "coaching",  title: "Scenarios",        sub: "7 MD situations",  page: "coaching" },
            { icon: "vocab",     title: "Vocabulary",       sub: "All calls",        page: "vocab" },
            { icon: "videos",    title: "Video Reference",  sub: "40 curated videos",page: "videos" },
            { icon: "manual",    title: "System Manual",    sub: "10 parts",         page: "manual" },
            { icon: "builder",   title: "Song Builder",     sub: "Build your set",   page: "builder" },
            { icon: "services",  title: "Services",         sub: "Set lists",        page: "services" },
            { icon: "onboarding",title: "Onboarding",       sub: "5-week incubator", page: "onboarding" },
            { icon: "roadmap",   title: "Roadmap",          sub: "Implementation",   page: "roadmap" },
          ].map((item, i) => (
            <button key={i} onClick={() => setPage(item.page)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "'Inter', sans-serif", boxShadow: COLORS.shadow, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.borderMid; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: COLORS.accentLight, border: `1px solid rgba(192,122,12,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={item.icon} size={16} color={COLORS.accent} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                <div style={{ fontSize: 11, color: COLORS.textDim }}>{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
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
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div className="page-eyebrow">Reference</div>
            <div className="page-title">Vocabulary Reference</div>
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
                <td style={{ color: COLORS.textMuted }}>{row.meaning}</td>
                <td><span className="badge badge-gold">{row.category}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-label" style={{ marginTop: 32 }}>Nashville Number Quick Reference</div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 600, color: COLORS.navy, marginBottom: 14 }}>All 12 Keys</div>
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
              <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.7 }}>
                {chords.split(" ").map((c, i) => (
                  <span key={i}><span style={{ color: COLORS.navy, fontWeight: 600 }}>{i + 1}</span>={c} </span>
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
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>
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
              style={{ padding: "3px 9px", borderRadius: 12, border: `1.5px solid ${activeKey === k ? COLORS.accent : "rgba(255,255,255,0.15)"}`, background: activeKey === k ? COLORS.accent : "transparent", color: activeKey === k ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
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
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 600, color: COLORS.navy }}>
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
            style={{ padding: "6px 15px", borderRadius: 20, border: `1.5px solid ${activeKey === k ? COLORS.accent : COLORS.border}`, background: activeKey === k ? COLORS.accentLight : COLORS.card, color: activeKey === k ? COLORS.accent : COLORS.textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", transition: "all 0.15s" }}>
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
      <div className="page-header">
        <div className="page-eyebrow">Training</div>
        <div className="page-title">MD Onboarding Pathway</div>
        <div className="page-sub">A structured pathway — so no one gets thrown into the MD role unprepared. 5-week training program with clear benchmarks at every stage.</div>
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
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 600, color: COLORS.navy }}>{ONBOARDING_WEEKS[activeWeek].title}</div>
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
                  <span style={{ fontSize: 14, color: done ? COLORS.textDim : COLORS.text, textDecoration: done ? "line-through" : "none" }}>{task}</span>
                </div>
              );
            })}
          </div>
          <div style={{ background: COLORS.accentLight, border: `1px solid rgba(184,114,10,0.2)`, borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontSize: 10, color: COLORS.accent, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Week Benchmark</div>
            <div style={{ fontSize: 14, color: COLORS.navy, fontWeight: 500 }}>{ONBOARDING_WEEKS[activeWeek].benchmark}</div>
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
                <div style={{ fontSize: 13, color: COLORS.textMuted }}>{w.benchmark}</div>
                <div className="progress-track" style={{ marginTop: 8, width: "60%" }}>
                  <div className="progress-fill" style={{ width: `${weekProgress(i)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
        <div className="page-header">
          <div className="page-eyebrow">MD Reference</div>
          <div className="page-title">MD Situations</div>
          <div className="page-sub">Real Sunday situations with the correct MD response and the reasoning behind it. Study these until they're instinct.</div>
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
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 600, color: COLORS.navy, marginBottom: 4 }}>{s.title}</div>
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
      <div style={{ background: COLORS.navy, borderRadius: 18, padding: "26px 28px", marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.accent, marginBottom: 10 }}>The Situation</div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 600, color: "#fff", lineHeight: 1.2, marginBottom: 14 }}>{selected.title}</div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.78)", lineHeight: 1.75 }}>{selected.prompt}</div>
      </div>

      {/* Reveal toggle */}
      {!revealed ? (
        <button onClick={() => setRevealed(true)}
          style={{ width: "100%", padding: "16px", borderRadius: 14, border: `2px dashed ${COLORS.accent}`, background: COLORS.accentLight, color: COLORS.accent, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", marginBottom: 16, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#FBE9C9"; }}
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
    </div>
  );
};

// ─── MANUAL PAGE ──────────────────────────────────────────────────────────────

const ManualPage = ({ setSelectedPart, setPage }) => (
  <div className="fade-in">
    <div className="page-header">
      <div className="page-eyebrow">System Manual</div>
      <div className="page-title">All 10 Parts</div>
      <div className="page-sub">The complete WorshipPilot MD System — tap any part to explore the full content and Q&A.</div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {PARTS_DATA.map((part) => (
        <div key={part.id} className="card" style={{ cursor: "pointer" }}
          onClick={() => { setSelectedPart(part); setPage("part-detail"); }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.borderMid; e.currentTarget.style.boxShadow = COLORS.shadowMd; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; e.currentTarget.style.transform = "translateY(0)"; }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: COLORS.accentLight, border: `1px solid rgba(192,122,12,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={part.icon} size={20} color={COLORS.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span className="badge badge-gold">Part {part.id}</span>
              </div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>{part.title}</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5 }}>{part.summary}</div>
              <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 8 }}>{part.content.length} questions covered ›</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PartDetail = ({ part, setPage }) => (
  <div className="fade-in">
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
      <button className="btn btn-ghost" onClick={() => setPage("manual")} style={{ padding: "7px 14px" }}>← Manual</button>
      <span className="badge badge-gold">Part {part.id}</span>
    </div>
    <div className="page-header">
      <div style={{ width: 52, height: 52, borderRadius: 16, background: COLORS.accentLight, border: `1px solid rgba(192,122,12,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <Icon name={part.icon} size={26} color={COLORS.accent} />
      </div>
      <div className="page-title">{part.title}</div>
      <div className="page-sub">{part.summary}</div>
    </div>
    <div className="detail-panel"><div className="detail-body"><Accordion items={part.content} /></div></div>
  </div>
);

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
        <div className="page-title">Rollout Roadmap</div>
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
                    <div key={j} style={{ color: item.startsWith("Success") ? p.color : COLORS.textMuted, fontWeight: item.startsWith("Success") ? 600 : 400 }}>
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
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Start with the training modules.</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16 }}>The roadmap follows.</div>
        <button onClick={() => setPage("training")} className="btn btn-primary">Begin MD Training →</button>
      </div>
    </div>
  );
};

const SECTION_TYPES = ["intro","verse","prechorus","chorus","bridge","tag","outro","turnaround","instrumental","breakdown","vamp"];

const TYPE_COLORS = {
  intro: "#4CAF7D", verse: "#6B9FD4", prechorus: "#A07CC5",
  chorus: "#E8A838", bridge: "#CF6679", tag: "#B8720A",
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

const SongBuilderPage = ({ songLibrary, onSaveSong, onDuplicateSong, editSongId, setPage }) => {
  const editing = editSongId ? songLibrary.find(s => s.id === editSongId) : null;
  const [songTitle, setSongTitle] = useState(editing?.title || "New Song");
  const [songKey, setSongKey] = useState(editing?.key || "G");
  const [songBpm, setSongBpm] = useState(editing?.bpm || 72);
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
    const song = { id: editing?.id || mkId(), title: songTitle || "Untitled Song", key: songKey, bpm: songBpm, sections };
    onSaveSong(song);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-eyebrow">Song Builder</div>
        <div className="page-title">{editing ? "Edit Song" : "New Song"}</div>
        <div className="page-sub">Build song structures for Live Mode. Each section becomes a cue card on Sunday.</div>
      </div>

      {songLibrary.length > 0 && (
        <>
          <div className="section-label">Song Library</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
            {songLibrary.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: COLORS.card, border: `1px solid ${s.id === editSongId ? COLORS.accent : COLORS.border}`, borderRadius: 12, boxShadow: COLORS.shadow }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: COLORS.textDim }}>Key of {s.key} · {s.bpm} BPM · {s.sections.length} sections</div>
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
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}><span style={{ fontWeight: 700, color: COLORS.accent }}>{sections.length}</span> sections</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}><span style={{ fontWeight: 700, color: COLORS.accent }}>{totalBars}</span> total bars</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}><span style={{ fontWeight: 700, color: COLORS.accent }}>{Math.round((totalBars / songBpm) * 4 * 10) / 10}</span> min est.</div>
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
const SongBlock = ({ block, index, song, onNotesChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast, total }) => {
  const [open, setOpen] = useState(false);
  const hasNotes = Object.values(block.notes || {}).some(v => v?.trim());
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${COLORS.border}`, background: COLORS.card, boxShadow: COLORS.shadow, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{index + 1}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, fontFamily: "'Outfit', sans-serif" }}>{song?.title || block.pcoTitle || "Unknown Song"}</div>
          <div style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            {song ? `Key of ${song.key} · ${song.bpm} BPM` : block.pcoKey ? `Key of ${block.pcoKey} · from PCO` : ""}
            {hasNotes && <span style={{ marginLeft: 8, color: COLORS.accent }}>● notes</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
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
            style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, background: "transparent", border: "none", outline: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", width: "100%", padding: 0 }}>
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
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent, fontFamily: "'Outfit', sans-serif" }}>MC Groove / The Jam</div>
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
          <button onClick={() => setOpen(o => !o)} style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${open ? COLORS.accent : COLORS.border}`, background: open ? "#FBE9C9" : COLORS.card, color: open ? COLORS.accent : COLORS.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
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

const ServiceBuilderPage = ({ services, songLibrary, activeServiceId, onSaveService, onDuplicateService, onDeleteService, onSetActive, onLaunch }) => {
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || null);
  const [editTitle, setEditTitle] = useState("");
  const [addSongId, setAddSongId] = useState(songLibrary[0]?.id || "");
  const [copied, setCopied] = useState(false);

  // ── PCO Integration state ──
  const [pcoState, setPcoState] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wp-pco-connection") || "null"); } catch { return null; }
  });
  const [pcoPlans, setPcoPlans] = useState([]);
  const [pcoLoading, setPcoLoading] = useState(false);
  const [pcoError, setPcoError] = useState(null);
  const [showPcoImport, setShowPcoImport] = useState(false);

  // Check for PCO callback params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("pco_success")) {
      const conn = {
        pcoUserId: params.get("pco_user_id"),
        pcoOrg: params.get("pco_org"),
        pcoName: params.get("pco_name"),
      };
      localStorage.setItem("wp-pco-connection", JSON.stringify(conn));
      setPcoState(conn);
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("pco_error")) {
      setPcoError(`Connection failed: ${params.get("pco_error")}`);
      window.history.replaceState({}, "", window.location.pathname);
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
    // Create a new service from a PCO plan
    const newBlocks = [];
    plan.songs.forEach((song, i) => {
      if (i > 0) newBlocks.push(mkBlock("transition"));
      // Try to match to existing song library by title
      const match = songLibrary.find(s => s.title.toLowerCase() === song.title.toLowerCase());
      newBlocks.push(mkBlock("song", { songId: match?.id || null, pcoTitle: song.title, pcoKey: song.key }));
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
      <div className="page-header">
        <div className="page-eyebrow">Service Builder</div>
        <div className="page-title">Build Your Service</div>
        <div className="page-sub">Assemble your set, add MD notes for each song, then send to your band.</div>
      </div>
      <Hint hintKey="service-builder" text="Build your set here — songs, transitions, moments, and the Jam. Tap Notes on any song to add your MD brief. Hit Copy Notes to send the whole thing to your band in PCO chat." />

      {/* ── PCO INTEGRATION PANEL ── */}
      <div style={{ marginBottom: 24, padding: "18px 20px", background: pcoState ? COLORS.accentLight : COLORS.card, border: `1.5px solid ${pcoState ? COLORS.accent : COLORS.border}`, borderRadius: 16, boxShadow: COLORS.shadow }}>
        {!pcoState ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, marginBottom: 3 }}>Connect Planning Center</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>Import your upcoming service plans and song lists directly from PCO.</div>
              {pcoError && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 6 }}>{pcoError}</div>}
            </div>
            <button onClick={connectPCO}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", background: COLORS.navy, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Connect PCO
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
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>Connected to {pcoState.pcoOrg}</div>
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
      <div className="section-label">Services</div>
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
            <button onClick={() => onSetActive(service.id)}
              style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${service.id === activeServiceId ? COLORS.green : COLORS.border}`, background: service.id === activeServiceId ? COLORS.greenLight : COLORS.card, color: service.id === activeServiceId ? COLORS.green : COLORS.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", boxShadow: COLORS.shadow }}>
              {service.id === activeServiceId ? "✓ Active Service" : "Set as Active"}
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
            // PCO-imported song without library match — create a minimal song object
            if (b.pcoTitle) return {
              id: b.id,
              title: b.pcoTitle,
              key: b.pcoKey || '',
              bpm: 120,
              sections: [{ id: 'default', type: 'verse', label: 'Song', bars: 8, repeatCount: 1, note: '', headsUp: '', headsUpBarsBefore: 2, options: [] }],
            };
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
  const [liveHintDismissed, setLiveHintDismissed] = useState(() => {
    try { return !!localStorage.getItem("wp-hint-live-mode"); } catch { return false; }
  });

  const liveLoopRef         = useRef(false);
  const liveExtraRepeatsRef = useRef(0);
  const isPlayingRef        = useRef(false);
  const sectionIdxRef       = useRef(0);
  const songIdxRef          = useRef(0);
  const sectionStartRef     = useRef(null);
  const progressRef         = useRef(null);
  const beatRef             = useRef(null);
  const beatCountRef        = useRef(0);

  if (!activeService || songs.length === 0) {
    return (
      <div className="fade-in" style={{ maxWidth: 520, margin: "0 auto", paddingTop: 40, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, rgba(192,122,12,0.15) 0%, rgba(232,168,56,0.08) 100%)", border: `1px solid rgba(192,122,12,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 4px 20px rgba(192,122,12,0.15)" }}>
          <Icon name="live" size={28} color={COLORS.accent} />
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, color: LIVE.text, marginBottom: 8 }}>No Active Service</div>
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

  const calcDuration = (sec, bpm, extraRepeats = 0) => (sec.bars * (sec.repeatCount + extraRepeats) * 4 / bpm) * 60 * 1000;
  const sectionDurationMs = calcDuration(section, song.bpm, liveExtraRepeats);
  const remaining = Math.max(0, sectionDurationMs - elapsedMs);
  const progress = Math.min(1, elapsedMs / sectionDurationMs);

  const headsUpBarsBefore  = section.headsUpBarsBefore ?? 2;
  const totalBarsEffective = section.bars * (section.repeatCount + liveExtraRepeats);
  const currentBarPos      = Math.min(Math.floor(progress * totalBarsEffective), totalBarsEffective - 1);
  const nearingEnd         = isPlaying && (totalBarsEffective - currentBarPos) <= headsUpBarsBefore;

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
      const curSongs   = activeService.songIds.map(id => songLibrary.find(s => s.id === id)).filter(Boolean);
      const curSong    = curSongs[songIdxRef.current];
      const curSection = curSong.sections[sectionIdxRef.current];
      const dur = calcDuration(curSection, curSong.bpm, liveExtraRepeatsRef.current);
      if (elapsed >= dur) {
        if (liveLoopRef.current) {
          sectionStartRef.current = Date.now();
          setElapsedMs(0);
          startBeatInterval(curSong.bpm);
        } else {
          const nextIdx = sectionIdxRef.current + 1;
          if (nextIdx < curSong.sections.length) {
            sectionIdxRef.current = nextIdx;
            setSectionIndex(nextIdx);
            sectionStartRef.current = Date.now();
            setElapsedMs(0);
            liveExtraRepeatsRef.current = 0;
            setLiveExtraRepeats(0);
            startBeatInterval(curSong.bpm);
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

  const handlePlay = () => { isPlayingRef.current = true; setIsPlaying(true); startProgressInterval(); startBeatInterval(song.bpm); };
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
    intro:"#4CAF7D",verse:"#6B9FD4",prechorus:"#A07CC5",chorus:"#E8A838",
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
    intro:"#4CAF7D", verse:"#6B9FD4", prechorus:"#A07CC5", chorus:"#E8A838",
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
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: LIVE.text }}>{song.title}</div>
            <div style={{ fontSize: 10, color: LIVE.textDim, fontFamily: "'JetBrains Mono', monospace" }}>Key of {song.key} · {song.bpm} BPM · {songIndex + 1}/{totalSongs}</div>
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
          <div style={{ marginBottom: 16 }}>{renderTimeline()}</div>

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
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: nearingEnd ? 22 : 16, fontWeight: 600, color: nearingEnd ? LIVE.text : LIVE.textMuted }}>{nextSection.label}</div>
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
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: LIVE.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</div>
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
        <div style={{ marginBottom: 18 }}>{renderTimeline()}</div>

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
            <div style={{ fontSize: 12, color: LIVE.textDim, fontStyle: "italic" }}>No MD notes for this section — add them in Song Builder</div>
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
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: nearingEnd ? 22 : 16, fontWeight: 600, color: nearingEnd ? LIVE.text : LIVE.textMuted, transition: "all 0.3s" }}>{nextSection.label}</div>
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
      <div className="page-header">
        <div className="page-eyebrow">Reference Library</div>
        <div className="page-title">Video Reference</div>
        <div className="page-sub">{VIDEO_DATA.length} curated videos organized by MD skill area. Tap any video to open in YouTube.</div>
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
                  <Icon name={item.icon} size={16} color={COLORS.textMuted} />
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
      case "roadmap":     return <RoadmapPage setPage={setPage} />;
      case "builder":     return <SongBuilderPage songLibrary={songLibrary} onSaveSong={handleSaveSong} onDuplicateSong={handleDuplicateSong} editSongId={editSongId} setPage={(p, id) => { setEditSongId(id ?? null); setPage(p); }} />;
      case "services":    return <ServiceBuilderPage services={services} songLibrary={songLibrary} activeServiceId={activeServiceId} onSaveService={handleSaveService} onDuplicateService={handleDuplicateService} onDeleteService={handleDeleteService} onSetActive={setActiveServiceId} onLaunch={() => setPage("live")} />;
      case "live":        return <LiveModePage activeService={activeService} songLibrary={songLibrary} onGoToServiceBuilder={() => setPage("services")} />;
      default:            return <Dashboard setPage={setPage} setSelectedPart={setSelectedPart} />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      {showRoleSelector && createPortal(<RoleSelector onSelect={handleRoleSelect} />, document.body)}
      <div className="app-container">
        <nav className="sidebar">
          <div className="sidebar-logo">WP</div>
          <div className="nav-divider" />
          {nav.slice(0, 6).map(n => (
            <button key={n.id} className={`nav-btn ${page === n.id || (page === "part-detail" && n.id === "manual") ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <Icon name={n.icon} size={19} />
              <div className="nav-tooltip">{n.label}</div>
            </button>
          ))}
          <div className="nav-divider" />
          {nav.slice(6).map(n => (
            <button key={n.id} className={`nav-btn ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <Icon name={n.icon} size={19} />
              <div className="nav-tooltip">{n.label}</div>
            </button>
          ))}
          {/* Search pinned to bottom of sidebar */}
          <div style={{ flex: 1 }} />
          <div className="nav-divider" />
          <button className="search-btn" onClick={() => setSearchOpen(true)}>
            <Icon name="search" size={19} />
            <div className="nav-tooltip">Search</div>
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
