import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const Dashboard = ({ evaluationData }) => {
  const location = useLocation();
  
  // 🎯 FIXED: Prioritizes active navigation context strings dispatched out of the live test loops
  const liveSessionReport = evaluationData || location.state?.activeReport;

  const getParsedData = () => {
    if (!liveSessionReport) return null;
    try {
      if (typeof liveSessionReport.feedback === 'string' && liveSessionReport.feedback.trim().startsWith('{')) {
        return JSON.parse(liveSessionReport.feedback);
      }
    } catch (e) {
      console.error("Payload extraction issue:", e);
    }
    return liveSessionReport;
  };

  const activePayload = getParsedData();

  const data = (activePayload?.feedback && typeof activePayload.feedback === 'object') ? activePayload.feedback : (activePayload || {
    score: 85,
    domain: "FRONTEND",
    overallInsights: "Overall, the candidate demonstrates a strong grasp of modern frontend architecture, performance optimization, and state management, showcasing practical experience and theoretical depth.",
    questions: [
      {
        id: 1,
        title: "Question 1: Frontend Architecture",
        text: "How do you approach designing a scalable and maintainable frontend architecture for a complex application?",
        strengths: ["Clear Component Organization: Feature-backed atomic design structure."],
        weaknesses: ["Minor Nuance on state container constraints."],
        recommendations: "Consider briefly mentioning how modern React Hooks alter traditional implementations."
      }
    ]
  });

  const [activeQuestion, setActiveQuestion] = useState(null);

  const pageStyle = {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "40px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Segoe UI', Roboto, Helvetica, sans-serif",
    boxSizing: "border-box"
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e2e8f0",
    marginBottom: "24px",
    boxSizing: "border-box"
  };

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ margin: "0 0 6px 0", fontSize: "28px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.025em" }}>Career Pilot Analytics</h1>
        <p style={{ margin: 0, fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Performance review powered by live Google Gemini AI telemetry</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {/* Score Card */}
        <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Technical Score</p>
            <h3 style={{ margin: "6px 0 0 0", fontSize: "36px", fontWeight: "900", color: "#0f172a" }}>{data.score}%</h3>
          </div>
          <div style={{ width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
            <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 36 36">
              <path stroke="#f1f5f9" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path stroke="#2563eb" strokeDasharray={`${data.score}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span style={{ position: "absolute", fontSize: "12px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>Pass</span>
          </div>
        </div>

        {/* Domain Card */}
        <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Target Domain</p>
          <div style={{ display: "inline-block", margin: "12px 0 6px 0", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", backgroundColor: "#f3e8ff", color: "#6b21a8", border: "1px solid #e9d5ff" }}>
            ⚡ {data.domain}
          </div>
        </div>

        {/* Status Card */}
        <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Session Status</p>
          <div style={{ display: "inline-block", margin: "12px 0 6px 0", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", backgroundColor: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" }}>
            ✓ Evaluation Complete
          </div>
        </div>
      </div>

      {/* AI Insights Block */}
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>🤖 Overall AI Insights</h2>
        <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: "1.6", backgroundColor: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
          {data.overallInsights || (typeof liveSessionReport?.feedback === 'string' ? liveSessionReport.feedback : "Metrics committed to cluster history.")}
        </p>
      </div>

      {/* Breakdown List */}
      {data.questions && Array.isArray(data.questions) && (
        <div style={{ marginTop: "32px" }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Itemized Evaluation Breakdown</h2>
          {data.questions.map((q, index) => (
            <div key={q.id || index} style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "16px", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
              <button
                onClick={() => setActiveQuestion(activeQuestion === index ? null : index)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{q.title || `Question ${index + 1}`}</span>
                <span style={{ fontSize: "20px", fontWeight: "bold", color: "#94a3b8" }}>{activeQuestion === index ? '−' : '+'}</span>
              </button>

              {activeQuestion === index && (
                <div style={{ padding: "24px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Question Prompt</h4>
                    <p style={{ margin: 0, fontSize: "14px", color: "#334155", fontStyle: "italic", lineHeight: "1.6" }}>
                      "{q.text || q.question || "No evaluation question text available."}"
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "20px" }}>
                    <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "20px", borderRadius: "12px" }}>
                      <h5 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "700", color: "#166534" }}>💪 Key Strengths</h5>
                      <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#14532d", lineHeight: "1.6" }}>
                        {q.strengths?.map((s, i) => <li key={i}>{s}</li>) || <li>Demonstrated basic engagement metrics.</li>}
                      </ul>
                    </div>

                    <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fef08a", padding: "20px", borderRadius: "12px" }}>
                      <h5 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "700", color: "#854d0e" }}>⚠️ Areas for Improvement</h5>
                      <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#713f12", lineHeight: "1.6" }}>
                        {q.weaknesses?.map((w, i) => <li key={i}>{w}</li>) || <li>Expand theoretical depth and code optimization details.</li>}
                      </ul>
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "20px", borderRadius: "12px" }}>
                    <h5 style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: "700", color: "#1e40af" }}>🎯 Actionable Recommendation</h5>
                    <p style={{ margin: 0, fontSize: "13px", color: "#1e3a8a", lineHeight: "1.6" }}>{q.recommendations || "Thoroughly review domain concepts before your next interview iteration."}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;