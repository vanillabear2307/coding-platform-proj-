import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";

const Main = () => {
  const [joined, setJoined] = useState("");
  const history = useHistory();

  const join = (e) => {
    e.preventDefault();
    if (joined !== "") {
      let today = new Date();
      let date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
      history.push(`/thanks/${joined}`, date);
    }
  };

  return (
    <React.Fragment>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content animate-slide-up">
            <h1>Master Algorithms &amp; Data Structures</h1>
            <p>
              Sharpen your coding skills with curated problems, real-time code
              execution, and a competitive programming environment. Join
              thousands of developers leveling up their skills.
            </p>
            <div className="hero-cta">
              <Link to="/compete" className="btn-accent">
                Start Practicing →
              </Link>
              <Link to="/add" className="btn-ghost">
                Contribute Problems
              </Link>
            </div>

            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Problems</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4</span>
                <span className="stat-label">Languages</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Submissions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 style={{ textAlign: 'center' }}>
            Why Practice Competitive Programming?
          </h2>
          <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
            Build the skills that top companies look for. From algorithms to system design,
            practice makes perfect.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'var(--accent-glow)' }}>
                🏢
              </div>
              <h3>Land Top Offers</h3>
              <p>
                Companies like Google, Apple, and Meta actively recruit from
                competitive programming communities. Stand out in technical
                interviews.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'var(--easy-bg)' }}>
                🧩
              </div>
              <h3>Solve Complex Problems</h3>
              <p>
                Train with challenging problems that push your limits. Learn to
                break down complex tasks into elegant, efficient solutions.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'var(--medium-bg)' }}>
                👥
              </div>
              <h3>Build Team Skills</h3>
              <p>
                Competitive programming teaches you to collaborate effectively,
                assess strengths, and divide responsibilities — essential for any
                engineering role.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Stay in the Loop</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Get notified about new problems, contests, and platform updates.
          </p>

          <form className="newsletter-form" onSubmit={join}>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setJoined(e.target.value)}
            />
            <input type="submit" value="Subscribe" />
          </form>
        </div>
      </section>
    </React.Fragment>
  );
};

export default Main;
