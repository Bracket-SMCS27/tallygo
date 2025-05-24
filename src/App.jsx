import React, { useState } from "react";
import Login from "./pages/login.jsx";
import Upload from "./pages/upload.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("tallygo_logged_in") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("tallygo_logged_in");
    setIsLoggedIn(false);
    window.location.pathname = "/tallygo/";
  };

  return (
    <>
      <div className="title-container">
        <div className="title-text">TALLYGO</div>
        <div className="status-text">
          {isLoggedIn ? (
            <button className="logout-button" onClick={handleLogout}>
              Sign Out
            </button>
          ) : (
            "Not signed in"
          )}
        </div>
      </div>
      <Router>
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
        </Routes>
      </Router>
    </>
  );
}

export default App;
