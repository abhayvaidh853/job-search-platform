import { useEffect, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  Globe2,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  LockKeyhole,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../Admin.css";

const API_URL = "http://127.0.0.1:8000";

function AdminSettings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState({
    newApplications: true,
    newUsers: true,
    jobUpdates: true,
    emailNotifications: true,
  });

  const [platform, setPlatform] = useState({
    platformName: "JobAI",
    supportEmail: "support@jobai.com",
    defaultJobStatus: "Active",
    maintenanceMode: false,
  });

  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================================================
     GET SETTINGS
  ========================================================= */

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Admin login required.");
      }

      const response = await fetch(
        `${API_URL}/settings/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load settings."
        );
      }

      setProfile({
        name: data.profile?.name || "",
        email: data.profile?.email || "",
        phone: data.profile?.phone || "",
      });

      setNotifications({
        newApplications:
          data.notifications?.newApplications ?? true,
        newUsers:
          data.notifications?.newUsers ?? true,
        jobUpdates:
          data.notifications?.jobUpdates ?? true,
        emailNotifications:
          data.notifications?.emailNotifications ?? true,
      });

      setPlatform({
        platformName:
          data.platform?.platformName || "JobAI",
        supportEmail:
          data.platform?.supportEmail ||
          "support@jobai.com",
        defaultJobStatus:
          data.platform?.defaultJobStatus ||
          "Active",
        maintenanceMode:
          data.platform?.maintenanceMode ?? false,
      });
    } catch (err) {
      setError(
        err.message || "Failed to load settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  /* =========================================================
     SUCCESS MESSAGE
  ========================================================= */

  const showSuccessMessage = (message) => {
    setSavedMessage(message);

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (
      !profile.name.trim() ||
      !profile.email.trim() ||
      !profile.phone.trim()
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/settings/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to save profile settings."
        );
      }

      showSuccessMessage(
        "Profile settings saved successfully."
      );

      /*
       * Update current user information locally
       * so admin UI remains synchronized.
       */
      const currentUser = localStorage.getItem(
        "jobai_current_user"
      );

      if (currentUser) {
        try {
          const parsedUser = JSON.parse(currentUser);

          localStorage.setItem(
            "jobai_current_user",
            JSON.stringify({
              ...parsedUser,
              name: profile.name,
              email: profile.email,
            })
          );
        } catch {
          // Ignore invalid local storage data
        }
      }
    } catch (err) {
      alert(
        err.message ||
          "Failed to save profile settings."
      );
    }
  };

  /* =========================================================
     CHANGE PASSWORD
  ========================================================= */

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (
      !password.current ||
      !password.newPassword ||
      !password.confirm
    ) {
      alert("Please fill all password fields.");
      return;
    }

    if (password.newPassword !== password.confirm) {
      alert(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/settings/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: password.current,
            new_password: password.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to update password."
        );
      }

      showSuccessMessage(
        "Password updated successfully."
      );

      setPassword({
        current: "",
        newPassword: "",
        confirm: "",
      });
    } catch (err) {
      alert(
        err.message ||
          "Failed to update password."
      );
    }
  };

  /* =========================================================
     SAVE NOTIFICATIONS
  ========================================================= */

  const handleNotificationChange = async (
    updatedNotifications
  ) => {
    setNotifications(updatedNotifications);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/settings/notifications`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedNotifications),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to save notification settings."
        );
      }

      showSuccessMessage(
        "Notification settings saved successfully."
      );
    } catch (err) {
      alert(
        err.message ||
          "Failed to save notification settings."
      );

      fetchSettings();
    }
  };

  /* =========================================================
     SAVE PLATFORM SETTINGS
  ========================================================= */

  const handlePlatformSave = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/settings/platform`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(platform),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to save platform settings."
        );
      }

      showSuccessMessage(
        "Platform settings saved successfully."
      );
    } catch (err) {
      alert(
        err.message ||
          "Failed to save platform settings."
      );
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
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

        </aside>

        <main className="admin-main">

          <div className="admin-no-jobs">

            <div className="admin-no-jobs-icon">
              <Settings size={25} />
            </div>

            <h3>Loading Settings...</h3>

            <p>
              Please wait while admin settings are
              being loaded.
            </p>

          </div>

        </main>

      </div>
    );
  }

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
            className="admin-sidebar-link"
          >
            <ShieldCheck size={18} />
            <span>Applications</span>
          </Link>

          <Link
            to="/admin/settings"
            className="admin-sidebar-link active"
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
              <Settings size={15} />
              Administration
            </div>

            <h1>Settings</h1>

            <p>
              Manage your admin profile,
              notifications and platform settings.
            </p>

          </div>

        </header>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="admin-settings-success">
            <span>{error}</span>
          </div>
        )}

        {/* ===================================================
            SUCCESS MESSAGE
        =================================================== */}

        {savedMessage && (
          <div className="admin-settings-success">
            <CheckCircle2 size={18} />
            <span>{savedMessage}</span>
          </div>
        )}

        {/* ===================================================
            PROFILE + PASSWORD
        =================================================== */}

        <section className="admin-settings-grid">

          {/* PROFILE */}

          <div className="admin-settings-card">

            <div className="admin-settings-card-header">

              <div className="admin-settings-card-icon">
                <UserRound size={19} />
              </div>

              <div>
                <h2>Admin Profile</h2>

                <p>
                  Update your administrator information.
                </p>
              </div>

            </div>

            <form
              className="admin-settings-form"
              onSubmit={handleProfileSave}
            >

              <div className="admin-settings-field">

                <label htmlFor="admin-profile-name">
                  Full Name
                </label>

                <div className="admin-settings-input">

                  <UserRound size={16} />

                  <input
                    id="admin-profile-name"
                    type="text"
                    value={profile.name}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        name: event.target.value,
                      })
                    }
                    required
                  />

                </div>

              </div>

              <div className="admin-settings-field">

                <label htmlFor="admin-profile-email">
                  Email Address
                </label>

                <div className="admin-settings-input">

                  <Mail size={16} />

                  <input
                    id="admin-profile-email"
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        email: event.target.value,
                      })
                    }
                    required
                  />

                </div>

              </div>

              <div className="admin-settings-field">

                <label htmlFor="admin-profile-phone">
                  Phone Number
                </label>

                <div className="admin-settings-input">

                  <Phone size={16} />

                  <input
                    id="admin-profile-phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        phone: event.target.value,
                      })
                    }
                    required
                  />

                </div>

              </div>

              <button
                type="submit"
                className="admin-settings-save"
              >
                <Save size={16} />
                Save Profile
              </button>

            </form>

          </div>

          {/* PASSWORD */}

          <div className="admin-settings-card">

            <div className="admin-settings-card-header">

              <div className="admin-settings-card-icon security">
                <LockKeyhole size={19} />
              </div>

              <div>
                <h2>Change Password</h2>

                <p>
                  Keep your admin account secure.
                </p>
              </div>

            </div>

            <form
              className="admin-settings-form"
              onSubmit={handlePasswordChange}
            >

              <div className="admin-settings-field">

                <label htmlFor="current-password">
                  Current Password
                </label>

                <div className="admin-settings-input">

                  <input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                    value={password.current}
                    onChange={(event) =>
                      setPassword({
                        ...password,
                        current: event.target.value,
                      })
                    }
                  />

                </div>

              </div>

              <div className="admin-settings-field">

                <label htmlFor="new-password">
                  New Password
                </label>

                <div className="admin-settings-input">

                  <input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={password.newPassword}
                    onChange={(event) =>
                      setPassword({
                        ...password,
                        newPassword:
                          event.target.value,
                      })
                    }
                  />

                </div>

              </div>

              <div className="admin-settings-field">

                <label htmlFor="confirm-password">
                  Confirm Password
                </label>

                <div className="admin-settings-input">

                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={password.confirm}
                    onChange={(event) =>
                      setPassword({
                        ...password,
                        confirm:
                          event.target.value,
                      })
                    }
                  />

                </div>

              </div>

              <button
                type="submit"
                className="admin-settings-save"
              >
                <LockKeyhole size={16} />
                Update Password
              </button>

            </form>

          </div>

        </section>

        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}

        <section className="admin-settings-card admin-settings-full-card">

          <div className="admin-settings-card-header">

            <div className="admin-settings-card-icon notification">
              <Bell size={19} />
            </div>

            <div>
              <h2>Notification Settings</h2>

              <p>
                Choose which platform notifications
                you want to receive.
              </p>
            </div>

          </div>

          <div className="admin-settings-options">

            <label className="admin-setting-toggle">

              <div>

                <strong>
                  New Applications
                </strong>

                <span>
                  Get notified when someone applies
                  for a job.
                </span>

              </div>

              <input
                type="checkbox"
                checked={notifications.newApplications}
                onChange={(event) =>
                  handleNotificationChange({
                    ...notifications,
                    newApplications:
                      event.target.checked,
                  })
                }
              />

              <span className="admin-toggle-slider"></span>

            </label>

            <label className="admin-setting-toggle">

              <div>

                <strong>
                  New Users
                </strong>

                <span>
                  Receive notifications when a new
                  user registers.
                </span>

              </div>

              <input
                type="checkbox"
                checked={notifications.newUsers}
                onChange={(event) =>
                  handleNotificationChange({
                    ...notifications,
                    newUsers:
                      event.target.checked,
                  })
                }
              />

              <span className="admin-toggle-slider"></span>

            </label>

            <label className="admin-setting-toggle">

              <div>

                <strong>
                  Job Updates
                </strong>

                <span>
                  Get notified about important job
                  changes.
                </span>

              </div>

              <input
                type="checkbox"
                checked={notifications.jobUpdates}
                onChange={(event) =>
                  handleNotificationChange({
                    ...notifications,
                    jobUpdates:
                      event.target.checked,
                  })
                }
              />

              <span className="admin-toggle-slider"></span>

            </label>

            <label className="admin-setting-toggle">

              <div>

                <strong>
                  Email Notifications
                </strong>

                <span>
                  Receive important updates through
                  email.
                </span>

              </div>

              <input
                type="checkbox"
                checked={notifications.emailNotifications}
                onChange={(event) =>
                  handleNotificationChange({
                    ...notifications,
                    emailNotifications:
                      event.target.checked,
                  })
                }
              />

              <span className="admin-toggle-slider"></span>

            </label>

          </div>

        </section>

        {/* ===================================================
            PLATFORM SETTINGS
        =================================================== */}

        <section className="admin-settings-card admin-settings-full-card">

          <div className="admin-settings-card-header">

            <div className="admin-settings-card-icon platform">
              <Globe2 size={19} />
            </div>

            <div>
              <h2>Platform Settings</h2>

              <p>
                Configure basic JobAI platform preferences.
              </p>
            </div>

          </div>

          <form
            className="admin-settings-form"
            onSubmit={handlePlatformSave}
          >

            <div className="admin-platform-grid">

              {/* Platform Name */}

              <div className="admin-settings-field">

                <label htmlFor="platform-name">
                  Platform Name
                </label>

                <div className="admin-settings-input">

                  <Globe2 size={16} />

                  <input
                    id="platform-name"
                    type="text"
                    value={platform.platformName}
                    onChange={(event) =>
                      setPlatform({
                        ...platform,
                        platformName:
                          event.target.value,
                      })
                    }
                    required
                  />

                </div>

              </div>

              {/* Support Email */}

              <div className="admin-settings-field">

                <label htmlFor="support-email">
                  Support Email
                </label>

                <div className="admin-settings-input">

                  <Mail size={16} />

                  <input
                    id="support-email"
                    type="email"
                    value={platform.supportEmail}
                    onChange={(event) =>
                      setPlatform({
                        ...platform,
                        supportEmail:
                          event.target.value,
                      })
                    }
                    required
                  />

                </div>

              </div>

              {/* Default Job Status */}

              <div className="admin-settings-field">

                <label htmlFor="default-job-status">
                  Default Job Status
                </label>

                <div className="admin-settings-input">

                  <select
                    id="default-job-status"
                    value={platform.defaultJobStatus}
                    onChange={(event) =>
                      setPlatform({
                        ...platform,
                        defaultJobStatus:
                          event.target.value,
                      })
                    }
                    required
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

            </div>

            {/* Maintenance Mode */}

            <div className="admin-maintenance-option">

              <div>

                <strong>
                  Maintenance Mode
                </strong>

                <span>
                  Temporarily restrict public access
                  while maintenance is in progress.
                </span>

              </div>

              <label className="admin-setting-toggle compact">

                <input
                  type="checkbox"
                  checked={platform.maintenanceMode}
                  onChange={(event) =>
                    setPlatform({
                      ...platform,
                      maintenanceMode:
                        event.target.checked,
                    })
                  }
                />

                <span className="admin-toggle-slider"></span>

              </label>

            </div>

            {/* Save */}

            <button
              type="submit"
              className="admin-settings-save"
            >
              <Save size={16} />
              Save Platform Settings
            </button>

          </form>

        </section>

      </main>

    </div>
  );
}

export default AdminSettings;