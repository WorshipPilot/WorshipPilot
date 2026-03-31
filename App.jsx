import { useState, useEffect, useRef } from "react";

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
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${COLORS.bg};
    background-image: ${NOISE_SVG};
    color: ${COLORS.text};
    font-family: 'DM Sans', sans-serif;
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
    z-index: 10;
    overflow: hidden;
    border-right: 1px solid ${COLORS.sidebarBorder};
    box-shadow: 2px 0 20px rgba(0,0,0,0.15);
  }

  .sidebar-logo {
    font-family: 'Cormorant Garamond', serif;
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
    left: 50px;
    background: linear-gradient(135deg, #0D1B2A 0%, #162033 100%);
    color: #E8E2D8;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    border: 1px solid #1E3248;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .nav-btn:hover .nav-tooltip { opacity: 1; }

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
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 3.5px;
    text-transform: uppercase;
    color: ${COLORS.accent};
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .page-eyebrow::before {
    content: '';
    width: 18px;
    height: 2px;
    background: ${COLORS.accentGradient};
    border-radius: 2px;
    flex-shrink: 0;
  }

  .page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px;
    font-weight: 600;
    color: ${COLORS.navy};
    line-height: 1.08;
    letter-spacing: -0.8px;
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
  button.card { cursor: pointer; text-align: left; width: 100%; font-family: 'DM Sans', sans-serif; }
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
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 600;
    color: ${COLORS.navy};
    margin-bottom: 6px;
    letter-spacing: -0.2px;
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
    font-family: 'DM Sans', sans-serif;
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
    font-family: 'DM Sans', sans-serif;
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
    font-family: 'DM Sans', sans-serif;
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
    font-family: 'DM Mono', monospace;
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
    font-family: 'Cormorant Garamond', serif;
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
    font-family: 'DM Sans', sans-serif;
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
    font-family: 'DM Sans', sans-serif;
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
  }
  .search-btn:hover { background: rgba(255,255,255,0.06); color: #7A9AB8; }

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
    font-family: 'DM Sans', sans-serif;
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
  @media (max-width: 640px) {
    .main-content { padding: 20px 16px; }
    .card-grid { grid-template-columns: 1fr; }
    .page-title { font-size: 30px; }
  }
`;

// ─── DATA ──────────────────────────────────────────────────────────────────

const VOCAB_DATA = [
  { call: "Stand by — Verse 2", meaning: "Warning: 2 bars before the next section", category: "Navigation" },
  { call: "Going back to the top", meaning: "Loop back to song intro/verse 1", category: "Navigation" },
  { call: "Hold — sustain", meaning: "Hold current chord; band sustains until released", category: "Navigation" },
  { call: "Vamp / Loop it", meaning: "Repeat current section indefinitely until cued off", category: "Navigation" },
  { call: "Tag it", meaning: "Repeat the last phrase or ending once more", category: "Navigation" },
  { call: "Button it", meaning: "Land on the final chord, stop cleanly", category: "Endings" },
  { call: "Ritard / Slow it", meaning: "Gradually decelerate tempo into the ending", category: "Endings" },
  { call: "Walk it down", meaning: "Descending bass line resolution to end", category: "Endings" },
  { call: "Soft landing", meaning: "Gradually drop volume to near-silence", category: "Endings" },
  { call: "Half-time", meaning: "Feel drops to half the tempo (groove slows, time stays)", category: "Dynamics" },
  { call: "Full build", meaning: "Everyone plays at full capacity, maximum energy", category: "Dynamics" },
  { call: "Strip back", meaning: "Drop to minimal instrumentation — vocals + 1–2 instruments", category: "Dynamics" },
  { call: "Pockets only", meaning: "Drums play minimal; bass and guitar lock to groove only", category: "Dynamics" },
  { call: "Acoustic feel", meaning: "Drop electric/electronic elements; acoustic warmth only", category: "Dynamics" },
  { call: "Kick on 1", meaning: "Drummer: hit kick drum on beat 1 only (restart click anchor)", category: "Click/Sync" },
  { call: "Downbeats — 1 & 2 & 3 & 4 &", meaning: "Call the count aloud to re-sync band to click", category: "Click/Sync" },
  { call: "Kill the track", meaning: "Playback operator cuts backing track immediately", category: "Playback" },
  { call: "Loop track", meaning: "Loop current section in Playback", category: "Playback" },
];

const PARTS_DATA = [
  {
    id: 1, title: "Foundation — Who Is the MD?", icon: "⚓",
    summary: "Core identity: Navigator and Servant Leader. The MD charts the course and calls the turns — keeping the band unified, confident, and spiritually present.",
    content: [
      { q: "What are the 5 foundational principles of the MD role?", a: "1. Serve the vision, not the spotlight — your job is to help the room worship, not flex. 2. Prepare the band before rehearsal — charts, keys, tempos sent early = peace in the room. 3. Control dynamics, not volume — less in the verses, save the lift for the right moment. 4. Be the musical bridge — translate the WL's heart to the band in real time. 5. Lead people, not just music — encourage, protect unity, and create a safe environment to worship." },
      { q: "What is the MD's primary metaphor?", a: "The Navigator. The WL is the captain setting the destination; the MD charts the course and calls out the turns — the 'Google Maps Mandate.' Even when the band knows the route, you provide the background safety net. Like GPS, you instruct a turn before they reach it, keeping everyone unified and confident." },
      { q: "What is the foundational principle?", a: "Confidence Over Perfection. A wrong cue given with 100% confidence is a pivot — a right cue with hesitation can be a train wreck. The band needs to feel your certainty, not your uncertainty." },
      { q: "What is relational equity and why does it matter?", a: "Relational equity is the trust you build with your team through care, consistency, and investment mid-week. You cannot lead a team that doesn't trust you. Without relationship, correction can feel like an attack. Build trust before you need to use authority — the WL must also publicly hand the keys to the MD so the team knows who to follow." },
    ]
  },
  {
    id: 2, title: "The WL/MD Partnership", icon: "🤝",
    summary: "WL and MD function as a single leadership unit. If the band detects a split, they hesitate. Unified front is non-negotiable.",
    content: [
      { q: "What is the weekly planning conversation?", a: "A structured 15–20 min conversation before Sunday to align on: setlist order, any spontaneous possibilities, transitions, who's calling what, and any team flags. Never go into Sunday without this conversation." },
      { q: "What is the 10-Minute Huddle?", a: "A pre-service sync. Happens after full soundcheck, before the service begins. Confirms the order, any last-minute changes, and realigns WL + MD. The team hears it together. Creates shared certainty." },
      { q: "How does the MD support the WL in real-time?", a: "Monitor the WL's body language and face constantly. If they're lingering — extend. If they're moving forward — get the band ready. Anticipate the call before they make it. You should be one step ahead, not reacting." },
      { q: "What does 'Unified Front' mean in practice?", a: "Disagreements happen after the service, never during. If the WL calls something unexpected mid-service, execute it without hesitation and process it afterward. The band must never see conflict or uncertainty between WL and MD." },
    ]
  },
  {
    id: 3, title: "Technical Standards", icon: "🎛️",
    summary: "Two-way talkback, IEM priorities, stage positioning, and Playback mastery. Technical failure is a leadership failure.",
    content: [
      { q: "What are the IEM mix priorities for the MD?", a: "1. Click track (crystal clear — this is your anchor). 2. Your own instrument (guitar/keys). 3. Vocals. 4. Kick and bass. The click must be unmistakable and always present. Everything else is secondary." },
      { q: "What is the two-way talkback requirement?", a: "MD must have talkback to the sound booth — not just the band. The engineer needs to hear MD calls to anticipate transitions. Without this, you're flying blind on the technical side. Test it every rehearsal." },
      { q: "What is the MD's ideal stage position?", a: "Stage left or center, facing the band. Never with your back to the room. You must see the WL, the drummer, and the congregation simultaneously. Your position is a leadership position." },
      { q: "What is the kill track protocol?", a: "If tracks fail: 1. MD calls 'Kill the track' to operator. 2. Drummer locks to click in IEM only (if available) or holds time. 3. MD calls the band back to a simple loop. 4. Rebuild when stable. Never panic — call it calm and clear." },
    ]
  },
  {
    id: 4, title: "The Language — Standardized Calls", icon: "📢",
    summary: "Restricted, powerful vocabulary. Everyone speaks the same language. Confusion is eliminated through standardization.",
    content: [
      { q: "Why restrict vocabulary rather than improvise calls?", a: "Improvised calls in the moment require the band to decode rather than respond. Standardized language becomes muscle memory — the band acts on the call before they consciously process it. That 0.5-second gap is the difference between a tight transition and a train wreck." },
      { q: "What is the 2-bars-early rule?", a: "All navigation calls must happen 2 bars before the change, not at the change. 'Stand by — Chorus' with 2 bars remaining. This gives the band time to prepare physically and mentally, especially drummers and keys who need to set up fills and pads." },
      { q: "How does the rhythmic 'and' system work?", a: "When calling beats aloud to re-sync: '1 and 2 and 3 and 4 and' — the AND subdivisions lock the band to the click grid faster than calling downbeats alone. Use this whenever the band drifts from click, especially after a spontaneous moment." },
      { q: "What are the visual cues to standardize?", a: "Hand signals that mirror verbal calls: pointed finger up = going up a section, palm down = strip back, fist = full stop, circular motion = vamp/loop, thumb across throat = kill/end. Agree on these in rehearsal — they're lifesavers when talkback fails." },
    ]
  },
  {
    id: 5, title: "Core MD Responsibilities", icon: "📋",
    summary: "The MD role spans the entire week — not just Sunday morning. Pre, during, and post-service responsibilities.",
    content: [
      { q: "What are the pre-service responsibilities?", a: "Track preparation and PCO notes reviewed during the week. WL planning conversation covering Energy Map, Exit Strategy, and Extended Worship Moments. Sunday morning: Production Point-to-Point coordination meeting with the full production team, then 10-Minute Huddle with band, IEM check, and talkback test. Nothing should be unknown walking into service." },
      { q: "What is the Production Point-to-Point Huddle?", a: "A Sunday morning coordination meeting between MD, WL, sound tech, production, and any other Sunday roles. Everyone aligns on the full service order, transitions, any special elements, and communication protocols." },
      { q: "What is the post-service worship huddle?", a: "A quick team check-in immediately after service — not just with the WL but with the whole team. Celebrate what went well, flag anything that needs addressing. Keep it brief and encouraging." },
      { q: "What is the quarterly macro-review?", a: "A longer review every quarter with the WL and core team leads. Review patterns, vocabulary gaps, team development progress, emerging MDs, and recurring technical issues. This is how the system improves over time." },
    ]
  },
  {
    id: 6, title: "The 90-Minute Rehearsal Blueprint", icon: "⏱️",
    summary: "Rehearsal is for rehearsing the flow, not learning parts. Parts are learned at home. Begins with a devotional led by the WL.",
    content: [
      { q: "What is the 'Crash Through' and why does it matter?", a: "30 minutes: run the entire setlist without stopping, no matter what breaks. MD Rule — only stop if the train is completely off the tracks. Let musicians self-correct. MD takes notes on train-wreck moments. The band learns to recover and keep flow, which is the actual Sunday skill." },
      { q: "What is 'Targeted Fixes & Transitions' time?", a: "25 minutes after the crash-through. MD identifies the train-wreck moments and addresses them specifically. Key focus: song-to-song transitions are practiced and polished here. This is where transitions get rehearsed, not just flagged." },
      { q: "How should the Full Worship Run conclude rehearsal?", a: "25 minutes: zero stopping, treat it like Sunday. Full spiritual engagement — not just a technical run-through. WL leads from the front, MD practices spontaneous cues, WL can test spontaneous moments." },
      { q: "What does the MD do during Sound Check?", a: "10 minutes: line checks for all instruments and vocals. MD confirms they can be heard by all musicians. Test talkback mic and confirm IEM mix priorities. This is the technical foundation the rest of rehearsal depends on." },
    ]
  },
  {
    id: 7, title: "Tools — PCO, Spontaneous Framework & MC Groove", icon: "🛠️",
    summary: "The systems that make Sunday reproducible. Spontaneous moments are prepared, not improvised.",
    content: [
      { q: "What is the Spontaneous Moment Framework?", a: "4 phases: Phase 1 — Recognition: WL makes eye contact or gives a signal. Phase 2 — Anchor: MD calls 'Vamp [current chord]' and locks the band to a steady groove. Phase 3 — Space: MD holds the loop, reads the WL's body language and the room. Phase 4 — Exit: WL signals resolve, MD calls the return. Never assume the exit — always get the signal." },
      { q: "What is MC Groove (The Jam)?", a: "Background music played while a speaker addresses the congregation. Key: same as previous song. Tempo: 96 BPM or less. Progression: simple 4-chord pattern, commonly 1-4-6m-5 or 1-5-6m-4. Key of G: G, C, Em, D. Avoid consecutive minor chords and the 2 chord." },
      { q: "What is the Play Out / Pull Back dynamic in The Jam?", a: "'Play Out': when the speaker invites congregation to greet — 50–60% energy, full rhythm section. 'Pull Back': when speaker resumes talking — 30–40% energy, drummer to light hi-hat, bass to roots, keys to pads." },
      { q: "What is the weekly prep checklist?", a: "Coordinate with WL on Energy Map, Exit Strategy, and Extended Worship Moments. Build setlist in Playback. Test all tracks, confirm loops, save to cloud. Add MD notes to PCO for every song. Plan song-to-song transitions. Confirm talkback mic and IEM mix with sound tech." },
    ]
  },
  {
    id: 8, title: "The MD Development Pathway", icon: "🌱",
    summary: "We don't throw volunteers into the MD role — we build them systematically. 5-week incubator with clear benchmarks.",
    content: [
      { q: "What are the 5 weeks of the MD Incubator?", a: "Week 1: Vocabulary immersion — shadow a full service, observe only, memorize all navigation calls. Week 2: Shadow + call privately in IEM during a live service. Week 3: Call 2–3 songs live with backup MD on standby. Week 4: Lead first half of full set, MD observes. Week 5: Lead full Sunday service with MD on standby only." },
      { q: "What are the three skill development areas?", a: "Musical: confident counting and cueing, reading the room and WL simultaneously. Leadership: clear decisive communication, calm presence when things go off-script. Technical: Playback platform mastery, PCO navigation, track troubleshooting." },
      { q: "What are MD Scenario Training Nights?", a: "Quarterly 2–3 hour sessions where all MDs rotate through live scenarios while the band stays consistent. 7 scenarios: Track failure mid-song, Unrehearsed song request, WL extends spontaneous moment, Band/track out of sync, Last-minute setlist change, Key change between songs, and Difficult performance conversation role-play." },
      { q: "How does the MD adapt to different skill levels?", a: "Advanced musicians: open-ended cues, comfortable with Nashville Numbers. Intermediate musicians: need clear verbal cues and support for spontaneous moments. Developing musicians: very specific instructions, chord names instead of numbers. Test during sound check: 'We'll be using Nashville Numbers today — everyone comfortable?'" },
    ]
  },
  {
    id: 9, title: "Playback Technical Mastery", icon: "🎛️",
    summary: "MD must be so comfortable with Playback that operating it becomes second nature. On Sunday, your focus must be on leading — not fumbling with software.",
    content: [
      { q: "What are the Playback basics every MD must master?", a: "Login and access church account. Understand the interface: Setlist Panel, Transport Controls, Mixer Panel, Arrangement Panel, Click/Guide Controls. Load songs, set correct key and tempo. Control loops — set loop points, activate/deactivate cleanly. Manage individual track volumes." },
      { q: "What is the pre-service Playback setup checklist?", a: "30 minutes before service: confirm all songs loaded in correct order. Verify each song's tempo and key. Test loop points on songs that may extend. Check click track in MD IEM. Confirm cloud sync complete. Test talkback with sound tech. Have backup plan if device fails." },
      { q: "What are the 7 common technical issues and solutions?", a: "1. Track won't play — check cloud sync, restart app. 2. Click not in IEM — check routing. 3. Wrong key — transpose before service. 4. Loop won't activate — set during sound check. 5. Track cuts out — call 'Kill the track,' band continues live. 6. Wrong song loaded — call vamp while reloading. 7. App crashes — have device backup ready." },
      { q: "What is the Emergency Protocol for operating without tracks?", a: "If tracks fail: MD calls 'Kill the track' to operator. Drummer locks to click in IEM or holds time by feel. MD calls 'Vamp on 1 and 4' and locks band to simple groove. WL decides whether to continue the song live. MD stays calm — a confident call is everything." },
    ]
  },
  {
    id: 10, title: "The Code of Conduct", icon: "📜",
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
  { id: 1, title: "Tracks fail mid-song", difficulty: "High", category: "Emergency", prompt: "The backing track cuts out completely at bar 16 of the second song. You're 3 songs into the set. The WL is mid-vocal. What do you call and in what order?" },
  { id: 2, title: "Drummer drifts off click", difficulty: "Medium", category: "Sync", prompt: "The drummer has drifted 10–15 BPM below click tempo during the bridge. The band is following the drummer, not the click. You need to restore lock. What do you do?" },
  { id: 3, title: "WL extends a moment unexpectedly", difficulty: "Medium", category: "Spontaneous", prompt: "You're in the final chorus. The WL holds up a hand and steps back from the mic — clearly going into a spontaneous moment. No pre-planned signal. What do you call?" },
  { id: 4, title: "Key change between songs with no gap", difficulty: "Medium", category: "Transitions", prompt: "Song 2 ends in G major. Song 3 starts in Eb major. The WL wants to go directly from one to the other with no spoken moment. How do you execute this transition?" },
  { id: 5, title: "Late entrance — wrong section", difficulty: "High", category: "Emergency", prompt: "Guitarist comes in on verse 2 instead of the bridge. The drummer is locked but the bassist started following the guitarist. You have 4 bars to resolve this." },
  { id: 6, title: "Last-minute setlist change", difficulty: "Low", category: "Preparation", prompt: "2 minutes before service, WL tells you they're cutting song 4 and adding a song that wasn't in rehearsal. The band has played it before. What do you do in those 2 minutes?" },
  { id: 7, title: "Spontaneous moment resolve", difficulty: "High", category: "Spontaneous", prompt: "You've been vamping on the tonic chord for 4 minutes during a spontaneous moment. The WL is praying. The congregation is engaged. When and how do you read the exit?" },
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

const buildSeedData = () => {
  const songLibrary = LIVE_SET_DATA[0].songs.map(s => ({ id: s.id, title: s.title, key: s.key, bpm: s.bpm, sections: s.sections.map(sec => ({ ...sec })) }));
  const starterService = { id: "service-demo", title: "Sunday Morning Service (Demo)", songIds: songLibrary.map(s => s.id) };
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
    id: "role", icon: "⚓", title: "The Role of the MD",
    tagline: "Understand what a Music Director actually does — and why it matters.",
    outcomes: ["Explain the MD role to your worship team in one sentence", "Name the 5 foundational principles that govern every MD decision", "Describe how the WL and MD function as a single leadership unit", "Understand what authority the MD holds and how relational equity makes it work"],
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
    id: "cues", icon: "📢", title: "Cue Language & Communication",
    tagline: "Learn the standardized vocabulary that keeps your band unified and responsive.",
    outcomes: ["Use standardized MD calls that every musician can respond to without thinking", "Apply the 2-bars-early rule to every navigation call", "Call the band back to click using the rhythmic 'and' system", "Execute clean song-to-song transitions using musical bridge chords"],
    sections: [
      { heading: "Why restricted vocabulary beats improvised calls", body: "Improvised calls in the moment require the band to decode what you mean before they respond. That cognitive gap — even half a second — is the difference between a tight transition and a train wreck.\n\nStandardized vocabulary becomes muscle memory. The band acts on the call before they consciously process it. The first time a musician hears 'Stand by — Chorus,' they think about it. The tenth time, their hands move before their mind registers the words.\n\nThe goal is a vocabulary so ingrained that the band functions like a single instrument under your direction — not a group of individuals trying to follow instructions." },
      { heading: "The 2-bars-early rule", body: "Every navigation call must happen 2 bars before the change — not at the change. 'Stand by — Chorus' with 2 bars remaining.\n\nThis gives the band time to physically and mentally prepare. Drummers need to set up fills. Keys players need to set up pad sounds. Guitarists need to shift their hand position. Vocalists need to find the phrase.\n\nA call at the moment of change is already too late. You're reacting instead of leading. The 2-bars-early rule makes you a navigator, not a passenger." },
      { heading: "Navigation calls", body: "These are the core of real-time MD communication. Every musician must know these without hesitation:\n\n• Stand by — [section]: Warning call, 2 bars before the change\n• Going back to the top: Loop to song intro or verse 1\n• Hold — sustain: Hold the current chord until released\n• Vamp / Loop it: Repeat current section indefinitely until called off\n• Tag it: Repeat the last phrase or ending once more\n• One more time: Repeat the current full section" },
      { heading: "Dynamic calls", body: "Dynamics are where great worship moments are built. These calls give you real-time control over the room's energy:\n\n• Full build: Everyone at full capacity — maximum energy\n• Strip back: Drop to minimal — vocals and 1–2 instruments only\n• Half-time: The groove drops to half feel (tempo stays, energy halves)\n• Pads only: Keys hold the room while everything else rests\n• Acoustic feel: Drop electric and electronic elements\n• Pockets only: Drums play minimal; bass and guitar lock to root notes" },
      { heading: "Ending calls", body: "Clean endings are a gift to the WL and the congregation. A sloppy ending breaks the moment. A clean ending honors it.\n\n• Button it: Land on the final chord and stop cleanly\n• Soft landing: Gradually drop to near-silence\n• Ritard / Slow it: Decelerate tempo into the ending\n• Walk it down: Descending bass line resolution\n• Tag it out: Repeat the final phrase before ending\n\nEvery song in your set should have a pre-planned ending call. Never leave the ending to chance or instinct." },
      { heading: "Re-syncing to click: the rhythmic 'and' system", body: "When the band drifts from click — especially after a spontaneous moment — call the count aloud: '1 and 2 and 3 and 4 and.'\n\nThe AND subdivisions lock the band back to the click grid faster than downbeats alone. When you call only '1 — 2 — 3 — 4,' musicians can drift between beats. The 'and' gives them the subdivision anchor they need.\n\nUse this any time the groove feels unsteady. Don't wait for a full train wreck — call it early, call it calm, and the band will lock in within two bars." },
      { heading: "Song-to-song transitions: the musical runway", body: "The space between songs is where worship flow lives or dies. The transition is not a break — it's part of the set.\n\nBridge chords connect keys between songs. Common examples:\n• G major to D major: hold on A major (the 5 of D) as a pivot chord\n• Bb major to C major: hold on G major as the 5 of C, then resolve\n• A major to E major: hold on B major as the transition pivot\n\nThe process: end Song 1 cleanly, MD calls the bridge chord, keys player sustains, MD counts in Song 2 on the click. Practice every song-to-song transition in rehearsal. Transitions that aren't rehearsed will break on Sunday." },
      { heading: "Visual cues to standardize", body: "Verbal calls are primary, but visual cues are your backup — especially when talkback fails.\n\nStandardize these hand signals with your team in rehearsal:\n• Pointed finger up: going up a section (verse to chorus)\n• Palm down, pushing: strip back, reduce dynamics\n• Closed fist: full stop / button it\n• Circular hand motion: vamp / loop — keep repeating\n• Thumb across throat: kill the track or end\n• Hand on head: going back to the top" },
    ],
    practicePrompt: "Open the Vocabulary Reference in the app and read through every call category. Then open Live Mode and run a full service — calling every transition out loud using the standardized vocabulary. No improvised calls. Every section change gets a 'Stand by' call 2 bars early.",
  },
  {
    id: "rehearsal", icon: "⏱️", title: "Rehearsal & Preparation",
    tagline: "Structure your week and your rehearsal so Sunday runs with confidence.",
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
  { step: 1, phase: "Observe", desc: "Understand the MD role before you ever hold the mic. Shadow a full service and absorb the system.", weekIdx: 0, moduleId: "role", moduleLabel: "The Role of the MD", action: { label: "Start Module", target: "mdsystem" }, color: "#4A90D9" },
  { step: 2, phase: "Practice", desc: "Learn the standardized cue language. Practice calling transitions privately in your IEM before going live.", weekIdx: 1, moduleId: "cues", moduleLabel: "Cue Language & Communication", action: { label: "Start Module", target: "mdsystem" }, color: "#7B68C8" },
  { step: 3, phase: "Assist", desc: "Apply rehearsal structure and preparation systems. Call your first live songs with a backup MD present.", weekIdx: 2, moduleId: "rehearsal", moduleLabel: "Rehearsal & Preparation", action: { label: "Start Module", target: "mdsystem" }, color: "#2E9E6A" },
  { step: 4, phase: "Lead (Partial)", desc: "Lead the first half of a real set independently. Practice real Sunday scenarios before they happen.", weekIdx: 3, moduleId: null, moduleLabel: null, action: { label: "Practice Scenarios", target: "coaching" }, color: COLORS.accent },
  { step: 5, phase: "Lead (Full)", desc: "Lead a complete Sunday service. The MD stands by but does not call. You are ready.", weekIdx: 4, moduleId: null, moduleLabel: null, action: { label: "Run Live Mode", target: "live" }, color: "#C0394A" },
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

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
          {open === i && <div className="accordion-content fade-in">{item.a}</div>}
        </div>
      ))}
    </div>
  );
};

// ─── MD SYSTEM PAGE ───────────────────────────────────────────────────────────

const MDSystemPage = ({ setPage, moduleProgress, onCompleteModule }) => {
  const [activeModuleId, setActiveModuleId] = useState(null);
  const activeModule = MD_MODULES.find(m => m.id === activeModuleId);
  const completedCount = MD_MODULES.filter(m => moduleProgress[m.id]).length;

  if (activeModule) {
    return (
      <div className="fade-in">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button className="btn btn-ghost" onClick={() => setActiveModuleId(null)} style={{ padding: "7px 14px" }}>← Back</button>
          {moduleProgress[activeModule.id] && <span className="badge badge-green">✓ Completed</span>}
        </div>
        <div className="page-header">
          <div className="page-eyebrow">MD Training System</div>
          <div style={{ fontSize: 32, marginBottom: 8 }}>{activeModule.icon}</div>
          <div className="page-title">{activeModule.title}</div>
          <div className="page-sub">{activeModule.tagline}</div>
        </div>

        {/* outcomes */}
        <div style={{ background: COLORS.accentLight, border: `1px solid rgba(184,114,10,0.2)`, borderRadius: 14, padding: "18px 22px", marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.accent, marginBottom: 10 }}>After this module, you'll be able to:</div>
          {activeModule.outcomes.map((o, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7, fontSize: 13.5, color: COLORS.navy, lineHeight: 1.5 }}>
              <span style={{ color: COLORS.accent, flexShrink: 0 }}>→</span>
              <span>{o}</span>
            </div>
          ))}
        </div>

        {/* content sections */}
        {activeModule.sections.map((sec, i) => (
          <div key={i} className="card" style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: COLORS.navy, marginBottom: 12 }}>{sec.heading}</div>
            {sec.body.split("\n\n").map((para, j) => (
              <p key={j} style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.75, marginBottom: 10 }}>
                {para.startsWith("•") ? (
                  <span style={{ display: "block" }}>
                    {para.split("\n").map((line, k) => (
                      <span key={k} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        {line.startsWith("•") ? (
                          <><span style={{ color: COLORS.accent, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>·</span><span>{line.slice(2)}</span></>
                        ) : <span>{line}</span>}
                      </span>
                    ))}
                  </span>
                ) : para}
              </p>
            ))}
          </div>
        ))}

        {/* practice CTA */}
        <div className="card" style={{ marginBottom: 16, background: COLORS.surfaceAlt }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 8 }}>Put it into practice</div>
          <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.65, marginBottom: 16 }}>{activeModule.practicePrompt}</div>
          <button onClick={() => setPage("live")} className="btn btn-secondary">▶ Practice in Live Mode</button>
        </div>

        {!moduleProgress[activeModule.id] ? (
          <button onClick={() => onCompleteModule(activeModule.id)}
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: `1px solid ${COLORS.green}`, background: COLORS.greenLight, color: COLORS.green, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            ✓ Mark as Completed
          </button>
        ) : (
          <div style={{ textAlign: "center", padding: "14px", borderRadius: 12, background: COLORS.greenLight, color: COLORS.green, fontSize: 13, fontWeight: 600 }}>✓ Module completed</div>
        )}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-eyebrow">Training</div>
        <div className="page-title">MD Training System</div>
        <div className="page-sub">Three structured modules. Learn the role, the language, and the process.</div>
      </div>

      {/* progress card */}
      <div className="card" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 8 }}>
            {completedCount === 0 ? "Start your training" : completedCount === MD_MODULES.length ? "All modules complete" : `${completedCount} of ${MD_MODULES.length} modules completed`}
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${(completedCount / MD_MODULES.length) * 100}%` }} /></div>
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: COLORS.accent, flexShrink: 0 }}>{completedCount}/{MD_MODULES.length}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MD_MODULES.map((mod, i) => {
          const done = !!moduleProgress[mod.id];
          return (
            <button key={mod.id} onClick={() => setActiveModuleId(mod.id)}
              style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "20px 22px", background: COLORS.card, border: `1.5px solid ${done ? COLORS.green + "55" : COLORS.border}`, borderRadius: 16, cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "'DM Sans', sans-serif", box_shadow: COLORS.shadow, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = done ? COLORS.green : COLORS.accent; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = done ? COLORS.green + "55" : COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{mod.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.textDim }}>Module {i + 1}</div>
                  {done && <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Done</span>}
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: COLORS.navy, marginBottom: 4 }}>{mod.title}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted }}>{mod.tagline}</div>
                <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 8 }}>{mod.sections.length} sections · {mod.outcomes.length} outcomes</div>
              </div>
              <span style={{ color: COLORS.textDim, fontSize: 18, flexShrink: 0 }}>›</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 24, padding: "18px 22px", background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 14, textAlign: "center" }}>
        <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>Ready to put it into practice?</div>
        <button onClick={() => setPage("live")} className="btn btn-secondary">▶ Go to Live Mode</button>
      </div>
    </div>
  );
};

