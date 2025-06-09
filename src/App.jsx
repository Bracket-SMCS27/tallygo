import React, { useState } from "react";
import Login from "./pages/login.jsx";
import Upload from "./pages/upload.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Settings from "./components/Settings.jsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("tallygo_logged_in") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("tallygo_logged_in");
    setIsLoggedIn(false);
    window.location.href = "/tallygo/";
  };

  return (
    <>
      <div className="title-container">
        <div className="title-text">TALLYGO</div>
        <div className="status-text">
          {isLoggedIn ? (
            <span className="logout-text" onClick={handleLogout}>
              Sign Out
            </span>
          ) : (
            "Not signed in"
          )}
        </div>
      </div>
      <Router>
        <ErrorBoundary>
          <Routes>
            <Route
              path="/tallygo/"
              element={<Login onLogin={() => setIsLoggedIn(true)} />}
            />
            <Route
              path="/tallygo/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tallygo/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/tallygo/" replace />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </>
  );
}

export default App;
