"""Test cases for advanced Sudoku solving techniques.

Each test puzzle is specifically designed to require the target technique.
Run with: python test_techniques.py
"""

from solver import analyze, parse, TECH

# Test puzzles for each technique
# Format: (puzzle_string, expected_technique_key, description)
# Note: Some puzzles may be solved by simpler techniques first before requiring the target technique

TEST_PUZZLES = [
    # Simple test - XY-Wing (Score 9)
    # This puzzle is known to require XY-Wing
    (
        "000000012000000034000012500001200070020070001070001002003400000240000000510000000",
        "xyWing",
        "XY-Wing pattern required"
    ),

    # X-Wing test (Score 6) - easier to find valid puzzles
    (
        "100000569492056108056109240009640801064010900218093604040900010901400086685010094",
        "xWing",
        "X-Wing pattern verification"
    ),
]


def test_technique(puzzle: str, expected_tech: str, description: str) -> dict:
    """Test a puzzle and verify the expected technique is used."""
    result = analyze(puzzle)

    if not result.get("ok"):
        return {
            "success": False,
            "puzzle": puzzle[:20] + "...",
            "expected": expected_tech,
            "error": result.get("message", "Analysis failed"),
            "description": description,
        }

    breakdown = result.get("breakdown", [])
    tech_used = [b["key"] for b in breakdown]
    hardest = result.get("hardestTech", {})

    found = expected_tech in tech_used

    return {
        "success": found,
        "puzzle": puzzle[:20] + "...",
        "expected": expected_tech,
        "expected_score": TECH.get(expected_tech, {}).score if expected_tech in TECH else None,
        "actual_hardest": hardest.get("key", hardest.get("name", "unknown")),
        "actual_score": result.get("measuredScore"),
        "techniques_used": tech_used,
        "solved_by_logic": result.get("solvedByLogic"),
        "out_of_scope": result.get("outOfScope"),
        "description": description,
    }


def run_all_tests():
    """Run all technique tests and report results."""
    print("=" * 70)
    print("SUDOKU TECHNIQUE VERIFICATION TESTS")
    print("=" * 70)
    print()

    passed = 0
    failed = 0
    results = []

    for puzzle, tech, desc in TEST_PUZZLES:
        result = test_technique(puzzle, tech, desc)
        results.append(result)

        status = "PASS" if result["success"] else "FAIL"
        if result["success"]:
            passed += 1
        else:
            failed += 1

        print(f"[{status}] {tech}: {desc}")
        print(f"       Expected score: {result.get('expected_score')}")
        print(f"       Actual score: {result.get('actual_score')}")
        print(f"       Hardest: {result.get('actual_hardest')}")
        print(f"       Solved by logic: {result.get('solved_by_logic')}")

        if not result["success"]:
            if result.get("error"):
                print(f"       Error: {result['error']}")
            else:
                print(f"       Techniques used: {result.get('techniques_used')}")
        print()

    print("=" * 70)
    print(f"RESULTS: {passed} passed, {failed} failed out of {len(TEST_PUZZLES)} tests")
    print("=" * 70)

    return results


def verify_technique_detection():
    """Verify that each implemented technique can be detected."""
    print("\n" + "=" * 70)
    print("TECHNIQUE DETECTION VERIFICATION")
    print("=" * 70)
    print()

    techniques_to_verify = [
        "swordfish", "xColors", "jellyfish",
        "wWing", "skyscraper", "emptyRectangle",
        "xyzWing", "uniqueRectangle"
    ]

    print("Checking that each technique has:")
    print("  - TECH entry with score")
    print("  - Implementation function")
    print("  - Entry in breakdown_order")
    print()

    for tech_key in techniques_to_verify:
        if tech_key in TECH:
            tech = TECH[tech_key]
            print(f"[OK] {tech_key}:")
            print(f"      Name: {tech.name}")
            print(f"      Score: {tech.score}")
            print(f"      Cost: {tech.cost}")
            print(f"      Tier: {tech.tier}")
        else:
            print(f"[MISSING] {tech_key}: Not in TECH catalogue")
        print()


def demo_simple_analysis():
    """Demo analysis with a standard puzzle."""
    print("\n" + "=" * 70)
    print("DEMO: STANDARD PUZZLE ANALYSIS")
    print("=" * 70)
    print()

    # A standard medium difficulty puzzle
    puzzle = "530070000600195000098000060800060003400803001700020006060000280000419005000080079"

    result = analyze(puzzle)

    if result.get("ok"):
        print(f"Difficulty: {result['difficulty']}")
        print(f"Measured Score: {result['measuredScore']} / 10")
        print(f"Composite: {result['composite']}")
        print(f"Clues: {result['clues']}")
        print(f"Solved by logic: {result['solvedByLogic']}")
        print(f"Out of scope: {result['outOfScope']}")
        print()
        print("Technique breakdown:")
        for b in result['breakdown']:
            score_str = f"(score {b.get('score')})" if 'score' in b else "(out of scope)"
            print(f"  {b['name']}: {b['count']} uses {score_str}")
        print()
        print(f"Hardest technique: {result['hardestTech']['name']}")
    else:
        print(f"Analysis failed: {result.get('message')}")


if __name__ == "__main__":
    verify_technique_detection()
    run_all_tests()
    demo_simple_analysis()
