import { useState, useEffect } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// When embedded in wwwroot, this is empty string (same origin).
// Change to "http://localhost:5000" only during local dev if running separately.
const API_BASE = "";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("gf_token");
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("gf_token");
    window.location.reload();
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || "Request failed");
  }
  // PDF blob download
  const contentType = res.headers.get("Content-Type") || "";
  if (contentType.includes("application/pdf")) return res.blob();
  return res.json();
}

// ─── Design tokens ─────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0d1f0f; --paper: #f4f0e6; --cream: #ede8d8;
    --sage: #4a7c59; --moss: #2d5a3d; --gold: #c8a84b; --amber: #e8c96a;
    --mist: #d6e8db; --error: #b84040;
    --serif: 'Playfair Display', Georgia, serif;
    --sans: 'DM Sans', sans-serif; --mono: 'DM Mono', monospace;
    --r-sm: 6px; --r-md: 12px; --r-lg: 20px;
    --shadow: 0 4px 24px rgba(13,31,15,.12); --shadow-lg: 0 12px 48px rgba(13,31,15,.18);
  }
  html { scroll-behavior: smooth; }
  body { font-family: var(--sans); background: var(--paper); color: var(--ink); min-height: 100vh; line-height: 1.6; }
  .app { display: flex; flex-direction: column; min-height: 100vh; }
  .page { flex: 1; padding: 0 0 80px; }

  .nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(244,240,230,.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(74,124,89,.18);
    padding: 0 32px; display: flex; align-items: center; justify-content: space-between; height: 68px;
  }
  .nav-brand { font-family: var(--serif); font-size: 1.3rem; font-weight: 700; color: var(--moss); display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
  .nav-brand svg { width: 28px; height: 28px; }
  .nav-links { display: flex; align-items: center; gap: 6px; }
  .nav-link { padding: 8px 16px; border-radius: var(--r-sm); font-size: .875rem; font-weight: 500; cursor: pointer; border: none; background: transparent; color: var(--ink); transition: background .18s, color .18s; }
  .nav-link:hover { background: var(--mist); color: var(--moss); }
  .nav-link.active { background: var(--moss); color: #fff; }
  .nav-cta { padding: 9px 20px; border-radius: var(--r-sm); background: var(--gold); color: var(--ink); font-weight: 600; font-size: .875rem; cursor: pointer; border: none; transition: background .18s, transform .12s; }
  .nav-cta:hover { background: var(--amber); transform: translateY(-1px); }

  .hero { position: relative; overflow: hidden; padding: 100px 32px 80px; background: linear-gradient(155deg, var(--moss) 0%, #1a3d28 60%, #0d2618 100%); color: #fff; }
  .hero-noise { position: absolute; inset: 0; opacity: .04; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px; }
  .hero-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(200,168,75,.2); animation: pulse 6s ease-in-out infinite; }
  .hero-ring:nth-child(2) { width: 500px; height: 500px; right: -150px; top: -150px; }
  .hero-ring:nth-child(3) { width: 700px; height: 700px; right: -250px; top: -250px; animation-delay: 1.5s; }
  .hero-ring:nth-child(4) { width: 900px; height: 900px; right: -350px; top: -350px; animation-delay: 3s; }
  @keyframes pulse { 0%,100%{opacity:.15} 50%{opacity:.4} }
  .hero-content { position: relative; max-width: 680px; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(200,168,75,.2); border: 1px solid rgba(200,168,75,.4); padding: 6px 14px; border-radius: 100px; font-size: .78rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--amber); margin-bottom: 28px; }
  .hero h1 { font-family: var(--serif); font-size: clamp(2.6rem, 5vw, 4rem); font-weight: 900; line-height: 1.12; margin-bottom: 20px; letter-spacing: -.02em; }
  .hero h1 em { font-style: italic; color: var(--amber); }
  .hero p { font-size: 1.1rem; opacity: .8; max-width: 500px; margin-bottom: 40px; line-height: 1.7; }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn-primary { padding: 14px 28px; border-radius: var(--r-sm); background: var(--gold); color: var(--ink); font-weight: 700; font-size: .95rem; cursor: pointer; border: none; transition: background .18s, transform .12s, box-shadow .18s; display: inline-flex; align-items: center; gap: 8px; }
  .btn-primary:hover { background: var(--amber); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,168,75,.4); }
  .btn-outline { padding: 13px 28px; border-radius: var(--r-sm); background: transparent; color: #fff; font-weight: 600; font-size: .95rem; cursor: pointer; border: 1px solid rgba(255,255,255,.35); transition: background .18s; display: inline-flex; align-items: center; gap: 8px; }
  .btn-outline:hover { background: rgba(255,255,255,.1); }

  .stats { display: flex; background: var(--ink); color: #fff; overflow-x: auto; }
  .stat { flex: 1; min-width: 160px; padding: 28px 32px; border-right: 1px solid rgba(255,255,255,.08); text-align: center; }
  .stat:last-child { border-right: none; }
  .stat-n { font-family: var(--serif); font-size: 2rem; font-weight: 700; color: var(--amber); }
  .stat-l { font-size: .8rem; opacity: .55; text-transform: uppercase; letter-spacing: .06em; margin-top: 4px; }

  .section { padding: 80px 32px; max-width: 1100px; margin: 0 auto; }
  .section-label { font-size: .78rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--sage); margin-bottom: 12px; }
  .section-title { font-family: var(--serif); font-size: clamp(1.8rem,3vw,2.6rem); font-weight: 700; line-height: 1.2; margin-bottom: 48px; max-width: 560px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 24px; }
  .card { background: #fff; border: 1px solid rgba(74,124,89,.12); border-radius: var(--r-lg); padding: 32px; transition: transform .22s, box-shadow .22s; }
  .card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .card-icon { width: 48px; height: 48px; border-radius: var(--r-md); background: var(--mist); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 20px; }
  .card h3 { font-family: var(--serif); font-size: 1.2rem; margin-bottom: 10px; }
  .card p { font-size: .9rem; opacity: .65; line-height: 1.65; }

  .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 16px; }
  .step { display: flex; flex-direction: column; background: var(--cream); border-radius: var(--r-md); padding: 28px 24px; }
  .step-num { font-family: var(--serif); font-size: 3rem; font-weight: 900; color: rgba(74,124,89,.18); line-height: 1; margin-bottom: 16px; }
  .step h4 { font-weight: 600; margin-bottom: 8px; }
  .step p { font-size: .875rem; opacity: .65; }

  .auth-wrap { min-height: calc(100vh - 68px); display: flex; align-items: center; justify-content: center; padding: 60px 24px; background: radial-gradient(ellipse at 70% 30%, rgba(74,124,89,.08) 0%, transparent 60%); }
  .auth-card { width: 100%; max-width: 460px; background: #fff; border-radius: var(--r-lg); padding: 48px 44px; box-shadow: var(--shadow-lg); border: 1px solid rgba(74,124,89,.1); }
  .auth-card h2 { font-family: var(--serif); font-size: 1.9rem; font-weight: 700; margin-bottom: 6px; }
  .auth-sub { font-size: .9rem; opacity: .55; margin-bottom: 36px; }
  .auth-tabs { display: flex; margin-bottom: 36px; border-bottom: 1px solid var(--mist); }
  .auth-tab { flex: 1; padding: 12px; border: none; background: transparent; font-family: var(--sans); font-size: .9rem; font-weight: 600; cursor: pointer; color: rgba(13,31,15,.4); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color .18s, border-color .18s; }
  .auth-tab.active { color: var(--moss); border-bottom-color: var(--moss); }

  .field { margin-bottom: 20px; }
  .field label { display: block; font-size: .82rem; font-weight: 600; margin-bottom: 7px; color: rgba(13,31,15,.65); text-transform: uppercase; letter-spacing: .04em; }
  .field input, .field select, .field textarea { width: 100%; padding: 11px 14px; border-radius: var(--r-sm); border: 1.5px solid rgba(74,124,89,.22); background: var(--paper); font-family: var(--sans); font-size: .95rem; color: var(--ink); transition: border-color .18s, box-shadow .18s; outline: none; }
  .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--sage); box-shadow: 0 0 0 3px rgba(74,124,89,.12); }
  .field textarea { min-height: 90px; resize: vertical; }
  .btn-full { width: 100%; padding: 14px; border-radius: var(--r-sm); background: var(--moss); color: #fff; font-family: var(--sans); font-weight: 700; font-size: 1rem; cursor: pointer; border: none; transition: background .18s, transform .12s; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-full:hover { background: #234830; transform: translateY(-1px); }
  .btn-full:disabled { opacity: .5; cursor: not-allowed; transform: none; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-footer { text-align: center; margin-top: 24px; font-size: .875rem; opacity: .6; }
  .form-footer span { color: var(--sage); font-weight: 600; cursor: pointer; }
  .alert { padding: 12px 16px; border-radius: var(--r-sm); font-size: .875rem; font-weight: 500; margin-bottom: 20px; }
  .alert-success { background: rgba(74,124,89,.12); color: var(--moss); border: 1px solid rgba(74,124,89,.25); }
  .alert-error { background: rgba(184,64,64,.08); color: var(--error); border: 1px solid rgba(184,64,64,.2); }

  .cert-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 1100px; margin: 0 auto; padding: 60px 32px; align-items: start; }
  @media(max-width:800px) { .cert-layout { grid-template-columns: 1fr; } }
  .cert-form-panel h2 { font-family: var(--serif); font-size: 1.9rem; margin-bottom: 6px; }
  .cert-form-panel .sub { font-size: .9rem; opacity: .55; margin-bottom: 36px; }
  .cert-preview-panel { position: sticky; top: 90px; }
  .cert-preview-label { font-size: .75rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--sage); margin-bottom: 14px; }

  .cert-canvas { width: 100%; aspect-ratio: 1.414 / 1; background: #fff; border-radius: var(--r-md); box-shadow: var(--shadow-lg); border: 1px solid rgba(74,124,89,.15); position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px; text-align: center; font-family: var(--serif); }
  .cert-canvas::before { content: ''; position: absolute; inset: 12px; border: 2px solid rgba(200,168,75,.35); border-radius: 8px; pointer-events: none; }
  .cert-canvas::after { content: ''; position: absolute; inset: 16px; border: 1px solid rgba(200,168,75,.18); border-radius: 6px; pointer-events: none; }
  .cert-org { font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; color: var(--sage); margin-bottom: 8px; }
  .cert-title { font-size: clamp(.95rem,2.5vw,1.4rem); font-weight: 700; color: var(--moss); margin-bottom: 6px; }
  .cert-presented { font-size: .65rem; opacity: .5; margin-bottom: 10px; letter-spacing: .06em; text-transform: uppercase; }
  .cert-name { font-size: clamp(1.1rem,3vw,1.8rem); font-weight: 900; color: var(--ink); margin-bottom: 8px; font-style: italic; border-bottom: 1.5px solid var(--gold); padding-bottom: 6px; min-width: 60%; }
  .cert-desc { font-size: .65rem; opacity: .55; max-width: 70%; margin-bottom: 14px; line-height: 1.5; font-family: var(--sans); }
  .cert-meta { display: flex; gap: 24px; font-size: .65rem; font-family: var(--mono); color: var(--sage); }
  .cert-seal { position: absolute; bottom: 28px; right: 32px; width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, var(--moss), var(--sage)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.5rem; box-shadow: 0 4px 16px rgba(45,90,61,.35); }
  .cert-watermark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--serif); font-size: 4rem; font-weight: 900; color: rgba(74,124,89,.04); text-transform: uppercase; letter-spacing: .3em; pointer-events: none; transform: rotate(-25deg); }
  .cert-ribbon { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, var(--moss), var(--gold), var(--moss)); }

  .hist-header { padding: 60px 32px 40px; max-width: 1100px; margin: 0 auto; }
  .hist-header h2 { font-family: var(--serif); font-size: 2rem; margin-bottom: 8px; }
  .hist-header p { opacity: .55; font-size: .95rem; }
  .hist-filters { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding: 0 32px 32px; max-width: 1100px; margin: 0 auto; }
  .filter-btn { padding: 7px 18px; border-radius: 100px; border: 1.5px solid rgba(74,124,89,.22); background: transparent; font-size: .82rem; font-weight: 600; cursor: pointer; transition: background .18s, border-color .18s, color .18s; color: rgba(13,31,15,.6); }
  .filter-btn.active, .filter-btn:hover { background: var(--moss); border-color: var(--moss); color: #fff; }
  .search-input { padding: 8px 14px; border-radius: 100px; border: 1.5px solid rgba(74,124,89,.22); background: #fff; font-family: var(--sans); font-size: .875rem; outline: none; width: 220px; transition: border-color .18s; }
  .search-input:focus { border-color: var(--sage); }
  .cert-table { padding: 0 32px; max-width: 1100px; margin: 0 auto; }
  .cert-row { display: grid; grid-template-columns: 48px 1fr auto auto auto; align-items: center; gap: 16px; padding: 18px 20px; border-radius: var(--r-md); background: #fff; border: 1px solid rgba(74,124,89,.1); margin-bottom: 12px; transition: box-shadow .18s, transform .18s; cursor: pointer; }
  .cert-row:hover { box-shadow: var(--shadow); transform: translateX(4px); }
  .cert-row-icon { width: 42px; height: 42px; border-radius: var(--r-sm); background: var(--mist); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
  .cert-row-title { font-weight: 600; font-size: .95rem; }
  .cert-row-sub { font-size: .8rem; opacity: .5; margin-top: 2px; font-family: var(--mono); }
  .badge { padding: 4px 11px; border-radius: 100px; font-size: .72rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
  .badge-green { background: rgba(74,124,89,.12); color: var(--moss); }
  .badge-amber { background: rgba(200,168,75,.15); color: #8a6d1a; }
  .icon-btn { width: 34px; height: 34px; border-radius: var(--r-sm); border: 1px solid rgba(74,124,89,.2); background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; transition: background .15s; }
  .icon-btn:hover { background: var(--mist); }

  .admin-layout { display: grid; grid-template-columns: 220px 1fr; min-height: calc(100vh - 68px); }
  .admin-sidebar { background: var(--ink); padding: 32px 16px; display: flex; flex-direction: column; gap: 4px; }
  .admin-sidebar-title { font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.3); padding: 0 12px; margin-bottom: 8px; margin-top: 16px; }
  .admin-sidebar-title:first-child { margin-top: 0; }
  .admin-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: var(--r-sm); font-size: .875rem; color: rgba(255,255,255,.55); cursor: pointer; transition: background .15s, color .15s; border: none; background: transparent; text-align: left; width: 100%; }
  .admin-nav-item:hover, .admin-nav-item.active { background: rgba(255,255,255,.08); color: #fff; }
  .admin-main { padding: 40px; overflow-y: auto; }
  .admin-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px,1fr)); gap: 16px; margin-bottom: 36px; }
  .kpi { background: #fff; border-radius: var(--r-md); padding: 24px; border: 1px solid rgba(74,124,89,.1); }
  .kpi-n { font-family: var(--serif); font-size: 2rem; font-weight: 700; color: var(--moss); }
  .kpi-label { font-size: .8rem; opacity: .55; margin-top: 4px; text-transform: uppercase; letter-spacing: .05em; }
  .kpi-delta { font-size: .75rem; color: var(--sage); margin-top: 6px; font-weight: 600; }
  .table-wrap { background: #fff; border-radius: var(--r-md); border: 1px solid rgba(74,124,89,.1); overflow: hidden; }
  .table-head { display: grid; grid-template-columns: 1fr 1fr 1fr auto; padding: 14px 20px; background: var(--cream); border-bottom: 1px solid rgba(74,124,89,.1); }
  .table-head span { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; opacity: .5; }
  .table-row { display: grid; grid-template-columns: 1fr 1fr 1fr auto; padding: 14px 20px; border-bottom: 1px solid rgba(74,124,89,.07); align-items: center; }
  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: rgba(74,124,89,.03); }

  .empty { text-align: center; padding: 80px 32px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
  .empty-icon { font-size: 3rem; opacity: .25; }
  .empty h3 { font-family: var(--serif); font-size: 1.4rem; opacity: .5; }
  .empty p { font-size: .875rem; opacity: .4; max-width: 280px; }

  .toast-wrap { position: fixed; bottom: 32px; right: 32px; z-index: 999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
  .toast { background: var(--ink); color: #fff; padding: 14px 20px; border-radius: var(--r-md); font-size: .875rem; font-weight: 500; box-shadow: var(--shadow-lg); pointer-events: all; display: flex; align-items: center; gap: 10px; animation: slide-in .25s ease; border-left: 4px solid var(--gold); }
  @keyframes slide-in { from { transform: translateX(120%); opacity: 0; } }
  .spinner { width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid rgba(255,255,255,.3); border-top-color: #fff; animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media(max-width:640px) { .nav-links .nav-link:not(.active) { display: none; } .cert-row { grid-template-columns: 40px 1fr auto; } .admin-layout { grid-template-columns: 1fr; } .admin-sidebar { display: none; } }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LeafLogo = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 26C6 26 8 12 18 8C28 4 26 16 20 20C14 24 10 20 10 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M10 20C10 20 12 24 10 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => <div key={t.id} className="toast"><span>{t.icon}</span>{t.msg}</div>)}
    </div>
  );
}

function Navbar({ page, setPage, user, setUser }) {
  const navItems = [
    { id: "home", label: "Home" },
    { id: "generate", label: "Generate" },
    { id: "history", label: "My Certificates" },
    ...(user?.role === "Admin" ? [{ id: "admin", label: "Admin" }] : []),
  ];
  const logout = () => { localStorage.removeItem("gf_token"); setUser(null); setPage("home"); };
  return (
    <nav className="nav">
      <div className="nav-brand" onClick={() => setPage("home")}><LeafLogo /> GreenFlow</div>
      <div className="nav-links">
        {navItems.map(i => (
          <button key={i.id} className={`nav-link ${page === i.id ? "active" : ""}`} onClick={() => setPage(i.id)}>{i.label}</button>
        ))}
        {user
          ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.3 }}>
                  <span style={{ fontSize: '.875rem', fontWeight: 600 }}>{user.name}</span>
                  <span style={{ fontSize: '.75rem', opacity: 0.5 }}>{user.email}</span>
                </div>
                <button className="nav-cta" onClick={logout}>Sign Out</button>
              </div>
            )
          : <button className="nav-cta" onClick={() => setPage("auth")}>Sign In</button>}
      </div>
    </nav>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  return (
    <div className="page">
      <div className="hero">
        <div className="hero-noise" /><div className="hero-ring" /><div className="hero-ring" /><div className="hero-ring" />
        <div className="hero-content">
          <div className="hero-badge"><span>🌿</span> Verified Carbon Certificates</div>
          <h1>Issue <em>trusted</em> carbon offset certificates at scale</h1>
          <p>GreenFlow automates the creation, verification, and delivery of professional CO₂ offset certificates — powered by your ASP.NET Core backend.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setPage("generate")}>Generate Certificate →</button>
            <button className="btn-outline" onClick={() => setPage("auth")}>Create Free Account</button>
          </div>
        </div>
      </div>
      <div className="stats">
        {[{ n: "14,200+", l: "Certificates Issued" }, { n: "98,000t", l: "CO₂ Offset Tracked" }, { n: "340+", l: "Organisations" }, { n: "ISO 14064", l: "Compliance Standard" }].map(s => (
          <div className="stat" key={s.l}><div className="stat-n">{s.n}</div><div className="stat-l">{s.l}</div></div>
        ))}
      </div>
      <div className="section">
        <div className="section-label">Why GreenFlow</div>
        <div className="section-title">Everything you need to certify carbon action</div>
        <div className="cards">
          {[
            { icon: "📄", title: "PDF Generation", desc: "Beautiful certificates generated by your .NET backend with full QR verification." },
            { icon: "✅", title: "Instant Verification", desc: "Each certificate includes a unique ID linking to an immutable audit trail." },
            { icon: "🔒", title: "JWT Auth", desc: "Role-based access via ASP.NET Identity — User and Admin roles out of the box." },
            { icon: "📊", title: "Admin Dashboard", desc: "Track issuance volume, CO₂ trends, and user activity in one place." },
            { icon: "🔗", title: "REST API", desc: "Clean ASP.NET Core endpoints — all documented and ready to consume." },
            { icon: "⚡", title: "Bulk Operations", desc: "Generate and distribute hundreds of certificates in seconds." },
          ].map(c => (
            <div className="card" key={c.title}><div className="card-icon">{c.icon}</div><h3>{c.title}</h3><p>{c.desc}</p></div>
          ))}
        </div>
      </div>
      <div style={{ background: "var(--cream)", padding: "0 0 80px" }}>
        <div className="section">
          <div className="section-label">How it works</div>
          <div className="section-title">From data to certificate in three steps</div>
          <div className="steps">
            {[
              { n: "01", h: "Create Account", p: "Register and sign in. Your JWT token is stored and attached to every API request automatically." },
              { n: "02", h: "Fill in Details", p: "Enter the recipient, offset amount, project type, and validity. A live preview shows your certificate." },
              { n: "03", h: "Download PDF", p: "Your ASP.NET Core backend generates a signed PDF. It's saved to history and ready to download instantly." },
            ].map(s => <div className="step" key={s.n}><div className="step-num">{s.n}</div><h4>{s.h}</h4><p>{s.p}</p></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function AuthPage({ setUser, setPage, addToast }) {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setMsg(null);
    if (!form.email || !form.password) return setMsg({ type: "error", text: "Please fill all required fields." });
    if (tab === "register" && form.password !== form.confirm) return setMsg({ type: "error", text: "Passwords do not match." });
    setLoading(true);
    try {
      if (tab === "register") {
        // POST /api/auth/register
        await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({ fullName: form.fullName, email: form.email, password: form.password }),
        });
        addToast("✅", "Account created! Please sign in.");
        setTab("login");
      } else {
        // POST /api/auth/login  →  { token, fullName, email, role }
        const data = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        localStorage.setItem("gf_token", data.token);
        setUser({ name: data.fullName, email: data.email, role: data.role });
        addToast("🌿", `Welcome back, ${data.fullName}!`);
        setPage("home");
      }
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>{tab === "login" ? "Welcome back" : "Create account"}</h2>
        <p className="auth-sub">{tab === "login" ? "Sign in to manage your certificates" : "Join GreenFlow to start issuing certificates"}</p>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setMsg(null); }}>Sign In</button>
          <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setMsg(null); }}>Register</button>
        </div>
        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
        {tab === "register" && <div className="field"><label>Full Name</label><input placeholder="Ada Lovelace" value={form.fullName} onChange={upd("fullName")} /></div>}
        <div className="field"><label>Email address *</label><input type="email" placeholder="you@organisation.com" value={form.email} onChange={upd("email")} /></div>
        <div className={tab === "register" ? "field-row" : ""}>
          <div className="field"><label>Password *</label><input type="password" placeholder="••••••••" value={form.password} onChange={upd("password")} /></div>
          {tab === "register" && <div className="field"><label>Confirm *</label><input type="password" placeholder="••••••••" value={form.confirm} onChange={upd("confirm")} /></div>}
        </div>
        <button className="btn-full" onClick={submit} disabled={loading}>
          {loading ? <div className="spinner" /> : tab === "login" ? "Sign In" : "Create Account"}
        </button>
        <p className="form-footer">
          {tab === "login" ? <>{" "}No account? <span onClick={() => setTab("register")}>Register free</span></> : <>Already have one? <span onClick={() => setTab("login")}>Sign in</span></>}
        </p>
      </div>
    </div>
  );
}

