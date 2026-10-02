
import { useEffect, useState } from "react";
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import LoadingScreen from "./components/LoadingScreen";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import ApplyJob from "./pages/ApplyJob";
import Companies from "./pages/Companies";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AIJobMatch from "./pages/AIJobMatch";
import ResumeAnalysis from "./pages/ResumeAnalysis";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminJobs from "./pages/AdminJobs";
import AdminCompanies from "./pages/AdminCompanies";
import AdminUsers from "./pages/AdminUsers";
import AdminApplications from "./pages/AdminApplications";
import AdminSettings from "./pages/AdminSettings";

import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";
import SavedJobs from "./pages/SavedJobs";
import AIRecommendations from "./pages/AIRecommendations";
import UserSettings from "./pages/UserSettings";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen />}

      <div
        className={
          isLoading
            ? "app-content app-hidden"
            : "app-content"
        }
      >
        <BrowserRouter>
          <Navbar />

          <Routes>

            {/* =========================
                PUBLIC ROUTES
            ========================== */}

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/jobs"
              element={<Jobs />}
            />

            <Route
              path="/jobs/:id"
              element={<JobDetails />}
            />

            <Route
              path="/jobs/:id/apply"
              element={<ApplyJob />}
            />

            <Route
              path="/companies"
              element={<Companies />}
            />

            <Route
              path="/about"
              element={<About />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/ai-job-match"
              element={<AIJobMatch />}
            />

            <Route
              path="/resume-analysis"
              element={<ResumeAnalysis />}
            />


            {/* =========================
                PROTECTED USER ROUTES
            ========================== */}

            <Route element={<ProtectedRoute />}>

              <Route
                path="/dashboard"
                element={<UserDashboard />}
              />

              <Route
                path="/profile"
                element={<Profile />}
              />

              <Route
                path="/applications"
                element={<Applications />}
              />

              <Route
                path="/saved-jobs"
                element={<SavedJobs />}
              />

              <Route
                path="/ai-recommendations"
                element={<AIRecommendations />}
              />

              <Route
                path="/settings"
                element={<UserSettings />}
              />

            </Route>


            {/* =========================
                ADMIN ROUTES
            ========================== */}

            <Route path="/admin/login" element={<AdminLogin />} />

<Route element={<AdminRoute />}>
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
  <Route path="/admin/jobs" element={<AdminJobs />} />
  <Route path="/admin/companies" element={<AdminCompanies />} />
  <Route path="/admin/users" element={<AdminUsers />} />
  <Route path="/admin/applications" element={<AdminApplications />} />
  <Route path="/admin/settings" element={<AdminSettings />} />
</Route>


            {/* =========================
                NOT FOUND
                ALWAYS LAST
            ========================== */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>

          <Footer />
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
