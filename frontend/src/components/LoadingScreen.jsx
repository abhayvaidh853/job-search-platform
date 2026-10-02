import { BriefcaseBusiness, Sparkles } from "lucide-react";

function LoadingScreen() {
  return (
    <div
      className="loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Loading JobAI"
    >
      <div className="loading-content">
        <div className="loading-logo" aria-hidden="true">
          <BriefcaseBusiness
            size={34}
            strokeWidth={2}
          />
        </div>

        <div className="loading-brand" aria-label="JobAI">
          <span>Job</span>AI
        </div>

        <p className="loading-text">
          Powering your next career move
        </p>

        <div
          className="loading-bar"
          role="progressbar"
          aria-label="Loading JobAI"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div className="loading-progress"></div>
        </div>

        <div className="loading-status">
          <span
            className="loading-dot"
            aria-hidden="true"
          ></span>

          <Sparkles
            size={14}
            aria-hidden="true"
          />

          <span>Preparing your experience...</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;