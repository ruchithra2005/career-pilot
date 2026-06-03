import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import Dashboard from './components/Dashboard';

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
// 5. UNIFIED PORTAL WORKSPACE (ROLE-BASED SEPARATION)
// ==========================================
function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
   
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const [isPrepActive, setIsPrepActive] = useState(false);
  const [activeInterview, setActiveInterview] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [interviewFinishedResult, setInterviewFinishedResult] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const startNewAIInterview = async (domain) => {
    setLoading(true);
    try {
      const res = await API.post("/ai/start", { domain });
      setActiveInterview({ id: res.data.interviewId, questions: res.data.questions, domain: domain });
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
      const res = await API.post("/ai/submit", { interviewId: activeInterview.id, questionIndex: currentQuestionIdx, answer: typedAnswer });
      if (res.data.isCompleted) {
        setInterviewFinishedResult({ score: res.data.score, feedback: res.data.feedback });
        setActiveInterview(null);
      } else {
        setCurrentQuestionIdx((prev) => prev + 1);
        setTypedAnswer("");
      }
    } catch (err) {
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

  // 🎯 FIXED: Dynamic role router engine serves unique interface blueprints matching credential tokens
  const renderDashboardWidgets = () => {
    switch (user?.role) {
      case "recruiter":
        return (
          <div style={dashboardStyles.grid}>
            <div style={dashboardStyles.card}>
              <div>
                <h3 style={dashboardStyles.cardTitle}>💼 Job Opening Control Hub</h3>
                <p style={dashboardStyles.cardText}>Create, publish, and audit campus recruitment drives and structured corporate job openings.</p>
              </div>
              <button style={dashboardStyles.cardBtnBlue}>Post New Opening</button>
            </div>
            <div style={dashboardStyles.card}>
              <div>
                <h3 style={dashboardStyles.cardTitle}>👥 Candidate Profiles Pipeline</h3>
                <p style={dashboardStyles.cardText}>Track incoming student applications, review technical resumes, and monitor grading scorecards.</p>
              </div>
              <button style={dashboardStyles.cardBtnWhite}>Review Applicants</button>
            </div>
          </div>
        );
      case "admin":
        return (
          <div style={dashboardStyles.grid}>
            <div style={dashboardStyles.card}>
              <div>
                <h3 style={dashboardStyles.cardTitle}>📊 Institutional Administration</h3>
                <p style={dashboardStyles.cardText}>Access global data clusters, trace active connection endpoints, and compile campus hiring statistics.</p>
              </div>
              <button style={dashboardStyles.cardBtnBlue}>Launch Cluster Monitor</button>
            </div>
          </div>
        );
      case "student":
      default:
        return (
          <div style={dashboardStyles.grid}>
            <div style={dashboardStyles.card}>
              <div>
                <h3 style={dashboardStyles.cardTitle}>🤖 AI Mock Interview</h3>
                <p style={dashboardStyles.cardText}>Prepare for critical real-world evaluation questions with immediate feedback scorecard assessments.</p>
              </div>
              <button 
                onClick={() => startNewAIInterview("frontend")} 
                disabled={loading}
                style={{
                  ...dashboardStyles.cardBtnBlue,
                  backgroundColor: loading ? "#93c5fd" : "#2563eb",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Initializing Sandbox..." : "Start Practice Arena"}
              </button>
            </div>
            <div style={dashboardStyles.card}>
              <div>
                <h3 style={dashboardStyles.cardTitle}>🔍 Placement Opportunities</h3>
                <p style={dashboardStyles.cardText}>Explore and apply to eligible campus recruitment drives and structured hiring campaigns.</p>
              </div>
              <button style={dashboardStyles.cardBtnWhite}>Browse Jobs</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={dashboardStyles.container}>
      <nav style={dashboardStyles.navbar}>
        <div style={dashboardStyles.logoGroup}>
          <span style={dashboardStyles.logoIcon}>✈️</span>
          <h2 style={dashboardStyles.logoText}>Career Pilot</h2>
        </div>
        <div style={dashboardStyles.userSection}>
          {/* 🎯 FIXED: View Scorecards now transmits actual test session properties straight through your React Router state */}
          {user?.role === "student" && (
            <Link 
              to="/analytics" 
              state={{ activeReport: interviewFinishedResult }}
              style={{ color: "#38bdf8", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}
            >
              📊 View Live Scorecard
            </Link>
          )}
          <span style={dashboardStyles.userName}>{user?.name}</span>
          <button onClick={handleLogout} style={dashboardStyles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <main style={dashboardStyles.main}>
        <div style={dashboardStyles.welcomeBanner}>
          <div>
            <h1 style={dashboardStyles.welcomeTitle}>Welcome back, {user?.name}! 👋</h1>
            <p style={dashboardStyles.welcomeSubtitle}>You are securely signed in as a <span style={{ color: "#2563eb", fontWeight: "700" }}>{user?.role}</span>.</p>
          </div>
          <div style={{ padding: "8px 18px", backgroundColor: "#eff6ff", color: "#1e40af", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>
            Today: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {message.text && (
          <div style={{ ...dashboardStyles.alert, backgroundColor: "#fef2f2", color: "#b91c1c", padding: "12px 20px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #fee2e2", fontWeight: "500" }}>
            {message.text}
          </div>
        )}

        {isPrepActive && user?.role === "student" ? (
          <div style={dashboardStyles.aiSimulatorCard}>
            <div style={dashboardStyles.aiSimHeader}>
              <div>
                <span style={dashboardStyles.aiBadge}>🤖 AI INTERVIEW SIMULATOR</span>
                <h3 style={dashboardStyles.aiDomainTitle}>Engineering Domain: FRONTEND</h3>
              </div>
              <button onClick={quitActiveInterview} style={dashboardStyles.quitBtn}>Quit Practice</button>
            </div>

            {!interviewFinishedResult ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={dashboardStyles.progressBarContainer}>
                  <div style={{ ...dashboardStyles.progressBarFill, width: `${((currentQuestionIdx + 1) / (activeInterview?.questions?.length || 3)) * 100}%` }} />
                </div>
                <span style={dashboardStyles.questionStepText}>Question {currentQuestionIdx + 1} of {activeInterview?.questions?.length || 3}</span>
                <div style={dashboardStyles.questionBubble}>
                  <p style={dashboardStyles.questionText}>{activeInterview?.questions ? activeInterview.questions[currentQuestionIdx] : "Loading engineering assessment prompt..."}</p>
                </div>
                <div style={dashboardStyles.answerInputGroup}>
                  <label style={dashboardStyles.answerLabel}>Your Assessment Answer:</label>
                  <textarea rows="6" placeholder="Type your full comprehensive explanation here using standard industry terminologies..." value={typedAnswer} onChange={(e) => setTypedAnswer(e.target.value)} style={dashboardStyles.answerTextArea} />
                </div>
                <div style={dashboardStyles.simFooter}>
                  <p style={dashboardStyles.simTip}>💡 Response metrics are auto-evaluated dynamically upon completing submission checks.</p>
                  <button onClick={submitAIAnswer} disabled={submittingAnswer || !typedAnswer.trim()} style={dashboardStyles.submitAnswerBtn}>
                    {submittingAnswer ? "Evaluating Response..." : currentQuestionIdx === (activeInterview?.questions?.length || 3) - 1 ? "Complete Interview" : "Submit & Next Question ➔"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={dashboardStyles.evaluationReport}>
                <div style={dashboardStyles.evalHeader}>
                  <span style={dashboardStyles.congratsIcon}>🏆</span>
                  <div>
                    <h4 style={dashboardStyles.evalHeading}>Mock Session Evaluated Successfully!</h4>
                    <p style={dashboardStyles.evalSubheading}>Your telemetry marks are committed directly to your permanent history ledger.</p>
                  </div>
                </div>
                
                <div style={dashboardStyles.scoreSection}>
                  <span style={dashboardStyles.scoreText}>Cumulative Technical Score:</span>
                  <h2 style={dashboardStyles.finalScore}>{interviewFinishedResult.score}%</h2>
                </div>

                <div style={dashboardStyles.feedbackSection}>
                  <h4 style={dashboardStyles.feedbackHeader}>AI Evaluation Insights:</h4>
                  <div style={dashboardStyles.feedbackText}>
                    {(() => {
                      try {
                        if (typeof interviewFinishedResult.feedback === 'string' && interviewFinishedResult.feedback.trim().startsWith('{')) {
                          const parsedLocalData = JSON.parse(interviewFinishedResult.feedback);
                          return (
                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                              <p style={{ margin: 0, fontWeight: "600", color: "#1e293b" }}>
                                {parsedLocalData.overallInsights}
                              </p>
                              {parsedLocalData.questions?.map((item, idx) => (
                                <div key={idx} style={{ marginTop: "12px", padding: "16px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                  <strong style={{ color: "#2563eb", display: "block", marginBottom: "6px", fontSize: "15px" }}>{item.title}</strong>
                                  <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#475569", fontStyle: "italic", lineHeight: "1.5" }}>"{item.text}"</p>
                                  <p style={{ margin: 0, fontSize: "13px", color: "#b45309", fontWeight: "600" }}>
                                    🎯 Recommendation: <span style={{ fontWeight: "500", color: "#78350f" }}>{item.recommendations}</span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          );
                        }
                      } catch (e) {
                        console.error("Local render tracking issue:", e);
                      }
                      return interviewFinishedResult.feedback;
                    })()}
                  </div>
                </div>
                <button onClick={quitActiveInterview} style={dashboardStyles.restartBtn}>Back to Prep Lobby</button>
              </div>
            )}
          </div>
        ) : (
          renderDashboardWidgets()
        )}
      </main>
    </div>
  );
}

const authStyles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Segoe UI', Roboto, sans-serif", padding: "24px", boxSizing: "border-box" },
  card: { padding: "40px", borderRadius: "16px", backgroundColor: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", border: "1px solid #e2e8f0", width: "100%", maxWidth: "440px", boxSizing: "border-box" },
  header: { textAlign: "center", marginBottom: "32px" },
  title: { margin: "0 0 8px 0", color: "#0f172a", fontSize: "26px", fontWeight: "800", letterSpacing: "-0.025em" },
  subtitle: { margin: 0, color: "#64748b", fontSize: "14px", fontWeight: "500" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", color: "#334155", outline: "none", backgroundColor: "#ffffff" },
  select: { padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", backgroundColor: "#ffffff", color: "#334155", outline: "none" },
  button: { padding: "14px", borderRadius: "8px", border: "none", backgroundColor: "#2563eb", color: "#ffffff", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginTop: "8px", boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)" },
  errorBox: { padding: "12px 16px", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "8px", fontSize: "14px", textAlign: "center", marginBottom: "24px", border: "1px solid #fee2e2", fontWeight: "500" },
  footerText: { textAlign: "center", marginTop: "28px", fontSize: "14px", color: "#64748b", fontWeight: "500" },
  link: { color: "#2563eb", textDecoration: "none", fontWeight: "600" }
};

const dashboardStyles = {
  container: { minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Segoe UI', Roboto, sans-serif" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", backgroundColor: "#0f172a", color: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
  logoGroup: { display: "flex", alignItems: "center", gap: "12px" },
  logoIcon: { fontSize: "24px" },
  logoText: { margin: 0, fontSize: "20px", fontWeight: "800", letterSpacing: "-0.025em" },
  userSection: { display: "flex", alignItems: "center", gap: "24px" },
  userName: { fontSize: "14px", fontWeight: "600", color: "#e2e8f0" },
  logoutBtn: { padding: "8px 16px", backgroundColor: "#ef4444", border: "none", color: "#ffffff", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  main: { padding: "40px", maxWidth: "1200px", margin: "0 auto", boxSizing: "border-box" },
  welcomeBanner: { backgroundColor: "#ffffff", padding: "32px", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" },
  welcomeTitle: { margin: "0 0 6px 0", fontSize: "26px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.025em" },
  welcomeSubtitle: { margin: 0, fontSize: "15px", color: "#475569", fontWeight: "500" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" },
  card: { backgroundColor: "#ffffff", padding: "32px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "220px", boxSizing: "border-box" },
  cardTitle: { margin: "0 0 12px 0", fontSize: "20px", fontWeight: "700", color: "#0f172a" },
  cardText: { margin: "0 0 24px 0", fontSize: "14px", color: "#475569", lineHeight: "1.6" },
  cardBtnBlue: { padding: "12px 24px", backgroundColor: "#2563eb", border: "none", color: "#ffffff", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", textAlign: "center", width: "100%", boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)" },
  cardBtnWhite: { padding: "12px 24px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", textAlign: "center", width: "100%" },
  
  aiSimulatorCard: { backgroundColor: "#ffffff", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", border: "1px solid #e2e8f0", boxSizing: "border-box" },
  aiSimHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "20px", marginBottom: "28px" },
  aiBadge: { fontSize: "11px", fontWeight: "700", letterSpacing: "0.05em", color: "#2563eb", backgroundColor: "#eff6ff", padding: "6px 12px", borderRadius: "20px", border: "1px solid #bfdbfe" },
  aiDomainTitle: { margin: "10px 0 0 0", fontSize: "22px", fontWeight: "800", color: "#0f172a" },
  quitBtn: { padding: "8px 16px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  progressBarContainer: { height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", marginBottom: "12px", overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#2563eb" },
  questionStepText: { fontSize: "13px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" },
  questionBubble: { backgroundColor: "#f8fafc", padding: "24px", borderRadius: "12px", marginTop: "16px", marginBottom: "28px", borderLeft: "4px solid #2563eb", borderTop: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" },
  questionText: { margin: 0, fontSize: "16px", fontWeight: "600", color: "#1e293b", lineHeight: "1.6" },
  answerInputGroup: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" },
  answerLabel: { fontSize: "14px", fontWeight: "700", color: "#334155" },
  answerTextArea: { padding: "16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", lineHeight: "1.6", fontFamily: "inherit", outline: "none", resize: "vertical", backgroundColor: "#ffffff", color: "#334155" },
  simFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", borderTop: "1px solid #e2e8f0", paddingTop: "20px" },
  simTip: { margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "500" },
  submitAnswerBtn: { padding: "12px 28px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)" },
  
  evaluationReport: { display: "flex", flexDirection: "column", gap: "24px" },
  evalHeader: { display: "flex", gap: "16px", alignItems: "center" },
  congratsIcon: { fontSize: "48px" },
  evalHeading: { margin: "0 0 4px 0", fontSize: "22px", fontWeight: "800", color: "#065f46" },
  evalSubheading: { margin: 0, fontSize: "14px", color: "#475569", fontWeight: "500" },
  scoreSection: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "12px" },
  scoreText: { fontSize: "16px", fontWeight: "700", color: "#065f46" },
  finalScore: { margin: 0, fontSize: "40px", fontWeight: "900", color: "#047857" },
  feedbackSection: { display: "flex", flexDirection: "column", gap: "10px" },
  feedbackHeader: { margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" },
  feedbackText: { margin: 0, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "10px", fontSize: "14px", color: "#475569", lineHeight: "1.6", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit" },
  restartBtn: { padding: "14px", backgroundColor: "#0f172a", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", textAlign: "center" }
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}