/* Email Prompt Component

   Displayed when no user is authenticated.
   Provides simple email-based identification (no password required).
*/

function EmailPrompt() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const { identify, loading } = useUser();

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await identify(email);
    } catch (err) {
      setError(err.message || "Failed to connect. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-light dark:bg-canvas-dark p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <Logo />
          <h1 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-100">
            Sudoku Research Platform
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Analyze and validate Sudoku puzzle difficulty ratings from major publishers.
          </p>
        </div>

        <div className="mb-6 p-4 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800">
          <h2 className="text-sm font-medium text-accent-800 dark:text-accent-200 mb-1">
            Research Question
          </h2>
          <p className="text-xs text-accent-700 dark:text-accent-300">
            How accurately do Sudoku publishers classify puzzle difficulty?
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="researcher@university.edu"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-shadow"
              disabled={loading}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </span>
            ) : (
              "Continue"
            )}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            No password required. Your email is used only to save your puzzle submissions.
          </p>
          <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Analytics unlock after saving <span className="font-medium text-accent-600 dark:text-accent-400">{MIN_FOR_ANALYTICS}</span> puzzles.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Expose to window
Object.assign(window, { EmailPrompt });
