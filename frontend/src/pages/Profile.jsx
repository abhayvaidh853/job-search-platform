import { useRef, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Save,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../App.css";

const PROFILE_STORAGE_KEY = "jobai_profile";

const defaultProfile = {
  firstName: "Abhay",
  lastName: "Vaidh",
  email: "abhay@example.com",
  phone: "+91 98765 43210",
  location: "Indore, Madhya Pradesh",
  headline: "Frontend Developer",
  bio: "",
  skills: "React, JavaScript, HTML, CSS",
  experience: "Fresher",
  education: "Bachelor of Computer Applications",
  profilePhoto: "",
  resumeName: "",
};

function Profile() {
  const fileInputRef = useRef(null);

  const getSavedProfile = () => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);

      if (saved) {
        return {
          ...defaultProfile,
          ...JSON.parse(saved),
        };
      }
    } catch (error) {
      console.error("Unable to load profile:", error);
    }

    return defaultProfile;
  };

  const [profile, setProfile] = useState(getSavedProfile);
  const [savedMessage, setSavedMessage] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [photoPreview, setPhotoPreview] = useState(
    getSavedProfile().profilePhoto || ""
  );
  const [resumeName, setResumeName] = useState(
    getSavedProfile().resumeName || ""
  );

  const defaultLocations = [
    "Indore, Madhya Pradesh",
    "Bhopal, Madhya Pradesh",
    "Gwalior, Madhya Pradesh",
    "Jabalpur, Madhya Pradesh",
    "Khandwa, Madhya Pradesh",
    "Mumbai, Maharashtra",
    "Pune, Maharashtra",
    "Delhi, India",
    "Bengaluru, Karnataka",
    "Hyderabad, Telangana",
    "Chennai, Tamil Nadu",
    "Ahmedabad, Gujarat",
    "Jaipur, Rajasthan",
    "Kolkata, West Bengal",
    "Chandigarh, India",
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "location") {
      setLocationError("");
    }
  };

  /* =========================================================
     PROFILE PHOTO
     ========================================================= */

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPG, JPEG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      alert("Profile photo must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      setPhotoPreview(imageData);

      setProfile((previous) => ({
        ...previous,
        profilePhoto: imageData,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview("");

    setProfile((previous) => ({
      ...previous,
      profilePhoto: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     LIVE LOCATION
     ========================================================= */

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Location is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );

          if (!response.ok) {
            throw new Error("Reverse geocoding failed.");
          }

          const data = await response.json();

          const city =
            data.city ||
            data.locality ||
            data.principalSubdivision ||
            "";

          const state =
            data.principalSubdivision || "";

          const country =
            data.countryName || "India";

          let readableLocation = "";

          if (city && state && city !== state) {
            readableLocation = `${city}, ${state}`;
          } else if (city && country) {
            readableLocation = `${city}, ${country}`;
          } else if (state && country) {
            readableLocation = `${state}, ${country}`;
          }

          if (!readableLocation) {
            readableLocation = `Current Location (${latitude.toFixed(
              4
            )}, ${longitude.toFixed(4)})`;
          }

          setProfile((previous) => ({
            ...previous,
            location: readableLocation,
          }));

          setLocationError("");
        } catch (error) {
          setProfile((previous) => ({
            ...previous,
            location: `Current Location (${latitude.toFixed(
              4
            )}, ${longitude.toFixed(4)})`,
          }));

          setLocationError(
            "City name could not be detected. GPS location was detected successfully."
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);

        if (error.code === 1) {
          setLocationError(
            "Location permission was denied. Please allow location access in your browser."
          );
        } else if (error.code === 2) {
          setLocationError(
            "Unable to detect your current location."
          );
        } else if (error.code === 3) {
          setLocationError(
            "Location request timed out. Please try again."
          );
        } else {
          setLocationError(
            "Unable to get your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  /* =========================================================
     RESUME
     ========================================================= */

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF, DOC, or DOCX file.");
      event.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      alert("Resume file must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setResumeName(file.name);

    setProfile((previous) => ({
      ...previous,
      resumeName: file.name,
    }));
  };

  /* =========================================================
     PROFILE COMPLETION
     ========================================================= */

  const calculateProfileCompletion = (currentProfile) => {
    const fields = [
      currentProfile.firstName,
      currentProfile.lastName,
      currentProfile.email,
      currentProfile.phone,
      currentProfile.location,
      currentProfile.headline,
      currentProfile.bio,
      currentProfile.skills,
      currentProfile.experience,
      currentProfile.education,
      currentProfile.profilePhoto,
      currentProfile.resumeName,
    ];

    const completedFields = fields.filter(
      (field) => String(field || "").trim() !== ""
    ).length;

    return Math.round(
      (completedFields / fields.length) * 100
    );
  };

  const profileCompletion =
    calculateProfileCompletion(profile);

  /* =========================================================
     SAVE PROFILE
     ========================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    const updatedProfile = {
      ...profile,
      profilePhoto: photoPreview,
      resumeName,
    };

    const completion =
      calculateProfileCompletion(updatedProfile);

    try {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );

      localStorage.setItem(
        "jobai_profile_completion",
        String(completion)
      );
    } catch (error) {
      console.error("Unable to save profile:", error);
      alert(
        "Unable to save profile. Your browser storage may be full."
      );
      return;
    }

    setProfile(updatedProfile);

    setSavedMessage(
      completion === 100
        ? "Profile completed successfully!"
        : "Profile updated successfully."
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  const locationIsCustom =
    profile.location &&
    !defaultLocations.includes(profile.location);

  return (
    <div className="profile-page">

      {/* HEADER */}

      <header className="profile-page-header">
        <div className="profile-page-header-inner">

          <Link
            to="/dashboard"
            className="profile-back-link"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="profile-header-title">
            <h1>My Profile</h1>

            <p>
              Manage your personal information, skills and
              professional details.
            </p>
          </div>

        </div>
      </header>

      <main className="profile-page-main">

        {/* SUCCESS */}

        {savedMessage && (
          <div className="profile-success-message">
            <CheckCircle2 size={18} />
            {savedMessage}
          </div>
        )}

        {/* PROFILE OVERVIEW */}

        <section className="profile-overview-card">

          <div className="profile-avatar-wrapper">

            <div className="profile-avatar">

              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="profile-avatar-image"
                />
              ) : (
                <UserRound size={38} />
              )}

            </div>

            <button
              type="button"
              className="profile-avatar-button"
              onClick={handlePhotoClick}
              aria-label="Change profile photo"
              title="Change profile photo"
            >
              <Camera size={15} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              hidden
              onChange={handlePhotoChange}
            />

          </div>

          <div className="profile-overview-content">

            <h2>
              {profile.firstName} {profile.lastName}
            </h2>

            <p>
              {profile.headline ||
                "Add your professional headline"}
            </p>

            <span>
              <MapPin size={14} />
              {profile.location ||
                "Add your location"}
            </span>

            {photoPreview && (
              <button
                type="button"
                className="profile-remove-photo"
                onClick={handleRemovePhoto}
              >
                <Trash2 size={13} />
                Remove Photo
              </button>
            )}

          </div>

          <div className="profile-completion">

            <div className="profile-completion-top">
              <span>Profile Completion</span>
              <strong>{profileCompletion}%</strong>
            </div>

            <div className="profile-completion-bar">
              <span
                style={{
                  width: `${profileCompletion}%`,
                }}
              ></span>
            </div>

          </div>

        </section>

        <form
          className="profile-form"
          onSubmit={handleSubmit}
        >

          {/* PERSONAL INFORMATION */}

          <section className="profile-form-card">

            <div className="profile-section-heading">

              <div className="profile-section-icon">
                <UserRound size={19} />
              </div>

              <div>
                <h2>Personal Information</h2>

                <p>
                  Keep your basic personal information up to date.
                </p>
              </div>

            </div>

            <div className="profile-form-grid">

              <div className="profile-input-group">

                <label htmlFor="firstName">
                  First Name
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />

              </div>

              <div className="profile-input-group">

                <label htmlFor="lastName">
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />

              </div>

              <div className="profile-input-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="profile-input-with-icon">

                  <Mail size={16} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />

                </div>

              </div>

              <div className="profile-input-group">

                <label htmlFor="phone">
                  Phone Number
                </label>

                <div className="profile-input-with-icon">

                  <Phone size={16} />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />

                </div>

              </div>

              {/* LOCATION */}

              <div className="profile-input-group profile-full-width">

                <label htmlFor="location">
                  Location
                </label>

                <div className="profile-location-row">

                  <div className="profile-input-with-icon">

                    <MapPin size={16} />

                    <select
                      id="location"
                      name="location"
                      value={
                        defaultLocations.includes(
                          profile.location
                        )
                          ? profile.location
                          : ""
                      }
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        {locationIsCustom
                          ? "Current detected location"
                          : "Select your city"}
                      </option>

                      {locationIsCustom && (
                        <option value={profile.location}>
                          {profile.location}
                        </option>
                      )}

                      {defaultLocations.map(
                        (location) => (
                          <option
                            key={location}
                            value={location}
                          >
                            {location}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <button
                    type="button"
                    className="profile-current-location-button"
                    onClick={handleCurrentLocation}
                    disabled={locationLoading}
                  >
                    <Navigation size={15} />

                    {locationLoading
                      ? "Detecting..."
                      : "Use Current Location"}
                  </button>

                </div>

                <small>
                  Select your city or use your device's GPS
                  location.
                </small>

                {locationError && (
                  <div className="profile-location-message">
                    <span>!</span>
                    {locationError}
                  </div>
                )}

              </div>

            </div>

          </section>

          {/* PROFESSIONAL INFORMATION */}

          <section className="profile-form-card">

            <div className="profile-section-heading">

              <div className="profile-section-icon">
                <BriefcaseBusiness size={19} />
              </div>

              <div>
                <h2>Professional Information</h2>

                <p>
                  Tell employers about your professional background.
                </p>
              </div>

            </div>

            <div className="profile-form-grid">

              <div className="profile-input-group profile-full-width">

                <label htmlFor="headline">
                  Professional Headline
                </label>

                <input
                  id="headline"
                  name="headline"
                  type="text"
                  value={profile.headline}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer"
                  required
                />

              </div>

              <div className="profile-input-group">

                <label htmlFor="experience">
                  Experience
                </label>

                <select
                  id="experience"
                  name="experience"
                  value={profile.experience}
                  onChange={handleChange}
                  required
                >

                  <option value="Fresher">
                    Fresher
                  </option>

                  <option value="0-1 Years">
                    0–1 Years
                  </option>

                  <option value="1-3 Years">
                    1–3 Years
                  </option>

                  <option value="3-5 Years">
                    3–5 Years
                  </option>

                  <option value="5+ Years">
                    5+ Years
                  </option>

                </select>

              </div>

              <div className="profile-input-group">

                <label htmlFor="education">
                  Education
                </label>

                <div className="profile-input-with-icon">

                  <GraduationCap size={16} />

                  <input
                    id="education"
                    name="education"
                    type="text"
                    value={profile.education}
                    onChange={handleChange}
                    placeholder="Your highest qualification"
                    required
                  />

                </div>

              </div>

              <div className="profile-input-group profile-full-width">

                <label htmlFor="skills">
                  Skills
                </label>

                <input
                  id="skills"
                  name="skills"
                  type="text"
                  value={profile.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, JavaScript, Python"
                  required
                />

                <small>
                  Separate multiple skills with commas.
                </small>

              </div>

              <div className="profile-input-group profile-full-width">

                <label htmlFor="bio">
                  About Me
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Write a short introduction about yourself..."
                  rows="5"
                  required
                />

              </div>

            </div>

          </section>

          {/* RESUME */}

          <section className="profile-form-card">

            <div className="profile-section-heading">

              <div className="profile-section-icon">
                <Upload size={19} />
              </div>

              <div>
                <h2>Resume</h2>

                <p>
                  Upload your latest resume for job applications.
                </p>
              </div>

            </div>

            <div className="profile-resume-box">

              <div className="profile-resume-icon">
                <FileText size={22} />
              </div>

              <div className="profile-resume-content">

                <strong>
                  {resumeName ||
                    "Upload your resume"}
                </strong>

                <span>
                  {resumeName
                    ? "Resume selected successfully."
                    : "PDF, DOC or DOCX · Maximum 5 MB"}
                </span>

              </div>

              <label
                htmlFor="resume-upload"
                className="profile-upload-button"
              >
                <Upload size={15} />
                Choose File
              </label>

              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                hidden
                onChange={handleResumeChange}
              />

            </div>

          </section>

          {/* ACTIONS */}

          <div className="profile-form-actions">

            <Link
              to="/dashboard"
              className="profile-cancel-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="profile-save-button"
            >
              <Save size={17} />
              Save Changes
            </button>

          </div>

        </form>

      </main>
    </div>
  );
}

export default Profile;
