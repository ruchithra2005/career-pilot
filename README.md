# ✈️ Career Pilot

Career Pilot is a premium, high-definition AI-powered mock interview and campus placement portal designed to help engineering candidates bridge the gap between preparation and recruitment. Featuring role-based dashboards, interactive assessment simulators, and real-time telemetry analytics.

---

## 🚀 Key Engineering Enhancements

### 🤖 Hybrid AI Evaluation Engine & Fault-Tolerant Fallback
* **Google Gemini AI Telemetry:** Deep integration with the Google Gemini API to analyze candidate technical responses dynamically.
* **Resilient Offline Fallback Grader:** Built-in fault-tolerant layer that seamlessly catches API rate caps (`HTTP 429 Resource Exhausted`) without interrupting the application flow.
* **Keyword Matching & Heuristics:** Falls back to an optimized, local token-matching algorithm that calculates semantic keyword ratios, logs actionable recommendations, and ensures candidates always receive structural scores.

### 👥 Advanced Role-Based Workspaces
* **Student/Candidate Arena:** Features an interactive interview simulator equipped with dynamic progress bars, structured text fields, and detailed breakdown analytics cards.
* **Recruiter Control Hub:** A separate corporate interface allowing recruiters to seamlessly post active job openings and track applicant screening pipelines.
* **Institution Administrator Panel:** Dedicated space for campus placement coordinators to track platform statistics and evaluate institutional outcomes.

### 🎨 Premium UI/UX Architecture
* **SaaS Design Philosophy:** Built entirely with a crisp, modern slate/indigo color system (`#0f172a`), refined elevations, and consistent padding metrics.
* **Strict Layout Boundaries:** Hardened text-wrapping rules (`word-break: break-word`) applied across all scorecards to perfectly contain long-form AI insights and text blocks across variable viewports.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** React.js, React Router DOM (Dynamic History State Mapping)
* **Backend:** Node.js, Express.js (RESTful Core Router)
* **Database:** MongoDB (Telemetry History Ledger & User Indexes)
* **AI Processing:** Google Gemini API (`gemini-2.5-flash`)

---

## 🏃‍♂️ Getting Started Locally

### 1. Clone the repository
```bash
git clone [https://github.com/ruchithra2005/career-pilot.git](https://github.com/ruchithra2005/career-pilot.git)
cd career-pilot