import React from "react";
import Login from "./pages/login.jsx";
import Upload from "./pages/upload.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";

function App() {
  return (
    <>
      <div className="title-container"></div>
      <Router>
        <Routes>
          <Route path="/tallygo/" element={<Login />} />
          <Route path="tallygo/upload" element={<Upload />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
