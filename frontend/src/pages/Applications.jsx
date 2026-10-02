import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  XCircle,
} from "lucide-react";
import "../App.css";

const API_URL = "http://127.0.0.1:8000";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please login to view your applications.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [applicationsResponse, jobsResponse] =
          await Promise.all([
            fetch(`${API_URL}/applications/my`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch(`${API_URL}/jobs/`),
          ]);

        if (applicationsResponse.status === 401) {
          throw new Error(
            "Your login session has expired. Please login again."
          );
        }

        if (!applicationsResponse.ok) {
          throw new Error("Failed to load applications.");
        }

        if (!jobsResponse.ok) {
          throw new Error("Failed to load jobs.");
        }

        const applicationsData =
          await applicationsResponse.json();

        const jobsData =
          await jobsResponse.json();

        setApplications(applicationsData);
        setJobs(jobsData);

      } catch (err) {
        console.error(err);
        setError(
          err.message ||
            "Unable to load your applications."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getJob = (jobId) => {
    return jobs.find(
      (job) => job.id === jobId
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Applied":
      case "Pending":
        return <Clock3 size={14} />;

      case "Shortlisted":
        return <CheckCircle2 size={14} />;

      case "Interview":
        return <CalendarDays size={14} />;

      case "Rejected":
        return <XCircle size={14} />;

      case "Hired":
        return <CheckCircle2 size={14} />;

      default:
        return <Clock3 size={14} />;
    }
  };

  const getStatusClass = (status) => {
    return (status || "Applied")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  return (
    <div className="user-dashboard-page">

      <div className="dashboard-container">

        {/* PAGE HEADER */}

        <div className="dashboard-page-header">

          <Link
            to="/"
            className="dashboard-back-link"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          <h1>My Applications</h1>

          <p>
            Track and manage all your job applications.
          </p>

        </div>

        {/* APPLICATION COUNT */}

        {!loading && !error && (
          <div className="applications-page-summary">

            <div className="applications-summary-icon">
              <FileText size={20} />
            </div>

            <div>

              <strong>
                {applications.length}{" "}
                {applications.length === 1
                  ? "Application"
                  : "Applications"}
              </strong>

              <span>
                Your submitted job applications
              </span>

            </div>

          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="applications-empty-state">

            <div className="applications-empty-icon">
              <Clock3 size={32} />
            </div>

            <h2>Loading Applications...</h2>

            <p>
              Please wait while we load your applications.
            </p>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="applications-empty-state">

            <div className="applications-empty-icon">
              <XCircle size={32} />
            </div>

            <h2>Unable to Load Applications</h2>

            <p>{error}</p>

            <Link
              to="/login"
              className="applications-explore-button"
            >
              Login Again
              <span>→</span>
            </Link>

          </div>
        )}

        {/* APPLICATION LIST */}

        {!loading &&
          !error &&
          applications.length > 0 && (
            <div className="dashboard-applications-list">

              {applications.map((application) => {

                const job = getJob(
                  application.job_id
                );

                return (
                  <div
                    key={application.id}
                    className="dashboard-application-card"
                  >

                    {/* ICON */}

                    <div className="dashboard-application-icon">
                      <BriefcaseBusiness size={22} />
                    </div>

                    {/* CONTENT */}

                    <div className="dashboard-application-content">

                      <div className="dashboard-application-top">

                        <div>

                          <h3>
                            {job
                              ? job.title
                              : "Job"}
                          </h3>

                          <p>
                            {job
                              ? job.company
                              : "Company information unavailable"}
                          </p>

                        </div>

                        <span
                          className={`dashboard-application-status ${getStatusClass(
                            application.status
                          )}`}
                        >
                          {getStatusIcon(
                            application.status
                          )}

                          {application.status}
                        </span>

                      </div>

                      <div className="dashboard-application-meta">

                        <span>
                          <MapPin size={14} />

                          {job
                            ? job.location
                            : "Location unavailable"}
                        </span>

                        <span>
                          <FileText size={14} />

                          Applied{" "}
                          {formatDate(
                            application.applied_at
                          )}
                        </span>

                        {job?.job_type && (
                          <span>
                            <BriefcaseBusiness
                              size={14}
                            />

                            {job.job_type}
                          </span>
                        )}

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        {/* EMPTY STATE */}

        {!loading &&
          !error &&
          applications.length === 0 && (
            <div className="applications-empty-state">

              <div className="applications-empty-icon">
                <FileText size={32} />
              </div>

              <h2>No Applications Yet</h2>

              <p>
                You haven't applied for any jobs yet.
                Start exploring jobs and submit your
                first application.
              </p>

              <Link
                to="/jobs"
                className="applications-explore-button"
              >
                Explore Jobs
                <span>→</span>
              </Link>

            </div>
          )}

      </div>

    </div>
  );
}

export default Applications;