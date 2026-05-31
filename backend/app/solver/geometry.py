"""
Sudoku Geometry - Defines the structural relationships in a 9x9 Sudoku grid.

This module provides:
- Unit definitions (rows, columns, boxes)
- Peer relationships (cells that share a unit)
- Index conversion utilities

Ported from solver.js lines 8-31
"""

from dataclasses import dataclass, field
from typing import List, Set, Tuple


@dataclass
class Geometry:
    """
    Precomputed Sudoku geometry for efficient lookups.

    A standard 9x9 Sudoku has:
    - 81 cells (indices 0-80)
    - 27 units (9 rows + 9 columns + 9 boxes)
    - Each cell belongs to exactly 3 units
    - Each cell has 20 peers (cells sharing a unit)
    """

    # Unit definitions - each is a list of 9 cell indices
    unit_rows: List[List[int]] = field(default_factory=list)
    unit_cols: List[List[int]] = field(default_factory=list)
    unit_boxes: List[List[int]] = field(default_factory=list)

    # All units combined
    all_units: List[List[int]] = field(default_factory=list)

    # Peer sets - for each cell, the set of 20 cells that share a unit
    peers: List[Set[int]] = field(default_factory=list)

    # Unit membership - for each cell, indices of its 3 units in all_units
    cell_units: List[List[int]] = field(default_factory=list)

    def __post_init__(self):
        """Initialize all geometry if not already set."""
        if not self.unit_rows:
            self._init_units()
            self._init_peers()
            self._init_cell_units()

    def _init_units(self):
        """Initialize row, column, and box units."""
        # Rows: cells 0-8, 9-17, 18-26, etc.
        self.unit_rows = [
            [r * 9 + c for c in range(9)]
            for r in range(9)
        ]

        # Columns: cells 0,9,18,...,72 for col 0, etc.
        self.unit_cols = [
            [r * 9 + c for r in range(9)]
            for c in range(9)
        ]

        # Boxes: 3x3 regions
        self.unit_boxes = []
        for box in range(9):
            box_row = (box // 3) * 3  # 0, 0, 0, 3, 3, 3, 6, 6, 6
            box_col = (box % 3) * 3   # 0, 3, 6, 0, 3, 6, 0, 3, 6
            cells = [
                (box_row + dr) * 9 + (box_col + dc)
                for dr in range(3)
                for dc in range(3)
            ]
            self.unit_boxes.append(cells)

        # Combine all units
        self.all_units = self.unit_rows + self.unit_cols + self.unit_boxes

    def _init_peers(self):
        """Initialize peer sets for each cell."""
        self.peers = []
        for i in range(81):
            r, c = self.rc(i)
            b = self.box_of(r, c)

            # Collect all cells in same row, column, and box
            peer_set = set()
            for cell in self.unit_rows[r]:
                peer_set.add(cell)
            for cell in self.unit_cols[c]:
                peer_set.add(cell)
            for cell in self.unit_boxes[b]:
                peer_set.add(cell)

            # Remove self
            peer_set.discard(i)
            self.peers.append(peer_set)

    def _init_cell_units(self):
        """Initialize unit membership for each cell."""
        self.cell_units = []
        for i in range(81):
            r, c = self.rc(i)
            b = self.box_of(r, c)
            # Indices in all_units: row r, col c+9, box b+18
            self.cell_units.append([r, c + 9, b + 18])

    @staticmethod
    def rc(index: int) -> Tuple[int, int]:
        """Convert linear index (0-80) to row, column (0-8, 0-8)."""
        return index // 9, index % 9

    @staticmethod
    def index(row: int, col: int) -> int:
        """Convert row, column to linear index."""
        return row * 9 + col

    @staticmethod
    def box_of(row: int, col: int) -> int:
        """Get box index (0-8) for a given row and column."""
        return (row // 3) * 3 + (col // 3)

    @staticmethod
    def box_of_index(index: int) -> int:
        """Get box index (0-8) for a given cell index."""
        r, c = index // 9, index % 9
        return (r // 3) * 3 + (c // 3)

    def get_row(self, index: int) -> List[int]:
        """Get all cells in the same row as the given cell."""
        return self.unit_rows[index // 9]

    def get_col(self, index: int) -> List[int]:
        """Get all cells in the same column as the given cell."""
        return self.unit_cols[index % 9]

    def get_box(self, index: int) -> List[int]:
        """Get all cells in the same box as the given cell."""
        return self.unit_boxes[self.box_of_index(index)]

    def get_units_for_cell(self, index: int) -> List[List[int]]:
        """Get all three units (row, col, box) containing the given cell."""
        unit_indices = self.cell_units[index]
        return [self.all_units[i] for i in unit_indices]

    def cells_see_each_other(self, i: int, j: int) -> bool:
        """Check if two cells share a unit (are peers)."""
        return j in self.peers[i]

    def common_peers(self, cells: List[int]) -> Set[int]:
        """Get cells that are peers of ALL given cells."""
        if not cells:
            return set()
        result = self.peers[cells[0]].copy()
        for cell in cells[1:]:
            result &= self.peers[cell]
        return result


# Singleton instance for global use
_geometry: Geometry = None


def get_geometry() -> Geometry:
    """Get the singleton Geometry instance."""
    global _geometry
    if _geometry is None:
        _geometry = Geometry()
    return _geometry
