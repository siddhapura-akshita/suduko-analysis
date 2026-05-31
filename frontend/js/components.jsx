/* Shared UI primitives + interactive Sudoku grid. Exports to window. */
const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ---- Difficulty meta -------------------------------------------------------
const DIFF_META = {
  Easy:   { text: "text-emerald-600 dark:text-emerald-400", dot: "#059669", bg: "bg-emerald-50 dark:bg-emerald-500/10", ring: "ring-emerald-600/20 dark:ring-emerald-400/20" },
  Medium: { text: "text-amber-600 dark:text-amber-400",     dot: "#d97706", bg: "bg-amber-50 dark:bg-amber-500/10",     ring: "ring-amber-600/20 dark:ring-amber-400/20" },
  Hard:   { text: "text-rose-600 dark:text-rose-400",       dot: "#e11d48", bg: "bg-rose-50 dark:bg-rose-500/10",       ring: "ring-rose-600/20 dark:ring-rose-400/20" },
};

function DiffBadge({ value, size = "sm" }) {
  const m = DIFF_META[value] || DIFF_META.Medium;
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium ring-1 ring-inset ${pad} ${m.bg} ${m.text} ${m.ring}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.dot }}></span>
      {value}
    </span>
  );
}

// ---- Card ------------------------------------------------------------------
function Card({ className = "", children, ...rest }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900 ${className}`} {...rest}>
      {children}
    </div>
  );
}

function CardHead({ title, sub, right, icon }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
      <div className="flex items-start gap-2.5">
        {icon ? <span className="mt-0.5 text-slate-400 dark:text-slate-500">{icon}</span> : null}
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
          {sub ? <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</p> : null}
        </div>
      </div>
      {right}
    </div>
  );
}

// ---- Buttons ---------------------------------------------------------------
function Button({ variant = "primary", className = "", children, ...rest }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 shadow-sm",
    soft: "bg-accent-50 text-accent-700 hover:bg-accent-100 dark:bg-accent-500/10 dark:text-accent-300 dark:hover:bg-accent-500/20",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  };
  return <button className={`${base} ${variants[variant]} px-4 py-2 ${className}`} {...rest}>{children}</button>;
}

// ---- Field wrapper ---------------------------------------------------------
function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
        {hint ? <span className="font-mono text-[10px] text-slate-400">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder-slate-500";

function TextInput(props) {
  return <input {...props} className={`${inputCls} ${props.className || ""}`} />;
}

function Select({ value, onChange, options, placeholder, className = "" }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} appearance-none pr-9 ${className}`}
      >
        {placeholder != null ? <option value="">{placeholder}</option> : null}
        {options.map((o) => {
          const val = typeof o === "string" ? o : o.value;
          const lab = typeof o === "string" ? o : o.label;
          return <option key={val} value={val}>{lab}</option>;
        })}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ---- Icons (minimal stroke) ------------------------------------------------
const Icon = {
  grid: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>,
  chart: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M4 4v16h16"/><rect x="7" y="12" width="3" height="5"/><rect x="12" y="8" width="3" height="9"/><rect x="17" y="5" width="3" height="12"/></svg>,
  sun: (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round"/></svg>,
  moon: (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>,
  search: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4" strokeLinecap="round"/></svg>,
  download: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  play: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M6 4l14 8-14 8V4z" strokeLinejoin="round"/></svg>,
  spin: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M12 3a9 9 0 109 9" strokeLinecap="round"/></svg>,
  flask: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M9 3h6M10 3v6L5 19a1.5 1.5 0 001.4 2h11.2A1.5 1.5 0 0019 19l-5-10V3" strokeLinejoin="round"/><path d="M7.5 14h9"/></svg>,
  reset: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M4 4v5h5M4.6 13a8 8 0 102-7.7L4 9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  warn: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M12 3l9 16H3l9-16z" strokeLinejoin="round"/><path d="M12 10v4M12 17h.01" strokeLinecap="round"/></svg>,
  arrow: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M8 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ---- Logo ------------------------------------------------------------------
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent-600 shadow-sm">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="1.6">
          <rect x="4" y="4" width="16" height="16" rx="1.5"/>
          <path d="M9.3 4v16M14.6 4v16M4 9.3h16M4 14.6h16"/>
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-white">Sudoku Difficulty Validator</div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Analytical engine · v1.0</div>
      </div>
    </div>
  );
}

// ---- Theme toggle ----------------------------------------------------------
function ThemeToggle({ theme, setTheme }) {
  const dark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      {dark ? <Icon.sun /> : <Icon.moon />}
    </button>
  );
}

