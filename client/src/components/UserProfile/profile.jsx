import React, { Component } from "react";
import { Redirect } from "react-router";
import "./profile.css";
import API_BASE from "../../config";

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: false,
      submissions: [],
    };
  }

  componentDidMount = async () => {
    await this.renderMyData();
  }

  renderMyData = async () => {
    const { match } = this.props;
    try {
      const response = await fetch(`${API_BASE}/profile/${match.params.id}`, {
        credentials: 'include'
      });

      let jsonResponse = await response.json();
      this.setState({ user: jsonResponse });

      if (jsonResponse && Array.isArray(jsonResponse) && jsonResponse.length > 0) {
        const userId = jsonResponse[0]._id;
        const subRes = await fetch(`${API_BASE}/user/submissions/${userId}`, {
          credentials: 'include'
        });
        const subData = await subRes.json();
        if (Array.isArray(subData)) {
          this.setState({ submissions: subData });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    if (this.state.user && Array.isArray(this.state.user) && this.state.user.length > 0) {
      const userObj = this.state.user[0];
      return (
        <div className="profile-page">
          <div className="profile-card" style={{ maxWidth: '750px', width: '100%' }}>
            <img className="profile-photo" src={userObj.photo} alt="Profile" />
            
            <div className="profile-info" style={{ width: '100%' }}>
              <h2 style={{ marginBottom: '24px' }}>Developer Profile</h2>
              
              <div className="profile-info-row">
                <i className="fas fa-user-circle profile-icon"></i>
                <div>
                  <span className="profile-label">Username:</span>
                  <span>{userObj.username}</span>
                </div>
              </div>
              
              <div className="profile-info-row">
                <i className="fas fa-envelope profile-icon"></i>
                <div>
                  <span className="profile-label">Email:</span>
                  <span>{userObj.email}</span>
                </div>
              </div>
              
              <div className="profile-divider"></div>
              
              {/* Stats Cards */}
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="stat-card" style={{ background: 'var(--bg-surface-hover)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                    {userObj.solvedProblems ? userObj.solvedProblems.length : 0}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Solved Problems</div>
                </div>
                <div className="stat-card" style={{ background: 'var(--bg-surface-hover)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-link)' }}>
                    {this.state.submissions ? this.state.submissions.length : 0}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Total Submissions</div>
                </div>
              </div>

              {/* Submissions Table */}
              <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '12px' }}>Recent Submissions</h3>
              {this.state.submissions && this.state.submissions.length > 0 ? (
                <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="submissions-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>Problem</th>
                        <th style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>Language</th>
                        <th style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>Status</th>
                        <th style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>Score</th>
                        <th style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.submissions.map((sub) => (
                        <tr key={sub._id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '500' }}>
                            {sub.question ? sub.question.title : "Deleted Problem"}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '13px', textTransform: 'uppercase' }}>
                            {sub.language}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '600', color: sub.status === 'Accepted' ? 'var(--success)' : 'var(--error)' }}>
                            {sub.status}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>
                            {sub.passedCases} / {sub.totalCases}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '12px 0' }}>
                  <i className="fas fa-history" style={{ marginRight: '8px' }}></i>
                  No submissions yet. Start competing to see your activity!
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else if (this.state.user && this.state.user.err) {
      return (
        <div className="profile-page" style={{ justifyContent: 'center' }}>
          <div className="profile-card" style={{ padding: '40px', textAlign: 'center' }}>
            <i className="fas fa-exclamation-circle fa-3x" style={{ color: 'var(--error)', marginBottom: '16px' }}></i>
            <h3>Error</h3>
            <p style={{ color: 'var(--text-muted)' }}>{this.state.user.err}</p>
          </div>
        </div>
      );
    } else {
      const { match } = this.props;
      return (
        <>
          {match.params.id && match.params.id.length === 24 ? (
            <div className="profile-page">
               <div style={{ color: 'var(--text-muted)' }}>
                 <i className="fas fa-spinner fa-spin fa-2x"></i> Loading...
               </div>
            </div>
          ) : (
            <Redirect to="/404"/>
          )}   
        </>
      );
    }
  }
}
