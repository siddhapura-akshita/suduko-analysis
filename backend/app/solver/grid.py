"""
Sudoku Grid Operations - Parsing, validation, and candidate computation.

This module provides:
- Grid parsing from string or array input
- Conflict detection (duplicate values)
- Candidate computation (possible values per cell)
- Solution counting (uniqueness check)

Ported from solver.js lines 50-130
"""

from typing import List, Set, Optional, Union, Tuple
from .geometry import Geometry, get_geometry


def parse_grid(grid_input: Union[str, List[int]]) -> List[int]:
    """
    Parse a grid from string or array to a standardized 81-element list.

    Args:
        grid_input: Either a string of 81 characters (0 or . for empty)
                   or a list of integers

    Returns:
        List of 81 integers (0 for empty, 1-9 for values)

    Examples:
        >>> parse_grid("530070000600195000...")
        [5, 3, 0, 0, 7, 0, ...]
        >>> parse_grid([5, 3, 0, 0, 7, 0, ...])
        [5, 3, 0, 0, 7, 0, ...]
    """
    board = [0] * 81

    if isinstance(grid_input, list):
        for i in range(min(81, len(grid_input))):
            val = grid_input[i]
            if isinstance(val, int) and 0 <= val <= 9:
                board[i] = val
            elif isinstance(val, str) and val.isdigit():
                board[i] = int(val) if val != '0' else 0
        return board

    # String input - clean and parse
    clean = ''.join(c if c.isdigit() or c == '.' else '' for c in str(grid_input))
    clean = clean.replace('.', '0')

    for i in range(min(81, len(clean))):
        board[i] = int(clean[i]) if clean[i] != '0' else 0

    return board


def find_conflicts(board: List[int], geometry: Optional[Geometry] = None) -> Set[int]:
    """
    Find cells with duplicate values in their units.

    A conflict occurs when two cells in the same row, column, or box
    have the same non-zero value.

    Args:
        board: 81-element list of cell values
        geometry: Optional Geometry instance (uses singleton if not provided)

    Returns:
        Set of cell indices that are involved in conflicts

    Examples:
        >>> find_conflicts([5, 5, 0, ...])  # Two 5s in row 0
        {0, 1}
    """
    if geometry is None:
        geometry = get_geometry()

    conflicts = set()

    for unit in geometry.all_units:
        seen = {}  # value -> first cell index
        for cell in unit:
            value = board[cell]
            if value == 0:
                continue
            if value in seen:
                # Conflict! Both cells have the same value
                conflicts.add(cell)
                conflicts.add(seen[value])
            else:
                seen[value] = cell

    return conflicts


def compute_candidates(board: List[int], geometry: Optional[Geometry] = None) -> List[Set[int]]:
    """
    Compute possible candidate values for each empty cell.

    For filled cells, returns an empty set.
    For empty cells, returns values 1-9 minus values in peer cells.

    Args:
        board: 81-element list of cell values
        geometry: Optional Geometry instance (uses singleton if not provided)

    Returns:
        List of 81 sets, each containing candidate values for that cell

    Examples:
        >>> candidates = compute_candidates([5, 3, 0, ...])
        >>> candidates[2]  # Possible values for cell 2
        {1, 2, 4, 6, 7, 8, 9}  # 5 and 3 eliminated by peers
    """
    if geometry is None:
        geometry = get_geometry()

    candidates = []

    for i in range(81):
        if board[i] != 0:
            # Filled cell - no candidates
            candidates.append(set())
        else:
            # Start with all values 1-9
            possible = set(range(1, 10))

            # Eliminate values in peer cells
            for peer in geometry.peers[i]:
                peer_value = board[peer]
                if peer_value != 0:
                    possible.discard(peer_value)

            candidates.append(possible)

    return candidates


def is_solved(board: List[int]) -> bool:
    """Check if the board is completely filled (no zeros)."""
    return all(v != 0 for v in board)


def count_clues(board: List[int]) -> int:
    """Count the number of filled cells (clues) in the board."""
    return sum(1 for v in board if v != 0)


