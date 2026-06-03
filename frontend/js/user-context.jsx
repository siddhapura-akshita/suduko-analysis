/* User Context Provider for email-based identification.

   Provides user state management across the application including:
   - Email identification (no password required)
   - Puzzle count tracking
   - Analytics unlock status
   - Local storage persistence
*/

const UserContext = React.createContext(null);
const MIN_FOR_ANALYTICS = 5;

function UserProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    try {
      const stored = localStorage.getItem("sdv-user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = React.useState(false);

  const identify = async (email) => {
    setLoading(true);
    try {
      const res = await fetch(`${window.API_BASE_URL}/api/user/identify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to identify user");
      }
      const data = await res.json();
      setUser(data);
      localStorage.setItem("sdv-user", JSON.stringify(data));
      return data;
    } catch (err) {
      console.error("User identification failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sdv-user");
  };

  const updatePuzzleCount = (count) => {
    if (!user) return;
    const updated = {
      ...user,
      puzzleCount: count,
      analyticsUnlocked: count >= MIN_FOR_ANALYTICS
    };
    setUser(updated);
    localStorage.setItem("sdv-user", JSON.stringify(updated));
  };

  const value = {
    user,
    loading,
    identify,
    logout,
    updatePuzzleCount,
    isAuthenticated: !!user,
    analyticsUnlocked: user?.analyticsUnlocked || false,
    puzzleCount: user?.puzzleCount || 0,
  };

  return React.createElement(UserContext.Provider, { value }, children);
}

function useUser() {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Expose to window for use in other JSX files
Object.assign(window, { UserProvider, useUser, UserContext, MIN_FOR_ANALYTICS });
