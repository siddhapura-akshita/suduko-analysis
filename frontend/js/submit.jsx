/* Page 1 — Puzzle submission + live analysis results. Exports SubmitPage. */
function emptyBoard() { return new Array(81).fill(0); }

function TierTag({ tier }) {
  const map = { 1: ["Easy", "text-emerald-600 dark:text-emerald-400"], 2: ["Medium", "text-amber-600 dark:text-amber-400"], 3: ["Hard", "text-rose-600 dark:text-rose-400"] };
  const [t, c] = map[tier] || map[2];
  return <span className={`font-mono text-[10px] uppercase tracking-wide ${c}`}>T{tier}·{t}</span>;
}

function ClaimVerdict({ claimed, measured }) {
  if (!claimed) return null;
  const idx = window.SudokuData.DIFF_IDX;
  const diff = idx[claimed] - idx[measured];
  let label, cls, glyph;
  if (diff === 0) { label = "Claim matches measurement"; cls = "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 ring-emerald-600/20"; glyph = <Icon.check />; }
  else if (diff > 0) { label = `Over-rated by ${diff} band${diff > 1 ? "s" : ""}`; cls = "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 ring-rose-600/20"; glyph = <Icon.warn width="13" height="13" />; }
  else { label = `Under-rated by ${-diff} band${-diff > 1 ? "s" : ""}`; cls = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 ring-amber-600/20"; glyph = <Icon.warn width="13" height="13" />; }
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {glyph}{label}
    </div>
  );
}

