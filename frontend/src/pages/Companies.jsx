import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function Companies() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");

  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [companiesResponse, jobsResponse] =
          await Promise.all([
            fetch(`${API_URL}/companies/`),
            fetch(`${API_URL}/jobs/`),
          ]);

        if (!companiesResponse.ok) {
          throw new Error("Failed to load companies");
        }

        if (!jobsResponse.ok) {
          throw new Error("Failed to load jobs");
        }

        const companiesData =
          await companiesResponse.json();

        const jobsData =
          await jobsResponse.json();

        setCompanies(companiesData);
        setJobs(jobsData);

      } catch (error) {
        console.error(error);

        setError(
          "Unable to load companies. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCompanyJobCount = (companyName) => {
    return jobs.filter(
      (job) => job.company === companyName
    ).length;
  };

  const industries = useMemo(() => {
    return [
      ...new Set(
        companies
          .map((company) => company.industry)
          .filter(Boolean)
      ),
    ];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        company.name
          .toLowerCase()
          .includes(searchText) ||
        company.industry
          .toLowerCase()
          .includes(searchText) ||
        company.location
          .toLowerCase()
          .includes(searchText);

      const matchesIndustry =
        !industry ||
        company.industry === industry;

      return (
        matchesSearch &&
        matchesIndustry
      );
    });
  }, [
    companies,
    search,
    industry,
  ]);

  const clearFilters = () => {
    setSearch("");
    setIndustry("");
  };

  return (
    <div className="companies-page">

      {/* Header */}

      <div className="companies-header">

        <h1>Explore Companies</h1>

        <p>
          Discover companies and explore their
          available job opportunities.
        </p>

      </div>

      {/* Search & Filter */}

      <div className="companies-filters">

        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={industry}
          onChange={(e) =>
            setIndustry(e.target.value)
          }
        >
          <option value="">
            All Industries
          </option>

          {industries.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={clearFilters}
        >
          Clear Filters
        </button>

      </div>

      {/* Results */}

      <div className="companies-result">

        <div>
          <h2>Companies</h2>

          <p>
            {loading
              ? "Loading companies..."
              : `${filteredCompanies.length} companies found`}
          </p>
        </div>

      </div>

      {/* Loading */}

      {loading && (
        <div className="no-companies">

          <h2>Loading Companies...</h2>

          <p>
            Please wait while we load companies.
          </p>

        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="no-companies">

          <h2>Unable to Load Companies</h2>

          <p>{error}</p>

        </div>
      )}

      {/* Company Cards */}

      {!loading && !error && (
        <div className="companies-grid">

          {filteredCompanies.length > 0 ? (
            filteredCompanies.map(
              (company) => {

                const jobCount =
                  getCompanyJobCount(
                    company.name
                  );

                return (
                  <div
                    className="company-card"
                    key={company.id}
                  >

                    <div className="company-icon">
                      {company.name.charAt(0)}
                    </div>

                    <h2>
                      {company.name}
                    </h2>

                    <p className="company-industry">
                      {company.industry}
                    </p>

                    <p className="company-location">
                      📍 {company.location}
                    </p>

                    <p className="company-description">
                      {company.description}
                    </p>

                    <div className="company-footer">

                      <span>
                        {jobCount}{" "}
                        {jobCount === 1
                          ? "Job Available"
                          : "Jobs Available"}
                      </span>

                      <Link
                        to={`/jobs?search=${encodeURIComponent(
                          company.name
                        )}`}
                        className="company-jobs-button"
                      >
                        View Jobs
                      </Link>

                    </div>

                  </div>
                );
              }
            )
          ) : (
            <div className="no-companies">

              <h2>No Companies Found</h2>

              <p>
                Try changing your search
                or industry filter.
              </p>

              <button onClick={clearFilters}>
                Clear Filters
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default Companies;