// ====== Interactive Sudoku grid ============================================
function SudokuGrid({ board, givens, conflicts, solution, onChange, readOnly }) {
  const [active, setActive] = useState(null);
  const refs = useRef([]);

  const setCell = (i, v) => {
    if (readOnly || givens[i]) return;
    const next = board.slice();
    next[i] = v;
    onChange(next);
  };

  const handleKey = (i, e) => {
    const k = e.key;
    if (/^[1-9]$/.test(k)) { setCell(i, +k); e.preventDefault(); return; }
    if (k === "0" || k === "Backspace" || k === "Delete" || k === " ") { setCell(i, 0); e.preventDefault(); return; }
    const move = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 };
    if (move[k] != null) {
      const ni = i + move[k];
      if (ni >= 0 && ni < 81) { refs.current[ni] && refs.current[ni].focus(); setActive(ni); }
      e.preventDefault();
    }
  };

  const conflictSet = useMemo(() => new Set(conflicts || []), [conflicts]);
  const activeVal = active != null ? board[active] : 0;

  return (
    <div className="inline-block select-none rounded-lg bg-slate-300 p-[3px] dark:bg-slate-700">
      <div className="grid grid-cols-9 gap-0 overflow-hidden rounded-md">
        {board.map((v, i) => {
          const r = Math.floor(i / 9), c = i % 9;
          const given = !!givens[i];
          const conflict = conflictSet.has(i);
          const isActive = active === i;
          const sameVal = v && activeVal && v === activeVal && !isActive;
          const peerHi = active != null && !isActive &&
            (Math.floor(active / 9) === r || active % 9 === c ||
             (Math.floor(Math.floor(active / 9) / 3) === Math.floor(r / 3) && Math.floor((active % 9) / 3) === Math.floor(c / 3)));

          const borders = [
            "border-slate-200 dark:border-slate-800",
            c % 3 === 2 && c !== 8 ? "border-r-[2.5px] border-r-slate-300 dark:border-r-slate-600" : "border-r",
            r % 3 === 2 && r !== 8 ? "border-b-[2.5px] border-b-slate-300 dark:border-b-slate-600" : "border-b",
            c === 0 ? "border-l" : "", r === 0 ? "border-t" : "",
          ].join(" ");

          let bg = "bg-white dark:bg-slate-900";
          if (peerHi) bg = "bg-slate-50 dark:bg-slate-800/60";
          if (sameVal) bg = "bg-accent-50 dark:bg-accent-500/10";
          if (isActive) bg = "bg-accent-100 dark:bg-accent-500/20";
          if (conflict) bg = "bg-rose-100 dark:bg-rose-500/20";

          const color = conflict
            ? "text-rose-600 dark:text-rose-300"
            : given
              ? "text-slate-900 dark:text-slate-100"
              : "text-accent-700 dark:text-accent-300";

          return (
            <div
              key={i}
              ref={(el) => (refs.current[i] = el)}
              tabIndex={readOnly ? -1 : 0}
              onFocus={() => setActive(i)}
              onClick={() => { setActive(i); refs.current[i] && refs.current[i].focus(); }}
              onKeyDown={(e) => handleKey(i, e)}
              className={`relative grid h-11 w-11 place-items-center font-mono text-xl outline-none transition-colors duration-100 sm:h-[46px] sm:w-[46px] ${borders} ${bg} ${color} ${given ? "font-semibold" : "font-normal"} ${readOnly ? "cursor-default" : "cursor-pointer"} focus:z-10 focus:ring-2 focus:ring-inset focus:ring-accent-500`}
            >
              {v ? v : ""}
              {given && !v ? null : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Section heading -------------------------------------------------------
function SectionTitle({ kicker, title, sub }) {
  return (
    <div className="mb-4">
      {kicker ? <div className="mb-1 font-mono text-[11px] uppercase tracking-widest text-accent-600 dark:text-accent-400">{kicker}</div> : null}
      <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      {sub ? <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{sub}</p> : null}
    </div>
  );
}

Object.assign(window, {
  DIFF_META, DiffBadge, Card, CardHead, Button, Field, TextInput, Select,
  Icon, Logo, ThemeToggle, SudokuGrid, SectionTitle, inputCls,
});