// ─── Certificate preview ──────────────────────────────────────────────────────
function CertPreview({ data }) {
  return (
    <div className="cert-canvas">
      <div className="cert-ribbon" />
      <div className="cert-watermark">GreenFlow</div>
      <div className="cert-org">GreenFlow Carbon Registry</div>
      <div className="cert-title">Certificate of Carbon Offset</div>
      <div className="cert-presented">This certificate is presented to</div>
      <div className="cert-name">{data.recipientName || "Recipient Name"}</div>
      <div className="cert-desc">for successfully offsetting <strong>{data.co2Amount || "0.0"} tonnes</strong> of CO₂ through the <em>{data.projectName || "GreenFlow Project"}</em> — type: {data.certType || "Carbon Offset"}</div>
      <div className="cert-meta"><span>Date: {data.issueDate || "—"}</span><span>Valid until: {data.validUntil || "—"}</span></div>
      <div className="cert-seal">🌿</div>
    </div>
  );
}

// ─── Generate ─────────────────────────────────────────────────────────────────
function GeneratePage({ user, setPage, addToast, onGenerated }) {
  const [form, setForm] = useState({
    recipientName: "", recipientEmail: "", certType: "CarbonOffset",
    co2Amount: "", projectName: "", issueDate: new Date().toISOString().slice(0, 10),
    validUntil: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState(null);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  if (!user) return (
    <div className="empty" style={{ paddingTop: 100 }}>
      <div className="empty-icon">🔒</div>
      <h3>Sign in required</h3>
      <p>You need to be signed in to generate certificates.</p>
      <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setPage("auth")}>Sign In / Register</button>
    </div>
  );

  const submit = async () => {
    if (!form.recipientName || !form.co2Amount || !form.issueDate)
      return addToast("⚠️", "Please fill in all required fields.");
    setLoading(true);
    try {
      // POST /api/certificates  →  { id, certificateNumber, ... }
      const data = await apiFetch("/certificates", {
        method: "POST",
        body: JSON.stringify({
          recipientName: form.recipientName,
          recipientEmail: form.recipientEmail,
          certificateType: form.certType,
          co2OffsetTonnes: parseFloat(form.co2Amount),
          projectName: form.projectName,
          issueDate: form.issueDate,
          validUntil: form.validUntil || null,
          notes: form.notes,
        }),
      });
      setGeneratedId(data.id);
      onGenerated(data);
      addToast("✅", `Certificate ${data.certificateNumber} generated!`);
    } catch (e) {
      addToast("❌", e.message);
    }
    setLoading(false);
  };

  const downloadPdf = async () => {
    if (!generatedId) return;
    try {
      // GET /api/certificates/{id}/pdf  →  application/pdf blob
      const blob = await apiFetch(`/certificates/${generatedId}/pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `certificate-${generatedId}.pdf`; a.click();
      URL.revokeObjectURL(url);
      addToast("⬇️", "PDF downloaded!");
    } catch (e) { addToast("❌", e.message); }
  };

  if (generatedId) return (
    <div className="empty" style={{ paddingTop: 80 }}>
      <div style={{ fontSize: "3rem" }}>🎉</div>
      <h3 style={{ opacity: 1, fontFamily: "var(--serif)", fontSize: "1.8rem" }}>Certificate issued!</h3>
      <p style={{ opacity: .6 }}>Your certificate has been generated and saved to history.</p>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button className="btn-primary" onClick={downloadPdf}>⬇️ Download PDF</button>
        <button className="btn-outline" style={{ color: "var(--ink)", borderColor: "rgba(74,124,89,.3)" }} onClick={() => { setGeneratedId(null); setForm({ recipientName: "", recipientEmail: "", certType: "CarbonOffset", co2Amount: "", projectName: "", issueDate: new Date().toISOString().slice(0,10), validUntil: "", notes: "" }); }}>Generate Another</button>
        <button className="btn-outline" style={{ color: "var(--ink)", borderColor: "rgba(74,124,89,.3)" }} onClick={() => setPage("history")}>View History</button>
      </div>
    </div>
  );

  return (
    <div className="cert-layout">
      <div className="cert-form-panel">
        <h2>Generate Certificate</h2>
        <p className="sub">Fill in the details. A live preview updates on the right.</p>
        <div className="field-row">
          <div className="field"><label>Recipient Name *</label><input placeholder="Full name" value={form.recipientName} onChange={upd("recipientName")} /></div>
          <div className="field"><label>Recipient Email</label><input type="email" placeholder="email@example.com" value={form.recipientEmail} onChange={upd("recipientEmail")} /></div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Certificate Type</label>
            <select value={form.certType} onChange={upd("certType")}>
              <option value="CarbonOffset">Carbon Offset</option>
              <option value="RenewableEnergy">Renewable Energy</option>
              <option value="ForestConservation">Forest Conservation</option>
              <option value="MethaneReduction">Methane Reduction</option>
              <option value="OceanCarbon">Ocean Carbon</option>
              <option value="SoilCarbon">Soil Carbon</option>
              <option value="BiodiversityProtection">Biodiversity Protection</option>
              <option value="CleanCookstoves">Clean Cookstoves</option>
              <option value="DirectAirCapture">Direct Air Capture</option>
              <option value="WasteToEnergy">Waste to Energy</option>
              <option value="SustainableAgriculture">Sustainable Agriculture</option>
              <option value="WaterConservation">Water Conservation</option>
            </select>
          </div>
          <div className="field"><label>CO₂ Amount (tonnes) *</label><input type="number" placeholder="e.g. 12.4" value={form.co2Amount} onChange={upd("co2Amount")} /></div>
        </div>
        <div className="field"><label>Project Name</label><input placeholder="e.g. Nordic Forest Restoration" value={form.projectName} onChange={upd("projectName")} /></div>
        <div className="field-row">
          <div className="field"><label>Issue Date *</label><input type="date" value={form.issueDate} onChange={upd("issueDate")} /></div>
          <div className="field"><label>Valid Until</label><input type="date" value={form.validUntil} onChange={upd("validUntil")} /></div>
        </div>
        <div className="field"><label>Notes</label><textarea placeholder="Optional additional notes…" value={form.notes} onChange={upd("notes")} /></div>
        <button className="btn-full" onClick={submit} disabled={loading}>
          {loading ? <div className="spinner" /> : "Generate Certificate via API"}
        </button>
      </div>
      <div className="cert-preview-panel">
        <div className="cert-preview-label">Live Preview</div>
        <CertPreview data={form} />
        <p style={{ fontSize: ".78rem", opacity: .45, marginTop: 12, textAlign: "center" }}>
          Actual PDF rendered by your ASP.NET Core backend
        </p>
      </div>
    </div>
  );
}

// ─── History ──────────────────────────────────────────────────────────────────
function HistoryPage({ user, setPage, addToast }) {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // GET /api/certificates  →  array of certificate objects
    apiFetch("/certificates")
      .then(data => setCerts(data))
      .catch(e => addToast("❌", e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const downloadPdf = async (cert) => {
    try {
      const blob = await apiFetch(`/certificates/${cert.id}/pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${cert.certificateNumber}.pdf`; a.click();
      URL.revokeObjectURL(url);
      addToast("⬇️", `Downloading ${cert.certificateNumber}…`);
    } catch (e) { addToast("❌", e.message); }
  };

  if (!user) return (
    <div className="empty" style={{ paddingTop: 100 }}>
      <div className="empty-icon">🔒</div><h3>Sign in required</h3>
      <p>Please sign in to view your certificate history.</p>
      <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setPage("auth")}>Sign In</button>
    </div>
  );

  const filtered = certs.filter(c => {
    const matchFilter = filter === "all" || c.status?.toLowerCase() === filter;
    const matchSearch = !search || c.recipientName?.toLowerCase().includes(search.toLowerCase()) || c.certificateNumber?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="page">
      <div className="hist-header"><h2>Certificate History</h2><p>All certificates generated through your account.</p></div>
      <div className="hist-filters">
        {["all", "issued", "pending"].map(f => (
          <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <input className="search-input" placeholder="Search by name or ID…" value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn-primary" style={{ marginLeft: "auto", padding: "9px 20px", fontSize: ".85rem" }} onClick={() => setPage("generate")}>+ New Certificate</button>
      </div>
      <div className="cert-table">
        {loading ? <div className="empty"><div className="spinner" style={{ borderTopColor: "var(--sage)", borderColor: "rgba(74,124,89,.2)", width: 36, height: 36 }} /></div>
          : filtered.length === 0 ? (
            <div className="empty"><div className="empty-icon">📋</div><h3>No certificates found</h3><p>Generate your first certificate to see it here.</p></div>
          ) : filtered.map(c => (
            <div key={c.id} className="cert-row">
              <div className="cert-row-icon">📄</div>
              <div>
                <div className="cert-row-title">{c.recipientName}</div>
                <div className="cert-row-sub">{c.certificateNumber} · {c.certificateType} · {c.co2OffsetTonnes}t CO₂</div>
              </div>
              <span className={`badge badge-${c.status === "Issued" ? "green" : "amber"}`}>{c.status}</span>
              <div style={{ fontSize: ".82rem", opacity: .5, fontFamily: "var(--mono)" }}>{c.issueDate?.slice(0,10)}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="icon-btn" title="Download PDF" onClick={() => downloadPdf(c)}>⬇️</button>
                <button className="icon-btn" title="Copy link" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/verify/${c.certificateNumber}`); addToast("🔗", "Verify link copied!"); }}>🔗</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Admin ────────────────────────────────────────────────────────────────────
function AdminPage({ user, setPage, addToast }) {
  const [section, setSection] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "Admin") return;
    // GET /api/admin/stats  →  { totalCertificates, totalUsers, totalCo2, issuedCount }
    apiFetch("/admin/stats").then(setStats).catch(() => {});
    // GET /api/admin/users  →  array of users
    apiFetch("/admin/users").then(setUsers).catch(() => {});
    // GET /api/admin/certificates  →  all certificates
    apiFetch("/admin/certificates").then(setCerts).catch(() => {});
  }, [user]);

  if (!user || user.role !== "Admin") return (
    <div className="empty" style={{ paddingTop: 100 }}>
      <div className="empty-icon">🚫</div><h3>Admin access required</h3>
      <p>You must be signed in as an Admin to view this page.</p>
      <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setPage("auth")}>Sign In</button>
    </div>
  );

  const navItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "certificates", label: "Certificates", icon: "📄" },
    { id: "users", label: "Users", icon: "👥" },
  ];

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <p className="admin-sidebar-title">Management</p>
        {navItems.map(i => (
          <button key={i.id} className={`admin-nav-item ${section === i.id ? "active" : ""}`} onClick={() => setSection(i.id)}>
            <span>{i.icon}</span>{i.label}
          </button>
        ))}
      </div>
      <div className="admin-main">
        {section === "overview" && <>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", marginBottom: 28 }}>Admin Overview</h2>
          <div className="admin-kpis">
            {[
              { n: stats?.totalCertificates ?? "…", l: "Total Certificates", d: "All time" },
              { n: stats?.totalUsers ?? "…", l: "Registered Users", d: "Active accounts" },
              { n: stats ? stats.totalCo2 + "t" : "…", l: "CO₂ Tracked", d: "Total offset" },
              { n: stats?.issuedCount ?? "…", l: "Issued", d: "Status: Issued" },
            ].map(k => (
              <div className="kpi" key={k.l}><div className="kpi-n">{k.n}</div><div className="kpi-label">{k.l}</div><div className="kpi-delta">{k.d}</div></div>
            ))}
          </div>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", marginBottom: 16, opacity: .7 }}>Recent Certificates</h3>
          <div className="table-wrap">
            <div className="table-head"><span>Recipient</span><span>Type</span><span>Date</span><span>Status</span></div>
            {certs.slice(0, 6).map(c => (
              <div className="table-row" key={c.id}>
                <span style={{ fontWeight: 600, fontSize: ".875rem" }}>{c.recipientName}</span>
                <span style={{ fontSize: ".82rem", opacity: .6 }}>{c.certificateType}</span>
                <span style={{ fontSize: ".82rem", fontFamily: "var(--mono)", opacity: .5 }}>{c.issueDate?.slice(0,10)}</span>
                <span className={`badge badge-${c.status === "Issued" ? "green" : "amber"}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </>}

        {section === "users" && <>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", marginBottom: 28 }}>User Management</h2>
          <div className="table-wrap">
            <div className="table-head" style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}><span>Name</span><span>Email</span><span>Joined</span><span>Role</span></div>
            {users.map(u => (
              <div className="table-row" key={u.id} style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}>
                <span style={{ fontWeight: 600, fontSize: ".875rem" }}>{u.fullName}</span>
                <span style={{ fontSize: ".82rem", opacity: .6 }}>{u.email}</span>
                <span style={{ fontSize: ".82rem", fontFamily: "var(--mono)", opacity: .5 }}>{u.createdAt?.slice(0,10)}</span>
                <span className={`badge badge-${u.role === "Admin" ? "amber" : "green"}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </>}

        {section === "certificates" && <>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", marginBottom: 28 }}>All Certificates</h2>
          <div className="table-wrap">
            <div className="table-head" style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}><span>Number</span><span>Recipient</span><span>Date</span><span>Status</span></div>
            {certs.map(c => (
              <div className="table-row" key={c.id} style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: ".78rem", opacity: .6 }}>{c.certificateNumber}</span>
                <span style={{ fontWeight: 600, fontSize: ".875rem" }}>{c.recipientName}</span>
                <span style={{ fontSize: ".82rem", fontFamily: "var(--mono)", opacity: .5 }}>{c.issueDate?.slice(0,10)}</span>
                <span className={`badge badge-${c.status === "Issued" ? "green" : "amber"}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("gf_token");
    if (token) {
      // GET /api/auth/me  →  { fullName, email, role }
      apiFetch("/auth/me")
        .then(data => setUser({ name: data.fullName, email: data.email, role: data.role }))
        .catch(() => localStorage.removeItem("gf_token"));
    }
  }, []);

  const addToast = (icon, msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, icon, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };

  const handleGenerated = () => {}; // history page refetches from API on mount

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <Navbar page={page} setPage={setPage} user={user} setUser={setUser} />
        {page === "home"     && <HomePage setPage={setPage} />}
        {page === "auth"     && <AuthPage setUser={setUser} setPage={setPage} addToast={addToast} />}
        {page === "generate" && <GeneratePage user={user} setPage={setPage} addToast={addToast} onGenerated={handleGenerated} />}
        {page === "history"  && <HistoryPage user={user} setPage={setPage} addToast={addToast} />}
        {page === "admin"    && <AdminPage user={user} setPage={setPage} addToast={addToast} />}
      </div>
      <Toast toasts={toasts} />
    </>
  );
}