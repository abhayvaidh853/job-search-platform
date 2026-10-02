import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

const CURRENT_USER_KEY = "jobai_current_user";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(CURRENT_USER_KEY) || "null"
      );
    } catch {
      return null;
    }
  });

  /* =========================
     AUTH STATE
  ========================== */

  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        const savedUser = JSON.parse(
          localStorage.getItem(CURRENT_USER_KEY) || "null"
        );

        setCurrentUser(savedUser);
      } catch {
        setCurrentUser(null);
      }
    };

    loadCurrentUser();

    window.addEventListener(
      "jobai-auth-change",
      loadCurrentUser
    );

    window.addEventListener(
      "storage",
      loadCurrentUser
    );

    return () => {
      window.removeEventListener(
        "jobai-auth-change",
        loadCurrentUser
      );

      window.removeEventListener(
        "storage",
        loadCurrentUser
      );
    };
  }, [location.pathname]);

  /* =========================
     SCROLL
  ========================== */

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================
     CLOSE MOBILE ON ROUTE
  ========================== */

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  /* =========================
     RESPONSIVE
  ========================== */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* =========================
     ESCAPE
  ========================== */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileOpen]);

  /* =========================
     ACTIVE ROUTE
  ========================== */

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  /* =========================
     MOBILE CLOSE
  ========================== */

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  /* =========================
     LOGOUT
  ========================== */

  const handleLogout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);

    setCurrentUser(null);
    setIsMobileOpen(false);

    window.dispatchEvent(
      new Event("jobai-auth-change")
    );

    navigate("/login");
  };

  /* =========================
     USER NAME
  ========================== */

  const userName =
    currentUser?.name?.trim()?.split(" ")[0] || "Account";

  return (
    <header
      className={`premium-navbar ${
        isScrolled ? "navbar-scrolled" : ""
      }`}
    >
      <div className="navbar-container">

        {/* =========================
            LOGO
        ========================== */}

        <Link
          to="/"
          className="premium-logo"
          aria-label="JobAI Home"
          onClick={closeMobileMenu}
        >
          <div className="premium-logo-icon">
            <BriefcaseBusiness
              size={21}
              strokeWidth={2.3}
            />
          </div>

          <div className="premium-logo-text">
            <span>Job</span>AI
          </div>
        </Link>

        {/* =========================
            DESKTOP NAVIGATION
        ========================== */}

        <nav
          className="premium-nav-links"
          aria-label="Primary navigation"
        >
          <Link
            to="/"
            className={isActive("/") ? "active" : ""}
            aria-current={
              isActive("/") ? "page" : undefined
            }
          >
            Home
          </Link>

          <Link
            to="/jobs"
            className={isActive("/jobs") ? "active" : ""}
            aria-current={
              isActive("/jobs") ? "page" : undefined
            }
          >
            Find Jobs
          </Link>

          <Link
            to="/companies"
            className={
              isActive("/companies") ? "active" : ""
            }
            aria-current={
              isActive("/companies") ? "page" : undefined
            }
          >
            Companies
          </Link>

          <Link
            to="/ai-job-match"
            className={`ai-nav-link ${
              isActive("/ai-job-match") ? "active" : ""
            }`}
            aria-current={
              isActive("/ai-job-match")
                ? "page"
                : undefined
            }
          >
            <Sparkles
              size={15}
              aria-hidden="true"
            />

            <span>AI Match</span>

            <span className="ai-nav-new">
              AI
            </span>
          </Link>

          <Link
            to="/resume-analysis"
            className={`ai-nav-link ${
              isActive("/resume-analysis")
                ? "active"
                : ""
            }`}
            aria-current={
              isActive("/resume-analysis")
                ? "page"
                : undefined
            }
          >
            <FileText
              size={15}
              aria-hidden="true"
            />

            <span>Resume AI</span>
          </Link>

          <Link
            to="/about"
            className={
              isActive("/about") ? "active" : ""
            }
            aria-current={
              isActive("/about")
                ? "page"
                : undefined
            }
          >
            About
          </Link>

          {/* DASHBOARD */}

          <Link
            to="/dashboard"
            className={`dashboard-nav-link ${
              isActive("/dashboard")
                ? "active"
                : ""
            }`}
            aria-current={
              isActive("/dashboard")
                ? "page"
                : undefined
            }
          >
            <LayoutDashboard
              size={15}
              aria-hidden="true"
            />

            <span>Dashboard</span>
          </Link>

          {/* ADMIN */}

          <Link
            to="/admin/login"
            className={`admin-nav-link ${
              isActive("/admin")
                ? "active"
                : ""
            }`}
            aria-current={
              isActive("/admin")
                ? "page"
                : undefined
            }
          >
            <ShieldCheck
              size={15}
              aria-hidden="true"
            />

            <span>Admin</span>
          </Link>
        </nav>

        {/* =========================
            DESKTOP ACTIONS
        ========================== */}

        <div className="premium-nav-actions">

          {!currentUser ? (
            <>
              <Link
                to="/login"
                className="premium-login"
              >
                <User
                  size={17}
                  aria-hidden="true"
                />

                <span>Login</span>
              </Link>

              <Link
                to="/register"
                className="premium-register"
              >
                <span>Get Started</span>

                <ChevronDown
                  size={15}
                  className="register-arrow"
                  aria-hidden="true"
                />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/profile"
                className="premium-login navbar-user-link"
              >
                <User
                  size={17}
                  aria-hidden="true"
                />

                <span>{userName}</span>
              </Link>

              <button
                type="button"
                className="premium-register navbar-logout-button"
                onClick={handleLogout}
              >
                <LogOut
                  size={15}
                  aria-hidden="true"
                />

                <span>Logout</span>
              </button>
            </>
          )}

        </div>

        {/* =========================
            MOBILE MENU BUTTON
        ========================== */}

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setIsMobileOpen(
              (previous) => !previous
            )
          }
          aria-label={
            isMobileOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isMobileOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileOpen ? (
            <X
              size={23}
              aria-hidden="true"
            />
          ) : (
            <Menu
              size={23}
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {/* =========================
          MOBILE NAVIGATION
      ========================== */}

      <div
        id="mobile-navigation"
        className={`mobile-navbar-menu ${
          isMobileOpen
            ? "mobile-menu-open"
            : ""
        }`}
        aria-hidden={!isMobileOpen}
      >
        <div className="mobile-menu-inner">

          <Link
            to="/"
            className={
              isActive("/") ? "active" : ""
            }
            aria-current={
              isActive("/")
                ? "page"
                : undefined
            }
            tabIndex={
              isMobileOpen ? 0 : -1
            }
          >
            Home
          </Link>

          <Link
            to="/jobs"
            className={
              isActive("/jobs")
                ? "active"
                : ""
            }
            aria-current={
              isActive("/jobs")
                ? "page"
                : undefined
            }
            tabIndex={
              isMobileOpen ? 0 : -1
            }
          >
            Find Jobs
          </Link>

          <Link
            to="/companies"
            className={
              isActive("/companies")
                ? "active"
                : ""
            }
            aria-current={
              isActive("/companies")
                ? "page"
                : undefined
            }
            tabIndex={
              isMobileOpen ? 0 : -1
            }
          >
            Companies
          </Link>

          <Link
            to="/ai-job-match"
            className={`mobile-ai-link ${
              isActive("/ai-job-match")
                ? "active"
                : ""
            }`}
            aria-current={
              isActive("/ai-job-match")
                ? "page"
                : undefined
            }
            tabIndex={
              isMobileOpen ? 0 : -1
            }
          >
            <Sparkles
              size={16}
              aria-hidden="true"
            />

            AI Job Match
          </Link>

          <Link
            to="/resume-analysis"
            className={`mobile-ai-link ${
              isActive("/resume-analysis")
                ? "active"
                : ""
            }`}
            aria-current={
              isActive("/resume-analysis")
                ? "page"
                : undefined
            }
            tabIndex={
              isMobileOpen ? 0 : -1
            }
          >
            <FileText
              size={16}
              aria-hidden="true"
            />

            Resume AI
          </Link>

          <Link
            to="/about"
            className={
              isActive("/about")
                ? "active"
                : ""
            }
            aria-current={
              isActive("/about")
                ? "page"
                : undefined
            }
            tabIndex={
              isMobileOpen ? 0 : -1
            }
          >
            About
          </Link>

          {/* MOBILE DASHBOARD */}

          <Link
            to="/dashboard"
            className={`mobile-dashboard-link ${
              isActive("/dashboard")
                ? "active"
                : ""
            }`}
            aria-current={
              isActive("/dashboard")
                ? "page"
                : undefined
            }
            tabIndex={
              isMobileOpen ? 0 : -1
            }
          >
            <LayoutDashboard
              size={16}
              aria-hidden="true"
            />

            Dashboard
          </Link>

          {/* MOBILE ADMIN */}

          <Link
            to="/admin/login"
            className={`mobile-admin-link ${
              isActive("/admin")
                ? "active"
                : ""
            }`}
            aria-current={
              isActive("/admin")
                ? "page"
                : undefined
            }
            tabIndex={
              isMobileOpen ? 0 : -1
            }
          >
            <ShieldCheck
              size={16}
              aria-hidden="true"
            />

            Admin Panel
          </Link>

          <div className="mobile-menu-divider"></div>

          {/* MOBILE AUTH */}

          {!currentUser ? (
            <>
              <Link
                to="/login"
                className="mobile-login"
                tabIndex={
                  isMobileOpen ? 0 : -1
                }
              >
                <User
                  size={17}
                  aria-hidden="true"
                />

                Login
              </Link>

              <Link
                to="/register"
                className="mobile-register"
                tabIndex={
                  isMobileOpen ? 0 : -1
                }
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/profile"
                className="mobile-login"
                tabIndex={
                  isMobileOpen ? 0 : -1
                }
              >
                <User
                  size={17}
                  aria-hidden="true"
                />

                {userName}
              </Link>

              <button
                type="button"
                className="mobile-register mobile-logout-button"
                onClick={handleLogout}
                tabIndex={
                  isMobileOpen ? 0 : -1
                }
              >
                <LogOut
                  size={16}
                  aria-hidden="true"
                />

                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </header>
  );
}

export default Navbar;