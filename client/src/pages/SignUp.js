import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// Inline API utility using standard fetch to make the component fully self-contained.
// This resolves any compilation errors in the preview editor while keeping real database connectivity intact.
const API = {
  post: async (endpoint, data) => {
    const response = await fetch(`http://localhost:5000/api${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    const resData = await response.json();
    if (!response.ok) {
      // Throw an error with a response structure matching Axios
      throw { response: { data: resData } };
    }
    return { data: resData };
  }
};

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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Join Career Pilot</h2>
          <p style={styles.subtitle}>Create your profile to start preparation</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              name="name"
              type="text"
              placeholder="John Doe"
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Register As</label>
            <select name="role" onChange={handleChange} style={styles.select}>
              <option value="student">Student (Candidate)</option>
              <option value="recruiter">Recruiter (Company)</option>
              <option value="admin">College Administrator</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p style={styles.footerText}>
          Already registered?{" "}
          <Link to="/signin" style={styles.link}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
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
    color: "#6b728