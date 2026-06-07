# Sudoku Difficulty Validator

> **Objective Sudoku Difficulty Validation Platform**

An advanced web application that measures Sudoku puzzle difficulty using 22+ logical solving techniques and compares objective measurements against publisher difficulty claims.

**Live Demo:** [https://suduko-analysis-1.onrender.com/](https://suduko-analysis-1.onrender.com/)

---

## Overview

The Sudoku Difficulty Validator is a research platform designed to bring objectivity to Sudoku difficulty ratings. Publishers often assign difficulty labels (Easy, Medium, Hard, etc.) based on subjective criteria. This platform measures puzzle difficulty using a comprehensive technique-based scoring system and validates these claims against objective measurements.

Built as a full-stack web application with a React frontend and FastAPI backend, the platform allows users to submit puzzles, view detailed analysis results, build a personal repository, and unlock statistical analytics after contributing 5+ puzzles.

Whether you're a Sudoku enthusiast curious about puzzle difficulty, a researcher studying game complexity, or a puzzle creator validating your designs, this platform provides the tools and insights you need.

---

## Features

- **Real-time Puzzle Analysis**: Analyze puzzles using 22+ logical solving techniques across 10 difficulty tiers
- **Publisher Validation**: Compare publisher-claimed difficulty against objective measurements
- **Intelligent Verdict System**: Get clear feedback (Accurate, Underrated, Overrated) with severity levels
- **Personal Repository**: Save and organize analyzed puzzles with searchable/sortable table
- **Advanced Analytics**: Unlock statistical insights including Pearson correlation, publisher leaderboards, and accuracy rankings
- **Publisher Benchmarking**: Compare accuracy across 5 major Sudoku publishers
- **Responsive Design**: Full dark/light mode support with mobile-friendly interface
- **User Authentication**: Simple email-based identification (no password required)

---

## Solving Techniques

The platform implements a comprehensive set of Sudoku solving techniques organized by difficulty tier (1-10 scale):

### Tier 1 (Score 1) - Basic
- **Full House**: Only one empty cell remaining in a unit
- **Naked Single**: Cell has only one candidate remaining

### Tier 2 (Score 2) - Beginner
- **Hidden Single**: Value can only go in one place within a unit

### Tier 3 (Score 3) - Elementary
- **Pointing Pair**: Candidate confined to one box and one line
- **Box-Line Reduction (Claiming)**: Candidate in a line confined to one box

### Tier 4 (Score 4) - Intermediate
- **Naked Pair**: Two cells in a unit share exactly two candidates
- **Naked Triple**: Three cells in a unit share exactly three candidates
- **Naked Quad**: Four cells in a unit share exactly four candidates

### Tier 5 (Score 5) - Intermediate
- **Hidden Pair**: Two values appear only in the same two cells
- **Hidden Triple**: Three values appear only in the same three cells
- **Hidden Quad**: Four values appear only in the same four cells

### Tier 6 (Score 6) - Advanced
- **X-Wing**: Fish pattern with two rows/columns

### Tier 7 (Score 7) - Advanced
- **Swordfish**: Fish pattern with three rows/columns
- **X-Colors (Simple Coloring)**: Chain-based technique using conjugate pairs

### Tier 8 (Score 8) - Expert
- **Jellyfish**: Fish pattern with four rows/columns

### Tier 9 (Score 9) - Expert
- **Skyscraper**: Two conjugate pairs sharing one endpoint
- **XY-Wing**: Bivalue pivot with two wing cells
- **W-Wing**: Two bivalue cells connected by strong link
- **Empty Rectangle**: L-shaped pattern with strong link elimination

### Tier 10 (Score 10) - Master
- **XYZ-Wing**: Extension of XY-Wing with three-candidate pivot
- **Unique Rectangle**: Exploits uniqueness of valid solutions (Types 1 & 2)

### Out-of-Scope (Requires Guessing/Advanced Techniques)
- Alternating Inference Chain
- Nice Loop
- Sue de Coq
- Aligned Pair Exclusion
- Almost Locked Sets (ALS)
- Death Blossom
- And more advanced techniques

---

## Supported Publishers

The platform includes difficulty mappings for major Sudoku publishers:

| Publisher | Difficulty Levels | Score Mapping |
|-----------|------------------|---------------|
| **The New York Times** | Easy, Medium, Hard | 2, 4, 6 |
| **Sudoku.com** | Easy, Medium, Hard, Expert, Master, Extreme | 2, 4, 5, 7, 8, 9 |
| **The Guardian** | Easy, Medium, Hard, Expert | 2, 4, 7, 9 |
| **Times Sudoku** | Easy, Mild, Moderate, Difficult, Fiendish, Super Fiendish | 1, 2, 4, 6, 9, 10 |
| **Others** | Easy, Medium, Hard | 2, 4, 6 |

---

## Architecture

### Frontend
- **Framework**: React 18.3 (via CDN with Babel transpilation)
- **Styling**: Tailwind CSS with custom dark mode
- **Components**: Submit page, Repository page, Analytics dashboard
- **State Management**: React Context API for user state
- **Features**: Live analysis, searchable tables, interactive charts

### Backend
- **Framework**: FastAPI (Python 3.13+)
- **API Design**: RESTful endpoints with Pydantic validation
- **Solver Engine**: Custom implementation with 22+ techniques
- **Analytics**: Pearson correlation, statistical computations
- **Database ORM**: SQLAlchemy

### Database
- **Development**: SQLite (file-based)
- **Production**: PostgreSQL (Render)
- **Models**: User (email-based), Puzzle (full metadata)
- **Features**: Connection pooling, SSL support, automatic migrations

### Deployment
- **Frontend**: Render Static Site
- **Backend**: Render Web Service
- **Database**: Render PostgreSQL
- **CI/CD**: Git-based automatic deployments

---

## Project Structure

```
sudoku-analysis/
├── frontend/
│   ├── index.html                 # Main HTML entry point
│   ├── css/
│   │   └── styles.css             # Custom styles
│   └── js/
│       ├── app.jsx                # Main app component
│       ├── submit.jsx             # Puzzle submission page
│       ├── repository.jsx         # Puzzle repository & analytics
│       ├── charts.jsx             # Statistical visualizations
│       ├── user-context.jsx       # User authentication context
│       ├── email-prompt.jsx       # Email identification modal
│       ├── api-adapter.js         # API client
│       └── data.js                # Constants and helpers
├── backend/
│   ├── api.py                     # FastAPI application & endpoints
│   ├── solver.py                  # Sudoku solving engine (1500+ lines)
│   ├── analyzer.py                # Publisher data & analytics
│   ├── database.py                # SQLAlchemy models & session
│   ├── requirements.txt           # Python dependencies
│   └── tests/
│       ├── test_solver.py         # Solver unit tests
│       ├── test_analyzer.py       # Analytics tests
│       └── test_techniques.py     # Technique-specific tests
├── render.yaml                    # Render deployment config
└── README.md                      # This file
```

---

## Getting Started

### Prerequisites
- Python 3.11 or higher
- Git
- (Optional) Node.js for local development tools

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ujwal373/suduko-analysis.git
   cd suduko-analysis
   ```

2. **Backend setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure environment** (optional for local dev)
   ```bash
   export DATABASE_URL=sqlite:///./sudoku_research.db
   ```

4. **Start the backend server**
   ```bash
   uvicorn api:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Serve the frontend**
   ```bash
   # Option 1: Python simple server
   cd ../frontend
   python -m http.server 3000

   # Option 2: Any static file server
   # Visit http://localhost:3000
   ```

6. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Usage

### Submit a Puzzle

1. Navigate to the **Submit** page
2. Enter your puzzle grid (81 cells, use 0 for empty cells)
3. Select the **publisher** from the dropdown
4. Select the **claimed difficulty** label
5. Click **Analyze** to measure objective difficulty
6. Review the results:
   - Measured score (1-10)
   - Hardest technique required
   - Mismatch value (measured - claimed)
   - Verdict classification
   - Plain-language explanation
7. Click **Submit to Repository** to save the puzzle

### View Your Repository

1. Navigate to the **Repository** page
2. Browse your submitted puzzles in a sortable/searchable table
3. Filter by publisher or difficulty
4. Click on any puzzle to view detailed analysis
5. Track your total puzzle count

### Unlock Analytics

1. Submit at least **5 puzzles** to unlock analytics
2. Navigate to the **Repository** page and scroll to Analytics section
3. View comprehensive statistics:
   - **Pearson Correlation**: Correlation between claimed and measured scores
   - **Agreement Percentage**: Fraction of accurate labels
   - **Publisher Leaderboard**: Accuracy rankings across publishers
   - **Mismatch Distribution**: Histogram of verdict classifications
   - **Statistical Charts**: Scatter plots, box plots, heatmaps

---

## API Documentation

### Base URL
**Production**: `https://suduko-analysis-1.onrender.com/api`
**Local Development**: `http://localhost:8000/api`

### Core Endpoints

#### Puzzle Analysis
- **POST** `/analyze` - Analyze puzzle and return measured difficulty
- **POST** `/parse` - Parse and normalize puzzle input
- **POST** `/validate-conflicts` - Check for duplicate values
- **POST** `/count-solutions` - Verify puzzle uniqueness
- **POST** `/solve` - Solve puzzle completely

#### User Management
- **POST** `/user/identify` - Create or retrieve user by email
- **GET** `/repository?user_id={id}` - Get user's puzzle collection
- **POST** `/submit-puzzle?user_id={id}` - Submit analyzed puzzle
- **GET** `/analytics?user_id={id}` - Get statistical analytics

#### Metadata
- **GET** `/constants` - Get solver constants and publisher data
- **POST** `/claimed-score` - Look up claimed score for publisher/difficulty
- **POST** `/verdict` - Calculate verdict from mismatch value
- **GET** `/diffs-for/{publisher}` - Get difficulty labels for publisher
- **GET** `/difficulty-color/{difficulty}` - Get color code for difficulty

### Interactive API Docs
Visit `/docs` on your backend URL for full interactive API documentation powered by FastAPI's built-in Swagger UI.

---

## Testing

The project includes comprehensive test coverage for all solving techniques and analytics functions.

### Run Tests

```bash
cd backend

# Run all tests
pytest -v

# Run specific test files
pytest tests/test_solver.py -v
pytest tests/test_analyzer.py -v
pytest tests/test_techniques.py -v

# Run with coverage
pytest --cov=. --cov-report=html
```

### Test Coverage
- Geometry helpers (row/column/box conversions)
- All 22+ solving techniques
- Conflict detection and validation
- Candidate computation
- Solution counting and uniqueness verification
- Analytics calculations (Pearson correlation, leaderboards)
- Publisher difficulty mappings
- Database model serialization

---

## Methodology

### Difficulty Scoring

Puzzles are scored on a **1-10 scale** based on the **hardest logical technique** required to solve:

- **Score 1-3**: Basic to elementary techniques
- **Score 4-5**: Intermediate subset techniques
- **Score 6-8**: Advanced fish patterns and coloring
- **Score 9-10**: Expert wings and uniqueness constraints
- **Out-of-Scope**: Requires guessing or advanced chaining

**Composite Score**: A secondary metric calculated as:
```
composite_score = round(max_technique_cost × 2.4 + total_cost × 0.32)
```

### Verdict Calculation

The platform compares measured scores against publisher claims:

```
mismatch = measured_score - claimed_score
```

| Mismatch | Verdict | Meaning |
|----------|---------|---------|
| 0 | **Accurate** | Perfect match |
| +1 | **Slightly Underrated** | Harder than claimed |
| +2 | **Moderately Underrated** | Significantly harder |
| ≥ +3 | **Significantly Underrated** | Much harder than claimed |
| -1 | **Slightly Overrated** | Easier than claimed |
| -2 | **Moderately Overrated** | Significantly easier |
| ≤ -3 | **Significantly Overrated** | Much easier than claimed |

### Statistical Analytics

**Pearson Correlation**: Measures linear correlation between claimed and measured scores across all user puzzles (-1 to +1 scale).

**Publisher Leaderboard**: Ranks publishers by accuracy percentage, showing tendency to under-rate or over-rate difficulty.

**Agreement Rate**: Percentage of puzzles where mismatch = 0 (perfect agreement).

---

## Technology Stack

### Frontend Technologies
- **React 18.3**: UI framework with hooks and context
- **Tailwind CSS**: Utility-first CSS framework
- **Babel**: Browser-based JSX transpilation
- **Fetch API**: HTTP client for backend communication

### Backend Technologies
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation and serialization
- **psycopg2**: PostgreSQL driver
- **pytest**: Testing framework

### Deployment & Infrastructure
- **Render**: Cloud platform (frontend + backend + database)
- **PostgreSQL**: Production database
- **Git**: Version control with automatic deployments

---

## Contributing

We welcome contributions from the community! Here are areas where you can help:

- **Additional Solving Techniques**: Implement advanced techniques (ALS, Kraken, etc.)
- **Publisher Integrations**: Add more publishers with difficulty mappings
- **Analytics Visualizations**: Create new charts and insights
- **Performance Optimizations**: Improve solver speed and efficiency
- **Mobile App**: React Native version for iOS/Android
- **Batch Processing**: Upload multiple puzzles at once
- **Export Features**: CSV/PDF export of analytics

### How to Contribute

1. **Fork** the repository on GitHub
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes with clear commit messages
4. **Add** tests for new features
5. **Run** the test suite to ensure everything passes
6. **Submit** a pull request with a detailed description

### Code Style
- Follow PEP 8 for Python code
- Use meaningful variable names
- Add docstrings for functions
- Write unit tests for new techniques
- Keep commits focused and atomic

---

## Authors

**Akshita Siddhapura**
📧 Email: [siddhapuraakshita@gmail.com](mailto:siddhapuraakshita@gmail.com)

**Ujwal Mojidra**
📧 Email: [ujwal.mojidra@gmail.com](mailto:ujwal.mojidra@gmail.com)

---

## Open to Collaboration

We're actively seeking collaborators and always excited to hear about:
- **Bug reports** and feature requests
- **Research collaborations** on puzzle difficulty analysis
- **Educational partnerships** for game theory and complexity studies
- **Publisher partnerships** for expanded difficulty validation
- **Community feedback** and improvement suggestions

Feel free to open an issue, submit a pull request, or reach out directly via email!

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Sudoku solving techniques based on established logical methods documented by the Sudoku community
- Publisher difficulty data sourced from respective platforms (NYT, Sudoku.com, The Guardian, Times Sudoku)
- Built with modern web technologies and open-source tools
- Inspired by the need for objective difficulty metrics in puzzle design

---

## Roadmap

### Planned Features

- [ ] **Export Analytics**: Download analytics as PDF or CSV
- [ ] **Batch Upload**: Submit multiple puzzles at once
- [ ] **Social Sharing**: Share analysis results on social media
- [ ] **Mobile App**: React Native app for iOS and Android
- [ ] **Advanced Techniques**: Implement ALS-XZ, Kraken, and other expert techniques
- [ ] **Puzzle Generator**: Create puzzles with target difficulty
- [ ] **Leaderboard**: Global rankings of publisher accuracy
- [ ] **Difficulty Predictor**: ML model to predict difficulty before solving

### Recent Updates

- ✅ Deployed to Render with PostgreSQL database
- ✅ Implemented user authentication with email
- ✅ Added analytics with 5-puzzle unlock threshold
- ✅ Created comprehensive test suite
- ✅ Built responsive dark/light mode UI

---

## Links

- **🌐 Live Demo**: [https://suduko-analysis-1.onrender.com/](https://suduko-analysis-1.onrender.com/)
- **📚 API Documentation**: [Backend API Docs](https://suduko-analysis-1.onrender.com/docs)
- **🐛 Report Issues**: [GitHub Issues](https://github.com/ujwal373/suduko-analysis/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/ujwal373/suduko-analysis/discussions)
- **📖 Sudoku Techniques Reference**: [SudokuWiki](https://www.sudokuwiki.org/)

---

## Support

If you find this project useful, please consider:
- ⭐ Starring the repository on GitHub
- 🐦 Sharing it with the Sudoku community
- 🤝 Contributing code or documentation
- 📧 Providing feedback and suggestions

---

**Made with ❤️ by Akshita Siddhapura and Ujwal Mojidra**

*Last Updated: June 2026*
