import React, { Component } from "react";
import ReactMarkdown from "react-markdown";

export default class Solution extends Component {
  render() {
    return (
      <div className="markdown-content">
        <ReactMarkdown source={this.props.solution} />
      </div>
    );
  }
}
