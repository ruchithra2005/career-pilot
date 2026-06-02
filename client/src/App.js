import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";

// ==========================================
// 1. INLINE AUTH-AWARE API UTILITY
// ==========================================
const API = {
  get: async (endpoint) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const headers = { "Content-Type": "application/json" };
    if (user?.token) {
      headers["Authorization"] = `Bearer ${user.token}`;
    }
    const response = await fetch(`http://localhost:5000/api${endpoint}`, {
      method: "GET",
      headers,
    });
    const resData = await response.json();
    if (!response.ok) {
      const error = new Error(resData.message || "API request failed");
      error.response = { data: resData };
      throw error;
    }
    return { data: resData };
  },
  post: async (endpoint, data) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const headers = { "Content-Type": "application/json" };
    if (user?.token) {
      headers["Authorization"] = `Bearer ${user.token}`;
    }
    const response = await fetch(`http://localhost:5000/api${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) {
      const error = new Error(resData.message || "API request failed");
      error.response = { data: resData };
      throw error;
    }
    return { data: resData };
  },
};

// ==========================================
// 2. PROTECTED ROUTE GUARD
// ==========================================
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? children : <Navigate to="/signin" replace />;
};

// ==========================================
// 3. SIGN UP PAGE COMPONENT
// ==========================================
function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/register", form);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <div style={authStyles.header}>
          <h2 style={authStyles.title}>Join Career Pilot</h2>
          <p style={authStyles.subtitle}>Create your profile to start preparation</p>
        </div>

        {error && <div style={authStyles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={authStyles.form}>
          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Full Name</label>
            <input
              name="name"
              type="text"
              placeholder="John Doe"
              onChange={handleChange}
              required
              style={authStyles.input}
            />
          </div>

          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
              style={authStyles.input}
            />
          </div>

          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              onChange={handleChange}
              required
              style={authStyles.input}
            />
          </div>

          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Register As</label>
            <select name="role" onChange={handleChange} style={authStyles.select}>
              <option value="student">Student (Candidate)</option>
              <option value="recruiter">Recruiter (Company)</option>
              <option value="admin">College Administrator</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={authStyles.button}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p style={authStyles.footerText}>
          Already registered?{" "}
          <Link to="/signin" style={authStyles.link}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 4. SIGN IN PAGE COMPONENT
// ==========================================
function SignIn() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password combination.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <div style={authStyles.header}>
          <h2 style={authStyles.title}>Welcome Back</h2>
          <p style={authStyles.subtitle}>Log in to access your dashboard</p>
        </div>

        {error && <div style={authStyles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={authStyles.form}>
          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="name@company.com"
              onChange={handleChange}
              required
              style={authStyles.input}
            />
          </div>

          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
              required
              style={authStyles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={authStyles.button}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p style={authStyles.footerText}>
          New to Career Pilot?{" "}
          <Link to="/signup" style={authStyles.link}>
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 5. UNIFIED DYNAMIC DASHBOARD
// ==========================================
function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // State Management (Core & Job Board)
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Job Form State (Recruiters)
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    salary: "",
    eligibilityCGPA: "",
  });

  // AI Interview Core State (Students)
  const [isPrepActive, setIsPrepActive] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [activeInterview, setActiveInterview] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [interviewFinishedResult, setInterviewFinishedResult] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState("frontend");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/signin");
  };

  // Fetch Jobs, Applications, and AI Interview History from Backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch available placement jobs
      const jobsRes = await API.get("/jobs");
      setJobs(jobsRes.data);

      // 2. Fetch submitted job applications
      const appsRes = await API.get("/jobs/applications");
      setApplications(appsRes.data);

      // 3. Fetch interview scorecard history if user is a student
      if (user?.role === "student") {
        const interviewRes = await API.get("/ai/history");
        setInterviewHistory(interviewRes.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle posting a new job (Recruiter)
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/jobs", jobForm);
      setMessage({ text: "Job opening posted successfully!", type: "success" });
      setShowPostModal(false);
      setJobForm({
        title: "",
        company: "",
        description: "",
        requirements: "",
        salary: "",
        eligibilityCGPA: "",
      });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to post job.", type: "error" });
    }
  };

  // Handle applying for a job (Student)
  const handleApply = async (jobId) => {
    try {
      await API.post(`/jobs/${jobId}/apply`, {
        resumeUrl: "https://careerpilot-resumes.s3.amazonaws.com/placeholder.pdf",
      });
      setMessage({ text: "Application submitted successfully!", type: "success" });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Application failed.", type: "error" });
    }
  };

  // ==========================================
  // AI INTERVIEW PREP HANDLERS
  // ==========================================
  const startNewAIInterview = async (domain) => {
    setLoading(true);
    try {
      const res = await API.post("/ai/start", { domain });
      setActiveInterview({
        id: res.data.interviewId,
        questions: res.data.questions,
        domain: domain,
      });
      setCurrentQuestionIdx(0);
      setTypedAnswer("");
      setInterviewFinishedResult(null);
      setIsPrepActive(true);
    } catch (err) {
      setMessage({ text: "Failed to initialize interview simulator.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const submitAIAnswer = async () => {
    if (!typedAnswer.trim()) return;
    setSubmittingAnswer(true);

    try {
      const res = await API.post("/ai/submit", {
        interviewId: activeInterview.id,
        questionIndex: currentQuestionIdx,
        answer: typedAnswer,
      });

      if (res.data.isCompleted) {
        setInterviewFinishedResult({
          score: res.data.score,
          feedback: res.data.feedback,
        });
        setActiveInterview(null);
        fetchData(); // Refresh history
      } else {
        setCurrentQuestionIdx((prev) => prev + 1);
        setTypedAnswer("");
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to submit answer.", type: "error" });
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const quitActiveInterview = () => {
    setActiveInterview(null);
    setIsPrepActive(false);
    setTypedAnswer("");
    setInterviewFinishedResult(null);
  };

  return (
    <div style={dashboardStyles.container}>
      {/* Navigation Bar */}
      <nav style={dashboardStyles.navbar}>
        <div style={dashboardStyles.logoGroup}>
          <span style={dashboardStyles.logoIcon}>✈️</span>
          <h2 style={dashboardStyles.logoText}>Career Pilot</h2>
        </div>
        <div style={dashboardStyles.userSection}>
          <span style={dashboardStyles.userName}>
            {user?.name} <span style={dashboardStyles.roleLabel}>{user?.role}</span>
          </span>
          <button onClick={handleLogout} style={dashboardStyles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Workspace */}
      <main style={dashboardStyles.main}>
        {/* Status Alerts */}
        {message.text && (
          <div
            style={{
              ...dashboardStyles.alert,
              backgroundColor: message.type === "success" ? "#ecfdf5" : "#fef2f2",
              color: message.type === "success" ? "#047857" : "#b91c1c",
              border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fca5a5"}`,
            }}
          >
            {message.text}
            <button onClick={() => setMessage({ text: "", type: "" })} style={dashboardStyles.closeAlert}>×</button>
          </div>
        )}

        {/* Welcome Banner */}
        <div style={dashboardStyles.welcomeBanner}>
          <div>
            <h1 style={dashboardStyles.welcomeTitle}>Welcome back, {user?.name}! 👋</h1>
            <p style={dashboardStyles.welcomeSubtitle}>
              Access your college planning and company recruitment panels below.
            </p>
          </div>
          {user?.role === "recruiter" && (
            <button onClick={() => setShowPostModal(true)} style={dashboardStyles.actionBtn}>
              ＋ Create Job Opening
            </button>
          )}
        </div>

        {/* ==========================================
            RECRUITER WORKSPACE
            ========================================== */}
        {user?.role === "recruiter" && (
          <div style={dashboardStyles.workspaceSection}>
            <h2 style={dashboardStyles.sectionTitle}>Active Applicants & Status Tracking</h2>
            {loading ? (
              <p>Loading database records...</p>
            ) : applications.length === 0 ? (
              <div style={dashboardStyles.emptyState}>No candidate applications received yet.</div>
            ) : (
              <div style={dashboardStyles.tableWrapper}>
                <table style={dashboardStyles.table}>
                  <thead>
                    <tr style={dashboardStyles.tr}>
                      <th style={dashboardStyles.th}>Candidate Details</th>
                      <th style={dashboardStyles.th}>Applied Role</th>
                      <th style={dashboardStyles.th}>Company</th>
                      <th style={dashboardStyles.th}>Application Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app._id} style={dashboardStyles.tr}>
                        <td style={dashboardStyles.td}>
                          <strong>{app.student?.name}</strong> <br />
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>{app.student?.email}</span>
                        </td>
                        <td style={dashboardStyles.td}>{app.job?.title}</td>
                        <td style={dashboardStyles.td}>{app.job?.company}</td>
                        <td style={dashboardStyles.td}>
                          <span style={{
                            ...dashboardStyles.badge,
                            backgroundColor: app.status === "Applied" ? "#eff6ff" : "#f0fdf4",
                            color: app.status === "Applied" ? "#1e40af" : "#166534",
                          }}>{app.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            ADMINISTRATOR WORKSPACE
            ========================================== */}
        {user?.role === "admin" && (
          <div style={dashboardStyles.workspaceSection}>
            <h2 style={dashboardStyles.sectionTitle}>Campus Recruitment Statistics Dashboard</h2>
            <div style={dashboardStyles.gridThreeColumn}>
              <div style={dashboardStyles.statCard}>
                <div style={dashboardStyles.statIcon}>🏢</div>
                <div>
                  <h3 style={dashboardStyles.statNum}>{jobs.length}</h3>
                  <p style={dashboardStyles.statLabel}>Total Active Companies</p>
                </div>
              </div>
              <div style={dashboardStyles.statCard}>
                <div style={dashboardStyles.statIcon}>📝</div>
                <div>
                  <h3 style={dashboardStyles.statNum}>{applications.length}</h3>
                  <p style={dashboardStyles.statLabel}>Total Submitted Applications</p>
                </div>
              </div>
              <div style={dashboardStyles.statCard}>
                <div style={dashboardStyles.statIcon}>🤖</div>
                <div>
                  <h3 style={dashboardStyles.statNum}>MERN Ready</h3>
                  <p style={dashboardStyles.statLabel}>AI Evaluation Online</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STUDENT WORKSPACE (JOB BOARD & AI ARENA)
            ========================================== */}
        {user?.role === "student" && (
          <div style={dashboardStyles.gridTwoColumn}>
            
            {/* Left Column: Job Board & ACTIVE AI Simulator */}
            <div>
              {/* If AI Prep Simulator is Active, override left layout */}
              {isPrepActive ? (
                <div style={dashboardStyles.aiSimulatorCard}>
                  <div style={dashboardStyles.aiSimHeader}>
                    <div>
                      <span style={dashboardStyles.aiBadge}>🤖 AI INTERVIEW SIMULATOR</span>
                      <h3 style={dashboardStyles.aiDomainTitle}>Engineering Domain: {activeInterview?.domain.toUpperCase()}</h3>
                    </div>
                    <button onClick={quitActiveInterview} style={dashboardStyles.quitBtn}>Quit Practice</button>
                  </div>

                  {activeInterview && (
                    <div style={dashboardStyles.interviewArena}>
                      {/* Progress Bar */}
                      <div style={dashboardStyles.progressBarContainer}>
                        <div style={{
                          ...dashboardStyles.progressBarFill,
                          width: `${((currentQuestionIdx) / activeInterview.questions.length) * 100}%`
                        }} />
                      </div>
                      <span style={dashboardStyles.questionStepText}>
                        Question {currentQuestionIdx + 1} of {activeInterview.questions.length}
                      </span>

                      {/* Question Text */}
                      <div style={dashboardStyles.questionBubble}>
                        <p style={dashboardStyles.questionText}>{activeInterview.questions[currentQuestionIdx]}</p>
                      </div>

                      {/* Student Input Answer */}
                      <div style={dashboardStyles.answerInputGroup}>
                        <label style={dashboardStyles.answerLabel}>Your Assessment Answer:</label>
                        <textarea
                          rows="5"
                          placeholder="Type your explanation using core technical terminologies..."
                          value={typedAnswer}
                          onChange={(e) => setTypedAnswer(e.target.value)}
                          style={dashboardStyles.answerTextArea}
                        />
                      </div>

                      <div style={dashboardStyles.simFooter}>
                        <p style={dashboardStyles.simTip}>💡 Your answer is evaluated locally against keyword metrics.</p>
                        <button
                          onClick={submitAIAnswer}
                          disabled={submittingAnswer || !typedAnswer.trim()}
                          style={dashboardStyles.submitAnswerBtn}
                        >
                          {submittingAnswer ? "Evaluating Response..." : currentQuestionIdx === activeInterview.questions.length - 1 ? "Complete Interview" : "Submit & Next Question ➔"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Finished Evaluation Screen */}
                  {interviewFinishedResult && (
                    <div style={dashboardStyles.evaluationReport}>
                      <div style={dashboardStyles.evalHeader}>
                        <span style={dashboardStyles.congratsIcon}>🏆</span>
                        <div>
                          <h4 style={dashboardStyles.evalHeading}>Mock Session Evaluated Successfully!</h4>
                          <p style={dashboardStyles.evalSubheading}>Your feedback is saved in database history metrics.</p>
                        </div>
                      </div>

                      <div style={dashboardStyles.scoreSection}>
                        <span style={dashboardStyles.scoreText}>Cumulative Technical Score:</span>
                        <h2 style={dashboardStyles.finalScore}>{interviewFinishedResult.score}%</h2>
                      </div>

                      <div style={dashboardStyles.feedbackSection}>
                        <h4 style={dashboardStyles.feedbackHeader}>AI Evaluation Insights:</h4>
                        <pre style={dashboardStyles.feedbackText}>{interviewFinishedResult.feedback}</pre>
                      </div>

                      <button onClick={quitActiveInterview} style={dashboardStyles.restartBtn}>Back to Prep Lobby</button>
                    </div>
                  )}
                </div>
              ) : (
                /* Regular Job Board View */
                <div>
                  <h2 style={dashboardStyles.sectionTitle}>Eligible Placement Opportunities</h2>
                  {loading ? (
                    <p>Loading vacancies...</p>
                  ) : jobs.length === 0 ? (
                    <div style={dashboardStyles.emptyState}>No job openings posted at this moment.</div>
                  ) : (
                    <div style={dashboardStyles.jobGrid}>
                      {jobs.map((job) => {
                        const hasApplied = applications.some((app) => app.job?._id === job._id);
                        return (
                          <div key={job._id} style={dashboardStyles.jobCard}>
                            <div>
                              <div style={dashboardStyles.jobHeader}>
                                <h3 style={dashboardStyles.jobTitle}>{job.title}</h3>
                                <span style={dashboardStyles.salaryBadge}>{job.salary}</span>
                              </div>
                              <p style={dashboardStyles.companyLabel}>🏢 {job.company}</p>
                              <p style={dashboardStyles.jobDescription}>{job.description}</p>
                              <div style={dashboardStyles.tagContainer}>
                                {job.requirements.map((req, i) => (
                                  <span key={i} style={dashboardStyles.skillTag}>{req}</span>
                                ))}
                              </div>
                            </div>
                            <div style={dashboardStyles.jobFooter}>
                              <span style={dashboardStyles.cgpaCriteria}>
                                Min. CGPA Criteria: <strong>{job.eligibilityCGPA}</strong>
                              </span>
                              <button
                                onClick={() => handleApply(job._id)}
                                disabled={hasApplied}
                                style={{
                                  ...dashboardStyles.applyBtn,
                                  backgroundColor: hasApplied ? "#9ca3af" : "#2563eb",
                                  cursor: hasApplied ? "not-allowed" : "pointer",
                                }}
                              >
                                {hasApplied ? "✓ Applied" : "Apply Now"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: AI Arena Trigger Lobby & Application Tracker */}
            <div>
              {/* AI Interview Prep lobby */}
              {!isPrepActive && (
                <div style={dashboardStyles.lobbyCard}>
                  <div style={dashboardStyles.lobbyHeader}>
                    <span style={dashboardStyles.lobbyIcon}>🤖</span>
                    <div>
                      <h3 style={dashboardStyles.lobbyTitle}>AI Mock Interview Prep</h3>
                      <p style={dashboardStyles.lobbyText}>Evaluate your technical skills with immediate feedback scorecard evaluations.</p>
                    </div>
                  </div>

                  <div style={dashboardStyles.domainSelectGroup}>
                    <label style={dashboardStyles.domainLabel}>Select Interview Domain:</label>
                    <div style={dashboardStyles.domainOptions}>
                      <button
                        onClick={() => setSelectedDomain("frontend")}
                        style={{
                          ...dashboardStyles.domainBtn,
                          backgroundColor: selectedDomain === "frontend" ? "#eff6ff" : "#ffffff",
                          borderColor: selectedDomain === "frontend" ? "#2563eb" : "#d1d5db",
                        }}
                      >
                        Frontend Development
                      </button>
                      <button
                        onClick={() => setSelectedDomain("backend")}
                        style={{
                          ...dashboardStyles.domainBtn,
                          backgroundColor: selectedDomain === "backend" ? "#eff6ff" : "#ffffff",
                          borderColor: selectedDomain === "backend" ? "#2563eb" : "#d1d5db",
                        }}
                      >
                        Backend Node/DB API
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => startNewAIInterview(selectedDomain)}
                    style={dashboardStyles.startPrepBtn}
                  >
                    Start AI Prep Session
                  </button>

                  {/* Previous Interview Scorecards */}
                  {interviewHistory.length > 0 && (
                    <div style={dashboardStyles.historyTimeline}>
                      <h4 style={dashboardStyles.historyHeader}>Past Evaluation History</h4>
                      <div style={dashboardStyles.historyList}>
                        {interviewHistory.map((item) => (
                          <div key={item._id} style={dashboardStyles.historyItem}>
                            <div>
                              <strong style={dashboardStyles.historyDomain}>Domain: {item.domain}</strong>
                              <p style={dashboardStyles.historyDate}>
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span style={{
                              ...dashboardStyles.scoreBadge,
                              backgroundColor: item.score >= 70 ? "#ecfdf5" : "#fffbeb",
                              color: item.score >= 70 ? "#047857" : "#d97706"
                            }}>
                              Score: {item.score}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Application Status Tracker */}
              <div style={{ marginTop: "32px" }}>
                <h2 style={dashboardStyles.sectionTitle}>My Job Submissions</h2>
                {applications.length === 0 ? (
                  <div style={dashboardStyles.emptyState}>You haven't applied to any roles yet.</div>
                ) : (
                  <div style={dashboardStyles.submissionList}>
                    {applications.map((app) => (
                      <div key={app._id} style={dashboardStyles.submissionCard}>
                        <div>
                          <h4 style={dashboardStyles.submissionTitle}>{app.job?.title}</h4>
                          <p style={dashboardStyles.submissionSub}>{app.job?.company}</p>
                        </div>
                        <span style={{
                          ...dashboardStyles.badge,
                          backgroundColor: "#ecfdf5",
                          color: "#047857",
                        }}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* MODAL: POST A JOB (RECRUITERS) */}
        {showPostModal && (
          <div style={dashboardStyles.modalOverlay}>
            <div style={dashboardStyles.modalContent}>
              <div style={dashboardStyles.modalHeader}>
                <h3>Post a Recruitment Drive</h3>
                <button onClick={() => setShowPostModal(false)} style={dashboardStyles.closeBtn}>×</button>
              </div>
              <form onSubmit={handleJobSubmit} style={dashboardStyles.modalForm}>
                <div style={dashboardStyles.modalInputGroup}>
                  <label>Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer Intern"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  />
                </div>
                <div style={dashboardStyles.modalInputGroup}>
                  <label>Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google"
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                  />
                </div>
                <div style={dashboardStyles.modalInputGroup}>
                  <label>Salary Package</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12 LPA"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  />
                </div>
                <div style={dashboardStyles.modalInputGroup}>
                  <label>Required CGPA Eligibility</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 7.5"
                    value={jobForm.eligibilityCGPA}
                    onChange={(e) => setJobForm({ ...jobForm, eligibilityCGPA: e.target.value })}
                  />
                </div>
                <div style={dashboardStyles.modalInputGroup}>
                  <label>Key Requirements (Comma Separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React, Node.js, MongoDB"
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  />
                </div>
                <div style={dashboardStyles.modalInputGroup}>
                  <label>Job Description</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Provide details about the role..."
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  />
                </div>
                <button type="submit" style={dashboardStyles.submitBtn}>Publish Opportunity</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ==========================================
// 6. STYLE ARCHITECTURES
// ==========================================
const authStyles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: "20px",
  },
  card: {
    padding: "36px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "440px",
  },
  header: {
    textAlign: "center",
    marginBottom: "28px",
  },
  title: {
    margin: "0 0 8px 0",
    color: "#111827",
    fontSize: "26px",
    fontWeight: "700",
  },
  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    outline: "none",
  },
  select: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    backgroundColor: "#ffffff",
    outline: "none",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "6px",
  },
  errorBox: {
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "20px",
    border: "1px solid #fca5a5",
  },
  footerText: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "14px",
    color: "#4b5563",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
  },
};

const dashboardStyles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 40px",
    backgroundColor: "#1f2937",
    color: "#ffffff",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    fontSize: "22px",
  },
  logoText: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  userName: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#e5e7eb",
  },
  roleLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    padding: "2px 8px",
    backgroundColor: "#374151",
    borderRadius: "4px",
    marginLeft: "6px",
    color: "#9ca3af",
  },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "#ef4444",
    border: "none",
    color: "#ffffff",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  main: {
    padding: "40px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  alert: {
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "24px",
    fontSize: "15px",
    fontWeight: "500",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeAlert: {
    border: "none",
    background: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "inherit",
  },
  welcomeBanner: {
    backgroundColor: "#ffffff",
    padding: "24px 32px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
    marginBottom: "32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  welcomeTitle: {
    margin: "0 0 6px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
  },
  welcomeSubtitle: {
    margin: 0,
    fontSize: "15px",
    color: "#4b5563",
  },
  actionBtn: {
    padding: "12px 20px",
    backgroundColor: "#2563eb",
    border: "none",
    color: "#ffffff",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  gridTwoColumn: {
    display: "grid",
    gridTemplateColumns: "1.7fr 1fr",
    gap: "32px",
  },
  gridThreeColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginTop: "20px",
  },
  statCard: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    padding: "24px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  statIcon: {
    fontSize: "32px",
  },
  statNum: {
    margin: "0 0 4px 0",
    fontSize: "28px",
    fontWeight: "800",
    color: "#111827",
  },
  statLabel: {
    margin: 0,
    fontSize: "14px",
    color: "#4b5563",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "20px",
  },
  workspaceSection: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
  },
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#6b7280",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "2px dashed #e5e7eb",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  tr: {
    borderBottom: "1px solid #e5e7eb",
  },
  th: {
    padding: "12px 16px",
    fontWeight: "600",
    color: "#4b5563",
    fontSize: "14px",
  },
  td: {
    padding: "16px",
    fontSize: "15px",
    color: "#111827",
  },
  badge: {
    padding: "6px 12px",
    borderRadius: "14px",
    fontSize: "13px",
    fontWeight: "600",
  },
  jobGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  jobCard: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1px solid #f3f4f6",
  },
  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  jobTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },
  salaryBadge: {
    padding: "4px 10px",
    backgroundColor: "#ecfdf5",
    color: "#047857",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
  },
  companyLabel: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    color: "#4b5563",
    fontWeight: "500",
  },
  jobDescription: {
    fontSize: "14px",
    color: "#374151",
    lineHeight: "1.5",
    margin: "0 0 16px 0",
  },
  tagContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "20px",
  },
  skillTag: {
    padding: "4px 10px",
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
  },
  jobFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f3f4f6",
    paddingTop: "16px",
  },
  cgpaCriteria: {
    fontSize: "13px",
    color: "#4b5563",
  },
  applyBtn: {
    padding: "8px 16px",
    border: "none",
    color: "#ffffff",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
  },
  submissionList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  submissionCard: {
    backgroundColor: "#ffffff",
    padding: "16px 20px",
    borderRadius: "10px",
    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #f3f4f6",
  },
  submissionTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#111827",
  },
  submissionSub: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "#6b7280",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "16px",
    marginBottom: "20px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#9ca3af",
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  modalInputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  submitBtn: {
    padding: "12px",
    backgroundColor: "#2563eb",
    border: "none",
    color: "#ffffff",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  // ==========================================
  // AI INTERVIEW SIMULATOR STYLING
  // ==========================================
  lobbyCard: {
    backgroundColor: "#ffffff",
    padding: "28px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  lobbyHeader: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  lobbyIcon: {
    fontSize: "36px",
  },
  lobbyTitle: {
    margin: "0 0 4px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },
  lobbyText: {
    margin: 0,
    fontSize: "13px",
    color: "#4b5563",
    lineHeight: "1.4",
  },
  domainSelectGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  domainLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },
  domainOptions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  domainBtn: {
    padding: "12px",
    border: "2px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
  },
  startPrepBtn: {
    padding: "14px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    textAlign: "center",
  },
  historyTimeline: {
    marginTop: "12px",
    borderTop: "1px solid #f3f4f6",
    paddingTop: "16px",
  },
  historyHeader: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "180px",
    overflowY: "auto",
  },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    backgroundColor: "#f9fafb",
    border: "1px solid #f3f4f6",
    borderRadius: "8px",
  },
  historyDomain: {
    fontSize: "13px",
    color: "#111827",
    textTransform: "capitalize",
  },
  historyDate: {
    margin: "2px 0 0 0",
    fontSize: "11px",
    color: "#6b7280",
  },
  scoreBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "700",
  },
  aiSimulatorCard: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
  },
  aiSimHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #f3f4f6",
    paddingBottom: "16px",
    marginBottom: "20px",
  },
  aiBadge: {
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.5px",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  aiDomainTitle: {
    margin: "6px 0 0 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },
  quitBtn: {
    padding: "6px 12px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  progressBarContainer: {
    height: "6px",
    backgroundColor: "#e5e7eb",
    borderRadius: "3px",
    marginBottom: "10px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    transition: "width 0.3s ease",
  },
  questionStepText: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "500",
  },
  questionBubble: {
    backgroundColor: "#f3f4f6",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "16px",
    marginBottom: "24px",
    borderLeft: "4px solid #2563eb",
  },
  questionText: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#1f2937",
    lineHeight: "1.5",
  },
  answerInputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "24px",
  },
  answerLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  answerTextArea: {
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    lineHeight: "1.5",
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
  },
  simFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  simTip: {
    margin: 0,
    fontSize: "12px",
    color: "#6b7280",
    maxWidth: "280px",
  },
  submitAnswerBtn: {
    padding: "12px 24px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  // Report Styles
  evaluationReport: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  evalHeader: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  congratsIcon: {
    fontSize: "44px",
  },
  evalHeading: {
    margin: "0 0 4px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#047857",
  },
  evalSubheading: {
    margin: 0,
    fontSize: "13px",
    color: "#4b5563",
  },
  scoreSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    borderRadius: "10px",
  },
  scoreText: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#065f46",
  },
  finalScore: {
    margin: 0,
    fontSize: "36px",
    fontWeight: "800",
    color: "#047857",
  },
  feedbackSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  feedbackHeader: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
  },
  feedbackText: {
    margin: 0,
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    padding: "16px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#4b5563",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
  },
  restartBtn: {
    padding: "12px",
    backgroundColor: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
  },
};

// ==========================================
// 7. MAIN APP ROUTING MAP (DEFAULT EXPORT)
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root URL request to SignIn */}
        <Route path="/" element={<Navigate to="/signin" replace />} />

        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Auth Guarded Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}