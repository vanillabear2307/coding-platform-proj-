import React, { Component } from "react";
import Routes from "./routes/routes";
import Navbar from "./components/Navbar/Navbar";
import { ThemeProvider } from "./ThemeContext";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      user: null,
    };
  }
  componentDidMount = async () => {
    try {
      const response = await fetch(
        '/auth/login/success', 
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": true,
          }
        }
      );
      
      const jsonResponse = await response.json();
      if (jsonResponse.success) {
        this.setState({
          authenticated: true,
          user: jsonResponse.user,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  handleNotAuthenticated = () => {
    this.setState({ authenticated: false });
  };
  render() {
    return (
      <ThemeProvider>
        <div className="App">
          <Navbar
            authenticated={this.state.authenticated}
            user={this.state.user}
            handleNotAuthenticated={this.handleNotAuthenticated}
          />
          <div className="app-content">
            <Routes
              authenticated={this.state.authenticated}
              user={this.state.user}
            />
          </div>
        </div>
      </ThemeProvider>
    );
  }
}
export default App;

