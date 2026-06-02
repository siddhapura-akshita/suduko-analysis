"""Tests for analyzer.py - Publisher data and analytics.

These tests verify behavioral equivalence with the JavaScript implementation.
"""

import pytest
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analyzer import (
    PUBLISHERS, PUBLISHER_SHORT, DIFFS,
    SUBMIT_PUBLISHERS, SUBMIT_PUBLISHER_SHORT,
    DIFF_BY_PUBLISHER, CLAIMED_SCORE,
    TECHNIQUE_SCALE, TECH_BY_TIER, SCORE_RANGE, PROFILE, GRID_POOL, REPO,
    diffs_for, claimed_score, verdict, tech_for_score,
    mulberry32, generate, pearson, analytics
)


class TestPublisherConstants:
    """Test publisher-related constants."""

    def test_publishers_list(self):
        """Test PUBLISHERS list matches JavaScript."""
        assert PUBLISHERS == [
            "The New York Times",
            "The Times",
            "The Guardian",
            "Sudoku.com"
        ]

    def test_publisher_short(self):
        """Test PUBLISHER_SHORT mapping."""
        assert PUBLISHER_SHORT["The New York Times"] == "NYT"
        assert PUBLISHER_SHORT["The Times"] == "Times"
        assert PUBLISHER_SHORT["The Guardian"] == "Guardian"
        assert PUBLISHER_SHORT["Sudoku.com"] == "Sudoku.com"

    def test_submit_publishers(self):
        """Test SUBMIT_PUBLISHERS list."""
        assert SUBMIT_PUBLISHERS == [
            "NYT", "Sudoku.com", "The Guardian", "Times Sudoku", "Others"
        ]

    def test_diffs(self):
        """Test DIFFS list."""
        assert DIFFS == ["Easy", "Medium", "Hard"]


class TestDifficultyMappings:
    """Test difficulty mappings per publisher."""

    def test_diff_by_publisher_nyt(self):
        """Test NYT difficulty options."""
        assert DIFF_BY_PUBLISHER["NYT"] == ["Easy", "Medium", "Hard"]

    def test_diff_by_publisher_sudoku_com(self):
        """Test Sudoku.com difficulty options."""
        assert DIFF_BY_PUBLISHER["Sudoku.com"] == [
            "Easy", "Medium", "Hard", "Expert", "Master", "Extreme"
        ]

    def test_diff_by_publisher_guardian(self):
        """Test The Guardian difficulty options."""
        assert DIFF_BY_PUBLISHER["The Guardian"] == [
            "Easy", "Medium", "Hard", "Expert"
        ]

    def test_diff_by_publisher_times(self):
        """Test Times Sudoku difficulty options."""
        assert DIFF_BY_PUBLISHER["Times Sudoku"] == [
            "Easy", "Mild", "Moderate", "Difficult", "Fiendish", "Super Fiendish"
        ]


class TestClaimedScores:
    """Test claimed score mappings."""

    def test_claimed_score_nyt(self):
        """Test NYT claimed scores."""
        assert CLAIMED_SCORE["NYT"]["Easy"] == 2
        assert CLAIMED_SCORE["NYT"]["Medium"] == 4
        assert CLAIMED_SCORE["NYT"]["Hard"] == 6

    def test_claimed_score_sudoku_com(self):
        """Test Sudoku.com claimed scores."""
        assert CLAIMED_SCORE["Sudoku.com"]["Easy"] == 2
        assert CLAIMED_SCORE["Sudoku.com"]["Medium"] == 4
        assert CLAIMED_SCORE["Sudoku.com"]["Hard"] == 5
        assert CLAIMED_SCORE["Sudoku.com"]["Expert"] == 7
        assert CLAIMED_SCORE["Sudoku.com"]["Master"] == 8
        assert CLAIMED_SCORE["Sudoku.com"]["Extreme"] == 9

    def test_claimed_score_times(self):
        """Test Times Sudoku claimed scores."""
        assert CLAIMED_SCORE["Times Sudoku"]["Easy"] == 1
        assert CLAIMED_SCORE["Times Sudoku"]["Mild"] == 2
        assert CLAIMED_SCORE["Times Sudoku"]["Fiendish"] == 9
        assert CLAIMED_SCORE["Times Sudoku"]["Super Fiendish"] == 10


class TestHelperFunctions:
    """Test helper functions."""

    def test_diffs_for_valid_publisher(self):
        """Test diffs_for with valid publisher."""
        assert diffs_for("NYT") == ["Easy", "Medium", "Hard"]
        assert diffs_for("Sudoku.com") == [
            "Easy", "Medium", "Hard", "Expert", "Master", "Extreme"
        ]

    def test_diffs_for_invalid_publisher(self):
        """Test diffs_for with invalid publisher returns empty list."""
        assert diffs_for("Unknown") == []

    def test_claimed_score_valid(self):
        """Test claimed_score with valid inputs."""
        assert claimed_score("NYT", "Easy") == 2
        assert claimed_score("NYT", "Hard") == 6
        assert claimed_score("Times Sudoku", "Super Fiendish") == 10

    def test_claimed_score_invalid(self):
        """Test claimed_score with invalid inputs returns None."""
        assert claimed_score("Unknown", "Easy") is None
        assert claimed_score("NYT", "SuperHard") is None


