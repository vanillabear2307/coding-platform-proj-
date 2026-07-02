import React from "react";
import { Link } from "react-router-dom";

const Main = () => {
  return (
    <React.Fragment>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content animate-slide-up">
            <h1>CodeArena: Competitive Programming Platform</h1>
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