// ─── START HERE ──────────────────────────────────────────────────────────────

const StartHerePage = ({ setPage }) => {
  const steps = [
    { num: "1", label: "Learn the role", page: "mdsystem", desc: "Understand what an MD does and why it matters" },
    { num: "2", label: "Learn the language", page: "vocab", desc: "Master the standardized calls your band responds to" },
    { num: "3", label: "Practice scenarios", page: "coaching", desc: "Use AI coaching to rehearse real Sunday situations" },
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
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: COLORS.navy, lineHeight: 1.3, marginBottom: 10 }}>A training and execution system for Worship Music Directors.</div>
        <div style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.7 }}>This app trains and equips Music Directors to confidently lead a worship team — both in rehearsal and live on Sunday. It combines structured training modules with a real-time cue engine so you can learn the role and then execute it with clarity.</div>
      </div>

      <div className="section-label">Your path forward</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {steps.map((step, i) => (
          <button key={i} onClick={() => setPage(step.page)}
            style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "'DM Sans', sans-serif", boxShadow: COLORS.shadow, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: COLORS.accentLight, border: `1.5px solid rgba(184,114,10,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: COLORS.accent, flexShrink: 0 }}>{step.num}</div>
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
          <div key={mod.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, boxShadow: COLORS.shadow }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600, color: COLORS.navy, marginBottom: 2 }}>Module {i + 1} — {mod.title}</div>
              <div style={{ fontSize: 12, color: COLORS.textDim }}>{mod.tagline}</div>
            </div>
            <button onClick={() => setPage("mdsystem")} className="btn btn-primary" style={{ padding: "7px 16px", fontSize: 12, flexShrink: 0 }}>Start</button>
          </div>
        ))}
      </div>

      <div className="section-label">After training</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { icon: "⚡", label: "Scenario Practice", desc: "AI-coached rehearsals for real Sunday situations", page: "coaching" },
          { icon: "▶", label: "Live Mode", desc: "Execute a real service with the timed cue engine", page: "live" },
        ].map((item, i) => (
          <button key={i} onClick={() => setPage(item.page)}
            style={{ padding: "18px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif", boxShadow: COLORS.shadow, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{item.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: COLORS.textDim, lineHeight: 1.4 }}>{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── TRAINING JOURNEY ─────────────────────────────────────────────────────────

const TrainingJourneyPage = ({ setPage }) => {
  const [openStep, setOpenStep] = useState(1);
  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-eyebrow">WorshipPilot</div>
        <div className="page-title">Training Journey</div>
        <div className="page-sub">Five steps from observer to deployed Music Director.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {JOURNEY_STEPS.map((step, i) => {
          const week = ONBOARDING_WEEKS[step.weekIdx];
          const isOpen = openStep === step.step;
          const isLast = i === JOURNEY_STEPS.length - 1;

          return (
            <div key={step.step} style={{ display: "flex", gap: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 52, flexShrink: 0 }}>
                <button onClick={() => setOpenStep(isOpen ? null : step.step)}
                  style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${step.color}`, background: isOpen ? step.color : COLORS.surface, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: isOpen ? "#fff" : step.color, cursor: "pointer", flexShrink: 0, transition: "all 0.2s", boxShadow: isOpen ? `0 0 0 4px ${step.color}20` : "none" }}>
                  {step.step}
                </button>
                {!isLast && <div style={{ width: 2, flex: 1, minHeight: 20, background: `${step.color}30`, margin: "4px 0" }} />}
              </div>

              <div style={{ flex: 1, paddingBottom: isLast ? 0 : 8, paddingLeft: 12 }}>
                <button onClick={() => setOpenStep(isOpen ? null : step.step)}
                  style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0, paddingTop: 4, paddingBottom: isOpen ? 0 : 16, fontFamily: "'DM Sans', sans-serif" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 2 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: step.color }}>Step {step.step}</div>
                    <div style={{ fontSize: 10, color: COLORS.textDim, letterSpacing: 1, textTransform: "uppercase" }}>{step.phase}</div>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: COLORS.navy }}>{week.title}</div>
                </button>

                {isOpen && (
                  <div className="fade-in" style={{ background: COLORS.card, border: `1px solid ${step.color}40`, borderRadius: 14, padding: "18px 20px", marginTop: 10, marginBottom: 14, boxShadow: COLORS.shadow }}>
                    <div style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.65, marginBottom: 16 }}>{step.desc}</div>

                    {step.moduleLabel && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 14 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: step.color, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 2 }}>Study Module</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{step.moduleLabel}</div>
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 8 }}>This Week</div>
                      {week.tasks.map((task, ti) => (
                        <div key={ti} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: step.color, flexShrink: 0, marginTop: 7 }} />
                          <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5 }}>{task}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: "10px 14px", background: `${step.color}10`, border: `1px solid ${step.color}30`, borderRadius: 10, marginBottom: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: step.color, marginBottom: 4 }}>Ready When</div>
                      <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{week.benchmark}</div>
                    </div>

                    <button onClick={() => setPage(step.action.target)}
                      style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: `1.5px solid ${step.color}`, background: `${step.color}12`, color: step.color, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = `${step.color}25`}
                      onMouseLeave={e => e.currentTarget.style.background = `${step.color}12`}>
                      {step.action.label} →
                    </button>
                  </div>
                )}
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

  // Derive current training step from journey
  const currentStep = JOURNEY_STEPS[Math.min(completedCount, JOURNEY_STEPS.length - 1)];
  const currentWeek = ONBOARDING_WEEKS[currentStep.weekIdx];
  const trainingDone = completedCount >= MD_MODULES.length;

  return (
    <div className="fade-in">
      {/* Minimal header */}
      <div style={{ marginBottom: 36 }}>
        <div className="page-eyebrow">WorshipPilot</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 600, color: COLORS.navy, lineHeight: 1.1, marginTop: 6 }}>
          {trainingDone ? "Ready to lead." : "What's next?"}
        </div>
      </div>

      {/* ── PRIMARY ACTION 1: Training ── */}
      <button
        onClick={() => setPage(completedCount === 0 ? "training" : "mdsystem")}
        style={{ display: "flex", alignItems: "stretch", width: "100%", background: COLORS.navy, border: "none", borderRadius: 18, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: COLORS.shadowMd, marginBottom: 12, overflow: "hidden", transition: "all 0.2s", textAlign: "left" }}
        onMouseEnter={e => { e.currentTarget.style.background = COLORS.navyMid; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = COLORS.shadowLg; }}
        onMouseLeave={e => { e.currentTarget.style.background = COLORS.navy; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}>
        {/* Left accent bar */}
        <div style={{ width: 4, background: COLORS.accent, flexShrink: 0 }} />
        <div style={{ flex: 1, padding: "22px 24px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.accent, marginBottom: 8 }}>
            {trainingDone ? "Training Complete" : `Step ${currentStep.step} of ${JOURNEY_STEPS.length} — ${currentStep.phase}`}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
            {trainingDone ? "Review training modules" : currentWeek.title}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
            {trainingDone ? "All modules complete." : currentWeek.benchmark}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", paddingRight: 22, color: COLORS.accent, fontSize: 20 }}>›</div>
      </button>

      {/* ── PRIMARY ACTION 2: Live Mode ── */}
      <button
        onClick={() => setPage("live")}
        style={{ display: "flex", alignItems: "center", width: "100%", background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 18, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: COLORS.shadow, marginBottom: 40, overflow: "hidden", transition: "all 0.2s", textAlign: "left" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = COLORS.shadowMd; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; e.currentTarget.style.transform = "translateY(0)"; }}>
        {/* Play icon block */}
        <div style={{ width: 64, height: 64, background: COLORS.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22, color: COLORS.accent, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>▶</div>
        <div style={{ flex: 1, padding: "18px 20px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, marginBottom: 4 }}>Start Live Mode</div>
          <div style={{ fontSize: 13, color: COLORS.textDim }}>Real-time cues for your next service</div>
        </div>
        <div style={{ paddingRight: 20, color: COLORS.textDim, fontSize: 18 }}>›</div>
      </button>

      {/* ── SECONDARY: Resources & Tools ── */}
      <div className="section-label">Resources & Tools</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { icon: "🎓", title: "MD Training", sub: "3 modules", page: "mdsystem" },
          { icon: "⚡", title: "Scenarios", sub: "AI practice", page: "coaching" },
          { icon: "📢", title: "Vocabulary", sub: "All calls", page: "vocab" },
          { icon: "⚓", title: "System Manual", sub: "10 parts", page: "manual" },
          { icon: "🎼", title: "Song Builder", sub: "Build your set", page: "builder" },
          { icon: "📋", title: "Services", sub: "Set lists", page: "services" },
        ].map((item, i) => (
          <button key={i} onClick={() => setPage(item.page)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "'DM Sans', sans-serif", boxShadow: COLORS.shadow, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.borderMid; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = COLORS.shadow; }}>
            <div style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{item.title}</div>
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

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-eyebrow">Reference</div>
        <div className="page-title">Standardized Vocabulary</div>
        <div className="page-sub">Every call, what it means, and when to use it. Restricted vocabulary eliminates confusion.</div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {categories.map(c => (
          <button key={c} className={`btn ${filter === c ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter(c)} style={{ padding: "7px 14px" }}>{c}</button>
        ))}
      </div>

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
      <div className="card">
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: COLORS.navy, marginBottom: 14 }}>Common Worship Keys</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 10 }}>
          {[["G","G Am Bm C D Em F#dim"],["A","A Bm C#m D E F#m G#dim"],["C","C Dm Em F G Am Bdim"],["D","D Em F#m G A Bm C#dim"],["E","E F#m G#m A B C#m D#dim"],["Bb","Bb Cm Dm Eb F Gm Adim"],["F","F Gm Am Bb C Dm Edim"],["Eb","Eb Fm Gm Ab Bb Cm Ddim"]].map(([key, chords]) => (
            <div key={key} style={{ background: COLORS.surfaceAlt, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontFamily: "'DM Mono', monospace", color: COLORS.accent, fontWeight: 600, marginBottom: 6, fontSize: 13 }}>{key} Major</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.7 }}>
                {chords.split(" ").map((c, i) => (
                  <span key={i}><span style={{ color: COLORS.navy, fontWeight: 600 }}>{i + 1}</span>={c} </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── ONBOARDING PAGE ──────────────────────────────────────────────────────────

const OnboardingPage = () => {
  const [activeWeek, setActiveWeek] = useState(0);
  const [completed, setCompleted] = useState({});

  const toggleTask = (weekIdx, taskIdx) => {
    const key = `${weekIdx}-${taskIdx}`;
    setCompleted(prev => ({ ...prev, [key]: !prev[key] }));
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
        <div className="page-sub">The 5-Week Incubator. Benchmarks at each stage. We build MDs — we don't throw them in.</div>
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
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: COLORS.navy }}>{ONBOARDING_WEEKS[activeWeek].title}</div>
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
  // step: "list" | "prompt" | "input" | "feedback"
  const [step, setStep] = useState("list");
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [userResponse, setUserResponse] = useState("");
  const [feedback, setFeedback] = useState(null); // { affirmation, suggestion, idealCall }
  const [loading, setLoading] = useState(false);

  const difficultyColor = (d) => d === "High" ? COLORS.red : d === "Medium" ? COLORS.accent : COLORS.green;
  const difficultyBg    = (d) => d === "High" ? COLORS.redLight : d === "Medium" ? COLORS.accentLight : COLORS.greenLight;

  const openScenario = (scenario) => {
    setSelectedScenario(scenario);
    setUserResponse("");
    setFeedback(null);
    setStep("prompt");
  };

  const resetToList = () => {
    setStep("list");
    setSelectedScenario(null);
    setUserResponse("");
    setFeedback(null);
  };

  const submitResponse = async () => {
    if (!userResponse.trim() || loading) return;
    setLoading(true);

    const systemPrompt = `You are an expert Music Director coach for the WorshipPilot MD System. A trainee has responded to a live scenario. Evaluate their response and return ONLY a JSON object with exactly three fields:

{
  "affirmation": "One sentence affirming what they got right or their instinct. Be specific and genuine, not generic.",
  "suggestion": "One concrete suggestion for next time. Be specific — reference timing, vocabulary, or sequence.",
  "idealCall": "The ideal call sequence for this scenario. Use the standardized MD vocabulary. Format as short sequential steps, e.g. 'Kill the track → Vamp on 1 and 4 → Count in on downbeat'"
}

MD System principles:
- Confidence Over Perfection: a confident wrong call beats a hesitant right one
- Standardized vocabulary: Stand by, Vamp, Kill the track, Half-time, Full build, Strip back, Hold, Tag it, Pads only, Count In
- 2-bars-early rule: all navigation calls 2 bars before the change
- Spontaneous Framework: Recognize → Anchor → Space → Exit
- Emergency calls: calm, clear, decisive

Scenario: ${selectedScenario?.title}
Prompt: ${selectedScenario?.prompt}
Trainee response: ${userResponse}

Return ONLY the JSON object. No markdown, no preamble.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: systemPrompt }]
        })
      });
      const data = await response.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setFeedback(parsed);
      setStep("feedback");
    } catch {
      setFeedback({
        affirmation: "Your response showed instinct for the situation.",
        suggestion: "Try to call 2 bars before the change — anticipation is the MD's most important skill.",
        idealCall: "Stay calm → Identify the issue → Call the fix with confidence"
      });
      setStep("feedback");
    } finally {
      setLoading(false);
    }
  };

  // ── SCENARIO LIST ──
  if (step === "list") {
    return (
      <div className="fade-in">
        <div className="page-header">
          <div className="page-eyebrow">Scenario Practice</div>
          <div className="page-title">Practice Situations</div>
          <div className="page-sub">Real Sunday situations. No consequences. Pick a scenario, call your response, get coaching.</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 12 }}>
          {SCENARIOS.map(s => (
            <div key={s.id} className="scenario-card" onClick={() => openScenario(s)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span className="badge badge-navy">{s.category}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: difficultyColor(s.difficulty), background: difficultyBg(s.difficulty), padding: "3px 9px", borderRadius: 20 }}>{s.difficulty}</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: COLORS.navy, marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>{s.title}</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.55, marginBottom: 18 }}>{s.prompt.slice(0, 110)}…</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent }}>Practice this →</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── SCENARIO PROMPT (Step 1) ──
  if (step === "prompt") {
    return (
      <div className="fade-in">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button className="btn btn-ghost" onClick={resetToList} style={{ padding: "7px 14px" }}>← Scenarios</button>
          <span style={{ fontSize: 11, fontWeight: 700, color: difficultyColor(selectedScenario.difficulty), background: difficultyBg(selectedScenario.difficulty), padding: "3px 10px", borderRadius: 20 }}>{selectedScenario.difficulty}</span>
        </div>

        {/* Scenario card */}
        <div style={{ background: COLORS.navy, borderRadius: 18, padding: "28px 28px", marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.accent, marginBottom: 10 }}>Scenario — {selectedScenario.category}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: "#fff", lineHeight: 1.2, marginBottom: 16 }}>{selectedScenario.title}</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>{selectedScenario.prompt}</div>
        </div>

        {/* Step instruction */}
        <div style={{ padding: "14px 18px", background: COLORS.accentLight, border: `1px solid rgba(184,114,10,0.2)`, borderRadius: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent }}>Your call — what do you say?</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>Walk through your response: what you call, in what order, and why.</div>
        </div>

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }} onClick={() => setStep("input")}>
          I'm ready to respond →
        </button>
      </div>
    );
  }

  // ── USER INPUT (Step 2) ──
  if (step === "input") {
    return (
      <div className="fade-in">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button className="btn btn-ghost" onClick={() => setStep("prompt")} style={{ padding: "7px 14px" }}>← Back</button>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{selectedScenario.title}</div>
        </div>

        {/* Condensed scenario reminder */}
        <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 6 }}>The situation</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.65 }}>{selectedScenario.prompt}</div>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 10 }}>Your call — what do you say?</div>
          <textarea
            className="chat-input"
            placeholder="e.g. 'Kill the track → call Vamp on 1 and 4 in current key → count the band back in on the downbeat…'"
            value={userResponse}
            onChange={e => setUserResponse(e.target.value)}
            rows={5}
            style={{ width: "100%", fontSize: 14, lineHeight: 1.6 }}
            autoFocus
          />
        </div>

        <button
          onClick={submitResponse}
          disabled={loading || !userResponse.trim()}
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: "13px", opacity: loading || !userResponse.trim() ? 0.6 : 1 }}>
          {loading ? "Evaluating…" : "Submit Response →"}
        </button>
      </div>
    );
  }

  // ── FEEDBACK (Step 3) ──
  if (step === "feedback" && feedback) {
    return (
      <div className="fade-in">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button className="btn btn-ghost" onClick={resetToList} style={{ padding: "7px 14px" }}>← Scenarios</button>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{selectedScenario.title}</div>
        </div>

        {/* User's response recap */}
        <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 6 }}>Your response</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.65, fontStyle: "italic" }}>{userResponse}</div>
        </div>

        {/* Feedback cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>

          {/* Affirmation */}
          <div style={{ background: COLORS.greenLight, border: `1px solid rgba(46,125,82,0.2)`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.green, marginBottom: 8 }}>What worked</div>
            <div style={{ fontSize: 15, color: COLORS.navy, lineHeight: 1.6, fontWeight: 500 }}>{feedback.affirmation}</div>
          </div>

          {/* Suggestion */}
          <div style={{ background: COLORS.accentLight, border: `1px solid rgba(184,114,10,0.2)`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.accent, marginBottom: 8 }}>Next time</div>
            <div style={{ fontSize: 15, color: COLORS.navy, lineHeight: 1.6, fontWeight: 500 }}>{feedback.suggestion}</div>
          </div>

          {/* Ideal call */}
          <div style={{ background: COLORS.navy, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.accent, marginBottom: 10 }}>Ideal call sequence</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#F0EBE1", lineHeight: 1.8 }}>
              {feedback.idealCall.split("→").map((step, i, arr) => (
                <span key={i}>
                  <span style={{ color: COLORS.accent }}>{i + 1}.</span> {step.trim()}
                  {i < arr.length - 1 && <span style={{ color: COLORS.accent, margin: "0 6px" }}>→</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Try again or next */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => { setUserResponse(""); setFeedback(null); setStep("input"); }} style={{ justifyContent: "center", padding: "12px" }}>
            Try again
          </button>
          <button className="btn btn-primary" onClick={resetToList} style={{ justifyContent: "center", padding: "12px" }}>
            Next scenario →
          </button>
        </div>
      </div>
    );
  }

  return null;
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
            <div style={{ fontSize: 26, width: 40, textAlign: "center", flexShrink: 0 }}>{part.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span className="badge badge-gold">Part {part.id}</span>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>{part.title}</div>
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
      <div style={{ fontSize: 30, marginBottom: 10 }}>{part.icon}</div>
      <div className="page-title">{part.title}</div>
      <div className="page-sub">{part.summary}</div>
    </div>
    <div className="detail-panel"><div className="detail-body"><Accordion items={part.content} /></div></div>
  </div>
);

// ─── ROADMAP PAGE ─────────────────────────────────────────────────────────────

const RoadmapPage = () => {
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
        <div className="page-sub">Four phases from foundation to scale. One phase at a time — don't rush the foundation.</div>
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
    </div>
  );
};

