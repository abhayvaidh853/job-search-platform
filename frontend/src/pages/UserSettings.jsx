import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  LockKeyhole,
  Mail,
  Save,
  Settings as SettingsIcon,
  UserRound,
} from "lucide-react";
import "../App.css";

function UserSettings() {
  const [notifications, setNotifications] = useState({
    applications: true,
    recommendations: true,
    email: false,
  });

  const [savedMessage, setSavedMessage] = useState("");

  const handleSave = (event) => {
    event.preventDefault();

    setSavedMessage("Settings saved successfully.");

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  return (
    <div className="user-dashboard-page">
      <div className="dashboard-container">
        {/* HEADER */}
        <div className="dashboard-page-header">
          <Link to="/dashboard" className="dashboard-back-link">
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="user-settings-heading">
            <div className="user-settings-heading-icon">
              <SettingsIcon size={22} />
            </div>

            <div>
              <h1>Settings</h1>
              <p>
                Manage your account preferences and notifications.
              </p>
            </div>
          </div>
        </div>

        {savedMessage && (
          <div className="user-settings-success">
            <Save size={17} />
            {savedMessage}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* ACCOUNT SETTINGS */}
          <section className="user-settings-card">
            <div className="user-settings-card-header">
              <div className="user-settings-card-icon">
                <UserRound size={19} />
              </div>

              <div>
                <h2>Account Settings</h2>
                <p>Manage your basic account information.</p>
              </div>
            </div>

            <div className="user-settings-fields">
              <div className="user-settings-field">
                <label htmlFor="settings-name">Full Name</label>
                <input
                  id="settings-name"
                  type="text"
                  defaultValue="Abhay Vaidh"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="user-settings-field">
                <label htmlFor="settings-email">Email Address</label>

                <div className="user-settings-input-icon">
                  <Mail size={16} />
                  <input
                    id="settings-email"
                    type="email"
                    defaultValue="abhay@example.com"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section className="user-settings-card">
            <div className="user-settings-card-header">
              <div className="user-settings-card-icon">
                <Bell size={19} />
              </div>

              <div>
                <h2>Notifications</h2>
                <p>Choose which notifications you want to receive.</p>
              </div>
            </div>

            <div className="user-settings-options">
              <label className="user-settings-option">
                <div>
                  <strong>Application Updates</strong>
                  <span>
                    Get updates about your job applications.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={notifications.applications}
                  onChange={(event) =>
                    setNotifications({
                      ...notifications,
                      applications: event.target.checked,
                    })
                  }
                />
              </label>

              <label className="user-settings-option">
                <div>
                  <strong>AI Job Recommendations</strong>
                  <span>
                    Receive new job matches based on your profile.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={notifications.recommendations}
                  onChange={(event) =>
                    setNotifications({
                      ...notifications,
                      recommendations: event.target.checked,
                    })
                  }
                />
              </label>

              <label className="user-settings-option">
                <div>
                  <strong>Email Notifications</strong>
                  <span>
                    Receive important JobAI updates by email.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(event) =>
                    setNotifications({
                      ...notifications,
                      email: event.target.checked,
                    })
                  }
                />
              </label>
            </div>
          </section>

          {/* SECURITY */}
          <section className="user-settings-card">
            <div className="user-settings-card-header">
              <div className="user-settings-card-icon">
                <LockKeyhole size={19} />
              </div>

              <div>
                <h2>Security</h2>
                <p>Manage your account security.</p>
              </div>
            </div>

            <div className="user-settings-security">
              <div>
                <strong>Password</strong>
                <span>
                  Keep your account secure with a strong password.
                </span>
              </div>

              <button
                type="button"
                className="user-settings-secondary-button"
                onClick={() =>
                  alert("Password change will be connected with the backend.")
                }
              >
                Change Password
              </button>
            </div>
          </section>

          {/* SAVE */}
          <div className="user-settings-actions">
            <Link
              to="/dashboard"
              className="user-settings-cancel-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="user-settings-save-button"
            >
              <Save size={16} />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserSettings;
