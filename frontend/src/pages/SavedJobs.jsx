import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  MapPin,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import "../App.css";

const API_URL = "http://127.0.0.1:8000";

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSavedJobs = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please login to view your saved jobs.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [savedResponse, jobsResponse] =
          await Promise.all([
            fetch(`${API_URL}/saved-jobs/my`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch(`${API_URL}/jobs/`),
          ]);

        if (savedResponse.status === 401) {
          throw new Error(
            "Your login session has expired. Please login again."
          );
        }

        if (!savedResponse.ok) {
          throw new Error("Failed to load saved jobs.");
        }

        if (!jobsResponse.ok) {
          throw new Error("Failed to load jobs.");
        }

        const savedData =
          await savedResponse.json();

        const jobsData =
          await jobsResponse.json();

        const savedJobDetails = savedData
          .map((savedJob) => {
            const job = jobsData.find(
              (item) => item.id === savedJob.job_id
            );

            if (!job) {
              return null;
            }

            return {
              ...job,
              savedId: savedJob.id,
              savedAt: savedJob.saved_at,
            };
          })
          .filter(Boolean);

        setSavedJobs(savedJobDetails);
        setJobs(jobsData);

      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to load saved jobs."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  // ==========================================
  // REMOVE SAVED JOB
  // ==========================================

  const removeSavedJob = async (savedJob) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login to remove saved jobs.");
      return;
    }

    if (!savedJob?.savedId) {
      alert("Saved job ID not found.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/saved-jobs/${savedJob.savedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.status === 401) {
        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to remove saved job."
        );
      }

      // Remove only from UI after successful backend deletion
      setSavedJobs((currentJobs) =>
        currentJobs.filter(
          (job) =>
            job.savedId !== savedJob.savedId
        )
      );

    } catch (err) {
      console.error(
        "Remove saved job error:",
        err
      );

      alert(
        err.message ||
          "Unable to remove saved job."
      );
    }
  };

  return (
    <div className="user-dashboard-page">

      <div className="dashboard-container">

        {/* HEADER */}

        <div className="dashboard-page-header">

          <Link
            to="/"
            className="dashboard-back-link"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          <h1>Saved Jobs</h1>

          <p>
            Jobs you've saved for later.
          </p>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="dashboard-empty-state">

            <div className="saved-jobs-empty-icon">
              <Bookmark size={34} />
            </div>

            <h3>Loading Saved Jobs...</h3>

            <p>
              Please wait while we load your saved jobs.
            </p>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="dashboard-empty-state">

            <div className="saved-jobs-empty-icon">
              <Bookmark size={34} />
            </div>

            <h3>Unable to Load Saved Jobs</h3>

            <p>{error}</p>

            <Link to="/login">
              Login Again
              <span>→</span>
            </Link>

          </div>
        )}

        {/* SUMMARY */}

        {!loading &&
          !error &&
          savedJobs.length > 0 && (
            <div className="saved-jobs-summary">

              <div className="saved-jobs-summary-icon">
                <Bookmark
                  size={20}
                  fill="currentColor"
                />
              </div>

              <div>

                <strong>
                  {savedJobs.length} Saved{" "}
                  {savedJobs.length === 1
                    ? "Job"
                    : "Jobs"}
                </strong>

                <span>
                  Your saved job opportunities
                </span>

              </div>

            </div>
          )}

        {/* SAVED JOBS */}

        {!loading &&
          !error &&
          savedJobs.length > 0 && (
            <div className="dashboard-saved-jobs-grid">

              {savedJobs.map((job) => (
                <div
                  key={job.id}
                  className="dashboard-saved-job-card"
                >

                  <div className="dashboard-saved-job-top">

                    <div className="dashboard-saved-job-icon">
                      <BriefcaseBusiness size={22} />
                    </div>

                    <button
                      type="button"
                      className="dashboard-bookmark-button saved"
                      onClick={() =>
                        removeSavedJob(job)
                      }
                      aria-label={`Remove ${job.title} from saved jobs`}
                      title="Remove from Saved Jobs"
                    >
                      <Bookmark
                        size={18}
                        fill="currentColor"
                      />
                    </button>

                  </div>

                  <h3>{job.title}</h3>

                  <p className="dashboard-saved-job-company">
                    {job.company}
                  </p>

                  <div className="dashboard-saved-job-location">

                    <MapPin size={15} />

                    {job.location}

                  </div>

                  <div className="dashboard-saved-job-tags">

                    <span>
                      {job.job_type}
                    </span>

                    <span>
                      {job.work_mode}
                    </span>

                  </div>

                  <div className="saved-job-card-actions">

                    <Link
                      to={`/jobs/${job.id}`}
                      className="dashboard-saved-job-button"
                    >
                      View Job
                    </Link>

                    <button
                      type="button"
                      className="saved-job-remove-button"
                      onClick={() =>
                        removeSavedJob(job)
                      }
                      title="Remove Saved Job"
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        {/* EMPTY STATE */}

        {!loading &&
          !error &&
          savedJobs.length === 0 && (
            <div className="dashboard-empty-state">

              <div className="saved-jobs-empty-icon">
                <Bookmark size={34} />
              </div>

              <h3>No saved jobs yet</h3>

              <p>
                Save jobs you're interested in and
                find them here.
              </p>

              <Link to="/jobs">
                <Search size={16} />
                Explore Jobs
              </Link>

            </div>
          )}

      </div>

    </div>
  );
}

export default SavedJobs;