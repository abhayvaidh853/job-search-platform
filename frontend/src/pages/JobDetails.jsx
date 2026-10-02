import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/jobs/${id}`
        );

        if (!response.ok) {
          throw new Error("Job not found");
        }

        const data = await response.json();

        setJob(data);
      } catch (err) {
        console.error(err);
        setError("The job you are looking for does not exist.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="job-details-page">
        <div className="job-details-container">
          <h1>Loading Job...</h1>
          <p>Please wait while we load the job details.</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-details-page">
        <div className="job-details-container">
          <h1>Job Not Found</h1>
          <p>{error}</p>

          <Link to="/jobs" className="back-button">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const responsibilities = [
    "Build and maintain high-quality applications.",
    "Work with the development team and APIs.",
    "Write clean and maintainable code.",
    "Improve application performance and usability.",
  ];

  return (
    <div className="job-details-page">
      <div className="job-details-container">

        {/* Back Button */}
        <Link to="/jobs" className="back-button">
          ← Back to Jobs
        </Link>

        {/* Job Header */}
        <div className="job-header">
          <div>
            <h1>{job.title}</h1>
            <h2>{job.company}</h2>

            <div className="job-meta">
              <span>📍 {job.location}</span>
              <span>💼 {job.job_type}</span>
              <span>⏳ {job.experience}</span>
              <span>💰 {job.salary || "Not specified"}</span>
            </div>
          </div>

          <Link
            to={`/jobs/${id}/apply`}
            className="apply-button"
          >
            Apply Now
          </Link>
        </div>

        {/* Job Description */}
        <section className="job-section">
          <h2>Job Description</h2>
          <p>{job.description}</p>
        </section>

        {/* Responsibilities */}
        <section className="job-section">
          <h2>Responsibilities</h2>

          <ul>
            {responsibilities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Required Skills */}
        <section className="job-section">
          <h2>Required Skills</h2>

          <div className="skills-list">
            {job.skills?.map((skill, index) => (
              <span
                key={index}
                className="skill-tag"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Company */}
        <section className="company-card">
          <h2>{job.company}</h2>

          <p>
            Explore more information about this company
            and its available opportunities.
          </p>

          <Link
            to="/companies"
            className="company-button"
          >
            View Company
          </Link>
        </section>

        {/* Job Summary */}
        <section className="job-summary">
          <h2>Job Summary</h2>

          <div className="summary-grid">

            <div>
              <strong>Experience</strong>
              <span>{job.experience}</span>
            </div>

            <div>
              <strong>Job Type</strong>
              <span>{job.job_type}</span>
            </div>

            <div>
              <strong>Work Mode</strong>
              <span>{job.work_mode}</span>
            </div>

            <div>
              <strong>Salary</strong>
              <span>
                {job.salary || "Not specified"}
              </span>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}

export default JobDetails;