/* Page 2 — Repository table + analytics. Exports RepositoryPage. */

function MetricCard({ label, value, sub, tone }) {
  const toneCls = {
    accent: "text-accent-600 dark:text-accent-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    slate: "text-slate-900 dark:text-white",
  }[tone || "slate"];
  return (
    <Card className="p-4">
      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-1.5 font-mono text-2xl font-semibold tnum ${toneCls}`}>{value}</div>
      {sub ? <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{sub}</div> : null}
    </Card>
  );
}

function SortHead({ children, col, sort, setSort, align = "left" }) {
  const active = sort.col === col;
  return (
    <th
      className={`cursor-pointer select-none px-3.5 py-2.5 font-medium transition hover:text-slate-700 dark:hover:text-slate-200 ${align === "right" ? "text-right" : "text-left"}`}
      onClick={() => setSort({ col, dir: active && sort.dir === "asc" ? "desc" : "asc" })}
    >
      <span className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""}`}>
        {children}
        <span className={`text-[9px] transition ${active ? "text-accent-500 opacity-100" : "opacity-30"}`}>
          {active && sort.dir === "asc" ? "▲" : "▼"}
        </span>
      </span>
    </th>
  );
}

function RepositoryPage({ repo }) {
  const D = window.SudokuData;
  const [query, setQuery] = useState("");
  const [pubFilter, setPubFilter] = useState("");
  const [diffFilter, setDiffFilter] = useState("");
  const [sort, setSort] = useState({ col: "id", dir: "asc" });

  const filtered = useMemo(() => {
    let rows = repo.filter((r) => {
      if (pubFilter && r.publisher !== pubFilter) return false;
      if (diffFilter && r.measured !== diffFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!(r.id.toLowerCase().includes(q) || r.publisher.toLowerCase().includes(q) || r.tech.toLowerCase().includes(q))) return false;
      }
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    const idx = D.DIFF_IDX;
    rows = rows.slice().sort((a, b) => {
      let av, bv;
      switch (sort.col) {
        case "publisher": av = a.publisher; bv = b.publisher; break;
        case "claimed": av = idx[a.claimed]; bv = idx[b.claimed]; break;
        case "measured": av = idx[a.measured]; bv = idx[b.measured]; break;
        case "score": av = a.score; bv = b.score; break;
        case "tech": av = a.tech; bv = b.tech; break;
        default: av = a.id; bv = b.id;
      }
      return av < bv ? -dir : av > bv ? dir : 0;
    });
    return rows;
  }, [repo, query, pubFilter, diffFilter, sort]);

  const stats = useMemo(() => D.analytics(filtered), [filtered]);

  const exportCSV = () => {
    const head = ["Puzzle ID", "Publisher", "Claimed", "Measured", "Score", "Hardest Technique", "Clues", "Date"];
    const lines = [head.join(",")].concat(filtered.map((r) =>
      [r.id, `"${r.publisher}"`, r.claimed, r.measured, r.score, `"${r.tech}"`, r.clues, r.date].join(",")
    ));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sudoku-repository.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8">
      <div className="mb-6">
        <div className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-accent-600 dark:text-accent-400">Repository · Page 2</div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Puzzle repository &amp; analytics</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          {repo.length} analyzed puzzles across {D.PUBLISHERS.length} publishers. Filter the corpus and explore how claimed difficulty compares to engine-measured difficulty.
        </p>
      </div>

      {/* toolbar */}
      <Card className="mb-5 p-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon.search /></span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ID, publisher, or technique…"
              className={`${inputCls} pl-9`}
            />
          </div>
          <div className="w-44"><Select value={pubFilter} onChange={setPubFilter} options={D.PUBLISHERS} placeholder="All publishers" /></div>
          <div className="w-36"><Select value={diffFilter} onChange={setDiffFilter} options={D.DIFFS} placeholder="All difficulties" /></div>
          <Button variant="outline" onClick={exportCSV}><Icon.download />Export CSV</Button>
        </div>
      </Card>

      {/* data table */}
      <Card className="mb-9 overflow-hidden">
        <CardHead title="Analyzed puzzles" sub={`${filtered.length} of ${repo.length} records`} icon={<Icon.grid />} />
        <div className="thin-scroll max-h-[420px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 font-mono text-[10px] uppercase tracking-wider text-slate-400 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:bg-slate-950/60">
              <tr>
                <SortHead col="id" sort={sort} setSort={setSort}>Puzzle ID</SortHead>
                <SortHead col="publisher" sort={sort} setSort={setSort}>Publisher</SortHead>
                <SortHead col="claimed" sort={sort} setSort={setSort}>Claimed</SortHead>
                <SortHead col="measured" sort={sort} setSort={setSort}>Measured</SortHead>
                <SortHead col="score" sort={sort} setSort={setSort} align="right">Score</SortHead>
                <SortHead col="tech" sort={sort} setSort={setSort}>Hardest technique</SortHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((r) => {
                const idx = D.DIFF_IDX;
                const mismatch = idx[r.claimed] !== idx[r.measured];
                return (
                  <tr key={r.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-3.5 py-2.5 font-mono text-[13px] text-slate-500 dark:text-slate-400">{r.id}</td>
                    <td className="px-3.5 py-2.5">
                      <span className="font-medium text-slate-800 dark:text-slate-100">{r.publisherShort}</span>
                      {r.submittedBy ? <span className="ml-1.5 font-mono text-[10px] text-accent-500">·new</span> : null}
                    </td>
                    <td className="px-3.5 py-2.5"><DiffBadge value={r.claimed} /></td>
                    <td className="px-3.5 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <DiffBadge value={r.measured} />
                        {mismatch ? <span className="text-rose-400" title="Claim ≠ measurement"><Icon.warn width="12" height="12" /></span> : null}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono tnum font-medium text-slate-700 dark:text-slate-200">{r.score}</td>
                    <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300">{r.tech}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-3.5 py-12 text-center text-sm text-slate-400">No puzzles match these filters.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {/* analytics */}
      <SectionTitle kicker="Analytics" title="Difficulty calibration" sub="How accurately publishers label their puzzles, measured against the engine's verdict on the current selection." />

      {/* correlation cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Claim accuracy" value={`${Math.round(stats.agreement * 100)}%`} sub={`${stats.over} over · ${stats.under} under`} tone="accent" />
        <MetricCard label="Pearson r" value={stats.pearson.toFixed(2)} sub="claimed vs measured" tone={stats.pearson > 0.6 ? "emerald" : "amber"} />
        <MetricCard label="Mean score" value={stats.meanScore} sub={`across ${stats.n} puzzles`} />
        <MetricCard label="Sample size" value={stats.n} sub="puzzles in selection" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHead title="Difficulty distribution" sub="Count of puzzles by composite score" icon={<Icon.chart />} />
          <div className="p-4"><Histogram rows={filtered} /></div>
        </Card>
        <Card>
          <CardHead title="Publisher comparison" sub="Score distribution per publisher" icon={<Icon.chart />} />
          <div className="p-4"><BoxPlot rows={filtered} publishers={D.PUBLISHERS} /></div>
        </Card>
        <Card>
          <CardHead title="Claimed vs measured" sub="Bubble size = number of puzzles; off-diagonal = mismatch" icon={<Icon.chart />} />
          <div className="p-4"><Scatter rows={filtered} /></div>
        </Card>
        <Card>
          <CardHead title="Publisher accuracy leaderboard" sub="Ranked by share of correctly-labeled puzzles" />
          <div className="p-4">
            <div className="flex flex-col gap-2.5">
              {stats.leaderboard.map((p, i) => (
                <div key={p.publisher} className="flex items-center gap-3">
                  <span className="w-5 text-center font-mono text-xs text-slate-400">{i + 1}</span>
                  <div className="w-24 shrink-0">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{p.short}</div>
                    <div className="font-mono text-[10px] text-slate-400">{p.tendency}</div>
                  </div>
                  <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-md bg-accent-500/80 transition-all" style={{ width: `${Math.max(4, p.accuracy * 100)}%` }}></div>
                    <span className="absolute inset-y-0 left-2.5 flex items-center font-mono text-[11px] font-medium text-slate-700 dark:text-slate-100">
                      {Math.round(p.accuracy * 100)}%
                    </span>
                  </div>
                  <span className="w-12 text-right font-mono text-[11px] text-slate-400">n={p.n}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { RepositoryPage });
