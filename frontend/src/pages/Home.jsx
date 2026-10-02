import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function Home() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${API_URL}/jobs/`);

        if (!response.ok) {
          throw new Error("Failed to load jobs");
        }

        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("Failed to load jobs:", error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const elements =
        document.querySelectorAll(".reveal-on-scroll");

      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();

        if (rect.top < window.innerHeight - 80) {
          element.classList.add("revealed");
        }
      });
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const featuredJob = jobs.length > 0 ? jobs[0] : null;

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.set("search", keyword.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    const query = params.toString();

    navigate(query ? `/jobs?${query}` : "/jobs");
  };

  const handlePopularSearch = (searchTerm) => {
    setKeyword(searchTerm);
  };

  return (
    <main className="home-page">

      {/* HERO SECTION */}

      <section className="hero-premium">

        <div className="hero-grid-pattern"></div>

        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        {/* Floating Match Card */}

        <div
          className="hero-floating-card hero-floating-card-one"
          aria-hidden="true"
        >
          <div className="floating-icon">
            <TrendingUp size={18} />
          </div>

          <div>
            <strong>
              {featuredJob ? "92%" : "--"}
            </strong>

            <span>Match Found</span>
          </div>
        </div>

        {/* Floating Jobs Card */}

        <div
          className="hero-floating-card hero-floating-card-two"
          aria-hidden="true"
        >
          <div className="floating-icon purple">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <strong>
              {loadingJobs ? "..." : jobs.length}
            </strong>

            <span>Jobs Available</span>
          </div>
        </div>

        <div className="hero-container">

          {/* HERO CONTENT */}

          <div className="hero-premium-content">

            <div className="hero-badge-premium">
              <span className="hero-badge-dot"></span>

              <Sparkles size={15} />

              AI-Powered Career Platform
            </div>

            <h1 className="hero-premium-title">
              Find Work That
              <br />

              <span className="hero-gradient-text">
                Fits Your Future.
              </span>
            </h1>

            <p className="hero-premium-description">
              Discover opportunities that match your skills,
              experience and career goals with intelligent
              AI-powered job matching.
            </p>

            {/* SEARCH */}

            <form
              className={`hero-search-premium ${
                isSearchFocused ? "search-focused" : ""
              }`}
              onSubmit={handleSearch}
            >

              <div className="hero-search-field">

                <div className="hero-search-icon">
                  <Search size={20} />
                </div>

                <div className="hero-search-input-wrapper">

                  <span>
                    What are you looking for?
                  </span>

                  <input
                    type="text"
                    value={keyword}
                    onChange={(event) =>
                      setKeyword(event.target.value)
                    }
                    onFocus={() =>
                      setIsSearchFocused(true)
                    }
                    onBlur={() =>
                      setIsSearchFocused(false)
                    }
                    placeholder="Job title, skills or keywords"
                    aria-label="Job title, skills or keywords"
                  />

                </div>

              </div>

              <div className="hero-search-divider"></div>

              <div className="hero-search-field">

                <div className="hero-search-icon">
                  <MapPin size={20} />
                </div>

                <div className="hero-search-input-wrapper">

                  <span>Where?</span>

                  <input
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    onFocus={() =>
                      setIsSearchFocused(true)
                    }
                    onBlur={() =>
                      setIsSearchFocused(false)
                    }
                    placeholder="City or remote"
                    aria-label="Job location"
                  />

                </div>

              </div>

              <button
                type="submit"
                className="hero-search-button"
                aria-label="Search jobs"
              >
                <Search size={19} />

                <span>
                  Search Jobs
                </span>
              </button>

            </form>

            {/* POPULAR SEARCH */}

            <div className="hero-quick-search">

              <span>Popular:</span>

              <button
                type="button"
                onClick={() =>
                  handlePopularSearch(
                    "Frontend Developer"
                  )
                }
              >
                Frontend Developer
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePopularSearch(
                    "Python Developer"
                  )
                }
              >
                Python Developer
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePopularSearch(
                    "UI/UX Designer"
                  )
                }
              >
                UI/UX Designer
              </button>

            </div>

          </div>

          {/* HERO VISUAL */}

          <div className="hero-visual">

            <div className="hero-orbit orbit-one"></div>
            <div className="hero-orbit orbit-two"></div>

            <div className="hero-ai-card">

              <div className="ai-card-header">

                <div className="ai-card-title">

                  <div className="ai-card-icon">
                    <Sparkles size={20} />
                  </div>

                  <div>
                    <strong>
                      AI Job Match
                    </strong>

                    <span>
                      Intelligent recommendations
                    </span>
                  </div>

                </div>

                <span className="ai-live">
                  <span></span>
                  Live
                </span>

              </div>

              <div className="ai-match-main">

                <div className="match-ring">

                  <div className="match-ring-inner">

                    <strong>
                      {featuredJob ? "94%" : "--"}
                    </strong>

                    <span>
                      Match
                    </span>

                  </div>

                </div>

                <div className="match-info">

                  <span className="match-label">
                    {featuredJob
                      ? "Excellent Match"
                      : "No Match Yet"}
                  </span>

                  <h3>
                    {featuredJob
                      ? featuredJob.title
                      : "Find Your Dream Job"}
                  </h3>

                  <p>
                    {featuredJob
                      ? featuredJob.company
                      : "Explore available opportunities"}
                  </p>

                  {featuredJob && (
                    <div className="match-location">
                      <MapPin size={14} />
                      {featuredJob.location}
                    </div>
                  )}

                </div>

              </div>

              <div className="ai-skills">

                {(featuredJob &&
                featuredJob.skills &&
                featuredJob.skills.length > 0
                  ? featuredJob.skills
                  : [
                      "React",
                      "JavaScript",
                      "Python",
                      "FastAPI",
                    ]
                )
                  .slice(0, 4)
                  .map((skill, index) => (
                    <span key={`${skill}-${index}`}>
                      <CheckCircle2 size={13} />
                      {skill}
                    </span>
                  ))}

              </div>

              <button
                type="button"
                className="ai-view-button"
                onClick={() => navigate("/jobs")}
              >
                View Jobs

                <ArrowRight size={16} />
              </button>

            </div>

            {/* Mini Stats */}

            <div className="hero-mini-stat stat-one">

              <Users size={17} />

              <div>
                <strong>50K+</strong>

                <span>
                  Job Seekers
                </span>
              </div>

            </div>

            <div className="hero-mini-stat stat-two">

              <Zap size={17} />

              <div>
                <strong>AI Match</strong>

                <span>
                  Smarter Search
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* TRUST STRIP */}

        <div className="hero-trust-strip">

          <div className="hero-trust-item">
            <BriefcaseBusiness size={18} />

            <span>
              Thousands of opportunities
            </span>
          </div>

          <div className="hero-trust-item">
            <Sparkles size={18} />

            <span>
              AI-powered matching
            </span>
          </div>

          <div className="hero-trust-item">
            <CheckCircle2 size={18} />

            <span>
              Simple application process
            </span>
          </div>

        </div>

      </section>

      {/* WHY JOBAI SECTION */}

      <section className="home-preview-section reveal-on-scroll">

        <div className="home-section-heading">

          <span>WHY JOBAI</span>

          <h2>
            Your career search,
            <br />

            <span>
              made smarter.
            </span>
          </h2>

          <p>
            Everything you need to discover the right opportunity
            and move your career forward.
          </p>

        </div>

        <div className="home-preview-grid">

          <button
            type="button"
            className="home-preview-card"
            onClick={() => navigate("/jobs")}
          >

            <div className="preview-card-icon">
              <Search size={22} />
            </div>

            <h3>
              Smart Job Search
            </h3>

            <p>
              Find relevant opportunities using powerful search
              and filtering tools.
            </p>

            <ArrowRight size={19} />

          </button>

          <button
            type="button"
            className="home-preview-card"
            onClick={() => navigate("/jobs")}
          >

            <div className="preview-card-icon">
              <Sparkles size={22} />
            </div>

            <h3>
              AI Job Matching
            </h3>

            <p>
              Discover jobs based on your skills, experience
              and career preferences.
            </p>

            <ArrowRight size={19} />

          </button>

          <button
            type="button"
            className="home-preview-card"
            onClick={() => navigate("/jobs")}
          >

            <div className="preview-card-icon">
              <BriefcaseBusiness size={22} />
            </div>

            <h3>
              Easy Applications
            </h3>

            <p>
              Explore opportunities and apply through a simple
              and intuitive experience.
            </p>

            <ArrowRight size={19} />

          </button>

        </div>

      </section>

    </main>
  );
}

export default Home;