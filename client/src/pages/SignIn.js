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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Log in to access your dashboard</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="name@company.com"
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
              placeholder="••••••••"
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footerText}>
          New to Career Pilot?{" "}
          <Link to="/signup" style={styles.link}>
            Create an Account
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
    transition: "border-color 0.2s",
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
    transition: "background-color 0.2s",
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

export default SignIn;