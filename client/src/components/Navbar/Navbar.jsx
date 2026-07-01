import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaSun, FaMoon } from "react-icons/fa";
import "./Navbar.css";
import API_BASE from "../../config";
import {
  GoogleLoginButton,
} from "react-social-login-buttons";
import PropTypes from "prop-types";
import ThemeContext from "../../ThemeContext";

export default class Navbar extends Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
  };

  static contextType = ThemeContext;

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
    window.location.href = API_BASE ? `${API_BASE}/auth/google` : "http://localhost:5000/auth/google";
  };

  _handleLogoutClick = () => {
    // Logout using Google passport api
    // Set authenticated state to false in the HomePage component
    window.location.href = API_BASE ? `${API_BASE}/auth/logout` : "http://localhost:5000/auth/logout";
    this.props.handleNotAuthenticated();
  };
  render() {
    const { authenticated } = this.props;
    const { user } = this.props;
    const { theme, toggleTheme } = this.context;

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
              {this.state.click ? <FaTimes color="var(--text-primary)" /> : <FaBars color="var(--text-primary)" />}
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

              {/* Mobile-only theme toggle */}
              {!this.state.button && (
                <li className="nav-item">
                  <button
                    className="theme-toggle-btn nav-links"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? <FaSun /> : <FaMoon />}
                    <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </button>
                </li>
              )}

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

            {/* Desktop actions */}
            {this.state.button && (
              <div className="nav-right">
                {/* Theme toggle */}
                <button
                  className="theme-toggle-btn"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  <span className={`theme-icon ${theme === "dark" ? "icon-sun" : "icon-moon"}`}>
                    {theme === "dark" ? <FaSun /> : <FaMoon />}
                  </span>
                </button>

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
                  border: '1px solid var(--border)',
                  background: 'var(--bg-input)',
                }}
                activeStyle={{
                  background: 'var(--bg-surface-hover)',
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  }
}