class TestVerdict:
    """Test verdict function."""

    def test_verdict_accurate(self):
        """Test verdict for zero mismatch."""
        assert verdict(0) == "Accurate"

    def test_verdict_underrated(self):
        """Test verdict for positive mismatch (underrated)."""
        assert verdict(1) == "Slightly Underrated"
        assert verdict(2) == "Moderately Underrated"
        assert verdict(3) == "Significantly Underrated"
        assert verdict(5) == "Significantly Underrated"

    def test_verdict_overrated(self):
        """Test verdict for negative mismatch (overrated)."""
        assert verdict(-1) == "Slightly Overrated"
        assert verdict(-2) == "Moderately Overrated"
        assert verdict(-3) == "Significantly Overrated"
        assert verdict(-5) == "Significantly Overrated"


class TestTechniqueScale:
    """Test technique scale reference."""

    def test_technique_scale_count(self):
        """Test TECHNIQUE_SCALE has correct number of entries."""
        assert len(TECHNIQUE_SCALE) == 17

    def test_technique_scale_scores(self):
        """Test some technique scores."""
        # Find Full House
        full_house = next(t for t in TECHNIQUE_SCALE if t["name"] == "Full House")
        assert full_house["score"] == 1

        # Find X-Wing
        x_wing = next(t for t in TECHNIQUE_SCALE if t["name"] == "X-Wing")
        assert x_wing["score"] == 6

        # Find XY-Wing
        xy_wing = next(t for t in TECHNIQUE_SCALE if t["name"] == "XY-Wing")
        assert xy_wing["score"] == 9


class TestTechForScore:
    """Test tech_for_score function."""

    def test_tech_for_score_basic(self):
        """Test tech_for_score returns valid technique."""
        result = tech_for_score(1)
        assert result in ["Full House", "Naked Single"]

    def test_tech_for_score_x_wing(self):
        """Test tech_for_score for X-Wing score."""
        result = tech_for_score(6)
        assert result == "X-Wing"

    def test_tech_for_score_out_of_range(self):
        """Test tech_for_score for out-of-range score."""
        result = tech_for_score(15)
        assert result == "Advanced Out-of-Scope Technique"


class TestProfile:
    """Test publisher profile constants."""

    def test_profile_nyt(self):
        """Test NYT profile."""
        assert PROFILE["NYT"]["bias"] == 0.1
        assert PROFILE["NYT"]["noise"] == 0.9

    def test_profile_sudoku_com(self):
        """Test Sudoku.com profile."""
        assert PROFILE["Sudoku.com"]["bias"] == -1.6
        assert PROFILE["Sudoku.com"]["noise"] == 1.2


class TestGridPool:
    """Test GRID_POOL constants."""

    def test_grid_pool_count(self):
        """Test GRID_POOL has 6 puzzles."""
        assert len(GRID_POOL) == 6

    def test_grid_pool_length(self):
        """Test each grid in GRID_POOL is 81 characters."""
        for i, grid in enumerate(GRID_POOL):
            assert len(grid) == 81, f"GRID_POOL[{i}] has length {len(grid)}"


class TestMulberry32:
    """Test mulberry32 RNG."""

    def test_mulberry32_deterministic(self):
        """Test mulberry32 produces same sequence for same seed."""
        rng1 = mulberry32(12345)
        rng2 = mulberry32(12345)

        values1 = [rng1() for _ in range(10)]
        values2 = [rng2() for _ in range(10)]

        assert values1 == values2

    def test_mulberry32_range(self):
        """Test mulberry32 produces values in [0, 1)."""
        rng = mulberry32(20260531)
        for _ in range(100):
            v = rng()
            assert 0 <= v < 1

    def test_mulberry32_different_seeds(self):
        """Test different seeds produce different sequences."""
        rng1 = mulberry32(12345)
        rng2 = mulberry32(54321)

        values1 = [rng1() for _ in range(10)]
        values2 = [rng2() for _ in range(10)]

        assert values1 != values2