def count_solutions(board: List[int], limit: int = 2,
                   geometry: Optional[Geometry] = None) -> int:
    """
    Count the number of solutions to a puzzle, up to a limit.

    Uses backtracking with MRV (Minimum Remaining Values) heuristic
    for efficiency.

    Args:
        board: 81-element list of cell values
        limit: Stop counting after finding this many solutions
        geometry: Optional Geometry instance

    Returns:
        Number of solutions found (0, 1, or 2+ if limit=2)

    Examples:
        >>> count_solutions(valid_puzzle)
        1  # Unique solution
        >>> count_solutions(ambiguous_puzzle)
        2  # Multiple solutions (stopped at limit)
        >>> count_solutions(invalid_puzzle)
        0  # No solution
    """
    if geometry is None:
        geometry = get_geometry()

    # Work on a copy
    work = board.copy()
    count = [0]  # Use list for closure mutation

    def backtrack():
        if count[0] >= limit:
            return

        # Find the unfilled cell with fewest candidates (MRV heuristic)
        best_cell = -1
        best_candidates = None

        for i in range(81):
            if work[i] != 0:
                continue

            # Compute candidates for this cell
            candidates = []
            for v in range(1, 10):
                valid = True
                for peer in geometry.peers[i]:
                    if work[peer] == v:
                        valid = False
                        break
                if valid:
                    candidates.append(v)

            if len(candidates) == 0:
                # No valid candidates - dead end
                return

            if best_candidates is None or len(candidates) < len(best_candidates):
                best_cell = i
                best_candidates = candidates

        if best_cell == -1:
            # All cells filled - found a solution
            count[0] += 1
            return

        # Try each candidate
        for value in best_candidates:
            work[best_cell] = value
            backtrack()
            if count[0] >= limit:
                work[best_cell] = 0
                return
            work[best_cell] = 0

    backtrack()
    return count[0]


def solve_full(board: List[int], geometry: Optional[Geometry] = None) -> Optional[List[int]]:
    """
    Solve a puzzle completely using backtracking.

    Args:
        board: 81-element list of cell values
        geometry: Optional Geometry instance

    Returns:
        Solved board (81 values) or None if unsolvable

    Examples:
        >>> solution = solve_full(puzzle)
        >>> is_solved(solution)
        True
    """
    if geometry is None:
        geometry = get_geometry()

    # Work on a copy
    work = board.copy()

    def backtrack() -> bool:
        # Find the unfilled cell with fewest candidates (MRV)
        best_cell = -1
        best_candidates = None

        for i in range(81):
            if work[i] != 0:
                continue

            candidates = []
            for v in range(1, 10):
                valid = True
                for peer in geometry.peers[i]:
                    if work[peer] == v:
                        valid = False
                        break
                if valid:
                    candidates.append(v)

            if len(candidates) == 0:
                return False  # Dead end

            if best_candidates is None or len(candidates) < len(best_candidates):
                best_cell = i
                best_candidates = candidates

        if best_cell == -1:
            return True  # Solved

        for value in best_candidates:
            work[best_cell] = value
            if backtrack():
                return True
            work[best_cell] = 0

        return False

    if backtrack():
        return work
    return None


def board_to_string(board: List[int]) -> str:
    """Convert a board to an 81-character string."""
    return ''.join(str(v) for v in board)


def print_board(board: List[int]) -> str:
    """
    Create a formatted string representation of the board.

    Returns a string like:
    5 3 . | . 7 . | . . .
    6 . . | 1 9 5 | . . .
    . 9 8 | . . . | . 6 .
    ------+-------+------
    ...
    """
    lines = []
    for r in range(9):
        if r > 0 and r % 3 == 0:
            lines.append("------+-------+------")

        row_str = ""
        for c in range(9):
            if c > 0 and c % 3 == 0:
                row_str += "| "
            val = board[r * 9 + c]
            row_str += (str(val) if val != 0 else ".") + " "

        lines.append(row_str.strip())

    return "\n".join(lines)
