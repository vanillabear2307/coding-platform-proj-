import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./QuestionPage.css";
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
      search: "",
      debouncedSearch: "",
      allQuestions: [],
    };
    this.searchTimeout = null;
  }

  componentDidMount() {
    this.fetchAllQuestions();
  }

  componentWillUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  fetchAllQuestions = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/question/all?language=all&tag=all&medium=all`,
        { credentials: "include" }
      );
      let jsonResponse = await response.json();
      if (Array.isArray(jsonResponse)) {
        this.setState({ allQuestions: jsonResponse, loading: "loaded" });
      } else {
        this.setState({ allQuestions: [], loading: "loaded" });
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      this.setState({ allQuestions: [], loading: "loaded" });
    }
  };

  tag = (event) => {
    sessionStorage.setItem("tag", event.target.value);
    this.setState({ tag: event.target.value });
  };

  medium = (event) => {
    sessionStorage.setItem("medium", event.target.value);
    this.setState({ medium: event.target.value });
  };

  language = (event) => {
    localStorage.setItem("language", event.target.value);
    this.setState({ language: event.target.value });
  };

  handleSearchChange = (event) => {
    const value = event.target.value;
    this.setState({ search: value });

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.setState({ debouncedSearch: value });
    }, 300);
  };

  getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case "easy": return "badge-easy";
      case "medium": return "badge-medium";
      case "hard": return "badge-hard";
      default: return "badge-easy";
    }
  };

  render() {
    const { allQuestions, language, tag, medium, debouncedSearch, loading, search } = this.state;
    const { user, authenticated } = this.props;

    // Retrieve solved problem IDs from user object or localStorage fallback
    const solvedIds = user?.solvedProblems || JSON.parse(localStorage.getItem("solved_problems") || "[]");

    // Client-side filtering
    const filteredQuestions = allQuestions.filter((question) => {
      const matchesLanguage = language === "all" || question.language === language;
      const matchesTag = tag === "all" || question.tag === tag;
      const matchesMedium = medium === "all" || question.medium === medium;

      const query = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        question.title.toLowerCase().includes(query) ||
        (question.description && question.description.toLowerCase().includes(query)) ||
        (question.tag && question.tag.toLowerCase().includes(query));

      return matchesLanguage && matchesTag && matchesMedium && matchesSearch;
    });

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

          {/* Filter Bar & Search bar */}
          <div className="filter-bar" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div className="search-group" style={{ flex: "1", minWidth: "200px" }}>
              <input
                className="dark-input"
                placeholder="Search problems by title, description or tag..."
                value={search}
                onChange={this.handleSearchChange}
                style={{ padding: "8px 12px", fontSize: "14px" }}
              />
            </div>
            <div className="filter-group">
              <span className="filter-label">Topic</span>
              <select value={tag} onChange={this.tag} id="filter-tag" className="filter-select">
                <option value="all">All Topics</option>
                <option value="array">Array</option>
                <option value="string">String</option>
                <option value="algorithms">Algorithms</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Difficulty</span>
              <select value={medium} onChange={this.medium} id="filter-difficulty" className="filter-select">
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Language</span>
              <select value={language} onChange={this.language} id="filter-language" className="filter-select">
                <option value="all">All Languages</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="java">Java</option>
                <option value="python3">Python</option>
              </select>
            </div>
          </div>

          {/* Problem Table */}
          {loading === "initial" ? (
            <table className="problem-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Status</th>
                  <th style={{ width: "60px" }}>#</th>
                  <th>Title</th>
                  <th style={{ width: "100px" }}>Difficulty</th>
                  <th style={{ width: "100px" }}>Tag</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="skeleton-row">
                    <td><div className="skeleton-cell" style={{ width: "20px" }}></div></td>
                    <td><div className="skeleton-cell" style={{ width: "20px" }}></div></td>
                    <td>
                      <div className="problem-title-cell">
                        <div className="skeleton-cell" style={{ width: "250px" }}></div>
                        <div className="skeleton-cell" style={{ width: "400px", height: "14px" }}></div>
                      </div>
                    </td>
                    <td><div className="skeleton-cell" style={{ width: "70px" }}></div></td>
                    <td><div className="skeleton-cell" style={{ width: "60px" }}></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : filteredQuestions.length > 0 ? (
            <table className="problem-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Status</th>
                  <th style={{ width: "60px" }}>#</th>
                  <th>Title</th>
                  <th style={{ width: "100px" }}>Difficulty</th>
                  <th style={{ width: "100px" }}>Tag</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question, index) => {
                  const isSolved = solvedIds.includes(question._id);
                  return (
                    <tr
                      key={question._id}
                      className="problem-row"
                      onClick={() => {
                        if (!authenticated) {
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
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                        {isSolved ? (
                          <span className="status-solved" title="Solved">✓</span>
                        ) : (
                          <span className="status-unsolved" title="Unsolved">○</span>
                        )}
                      </td>
                      <td>
                        <span className="problem-num">{index + 1}</span>
                      </td>
                      <td>
                        <div className="problem-title-cell">
                          <span className="problem-title">{question.title}</span>
                          {question.description && (
                            <span className="problem-desc">{question.description}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={this.getDifficultyClass(question.medium)}>
                          {question.medium}
                        </span>
                      </td>
                      <td>
                        <span className="badge-tag">{question.tag}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
              <h3>No problems found</h3>
              <p>Try adjusting your search query or filters.</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
