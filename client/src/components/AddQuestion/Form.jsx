import React, { Component } from "react";
import { Link } from "react-router-dom";
import API_BASE from "../../config";

export default class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tag: `array`,
      title: ``,
      description: ``,
      instruction: ``,
      language: `cpp`,
      medium: `easy`,
      solution: ``,
      testCases: ``,
      status: ``,
    };
  }
  
  componentDidMount() {
    if (!this.props.authenticated) {
      window.location.href = API_BASE
        ? `${API_BASE}/auth/google`
        : "http://localhost:5000/auth/google";
    }
  }
  
  tag = (event) => {
    this.setState({ tag: event.target.value });
  };
  solution = (event) => {
    this.setState({ solution: event.target.value });
  };
  medium = (event) => {
    this.setState({ medium: event.target.value });
  };
  language = (event) => {
    this.setState({ language: event.target.value });
  };
  description = (event) => {
    this.setState({ description: event.target.value });
  };
  instruction = (event) => {
    this.setState({ instruction: event.target.value });
  };
  title = (event) => {
    this.setState({ title: event.target.value });
  };
  testCases = (event) => {
    this.setState({ testCases: event.target.value });
  };

  submit = async (e) => {
    e.preventDefault();
    this.setState({ status: 'saving' });

    try {
      const response = await fetch(`${API_BASE}/question/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: this.state.language,
          tag: this.state.tag,
          description: this.state.description,
          solution: this.state.solution,
          title: this.state.title,
          medium: this.state.medium,
          instruction: this.state.instruction,
          testCases: this.state.testCases,
        }),
      });
      
      if (response.ok) {
        this.setState({ status: 'success' });
        setTimeout(() => {
           window.location.href = '/compete';
        }, 1500);
      } else {
        this.setState({ status: 'error' });
      }
    } catch (err) {
      console.log(err);
      this.setState({ status: 'error' });
    }
  };

  render() {
    if (!this.props.authenticated) return null;
    return (
      <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
        <div className="glass-card" style={{ animation: 'slideUp 0.4s ease' }}>
          <h2 style={{ marginBottom: '24px' }}>Add New Problem</h2>
          
          {this.state.status === 'success' && (
            <div style={{ padding: '16px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--success)' }}>
              Problem added successfully! Redirecting...
            </div>
          )}
          
          {this.state.status === 'error' && (
            <div style={{ padding: '16px', background: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--error)' }}>
              Failed to add problem. Please check your inputs and try again.
            </div>
          )}

          <form onSubmit={this.submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Language</label>
                <select
                  value={this.state.language}
                  onChange={this.language}
                  className="dark-select"
                  style={{ width: '100%' }}
                >
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Topic Tag</label>
                <select
                  value={this.state.tag}
                  onChange={this.tag}
                  className="dark-select"
                  style={{ width: '100%' }}
                >
                  <option value="array">Array</option>
                  <option value="string">String</option>
                  <option value="algorithms">Algorithms</option>
                  <option value="none">None</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Difficulty</label>
                <select
                  value={this.state.medium}
                  onChange={this.medium}
                  className="dark-select"
                  style={{ width: '100%' }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Title</label>
              <input
                required
                type="text"
                onChange={this.title}
                className="dark-input"
                placeholder="e.g. Two Sum"
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Short Description</label>
              <textarea
                onChange={this.description}
                className="dark-textarea"
                style={{ minHeight: '80px' }}
                placeholder="Briefly describe what this problem is about."
              ></textarea>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Instructions (Markdown supported)</label>
              <textarea
                required
                onChange={this.instruction}
                className="dark-textarea"
                style={{ minHeight: '150px' }}
                placeholder="Provide detailed instructions and examples..."
              ></textarea>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Solution / Editorial (Markdown supported)</label>
              <textarea
                required
                onChange={this.solution}
                className="dark-textarea"
                style={{ minHeight: '150px' }}
                placeholder="Explain the approach to solve this problem..."
              ></textarea>
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Test Cases (JSON array)</label>
              <textarea
                required
                onChange={this.testCases}
                className="dark-textarea"
                style={{ minHeight: '120px', fontFamily: 'var(--font-mono)' }}
                placeholder={'[\n  {\n    "input": "2 3",\n    "output": "5"\n  }\n]'}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <Link to="/compete" className="btn-ghost">
                Cancel
              </Link>
              <button 
                type="submit" 
                className="btn-accent"
                disabled={this.state.status === 'saving'}
              >
                {this.state.status === 'saving' ? 'Saving...' : 'Save Problem'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
