import { useEffect, useMemo, useState } from "react";
import { Bookmark } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [jobType, setJobType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [experience, setExperience] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/jobs/`);

        if (!response.ok) {
          throw new Error("Failed to load jobs");
        }

        const data = await response.json();

        setJobs(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Load saved jobs from backend
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return;
    }

    const fetchSavedJobs = async () => {
      try {
        const response = await fetch(
          `${API_URL}/saved-jobs/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setSavedJobs(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSavedJobs();
  }, []);

  const isJobSaved = (jobId) => {
    return savedJobs.some(
      (savedJob) => savedJob.job_id === jobId
    );
  };

  const toggleSavedJob = async (job) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login to save jobs.");
      return;
    }

    const alreadySaved = isJobSaved(job.id);

    if (alreadySaved) {
      alert("Job is already saved.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/saved-jobs/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job_id: job.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Unable to save job.");
        return;
      }

      setSavedJobs((current) => [
        ...current,
        data,
      ]);
    } catch (err) {
      console.error(err);
      alert("Unable to save job.");
    }
  };

  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        job.title.toLowerCase().includes(searchText) ||
        job.company.toLowerCase().includes(searchText) ||
        job.location.toLowerCase().includes(searchText);

      const matchesJobType =
        !jobType || job.job_type === jobType;

      const matchesWorkMode =
        !workMode || job.work_mode === workMode;

      const matchesExperience =
        !experience || job.experience === experience;

      return (
        matchesSearch &&
        matchesJobType &&
        matchesWorkMode &&
        matchesExperience
      );
    });

    if (sortBy === "salary") {
      result = [...result].sort((a, b) => {
        const aSalary =
          Number(
            a.salary?.replace(/[^\d]/g, "").split("-")[0]
          ) || 0;

        const bSalary =
          Number(
            b.salary?.replace(/[^\d]/g, "").split("-")[0]
          ) || 0;

        return bSalary - aSalary;
      });
    }

    if (sortBy === "relevance") {
      result = [...result].sort((a, b) => {
        const searchText = search.toLowerCase().trim();

        if (!searchText) {
          return 0;
        }

        const aMatch = a.title
          .toLowerCase()
          .includes(searchText);

        const bMatch = b.title
          .toLowerCase()
          .includes(searchText);

        return Number(bMatch) - Number(aMatch);
      });
    }

    if (sortBy === "newest") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );
    }

    return result;
  }, [
    jobs,
    search,
    jobType,
    workMode,
    experience,
    sortBy,
  ]);

  const handleSearchChange = (value) => {
    setSearch(value);

    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSearch("");
    setJobType("");
    setWorkMode("");
    setExperience("");
    setSortBy("newest");
    setSearchParams({});
  };

  return (
    <div className="jobs-page">

      {/* Header */}
      <div className="jobs-header">
        <h1>Find Your Next Job</h1>

        <p>
          Search jobs that match your skills, experience and career goals.
        </p>
      </div>

      {/* Search */}
      <div className="jobs-search">
        <input
          type="text"
          placeholder="Search jobs, companies or locations..."
          value={search}
          onChange={(e) =>
            handleSearchChange(e.target.value)
          }
        />

        <span>🔍</span>
      </div>

      {/* Filters */}
      <div className="jobs-filters">

        <h3>Filters</h3>

        <div className="filter-group">
          <label>Job Type</label>

          <select
            value={jobType}
            onChange={(e) =>
              setJobType(e.target.value)
            }
          >
            <option value="">All Job Types</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Work Mode</label>

          <select
            value={workMode}
            onChange={(e) =>
              setWorkMode(e.target.value)
            }
          >
            <option value="">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Experience</label>

          <select
            value={experience}
            onChange={(e) =>
              setExperience(e.target.value)
            }
          >
            <option value="">Any Experience</option>
            <option value="Fresher">Fresher</option>
            <option value="1-3 Years">1-3 Years</option>
            <option value="2-4 Years">2-4 Years</option>
            <option value="3-5 Years">3-5 Years</option>
            <option value="5+ Years">5+ Years</option>
          </select>
        </div>

        <button
          type="button"
          className="clear-filters"
          onClick={clearFilters}
        >
          Clear Filters
        </button>

      </div>

      {/* Jobs Header */}
      <div className="available-jobs-header">

        <div>
          <h2>Available Jobs</h2>

          <p>
            {loading
              ? "Loading jobs..."
              : `${filteredJobs.length} jobs found`}
          </p>
        </div>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="newest">Newest</option>
          <option value="relevance">Relevance</option>
          <option value="salary">
            Salary: High to Low
          </option>
        </select>

      </div>

      {/* Loading */}
      {loading && (
        <div className="no-jobs">
          <h2>Loading Jobs...</h2>
          <p>Please wait.</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="no-jobs">
          <h2>Unable to Load Jobs</h2>
          <p>{error}</p>
        </div>
      )}

      {/* Job Cards */}
      {!loading && !error && (
        <div className="jobs-list">

          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const saved = isJobSaved(job.id);

              return (
                <div
                  className="job-card"
                  key={job.id}
                >

                  <div className="job-card-content">

                    <div className="job-card-title-row">

                      <div>
                        <h2>{job.title}</h2>
                        <h3>{job.company}</h3>
                      </div>

                      <button
                        type="button"
                        className={`job-save-button ${
                          saved ? "saved" : ""
                        }`}
                        onClick={() =>
                          toggleSavedJob(job)
                        }
                        aria-label={
                          saved
                            ? `Remove ${job.title} from saved jobs`
                            : `Save ${job.title}`
                        }
                        title={
                          saved
                            ? "Already Saved"
                            : "Save Job"
                        }
                      >
                        <Bookmark
                          size={19}
                          fill={
                            saved
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>

                    </div>

                    <div className="job-card-meta">

                      <span>
                        📍 {job.location}
                      </span>

                      <span>
                        💼 {job.job_type}
                      </span>

                      <span>
                        ⏳ {job.experience}
                      </span>

                    </div>

                    <div className="job-card-bottom">

                      <span className="work-mode">
                        {job.work_mode}
                      </span>

                      <strong>
                        {job.salary || "Salary not specified"}
                      </strong>

                    </div>

                  </div>

                  <Link
                    to={`/jobs/${job.id}`}
                    className="view-job-button"
                  >
                    View Job
                  </Link>

                </div>
              );
            })
          ) : (
            <div className="no-jobs">

              <h2>No Jobs Found</h2>

              <p>
                Try changing your search or filters.
              </p>

              <button onClick={clearFilters}>
                Clear All Filters
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default Jobs;