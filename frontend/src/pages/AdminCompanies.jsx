import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Edit3,
  Eye,
  Filter,
  LayoutDashboard,
  LogOut,
  MapPin,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../Admin.css";

const API_URL = "http://127.0.0.1:8000";

function AdminCompanies() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [editingCompanyId, setEditingCompanyId] = useState(null);

  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const emptyCompany = {
    name: "",
    industry: "Technology",
    location: "",
    employees: "51–200",
    jobs: 0,
    status: "Active",
    description: "",
  };

  const [newCompany, setNewCompany] = useState({
    ...emptyCompany,
  });

  const [editCompany, setEditCompany] = useState({
    ...emptyCompany,
  });

  /* ================================
     LOAD COMPANIES + JOBS
  ================================= */

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access_token");

        const headers = {};

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const [companiesResponse, jobsResponse] =
          await Promise.all([
            fetch(`${API_URL}/companies/`, {
              headers,
            }),
            fetch(`${API_URL}/jobs/`, {
              headers,
            }),
          ]);

        const companiesData =
          await companiesResponse.json();

        const jobsData =
          await jobsResponse.json();

        if (!companiesResponse.ok) {
          throw new Error(
            companiesData.detail ||
              "Unable to load companies."
          );
        }

        if (!jobsResponse.ok) {
          throw new Error(
            jobsData.detail ||
              "Unable to load jobs."
          );
        }

        const jobs = Array.isArray(jobsData)
          ? jobsData
          : [];

        const formattedCompanies =
          Array.isArray(companiesData)
            ? companiesData.map((company) => {
                const companyJobs = jobs.filter(
                  (job) =>
                    job.company?.toLowerCase().trim() ===
                    company.name?.toLowerCase().trim()
                );

                return {
                  id: company.id,
                  name: company.name,
                  industry:
                    company.industry ||
                    "Technology",
                  location:
                    company.location ||
                    "Not specified",
                  employees:
                    company.company_size ||
                    "51–200",
                  jobs: companyJobs.length,
                  status: "Active",
                  description:
                    company.description ||
                    "Company profile available on JobAI.",
                };
              })
            : [];

        setCompanies(formattedCompanies);
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to load companies."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  /* ================================
     FILTER COMPANIES
  ================================= */

  const filteredCompanies = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return companies.filter((company) => {
      const matchesSearch =
        !searchText ||
        company.name
          .toLowerCase()
          .includes(searchText) ||
        company.industry
          .toLowerCase()
          .includes(searchText) ||
        company.location
          .toLowerCase()
          .includes(searchText);

      const matchesIndustry =
        industryFilter === "All" ||
        company.industry === industryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        company.status === statusFilter;

      return (
        matchesSearch &&
        matchesIndustry &&
        matchesStatus
      );
    });
  }, [
    companies,
    search,
    industryFilter,
    statusFilter,
  ]);

  /* ================================
     STATISTICS
  ================================= */

  const activeCompanies = companies.filter(
    (company) => company.status === "Active"
  ).length;

  const inactiveCompanies = companies.filter(
    (company) => company.status === "Inactive"
  ).length;

  const totalJobs = companies.reduce(
    (total, company) =>
      total + Number(company.jobs || 0),
    0
  );

  /* ================================
     DELETE COMPANY
  ================================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this company?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const token = localStorage.getItem(
        "access_token"
      );

      const response = await fetch(
        `${API_URL}/companies/${id}`,
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
            "Unable to delete company."
        );
      }

      setCompanies((currentCompanies) =>
        currentCompanies.filter(
          (company) => company.id !== id
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete company."
      );
    }
  };

  /* ================================
     ADD COMPANY
  ================================= */

  const handleAddCompany = async (event) => {
    event.preventDefault();

    if (
      !newCompany.name.trim() ||
      !newCompany.location.trim()
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem(
        "access_token"
      );

      const payload = {
        name: newCompany.name.trim(),
        description:
          newCompany.description.trim() ||
          "Company profile available on JobAI.",
        location: newCompany.location.trim(),
        website: null,
        industry: newCompany.industry,
        company_size: newCompany.employees,
      };

      const response = await fetch(
        `${API_URL}/companies/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to create company."
        );
      }

      const company = {
        id: data.id,
        name: data.name,
        industry:
          data.industry ||
          newCompany.industry,
        location:
          data.location ||
          newCompany.location,
        employees:
          data.company_size ||
          newCompany.employees,
        jobs: 0,
        status: newCompany.status,
        description:
          data.description ||
          newCompany.description ||
          "Company profile available on JobAI.",
      };

      setCompanies((currentCompanies) => [
        company,
        ...currentCompanies,
      ]);

      setNewCompany({
        ...emptyCompany,
      });

      setShowAddForm(false);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to create company."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================================
     OPEN EDIT FORM
  ================================= */

  const handleEdit = (company) => {
    setEditingCompanyId(company.id);

    setEditCompany({
      name: company.name,
      industry: company.industry,
      location: company.location,
      employees: company.employees,
      jobs: company.jobs,
      status: company.status,
      description: company.description,
    });

    setShowEditForm(true);
  };

  /* ================================
     UPDATE COMPANY
  ================================= */

  const handleUpdateCompany = async (event) => {
    event.preventDefault();

    if (
      !editCompany.name.trim() ||
      !editCompany.location.trim()
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem(
        "access_token"
      );

      const payload = {
        name: editCompany.name.trim(),
        description:
          editCompany.description.trim() ||
          "Company profile available on JobAI.",
        location: editCompany.location.trim(),
        website: null,
        industry: editCompany.industry,
        company_size: editCompany.employees,
      };

      const response = await fetch(
        `${API_URL}/companies/${editingCompanyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update company."
        );
      }

      setCompanies((currentCompanies) =>
        currentCompanies.map((company) =>
          company.id === editingCompanyId
            ? {
                ...company,
                name:
                  data.name ||
                  editCompany.name.trim(),
                industry:
                  data.industry ||
                  editCompany.industry,
                location:
                  data.location ||
                  editCompany.location.trim(),
                employees:
                  data.company_size ||
                  editCompany.employees,
                jobs: company.jobs,
                status: editCompany.status,
                description:
                  data.description ||
                  editCompany.description.trim() ||
                  "Company profile available on JobAI.",
              }
            : company
        )
      );

      setEditingCompanyId(null);

      setEditCompany({
        ...emptyCompany,
      });

      setShowEditForm(false);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to update company."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================================
     CLOSE EDIT FORM
  ================================= */

  const closeEditForm = () => {
    setEditingCompanyId(null);

    setEditCompany({
      ...emptyCompany,
    });

    setShowEditForm(false);
  };

  /* ================================
     VIEW COMPANY
  ================================= */

  const handleViewCompany = (company) => {
    alert(
      `Company Details\n\n` +
        `Company: ${company.name}\n` +
        `Industry: ${company.industry}\n` +
        `Location: ${company.location}\n` +
        `Employees: ${company.employees}\n` +
        `Jobs: ${company.jobs}\n` +
        `Status: ${company.status}`
    );
  };

  /* ================================
     CLEAR FILTERS
  ================================= */

  const clearFilters = () => {
    setSearch("");
    setIndustryFilter("All");
    setStatusFilter("All");
  };

  return (
    <div className="admin-dashboard">

      {/* ================================
          SIDEBAR
      ================================= */}

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
            className="admin-sidebar-link active"
          >
            <Building2 size={18} />
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
            className="admin-sidebar-link"
          >
            <XCircle size={18} />
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

      {/* ================================
          MAIN CONTENT
      ================================= */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-dashboard-header">

          <div>

            <div className="admin-dashboard-breadcrumb">
              <Building2 size={15} />
              Company Management
            </div>

            <h1>Manage Companies</h1>

            <p>
              Create, manage and monitor company
              profiles on JobAI.
            </p>

          </div>

          <button
            type="button"
            className="admin-add-job-button"
            onClick={() => {
              setError("");
              setShowAddForm(true);
            }}
          >
            <Plus size={17} />
            Add Company
          </button>

        </header>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fee2e2",
              color: "#b91c1c",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* ================================
            COMPANY STATS
        ================================= */}

        <section className="admin-job-stats">

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon blue">
              <Building2 size={19} />
            </div>

            <div>
              <span>Total Companies</span>
              <strong>
                {loading ? "..." : companies.length}
              </strong>
            </div>

          </div>

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon green">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <span>Active Companies</span>
              <strong>
                {loading ? "..." : activeCompanies}
              </strong>
            </div>

          </div>

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon orange">
              <XCircle size={19} />
            </div>

            <div>
              <span>Inactive Companies</span>
              <strong>
                {loading ? "..." : inactiveCompanies}
              </strong>
            </div>

          </div>

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon red">
              <BriefcaseBusiness size={19} />
            </div>

            <div>
              <span>Total Job Openings</span>
              <strong>
                {loading ? "..." : totalJobs}
              </strong>
            </div>

          </div>

        </section>

        {/* ================================
            SEARCH + FILTERS
        ================================= */}

        <section className="admin-jobs-toolbar">

          <div className="admin-job-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search companies, industries or locations..."
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
              value={industryFilter}
              onChange={(event) =>
                setIndustryFilter(event.target.value)
              }
            >
              <option value="All">
                All Industries
              </option>

              <option value="Technology">
                Technology
              </option>

              <option value="Software">
                Software
              </option>

              <option value="Design">
                Design
              </option>

              <option value="Data & Analytics">
                Data & Analytics
              </option>
            </select>

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

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

          </div>

        </section>

        {/* ================================
            COMPANY LIST
        ================================= */}

        <section className="admin-jobs-card">

          <div className="admin-jobs-card-header">

            <div>

              <h2>All Companies</h2>

              <p>
                {filteredCompanies.length} compan
                {filteredCompanies.length !== 1
                  ? "ies"
                  : "y"}{" "}
                found
              </p>

            </div>

            {(search ||
              industryFilter !== "All" ||
              statusFilter !== "All") && (
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
                <Building2 size={25} />
              </div>

              <h3>
                Loading Companies...
              </h3>

              <p>
                Please wait while companies are
                loading.
              </p>

            </div>

          ) : filteredCompanies.length > 0 ? (

            <div className="admin-jobs-list">

              {filteredCompanies.map((company) => (

                <article
                  className="admin-job-item"
                  key={company.id}
                >

                  <div className="admin-job-main">

                    <div className="admin-job-icon">
                      <Building2 size={21} />
                    </div>

                    <div className="admin-job-info">

                      <div className="admin-job-title-row">

                        <h3>
                          {company.name}
                        </h3>

                        <span
                          className={`admin-job-status ${company.status.toLowerCase()}`}
                        >
                          {company.status}
                        </span>

                      </div>

                      <p className="admin-job-company">
                        {company.industry}
                      </p>

                      <div className="admin-job-meta">

                        <span>
                          <MapPin size={13} />
                          {company.location}
                        </span>

                        <span>
                          <Users size={13} />
                          {company.employees} Employees
                        </span>

                        <strong>
                          {company.jobs} Jobs
                        </strong>

                      </div>

                      <span className="admin-job-posted">
                        {company.description}
                      </span>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="admin-job-actions">

                    <button
                      type="button"
                      className="admin-job-action view"
                      title="View Company"
                      onClick={() =>
                        handleViewCompany(company)
                      }
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      type="button"
                      className="admin-job-action edit"
                      title="Edit Company"
                      onClick={() =>
                        handleEdit(company)
                      }
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      className="admin-job-action delete"
                      title="Delete Company"
                      onClick={() =>
                        handleDelete(company.id)
                      }
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
                <Building2 size={25} />
              </div>

              <h3>
                No Companies Found
              </h3>

              <p>
                Try changing your search or filters.
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

      {/* ================================
          ADD COMPANY MODAL
      ================================= */}

      {showAddForm && (

        <div className="admin-modal-overlay">

          <div className="admin-job-modal">

            <div className="admin-modal-header">

              <div>

                <h2>
                  Add Company
                </h2>

                <p>
                  Create a new company profile.
                </p>

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() => {
                  if (!saving) {
                    setShowAddForm(false);
                  }
                }}
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="admin-job-form"
              onSubmit={handleAddCompany}
            >

              <div className="admin-form-grid">

                <div className="admin-form-group full">

                  <label>
                    Company Name
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. TechNova Solutions"
                    value={newCompany.name}
                    onChange={(event) =>
                      setNewCompany({
                        ...newCompany,
                        name: event.target.value,
                      })
                    }
                    required
                    disabled={saving}
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Industry
                  </label>

                  <select
                    value={newCompany.industry}
                    onChange={(event) =>
                      setNewCompany({
                        ...newCompany,
                        industry: event.target.value,
                      })
                    }
                    disabled={saving}
                  >
                    <option value="Technology">
                      Technology
                    </option>

                    <option value="Software">
                      Software
                    </option>

                    <option value="Design">
                      Design
                    </option>

                    <option value="Data & Analytics">
                      Data & Analytics
                    </option>
                  </select>

                </div>

                <div className="admin-form-group">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Indore, India"
                    value={newCompany.location}
                    onChange={(event) =>
                      setNewCompany({
                        ...newCompany,
                        location: event.target.value,
                      })
                    }
                    required
                    disabled={saving}
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Employees
                  </label>

                  <select
                    value={newCompany.employees}
                    onChange={(event) =>
                      setNewCompany({
                        ...newCompany,
                        employees: event.target.value,
                      })
                    }
                    disabled={saving}
                  >
                    <option value="1–50">
                      1–50
                    </option>

                    <option value="51–200">
                      51–200
                    </option>

                    <option value="201–500">
                      201–500
                    </option>

                    <option value="501–1000">
                      501–1000
                    </option>

                    <option value="1000+">
                      1000+
                    </option>
                  </select>

                </div>

                <div className="admin-form-group">

                  <label>
                    Job Openings
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newCompany.jobs}
                    onChange={(event) =>
                      setNewCompany({
                        ...newCompany,
                        jobs: event.target.value,
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
                    value={newCompany.status}
                    onChange={(event) =>
                      setNewCompany({
                        ...newCompany,
                        status: event.target.value,
                      })
                    }
                    disabled={saving}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>

                </div>

                <div className="admin-form-group full">

                  <label>
                    Description
                  </label>

                  <textarea
                    placeholder="Write a short company description..."
                    value={newCompany.description}
                    onChange={(event) =>
                      setNewCompany({
                        ...newCompany,
                        description:
                          event.target.value,
                      })
                    }
                    disabled={saving}
                  />

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
                    : "Create Company"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ================================
          EDIT COMPANY MODAL
      ================================= */}

      {showEditForm && (

        <div className="admin-modal-overlay">

          <div className="admin-job-modal">

            <div className="admin-modal-header">

              <div>

                <h2>
                  Edit Company
                </h2>

                <p>
                  Update the selected company.
                </p>

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeEditForm}
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="admin-job-form"
              onSubmit={handleUpdateCompany}
            >

              <div className="admin-form-grid">

                <div className="admin-form-group full">

                  <label>
                    Company Name
                  </label>

                  <input
                    type="text"
                    value={editCompany.name}
                    onChange={(event) =>
                      setEditCompany({
                        ...editCompany,
                        name: event.target.value,
                      })
                    }
                    required
                    disabled={saving}
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Industry
                  </label>

                  <select
                    value={editCompany.industry}
                    onChange={(event) =>
                      setEditCompany({
                        ...editCompany,
                        industry: event.target.value,
                      })
                    }
                    disabled={saving}
                  >
                    <option value="Technology">
                      Technology
                    </option>

                    <option value="Software">
                      Software
                    </option>

                    <option value="Design">
                      Design
                    </option>

                    <option value="Data & Analytics">
                      Data & Analytics
                    </option>
                  </select>

                </div>

                <div className="admin-form-group">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    value={editCompany.location}
                    onChange={(event) =>
                      setEditCompany({
                        ...editCompany,
                        location: event.target.value,
                      })
                    }
                    required
                    disabled={saving}
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Employees
                  </label>

                  <select
                    value={editCompany.employees}
                    onChange={(event) =>
                      setEditCompany({
                        ...editCompany,
                        employees: event.target.value,
                      })
                    }
                    disabled={saving}
                  >
                    <option value="1–50">
                      1–50
                    </option>

                    <option value="51–200">
                      51–200
                    </option>

                    <option value="201–500">
                      201–500
                    </option>

                    <option value="501–1000">
                      501–1000
                    </option>

                    <option value="1000+">
                      1000+
                    </option>
                  </select>

                </div>

                <div className="admin-form-group">

                  <label>
                    Job Openings
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={editCompany.jobs}
                    onChange={(event) =>
                      setEditCompany({
                        ...editCompany,
                        jobs: event.target.value,
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
                    value={editCompany.status}
                    onChange={(event) =>
                      setEditCompany({
                        ...editCompany,
                        status: event.target.value,
                      })
                    }
                    disabled={saving}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>

                </div>

                <div className="admin-form-group full">

                  <label>
                    Description
                  </label>

                  <textarea
                    value={editCompany.description}
                    onChange={(event) =>
                      setEditCompany({
                        ...editCompany,
                        description:
                          event.target.value,
                      })
                    }
                    disabled={saving}
                  />

                </div>

              </div>

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-form-cancel"
                  onClick={closeEditForm}
                  disabled={saving}
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

export default AdminCompanies;
