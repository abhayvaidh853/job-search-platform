import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

const API_URL = "http://127.0.0.1:8000";

const CURRENT_USER_KEY = "jobai_current_user";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      setToast({
        type: "error",
        message: "Please enter your email and password.",
      });

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid email or password."
        );
      }

      // Save JWT token
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // Get user information from JWT
      const tokenPayload = JSON.parse(
        atob(
          data.access_token
            .split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      const currentUser = {
        id: tokenPayload.sub,
        email: tokenPayload.email,
        role: tokenPayload.role,
      };

      localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(currentUser)
      );

      // Notify Navbar
      window.dispatchEvent(
        new Event("jobai-auth-change")
      );

      setToast({
        type: "success",
        message:
          "Login successful! Welcome back to JobAI.",
      });

      setEmail("");
      setPassword("");
      setShowPassword(false);

      setTimeout(() => {
        navigate("/");
      }, 700);

    } catch (error) {
      console.error(error);

      setToast({
        type: "error",
        message:
          error.message ||
          "Unable to login. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setToast({
      type: "info",
      message:
        "Password recovery will be available soon.",
    });
  };

  return (
    <>
      <main className="auth-premium-page">

        <div className="auth-page-grid"></div>

        <div className="auth-page-glow auth-glow-one"></div>

        <div className="auth-page-glow auth-glow-two"></div>

        <section className="auth-premium-container">

          {/* LEFT */}

          <div className="auth-premium-intro">

            <Link
              to="/"
              className="auth-brand"
            >
              <div className="auth-brand-icon">
                <BriefcaseBusiness size={21} />
              </div>

              <div className="auth-brand-text">
                <span>Job</span>AI
              </div>
            </Link>

            <div className="auth-intro-content">

              <div className="auth-ai-badge">
                <Sparkles size={15} />
                AI-Powered Career Platform
              </div>

              <h1>
                Welcome back.
                <br />

                <span>
                  Your next opportunity
                </span>

                <br />

                is waiting.
              </h1>

              <p>
                Sign in to continue discovering
                jobs, managing applications and
                getting smarter AI-powered career
                matches.
              </p>

              <div className="auth-feature-list">

                <div className="auth-feature-item">
                  <div>
                    <CheckCircle2 size={17} />
                  </div>

                  <span>
                    Personalized job
                    recommendations
                  </span>
                </div>

                <div className="auth-feature-item">
                  <div>
                    <CheckCircle2 size={17} />
                  </div>

                  <span>
                    AI-powered career matching
                  </span>
                </div>

                <div className="auth-feature-item">
                  <div>
                    <CheckCircle2 size={17} />
                  </div>

                  <span>
                    Simple application
                    management
                  </span>
                </div>

              </div>
            </div>

            <div className="auth-intro-footer">
              <span>© 2026 JobAI</span>

              <span>
                Smart careers. Better
                opportunities.
              </span>
            </div>

          </div>

          {/* RIGHT */}

          <div className="auth-form-wrapper">

            <div className="auth-form-card">

              <div className="auth-form-header">

                <span className="auth-form-label">
                  WELCOME BACK
                </span>

                <h2>
                  Sign in to your account
                </h2>

                <p>
                  Enter your details to
                  continue to JobAI.
                </p>

              </div>

              <form onSubmit={handleSubmit}>

                {/* EMAIL */}

                <div className="auth-form-group">

                  <label htmlFor="login-email">
                    Email Address
                  </label>

                  <div className="auth-input-wrapper">

                    <Mail size={18} />

                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                <div className="auth-form-group">

                  <div className="auth-label-row">

                    <label htmlFor="login-password">
                      Password
                    </label>

                    <button
                      type="button"
                      className="auth-forgot-button"
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </button>

                  </div>

                  <div className="auth-input-wrapper">

                    <LockKeyhole size={18} />

                    <input
                      id="login-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="auth-submit-button"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}

                  {!loading && (
                    <ArrowRight size={17} />
                  )}
                </button>

              </form>

              <div className="auth-divider">
                <span>OR</span>
              </div>

              <div className="auth-register-prompt">

                <span>
                  Don't have an account?
                </span>

                <Link to="/register">
                  Create an account
                  <ArrowRight size={15} />
                </Link>

              </div>

            </div>

          </div>

        </section>

      </main>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default Login;