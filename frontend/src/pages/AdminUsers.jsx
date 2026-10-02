import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Edit3,
  Eye,
  Filter,
  LayoutDashboard,
  LogOut,
  Mail,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../Admin.css";

const API_URL = "http://127.0.0.1:8000";

const emptyUser = {
  name: "",
  email: "",
  role: "Job Seeker",
  status: "Active",
  applications: 0,
};

function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [editingUserId, setEditingUserId] = useState(null);

  const [users, setUsers] = useState([]);

  const [newUser, setNewUser] = useState({
    ...emptyUser,
  });

  const [editUser, setEditUser] = useState({
    ...emptyUser,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  /* ================================
     FORMAT BACKEND USER
  ================================= */

  const formatUser = (user) => {
    let displayRole = "Job Seeker";

    if (user.role === "employer") {
      displayRole = "Employer";
    }

    if (user.role === "admin") {
      displayRole = "Employer";
    }

    const createdDate = user.created_at
      ? new Date(user.created_at)
      : null;

    const joined = createdDate
      ? createdDate.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "—";

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: displayRole,
      backendRole: user.role,
      status: user.status || "Active",
      applications: Number(user.applications) || 0,
      joined,
    };
  };

  /* ================================
     LOAD USERS
  ================================= */

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/users/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load users"
        );
      }

      setUsers(data.map(formatUser));
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ================================
     FILTER USERS
  ================================= */

  const filteredUsers = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        !searchText ||
        user.name.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.role.toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "All" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" ||
        user.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  /* ================================
     STATISTICS
  ================================= */

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  const jobSeekers = users.filter(
    (user) => user.role === "Job Seeker"
  ).length;

  const employers = users.filter(
    (user) => user.role === "Employer"
  ).length;

  /* ================================
     DELETE USER
  ================================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/users/${id}`,
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
          data.detail || "Failed to delete user"
        );
      }

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) => user.id !== id
        )
      );
    } catch (err) {
      setError(
        err.message || "Failed to delete user"
      );
    }
  };

  /* ================================
     ADD USER
  ================================= */

  const handleAddUser = async (event) => {
    event.preventDefault();

    if (
      !newUser.name.trim() ||
      !newUser.email.trim()
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = getToken();

      const backendRole =
        newUser.role === "Employer"
          ? "employer"
          : "user";

      const response = await fetch(
        `${API_URL}/users/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newUser.name.trim(),
            email: newUser.email.trim(),
            role: backendRole,
            status: newUser.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create user"
        );
      }

      setUsers((currentUsers) => [
        formatUser(data),
        ...currentUsers,
      ]);

      setNewUser({
        ...emptyUser,
      });

      setShowAddForm(false);
    } catch (err) {
      setError(
        err.message || "Failed to create user"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================================
     OPEN EDIT FORM
  ================================= */

  const handleEdit = (user) => {
    setEditingUserId(user.id);

    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      applications: user.applications,
    });

    setShowEditForm(true);
  };

  /* ================================
     UPDATE USER
  ================================= */

  const handleUpdateUser = async (event) => {
    event.preventDefault();

    if (
      !editUser.name.trim() ||
      !editUser.email.trim()
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = getToken();

      const backendRole =
        editUser.role === "Employer"
          ? "employer"
          : "user";

      const response = await fetch(
        `${API_URL}/users/${editingUserId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editUser.name.trim(),
            email: editUser.email.trim(),
            role: backendRole,
            status: editUser.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update user"
        );
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingUserId
            ? formatUser(data)
            : user
        )
      );

      setEditingUserId(null);

      setEditUser({
        ...emptyUser,
      });

      setShowEditForm(false);
    } catch (err) {
      setError(
        err.message || "Failed to update user"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================================
     CLOSE EDIT
  ================================= */

  const closeEditForm = () => {
    setEditingUserId(null);

    setEditUser({
      ...emptyUser,
    });

    setShowEditForm(false);
  };

  /* ================================
     VIEW USER
  ================================= */

  const handleViewUser = (user) => {
    alert(
      `User Details\n\n` +
        `Name: ${user.name}\n` +
        `Email: ${user.email}\n` +
        `Role: ${user.role}\n` +
        `Status: ${user.status}\n` +
        `Applications: ${user.applications}\n` +
        `Joined: ${user.joined}`
    );
  };

  /* ================================
     CLEAR FILTERS
  ================================= */

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
  };

  return (
    <div className="admin-dashboard">

      {/* SIDEBAR */}

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
            className="admin-sidebar-link active"
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

      {/* MAIN */}

      <main className="admin-main">

        <header className="admin-dashboard-header">

          <div>

            <div className="admin-dashboard-breadcrumb">
              <Users size={15} />
              User Management
            </div>

            <h1>Manage Users</h1>

            <p>
              View, manage and monitor registered
              users on JobAI.
            </p>

          </div>

          <button
            type="button"
            className="admin-add-job-button"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={17} />
            Add User
          </button>

        </header>

        {/* USER STATS */}

        <section className="admin-job-stats">

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon blue">
              <Users size={19} />
            </div>

            <div>
              <span>Total Users</span>
              <strong>{users.length}</strong>
            </div>

          </div>

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon green">
              <UserCheck size={19} />
            </div>

            <div>
              <span>Active Users</span>
              <strong>{activeUsers}</strong>
            </div>

          </div>

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon orange">
              <UserRound size={19} />
            </div>

            <div>
              <span>Job Seekers</span>
              <strong>{jobSeekers}</strong>
            </div>

          </div>

          <div className="admin-job-stat-card">

            <div className="admin-job-stat-icon red">
              <BriefcaseBusiness size={19} />
            </div>

            <div>
              <span>Employers</span>
              <strong>{employers}</strong>
            </div>

          </div>

        </section>

        {/* SEARCH + FILTER */}

        <section className="admin-jobs-toolbar">

          <div className="admin-job-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search users by name, email or role..."
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
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
            >
              <option value="All">
                All Roles
              </option>

              <option value="Job Seeker">
                Job Seeker
              </option>

              <option value="Employer">
                Employer
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

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "#fff1f2",
              color: "#be123c",
              border: "1px solid #fecdd3",
            }}
          >
            {error}
          </div>
        )}

        {/* USERS CARD */}

        <section className="admin-jobs-card">

          <div className="admin-jobs-card-header">

            <div>

              <h2>All Users</h2>

              <p>
                {loading
                  ? "Loading users..."
                  : `${filteredUsers.length} user${
                      filteredUsers.length !== 1
                        ? "s"
                        : ""
                    } found`}
              </p>

            </div>

            {(search ||
              roleFilter !== "All" ||
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
                <Users size={25} />
              </div>

              <h3>
                Loading Users...
              </h3>

              <p>
                Fetching users from the database.
              </p>

            </div>

          ) : filteredUsers.length > 0 ? (

            <div className="admin-jobs-list">

              {filteredUsers.map((user) => (

                <article
                  className="admin-job-item"
                  key={user.id}
                >

                  <div className="admin-job-main">

                    <div className="admin-job-icon">
                      <UserRound size={21} />
                    </div>

                    <div className="admin-job-info">

                      <div className="admin-job-title-row">

                        <h3>
                          {user.name}
                        </h3>

                        <span
                          className={`admin-job-status ${user.status.toLowerCase()}`}
                        >
                          {user.status}
                        </span>

                      </div>

                      <p className="admin-job-company">
                        {user.role}
                      </p>

                      <div className="admin-job-meta">

                        <span>
                          <Mail size={13} />
                          {user.email}
                        </span>

                        <span>
                          {user.applications} Applications
                        </span>

                        <strong>
                          Joined {user.joined}
                        </strong>

                      </div>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="admin-job-actions">

                    <button
                      type="button"
                      className="admin-job-action view"
                      title="View User"
                      onClick={() =>
                        handleViewUser(user)
                      }
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      type="button"
                      className="admin-job-action edit"
                      title="Edit User"
                      onClick={() =>
                        handleEdit(user)
                      }
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      className="admin-job-action delete"
                      title="Delete User"
                      onClick={() =>
                        handleDelete(user.id)
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
                <Users size={25} />
              </div>

              <h3>
                No Users Found
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

      {/* ADD USER MODAL */}

      {showAddForm && (

        <div className="admin-modal-overlay">

          <div className="admin-job-modal">

            <div className="admin-modal-header">

              <div>

                <h2>
                  Add User
                </h2>

                <p>
                  Create a new JobAI user.
                </p>

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddForm(false)}
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="admin-job-form"
              onSubmit={handleAddUser}
            >

              <div className="admin-form-grid">

                <div className="admin-form-group full">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={newUser.name}
                    onChange={(event) =>
                      setNewUser({
                        ...newUser,
                        name: event.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="admin-form-group full">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="user@email.com"
                    value={newUser.email}
                    onChange={(event) =>
                      setNewUser({
                        ...newUser,
                        email: event.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Role
                  </label>

                  <select
                    value={newUser.role}
                    onChange={(event) =>
                      setNewUser({
                        ...newUser,
                        role: event.target.value,
                      })
                    }
                  >
                    <option value="Job Seeker">
                      Job Seeker
                    </option>

                    <option value="Employer">
                      Employer
                    </option>
                  </select>

                </div>

                <div className="admin-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    value={newUser.status}
                    onChange={(event) =>
                      setNewUser({
                        ...newUser,
                        status: event.target.value,
                      })
                    }
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>

                </div>

                <div className="admin-form-group">

                  <label>
                    Applications
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={newUser.applications}
                    onChange={(event) =>
                      setNewUser({
                        ...newUser,
                        applications:
                          event.target.value,
                      })
                    }
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
                    : "Create User"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* EDIT USER MODAL */}

      {showEditForm && (

        <div className="admin-modal-overlay">

          <div className="admin-job-modal">

            <div className="admin-modal-header">

              <div>

                <h2>
                  Edit User
                </h2>

                <p>
                  Update the selected user.
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
              onSubmit={handleUpdateUser}
            >

              <div className="admin-form-grid">

                <div className="admin-form-group full">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={editUser.name}
                    onChange={(event) =>
                      setEditUser({
                        ...editUser,
                        name: event.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="admin-form-group full">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(event) =>
                      setEditUser({
                        ...editUser,
                        email: event.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="admin-form-group">

                  <label>
                    Role
                  </label>

                  <select
                    value={editUser.role}
                    onChange={(event) =>
                      setEditUser({
                        ...editUser,
                        role: event.target.value,
                      })
                    }
                  >
                    <option value="Job Seeker">
                      Job Seeker
                    </option>

                    <option value="Employer">
                      Employer
                    </option>
                  </select>

                </div>

                <div className="admin-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    value={editUser.status}
                    onChange={(event) =>
                      setEditUser({
                        ...editUser,
                        status: event.target.value,
                      })
                    }
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>

                </div>

                <div className="admin-form-group">

                  <label>
                    Applications
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={editUser.applications}
                    readOnly
                  />

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

export default AdminUsers;