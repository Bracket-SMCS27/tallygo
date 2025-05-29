import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../App.css";
import "./login.css";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
        const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Invalid username or password');
        }

        const data = await response.json();
        // Assuming the server sends back a token
        localStorage.setItem('authToken', data.token);

        // Redirect to dashboard or homepage
        window.location.href = '/dashboard';
    } catch (error) {
        alert(error.message);
    }
    if (username.trim() && password.trim()) {
      localStorage.setItem("tallygo_logged_in", "true");
      if (onLogin) onLogin();
      navigate("/tallygo/upload");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1 className="login-title">Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
