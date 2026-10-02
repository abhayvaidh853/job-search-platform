import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  MapPin,
  Upload,
  X,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "Abhay Vaidh",
    email: "abhay@test.com",
    phone: "",
    coverLetter: "",
  });

  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load real job from backend
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoadingJob(true);

        const response = await fetch(
          `${API_URL}/jobs/${id}`
        );

        if (!response.ok) {
          throw new Error("Job not found");
        }

        const data = await response.json();

        setJob(data);
      } catch (error) {
        console.error(error);
        setJob(null);
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      submit: "",
    }));
  };

  const handleResumeChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        resume: "Only PDF, DOC and DOCX files are allowed.",
      }));

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        resume: "Resume must be smaller than 5 MB.",
      }));

      event.target.value = "";
      return;
    }

    setResume(file);

    setErrors((previous) => ({
      ...previous,
      resume: "",
      submit: "",
    }));
  };

  const removeResume = () => {
    setResume(null);

    const input = document.getElementById("apply-resume");

    if (input) {
      input.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    if (!resume) {
      newErrors.resume = "Please upload your resume.";
    }

    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = "Cover letter is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setErrors({
        submit: "Please login before submitting your application.",
      });

      return;
    }

    try {
      setSubmitting(true);

      // 1. Upload resume
      const resumeFormData = new FormData();

      resumeFormData.append("file", resume);

      const resumeResponse = await fetch(
        `${API_URL}/resume/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: resumeFormData,
        }
      );

      const resumeData = await resumeResponse.json();

      if (!resumeResponse.ok) {
        throw new Error(
          resumeData.detail || "Resume upload failed."
        );
      }

      // 2. Submit application
      const applicationResponse = await fetch(
        `${API_URL}/applications/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job_id: id,
            cover_letter: formData.coverLetter,
          }),
        }
      );

      const applicationData =
        await applicationResponse.json();

      if (!applicationResponse.ok) {
        throw new Error(
          applicationData.detail ||
            "Application submission failed."
        );
      }

      setSubmitted(true);
    } catch (error) {
      console.error(error);

      setErrors({
        submit:
          error.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="apply-job-page">
        <div className="apply-job-container">
          <div className="apply-not-found">
            <BriefcaseBusiness size={42} />

            <h1>Loading Job...</h1>

            <p>
              Please wait while we load the job details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="apply-job-page">
        <div className="apply-job-container">
          <div className="apply-not-found">
            <BriefcaseBusiness size={42} />

            <h1>Job Not Found</h1>

            <p>
              The job you are trying to apply for does not exist.
            </p>

            <Link
              to="/jobs"
              className="apply-back-button"
            >
              <ArrowLeft size={17} />
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="apply-job-page">
        <div className="apply-job-container">
          <div className="apply-success-card">

            <div className="apply-success-icon">
              <CheckCircle2 size={48} />
            </div>

            <span className="apply-success-badge">
              Application Submitted
            </span>

            <h1>
              Application Submitted Successfully!
            </h1>

            <p>
              Your application for{" "}
              <strong>{job.title}</strong> at{" "}
              <strong>{job.company}</strong> has been
              submitted successfully.
            </p>

            <div className="apply-success-details">

              <div>
                <BriefcaseBusiness size={17} />
                <span>{job.title}</span>
              </div>

              <div>
                <MapPin size={17} />
                <span>{job.location}</span>
              </div>

              <div>
                <FileText size={17} />
                <span>{resume?.name}</span>
              </div>

            </div>

            <div className="apply-success-actions">

              <Link
                to="/jobs"
                className="apply-success-primary"
              >
                Explore More Jobs
              </Link>

              <Link
                to={`/jobs/${id}`}
                className="apply-success-secondary"
              >
                Back to Job
              </Link>

            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-job-page">
      <div className="apply-job-container">

        <Link
          to={`/jobs/${id}`}
          className="apply-back-link"
        >
          <ArrowLeft size={17} />
          Back to Job Details
        </Link>

        <div className="apply-job-layout">

          {/* MAIN FORM */}

          <main className="apply-job-main">

            <div className="apply-job-heading">

              <div className="apply-job-heading-icon">
                <BriefcaseBusiness size={23} />
              </div>

              <div>
                <h1>Apply for this Job</h1>

                <p>
                  Complete the form below to submit your
                  application.
                </p>
              </div>

            </div>

            <form
              className="apply-job-form"
              onSubmit={handleSubmit}
            >

              {/* PERSONAL INFORMATION */}

              <section className="apply-form-section">

                <div className="apply-section-heading">

                  <span>01</span>

                  <div>
                    <h2>Personal Information</h2>

                    <p>
                      Provide your basic contact information.
                    </p>
                  </div>

                </div>

                <div className="apply-form-grid">

                  <div className="apply-form-group">

                    <label htmlFor="fullName">
                      Full Name <span>*</span>
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />

                    {errors.fullName && (
                      <small className="apply-error">
                        {errors.fullName}
                      </small>
                    )}

                  </div>

                  <div className="apply-form-group">

                    <label htmlFor="email">
                      Email Address <span>*</span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />

                    {errors.email && (
                      <small className="apply-error">
                        {errors.email}
                      </small>
                    )}

                  </div>

                  <div className="apply-form-group apply-full-width">

                    <label htmlFor="phone">
                      Phone Number <span>*</span>
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                    />

                    {errors.phone && (
                      <small className="apply-error">
                        {errors.phone}
                      </small>
                    )}

                  </div>

                </div>

              </section>

              {/* RESUME */}

              <section className="apply-form-section">

                <div className="apply-section-heading">

                  <span>02</span>

                  <div>
                    <h2>Resume</h2>

                    <p>
                      Upload your latest resume.
                    </p>
                  </div>

                </div>

                <div className="apply-resume-upload">

                  {!resume ? (
                    <label
                      htmlFor="apply-resume"
                      className="apply-upload-box"
                    >

                      <div className="apply-upload-icon">
                        <Upload size={23} />
                      </div>

                      <strong>
                        Upload your resume
                      </strong>

                      <span>
                        PDF, DOC or DOCX · Maximum 5 MB
                      </span>

                      <div className="apply-upload-button">
                        Choose File
                      </div>

                      <input
                        id="apply-resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                      />

                    </label>
                  ) : (
                    <div className="apply-resume-selected">

                      <div className="apply-resume-file-icon">
                        <FileText size={22} />
                      </div>

                      <div className="apply-resume-file-info">

                        <strong>
                          {resume.name}
                        </strong>

                        <span>
                          {(resume.size / 1024 / 1024).toFixed(2)} MB
                        </span>

                      </div>

                      <button
                        type="button"
                        className="apply-remove-resume"
                        onClick={removeResume}
                      >
                        <X size={18} />
                      </button>

                    </div>
                  )}

                  {errors.resume && (
                    <small className="apply-error">
                      {errors.resume}
                    </small>
                  )}

                </div>

              </section>

              {/* COVER LETTER */}

              <section className="apply-form-section">

                <div className="apply-section-heading">

                  <span>03</span>

                  <div>
                    <h2>Cover Letter</h2>

                    <p>
                      Tell the employer why you are a good fit.
                    </p>
                  </div>

                </div>

                <div className="apply-form-group">

                  <label htmlFor="coverLetter">
                    Cover Letter <span>*</span>
                  </label>

                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleChange}
                    placeholder="Write a short cover letter explaining your interest in this position..."
                    rows={7}
                    maxLength={1500}
                  />

                  <div className="apply-textarea-footer">
                    {formData.coverLetter.length}/1500
                  </div>

                  {errors.coverLetter && (
                    <small className="apply-error">
                      {errors.coverLetter}
                    </small>
                  )}

                </div>

              </section>

              {/* SUBMIT */}

              <div className="apply-form-submit-area">

                <p>
                  By submitting this application, you confirm
                  that the information provided is accurate.
                </p>

                {errors.submit && (
                  <small className="apply-error">
                    {errors.submit}
                  </small>
                )}

                <button
                  type="submit"
                  className="apply-submit-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Application"}

                  <span>→</span>
                </button>

              </div>

            </form>
          </main>

          {/* RIGHT SIDEBAR */}

          <aside className="apply-job-sidebar">

            <div className="apply-job-summary-card">

              <div className="apply-summary-icon">
                <BriefcaseBusiness size={22} />
              </div>

              <span className="apply-summary-label">
                Applying for
              </span>

              <h2>{job.title}</h2>

              <p className="apply-summary-company">
                {job.company}
              </p>

              <div className="apply-summary-details">

                <div>
                  <MapPin size={16} />
                  <span>{job.location}</span>
                </div>

                <div>
                  <BriefcaseBusiness size={16} />
                  <span>{job.job_type}</span>
                </div>

                <div>
                  <FileText size={16} />
                  <span>
                    {job.salary || "Salary not specified"}
                  </span>
                </div>

              </div>

              <Link
                to={`/jobs/${id}`}
                className="apply-view-job-link"
              >
                View Job Details
              </Link>

            </div>

            <div className="apply-tips-card">

              <h3>Application Tips</h3>

              <ul>
                <li>Use your latest resume.</li>
                <li>
                  Keep your cover letter relevant.
                </li>
                <li>
                  Double-check your contact details.
                </li>
                <li>
                  Highlight skills related to the job.
                </li>
              </ul>

            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}

export default ApplyJob;