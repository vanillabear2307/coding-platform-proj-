import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";
import {
  GoogleLoginButton,
} from "react-social-login-buttons";
import PropTypes from "prop-types";

export default class Navbar extends Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      click: false,
      button: true,
      show: false,
    };
  }

  handleShow = () => {
    this.setState({ show: true });
  };
  handleClose = () => {
    this.setState({ show: false });
  };
  handleClick = (e) => {
    this.setState({ click: !this.state.click });
  };
  closeMobileMenu = (e) => {
    this.setState({ click: false });
  };
  showButton = () => {
    if (window.innerWidth <= 768) {
      this.setState({ button: false });
    } else {
      this.setState({ button: true });
    }
  };
  componentDidMount() {
    this.showButton();
  }
  _handleSignInClick = () => {
    // Authenticate using via passport api in the backend
    // Open Google login page
    window.location.href = import.meta.env.PROD ? `/auth/google` : "http://localhost:5000/auth/google";
  };

  _handleLogoutClick = () => {
    // Logout using Google passport api
    // Set authenticated state to false in the HomePage component
    window.location.href = import.meta.env.PROD ? `/auth/logout` : "http://localhost:5000/auth/logout";
    this.props.handleNotAuthenticated();
  };
  render() {
    const { authenticated } = this.props;
    const { user } = this.props;

    window.addEventListener("resize", this.showButton);
    return (
      <>
        <nav className="navbar">
          <div className="navbar-container">
            <Link
              to="/"
              className="navbar-logo"
              onClick={this.closeMobileMenu}
            >
              <span className="brand-text">⚡ CodeArena</span>
            </Link>

            <div className="menu-icon" onClick={this.handleClick}>
              {this.state.click ? <FaTimes color="#eff1f6" /> : <FaBars color="#eff1f6" />}
            </div>

            {/* Mobile overlay */}
            {this.state.click && (
              <div className="mobile-overlay active" onClick={this.closeMobileMenu}></div>
            )}

            <ul className={this.state.click ? "nav-menu active" : "nav-menu"}>
              <li className="nav-item">
                <Link
                  to="/"
                  className="nav-links"
                  onClick={this.closeMobileMenu}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/compete"
                  className="nav-links"
                  onClick={this.closeMobileMenu}
                >
                  Problems
                </Link>
              </li>

              {/* Mobile-only auth actions */}
              {!this.state.button && (
                <li className="nav-right">
                  {!authenticated ? (
                    <button
                      className="nav-login-btn"
                      onClick={() => {
                        this.handleShow();
                        this.closeMobileMenu();
                      }}
                    >
                      Sign In
                    </button>
                  ) : (
                    <>
                      <Link
                        to={{
                          pathname: `/profile/${user._id}`,
                          query: { user: user },
                        }}
                        className="profile-avatar"
                        onClick={this.closeMobileMenu}
                      >
                        <img src={user.photo} className="profile-img" alt="Profile" />
                      </Link>
                      <button
                        className="nav-logout-btn"
                        onClick={() => {
                          this._handleLogoutClick();
                          this.closeMobileMenu();
                        }}
                      >
                        Sign Out
                      </button>
                    </>
                  )}
                </li>
              )}
            </ul>

            {/* Desktop auth actions */}
            {this.state.button && (
              <div className="nav-right">
                {!authenticated ? (
                  <button className="nav-login-btn" onClick={this.handleShow}>
                    Sign In
                  </button>
                ) : (
                  <>
                    <Link
                      to={{
                        pathname: `/profile/${user._id}`,
                        query: { user: user },
                      }}
                      className="profile-avatar"
                    >
                      <img src={user.photo} className="profile-img" alt="Profile" />
                    </Link>
                    <button className="nav-logout-btn" onClick={this._handleLogoutClick}>
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Custom Login Modal */}
        {this.state.show && (
          <div className="login-modal-overlay" onClick={this.handleClose}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
              <button className="login-modal-close" onClick={this.handleClose}>
                <FaTimes />
              </button>
              <h3>Welcome to CodeArena</h3>
              <p className="login-subtitle">Sign in to track progress and compete</p>
              <GoogleLoginButton
                onClick={this._handleSignInClick}
                style={{
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                }}
                activeStyle={{
                  background: 'rgba(255,255,255,0.1)',
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  }
}
