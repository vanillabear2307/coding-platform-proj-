import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./QuestionPage.css";
import ReactMarkdown from "react-markdown";
import API_BASE from "../../config";

export default class MainPage extends Component {
  constructor(props) {
    super(props);
    let storedTag = sessionStorage.getItem("tag");
    let storedLanguage = localStorage.getItem("language");
    let storedMedium = sessionStorage.getItem("medium");

    this.state = {
      tag: storedTag && storedTag !== "none" ? storedTag : "all",
      loading: "initial",
      language: storedLanguage ? storedLanguage : "all",
      medium: storedMedium ? storedMedium : "all",
    };
  }
  tag = async (event) => {
    sessionStorage.setItem("tag", event.target.value);
    await this.setState({ tag: event.target.value });
    this.handleFilter();
  };
  medium = async (event) => {
    sessionStorage.setItem("medium", event.target.value);
    await this.setState({ medium: event.target.value });
    this.handleFilter();
  };
  language = async (event) => {
    localStorage.setItem("language", event.target.value);
    await this.setState({ language: event.target.value });

    this.handleFilter();
  };
  componentDidMount() {
    this.handleFilter();
  }
  handleFilter = async () => {
    try {
      // ✅ fixed: was malformed `/:?language=...` — now uses /question/all with proper query params
      const response = await fetch(
        `${API_BASE}/question/all?language=${this.state.language}&tag=${this.state.tag}&medium=${this.state.medium}`,
        { credentials: 'include' }
      );
  
      let jsonResponse = await response.json();
    

      this.setState({ info: jsonResponse, loading: "loaded" });
    } catch (err) {
      console.log(err);
    }
  };

  getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'badge-easy';
      case 'medium': return 'badge-medium';
      case 'hard': return 'badge-hard';
      default: return 'badge-easy';
    }
  };

  render() {
    if (this.state.loading === "initial") {
      return (
        <div className="problems-page">
          <div className="container">
            <div className="empty-state">
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
              <h3>Loading problems...</h3>
            </div>
          </div>
        </div>
      );
    }
    if (this.state.loading === "loaded") {
      return (
        <div className="problems-page">
          <div className="container">
            {/* Header */}
            <div className="problems-header">
              <h2>Problem Set</h2>
              <Link to="/add" className="btn-accent" id="add-question-btn">
                + Add Problem
              </Link>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
              <div className="filter-group">
                <span className="filter-label">Topic</span>
                <select
                  value={this.state.tag}
                  onChange={this.tag}
                  id="filter-tag"
                  className="filter-select"
                >
                  <option value="array">Array</option>
                  <option value="string">String</option>
                  <option value="algorithms">Algorithms</option>
                  <option value="all">All Topics</option>
                </select>
              </div>
              <div className="filter-group">
                <span className="filter-label">Difficulty</span>
                <select
                  value={this.state.medium}
                  onChange={this.medium}
                  id="filter-difficulty"
                  className="filter-select"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Problem Table */}
            {this.state.info && this.state.info.length > 0 ? (
              <table className="problem-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>#</th>
                    <th>Title</th>
                    <th style={{ width: '100px' }}>Difficulty</th>
                    <th style={{ width: '100px' }}>Tag</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.info.map((question, index) => (
                    <tr 
                      key={question._id}
                      className="problem-row"
                      onClick={() => {
                        if (!this.props.authenticated) {
                          window.location.href = API_BASE
                            ? `${API_BASE}/auth/google`
                            : "http://localhost:5000/auth/google";
                          return;
                        }
                        this.props.history.push({
                          pathname: `/codingpage/${question._id}`,
                          query: {
                            instruction: question.instruction,
                            solution: question.solution,
                            testCases: question.testCases,
                            id: question._id,
                          },
                        });
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <span className="problem-num">{index + 1}</span>
                      </td>
                      <td>
                        <div className="problem-title-cell">
                          <span className="problem-title">
                            {question.title}
                          </span>
                          {question.description && (
                            <span className="problem-desc">
                              {question.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={this.getDifficultyClass(question.medium)}>
                          {question.medium}
                        </span>
                      </td>
                      <td>
                        <span className="badge-tag">
                          {question.tag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <h3>No problems found</h3>
                <p>Try adjusting your filters or add a new problem.</p>
              </div>
            )}
          </div>
        </div>
      );
    }
  }
}
