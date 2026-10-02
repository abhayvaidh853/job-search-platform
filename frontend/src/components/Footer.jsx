import {
  ArrowUpRight,
  BriefcaseBusiness,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="premium-footer">

      <div className="footer-main">

        <div className="footer-container">

          {/* Brand */}
          <div className="footer-brand-column">

            <Link to="/" className="footer-brand">

              <div className="footer-brand-icon">
                <BriefcaseBusiness size={20} />
              </div>

              <div className="footer-brand-text">
                <span>Job</span>AI
              </div>

            </Link>

            <p>
              An AI-powered career platform designed to help
              job seekers discover relevant opportunities and
              build smarter career paths.
            </p>

            <div className="footer-socials">

              <a
                href="#"
                aria-label="LinkedIn"
              >
                in
              </a>

              <a
                href="#"
                aria-label="Twitter"
              >
                X
              </a>

              <a
                href="#"
                aria-label="Instagram"
              >
                ◎
              </a>

              <a
                href="#"
                aria-label="Facebook"
              >
                f
              </a>

            </div>

          </div>

          {/* Platform */}
          <div className="footer-column">

            <h3>Platform</h3>

            <Link to="/jobs">
              Find Jobs
            </Link>

            <Link to="/companies">
              Companies
            </Link>

            <Link to="/ai-job-match">
              AI Job Match
            </Link>

            <Link to="/resume-analysis">
              Resume AI
            </Link>

          </div>

          {/* Company */}
          <div className="footer-column">

            <h3>Company</h3>

            <Link to="/about">
              About JobAI
            </Link>

            <Link to="/register">
              Create Account
            </Link>

            <Link to="/login">
              Sign In
            </Link>

          </div>

          {/* AI CTA */}
          <div className="footer-ai-card">

            <div className="footer-ai-icon">
              <Sparkles size={20} />
            </div>

            <span className="footer-ai-label">
              AI CAREER TOOLS
            </span>

            <h3>
              Find opportunities
              <br />
              built around you.
            </h3>

            <p>
              Discover smarter job matches with JobAI.
            </p>

            <Link to="/ai-job-match">
              Explore AI Match
              <ArrowUpRight size={16} />
            </Link>

          </div>

        </div>

      </div>

      <div className="footer-bottom">

        <div className="footer-bottom-container">

          <span>
            © 2026 JobAI. All rights reserved.
          </span>

          <div className="footer-bottom-links">

            <a href="#">
              Privacy
            </a>

            <a href="#">
              Terms
            </a>

            <a href="#">
              Help
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;