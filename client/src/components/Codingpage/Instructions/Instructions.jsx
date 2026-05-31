import React, { Component } from "react";
import ReactMarkdown from "react-markdown";

export default class Instructions extends Component {
  render() {
    return (
      <div className="markdown-content">
        <ReactMarkdown source={this.props.instruction} />
      </div>
    );
  }
}
