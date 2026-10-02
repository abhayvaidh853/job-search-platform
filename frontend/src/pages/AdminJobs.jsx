import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Edit3,
  Eye,
  Filter,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../Admin.css";

const API_URL = "http://127.0.0.1:8000";

function AdminJobs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [editingJobId, setEditingJobId] = useState(null);

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const emptyJob = {
    title: "",
    company: "",
    location: "",
    type: "Full Time",
    mode: "Remote",
    experience: "",
    salary: "",
    status: "Pending",
  };

  const [newJob, setNewJob] = useState({
    ...emptyJob,
  });

  const [editJob, setEditJob] = useState({
    ...emptyJob,
  });

  /* =================================
     LOAD JOBS FROM BACKEND
  ================================== */

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/jobs/`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load jobs."
        );
      }

      const formattedJobs = data.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.job_type,
        mode: job.work_mode,
        experience: job.experience,
        salary: job.salary || "Not Disclosed",

        /*
          Current backend Job model does not have
          a status field, so newly loaded jobs are
          displayed as Active.
        */
        status: "Active",

        posted: formatPostedDate(
          job.created_at
        ),

        description: job.description || "",
        skills: job.skills || [],
      }));

      setJobs(formattedJobs);
    } catch (err) {
      console.error("Fetch jobs error:", err);

      setError(
        err.message ||
          "Unable to load jobs from server."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =================================
     FORMAT POSTED DATE
  ================================== */

  const formatPostedDate = (date) => {
    if (!date) {
      return "Recently";
    }

    const createdDate = new Date(date);
    const now = new Date();

    const difference =
      now.getTime() -
      createdDate.getTime();

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    if (hours < 1) {
      return "Just now";
    }

    if (hours === 1) {
      return "1 hour ago";
    }

    if (hours < 24) {
      return `${hours} hours ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days === 1) {
      return "1 day ago";
    }

    return `${days} days ago`;
  };

  /* =================================
     FILTER JOBS
  ================================== */

  const filteredJobs = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    return jobs.filter((job) => {
      const matchesSearch =
        !searchText ||
        job.title
          .toLowerCase()
          .includes(searchText) ||
        job.company
          .toLowerCase()
          .includes(searchText) ||
        job.location
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  /* =================================
     JOB STATISTICS
  ================================== */

  const activeJobs = jobs.filter(
    (job) => job.status === "Active"
  ).length;

  const pendingJobs = jobs.filter(
    (job) => job.status === "Pending"
  ).length;

  const closedJobs = jobs.filter(
    (job) => job.status === "Closed"
  ).length;

  /* =================================
     DELETE JOB
  ================================== */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");

      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        throw new Error(
          "Admin session expired. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/jobs/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to delete job."
        );
      }

      setJobs((currentJobs) =>
        currentJobs.filter(
          (job) => job.id !== id
        )
      );
    } catch (err) {
      console.error(
        "Delete job error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete job."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =================================
     ADD JOB
  ================================== */

  const handleAddJob = async (event) => {
    event.preventDefault();

    if (
      !newJob.title.trim() ||
      !newJob.company.trim() ||
      !newJob.location.trim()
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        throw new Error(
          "Admin session expired. Please login again."
        );
      }

      const payload = {
        title: newJob.title.trim(),
        company: newJob.company.trim(),
        location: newJob.location.trim(),
        description: "",
        job_type: newJob.type,
        work_mode: newJob.mode,
        experience:
          newJob.experience.trim() ||
          "Fresher",
        salary:
          newJob.salary.trim() ||
          "Not Disclosed",
        skills: [],
      };

      const response = await fetch(
        `${API_URL}/jobs/`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to create job."
        );
      }

      const job = {
        id: data.id,
        title: data.title,
        company: data.company,
        location: data.location,
        type: data.job_type,
        mode: data.work_mode,
        experience: data.experience,
        salary:
          data.salary ||
          "Not Disclosed",
        status: newJob.status,
        posted: "Just now",
        description:
          data.description || "",
        skills: data.skills || [],
      };

      setJobs((currentJobs) => [
        job,
        ...currentJobs,
      ]);

      setNewJob({
        ...emptyJob,
      });

      setShowAddForm(false);
    } catch (err) {
      console.error(
        "Create job error:",
        err
      );

      setError(
        err.message ||
          "Unable to create job."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =================================
     OPEN EDIT FORM
  ================================== */

  const handleEdit = (job) => {
    setEditingJobId(job.id);

    setEditJob({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      mode: job.mode,
      experience: job.experience,
      salary: job.salary,
      status: job.status,
    });

    setShowEditForm(true);
  };

  /* =================================
     SAVE EDITED JOB
  ================================== */

  const handleUpdateJob = async (event) => {
    event.preventDefault();

    if (
      !editJob.title.trim() ||
      !editJob.company.trim() ||
      !editJob.location.trim()
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        throw new Error(
          "Admin session expired. Please login again."
        );
      }

      const payload = {
        title: editJob.title.trim(),
        company: editJob.company.trim(),
        location: editJob.location.trim(),
        description: `${editJob.title.trim()} position at ${editJob.company.trim()}.`,
        job_type: editJob.type,
        work_mode: editJob.mode,
        experience:
          editJob.experience.trim() ||
          "Fresher",
        salary:
          editJob.salary.trim() ||
          "Not Disclosed",
        skills: [],
      };

      const response = await fetch(
        `${API_URL}/jobs/${editingJobId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to update job."
        );
      }

      const updatedJob = {
        id: data.id,
        title: data.title,
        company: data.company,
        location: data.location,
        type: data.job_type,
        mode: data.work_mode,
        experience: data.experience,
        salary:
          data.salary ||
          "Not Disclosed",
        status: editJob.status,
        posted: formatPostedDate(
          data.created_at
        ),
        description:
          data.description || "",
        skills: data.skills || [],
      };

      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job.id === editingJobId
            ? updatedJob
            : job
        )
      );

      setEditingJobId(null);

      setEditJob({
        ...emptyJob,
      });

      setShowEditForm(false);
    } catch (err) {
      console.error(
        "Update job error:",
        err
      );

      setError(
        err.message ||
          "Unable to update job."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =================================
     CLOSE EDIT MODAL
  ================================== */

  const closeEditForm = () => {
    setEditingJobId(null);

    setEditJob({
      ...emptyJob,
    });

    setShowEditForm(false);
  };

  /* =================================
     VIEW JOB
  ================================== */

  const handleViewJob = (job) => {
    alert(
      `Job Details\n\n${job.title}\n${job.company}\n${job.location}`
    );
  };

  return (
    <div className="admin-dashboard">

      {/* =================================
          SIDEBAR
      ================================== */}

      <aside className="admin-sidebar">

        <div className="admin-sidebar-brand">

          <div className="admin-sidebar-logo">
            <BriefcaseBusiness size={21} />
          </div>

          <div>
            <strong>JobAI</strong>
            <span>Admin Panel</span>
          </div>

        </div>

        <nav className="admin-sidebar-nav">

          <Link
            to="/admin/dashboard"
            className="admin-sidebar-link"
          >
            <BriefcaseBusiness size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/jobs"
            className="admin-sidebar-link active"
          >
            <BriefcaseBusiness size={18} />
            <span>Manage Jobs</span>
          </Link>

          <Link
            to="/admin/companies"
            className="admin-sidebar-link"
          >
            <BriefcaseBusiness size={18} />
            <span>Companies</span>
          </Link>

          <Link
            to="/admin/users"
            className="admin-sidebar-link"
          >
            <BriefcaseBusiness size={18} />
            <span>Users</span>
          </Link>

          <Link
            to="/admin/applications"
            className="admin-sidebar-link"
          >
            <BriefcaseBusiness size={18} />
            <span>Applications</span>
          </Link>

        </nav>

        <div className="admin-sidebar-bottom">

          <Link
            to="/admin/login"
            className="admin-logout-link"
          >
            <XCircle size={18} />
            <span>Logout</span>
          </Link>

        </div>

      </aside>

      {/* =================================
          MAIN CONTENT
      ================================== */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-dashboard-header">

          <div>

            <div className="admin-dashboard-breadcrumb">
              <BriefcaseBusiness size={15} />
              Job Management
            </div>

            <h1>Manage Jobs</h1>

            <p>
              Create, manage and monitor all job
              listings on JobAI.
            </p>

          </div>

          <button
            type="button"
            className="admin-add-job-button"
            onClick={() =>
              setShowAddForm(true)
            }
          >
            <Plus size={17} />
            Add New Job
          </button>

        </header>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fff1f2",
              color: "#b91c1c",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* =================================
            JOB STATISTICS
        ================================== */}

        <section className="admin-job-stats">

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon blue">
              <BriefcaseBusiness size={19} />
            </div>

            <div>
              <span>Total Jobs</span>
              <strong>
                {jobs.length}
              </strong>
            </div>

          </div>

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon green">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <span>Active Jobs</span>
              <strong>
                {activeJobs}
              </strong>
            </div>

          </div>

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon orange">
              <Filter size={19} />
            </div>

            <div>
              <span>Pending</span>
              <strong>
                {pendingJobs}
              </strong>
            </div>

          </div>

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon red">
              <XCircle size={19} />
            </div>

            <div>
              <span>Closed</span>
              <strong>
                {closedJobs}
              </strong>
            </div>

          </div>

        </section>

        {/* =================================
            SEARCH + FILTER
        ================================== */}

        <section className="admin-jobs-toolbar">

          <div className="admin-job-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search jobs, companies or locations..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}

          </div>

          <div className="admin-job-filter">

            <Filter size={16} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Closed">
                Closed
              </option>
            </select>

          </div>

        </section>

        {/* =================================
            JOB LIST
        ================================== */}

        <section className="admin-jobs-card">

          <div className="admin-jobs-card-header">

            <div>

              <h2>All Jobs</h2>

              <p>
                {loading
                  ? "Loading jobs..."
                  : `${filteredJobs.length} job${
                      filteredJobs.length !==
                      1
                        ? "s"
                        : ""
                    } found`}
              </p>

            </div>

          </div>

          {loading ? (

            <div className="admin-no-jobs">

              <div className="admin-no-jobs-icon">
                <BriefcaseBusiness
                  size={25}
                />
              </div>

              <h3>
                Loading Jobs...
              </h3>

              <p>
                Fetching jobs from the server.
              </p>

            </div>

          ) : filteredJobs.length > 0 ? (

            <div className="admin-jobs-list">

              {filteredJobs.map((job) => (

                <article
                  className="admin-job-item"
                  key={job.id}
                >

                  <div className="admin-job-main">

                    <div className="admin-job-icon">
                      <BriefcaseBusiness
                        size={21}
                      />
                    </div>

                    <div className="admin-job-info">

                      <div className="admin-job-title-row">

                        <h3>
                          {job.title}
                        </h3>

                        <span
                          className={`admin-job-status ${job.status.toLowerCase()}`}
                        >
                          {job.status}
                        </span>

                      </div>

                      <p className="admin-job-company">
                        {job.company}
                      </p>

                      <div className="admin-job-meta">

                        <span>
                          <MapPin size={13} />
                          {job.location}
                        </span>

                        <span>
                          {job.type}
                        </span>

                        <span>
                          {job.mode}
                        </span>

                        <span>
                          {job.experience}
                        </span>

                        <strong>
                          {job.salary}
                        </strong>

                      </div>

                      <span className="admin-job-posted">
                        Posted{" "}
                        {job.posted}
                      </span>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="admin-job-actions">

                    <button
                      type="button"
                      className="admin-job-action view"
                      title="View Job"
                      onClick={() =>
                        handleViewJob(
                          job
                        )
                      }
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      type="button"
                      className="admin-job-action edit"
                      title="Edit Job"
                      onClick={() =>
                        handleEdit(job)
                      }
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      className="admin-job-action delete"
                      title="Delete Job"
                      onClick={() =>
                        handleDelete(
                          job.id
                        )
                      }
                      disabled={saving}
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </article>

              ))}

            </div>

          ) : (

            <div className="admin-no-jobs">

              <div className="admin-no-jobs-icon">
                <BriefcaseBusiness
                  size={25}
                />
              </div>

              <h3>
                No Jobs Found
              </h3>

              <p>
                Try changing your search or
                status filter.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter(
                    "All"
                  );
                }}
              >
                Clear Filters
              </button>

            </div>

          )}

        </section>

      </main>

      {/* =================================
          ADD JOB MODAL
      ================================== */}

      {showAddForm && (

        <div className="admin-modal-overlay">

          <div className="admin-job-modal">

            <div className="admin-modal-header">

              <div>

                <h2>
                  Add New Job
                </h2>

                <p>
                  Create a new job listing.
                </p>

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() =>
                  setShowAddForm(false)
                }
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="admin-job-form"
              onSubmit={handleAddJob}
            >

              <div className="admin-form-grid">

                <div className="admin-form-group full">

                  <label>
                    Job Title
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Frontend Developer"
                    value={newJob.title}
                    onChange={(event) =>
                      setNewJob({
                        ...newJob,
                        title:
                          event.target.value,
                      })
                    }
                    required
                    disabled={saving}
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Company
                  </label>

                  <input
                    type="text"
                    placeholder="Company name"
                    value={newJob.company}
                    onChange={(event) =>
                      setNewJob({
                        ...newJob,
                        company:
                          event.target.value,
                      })
                    }
                    required
                    disabled={saving}
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Indore, India"
                    value={newJob.location}
                    onChange={(event) =>
                      setNewJob({
                        ...newJob,
                        location:
                          event.target.value,
                      })
                    }
                    required
                    disabled={saving}
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Job Type
                  </label>

                  <select
                    value={newJob.type}
                    onChange={(event) =>
                      setNewJob({
                        ...newJob,
                        type:
                          event.target.value,
                      })
                    }
                    disabled={saving}
                  >
                    <option>
                      Full Time
                    </option>

                    <option>
                      Part Time
                    </option>

                    <option>
                      Internship
                    </option>
                  </select>

                </div>

                <div className="admin-form-group">

                  <label>
                    Work Mode
                  </label>

                  <select
                    value={newJob.mode}
                    onChange={(event) =>
                      setNewJob({
                        ...newJob,
                        mode:
                          event.target.value,
                      })
                    }
                    disabled={saving}
                  >
                    <option>
                      Remote
                    </option>

                    <option>
                      Hybrid
                    </option>

                    <option>
                      On-site
                    </option>
                  </select>

                </div>

                <div className="admin-form-group">

                  <label>
                    Experience
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. 1–3 Years"
                    value={newJob.experience}
                    onChange={(event) =>
                      setNewJob({
                        ...newJob,
                        experience:
                          event.target.value,
                      })
                    }
                    disabled={saving}
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Salary
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. ₹5–8 LPA"
                    value={newJob.salary}
                    onChange={(event) =>
                      setNewJob({
                        ...newJob,
                        salary:
                          event.target.value,
                      })
                    }
                    disabled={saving}
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    value={newJob.status}
                    onChange={(event) =>
                      setNewJob({
                        ...newJob,
                        status:
                          event.target.value,
                      })
                    }
                    disabled={saving}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Closed">
                      Closed
                    </option>
                  </select>

                </div>

              </div>

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-form-cancel"
                  onClick={() =>
                    setShowAddForm(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-form-submit"
                  disabled={saving}
                >
                  <Plus size={16} />

                  {saving
                    ? "Creating..."
                    : "Create Job"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================
          EDIT JOB MODAL
      ================================== */}

      {showEditForm && (

        <div className="admin-modal-overlay">

          <div className="admin-job-modal">

            <div className="admin-modal-header">

              <div>

                <h2>
                  Edit Job
                </h2>

                <p>
                  Update the selected job listing.
                </p>

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeEditForm}
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="admin-job-form"
              onSubmit={handleUpdateJob}
            >

              <div className="admin-form-grid">

                <div className="admin-form-group full">

                  <label>
                    Job Title
                  </label>

                  <input
                    type="text"
                    value={editJob.title}
                    onChange={(event) =>
                      setEditJob({
                        ...editJob,
                        title:
                          event.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Company
                  </label>

                  <input
                    type="text"
                    value={editJob.company}
                    onChange={(event) =>
                      setEditJob({
                        ...editJob,
                        company:
                          event.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    value={editJob.location}
                    onChange={(event) =>
                      setEditJob({
                        ...editJob,
                        location:
                          event.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Job Type
                  </label>

                  <select
                    value={editJob.type}
                    onChange={(event) =>
                      setEditJob({
                        ...editJob,
                        type:
                          event.target.value,
                      })
                    }
                  >
                    <option>
                      Full Time
                    </option>

                    <option>
                      Part Time
                    </option>

                    <option>
                      Internship
                    </option>
                  </select>

                </div>

                <div className="admin-form-group">

                  <label>
                    Work Mode
                  </label>

                  <select
                    value={editJob.mode}
                    onChange={(event) =>
                      setEditJob({
                        ...editJob,
                        mode:
                          event.target.value,
                      })
                    }
                  >
                    <option>
                      Remote
                    </option>

                    <option>
                      Hybrid
                    </option>

                    <option>
                      On-site
                    </option>
                  </select>

                </div>

                <div className="admin-form-group">

                  <label>
                    Experience
                  </label>

                  <input
                    type="text"
                    value={editJob.experience}
                    onChange={(event) =>
                      setEditJob({
                        ...editJob,
                        experience:
                          event.target.value,
                      })
                    }
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Salary
                  </label>

                  <input
                    type="text"
                    value={editJob.salary}
                    onChange={(event) =>
                      setEditJob({
                        ...editJob,
                        salary:
                          event.target.value,
                      })
                    }
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    value={editJob.status}
                    onChange={(event) =>
                      setEditJob({
                        ...editJob,
                        status:
                          event.target.value,
                      })
                    }
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Closed">
                      Closed
                    </option>
                  </select>

                </div>

              </div>

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-form-cancel"
                  onClick={closeEditForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-form-submit"
                  disabled={saving}
                >
                  <Edit3 size={16} />
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminJobs;
