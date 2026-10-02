import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../Admin.css";

const API_URL = "http://127.0.0.1:8000";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState([
    {
      title: "Total Jobs",
      value: "0",
      change: "Live",
      icon: BriefcaseBusiness,
      color: "blue",
    },
    {
      title: "Companies",
      value: "0",
      change: "Live",
      icon: Building2,
      color: "violet",
    },
    {
      title: "Registered Users",
      value: "0",
      change: "Live",
      icon: Users,
      color: "green",
    },
    {
      title: "Applications",
      value: "0",
      change: "Live",
      icon: FileText,
      color: "orange",
    },
  ]);

  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [jobsResponse, companiesResponse, applicationsResponse] =
        await Promise.all([
          fetch(`${API_URL}/jobs/`, { headers }),
          fetch(`${API_URL}/companies/`, { headers }),
          fetch(`${API_URL}/applications/my`, { headers }),
        ]);

      if (
        jobsResponse.status === 401 ||
        companiesResponse.status === 401 ||
        applicationsResponse.status === 401
      ) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("jobai_current_user");

        navigate("/admin/login", { replace: true });
        return;
      }

      const jobsData = jobsResponse.ok
        ? await jobsResponse.json()
        : [];

      const companiesData = companiesResponse.ok
        ? await companiesResponse.json()
        : [];

      const applicationsData = applicationsResponse.ok
        ? await applicationsResponse.json()
        : [];

      const jobs = Array.isArray(jobsData)
        ? jobsData
        : jobsData.jobs || [];

      const companies = Array.isArray(companiesData)
        ? companiesData
        : companiesData.companies || [];

      const applications = Array.isArray(applicationsData)
        ? applicationsData
        : applicationsData.applications || [];

      setStats([
        {
          title: "Total Jobs",
          value: jobs.length.toLocaleString(),
          change: "Live",
          icon: BriefcaseBusiness,
          color: "blue",
        },
        {
          title: "Companies",
          value: companies.length.toLocaleString(),
          change: "Live",
          icon: Building2,
          color: "violet",
        },
        {
          title: "Registered Users",
          value: "—",
          change: "Live",
          icon: Users,
          color: "green",
        },
        {
          title: "Applications",
          value: applications.length.toLocaleString(),
          change: "Live",
          icon: FileText,
          color: "orange",
        },
      ]);

      setRecentJobs(
        jobs.slice(0, 4).map((job, index) => ({
          id: job._id || job.id || index,
          title: job.title || "Untitled Job",
          company:
            job.company_name ||
            job.company ||
            "Unknown Company",
          location: job.location || "N/A",
          type:
            job.job_type ||
            job.type ||
            "N/A",
          status: job.status || "Active",
        }))
      );

      setRecentApplications(
        applications.slice(0, 4).map((application, index) => ({
          id:
            application._id ||
            application.id ||
            index,
          name:
            application.name ||
            application.user_name ||
            "Candidate",
          job:
            application.job_title ||
            application.job ||
            "Job Application",
          company:
            application.company_name ||
            application.company ||
            "Company",
          status:
            application.status ||
            "Applied",
        }))
      );
    } catch (error) {
      console.error("Admin dashboard error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("jobai_current_user");

    window.dispatchEvent(
      new Event("jobai-auth-change")
    );

    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-dashboard">

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
            className="admin-sidebar-link active"
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

          <button
            type="button"
            className="admin-logout-link"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      <main className="admin-main">

        <header className="admin-dashboard-header">

          <div>
            <div className="admin-dashboard-breadcrumb">
              <ShieldCheck size={15} />
              Admin Panel
            </div>

            <h1>Dashboard</h1>

            <p>
              Welcome back. Here's what's happening
              on JobAI today.
            </p>
          </div>

          <div className="admin-profile">

            <div className="admin-profile-avatar">
              A
            </div>

            <div>
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>

          </div>

        </header>

        <section className="admin-stats-grid">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                className={`admin-stat-card ${stat.color}`}
                key={stat.title}
              >

                <div className="admin-stat-top">

                  <div className="admin-stat-icon">
                    <Icon size={21} />
                  </div>

                  <span className="admin-stat-change">
                    {stat.change}
                  </span>

                </div>

                <div className="admin-stat-info">

                  <span>{stat.title}</span>

                  <strong>{stat.value}</strong>

                </div>

              </div>
            );
          })}

        </section>

        <section className="admin-quick-actions">

          <div className="admin-section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Manage your platform quickly.</p>
            </div>
          </div>

          <div className="admin-action-grid">

            <Link
              to="/admin/jobs"
              className="admin-action-card"
            >
              <div className="admin-action-icon">
                <BriefcaseBusiness size={20} />
              </div>

              <div>
                <strong>Add New Job</strong>
                <span>Create and publish a job.</span>
              </div>
            </Link>

            <Link
              to="/admin/companies"
              className="admin-action-card"
            >
              <div className="admin-action-icon">
                <Building2 size={20} />
              </div>

              <div>
                <strong>Add Company</strong>
                <span>Add a company profile.</span>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="admin-action-card"
            >
              <div className="admin-action-icon">
                <Users size={20} />
              </div>

              <div>
                <strong>Manage Users</strong>
                <span>View registered users.</span>
              </div>
            </Link>

          </div>

        </section>

        <div className="admin-dashboard-columns">

          <section className="admin-data-card">

            <div className="admin-data-card-header">

              <div>
                <h2>Recent Jobs</h2>
                <p>Recently added job listings.</p>
              </div>

              <Link to="/admin/jobs">
                View All
              </Link>

            </div>

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {recentJobs.length === 0 ? (
                    <tr>
                      <td colSpan="4">
                        No jobs found.
                      </td>
                    </tr>
                  ) : (
                    recentJobs.map((job) => (
                      <tr key={job.id}>

                        <td>
                          <strong>
                            {job.title}
                          </strong>

                          <span className="admin-table-subtext">
                            {job.type}
                          </span>
                        </td>

                        <td>{job.company}</td>

                        <td>{job.location}</td>

                        <td>
                          <span
                            className={`admin-status ${
                              job.status === "Active"
                                ? "success"
                                : "warning"
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>

          </section>

          <section className="admin-data-card">

            <div className="admin-data-card-header">

              <div>
                <h2>Recent Applications</h2>
                <p>Latest candidate applications.</p>
              </div>

              <Link to="/admin/applications">
                View All
              </Link>

            </div>

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan="3">
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    recentApplications.map(
                      (application) => (
                        <tr key={application.id}>

                          <td>
                            <strong>
                              {application.name}
                            </strong>

                            <span className="admin-table-subtext">
                              {application.company}
                            </span>
                          </td>

                          <td>
                            {application.job}
                          </td>

                          <td>
                            <span
                              className={`admin-status ${
                                application.status ===
                                "Shortlisted"
                                  ? "success"
                                  : application.status ===
                                    "Under Review"
                                  ? "warning"
                                  : "neutral"
                              }`}
                            >
                              {application.status}
                            </span>
                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>

        </div>

        <footer className="admin-dashboard-footer">
          <span>© 2026 JobAI Admin Panel</span>

          <span className="admin-footer-growth">
            <TrendingUp size={15} />
            Platform activity is growing
          </span>
        </footer>

      </main>

    </div>
  );
}

export default AdminDashboard;