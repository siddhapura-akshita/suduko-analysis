"""Tests for Sudoku geometry module."""

import pytest
from app.solver.geometry import Geometry, get_geometry


@pytest.fixture
def geo():
    """Create a fresh Geometry instance for each test."""
    return Geometry()


class TestGeometryBasics:
    """Test basic geometry properties."""

    def test_unit_rows_count(self, geo):
        """Should have 9 rows."""
        assert len(geo.unit_rows) == 9

    def test_unit_cols_count(self, geo):
        """Should have 9 columns."""
        assert len(geo.unit_cols) == 9

    def test_unit_boxes_count(self, geo):
        """Should have 9 boxes."""
        assert len(geo.unit_boxes) == 9

    def test_all_units_count(self, geo):
        """Should have 27 units total (9 rows + 9 cols + 9 boxes)."""
        assert len(geo.all_units) == 27

    def test_each_unit_has_9_cells(self, geo):
        """Each unit should contain exactly 9 cells."""
        for unit in geo.all_units:
            assert len(unit) == 9

    def test_peers_count(self, geo):
        """Each cell should have exactly 20 peers."""
        for i in range(81):
            assert len(geo.peers[i]) == 20


class TestRowColConversion:
    """Test index conversion utilities."""

    def test_rc_first_cell(self, geo):
        """Index 0 should be row 0, col 0."""
        assert geo.rc(0) == (0, 0)

    def test_rc_last_cell(self, geo):
        """Index 80 should be row 8, col 8."""
        assert geo.rc(80) == (8, 8)

    def test_rc_middle_cell(self, geo):
        """Index 40 should be row 4, col 4."""
        assert geo.rc(40) == (4, 4)

    def test_index_first_cell(self, geo):
        """Row 0, col 0 should be index 0."""
        assert geo.index(0, 0) == 0

    def test_index_last_cell(self, geo):
        """Row 8, col 8 should be index 80."""
        assert geo.index(8, 8) == 80

    def test_roundtrip(self, geo):
        """Converting to rc and back should give same index."""
        for i in range(81):
            r, c = geo.rc(i)
            assert geo.index(r, c) == i


class TestBoxCalculation:
    """Test box index calculations."""

    def test_box_of_top_left(self, geo):
        """Top-left corner should be box 0."""
        assert geo.box_of(0, 0) == 0
        assert geo.box_of(0, 1) == 0
        assert geo.box_of(1, 0) == 0
        assert geo.box_of(2, 2) == 0

    def test_box_of_top_middle(self, geo):
        """Top-middle should be box 1."""
        assert geo.box_of(0, 3) == 1
        assert geo.box_of(1, 4) == 1
        assert geo.box_of(2, 5) == 1

    def test_box_of_center(self, geo):
        """Center should be box 4."""
        assert geo.box_of(4, 4) == 4

    def test_box_of_bottom_right(self, geo):
        """Bottom-right should be box 8."""
        assert geo.box_of(6, 6) == 8
        assert geo.box_of(7, 7) == 8
        assert geo.box_of(8, 8) == 8

    def test_box_of_index(self, geo):
        """box_of_index should match box_of for converted indices."""
        for i in range(81):
            r, c = geo.rc(i)
            assert geo.box_of_index(i) == geo.box_of(r, c)


class TestPeerRelationships:
    """Test peer relationships."""

    def test_peers_exclude_self(self, geo):
        """A cell should not be its own peer."""
        for i in range(81):
            assert i not in geo.peers[i]

    def test_same_row_are_peers(self, geo):
        """Cells in the same row should be peers."""
        # Cell 0 and cell 5 are both in row 0
        assert 5 in geo.peers[0]
        assert 0 in geo.peers[5]

    def test_same_col_are_peers(self, geo):
        """Cells in the same column should be peers."""
        # Cell 0 and cell 45 are both in column 0
        assert 45 in geo.peers[0]
        assert 0 in geo.peers[45]

    def test_same_box_are_peers(self, geo):
        """Cells in the same box should be peers."""
        # Cell 0 and cell 20 are both in box 0
        assert 20 in geo.peers[0]
        assert 0 in geo.peers[20]

    def test_cells_see_each_other(self, geo):
        """cells_see_each_other should detect peer relationships."""
        assert geo.cells_see_each_other(0, 5)  # Same row
        assert geo.cells_see_each_other(0, 45)  # Same col
        assert geo.cells_see_each_other(0, 20)  # Same box
        assert not geo.cells_see_each_other(0, 80)  # Different everything


class TestCommonPeers:
    """Test common peers calculation."""

    def test_common_peers_empty_list(self, geo):
        """Empty cell list should return empty set."""
        assert geo.common_peers([]) == set()

    def test_common_peers_single_cell(self, geo):
        """Single cell should return all its peers."""
        assert geo.common_peers([0]) == geo.peers[0]

    def test_common_peers_same_row(self, geo):
        """Two cells in same row share peers in that row."""
        common = geo.common_peers([0, 1])
        # Should include cells 2-8 in row 0
        for c in range(2, 9):
            assert c in common


class TestUnitRetrieval:
    """Test unit retrieval methods."""

    def test_get_row(self, geo):
        """get_row should return correct row cells."""
        row0 = geo.get_row(0)
        assert row0 == [0, 1, 2, 3, 4, 5, 6, 7, 8]

        row5 = geo.get_row(47)  # 47 // 9 = 5
        assert row5 == [45, 46, 47, 48, 49, 50, 51, 52, 53]

    def test_get_col(self, geo):
        """get_col should return correct column cells."""
        col0 = geo.get_col(0)
        assert col0 == [0, 9, 18, 27, 36, 45, 54, 63, 72]

        col5 = geo.get_col(5)
        assert col5 == [5, 14, 23, 32, 41, 50, 59, 68, 77]

    def test_get_box(self, geo):
        """get_box should return correct box cells."""
        box0 = geo.get_box(0)
        assert box0 == [0, 1, 2, 9, 10, 11, 18, 19, 20]


class TestSingleton:
    """Test singleton behavior."""

    def test_get_geometry_returns_same_instance(self):
        """get_geometry should return the same instance."""
        geo1 = get_geometry()
        geo2 = get_geometry()
        assert geo1 is geo2
