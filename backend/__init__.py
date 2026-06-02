"""Sudoku Difficulty Validator - Python Backend

Faithful migration from JavaScript solver.js and data.js with exact behavioral equivalence.
"""

from .solver import (
    analyze,
    parse,
    find_conflicts,
    count_solutions,
    solve_full,
    TECH,
    is_solved,
    difficulty_color,
)

from .analyzer import (
    PUBLISHERS,
    PUBLISHER_SHORT,
    DIFFS,
    SUBMIT_PUBLISHERS,
    SUBMIT_PUBLISHER_SHORT,
    DIFF_BY_PUBLISHER,
    CLAIMED_SCORE,
    TECHNIQUE_SCALE,
    GRID_POOL,
    diffs_for,
    claimed_score,
    verdict,
    tech_for_score,
    generate,
    analytics,
    pearson,
)

__all__ = [
    # solver.py exports
    'analyze',
    'parse',
    'find_conflicts',
    'count_solutions',
    'solve_full',
    'TECH',
    'is_solved',
    'difficulty_color',
    # analyzer.py exports
    'PUBLISHERS',
    'PUBLISHER_SHORT',
    'DIFFS',
    'SUBMIT_PUBLISHERS',
    'SUBMIT_PUBLISHER_SHORT',
    'DIFF_BY_PUBLISHER',
    'CLAIMED_SCORE',
    'TECHNIQUE_SCALE',
    'GRID_POOL',
    'diffs_for',
    'claimed_score',
    'verdict',
    'tech_for_score',
    'generate',
    'analytics',
    'pearson',
]
