import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  Mail,
  Search,
  Settings,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../Admin.css";

const API_URL = "http://127.0.0.1:8000";

function AdminApplications() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingApplicationId, setEditingApplicationId] =
    useState(null);

  const [editApplication, setEditApplication] = useState({
    status: "Pending",
  });

  /* =========================================================
     FETCH APPLICATIONS
  ========================================================= */

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Admin login required.");
      }

      const response = await fetch(
        `${API_URL}/applications/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load applications."
        );
      }

      setApplications(data);
    } catch (err) {
      setError(
        err.message || "Failed to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  /* =========================================================
     FILTER APPLICATIONS
  ========================================================= */

  const filteredApplications = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return applications.filter((application) => {
      const matchesSearch =
        !searchText ||
        application.applicant
          .toLowerCase()
          .includes(searchText) ||
        application.email
          .toLowerCase()
          .includes(searchText) ||
        application.job
          .toLowerCase()
          .includes(searchText) ||
        application.company
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const pendingApplications = applications.filter(
    (application) => application.status === "Pending"
  ).length;

  const shortlistedApplications = applications.filter(
    (application) => application.status === "Shortlisted"
  ).length;

  const interviewApplications = applications.filter(
    (application) => application.status === "Interview"
  ).length;

  const hiredApplications = applications.filter(
    (application) => application.status === "Hired"
  ).length;

  /* =========================================================
     VIEW APPLICATION
  ========================================================= */

  const handleViewApplication = (application) => {
    alert(
      `Application Details\n\n` +
        `Applicant: ${application.applicant}\n` +
        `Email: ${application.email}\n` +
        `Job: ${application.job}\n` +
        `Company: ${application.company}\n` +
        `Status: ${application.status}\n` +
        `Applied On: ${application.appliedOn}\n\n` +
        `Cover Letter:\n${
          application.cover_letter || "Not provided"
        }`
    );
  };

  /* =========================================================
     DELETE APPLICATION
  ========================================================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/applications/admin/${id}`,
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
          data.detail || "Failed to delete application."
        );
      }

      setApplications((currentApplications) =>
        currentApplications.filter(
          (application) => application.id !== id
        )
      );
    } catch (err) {
      alert(
        err.message || "Failed to delete application."
      );
    }
  };

  /* =========================================================
     EDIT APPLICATION
  ========================================================= */

  const handleEdit = (application) => {
    setEditingApplicationId(application.id);

    setEditApplication({
      status: application.status,
    });

    setShowEditForm(true);
  };

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  const handleUpdateApplication = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/applications/admin/${editingApplicationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: editApplication.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to update application status."
        );
      }

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === editingApplicationId
            ? {
                ...application,
                status: editApplication.status,
              }
            : application
        )
      );

      setEditingApplicationId(null);

      setEditApplication({
        status: "Pending",
      });

      setShowEditForm(false);
    } catch (err) {
      alert(
        err.message ||
          "Failed to update application status."
      );
    }
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  return (
    <div className="admin-dashboard">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

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
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/jobs"
            className="admin-sidebar-link"
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
            <Users size={18} />
            <span>Users</span>
          </Link>

          <Link
            to="/admin/applications"
            className="admin-sidebar-link active"
          >
            <FileText size={18} />
            <span>Applications</span>
          </Link>

          <Link
            to="/admin/settings"
            className="admin-sidebar-link"
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>

        </nav>

        <div className="admin-sidebar-bottom">

          <Link
            to="/admin/login"
            className="admin-logout-link"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Link>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-main">

        <header className="admin-dashboard-header">

          <div>

            <div className="admin-dashboard-breadcrumb">
              <FileText size={15} />
              Application Management
            </div>

            <h1>Manage Applications</h1>

            <p>
              Review and manage job applications
              submitted through JobAI.
            </p>

          </div>

        </header>

        {/* ===================================================
            APPLICATION STATS
        =================================================== */}

        <section className="admin-job-stats">

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon blue">
              <FileText size={19} />
            </div>

            <div>
              <span>Total Applications</span>
              <strong>{applications.length}</strong>
            </div>

          </div>

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon orange">
              <Clock3 size={19} />
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingApplications}</strong>
            </div>

          </div>

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon green">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <span>Shortlisted</span>
              <strong>
                {shortlistedApplications}
              </strong>
            </div>

          </div>

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon red">
              <Users size={19} />
            </div>

            <div>
              <span>Hired</span>
              <strong>{hiredApplications}</strong>
            </div>

          </div>

        </section>

        {/* ===================================================
            SEARCH + FILTER
        =================================================== */}

        <section className="admin-jobs-toolbar">

          <div className="admin-job-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search applicant, job or company..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
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
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Shortlisted">
                Shortlisted
              </option>

              <option value="Interview">
                Interview
              </option>

              <option value="Hired">
                Hired
              </option>

              <option value="Rejected">
                Rejected
              </option>

            </select>

          </div>

        </section>

        {/* ===================================================
            APPLICATIONS CARD
        =================================================== */}

        <section className="admin-jobs-card">

          <div className="admin-jobs-card-header">

            <div>

              <h2>All Applications</h2>

              <p>
                {filteredApplications.length} application
                {filteredApplications.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>

            {(search || statusFilter !== "All") && (
              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}

          </div>

          {loading ? (

            <div className="admin-no-jobs">

              <div className="admin-no-jobs-icon">
                <FileText size={25} />
              </div>

              <h3>Loading Applications...</h3>

              <p>
                Please wait while applications are
                being loaded.
              </p>

            </div>

          ) : error ? (

            <div className="admin-no-jobs">

              <div className="admin-no-jobs-icon">
                <FileText size={25} />
              </div>

              <h3>Unable to Load Applications</h3>

              <p>{error}</p>

              <button
                type="button"
                onClick={fetchApplications}
              >
                Try Again
              </button>

            </div>

          ) : filteredApplications.length > 0 ? (

            <div className="admin-jobs-list">

              {filteredApplications.map(
                (application) => (

                  <article
                    className="admin-job-item"
                    key={application.id}
                  >

                    <div className="admin-job-main">

                      <div className="admin-job-icon">
                        <FileText size={21} />
                      </div>

                      <div className="admin-job-info">

                        <div className="admin-job-title-row">

                          <h3>
                            {application.applicant}
                          </h3>

                          <span
                            className={`admin-job-status ${application.status
                              .toLowerCase()
                              .replace(
                                " ",
                                "-"
                              )}`}
                          >
                            {application.status}
                          </span>

                        </div>

                        <p className="admin-job-company">
                          {application.job}
                        </p>

                        <div className="admin-job-meta">

                          <span>
                            <Mail size={13} />
                            {application.email}
                          </span>

                          <span>
                            {application.company}
                          </span>

                          <strong>
                            Applied{" "}
                            {application.appliedOn}
                          </strong>

                        </div>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="admin-job-actions">

                      <button
                        type="button"
                        className="admin-job-action view"
                        title="View Application"
                        onClick={() =>
                          handleViewApplication(
                            application
                          )
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        className="admin-job-action edit"
                        title="Update Status"
                        onClick={() =>
                          handleEdit(application)
                        }
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        className="admin-job-action delete"
                        title="Delete Application"
                        onClick={() =>
                          handleDelete(
                            application.id
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </article>

                )
              )}

            </div>

          ) : (

            <div className="admin-no-jobs">

              <div className="admin-no-jobs-icon">
                <FileText size={25} />
              </div>

              <h3>
                No Applications Found
              </h3>

              <p>
                Try changing your search or filter.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>

          )}

        </section>

      </main>

      {/* =====================================================
          EDIT STATUS MODAL
      ===================================================== */}

      {showEditForm && (

        <div className="admin-modal-overlay">

          <div className="admin-job-modal">

            <div className="admin-modal-header">

              <div>

                <h2>
                  Update Application
                </h2>

                <p>
                  Change the application status.
                </p>

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() =>
                  setShowEditForm(false)
                }
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="admin-job-form"
              onSubmit={handleUpdateApplication}
            >

              <div className="admin-form-grid">

                <div className="admin-form-group full">

                  <label>
                    Application Status
                  </label>

                  <select
                    value={editApplication.status}
                    onChange={(event) =>
                      setEditApplication({
                        ...editApplication,
                        status:
                          event.target.value,
                      })
                    }
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Shortlisted">
                      Shortlisted
                    </option>

                    <option value="Interview">
                      Interview
                    </option>

                    <option value="Hired">
                      Hired
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>

                  </select>

                </div>

              </div>

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-form-cancel"
                  onClick={() =>
                    setShowEditForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-form-submit"
                >
                  <CheckCircle2 size={16} />
                  Save Status
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminApplications;