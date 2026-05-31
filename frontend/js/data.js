/* Sample puzzles (real, engine-verified) + deterministic repository dataset.
   Attaches window.SudokuData. Plain JS. */
(function () {
  "use strict";

  // ---- Verified sample puzzles for Page 1 --------------------------------
  // grid string of 81 chars, 0 = empty. Verified via SudokuEngine tests.
  const SAMPLES = [
    { label: "Singles only", claimed: "Easy",
      grid: "530070000600195000098000060800060003400803001700020006060000280000419005000080079" },
    { label: "Pointing pairs", claimed: "Medium",
      grid: "300000000970010000600583000200000900500621003008000005000435002000090056000000001" },
    { label: "X-Wing required", claimed: "Hard",
      grid: "100000569492056108056109240009640801064010000218035604040500016905061402621000005" },
    { label: "Diabolical", claimed: "Medium",
      grid: "800000000003600000070090200050007000000045700000100030001000068008500010090000400" },
  ];

  const PUBLISHERS = ["The New York Times", "The Times", "The Guardian", "Sudoku.com"];
  const PUBLISHER_SHORT = {
    "The New York Times": "NYT",
    "The Times": "Times",
    "The Guardian": "Guardian",
    "Sudoku.com": "Sudoku.com",
  };

  const DIFFS = ["Easy", "Medium", "Hard"];
  const TECH_BY_TIER = {
    Easy: ["Naked Single", "Hidden Single"],
    Medium: ["Pointing Pair/Triple", "Claiming Pair/Triple", "Naked Pair", "Hidden Pair"],
    Hard: ["Naked Triple", "Hidden Triple", "X-Wing", "XY-Wing", "Trial & Error (backtracking)"],
  };
  const SCORE_RANGE = { Easy: [110, 255], Medium: [260, 515], Hard: [525, 955] };

  // Each publisher has a grading character: how its claims drift from measured truth.
  // bias > 0 => tends to OVER-state difficulty (claims harder than it is).
  const PROFILE = {
    "The New York Times": { bias: 0.05, noise: 0.22 }, // very accurate
    "The Times":          { bias: -0.34, noise: 0.46 }, // under-rates
    "The Guardian":       { bias: 0.42, noise: 0.55 },  // over-rates, inconsistent
    "Sudoku.com":         { bias: 0.62, noise: 0.52 },  // inflates difficulty most
  };

  // ---- Deterministic RNG --------------------------------------------------
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function generate(n, seed) {
    const rnd = mulberry32(seed || 20260531);
    const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
    const records = [];
    for (let k = 0; k < n; k++) {
      const publisher = pick(PUBLISHERS);
      const prof = PROFILE[publisher];
      // True (measured) difficulty as a latent 0..2 index.
      const trueIdx = Math.floor(rnd() * 3); // 0 Easy, 1 Med, 2 Hard
      const measured = DIFFS[trueIdx];
      // Claimed drifts from measured by bias + noise.
      const drift = prof.bias + (rnd() - 0.5) * 2 * prof.noise;
      let claimedIdx = trueIdx + Math.round(drift);
      claimedIdx = Math.max(0, Math.min(2, claimedIdx));
      const claimed = DIFFS[claimedIdx];

      const [lo, hi] = SCORE_RANGE[measured];
      const score = Math.round(lo + rnd() * (hi - lo));
      const tech = pick(TECH_BY_TIER[measured]);
      const clues = measured === "Easy" ? 30 + Math.floor(rnd() * 7)
                  : measured === "Medium" ? 26 + Math.floor(rnd() * 6)
                  : 22 + Math.floor(rnd() * 6);

      records.push({
        id: "SDK-" + String(1042 + k).padStart(4, "0"),
        publisher,
        publisherShort: PUBLISHER_SHORT[publisher],
        claimed,
        measured,
        score,
        tech,
        clues,
        date: new Date(2026, 0, 1 + Math.floor(rnd() * 150)).toISOString().slice(0, 10),
      });
    }
    return records;
  }

  const REPO = generate(40);

  // ---- Analytics helpers --------------------------------------------------
  const DIFF_IDX = { Easy: 0, Medium: 1, Hard: 2 };

  function pearson(xs, ys) {
    const n = xs.length;
    if (n < 2) return 0;
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0, dx = 0, dy = 0;
    for (let i = 0; i < n; i++) { const a = xs[i] - mx, b = ys[i] - my; num += a * b; dx += a * a; dy += b * b; }
    return dx && dy ? num / Math.sqrt(dx * dy) : 0;
  }

  function analytics(rows) {
    const claimedIdx = rows.map((r) => DIFF_IDX[r.claimed]);
    const measuredIdx = rows.map((r) => DIFF_IDX[r.measured]);
    const r = pearson(claimedIdx, measuredIdx);
    const matches = rows.filter((x) => x.claimed === x.measured).length;
    const agreement = rows.length ? matches / rows.length : 0;
    const over = rows.filter((x) => DIFF_IDX[x.claimed] > DIFF_IDX[x.measured]).length;
    const under = rows.filter((x) => DIFF_IDX[x.claimed] < DIFF_IDX[x.measured]).length;
    const meanScore = rows.length ? Math.round(rows.reduce((a, b) => a + b.score, 0) / rows.length) : 0;

    // Per-publisher accuracy leaderboard.
    const byPub = {};
    rows.forEach((x) => {
      (byPub[x.publisher] = byPub[x.publisher] || []).push(x);
    });
    const leaderboard = Object.entries(byPub).map(([pub, list]) => {
      const m = list.filter((x) => x.claimed === x.measured).length;
      const o = list.filter((x) => DIFF_IDX[x.claimed] > DIFF_IDX[x.measured]).length;
      const u = list.filter((x) => DIFF_IDX[x.claimed] < DIFF_IDX[x.measured]).length;
      return {
        publisher: pub,
        short: PUBLISHER_SHORT[pub],
        n: list.length,
        accuracy: list.length ? m / list.length : 0,
        over: o, under: u,
        tendency: o > u ? "over-rates" : u > o ? "under-rates" : "balanced",
      };
    }).sort((a, b) => b.accuracy - a.accuracy);

    return { pearson: r, agreement, over, under, meanScore, leaderboard, n: rows.length };
  }

  window.SudokuData = {
    SAMPLES, PUBLISHERS, PUBLISHER_SHORT, DIFFS, REPO, generate, analytics, pearson, DIFF_IDX,
  };
})();
