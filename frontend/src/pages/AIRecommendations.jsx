import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  MapPin,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";

import "../App.css";

const API_URL = "http://127.0.0.1:8000";

function AIRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [filename, setFilename] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError(
          "Please login to view your AI job recommendations."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/ai/recommendations/`,
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
              "Unable to load AI recommendations."
          );
        }

        setRecommendations(
          data.recommendations || []
        );

        setFilename(data.filename || "");

      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to load AI recommendations."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="user-dashboard-page">
      <div className="dashboard-container">

        {/* Header */}
        <div className="dashboard-page-header">

          <Link
            to="/dashboard"
            className="dashboard-back-link"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="dashboard-ai-title">

            <div className="dashboard-ai-title-icon">
              <Sparkles size={22} />
            </div>

            <div>
              <h1>AI Job Recommendations</h1>

              <p>
                Jobs matched to your uploaded resume and
                skills.
              </p>
            </div>

          </div>

        </div>

        {/* Error */}
        {!loading && error && (
          <div className="ai-error-message">

            <XCircle size={17} />

            <span>{error}</span>

            {!localStorage.getItem("access_token") && (
              <Link to="/login">
                Login
              </Link>
            )}

          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="dashboard-empty-state">

            <div className="saved-jobs-empty-icon">
              <Sparkles size={34} />
            </div>

            <h3>
              AI is analyzing your resume...
            </h3>

            <p>
              Finding jobs that match your skills.
            </p>

          </div>
        )}

        {/* Results */}
        {!loading &&
          !error &&
          recommendations.length > 0 && (
            <>

              {/* AI Info */}
              <div className="dashboard-ai-info-card">

                <div>
                  <Sparkles size={20} />
                </div>

                <div>

                  <strong>
                    AI Match Analysis
                  </strong>

                  <p>
                    Recommendations are ranked using the
                    skills detected in your uploaded resume.
                    {filename && (
                      <>
                        {" "}
                        Resume: <strong>{filename}</strong>
                      </>
                    )}
                  </p>

                </div>

              </div>

              {/* Summary */}
              <div className="ai-recommendation-summary">

                <Sparkles size={17} />

                <span>
                  {recommendations.length}{" "}
                  {recommendations.length === 1
                    ? "job"
                    : "jobs"}{" "}
                  matched to your resume
                </span>

              </div>

              {/* Jobs */}
              <div className="dashboard-recommendations-grid">

                {recommendations.map((job) => (

                  <div
                    key={job.job_id}
                    className="dashboard-recommendation-card"
                  >

                    <div className="dashboard-recommendation-top">

                      <div className="dashboard-recommendation-icon">
                        <BriefcaseBusiness size={21} />
                      </div>

                      <span className="dashboard-match-badge">
                        <TrendingUp size={14} />
                        {job.match_score}% Match
                      </span>

                    </div>

                    <h3>
                      {job.title}
                    </h3>

                    <p className="dashboard-recommendation-company">
                      {job.company}
                    </p>

                    <div className="dashboard-recommendation-location">

                      <MapPin size={15} />

                      {job.location}

                    </div>

                    <div className="ai-job-meta">

                      {job.job_type && (
                        <span>
                          <BriefcaseBusiness size={14} />
                          {job.job_type}
                        </span>
                      )}

                      {job.work_mode && (
                        <span>
                          {job.work_mode}
                        </span>
                      )}

                      {job.salary && (
                        <span>
                          <TrendingUp size={14} />
                          {job.salary}
                        </span>
                      )}

                    </div>

                    {/* Matched Skills */}
                    {job.matched_skills &&
                      job.matched_skills.length > 0 && (
                        <div className="ai-match-skills">

                          {job.matched_skills
                            .slice(0, 5)
                            .map((skill) => (
                              <span key={skill}>

                                <CheckCircle2
                                  size={13}
                                />

                                {skill}

                              </span>
                            ))}

                        </div>
                      )}

                    {/* Missing Skills */}
                    {job.missing_skills &&
                      job.missing_skills.length > 0 && (
                        <div className="ai-missing-skills">

                          Missing:{" "}

                          {job.missing_skills
                            .slice(0, 4)
                            .join(", ")}

                        </div>
                      )}

                    <Link
                      to={`/jobs/${job.job_id}`}
                      className="dashboard-recommendation-button"
                    >
                      View Job
                    </Link>

                  </div>

                ))}

              </div>

            </>
          )}

        {/* No Results */}
        {!loading &&
          !error &&
          recommendations.length === 0 && (
            <div className="ai-no-recommendations">

              <div className="ai-no-recommendations-icon">
                <Sparkles size={30} />
              </div>

              <h2>
                No Job Recommendations
              </h2>

              <p>
                Upload a resume with relevant skills to
                receive personalized AI job recommendations.
              </p>

              <Link to="/resume-analysis">
                Analyze My Resume
              </Link>

            </div>
          )}

      </div>
    </div>
  );
}

export default AIRecommendations;