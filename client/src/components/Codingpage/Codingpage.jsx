import React, { Component } from "react";
import Instructions from "./Instructions/Instructions";
import "./Codingpage.css";
import Solution from "./Solution/Solution";
import Compiler from "./Compiler/Compiler";
import { Redirect } from "react-router";

export default class Codingpage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      question: undefined,
      component: "instructions", // instructions | solutions
      mobilePanel: "left", // left | right (for mobile view toggle)
    };
  }
  
  componentDidMount() {
    this.renderMyData();
  }
  
  handleInstructions = (e) => {
    e.preventDefault();
    this.setState({ component: "instructions" });
  };
  
  handleSolutions = (e) => {
    e.preventDefault();
    this.setState({ component: "solutions" });
  };

  toggleMobilePanel = (panel) => {
    this.setState({ mobilePanel: panel });
  };

  renderMyData = async () => {
    const { match } = this.props;
 
    try {
      const response = await fetch(
        `/question/id/:?id=${match.params.id}`
      );

      let jsonResponse = await response.json();
    
      this.setState({ question: jsonResponse });
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    if (this.state.question && Array.isArray(this.state.question) && this.state.question.length > 0) {
      let instruction = this.state.question[0].instruction;
      let solution = this.state.question[0].solution;
      let testCases = this.state.question[0].testCases;
      
      return (
        <div className="coding-page">
          {/* Mobile Panel Toggle */}
          <div className="mobile-panel-toggle">
            <button 
              className={`mobile-panel-btn ${this.state.mobilePanel === 'left' ? 'active' : ''}`}
              onClick={() => this.toggleMobilePanel('left')}
            >
              <i className="fas fa-file-alt"></i> Description
            </button>
            <button 
              className={`mobile-panel-btn ${this.state.mobilePanel === 'right' ? 'active' : ''}`}
              onClick={() => this.toggleMobilePanel('right')}
            >
              <i className="fas fa-code"></i> Code
            </button>
          </div>

          {/* Left Panel - Description / Solution */}
          <div className={`coding-left-panel ${this.state.mobilePanel !== 'left' ? 'hidden' : ''}`}>
            <div className="coding-tabs">
              <button 
                className={`coding-tab ${this.state.component === 'instructions' ? 'active' : ''}`}
                onClick={this.handleInstructions}
              >
                <i className="fas fa-book-open"></i> Description
              </button>
              <button 
                className={`coding-tab ${this.state.component === 'solutions' ? 'active' : ''}`}
                onClick={this.handleSolutions}
              >
                <i className="fas fa-lightbulb"></i> Solution
              </button>
            </div>
            
            <div className="coding-left-content">
              {this.state.component === "instructions" ? (
                <Instructions instruction={instruction} />
              ) : (
                <Solution solution={solution} />
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor / Output */}
          <div className={`coding-right-panel ${this.state.mobilePanel !== 'right' ? 'hidden' : ''}`}>
            <Compiler testCases={testCases} />
          </div>
        </div>
      );
    } else if (this.state.question && this.state.question.err) {
      return (
        <div className="coding-loading">
          <i className="fas fa-exclamation-triangle fa-2x" style={{color: 'var(--error)'}}></i>
          <span style={{marginLeft: '10px'}}>{this.state.question.err}</span>
        </div>
      );
    } else {
      const { match } = this.props;
      return (
        <>
          {match.params.id && match.params.id.length === 24 ? (
            <div className="coding-loading">
              <i className="fas fa-spinner fa-spin fa-2x"></i>
              <span style={{marginLeft: '10px'}}>Loading Problem...</span>
            </div>
          ) : (
            <Redirect to="/404"/>
          )}   
        </>
      );
    }
  }
}
