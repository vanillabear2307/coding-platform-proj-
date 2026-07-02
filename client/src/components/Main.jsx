import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_BASE from "../config";

const Main = () => {
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(`${API_BASE}/question/count`);
        const data = await response.json();
        if (data && typeof data.count === "number") {
          // Count up animation
          let count = 0;
          const target = data.count;
          const duration = 800; // ms
          const step = Math.max(1, Math.ceil(target / (duration / 25)));
          const timer = setInterval(() => {
            count += step;
            if (count >= target) {
              setQuestionCount(target);
              clearInterval(timer);
            } else {
              setQuestionCount(count);
            }
          }, 25);
        }
      } catch (err) {
        console.error("Error fetching live stats:", err);
      }
    };
    fetchCount();
  }, []);

  return (
    <React.Fragment>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content animate-slide-up">
            <h1>Code Prep: Competitive Programming Platform</h1>
            <p>
              A full-stack algorithmic coding platform built as a college mini-project. Featuring a secure Docker-based execution engine, real-time code evaluation, and a curated problem set.
            </p>
            <div className="hero-cta">
              <Link to="/compete" className="btn-accent">
                View Problems →
              </Link>
              <Link to="/add" className="btn-ghost">
                Admin Panel
              </Link>
            </div>

            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-number">{questionCount}+</span>
                <span className="stat-label">Problems</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4</span>
                <span className="stat-label">Languages</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">Docker</span>
                <span className="stat-label">Sandboxed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 style={{ textAlign: 'center' }}>
            Project Architecture & Features
          </h2>
          <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
            Built using the MERN stack with a custom containerized execution environment.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'var(--accent-glow)' }}>
                🐳
              </div>
              <h3>Docker Sandbox Execution</h3>
              <p>
                Code submissions are executed in isolated, secure Docker containers with strict memory, CPU, and network limitations.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'var(--easy-bg)' }}>
                ⚡
              </div>
              <h3>Real-Time WebSockets</h3>
              <p>
                Execution outputs are streamed in real-time via Socket.io directly to the frontend React application.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'var(--medium-bg)' }}>
                🧠
              </div>
              <h3>AI/ML Ready</h3>
              <p>
                Designed with architectural support for future AI integrations, including AST-based code plagiarism detection and automated test case generation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default Main;
