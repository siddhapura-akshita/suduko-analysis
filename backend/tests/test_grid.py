"""Tests for Sudoku grid operations."""

import pytest
from app.solver.grid import (
    parse_grid, find_conflicts, compute_candidates,
    is_solved, count_clues, count_solutions, solve_full,
    board_to_string, print_board
)


# Sample puzzles from data.js
EASY_PUZZLE = "530070000600195000098000060800060003400803001700020006060000280000419005000080079"
MEDIUM_PUZZLE = "300000000970010000600583000200000900500621003008000005000435002000090056000000001"
HARD_PUZZLE = "100000569492056108056109240009640801064010000218035604040500016905061402621000005"
DIABOLICAL_PUZZLE = "800000000003600000070090200050007000000045700000100030001000068008500010090000400"


class TestParseGrid:
    """Test grid parsing."""

    def test_parse_string_with_zeros(self):
        """Parse string with 0s for empty cells."""
        board = parse_grid("530070000600195000098000060800060003400803001700020006060000280000419005000080079")
        assert len(board) == 81
        assert board[0] == 5
        assert board[1] == 3
        assert board[2] == 0

    def test_parse_string_with_dots(self):
        """Parse string with dots for empty cells."""
        board = parse_grid("53..7....6..195....98....6.8...6...34..8..3..17...2...6.6....28....419..5....8..79")
        assert board[2] == 0
        assert board[3] == 0

    def test_parse_list_of_ints(self):
        """Parse list of integers."""
        board = parse_grid([5, 3, 0, 0, 7, 0] + [0] * 75)
        assert board[0] == 5
        assert board[1] == 3
        assert board[2] == 0

    def test_parse_short_string(self):
        """Short string should be padded with zeros."""
        board = parse_grid("53")
        assert board[0] == 5
        assert board[1] == 3
        assert board[2] == 0
        assert len(board) == 81

    def test_parse_ignores_invalid_chars(self):
        """Invalid characters should be ignored."""
        board = parse_grid("5-3-0 0-7-0")
        assert board[0] == 5
        assert board[1] == 3


class TestFindConflicts:
    """Test conflict detection."""

    def test_no_conflicts_valid_puzzle(self):
        """Valid puzzle should have no conflicts."""
        board = parse_grid(EASY_PUZZLE)
        conflicts = find_conflicts(board)
        assert len(conflicts) == 0

    def test_row_conflict(self):
        """Two same values in a row should be detected."""
        # Put two 5s in first row
        board = [5, 5, 0] + [0] * 78
        conflicts = find_conflicts(board)
        assert 0 in conflicts
        assert 1 in conflicts

    def test_column_conflict(self):
        """Two same values in a column should be detected."""
        # Put 5 at position 0 and 9 (same column)
        board = [0] * 81
        board[0] = 5
        board[9] = 5
        conflicts = find_conflicts(board)
        assert 0 in conflicts
        assert 9 in conflicts

    def test_box_conflict(self):
        """Two same values in a box should be detected."""
        # Put 5 at position 0 and 10 (same box, different row/col)
        board = [0] * 81
        board[0] = 5
        board[10] = 5
        conflicts = find_conflicts(board)
        assert 0 in conflicts
        assert 10 in conflicts


class TestComputeCandidates:
    """Test candidate computation."""

    def test_filled_cell_no_candidates(self):
        """Filled cells should have empty candidate sets."""
        board = parse_grid(EASY_PUZZLE)
        candidates = compute_candidates(board)
        # Cell 0 has value 5, should have no candidates
        assert candidates[0] == set()

    def test_empty_cell_has_candidates(self):
        """Empty cells should have valid candidates."""
        board = parse_grid(EASY_PUZZLE)
        candidates = compute_candidates(board)
        # Cell 2 is empty, should have candidates
        assert len(candidates[2]) > 0
        # 5 and 3 are in same row, should be excluded
        assert 5 not in candidates[2]
        assert 3 not in candidates[2]

    def test_empty_board_all_candidates(self):
        """Empty board cells should have all 1-9 as candidates."""
        board = [0] * 81
        candidates = compute_candidates(board)
        assert candidates[0] == set(range(1, 10))


class TestIsSolved:
    """Test solved detection."""

    def test_unsolved_puzzle(self):
        """Puzzle with zeros is not solved."""
        board = parse_grid(EASY_PUZZLE)
        assert not is_solved(board)

    def test_solved_puzzle(self):
        """Puzzle without zeros is solved."""
        board = [1] * 81  # Not valid, but filled
        assert is_solved(board)


class TestCountClues:
    """Test clue counting."""

    def test_easy_puzzle_clues(self):
        """Count clues in easy puzzle."""
        board = parse_grid(EASY_PUZZLE)
        clues = count_clues(board)
        assert clues >= 17  # Minimum for valid Sudoku

    def test_empty_board(self):
        """Empty board has 0 clues."""
        board = [0] * 81
        assert count_clues(board) == 0


class TestCountSolutions:
    """Test solution counting."""

    def test_valid_puzzle_one_solution(self):
        """Valid puzzle should have exactly one solution."""
        board = parse_grid(EASY_PUZZLE)
        solutions = count_solutions(board, limit=2)
        assert solutions == 1

    def test_empty_board_multiple_solutions(self):
        """Empty board has multiple solutions."""
        board = [0] * 81
        solutions = count_solutions(board, limit=2)
        assert solutions >= 2

    def test_invalid_puzzle_no_solution(self):
        """Puzzle with conflict has no solution."""
        board = [5, 5] + [0] * 79  # Two 5s in same row
        solutions = count_solutions(board, limit=2)
        assert solutions == 0


class TestSolveFull:
    """Test full solving."""

    def test_solve_easy_puzzle(self):
        """Should solve easy puzzle."""
        board = parse_grid(EASY_PUZZLE)
        solution = solve_full(board)
        assert solution is not None
        assert is_solved(solution)
        assert find_conflicts(solution) == set()

    def test_solve_medium_puzzle(self):
        """Should solve medium puzzle."""
        board = parse_grid(MEDIUM_PUZZLE)
        solution = solve_full(board)
        assert solution is not None
        assert is_solved(solution)

    def test_unsolvable_puzzle(self):
        """Unsolvable puzzle should return None."""
        # Create unsolvable puzzle (5 conflicts with itself)
        board = [5, 5] + [0] * 79
        solution = solve_full(board)
        assert solution is None


class TestBoardFormatting:
    """Test board formatting utilities."""

    def test_board_to_string(self):
        """Convert board to string."""
        board = parse_grid(EASY_PUZZLE)
        s = board_to_string(board)
        assert len(s) == 81
        assert s[0] == '5'
        assert s[1] == '3'

    def test_print_board(self):
        """Print board should create readable format."""
        board = parse_grid(EASY_PUZZLE)
        formatted = print_board(board)
        assert "5 3" in formatted
        assert "|" in formatted
        assert "+" in formatted
