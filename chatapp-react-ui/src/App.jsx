import React, { useEffect, useState } from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";

import {
  getCurrentUser,
  logoutUser,
} from "./services/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startupError, setStartupError] = useState("");

  // Check Django session when the app opens
  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((data) => {
        if (active) {
          setUser(data.user);
        }
      })
      .catch((error) => {
        if (!active) return;

        if (error.status === 403) {
          // Not logged in
          setUser(null);
        } else {
          setStartupError(
            "Cannot connect to the backend. Check Django server."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function signIn(nextUser) {
    setUser(nextUser);
  }

  async function signOut() {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      if (error.status === 403) {
        setUser(null);
      } else {
        window.alert("Logout failed. Please try again.");
      }
    }
  }

  if (loading) {
    return <p role="status">Checking your session...</p>;
  }

  if (startupError) {
    return (
      <main>
        <p role="alert">{startupError}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <Navigate
              to={user ? "/chat" : "/login"}
              replace
            />
          }
        />

        <Route
          path="/login"
          element={
            user
              ? <Navigate to="/chat" replace />
              : <Login onLogin={signIn} />
          }
        />

        <Route
          path="/register"
          element={
            user
              ? <Navigate to="/chat" replace />
              : <Register />
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute user={user}>
              <Chat
                user={user}
                onLogout={signOut}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}