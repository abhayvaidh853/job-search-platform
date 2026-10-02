import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import "../App.css";

function UserDashboard() {
  const navigate = useNavigate();

  const [profileCompletion, setProfileCompletion] =
    useState(75);

  const [profileName, setProfileName] =
    useState("Abhay");

  useEffect(() => {
    const loadProfileData = () => {
      const savedCompletion =
        localStorage.getItem(
          "jobai_profile_completion"
        );

      const savedProfile =
        localStorage.getItem("jobai_profile");

      if (savedCompletion !== null) {
        setProfileCompletion(
          Number(savedCompletion)
        );
      }

      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);

          if (profile.firstName) {
            setProfileName(profile.firstName);
          }
        } catch (error) {
          console.error(
            "Unable to load dashboard profile:",
            error
          );
        }
      }
    };

    loadProfileData();

    window.addEventListener(
      "storage",
      loadProfileData
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadProfileData
      );
    };
  }, []);

  /* =========================
     LOGOUT
  ========================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "jobai_current_user"
    );

    window.dispatchEvent(
      new Event("jobai-auth-change")
    );

    navigate("/login", {
      replace: true,
    });
  };

  const profileCompleted =
    profileCompletion === 100;

  const stats = [
    {
      title: "Total Applications",
      value: "12",
      icon: FileText,
      type: "blue",
    },
    {
      title: "Pending",
      value: "4",
      icon: Clock3,
      type: "orange",
    },
    {
      title: "Shortlisted",
      value: "5",
      icon: CheckCircle2,
      type: "green",
    },
    {
      title: "Hired",
      value: "1",
      icon: BriefcaseBusiness,
      type: "purple",
    },
  ];

  const applications = [
    {
      id: 1,
      job: "Frontend Developer",
      company: "TechNova Solutions",
      location: "Bengaluru, India",
      status: "Shortlisted",
      date: "Sep 24, 2026",
    },
    {
      id: 2,
      job: "UI/UX Designer",
      company: "DesignHub",
      location: "Remote",
      status: "Pending",
      date: "Sep 22, 2026",
    },
    {
      id: 3,
      job: "React Developer",
      company: "WebWorks",
      location: "Pune, India",
      status: "Interview",
      date: "Sep 20, 2026",
    },
    {
      id: 4,
      job: "Full Stack Developer",
      company: "CloudCore",
      location: "Hyderabad, India",
      status: "Rejected",
      date: "Sep 18, 2026",
    },
  ];

  const savedJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "Innovate Labs",
      location: "Mumbai, India",
      type: "Full Time",
      salary: "₹8–12 LPA",
    },
    {
      id: 2,
      title: "React Developer",
      company: "CodeCraft",
      location: "Remote",
      type: "Full Time",
      salary: "₹6–10 LPA",
    },
    {
      id: 3,
      title: "Product Designer",
      company: "DesignSphere",
      location: "Delhi, India",
      type: "Hybrid",
      salary: "₹7–11 LPA",
    },
  ];

  return (
    <div className="user-dashboard">

      {/* SIDEBAR */}

      <aside className="user-dashboard-sidebar">

        <div className="user-dashboard-brand">

          <div className="user-dashboard-logo">
            <BriefcaseBusiness size={21} />
          </div>

          <div>
            <strong>JobAI</strong>
            <span>User Dashboard</span>
          </div>

        </div>

        <nav className="user-dashboard-nav">

          <Link
            to="/dashboard"
            className="user-dashboard-nav-link active"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/jobs"
            className="user-dashboard-nav-link"
          >
            <Search size={18} />
            <span>Find Jobs</span>
          </Link>

          <Link
            to="/saved-jobs"
            className="user-dashboard-nav-link"
          >
            <Bookmark size={18} />
            <span>Saved Jobs</span>
          </Link>

          <Link
            to="/applications"
            className="user-dashboard-nav-link"
          >
            <FileText size={18} />
            <span>My Applications</span>
          </Link>

          <Link
            to="/profile"
            className="user-dashboard-nav-link"
          >
            <UserRound size={18} />
            <span>My Profile</span>
          </Link>

          <Link
            to="/settings"
            className="user-dashboard-nav-link"
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>

        </nav>

        <div className="user-dashboard-sidebar-bottom">

          <button
            type="button"
            className="user-dashboard-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="user-dashboard-main">

        {/* HEADER */}

        <header className="user-dashboard-header">

          <div>

            <div className="user-dashboard-breadcrumb">
              <LayoutDashboard size={15} />
              Dashboard
            </div>

            <h1>
              Welcome back, {profileName} 👋
            </h1>

            <p>
              Track your job applications and discover new
              opportunities.
            </p>

          </div>

          <Link
            to="/jobs"
            className="user-dashboard-find-button"
          >
            <Search size={17} />
            Find Jobs
          </Link>

        </header>

        {/* PROFILE COMPLETION */}

        <section
          className={`user-dashboard-profile-banner ${
            profileCompleted
              ? "profile-completed"
              : ""
          }`}
        >

          <div className="user-dashboard-profile-icon">

            {profileCompleted ? (
              <CheckCircle2 size={25} />
            ) : (
              <UserRound size={25} />
            )}

          </div>

          <div className="user-dashboard-profile-content">

            <div className="user-dashboard-profile-top">

              <div>

                <strong>
                  {profileCompleted
                    ? "Profile Completed"
                    : "Complete your profile"}
                </strong>

                <p>
                  {profileCompleted
                    ? "Your profile is complete. You are ready to apply for jobs."
                    : "A complete profile helps employers understand your skills and experience."}
                </p>

              </div>

              <span>
                {profileCompletion}%
              </span>

            </div>

            <div className="user-dashboard-progress">
              <span
                style={{
                  width: `${profileCompletion}%`,
                }}
              ></span>
            </div>

          </div>

          {!profileCompleted && (
            <Link
              to="/profile"
              className="user-dashboard-profile-button"
            >
              Complete Profile
            </Link>
          )}

          {profileCompleted && (
            <Link
              to="/profile"
              className="user-dashboard-profile-button"
            >
              View Profile
            </Link>
          )}

        </section>

        {/* STATS */}

        <section className="user-dashboard-stats">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                className="user-dashboard-stat-card"
                key={stat.title}
              >

                <div
                  className={`user-dashboard-stat-icon ${stat.type}`}
                >
                  <Icon size={20} />
                </div>

                <div>
                  <span>{stat.title}</span>
                  <strong>{stat.value}</strong>
                </div>

              </div>
            );
          })}

        </section>

        {/* APPLICATIONS */}

        <section className="user-dashboard-section">

          <div className="user-dashboard-section-header">

            <div>
              <h2>Recent Applications</h2>

              <p>
                Track the latest jobs you have applied for.
              </p>
            </div>

            <Link to="/applications">
              View All
            </Link>

          </div>

          <div className="user-dashboard-applications">

            {applications.map(
              (application) => (
                <div
                  className="user-dashboard-application"
                  key={application.id}
                >

                  <div className="user-dashboard-application-icon">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <div className="user-dashboard-application-info">

                    <strong>
                      {application.job}
                    </strong>

                    <span>
                      {application.company}
                    </span>

                    <small>
                      <MapPin size={13} />
                      {application.location}
                    </small>

                  </div>

                  <div className="user-dashboard-application-status">

                    <span
                      className={`dashboard-status ${application.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {application.status}
                    </span>

                    <small>
                      Applied {application.date}
                    </small>

                  </div>

                </div>
              )
            )}

          </div>

        </section>

        {/* SAVED JOBS */}

        <section className="user-dashboard-section">

          <div className="user-dashboard-section-header">

            <div>
              <h2>Saved Jobs</h2>

              <p>
                Jobs you saved for later.
              </p>
            </div>

            <Link to="/saved-jobs">
              View All
            </Link>

          </div>

          <div className="user-dashboard-saved-grid">

            {savedJobs.map((job) => (
              <div
                className="user-dashboard-saved-card"
                key={job.id}
              >

                <div className="user-dashboard-saved-top">

                  <div className="user-dashboard-saved-icon">
                    <BriefcaseBusiness size={19} />
                  </div>

                  <button
                    type="button"
                    className="user-dashboard-bookmark"
                    aria-label="Remove saved job"
                  >
                    <Bookmark size={17} />
                  </button>

                </div>

                <h3>{job.title}</h3>

                <strong className="user-dashboard-company">
                  {job.company}
                </strong>

                <div className="user-dashboard-job-meta">

                  <span>
                    <MapPin size={14} />
                    {job.location}
                  </span>

                  <span>
                    <BriefcaseBusiness size={14} />
                    {job.type}
                  </span>

                </div>

                <div className="user-dashboard-saved-footer">

                  <strong>{job.salary}</strong>

                  <Link
                    to={`/jobs/${job.id}`}
                  >
                    View Job
                  </Link>

                </div>

              </div>
            ))}

          </div>

        </section>

        {/* AI CARD */}

        <section className="user-dashboard-ai-card">

          <div className="user-dashboard-ai-icon">
            ✦
          </div>

          <div className="user-dashboard-ai-content">

            <span>
              AI JOB RECOMMENDATIONS
            </span>

            <h2>
              Find jobs that match your skills
            </h2>

            <p>
              Our AI can analyze your profile, skills and
              experience to help you discover relevant job
              opportunities.
            </p>

          </div>

          <Link
            to="/ai-recommendations"
            className="user-dashboard-ai-button"
          >
            Explore Recommendations →
          </Link>

        </section>

      </main>

    </div>
  );
}

export default UserDashboard;