import React, { Component, createContext } from "react";

const ThemeContext = createContext();

class ThemeProvider extends Component {
  constructor(props) {
    super(props);
    const saved = localStorage.getItem("siteTheme");
    this.state = {
      theme: saved || "dark",
    };
  }

  componentDidMount() {
    document.documentElement.setAttribute("data-theme", this.state.theme);
  }

  toggleTheme = () => {
    this.setState(
      (prev) => {
        const next = prev.theme === "dark" ? "light" : "dark";
        return { theme: next };
      },
      () => {
        localStorage.setItem("siteTheme", this.state.theme);
        document.documentElement.setAttribute("data-theme", this.state.theme);
      }
    );
  };

  render() {
    return (
      <ThemeContext.Provider
        value={{ theme: this.state.theme, toggleTheme: this.toggleTheme }}
      >
        {this.props.children}
      </ThemeContext.Provider>
    );
  }
}

export { ThemeProvider };
export default ThemeContext;
