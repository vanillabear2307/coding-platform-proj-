import React, { Component } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/addon/display/autorefresh";
import "codemirror/addon/comment/comment";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/keymap/sublime";
import "codemirror/theme/monokai.css";
import "codemirror/theme/cobalt.css";
import "codemirror/theme/material-ocean.css";
import "codemirror/theme/neo.css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/paraiso-light.css";
import "codemirror/mode/clike/clike";
import "codemirror/mode/python/python";
import "./Compiler.css";

let checkErr;
export default class Compiler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: sessionStorage.getItem("sourceCode") || "",
      output: ``,
      language_id: localStorage.getItem("languageId") || "cpp",
      user_input: ``,
      theme: localStorage.getItem("theme") || `material-ocean`,
      checkedBox: true,
      isRunning: false,
    };
  }

  userInput = (event) => {
    event.preventDefault();
    this.setState({ user_input: event.target.value });
  };

  language = (event) => {
    event.preventDefault();
    this.setState({ language_id: event.target.value });
    localStorage.setItem("languageId", event.target.value);
  };
  
  theme = (event) => {
    event.preventDefault();
    this.setState({ theme: event.target.value });
    localStorage.setItem("theme", event.target.value);
  };
  
  updateCode = (editor, value) => {
    this.setState({ input: editor.getValue() });
    sessionStorage.setItem("sourceCode", editor.getValue());
  };
  
  handleCheckbox = () => {
    this.setState({ checkedBox: !this.state.checkedBox });
  };
  
  submit = async (e) => {
    e.preventDefault();
    this.setState({ isRunning: true });

    if (this.state.checkedBox) {
      let sampleInput = ``;
      let sampleOutput = ``;
      let actualOutput = ``;
      let testPassed = 0;
      checkErr = false;
      let testCases = this.props.testCases;
      
      let outputText = document.getElementById("terminal-output");
      outputText.innerHTML = "Submitting code to Judge0...<br />";

      for (let i = 0; i < testCases.length; i++) {
        sampleOutput += `<div class="io-block"><span class="io-label">Expected Output ${i + 1}</span><span class="io-value">${testCases[i].output}</span></div>`;
        sampleInput += `<div class="io-block"><span class="io-label">Input ${i + 1}</span><span class="io-value">${testCases[i].input}</span></div>`;
        
        if (i > 0) {
          outputText.innerHTML = `Running test case ${i+1}/${testCases.length}...<br />`;
        }

        const response = await fetch(
          "https://sandboxapi.p.rapidapi.com/v1/execute",
          {
            method: "POST",
            headers: {
              "x-rapidapi-host": "sandboxapi.p.rapidapi.com",
              "x-rapidapi-key": import.meta.env.VITE_JUDGE0_KEY,
              "content-type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({
              language: this.state.language_id,
              code: this.state.input || "",
              stdin: testCases[i].input || "",
            }),
          }
        );

        const jsonGetSolution = await response.json();
        
        if (jsonGetSolution.exit_code !== 0 && jsonGetSolution.stderr) {
          checkErr = true;
          if (i === testCases.length - 1) {
            outputText.innerHTML = `<span style="color: var(--error)">Error:</span><br/><pre style="color: var(--error); background: transparent; border: none; padding: 0;">${jsonGetSolution.stderr}</pre>`;
          }
        } else if (jsonGetSolution.exit_code === 0 && (jsonGetSolution.stdout || jsonGetSolution.stdout === "")) {
          const output = jsonGetSolution.stdout;
          if (output.trim() == testCases[i].output.trim()) {
            testPassed++;
          }
          actualOutput += `<div class="io-block"><span class="io-label">Your Output ${i + 1}</span><span class="io-value">${output}</span></div>`;

          if (i === testCases.length - 1) {
            outputText.innerHTML = `<div class="execution-info">Execution Time: ${jsonGetSolution.execution_time_ms}ms | Memory: ${jsonGetSolution.memory_used_kb}KB</div>`;
            if (jsonGetSolution.stderr) {
               outputText.innerHTML += `<div style="color: #ffb86c; font-size: 12px; margin-top: 5px;">Warning: ${jsonGetSolution.stderr}</div>`;
            }
          }
        } else {
          checkErr = true;
          if (i === testCases.length - 1) {
            outputText.innerHTML = `<span style="color: var(--error)">API Error:</span><br/><pre style="color: var(--error); background: transparent; border: none; padding: 0;">${JSON.stringify(jsonGetSolution)}</pre>`;
          }
        }
      }
      
      if (testPassed == testCases.length) {
        if (!checkErr) {
          outputText.innerHTML = `<span class="test-passed"><i class="fas fa-check-circle"></i> Accepted</span>` + actualOutput + outputText.innerHTML;
        }
      } else {
        if (!checkErr) {
          outputText.innerHTML = `<span class="test-failed"><i class="fas fa-times-circle"></i> Wrong Answer (${testPassed}/${testCases.length} passed)</span>` + sampleInput + sampleOutput + actualOutput + outputText.innerHTML;
        }
      }
    } else {
      let outputText = document.getElementById("terminal-output");
      outputText.innerHTML = "Running custom input...<br />";
      
      const response = await fetch(
        "https://sandboxapi.p.rapidapi.com/v1/execute",
        {
          method: "POST",
          headers: {
            "x-rapidapi-host": "sandboxapi.p.rapidapi.com",
            "x-rapidapi-key": import.meta.env.VITE_JUDGE0_KEY,
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            language: this.state.language_id,
            code: this.state.input || "",
            stdin: this.state.user_input || "",
          }),
        }
      );
      
      const jsonGetSolution = await response.json();
      
      if (jsonGetSolution.exit_code !== 0 && jsonGetSolution.stderr) {
        outputText.innerHTML = `<span style="color: var(--error)">Error:</span><br/><pre style="color: var(--error); background: transparent; border: none; padding: 0;">${jsonGetSolution.stderr}</pre>`;
      } else if (jsonGetSolution.exit_code === 0 && (jsonGetSolution.stdout || jsonGetSolution.stdout === "")) {
        outputText.innerHTML = `<div class="io-block"><span class="io-label">Output</span><span class="io-value">${jsonGetSolution.stdout}</span></div><div class="execution-info">Execution Time: ${jsonGetSolution.execution_time_ms}ms | Memory: ${jsonGetSolution.memory_used_kb}KB</div>`;
        if (jsonGetSolution.stderr) {
           outputText.innerHTML += `<div style="color: #ffb86c; font-size: 12px; margin-top: 5px;">Warning: ${jsonGetSolution.stderr}</div>`;
        }
      } else {
        outputText.innerHTML = `<span style="color: var(--error)">API Error:</span><br/><pre style="color: var(--error); background: transparent; border: none; padding: 0;">${JSON.stringify(jsonGetSolution)}</pre>`;
      }
    }
    
    this.setState({ isRunning: false });
  };

  render() {
    return (
      <div className="compiler-container">
        {/* Editor Toolbar */}
        <div className="compiler-toolbar">
          <div className="compiler-controls">
            <select
              value={this.state.language_id}
              onChange={this.language}
              className="editor-select"
            >
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
              <option value="python3">Python</option>
            </select>
            
            <select
              value={this.state.theme}
              onChange={this.theme}
              className="editor-select"
            >
              <option value="monokai">Monokai</option>
              <option value="cobalt">Cobalt</option>
              <option value="material-ocean">Material Ocean</option>
              <option value="neo">Neo</option>
            </select>
          </div>
          
          <div className="compiler-actions">
            <button
              className="btn-accent"
              onClick={this.submit}
              disabled={this.state.isRunning}
              style={this.state.isRunning ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
            >
              {this.state.isRunning ? (
                <><i className="fas fa-circle-notch fa-spin"></i> Running...</>
              ) : (
                <><i className="fas fa-play"></i> Run Code</>
              )}
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="ide-wrapper">
          <CodeMirror
            value={this.state.input}
            options={{
              theme: this.state.theme,
              tabSize: 4,
              keyMap: "sublime",
              mode: "text/x-csrc",
              lineNumbers: true,
              matchBrackets: true,
              autoRefresh: true
            }}
            onBeforeChange={(editor, data, value) => {
              this.setState({ input: value });
              sessionStorage.setItem("sourceCode", value);
            }}
            onChange={(editor, data, value) => {
              this.setState({ input: value });
              sessionStorage.setItem("sourceCode", value);
            }}
          />
        </div>

        {/* Terminal Output */}
        <div className="terminal-panel">
          <div className="terminal-header">
            <span className="terminal-title">Test Results</span>
            <label className="custom-input-toggle">
              <input
                type="checkbox"
                checked={!this.state.checkedBox}
                onChange={this.handleCheckbox}
              />
              Custom Input
            </label>
          </div>
          
          {!this.state.checkedBox ? (
            <textarea 
              className="custom-textarea"
              placeholder="Enter custom stdin here..."
              onChange={this.userInput}
            ></textarea>
          ) : (
            <div className="terminal-content" id="terminal-output">
              <span style={{ color: 'var(--text-muted)' }}>Run your code to see output here.</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}