class TestGenerate:
    """Test generate function."""

    def test_generate_count(self):
        """Test generate produces correct number of records."""
        records = generate(10)
        assert len(records) == 10

    def test_generate_deterministic(self):
        """Test generate produces same records for same seed."""
        records1 = generate(10, seed=12345)
        records2 = generate(10, seed=12345)

        for i in range(10):
            assert records1[i]["id"] == records2[i]["id"]
            assert records1[i]["publisher"] == records2[i]["publisher"]
            assert records1[i]["measuredScore"] == records2[i]["measuredScore"]

    def test_generate_record_structure(self):
        """Test generated records have required fields."""
        records = generate(5)
        for record in records:
            assert "id" in record
            assert "publisher" in record
            assert "publisherShort" in record
            assert "claimed" in record
            assert "claimedScore" in record
            assert "measuredScore" in record
            assert "mismatch" in record
            assert "verdict" in record
            assert "tech" in record
            assert "clues" in record
            assert "grid" in record
            assert "date" in record
            assert "source" in record

    def test_generate_id_format(self):
        """Test generated IDs have correct format."""
        records = generate(5)
        for i, record in enumerate(records):
            expected_id = f"SDK-{1042 + i:04d}"
            assert record["id"] == expected_id

    def test_generate_mismatch_calculation(self):
        """Test mismatch is calculated correctly."""
        records = generate(100)
        for record in records:
            expected_mismatch = record["measuredScore"] - record["claimedScore"]
            assert record["mismatch"] == expected_mismatch

    def test_generate_verdict_matches_mismatch(self):
        """Test verdict matches mismatch value."""
        records = generate(100)
        for record in records:
            expected_verdict = verdict(record["mismatch"])
            assert record["verdict"] == expected_verdict


class TestRepo:
    """Test pre-generated REPO constant."""

    def test_repo_count(self):
        """Test REPO has 36 records."""
        assert len(REPO) == 36

    def test_repo_structure(self):
        """Test REPO records have required fields."""
        for record in REPO:
            assert "id" in record
            assert "publisher" in record
            assert "measuredScore" in record


class TestPearson:
    """Test Pearson correlation function."""

    def test_pearson_perfect_positive(self):
        """Test Pearson correlation of 1 for perfect positive correlation."""
        xs = [1, 2, 3, 4, 5]
        ys = [2, 4, 6, 8, 10]
        r = pearson(xs, ys)
        assert abs(r - 1.0) < 0.0001

    def test_pearson_perfect_negative(self):
        """Test Pearson correlation of -1 for perfect negative correlation."""
        xs = [1, 2, 3, 4, 5]
        ys = [10, 8, 6, 4, 2]
        r = pearson(xs, ys)
        assert abs(r - (-1.0)) < 0.0001

    def test_pearson_no_correlation(self):
        """Test Pearson correlation near 0 for no correlation."""
        xs = [1, 2, 3, 4, 5]
        ys = [3, 1, 4, 1, 5]  # Roughly random
        r = pearson(xs, ys)
        assert -0.5 < r < 0.5

    def test_pearson_insufficient_data(self):
        """Test Pearson returns 0 for insufficient data."""
        assert pearson([1], [1]) == 0
        assert pearson([], []) == 0


class TestAnalytics:
    """Test analytics function."""

    def test_analytics_structure(self):
        """Test analytics returns correct structure."""
        result = analytics(REPO)

        assert "pearson" in result
        assert "agreement" in result
        assert "accurate" in result
        assert "over" in result
        assert "under" in result
        assert "meanMeasured" in result
        assert "meanAbsMismatch" in result
        assert "leaderboard" in result
        assert "n" in result

    def test_analytics_counts(self):
        """Test analytics counts are consistent."""
        result = analytics(REPO)

        # accurate + over + under should equal n
        assert result["accurate"] + result["over"] + result["under"] == result["n"]

    def test_analytics_leaderboard_structure(self):
        """Test leaderboard entries have required fields."""
        result = analytics(REPO)

        for entry in result["leaderboard"]:
            assert "publisher" in entry
            assert "short" in entry
            assert "n" in entry
            assert "accuracy" in entry
            assert "over" in entry
            assert "under" in entry
            assert "meanMismatch" in entry
            assert "tendency" in entry

    def test_analytics_leaderboard_sorted(self):
        """Test leaderboard is sorted by accuracy descending."""
        result = analytics(REPO)

        accuracies = [entry["accuracy"] for entry in result["leaderboard"]]
        assert accuracies == sorted(accuracies, reverse=True)

    def test_analytics_tendency(self):
        """Test tendency is correctly calculated."""
        result = analytics(REPO)

        for entry in result["leaderboard"]:
            mean_mismatch = entry["meanMismatch"]
            if mean_mismatch > 0.4:
                assert entry["tendency"] == "under-rates"
            elif mean_mismatch < -0.4:
                assert entry["tendency"] == "over-rates"
            else:
                assert entry["tendency"] == "balanced"


class TestScoreRange:
    """Test SCORE_RANGE constants."""

    def test_score_range_values(self):
        """Test SCORE_RANGE has correct values."""
        assert SCORE_RANGE["Easy"] == [110, 255]
        assert SCORE_RANGE["Medium"] == [260, 515]
        assert SCORE_RANGE["Hard"] == [525, 955]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
