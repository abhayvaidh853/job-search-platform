import { Link } from "react-router-dom";

function About() {
  return (
    <div className="about-page">

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">

          <span className="about-badge">
            AI-Powered Job Platform
          </span>

          <h1>
            Find Better Jobs.
            <br />
            Build Your Career.
          </h1>

          <p>
            JobAI is an AI-powered job search platform designed to
            help job seekers discover relevant opportunities and
            make their job search easier.
          </p>

        </div>
      </section>

      {/* About Section */}
      <section className="about-section">

        <div className="about-content">

          <h2>About JobAI</h2>

          <p>
            JobAI brings job discovery and artificial intelligence
            together in one simple platform. Users can explore job
            opportunities, search for suitable positions and learn
            more about companies.
          </p>

          <p>
            Our goal is to provide a simple and user-friendly
            experience that helps candidates find opportunities
            based on their skills, experience and career goals.
          </p>

        </div>

      </section>

      {/* Features */}
      <section className="about-features">

        <div className="section-heading">

          <h2>What JobAI Offers</h2>

          <p>
            Everything you need for a simpler job search experience.
          </p>

        </div>

        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon">🔎</div>

            <h3>Smart Job Search</h3>

            <p>
              Search and explore job opportunities using relevant
              filters and search options.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>

            <h3>AI-Powered Experience</h3>

            <p>
              AI features are designed to help candidates make
              their job search more efficient.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏢</div>

            <h3>Explore Companies</h3>

            <p>
              Discover companies and explore their available
              job opportunities.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📄</div>

            <h3>Easy Applications</h3>

            <p>
              Apply for jobs through a simple and convenient
              application process.
            </p>
          </div>

        </div>

      </section>

      {/* How It Works */}
      <section className="how-it-works">

        <div className="section-heading">

          <h2>How JobAI Works</h2>

          <p>
            Start your job search in a few simple steps.
          </p>

        </div>

        <div className="steps-grid">

          <div className="step-card">
            <span>01</span>

            <h3>Search</h3>

            <p>
              Search for jobs based on your interests and career
              goals.
            </p>
          </div>

          <div className="step-card">
            <span>02</span>

            <h3>Explore</h3>

            <p>
              Review job details, companies, skills and
              requirements.
            </p>
          </div>

          <div className="step-card">
            <span>03</span>

            <h3>Apply</h3>

            <p>
              Submit your application through the platform.
            </p>
          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="about-cta">

        <h2>Ready to Find Your Next Opportunity?</h2>

        <p>
          Explore available jobs and start your career journey.
        </p>

        <Link
          to="/jobs"
          className="about-cta-button"
        >
          Explore Jobs
        </Link>

      </section>

    </div>
  );
}

export default About;