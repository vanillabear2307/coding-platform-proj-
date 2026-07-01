import React, { Component } from "react";
import { Redirect } from "react-router";
import "./profile.css";
import API_BASE from "../../config";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: false,
    };
  }
 
  componentWillMount = async () => {
    await this.renderMyData();
  }
 
  renderMyData = async () => {
    const { match } = this.props;
    try {
      const response = await fetch(`${API_BASE}/profile/:?id=${this.props.match.params.id}`, {
        credentials: 'include'
      });

      let jsonResponse = await response.json();
    
      await this.setState({ user: jsonResponse });
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    if (this.state.user && Array.isArray(this.state.user) && this.state.user.length > 0) {
      return (
        <div className="profile-page">
          <div className="profile-card">
            <img className="profile-photo" src={this.state.user[0].photo} alt="Profile" />
            
            <div className="profile-info">
              <h2 style={{ marginBottom: '24px' }}>Developer Profile</h2>
              
              <div className="profile-info-row">
                <i className="fas fa-user-circle profile-icon"></i>
                <div>
                  <span className="profile-label">Username:</span>
                  <span>{this.state.user[0].username}</span>
                </div>
              </div>
              
              <div className="profile-info-row">
                <i className="fas fa-envelope profile-icon"></i>
                <div>
                  <span className="profile-label">Email:</span>
                  <span>{this.state.user[0].email}</span>
                </div>
              </div>
              
              <div className="profile-divider"></div>
              
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <i className="fas fa-chart-line" style={{ marginRight: '8px' }}></i>
                Activity statistics coming soon...
              </div>
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
