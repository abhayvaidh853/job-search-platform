import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

const API_URL = "http://127.0.0.1:8000";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanName ||
      !cleanEmail ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setToast({
        type: "error",
        message: "Please complete all required fields.",
      });

      return;
    }

    if (password.length < 6) {
      setToast({
        type: "error",
        message:
          "Password must be at least 6 characters long.",
      });

      return;
    }

    if (password !== confirmPassword) {
      setToast({
        type: "error",
        message: "Passwords do not match.",
      });

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            password: password,
            role: "user",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Registration failed."
        );
      }

      setToast({
        type: "success",
        message:
          "Account created successfully! Redirecting to login...",
      });

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setShowPassword(false);
      setShowConfirmPassword(false);

      setTimeout(() => {
        navigate("/login");
      }, 900);

    } catch (error) {
      console.error(error);

      setToast({
        type: "error",
        message:
          error.message ||
          "Unable to create account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="auth-premium-page register-premium-page">

        <div className="auth-page-grid"></div>

        <div className="auth-page-glow auth-glow-one"></div>
        <div className="auth-page-glow auth-glow-two"></div>

        <section className="auth-premium-container register-container">

          {/* LEFT INTRO */}

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
                Start Your Career Journey
              </div>

              <h1>
                Build your profile.
                <br />

                <span>
                  Discover your future.
                </span>
              </h1>

              <p>
                Create your JobAI account and
                unlock smarter job discovery,
                AI-powered matching and a simpler
                way to manage your career journey.
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
                    AI-powered resume and job
                    insights
                  </span>
                </div>

                <div className="auth-feature-item">
                  <div>
                    <CheckCircle2 size={17} />
                  </div>

                  <span>
                    One simple profile for your
                    job search
                  </span>
                </div>

              </div>

            </div>

            <div className="auth-intro-footer">

              <span>
                © 2026 JobAI
              </span>

              <span>
                Smart careers. Better
                opportunities.
              </span>

            </div>

          </div>

          {/* REGISTER FORM */}

          <div className="auth-form-wrapper">

            <div className="auth-form-card register-form-card">

              <div className="auth-form-header">

                <span className="auth-form-label">
                  GET STARTED
                </span>

                <h2>
                  Create your account
                </h2>

                <p>
                  Join JobAI and start finding
                  opportunities that fit you.
                </p>

              </div>

              <form onSubmit={handleSubmit}>

                {/* NAME */}

                <div className="auth-form-group">

                  <label htmlFor="register-name">
                    Full Name
                  </label>

                  <div className="auth-input-wrapper">

                    <User size={18} />

                    <input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="auth-form-group">

                  <label htmlFor="register-email">
                    Email Address
                  </label>

                  <div className="auth-input-wrapper">

                    <Mail size={18} />

                    <input
                      id="register-email"
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

                  <label htmlFor="register-password">
                    Password
                  </label>

                  <div className="auth-input-wrapper">

                    <LockKeyhole size={18} />

                    <input
                      id="register-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Create a password"
                      autoComplete="new-password"
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

                {/* CONFIRM PASSWORD */}

                <div className="auth-form-group">

                  <label htmlFor="register-confirm-password">
                    Confirm Password
                  </label>

                  <div className="auth-input-wrapper">

                    <LockKeyhole size={18} />

                    <input
                      id="register-confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                    />

                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* PASSWORD NOTE */}

                <div className="register-password-note">

                  <Check size={14} />

                  <span>
                    Use a strong password with
                    a mix of letters, numbers
                    and symbols.
                  </span>

                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="auth-submit-button"
                  disabled={loading}
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account"}

                  {!loading && (
                    <ArrowRight size={17} />
                  )}
                </button>

              </form>

              {/* LOGIN */}

              <div className="auth-register-prompt register-login-prompt">

                <span>
                  Already have an account?
                </span>

                <Link to="/login">
                  Sign in
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

export default Register;