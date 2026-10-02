import {
  ArrowLeft,
  Compass,
  Home,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="not-found-page">

      <div className="not-found-grid"></div>

      <div className="not-found-content">

        <div className="not-found-icon">
          <Compass size={32} />
        </div>

        <span className="not-found-label">
          ERROR 404
        </span>

        <h1>
          Page not found.
        </h1>

        <p>
          The page you're looking for doesn't exist or may have
          been moved. Let's get you back on track.
        </p>

        <div className="not-found-actions">

          <Link
            to="/"
            className="not-found-primary"
          >
            <Home size={17} />
            Back to Home
          </Link>

          <Link
            to="/jobs"
            className="not-found-secondary"
          >
            <Search size={17} />
            Find Jobs
          </Link>

        </div>

        <button
          type="button"
          className="not-found-back"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={15} />
          Go back
        </button>

      </div>

    </main>
  );
}

export default NotFound;