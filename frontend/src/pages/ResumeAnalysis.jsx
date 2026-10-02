import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  XCircle,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function ResumeAnalysis() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
    ];

    const extension =
      "." +
      selectedFile.name
        .split(".")
        .pop()
        .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError(
        "Only PDF, DOC and DOCX files are allowed."
      );
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(
        "File size must be less than or equal to 5 MB."
      );
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError("");
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  const analyzeResume = async () => {
    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    const token = localStorage.getItem(
      "access_token"
    );

    if (!token) {
      setError(
        "Please login before analyzing your resume."
      );
      return;
    }

    try {
      setIsAnalyzing(true);
      setResult(null);
      setError("");

      /*
       * Step 1:
       * Upload resume to backend
       */

      const formData = new FormData();

      formData.append("file", file);

      const uploadResponse = await fetch(
        `${API_URL}/resume/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const uploadData =
        await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.detail ||
            "Resume upload failed."
        );
      }

      /*
       * Step 2:
       * Ask backend to analyze latest resume
       */

      const analysisResponse = await fetch(
        `${API_URL}/ai/resume/analyze`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const analysisData =
        await analysisResponse.json();

      if (!analysisResponse.ok) {
        throw new Error(
          analysisData.detail ||
            "Resume analysis failed."
        );
      }

      setResult(analysisData);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to analyze your resume."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analysis = result?.analysis;

  const atsScore = analysis?.ats_score ?? 0;
  const wordCount = analysis?.word_count ?? 0;

  const getScoreTitle = () => {
    if (atsScore >= 80) {
      return "Strong Resume";
    }

    if (atsScore >= 60) {
      return "Good Foundation";
    }

    if (atsScore >= 40) {
      return "Needs Improvement";
    }

    return "Needs More Work";
  };

  return (
    <main className="resume-analysis-page">

      {/* Background */}

      <div className="resume-page-grid"></div>

      <div className="resume-page-glow resume-glow-one"></div>
      <div className="resume-page-glow resume-glow-two"></div>

      {/* Hero */}

      <section className="resume-analysis-hero">

        <div className="resume-hero-inner">

          <div className="resume-ai-badge">
            <span></span>
            <Sparkles size={15} />
            AI Resume Intelligence
          </div>

          <h1>
            Make Your Resume
            <span> Job-Ready.</span>
          </h1>

          <p>
            Upload your resume and let AI analyze its
            structure, skills, content and overall
            job-readiness.
          </p>

        </div>

      </section>

      {/* Error */}

      {error && (
        <div className="resume-error-message">
          <XCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Workspace */}

      {!isAnalyzing && !result && (
        <section className="resume-workspace">

          <div className="resume-upload-container">

            <div className="resume-upload-card">

              <div className="resume-upload-heading">

                <div className="resume-upload-icon">
                  <FileText size={23} />
                </div>

                <div>
                  <h2>
                    Upload Your Resume
                  </h2>

                  <p>
                    Supported formats: PDF, DOC and DOCX
                  </p>
                </div>

              </div>

              {!file ? (
                <label className="resume-drop-zone">

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />

                  <div className="resume-drop-icon">
                    <Upload size={25} />
                  </div>

                  <strong>
                    Drop your resume here
                  </strong>

                  <span>
                    or click to browse from your device
                  </span>

                  <small>
                    Maximum file size: 5 MB
                  </small>

                </label>
              ) : (
                <div className="resume-selected-file">

                  <div className="selected-file-icon">
                    <FileText size={23} />
                  </div>

                  <div className="selected-file-info">

                    <strong>
                      {file.name}
                    </strong>

                    <span>
                      {(
                        file.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    aria-label="Remove resume"
                  >
                    <XCircle size={20} />
                  </button>

                </div>
              )}

              <button
                type="button"
                className="resume-analyze-button"
                onClick={analyzeResume}
                disabled={!file}
              >
                <Sparkles size={18} />

                Analyze My Resume

                <ArrowRight size={17} />
              </button>

              <div className="resume-security-note">

                <ShieldCheck size={15} />

                <span>
                  Your resume is used only for analysis.
                </span>

              </div>

            </div>

            {/* Benefits */}

            <div className="resume-benefits-card">

              <div className="resume-benefits-top">

                <span>
                  AI ANALYSIS
                </span>

                <Sparkles size={17} />

              </div>

              <h2>
                Understand what recruiters
                <br />
                can see in your resume.
              </h2>

              <p>
                Get structured insights designed to help
                you improve your resume before applying.
              </p>

              <div className="resume-benefit-list">

                <div className="resume-benefit-item">

                  <div>
                    <Target size={17} />
                  </div>

                  <span>
                    Resume structure analysis
                  </span>

                </div>

                <div className="resume-benefit-item">

                  <div>
                    <TrendingUp size={17} />
                  </div>

                  <span>
                    Skills and experience insights
                  </span>

                </div>

                <div className="resume-benefit-item">

                  <div>
                    <Zap size={17} />
                  </div>

                  <span>
                    Job-readiness analysis
                  </span>

                </div>

                <div className="resume-benefit-item">

                  <div>
                    <CheckCircle2 size={17} />
                  </div>

                  <span>
                    Actionable improvement points
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>
      )}

      {/* Loading */}

      {isAnalyzing && (
        <section className="resume-analysis-loading">

          <div className="resume-loading-card">

            <div className="resume-scanner">

              <div className="scanner-document">

                <FileText size={34} />

                <span className="scanner-line line-one"></span>
                <span className="scanner-line line-two"></span>
                <span className="scanner-line line-three"></span>
                <span className="scanner-line line-four"></span>

              </div>

              <div className="scanner-beam"></div>

            </div>

            <h2>
              AI is analyzing your resume
            </h2>

            <p>
              Reviewing structure, skills and
              job-readiness...
            </p>

            <div className="resume-loading-progress">
              <span></span>
            </div>

          </div>

        </section>
      )}

      {/* Results */}

      {result && !isAnalyzing && (
        <section className="resume-results-section">

          <div className="resume-results-container">

            {/* Result Header */}

            <div className="resume-results-header">

              <div>

                <span>
                  AI RESUME REPORT
                </span>

                <h2>
                  Your resume analysis
                </h2>

                <p>
                  Analysis generated from your uploaded
                  resume.
                </p>

              </div>

              <div className="resume-file-pill">

                <FileText size={15} />

                <span>
                  {result.filename}
                </span>

              </div>

            </div>

            {/* Score */}

            <div className="resume-score-card">

              <div className="resume-score-visual">

                <div className="resume-score-ring">

                  <div>

                    <strong>
                      {atsScore}
                    </strong>

                    <span>
                      /100
                    </span>

                  </div>

                </div>

              </div>

              <div className="resume-score-content">

                <span>
                  ATS RESUME SCORE
                </span>

                <h3>
                  {getScoreTitle()}
                </h3>

                <p>
                  Your resume contains{" "}
                  {wordCount} words. The score is
                  calculated from detected resume
                  sections and content structure.
                </p>

                <div className="resume-score-tags">

                  <span>
                    <CheckCircle2 size={13} />
                    Skills
                  </span>

                  <span>
                    <CheckCircle2 size={13} />
                    Experience
                  </span>

                  <span>
                    <CheckCircle2 size={13} />
                    Education
                  </span>

                </div>

              </div>

            </div>

            {/* Insights */}

            <div className="resume-insights-grid">

              <div className="resume-insight-card">

                <div className="insight-card-header">

                  <div className="insight-icon success">
                    <CheckCircle2 size={19} />
                  </div>

                  <span>
                    DETECTED
                  </span>

                </div>

                <h3>
                  Resume Structure
                </h3>

                <ul>

                  <li>
                    Skills section detected
                  </li>

                  <li>
                    Experience section detected
                  </li>

                  <li>
                    Education section detected
                  </li>

                  <li>
                    Projects section detected
                  </li>

                </ul>

              </div>

              <div className="resume-insight-card">

                <div className="insight-card-header">

                  <div className="insight-icon warning">
                    <TrendingUp size={19} />
                  </div>

                  <span>
                    ANALYSIS
                  </span>

                </div>

                <h3>
                  Resume Content
                </h3>

                <ul>

                  <li>
                    {wordCount} words detected
                  </li>

                  <li>
                    Contact information checked
                  </li>

                  <li>
                    Resume sections analyzed
                  </li>

                  <li>
                    ATS structure evaluated
                  </li>

                </ul>

              </div>

              <div className="resume-insight-card">

                <div className="insight-card-header">

                  <div className="insight-icon purple">
                    <Target size={19} />
                  </div>

                  <span>
                    NEXT STEP
                  </span>

                </div>

                <h3>
                  Improve Your Resume
                </h3>

                <ul>

                  <li>
                    Add measurable achievements
                  </li>

                  <li>
                    Use role-specific keywords
                  </li>

                  <li>
                    Keep sections clearly organized
                  </li>

                  <li>
                    Target your desired job
                  </li>

                </ul>

              </div>

            </div>

            {/* Resume Stats */}

            <div className="resume-skills-card">

              <div className="resume-skills-heading">

                <div>

                  <span>
                    RESUME STATISTICS
                  </span>

                  <h3>
                    Analysis details
                  </h3>

                </div>

                <Sparkles size={19} />

              </div>

              <div className="resume-detected-skills">

                <span>
                  {wordCount} Words
                </span>

                <span>
                  ATS Score: {atsScore}/100
                </span>

                <span>
                  PDF / DOC / DOCX
                </span>

              </div>

            </div>

            {/* CTA */}

            <div className="resume-final-cta">

              <div>

                <Sparkles size={20} />

                <div>

                  <strong>
                    Ready to find matching jobs?
                  </strong>

                  <span>
                    Use your resume to discover
                    relevant opportunities.
                  </span>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/jobs")
                }
              >
                Find Jobs
                <ArrowRight size={16} />
              </button>

            </div>

          </div>

        </section>
      )}

    </main>
  );
}

export default ResumeAnalysis;