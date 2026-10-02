import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "../Admin.css";

const API_URL = "http://127.0.0.1:8000";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const saveAdminLogin = (token) => {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.role !== "admin") {
      throw new Error(
        "Admin access required. This Google account is not an admin."
      );
    }

    localStorage.setItem("access_token", token);

    localStorage.setItem(
      "jobai_current_user",
      JSON.stringify({
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      })
    );

    window.dispatchEvent(new Event("jobai-auth-change"));

    navigate("/admin/dashboard", {
      replace: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid email or password."
        );
      }

      saveAdminLogin(data.access_token);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      setError("");

      if (!credentialResponse.credential) {
        throw new Error("Google login failed. Please try again.");
      }

      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Google login failed."
        );
      }

      saveAdminLogin(data.access_token);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-login-brand">
          <div className="admin-login-logo">
            J
          </div>

          <div>
            <h1>JobAI</h1>
            <span>Admin Panel</span>
          </div>
        </div>

        <div className="admin-login-heading">
          <h2>Welcome Back</h2>

          <p>
            Sign in to manage jobs, companies and
            platform activity.
          </p>
        </div>

        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="admin-login-form"
        >

          <div className="admin-input-group">
            <label htmlFor="admin-email">
              Admin Email
            </label>

            <input
              id="admin-email"
              type="email"
              placeholder="admin@jobai.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              disabled={loading || googleLoading}
            />
          </div>

          <div className="admin-input-group">
            <label htmlFor="admin-password">
              Password
            </label>

            <div className="admin-password-wrapper">

              <input
                id="admin-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                disabled={loading || googleLoading}
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={loading || googleLoading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>

            </div>
          </div>

          <div className="admin-login-options">

            <label className="admin-remember">
              <input
                type="checkbox"
                disabled={loading || googleLoading}
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="admin-forgot"
              onClick={() =>
                alert(
                  "Please contact the platform administrator to reset your password."
                )
              }
              disabled={loading || googleLoading}
            >
              Forgot Password?
            </button>

          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading || googleLoading}
          >
            {loading
              ? "Signing In..."
              : "Sign In to Admin Panel"}

            {!loading && <span>→</span>}
          </button>

        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "22px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#e5e7eb",
            }}
          />

          <span
            style={{
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            OR
          </span>

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#e5e7eb",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            minHeight: "40px",
          }}
        >
          {googleLoading ? (
            <span
              style={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Signing in with Google...
            </span>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setError(
                  "Google login failed. Please try again."
                )
              }
              useOneTap={false}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
            />
          )}
        </div>

        <div className="admin-login-footer">
          <Link to="/">
            ← Back to JobAI
          </Link>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;