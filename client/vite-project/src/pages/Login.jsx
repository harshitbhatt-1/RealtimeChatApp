import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

import { useDispatch } from "react-redux";

import {
  setUserData,
  setSelectedUser,
  setOtherUserData,
} from "../redux/userSlice.js";

import { serverUrl } from "../main";

import axios from "axios";

import "./Auth.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErr("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      // Store the logged-in user
      // Supports either { user: {...} } or a direct user object.
      const loggedInUser = result.data.user ?? result.data;

      dispatch(setUserData(loggedInUser));

      // Reset previously selected chat
      dispatch(setSelectedUser(null));

      // Clear any stale user list
      dispatch(setOtherUserData([]));

      setEmail("");
      setPassword("");

      // Open the home/chat page
      navigate("/");
    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data || error.message
      );

      setErr(
        error.response?.data?.message ||
          "Login failed. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your account to continue</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>

            <div className="input-wrapper">
              <FiMail className="input-icon" />

              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>

            <div className="input-wrapper">
              <FiLock className="input-icon" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {err && <p className="auth-error">{err}</p>}

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Create One</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;