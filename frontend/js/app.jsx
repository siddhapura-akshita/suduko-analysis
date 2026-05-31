/* App shell — top nav, tab routing, theme + shared repository state. */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("sdv-theme") === "dark" ? "dark" : "light"; } catch (e) { return "light"; }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark"); else root.classList.remove("dark");
    try { localStorage.setItem("sdv-theme", theme); } catch (e) {}
  }, [theme]);
  return [theme, setTheme];
}

function NavTab({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
        active
          ? "bg-white text-slate-900 shadow-card dark:bg-slate-800 dark:text-white"
          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      }`}
    >
      {icon}{children}
    </button>
  );
}

function App() {
  const [theme, setTheme] = useTheme();
  const [page, setPage] = useState("submit");
  const [repo, setRepo] = useState(() => window.SudokuData.REPO.slice());
  const counterRef = useRef(repo.length);

  const addRecord = (rec) => {
    counterRef.current += 1;
    const id = "SDK-" + String(1042 + counterRef.current).padStart(4, "0");
    setRepo((prev) => [{ id, ...rec }, ...prev]);
    setPage("repository");
  };

  return (
    <div className="min-h-screen">
      {/* top nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900 sm:flex">
            <NavTab active={page === "submit"} onClick={() => setPage("submit")} icon={<Icon.grid />}>Submit puzzle</NavTab>
            <NavTab active={page === "repository"} onClick={() => setPage("repository")} icon={<Icon.chart />}>Repository &amp; analytics</NavTab>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-md bg-accent-50 px-2.5 py-1 dark:bg-accent-500/10 md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500"></span>
              <span className="font-mono text-[11px] text-accent-700 dark:text-accent-300 tnum">{repo.length} puzzles</span>
            </div>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
        {/* mobile tabs */}
        <nav className="flex items-center gap-1 border-t border-slate-100 px-3 py-2 dark:border-slate-800 sm:hidden">
          <NavTab active={page === "submit"} onClick={() => setPage("submit")} icon={<Icon.grid />}>Submit</NavTab>
          <NavTab active={page === "repository"} onClick={() => setPage("repository")} icon={<Icon.chart />}>Repository</NavTab>
        </nav>
      </header>

      <main>
        {page === "submit" ? <SubmitPage addRecord={addRecord} /> : <RepositoryPage repo={repo} />}
      </main>

      <footer className="mx-auto max-w-[1180px] px-5 pb-10 pt-4 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 font-mono text-[11px] text-slate-400 dark:border-slate-800">
          <span>Sudoku Difficulty Validator — logical-technique grading engine</span>
          <span>Naked/Hidden Singles · Locked Candidates · Pairs/Triples · X-Wing · XY-Wing</span>
        </div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
