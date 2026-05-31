# Rich Integration Prompt: Frontend + Python Backend Integration

Copy this entire prompt into Claude in your IDE and follow the workflow.

---

## 🎯 CONTEXT: Sudoku Difficulty Validation Platform

**What You Have:**
- ✅ Production Python architecture (PRODUCTION_ARCHITECTURE.md)
- ✅ Frontend with logic operators ready
- ✅ Implementation guide (IMPLEMENTATION_GUIDE.md)
- ✅ API design (already architected)

**What We're Doing:**
Integrating your frontend with the Python backend following best practices.

---

## PHASE 1: ANALYZE YOUR FRONTEND

### Step 1: Paste Your Frontend Code

Please paste your frontend code below. Include:
- Main component file(s)
- Logic operators / state management
- Form validation
- API calls (if any)
- Grid parsing/manipulation
- Result display logic

### Step 2: Frontend Analysis

Once you paste, analyze:

1. **What logic is in the frontend that should move to backend?**
   - Sudoku validation?
   - Puzzle parsing?
   - Grid calculations?
   - Result formatting?

2. **What should stay in frontend?**
   - Grid input UI
   - Form collection
   - Results visualization
   - Charts/dashboards

3. **What's missing that we need to add?**
   - API client configuration
   - Error handling
   - Loading states
   - Authentication (if needed)

### Step 3: Map to Backend

For each piece of frontend logic:
```
Frontend Logic → Backend API → Python Service → Database
```

Example:
```
User inputs grid → POST /api/v1/puzzles/submit → PuzzleService → PostgreSQL
```

---

## PHASE 2: CREATE MATCHING PYTHON BACKEND

### Step 4: Identify API Endpoints Needed

Based on your frontend, create endpoints for:

**Required Endpoints:**
- `POST /api/v1/puzzles/submit` - Submit puzzle for analysis
- `GET /api/v1/puzzles/{id}` - Get analysis results
- `GET /api/v1/puzzles` - List puzzles
- `GET /api/v1/analytics/publishers` - Publisher stats
- `GET /api/v1/analytics/correlation` - Spearman correlation
- `POST /api/v1/bulk-upload` - Upload CSV

**Custom Endpoints:**
- Add any specific to your frontend needs

### Step 5: Create Backend Services

For each endpoint, create:

1. **Pydantic Request Model**
```python
from pydantic import BaseModel

class SubmitPuzzleRequest(BaseModel):
    user_name: str
    publisher_name: str
    claimed_difficulty: str
    puzzle_grid: str
```

2. **FastAPI Route**
```python
@router.post("/puzzles/submit")
async def submit_puzzle(request: SubmitPuzzleRequest):
    # Call service
    # Return response
```

3. **Service Layer**
```python
class PuzzleService:
    async def analyze_puzzle(self, request):
        # Business logic
        # Call solver
        # Store in DB
        # Return result
```

---

## PHASE 3: FRONTEND-BACKEND INTEGRATION

### Step 6: Create API Client (TypeScript)

```typescript
// api/client.ts

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export const puzzleAPI = {
  submitPuzzle: async (data: SubmitPuzzleRequest) => {
    const response = await fetch(`${API_URL}/puzzles/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
    
    return response.json();
  },
  
  getPuzzle: async (id: number) => {
    const response = await fetch(`${API_URL}/puzzles/${id}`);
    if (!response.ok) throw new Error('Failed to fetch puzzle');
    return response.json();
  },
  
  listPuzzles: async (skip = 0, limit = 100) => {
    const response = await fetch(`${API_URL}/puzzles?skip=${skip}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to list puzzles');
    return response.json();
  }
};
```

### Step 7: Update Frontend Components

**Before:** Logic operators doing validation
```javascript
if (grid.length === 81 && grid.every(c => /[0-9.]/.test(c))) {
  // Valid
}
```

**After:** Call backend API
```typescript
const handleSubmit = async (formData) => {
  try {
    setLoading(true);
    const result = await puzzleAPI.submitPuzzle(formData);
    setResults(result);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Step 8: Error Handling

```typescript
// Add error boundaries
try {
  const result = await puzzleAPI.submitPuzzle(data);
} catch (error) {
  if (error.status === 400) {
    // Validation error from backend
    setValidationErrors(error.detail);
  } else if (error.status === 500) {
    // Server error
    setError('Server error - please try again');
  }
}
```

---

## PHASE 4: TESTING & VALIDATION

### Step 9: Test Endpoints

```bash
# Test endpoint with curl
curl -X POST http://localhost:8000/api/v1/puzzles/submit \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "test_user",
    "publisher_name": "NYT",
    "claimed_difficulty": "Medium",
    "puzzle_grid": "53..7....6..195....98....6.8...6.34......8.......9.6...7.26.95.3......4..8..7......"
  }'
```

### Step 10: Frontend Testing

Test in React:
1. Form submission → API call
2. Loading state during request
3. Display results on success
4. Show error on failure
5. Handle edge cases

---

## WORKFLOW: Implementation Steps

1. **Paste your frontend code** in the next message
2. **I'll analyze it** and identify integration points
3. **Create matching Python backend** for each frontend interaction
4. **Generate TypeScript API client** code
5. **Update your frontend** to use API instead of local logic
6. **Test end-to-end** and fix integration issues
7. **Deploy together** (frontend + backend)

---

## IMPORTANT NOTES

### Architecture Reference

Reference these documents while integrating:
- `PRODUCTION_ARCHITECTURE.md` - Database schema, API design
- `IMPLEMENTATION_GUIDE.md` - Backend structure
- `END_TO_END_WORKFLOW.md` - Complete flow examples

### Keep This Separation

**Frontend (React/TypeScript):**
- ✅ Grid input/display
- ✅ Form handling
- ✅ Visualizations
- ✅ User interactions
- ❌ Sudoku solving
- ❌ Validation logic
- ❌ Database access

**Backend (Python/FastAPI):**
- ✅ Sudoku validation
- ✅ Puzzle solving
- ✅ Difficulty scoring
- ✅ Database operations
- ✅ Analytics calculations
- ✅ Error handling

### API Communication Only

Frontend talks to backend ONLY through:
- REST API endpoints
- JSON request/response
- No direct database access
- No direct file system access
- No shared state files

---

## YOUR NEXT MESSAGE

Please provide:

1. **Your frontend code** (paste or describe structure)
2. **Main components** you have
3. **Current logic operators** you want to move to backend
4. **Expected API responses** you want to receive
5. **Any custom features** beyond the standard platform

Then I'll:
- [ ] Analyze your code
- [ ] Identify backend needs
- [ ] Create matching Python services
- [ ] Generate API client code
- [ ] Update your components
- [ ] Guide integration testing

---

## QUICK INTEGRATION CHECKLIST

After we're done, you'll have:

- [ ] Frontend communicates with backend API
- [ ] All business logic in Python
- [ ] Proper error handling
- [ ] Loading states
- [ ] Type-safe API calls (TypeScript)
- [ ] Data validation (Pydantic)
- [ ] Results displayed correctly
- [ ] Tests passing
- [ ] Ready to deploy

---

**Let's integrate this! Share your frontend code in the next message.** 🚀
