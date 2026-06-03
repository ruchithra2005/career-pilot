import React from "react";
import { useNavigate, Link } from "react-router-dom"; // 🚀 Added Link here

function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/signin");
  };

  // Helper method to render dashboard details dynamically based on user role
  const renderDashboardWidgets = () => {
    switch (user?.role) {
      case "recruiter":
        return (
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>💼 Job Management</h3>
              <p style={styles.cardText}>Post and manage recruitment drives for companies.</p>
              <button style={styles.cardBtnBlue}>Post a Job</button>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>👥 Candidates</h3>
              <p style={styles.cardText}>Screen resume profiles and schedule student interviews.</p>
              <button style={styles.cardBtnWhite}>View Applicants</button>
            </div>
          </div>
        );
      case "admin":
        return (
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📊 Analytics</h3>
              <p style={styles.cardText}>Track recruitment progress and system status dashboards.</p>
              {/* 🚀 Route directly to the Visual Analytics Dashboard */}
              <Link to="/analytics" style={{ textDecoration: 'none' }}>
                <button style={styles.cardBtnBlue} className="w-full">Open Metrics</button>
              </Link>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>⚙️ Settings</h3>
              <p style={styles.cardText}>Review student eligibilities and modify placement controls.</p>
              <button style={styles.cardBtnWhite}>Manage System</button>
            </div>
          </div>
        );
      case "student":
      default:
        return (
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🤖 AI Mock Interview</h3>
              <p style={styles.cardText}>Prepare for interview questions with immediate feedback assessments.</p>
              {/* 🚀 Route directly to the Visual Analytics Dashboard */}
              <Link to="/analytics" style={{ textDecoration: 'none' }}>
                <button style={styles.cardBtnBlue} className="w-full">Start Prep</button>
              </Link>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🔍 Placement Opportunities</h3>
              <p style={styles.cardText}>Explore and apply to eligible campus jobs and hiring campaigns.</p>
              <button style={styles.cardBtnWhite}>Browse Jobs</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation Header bar */}
      <nav style={styles.navbar}>
        <div style={styles.logoGroup}>
          <span style={styles.logoIcon}>✈️</span>
          <h2 style={styles.logoText}>Career Pilot</h2>
        </div>
        <div style={styles.userSection}>
          {/* 📊 Quick link in the top nav for students/admins */}
          {user?.role !== "recruiter" && (
            <Link to="/analytics" style={{ color: "#60a5fa", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
              📊 View Scorecards
            </Link>
          )}
          <span style={styles.userName}>{user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.welcomeBanner}>
          <div style={styles.bannerLeft}>
            <h1 style={styles.welcomeTitle}>Welcome back, {user?.name}! 👋</h1>
            <p style={styles.welcomeSubtitle}>
              You are signed in as a <span style={styles.roleHighlight}>{user?.role}</span>.
            </p>
          </div>
          <div style={styles.dateBadge}>
            Today: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Content Modules based on user role */}
        {renderDashboardWidgets()}
      </main>
    </div>
  );
}

const styles = {
  // ... (Keep all your exact style architectures down here unchanged)
  container: { minHeight: "100vh", backgroundColor: "#f3f4f6", fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", backgroundColor: "#1f2937", color: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
  logoGroup: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: { fontSize: "22px" },
  logoText: { margin: 0, fontSize: "20px", fontWeight: "700", letterSpacing: "0.5px" },
  userSection: { display: "flex", alignItems: "center", gap: "20px" },
  userName: { fontSize: "15px", fontWeight: "500", color: "#e5e7eb" },
  logoutBtn: { padding: "8px 16px", backgroundColor: "#ef4444", border: "none", color: "#ffffff", borderRadius: "6px", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s" },
  main: { padding: "40px", maxWidth: "1200px", margin: "0 auto" },
  welcomeBanner: { backgroundColor: "#ffffff", padding: "24px 32px", borderRadius: "12px", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  welcomeTitle: { margin: "0 0 6px 0", fontSize: "24px", fontWeight: "700", color: "#111827" },
  welcomeSubtitle: { margin: 0, fontSize: "15px", color: "#4b5563" },
  roleHighlight: { textTransform: "capitalize", fontWeight: "600", color: "#2563eb" },
  dateBadge: { padding: "8px 16px", backgroundColor: "#eff6ff", color: "#1e40af", borderRadius: "20px", fontSize: "13px", fontWeight: "600" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" },
  card: { backgroundColor: "#ffffff", padding: "28px", borderRadius: "12px", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" },
  cardTitle: { margin: "0 0 12px 0", fontSize: "18px", fontWeight: "700", color: "#111827" },
  cardText: { margin: "0 0 20px 0", fontSize: "14px", color: "#4b5563", lineHeight: "1.5" },
  cardBtnBlue: { padding: "10px 16px", backgroundColor: "#2563eb", border: "none", color: "#ffffff", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", textAlign: "center", width: "100%" },
  cardBtnWhite: { padding: "10px 16px", backgroundColor: "#ffffff", border: "1px solid #d1d5db", color: "#374151", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", textAlign: "center", width: "100%" },
};

export default StudentDashboard;