// ─── SONG BUILDER ─────────────────────────────────────────────────────────────

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
            style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>−</button>
          <div style={{ minWidth: 32, textAlign: "center", fontSize: 15, fontWeight: 700, color: COLORS.navy, fontFamily: "'DM Mono', monospace" }}>{section.bars}</div>
          <button onClick={() => onChange({ ...section, bars: section.bars + 2 })}
            style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+</button>
        </div>
        <div style={{ fontSize: 10, color: COLORS.textDim, marginRight: 4 }}>bars</div>

        {/* Thin divider */}
        <div style={{ width: 1, height: 18, background: COLORS.border, flexShrink: 0 }} />

        {/* Repeat */}
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <button onClick={() => onChange({ ...section, repeatCount: Math.max(1, section.repeatCount - 1) })}
            style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>−</button>
          <div style={{ minWidth: 28, textAlign: "center", fontSize: 13, fontWeight: 700, color: COLORS.accent, fontFamily: "'DM Mono', monospace" }}>×{section.repeatCount}</div>
          <button onClick={() => onChange({ ...section, repeatCount: section.repeatCount + 1 })}
            style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+</button>
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
                  style={{ padding: "5px 11px", borderRadius: 7, border: `1px solid ${section.bars === n ? COLORS.accent : COLORS.border}`, background: section.bars === n ? COLORS.accentLight : COLORS.surface, color: section.bars === n ? COLORS.accent : COLORS.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
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
                style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.surface, color: COLORS.textMuted, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>−</button>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.accent, minWidth: 24, textAlign: "center", fontFamily: "'DM Mono', monospace" }}>{section.headsUpBarsBefore ?? 2}</div>
              <button onClick={() => onChange({ ...section, headsUpBarsBefore: Math.min(section.bars, (section.headsUpBarsBefore ?? 2) + 1) })}
                style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.surface, color: COLORS.textMuted, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+</button>
              <div style={{ display: "flex", gap: 5 }}>
                {[1, 2, 4].map(n => (
                  <button key={n} onClick={() => onChange({ ...section, headsUpBarsBefore: n })}
                    style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${(section.headsUpBarsBefore ?? 2) === n ? COLORS.accent : COLORS.border}`, background: (section.headsUpBarsBefore ?? 2) === n ? COLORS.accentLight : COLORS.surface, color: (section.headsUpBarsBefore ?? 2) === n ? COLORS.accent : COLORS.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
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
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-eyebrow">Song Builder</div>
        <div className="page-title">{editing ? "Edit Song" : "New Song"}</div>
        <div className="page-sub">Build song structures for Live Mode. Sections define what the MD sees during service.</div>
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

      <button onClick={handleSave}
        style={{ width: "100%", padding: "14px", borderRadius: 12, border: `1px solid ${saved ? COLORS.green : COLORS.accent}`, background: saved ? COLORS.greenLight : COLORS.accentLight, color: saved ? COLORS.green : COLORS.accent, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}>
        {saved ? "✓ Saved to Library" : editing ? "Save Changes" : "Save to Song Library"}
      </button>
    </div>
  );
};

// ─── SERVICE BUILDER ──────────────────────────────────────────────────────────

const ServiceBuilderPage = ({ services, songLibrary, activeServiceId, onSaveService, onDuplicateService, onSetActive, onLaunch }) => {
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || null);
  const [editTitle, setEditTitle] = useState("");
  const [addSongId, setAddSongId] = useState(songLibrary[0]?.id || "");
  const service = services.find(s => s.id === selectedServiceId);

  useEffect(() => { if (service) setEditTitle(service.title); }, [selectedServiceId]);

  const handleTitleChange = (v) => { setEditTitle(v); onSaveService({ ...service, title: v }); };
  const addSong = () => { if (!addSongId || !service || service.songIds.includes(addSongId)) return; onSaveService({ ...service, songIds: [...service.songIds, addSongId] }); };
  const removeSong = (songId) => onSaveService({ ...service, songIds: service.songIds.filter(id => id !== songId) });
  const moveSongUp = (i) => { if (i === 0) return; const ids = [...service.songIds]; [ids[i-1],ids[i]]=[ids[i],ids[i-1]]; onSaveService({ ...service, songIds: ids }); };
  const moveSongDown = (i) => { if (i === service.songIds.length-1) return; const ids = [...service.songIds]; [ids[i],ids[i+1]]=[ids[i+1],ids[i]]; onSaveService({ ...service, songIds: ids }); };
  const createService = () => { const newSvc = { id: mkId(), title: "New Service", songIds: [] }; onSaveService(newSvc); setSelectedServiceId(newSvc.id); };
  const resolvedSongs = service ? service.songIds.map(id => songLibrary.find(s => s.id === id)).filter(Boolean) : [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-eyebrow">Service Builder</div>
        <div className="page-title">Build Your Service</div>
        <div className="page-sub">Assemble songs into a service, then launch in Live Mode.</div>
      </div>

      <div className="section-label">Services</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {services.map(svc => (
          <div key={svc.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: COLORS.card, border: `1px solid ${selectedServiceId === svc.id ? COLORS.accent : COLORS.border}`, borderRadius: 12, boxShadow: COLORS.shadow }}>
            <button onClick={() => setSelectedServiceId(svc.id)} style={{ flex: 1, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif", padding: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{svc.title}</div>
              <div style={{ fontSize: 11, color: COLORS.textDim }}>{svc.songIds.length} song{svc.songIds.length !== 1 ? "s" : ""}</div>
            </button>
            {svc.id === activeServiceId && <span className="badge badge-green">Active</span>}
            <button onClick={() => onDuplicateService && onDuplicateService(svc)} className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }}>Copy</button>
          </div>
        ))}
        <button onClick={createService} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>+ New Service</button>
      </div>

      {service && (
        <>
          <div className="section-label">Edit Service</div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 6 }}>Service Title</div>
            <input value={editTitle} onChange={e => handleTitleChange(e.target.value)} className="field-input" />
          </div>

          <div className="section-label">Set List</div>
          {resolvedSongs.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: COLORS.textDim, fontSize: 13, background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, marginBottom: 12, boxShadow: COLORS.shadow }}>
              No songs yet — add songs from the library below
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {resolvedSongs.map((song, i) => (
                <div key={song.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, boxShadow: COLORS.shadow }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textDim, width: 18, textAlign: "center", fontFamily: "'DM Mono', monospace" }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{song.title}</div>
                    <div style={{ fontSize: 11, color: COLORS.textDim }}>Key of {song.key} · {song.bpm} BPM · {song.sections.length} sections</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => moveSongUp(i)} disabled={i === 0} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 11, cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                    <button onClick={() => moveSongDown(i)} disabled={i === resolvedSongs.length-1} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceAlt, color: COLORS.textMuted, fontSize: 11, cursor: i === resolvedSongs.length-1 ? "default" : "pointer", opacity: i === resolvedSongs.length-1 ? 0.3 : 1 }}>↓</button>
                    <button onClick={() => removeSong(song.id)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid rgba(192,57,74,0.2)`, background: COLORS.redLight, color: COLORS.red, fontSize: 12, cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <select value={addSongId} onChange={e => setAddSongId(e.target.value)} className="field-input" style={{ flex: 1 }}>
              {songLibrary.map(s => <option key={s.id} value={s.id}>{s.title} — Key of {s.key}</option>)}
            </select>
            <button onClick={addSong} className="btn btn-primary">+ Add</button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => onSetActive(service.id)}
              style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${service.id === activeServiceId ? COLORS.green : COLORS.border}`, background: service.id === activeServiceId ? COLORS.greenLight : COLORS.card, color: service.id === activeServiceId ? COLORS.green : COLORS.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: COLORS.shadow }}>
              {service.id === activeServiceId ? "✓ Active Service" : "Set as Active"}
            </button>
            <button onClick={() => { onSetActive(service.id); onLaunch(); }} className="btn btn-primary" style={{ flex: 1, justifyContent: "center", padding: "12px" }}>
              ▶ Launch in Live Mode
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
  const songs = activeService ? activeService.songIds.map(id => songLibrary.find(s => s.id === id)).filter(Boolean) : [];

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
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, rgba(192,122,12,0.15) 0%, rgba(232,168,56,0.08) 100%)", border: `1px solid rgba(192,122,12,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px", boxShadow: "0 4px 20px rgba(192,122,12,0.15)" }}>▶</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: LIVE.text, marginBottom: 8 }}>No Active Service</div>
        <div style={{ fontSize: 14, color: LIVE.textMuted, marginBottom: 28, lineHeight: 1.6 }}>Build a service in the Service Builder, then launch it here.</div>
        <button onClick={onGoToServiceBuilder}
          style={{ padding: "13px 28px", borderRadius: 12, border: `1px solid ${COLORS.accentDim}`, background: COLORS.accentGlow, color: COLORS.accent, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
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
  const beatPosition       = beatTick % 4;

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

  const cmdGroups = [
    { label: "Navigation", cmds: [{ label: "Verse", action: () => jumpToType("verse") },{ label: "Chorus", action: () => jumpToType("chorus") },{ label: "Bridge", action: () => jumpToType("bridge") },{ label: "Top", action: () => jumpToType("top") }] },
    { label: "Flow",       cmds: ["Vamp","Tag","Hold"].map(c => ({ label: c, action: () => tap(c) })) },
    { label: "Dynamics",   cmds: ["Build","Pull Back","Pads Only","Full Band"].map(c => ({ label: c, action: () => tap(c) })) },
    { label: "Emergency",  cmds: ["Kill Track","Reset","Count In"].map(c => ({ label: c, action: () => tap(c) })) },
  ];

  const hasOverrides = liveLoopActive || liveExtraRepeats > 0 || !!liveEndingMode;
  const totalBarsEffectiveDisplay = section.bars * (section.repeatCount + liveExtraRepeats);
  const currentBarDisplay = isPlaying ? Math.min(Math.floor(progress * totalBarsEffectiveDisplay) + 1, totalBarsEffectiveDisplay) : 1;

  const segColor = nearingEnd ? COLORS.accent : sectionColor(section.type);
  const lighten = (hex, amt) => { const n=parseInt(hex.slice(1),16); const r=Math.min(255,(n>>16)+amt); const g=Math.min(255,((n>>8)&0xff)+amt); const b=Math.min(255,(n&0xff)+amt); return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`; };

  // Bar timeline renderer (unchanged logic)
  const renderTimeline = () => {
    const totalBars = totalBarsEffectiveDisplay;
    const currentBar = Math.min(Math.floor(progress * totalBars), totalBars - 1);
    const PULSE_STRONG = lighten(segColor, 60);
    const PULSE_WEAK   = lighten(segColor, 30);
    return (
      <div style={{ display: "flex", gap: 2, height: 4, userSelect: "none" }}>
        {Array.from({ length: totalBars }).map((_, i) => {
          const isCurrent = i === currentBar && isPlaying;
          const isPast = i < currentBar;
          const isDownbeat = beatPosition === 0;
          const currentFill = isCurrent && beatActive ? (isDownbeat ? PULSE_STRONG : PULSE_WEAK) : `${segColor}AA`;
          return (
            <div key={i} style={{ flex: 1, borderRadius: 2, position: "relative", overflow: "hidden", background: LIVE.border, border: isCurrent ? `1px solid ${beatActive ? PULSE_WEAK : segColor}` : "1px solid transparent", transition: "border 0.15s" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: isPast ? "100%" : isCurrent ? `${((progress * totalBars) - currentBar) * 100}%` : "0%", background: isCurrent ? currentFill : isPast ? `${segColor}CC` : "transparent", transition: isCurrent && !beatActive ? "width 0.1s linear" : "none" }} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ maxWidth: 540, margin: "0 auto", background: LIVE.bgGrad, minHeight: "100%", padding: "20px 18px", borderRadius: 0 }}>

      {/* ── TOP BAR: song context + transport — minimal ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${LIVE.border}` }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600, color: LIVE.text }}>{song.title}</div>
          <div style={{ fontSize: 10, color: LIVE.textDim, marginTop: 1, fontFamily: "'DM Mono', monospace" }}>Key of {song.key} · {song.bpm} BPM</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: isPlaying ? "#4CAF7D" : LIVE.textDim, fontFamily: "'DM Mono', monospace', marginRight: 4" }}>{isPlaying ? "● LIVE" : "○ PAUSED"}</div>
          {!isPlaying ? (
            <button onClick={handlePlay} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${COLORS.accentDim}`, background: COLORS.accentGlow, color: COLORS.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>▶</button>
          ) : (
            <button onClick={handlePause} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${COLORS.accentDim}`, background: COLORS.accentGlow, color: COLORS.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>⏸</button>
          )}
          <button onClick={handleReset} style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${LIVE.border}`, background: LIVE.surface, color: LIVE.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>⟳</button>
        </div>
      </div>

      {/* ── TIER 1 PRIMARY: Section label + Call + Bar position ── */}
      <div style={{ background: LIVE.card, border: `2px solid ${nearingEnd ? COLORS.accent : segColor}`, borderRadius: 20, padding: "24px 22px", marginBottom: 10, boxShadow: isPlaying ? `0 0 32px ${nearingEnd ? COLORS.accent : segColor}18` : "none", transition: "border-color 0.3s, box-shadow 0.3s" }}>

        {/* Section type pill + position */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: segColor }} />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: segColor }}>{section.type}</div>
          </div>
          <div style={{ fontSize: 10, color: LIVE.textDim, fontFamily: "'DM Mono', monospace" }}>{sectionIndex + 1} / {totalSections}</div>
        </div>

        {/* 1. SECTION LABEL — largest element */}
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 700, color: LIVE.text, lineHeight: 0.95, marginBottom: 16, letterSpacing: "-1px" }}>
          {section.label}
        </div>

        {/* 2. CURRENT CALL — the MD's cue, prominent */}
        {section.note ? (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: LIVE.surface, borderRadius: 12, borderLeft: `3px solid ${segColor}` }}>
            <div style={{ fontSize: 17, color: LIVE.text, fontWeight: 600, lineHeight: 1.4 }}>{section.note}</div>
          </div>
        ) : (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: LIVE.surface, borderRadius: 12, borderLeft: `3px solid ${LIVE.border}` }}>
            <div style={{ fontSize: 14, color: LIVE.textDim, fontStyle: "italic" }}>No cue set for this section</div>
          </div>
        )}

        {/* 3. BAR POSITION */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 700, color: nearingEnd ? COLORS.accent : LIVE.textMuted, transition: "color 0.3s", lineHeight: 1 }}>
            Bar {currentBarDisplay}
          </div>
          <div style={{ fontSize: 13, color: LIVE.textDim, fontFamily: "'DM Mono', monospace" }}>
            of {totalBarsEffectiveDisplay}{liveExtraRepeats > 0 ? ` (+${liveExtraRepeats})` : ""}
          </div>
          {liveLoopActive && <div style={{ fontSize: 10, fontWeight: 700, color: "#4A90D9", marginLeft: 2 }}>⟳</div>}
        </div>

        {/* Timeline bar */}
        {renderTimeline()}
      </div>

      {/* ── TIER 2 SECONDARY: Heads-up / Next section ── */}
      {nextSection ? (
        <div style={{ background: nearingEnd ? `${COLORS.accent}0E` : LIVE.surface, border: `1px solid ${nearingEnd ? COLORS.accent : LIVE.border}`, borderRadius: 14, padding: "14px 18px", marginBottom: 12, transition: "all 0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: nearingEnd ? COLORS.accent : LIVE.textDim, marginBottom: 5 }}>
                {nearingEnd ? "⚡ Stand by for" : "Up next"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: section.headsUp ? 5 : 0 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: sectionColor(nextSection.type), flexShrink: 0 }} />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: nearingEnd ? 26 : 20, fontWeight: 600, color: nearingEnd ? LIVE.text : LIVE.textMuted, transition: "all 0.3s" }}>{nextSection.label}</div>
              </div>
              {section.headsUp && (
                <div style={{ fontSize: 13, color: nearingEnd ? COLORS.accent : LIVE.textDim, fontWeight: nearingEnd ? 600 : 400, paddingLeft: 14 }}>{section.headsUp}</div>
              )}
            </div>
            {nearingEnd && remaining > 0 && (
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 700, color: COLORS.accent, flexShrink: 0, marginLeft: 12 }}>{Math.ceil(remaining / 1000)}s</div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ border: `1px solid ${LIVE.border}`, borderRadius: 14, padding: "11px 18px", marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: LIVE.textDim }}>{songIndex < totalSongs - 1 ? "Last section — next song follows" : "Service complete"}</div>
        </div>
      )}

      {/* ── TIER 3 TERTIARY: Options (small, contextual) ── */}
      {section.options?.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {section.options.map((opt, i) => (
            <button key={i} onClick={() => tap(opt)} style={{ padding: "5px 12px", borderRadius: 8, background: "transparent", border: `1px solid ${LIVE.border}`, color: LIVE.textDim, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif', fontWeight: 500", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = segColor}
              onMouseLeave={e => e.currentTarget.style.borderColor = LIVE.border}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* ── DIVIDER ── */}
      <div style={{ borderTop: `1px solid ${LIVE.border}`, marginBottom: 14 }} />

      {/* ── TIER 4 LOW: Controls — de-emphasized ── */}

      {/* Override status strip (only when active) */}
      {hasOverrides && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 8, marginBottom: 10, background: "rgba(74,144,217,0.06)", border: `1px solid rgba(74,144,217,0.2)` }}>
          <div style={{ display: "flex", gap: 5, flex: 1, flexWrap: "wrap" }}>
            {liveLoopActive && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "rgba(74,144,217,0.15)", color: "#4A90D9" }}>⟳ LOOP</span>}
            {liveExtraRepeats > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: COLORS.accentGlow, color: COLORS.accent }}>+{liveExtraRepeats} repeat</span>}
            {liveEndingMode && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "rgba(46,125,82,0.12)", color: "#4CAF7D" }}>END: {liveEndingMode.toUpperCase()}</span>}
          </div>
          <button onClick={clearAllOverrides} style={{ padding: "2px 8px", borderRadius: 6, border: `1px solid ${LIVE.border}`, background: "transparent", color: LIVE.textDim, fontSize: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Clear</button>
        </div>
      )}

      {/* Override + jump controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 5 }}>
        <button onClick={handleExtendOne} style={{ padding: "8px 4px", borderRadius: 7, border: `1px solid ${liveExtraRepeats > 0 ? COLORS.accentDim : LIVE.border}`, background: liveExtraRepeats > 0 ? COLORS.accentGlow : "transparent", color: liveExtraRepeats > 0 ? COLORS.accent : LIVE.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Extend +1</button>
        <button onClick={handleToggleLoop} style={{ padding: "8px 4px", borderRadius: 7, border: `1px solid ${liveLoopActive ? "#4A90D9" : LIVE.border}`, background: liveLoopActive ? "rgba(74,144,217,0.1)" : "transparent", color: liveLoopActive ? "#4A90D9" : LIVE.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{liveLoopActive ? "⟳ Loop ON" : "Loop"}</button>
        <button onClick={handleNextChorus} style={{ padding: "8px 4px", borderRadius: 7, border: `1px solid ${LIVE.border}`, background: "transparent", color: LIVE.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>→ Chorus</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 12 }}>
        <button onClick={handleSkipOutro} style={{ padding: "8px 4px", borderRadius: 7, border: `1px solid ${LIVE.border}`, background: "transparent", color: LIVE.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>→ Outro</button>
        <button onClick={handleEndSoft} style={{ padding: "8px 4px", borderRadius: 7, border: `1px solid ${liveEndingMode === "soft" ? "#4CAF7D" : LIVE.border}`, background: liveEndingMode === "soft" ? "rgba(46,125,82,0.1)" : "transparent", color: liveEndingMode === "soft" ? "#4CAF7D" : LIVE.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{liveEndingMode === "soft" ? "✓ Soft" : "End Soft"}</button>
        <button onClick={handleEndClean} style={{ padding: "8px 4px", borderRadius: 7, border: `1px solid ${liveEndingMode === "clean" ? "#4CAF7D" : LIVE.border}`, background: liveEndingMode === "clean" ? "rgba(46,125,82,0.1)" : "transparent", color: liveEndingMode === "clean" ? "#4CAF7D" : LIVE.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{liveEndingMode === "clean" ? "✓ Clean" : "End Clean"}</button>
      </div>

      {/* Section / Song nav */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5, marginBottom: 14 }}>
        {[
          { label: "◂◂ Song",   action: goPrevSong,    disabled: songIndex === 0 },
          { label: "◂ Prev",    action: goPrevSection, disabled: sectionIndex === 0 },
          { label: "Next ▸",    action: goNextSection, disabled: sectionIndex === totalSections - 1 },
          { label: "Song ▸▸",  action: goNextSong,    disabled: songIndex === totalSongs - 1 },
        ].map((btn, i) => (
          <button key={i} onClick={btn.action} disabled={btn.disabled}
            style={{ padding: "8px 4px", borderRadius: 7, border: `1px solid ${LIVE.border}`, background: "transparent", color: btn.disabled ? LIVE.textDim : LIVE.textMuted, fontSize: 10, fontWeight: 600, cursor: btn.disabled ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", opacity: btn.disabled ? 0.25 : 1 }}>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Command call groups — quietest tier */}
      {cmdGroups.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: LIVE.textDim, marginBottom: 4, opacity: 0.4 }}>{group.label}</div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${group.cmds.length <= 3 ? group.cmds.length : 4}, 1fr)`, gap: 4 }}>
            {group.cmds.map((cmd, ci) => {
              const isEmergency = group.label === "Emergency";
              const isActive = lastCommand === cmd.label;
              return (
                <button key={ci} onClick={cmd.action}
                  style={{ padding: "7px 4px", borderRadius: 7, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.1s", border: isActive ? `1.5px solid ${COLORS.accent}` : isEmergency ? `1px solid rgba(192,57,74,0.25)` : `1px solid ${LIVE.border}`, background: isActive ? COLORS.accentGlow : isEmergency ? "rgba(192,57,74,0.06)" : "transparent", color: isActive ? COLORS.accent : isEmergency ? COLORS.red : LIVE.textDim }}>
                  {cmd.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Last command echo */}
      {lastCommand && (
        <div style={{ marginTop: 10, padding: "7px 12px", borderRadius: 8, background: COLORS.accentGlow, border: `1px solid ${COLORS.accentDim}`, display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS.accent, boxShadow: `0 0 5px ${COLORS.accent}` }} />
          <div style={{ fontSize: 10, color: LIVE.textDim }}>Called: <span style={{ fontWeight: 700, color: COLORS.accent }}>{lastCommand}</span></div>
        </div>
      )}
    </div>
  );
};

// ─── GLOBAL SEARCH ────────────────────────────────────────────────────────────

const SEARCH_INDEX = [
  { label: "Home",              type: "Page",        icon: "⌂",  page: "dashboard" },
  { label: "Live Mode",         type: "Page",        icon: "▶",  page: "live" },
  { label: "Vocabulary",        type: "Page",        icon: "📢", page: "vocab" },
  { label: "MD Onboarding",     type: "Page",        icon: "🌱", page: "onboarding" },
  { label: "Scenario Practice", type: "Page",        icon: "⚡", page: "coaching" },
  { label: "System Manual",     type: "Page",        icon: "◈",  page: "manual" },
  { label: "Song Builder",      type: "Page",        icon: "🎼", page: "builder" },
  { label: "Service Builder",   type: "Page",        icon: "📋", page: "services" },
  { label: "Roadmap",           type: "Page",        icon: "⬡",  page: "roadmap" },
  ...PARTS_DATA.map(p => ({ label: `Part ${p.id}: ${p.title}`, type: "System Part", icon: p.icon, page: "part-detail", part: p })),
];

const GlobalSearch = ({ onNavigate, onClose }) => {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = query.trim() === "" ? SEARCH_INDEX : SEARCH_INDEX.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));
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
          <input ref={inputRef} className="search-input-field" placeholder="Search pages and system parts…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey} />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: COLORS.textDim, cursor: "pointer", fontSize: 14 }}>✕</button>}
        </div>
        <div className="search-results">
          {results.length === 0 ? (
            <div className="search-empty">No results for "{query}"</div>
          ) : (
            results.map((item, i) => (
              <button key={i} className={`search-result-item ${i === highlighted ? "highlighted" : ""}`} onClick={() => go(item)} onMouseEnter={() => setHighlighted(i)}>
                <div className="search-result-icon">{item.icon}</div>
                <div>
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
              <span style={{ fontSize: 10, color: COLORS.textDim, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "1px 6px", fontFamily: "'DM Mono', monospace" }}>{k}</span>
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
  const handleDuplicateService = (svc) => { const clone = { ...svc, id: mkId(), title: `${svc.title} (Copy)`, songIds: [...svc.songIds] }; setServices(svcs => [...svcs, clone]); };

  const navigate = (targetPage, part) => { if (part) { setSelectedPart(part); setPage("part-detail"); } else setPage(targetPage); };

  const nav = [
    { id: "dashboard",  icon: "⌂",  label: "Home" },
    { id: "starthere",  icon: "⭐", label: "Start Here" },
    { id: "training",   icon: "★",  label: "Training Journey" },
    { id: "mdsystem",   icon: "🎓", label: "MD System" },
    { id: "manual",     icon: "◈",  label: "System Manual" },
    { id: "vocab",      icon: "📢", label: "Vocabulary" },
    { id: "onboarding", icon: "🌱", label: "Onboarding" },
    { id: "coaching",   icon: "⚡", label: "Scenario Practice" },
    { id: "builder",    icon: "🎼", label: "Song Builder" },
    { id: "services",   icon: "📋", label: "Service Builder" },
    { id: "live",       icon: "▶",  label: "Live Mode" },
    { id: "roadmap",    icon: "⬡",  label: "Roadmap" },
  ];

  const renderPage = () => {
    switch (page) {
      case "dashboard":   return <Dashboard setPage={setPage} setSelectedPart={setSelectedPart} moduleProgress={moduleProgress} />;
      case "starthere":   return <StartHerePage setPage={setPage} />;
      case "training":    return <TrainingJourneyPage setPage={setPage} />;
      case "mdsystem":    return <MDSystemPage setPage={setPage} moduleProgress={moduleProgress} onCompleteModule={handleCompleteModule} />;
      case "vocab":       return <VocabPage />;
      case "onboarding":  return <OnboardingPage />;
      case "coaching":    return <CoachingPage />;
      case "manual":      return <ManualPage setSelectedPart={setSelectedPart} setPage={setPage} />;
      case "part-detail": return selectedPart ? <PartDetail part={selectedPart} setPage={setPage} /> : null;
      case "roadmap":     return <RoadmapPage />;
      case "builder":     return <SongBuilderPage songLibrary={songLibrary} onSaveSong={handleSaveSong} onDuplicateSong={handleDuplicateSong} editSongId={editSongId} setPage={(p, id) => { setEditSongId(id ?? null); setPage(p); }} />;
      case "services":    return <ServiceBuilderPage services={services} songLibrary={songLibrary} activeServiceId={activeServiceId} onSaveService={handleSaveService} onDuplicateService={handleDuplicateService} onSetActive={setActiveServiceId} onLaunch={() => setPage("live")} />;
      case "live":        return <LiveModePage activeService={activeService} songLibrary={songLibrary} onGoToServiceBuilder={() => setPage("services")} />;
      default:            return <Dashboard setPage={setPage} setSelectedPart={setSelectedPart} />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        <nav className="sidebar">
          <div className="sidebar-logo">WP</div>
          <div className="nav-divider" />
          {nav.slice(0, 8).map(n => (
            <button key={n.id} className={`nav-btn ${page === n.id || (page === "part-detail" && n.id === "manual") ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <span style={{ fontSize: 17 }}>{n.icon}</span>
              <div className="nav-tooltip">{n.label}</div>
            </button>
          ))}
          <div className="nav-divider" />
          {nav.slice(8).map(n => (
            <button key={n.id} className={`nav-btn ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <span style={{ fontSize: 17 }}>{n.icon}</span>
              <div className="nav-tooltip">{n.label}</div>
            </button>
          ))}
          {/* Search pinned to bottom of sidebar */}
          <div style={{ flex: 1 }} />
          <div className="nav-divider" />
          <button className="search-btn" onClick={() => setSearchOpen(true)}>
            🔍
            <div className="nav-tooltip">Search</div>
          </button>
        </nav>
        <main className="main-content">{renderPage()}</main>
      </div>
      {searchOpen && <GlobalSearch onNavigate={navigate} onClose={() => setSearchOpen(false)} />}
    </>
  );
}
