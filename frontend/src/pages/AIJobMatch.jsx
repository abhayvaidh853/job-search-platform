import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function AIJobMatch() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");

  const [matches, setMatches] = useState([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        setError("");

        const response = await fetch(
          `${API_URL}/jobs/`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load available jobs."
          );
        }

        const data = await response.json();

        setJobs(data);

        if (data.length > 0) {
          setSelectedJobId(data[0].id);
        }
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to load jobs."
        );
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  const handleAnalyze = async () => {
    const token = localStorage.getItem(
      "access_token"
    );

    if (!token) {
      setError(
        "Please login before using AI Job Matching."
      );
      return;
    }

    if (!selectedJobId) {
      setError(
        "Please select a job to analyze."
      );
      return;
    }

    try {
      setIsAnalyzing(true);
      setHasResult(false);
      setError("");

      /*
       * Backend currently provides matching
       * for one job at a time.
       *
       * We analyze every available job so the
       * user gets a complete matching list.
       */

      const matchResults = await Promise.all(
        jobs.map(async (job) => {
          const response = await fetch(
            `${API_URL}/ai/job-match/${job.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.detail ||
                "Job matching failed."
            );
          }

          return {
            ...job,
            match: data.match,
          };
        })
      );

      matchResults.sort(
        (a, b) =>
          b.match.match_score -
          a.match.match_score
      );

      setMatches(matchResults);
      setHasResult(true);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to analyze job matches."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="ai-match-page">

      {/* BACKGROUND */}

      <div className="ai-page-grid"></div>

      <div className="ai-page-glow ai-page-glow-one"></div>

      <div className="ai-page-glow ai-page-glow-two"></div>

      {/* HERO */}

      <section className="ai-match-hero">

        <div className="ai-match-hero-inner">

          <div className="ai-match-badge">

            <span className="ai-match-badge-dot"></span>

            <Sparkles size={15} />

            AI-Powered Career Matching

          </div>

          <h1>
            Find Jobs That
            <span> Match You.</span>
          </h1>

          <p>
            Our AI compares your uploaded resume with
            available jobs and calculates a skill-based
            compatibility score.
          </p>

        </div>

      </section>

      {/* ERROR */}

      {error && (
        <div className="ai-error-message">

          <XCircle size={17} />

          <span>{error}</span>

        </div>
      )}

      {/* WORKSPACE */}

      {!isAnalyzing && !hasResult && (
        <section className="ai-match-workspace">

          <div className="ai-match-container">

            {/* INPUT CARD */}

            <div className="ai-profile-card">

              <div className="ai-card-heading">

                <div className="ai-heading-icon">
                  <Target size={21} />
                </div>

                <div>

                  <h2>
                    Find Your Job Matches
                  </h2>

                  <p>
                    Select a job and compare it with
                    your uploaded resume.
                  </p>

                </div>

              </div>

              <div className="ai-form">

                <div className="ai-form-group">

                  <label>
                    Job to Analyze
                    <span>*</span>
                  </label>

                  <select
                    value={selectedJobId}
                    onChange={(event) =>
                      setSelectedJobId(
                        event.target.value
                      )
                    }
                    disabled={
                      loadingJobs ||
                      isAnalyzing
                    }
                  >

                    {loadingJobs ? (
                      <option>
                        Loading jobs...
                      </option>
                    ) : jobs.length === 0 ? (
                      <option>
                        No jobs available
                      </option>
                    ) : (
                      jobs.map((job) => (
                        <option
                          key={job.id}
                          value={job.id}
                        >
                          {job.title} —{" "}
                          {job.company}
                        </option>
                      ))
                    )}

                  </select>

                  <small>
                    Your latest uploaded resume will
                    be used automatically.
                  </small>

                </div>

                <button
                  type="button"
                  className="ai-analyze-button"
                  onClick={handleAnalyze}
                  disabled={
                    loadingJobs ||
                    !selectedJobId ||
                    jobs.length === 0
                  }
                >

                  <Sparkles size={18} />

                  Find My Best Matches

                  <ArrowRight size={17} />

                </button>

              </div>

            </div>

            {/* INTELLIGENCE CARD */}

            <div className="ai-intelligence-card">

              <div className="ai-intelligence-glow"></div>

              <div className="ai-intelligence-icon">
                <Sparkles size={25} />
              </div>

              <span className="ai-intelligence-label">
                AI INTELLIGENCE
              </span>

              <h2>
                Smarter matching.
                <br />
                Better opportunities.
              </h2>

              <p>
                JobAI compares the skills detected in
                your resume against the skills required
                by available jobs.
              </p>

              <div className="ai-process-list">

                <div className="ai-process-item">

                  <span>01</span>

                  <div>
                    <strong>
                      Read Resume
                    </strong>

                    <small>
                      Extract your skills
                    </small>
                  </div>

                </div>

                <div className="ai-process-item">

                  <span>02</span>

                  <div>
                    <strong>
                      Compare Skills
                    </strong>

                    <small>
                      Match skills with jobs
                    </small>
                  </div>

                </div>

                <div className="ai-process-item">

                  <span>03</span>

                  <div>
                    <strong>
                      Calculate Score
                    </strong>

                    <small>
                      Generate compatibility score
                    </small>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>
      )}

      {/* LOADING */}

      {isAnalyzing && (
        <section className="ai-analysis-section">

          <div className="ai-analysis-card">

            <div className="ai-analysis-animation">

              <div className="analysis-ring analysis-ring-one"></div>

              <div className="analysis-ring analysis-ring-two"></div>

              <div className="analysis-center">
                <Sparkles size={28} />
              </div>

            </div>

            <h2>
              AI is analyzing your resume
            </h2>

            <p>
              Comparing your skills with available
              opportunities...
            </p>

            <div className="analysis-progress">
              <span></span>
            </div>

          </div>

        </section>
      )}

      {/* RESULTS */}

      {hasResult &&
        !isAnalyzing &&
        matches.length > 0 && (

          <section className="ai-results-section">

            <div className="ai-results-container">

              <div className="ai-results-header">

                <div>

                  <span>
                    AI MATCH RESULTS
                  </span>

                  <h2>
                    Your recommended opportunities
                  </h2>

                  <p>
                    Jobs ranked by the skill match
                    calculated from your resume.
                  </p>

                </div>

                <div className="ai-result-summary">

                  <Sparkles size={18} />

                  <strong>
                    {matches.length}{" "}
                    {matches.length === 1
                      ? "Match"
                      : "Matches"}{" "}
                    Found
                  </strong>

                </div>

              </div>

              <div className="ai-job-results">

                {matches.map((job, index) => (

                  <article
                    className="ai-job-result-card"
                    key={job.id}
                  >

                    <div
                      className={`ai-job-company-icon ${
                        index % 2 === 1
                          ? "purple"
                          : index % 3 === 2
                          ? "blue"
                          : ""
                      }`}
                    >
                      <BriefcaseBusiness
                        size={23}
                      />
                    </div>

                    <div className="ai-job-result-main">

                      <div className="ai-job-result-top">

                        <div>

                          <h3>
                            {job.title}
                          </h3>

                          <p>
                            {job.company}
                          </p>

                        </div>

                        <div className="ai-match-score">

                          <strong>
                            {job.match.match_score}%
                          </strong>

                          <span>
                            Match
                          </span>

                        </div>

                      </div>

                      <div className="ai-job-meta">

                        <span>

                          <MapPin size={14} />

                          {job.location}

                        </span>

                        <span>

                          <BriefcaseBusiness
                            size={14}
                          />

                          {job.job_type}

                        </span>

                        {job.salary && (
                          <span>

                            <TrendingUp size={14} />

                            {job.salary}

                          </span>
                        )}

                      </div>

                      <div className="ai-match-skills">

                        {job.match.matched_skills
                          .slice(0, 5)
                          .map((skill) => (
                            <span key={skill}>

                              <CheckCircle2
                                size={13}
                              />

                              {skill}

                            </span>
                          ))}

                        {job.match
                          .matched_skills
                          .length === 0 && (
                          <span>
                            No matching skills
                            detected
                          </span>
                        )}

                      </div>

                      {job.match.missing_skills
                        .length > 0 && (
                        <div className="ai-missing-skills">

                          Missing:{" "}

                          {job.match.missing_skills
                            .slice(0, 4)
                            .join(", ")}

                        </div>
                      )}

                    </div>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="ai-job-view-button"
                    >

                      View Job

                      <ArrowRight size={16} />

                    </Link>

                  </article>

                ))}

              </div>

              <div className="resume-final-cta">

                <div>

                  <Sparkles size={20} />

                  <div>

                    <strong>
                      Want to explore more jobs?
                    </strong>

                    <span>
                      Browse all available opportunities.
                    </span>

                  </div>

                </div>

                <Link
                  to="/jobs"
                  className="ai-job-view-button"
                >
                  Browse Jobs
                  <ArrowRight size={16} />
                </Link>

              </div>

            </div>

          </section>
        )}

      {/* NO MATCH RESULTS */}

      {hasResult &&
        !isAnalyzing &&
        matches.length === 0 && (
          <section className="ai-results-section">

            <div className="ai-results-container">

              <div className="ai-results-header">

                <div>

                  <span>
                    AI MATCH RESULTS
                  </span>

                  <h2>
                    No jobs available
                  </h2>

                  <p>
                    There are currently no jobs to
                    compare with your resume.
                  </p>

                </div>

              </div>

              <Link
                to="/jobs"
                className="ai-job-view-button"
              >
                Browse Jobs
                <ArrowRight size={16} />
              </Link>

            </div>

          </section>
        )}

    </main>
  );
}

export default AIJobMatch;