function ResultsCard({ result, claimed, name }) {
  if (!result) {
    return (
      <Card className="flex h-full min-h-[440px] flex-col items-center justify-center p-10 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <Icon.flask width="24" height="24" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">No analysis yet</h3>
        <p className="mt-1.5 max-w-xs text-sm text-slate-500 dark:text-slate-400">
          Fill the grid or load a sample, then run the solver. The engine applies human techniques in order and grades by the hardest one required.
        </p>
      </Card>
    );
  }

  if (!result.ok) {
    return (
      <Card className="flex h-full min-h-[440px] flex-col items-center justify-center p-10 text-center animate-fade">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
          <Icon.warn width="26" height="26" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">Cannot analyze this grid</h3>
        <p className="mt-1.5 max-w-xs text-sm text-slate-500 dark:text-slate-400">{result.message}</p>
      </Card>
    );
  }

  const m = DIFF_META[result.difficulty];
  return (
    <Card className="h-full animate-fade">
      <CardHead
        title="Analysis results"
        sub={name ? `Submitted by ${name}` : "Engine-measured difficulty"}
        right={<ClaimVerdict claimed={claimed} measured={result.difficulty} />}
      />
      <div className="grid gap-5 p-5 sm:grid-cols-2">
        {/* left: gauge + verdict */}
        <div className="flex flex-col">
          <DifficultyGauge value={result.composite} max={result.maxScore} difficulty={result.difficulty} />
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Measured</span>
            <DiffBadge value={result.difficulty} size="md" />
          </div>
        </div>
        {/* right: key stats */}
        <div className="grid grid-cols-2 gap-3 self-start">
          <Stat label="Composite score" value={result.composite} mono />
          <Stat label="Clues given" value={result.clues} mono />
          <Stat label="Solve steps" value={result.totalSteps} mono />
          <Stat label="Logical solve" value={result.solvedByLogic ? "Yes" : "No"} accent={result.solvedByLogic ? "emerald" : "rose"} />
          <div className="col-span-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/30">
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Hardest technique required</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{result.hardest.name}</span>
              <TierTag tier={result.hardest.tier} />
            </div>
          </div>
        </div>
      </div>

      {/* technique breakdown */}
      <div className="border-t border-slate-100 px-5 pb-5 pt-4 dark:border-slate-800">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-mono text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Technique breakdown</h4>
          <span className="font-mono text-[11px] text-slate-400">{result.breakdown.length} techniques</span>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:bg-slate-950/40">
                <th className="px-3 py-2 font-medium">Technique</th>
                <th className="px-3 py-2 font-medium">Tier</th>
                <th className="px-3 py-2 text-right font-medium">Uses</th>
                <th className="px-3 py-2 text-right font-medium">Unit cost</th>
                <th className="px-3 py-2 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {result.breakdown.map((b) => (
                <tr key={b.key} className="text-slate-700 dark:text-slate-200">
                  <td className="px-3 py-2 font-medium">{b.name}</td>
                  <td className="px-3 py-2"><TierTag tier={b.tier} /></td>
                  <td className="px-3 py-2 text-right font-mono tnum">{b.count}</td>
                  <td className="px-3 py-2 text-right font-mono tnum text-slate-400">{b.cost}</td>
                  <td className="px-3 py-2 text-right font-mono tnum font-medium">{b.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2.5 font-mono text-[10px] leading-relaxed text-slate-400">
          Composite = hardest&nbsp;cost&nbsp;×&nbsp;2.4 + Σ(step&nbsp;costs)&nbsp;×&nbsp;0.32. Difficulty band derives from the hardest technique tier.
        </p>
      </div>
    </Card>
  );
}

function Stat({ label, value, mono, accent }) {
  const ac = accent === "emerald" ? "text-emerald-600 dark:text-emerald-400" : accent === "rose" ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-100";
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/20">
      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${mono ? "font-mono tnum" : ""} ${ac}`}>{value}</div>
    </div>
  );
}

function SubmitPage({ addRecord }) {
  const D = window.SudokuData, E = window.SudokuEngine;
  const [board, setBoard] = useState(emptyBoard);
  const [givens, setGivens] = useState(() => new Array(81).fill(false));
  const [name, setName] = useState("");
  const [publisher, setPublisher] = useState("");
  const [claimed, setClaimed] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sampleIdx, setSampleIdx] = useState(0);
  const [saved, setSaved] = useState(false);

  const conflicts = useMemo(() => [...E.findConflicts(board)], [board]);
  const filled = board.filter((v) => v).length;

  const loadSample = () => {
    const s = D.SAMPLES[sampleIdx % D.SAMPLES.length];
    const b = E.parse(s.grid);
    setBoard(b);
    setGivens(b.map((v) => v !== 0));
    setClaimed(s.claimed);
    setPublisher(publisher || D.PUBLISHERS[0]);
    setResult(null); setSaved(false);
    setSampleIdx((i) => i + 1);
  };

  const clearAll = () => {
    setBoard(emptyBoard()); setGivens(new Array(81).fill(false));
    setResult(null); setSaved(false);
  };

  const onGridChange = (next) => { setBoard(next); setResult(null); setSaved(false); };

  const analyze = () => {
    setBusy(true); setResult(null); setSaved(false);
    setTimeout(() => {
      const r = E.analyze(board);
      setResult(r);
      setBusy(false);
    }, 560);
  };

  const submitToRepo = () => {
    if (!result || !result.ok) return;
    addRecord({
      publisher: publisher || "Unverified",
      publisherShort: D.PUBLISHER_SHORT[publisher] || "User",
      claimed: claimed || result.difficulty,
      measured: result.difficulty,
      score: result.composite,
      tech: result.hardest.name,
      clues: result.clues,
      date: new Date().toISOString().slice(0, 10),
      submittedBy: name || "Anonymous",
    });
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-accent-600 dark:text-accent-400">Submission · Page 1</div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Analyze a puzzle</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Enter a 9×9 puzzle and a claimed difficulty. The engine solves it with human techniques, measures the true difficulty, and flags any mismatch with the publisher's claim.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        {/* LEFT — grid + form */}
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Icon.grid /><span className="text-xs font-medium">Puzzle grid</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400 tnum">{filled}/81 filled</span>
            </div>
            <div className="flex justify-center">
              <SudokuGrid board={board} givens={givens} conflicts={conflicts} onChange={onGridChange} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" className="flex-1" onClick={loadSample}>
                <Icon.reset />Load sample
              </Button>
              <Button variant="ghost" onClick={clearAll}>Clear</Button>
            </div>
            {conflicts.length ? (
              <div className="mt-3 flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                <Icon.warn width="13" height="13" />{conflicts.length} cells conflict — duplicate in a row, column, or box.
              </div>
            ) : (
              <p className="mt-3 font-mono text-[10px] text-slate-400">Click a cell, type 1–9, arrows to move, 0/⌫ to clear.</p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Metadata</h3>
            <div className="grid gap-3.5">
              <Field label="Your name">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. A. Researcher" />
              </Field>
              <div className="grid grid-cols-2 gap-3.5">
                <Field label="Publisher">
                  <Select value={publisher} onChange={setPublisher} options={D.PUBLISHERS} placeholder="Select…" />
                </Field>
                <Field label="Claimed difficulty">
                  <Select value={claimed} onChange={setClaimed} options={D.DIFFS} placeholder="Select…" />
                </Field>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={analyze} disabled={busy || filled < 17}>
              {busy ? <><Icon.spin className="animate-spin" />Analyzing…</> : <><Icon.play />Analyze puzzle</>}
            </Button>
            {result && result.ok ? (
              <button
                onClick={submitToRepo}
                disabled={saved}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-accent-700 transition hover:bg-accent-50 disabled:opacity-60 dark:text-accent-300 dark:hover:bg-accent-500/10"
              >
                {saved ? <><Icon.check />Saved to repository</> : <>Save result to repository<Icon.arrow /></>}
              </button>
            ) : null}
          </Card>
        </div>

        {/* RIGHT — results */}
        <ResultsCard result={busy ? null : result} claimed={claimed} name={name} />
      </div>
    </div>
  );
}

Object.assign(window, { SubmitPage });
