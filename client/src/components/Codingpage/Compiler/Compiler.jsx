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
import { io } from "socket.io-client";
import Split from "react-split";

let checkErr;
export default class Compiler extends Component {
  constructor(props) {
    super(props);
    this.socket = io("http://localhost:5000");
    this.state = {
      input: sessionStorage.getItem("sourceCode") || "",
      output: ``,
      language_id: localStorage.getItem("languageId") || "cpp",
      user_input: ``,
      theme: localStorage.getItem("theme") || `material-ocean`,
      checkedBox: true,
      isRunning: false,
      activeCaseIndex: 0,
      testResults: null,
      overallStatus: null,
      overallPassed: 0
    };
  }

  userInput = (event) => {
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

  componentWillUnmount() {
    if (this.socket) this.socket.disconnect();
  }

  executeWithSocket = (language, code, stdin) => {
    return new Promise((resolve) => {
      let fullOutput = "";
      this.socket.off('output');
      this.socket.off('done');
      
      this.socket.on('output', (data) => {
        fullOutput += data;
        let outputText = document.getElementById("terminal-output");
        if (outputText && !this.state.checkedBox) {
          outputText.innerHTML += data.replace(/\n/g, '<br/>');
        }
      });
      
      this.socket.on('done', (result) => {
        resolve({
          exit_code: result.status === 'success' ? 0 : 1,
          stdout: fullOutput,
          stderr: result.status === 'error' ? result.message : null,
          execution_time_ms: 'N/A',
          memory_used_kb: 'N/A'
        });
      });
      
      this.socket.emit('execute', { language, code, stdin });
    });
  };
  
  submit = async (e) => {
    e.preventDefault();
    this.setState({ isRunning: true });

    if (this.state.checkedBox) {
      let testPassed = 0;
      checkErr = false;
      let testCases = this.props.testCases;
      
      let resultsArray = [];
      this.setState({ testResults: [], overallStatus: null, overallPassed: 0, activeCaseIndex: 0 });

      for (let i = 0; i < testCases.length; i++) {
        const jsonGetSolution = await this.executeWithSocket(
          this.state.language_id,
          this.state.input || "",
          testCases[i].input || ""
        );
        
        let resultObj = {
           input: testCases[i].input,
           expectedOutput: testCases[i].output,
           actualOutput: "",
           status: "",
           runtime: "N/A",
           memory: "N/A",
           stderr: null
        };

        if (jsonGetSolution.exit_code !== 0 && jsonGetSolution.stderr) {
           checkErr = true;
           resultObj.status = "Error";
           resultObj.stderr = jsonGetSolution.stderr;
        } else if (jsonGetSolution.exit_code === 0 && (jsonGetSolution.stdout || jsonGetSolution.stdout === "")) {
           const output = jsonGetSolution.stdout;
           resultObj.actualOutput = output;
           resultObj.runtime = jsonGetSolution.execution_time_ms;
           resultObj.memory = jsonGetSolution.memory_used_kb;
           resultObj.stderr = jsonGetSolution.stderr;
           
           if (output.trim() == testCases[i].output.trim()) {
             testPassed++;
             resultObj.status = "Accepted";
           } else {
             resultObj.status = "Wrong Answer";
           }
        } else {
           checkErr = true;
           resultObj.status = "API Error";
           resultObj.stderr = JSON.stringify(jsonGetSolution);
        }
        
        resultsArray.push(resultObj);
        this.setState({ testResults: [...resultsArray] });
      }
      
      let finalStatus = "Accepted";
      if (checkErr) finalStatus = "Error";
      else if (testPassed !== testCases.length) finalStatus = "Wrong Answer";
      
      this.setState({ 
         testResults: resultsArray,
         overallStatus: finalStatus,
         overallPassed: testPassed
      });
    } else {
      let outputText = document.getElementById("terminal-output");
      outputText.innerHTML = "Running custom input...<br />";
      
      const jsonGetSolution = await this.executeWithSocket(
        this.state.language_id,
        this.state.input || "",
        this.state.user_input || ""
      );
      
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
      <Split 
        direction="vertical" 
        sizes={[65, 35]} 
        minSize={100}
        gutterSize={10}
        className="compiler-page-wrapper"
      >
        <Split
          direction="horizontal"
          sizes={[40, 60]}
          minSize={250}
          gutterSize={10}
          className="compiler-top-half"
        >
          {this.props.children}
          
          <div className={`coding-right-panel ${this.props.mobilePanel && this.props.mobilePanel !== 'right' ? 'hidden' : ''}`}>
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
          </div>
        </Split>

        {/* Terminal Output */}
        <div className="terminal-panel">
          <div className="terminal-header" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
            <button 
               className={`terminal-tab-btn ${this.state.checkedBox ? 'active' : ''}`}
               onClick={(e) => { e.preventDefault(); this.setState({ checkedBox: true }); }}
            >Test Results</button>
            <button 
               className={`terminal-tab-btn ${!this.state.checkedBox ? 'active' : ''}`}
               onClick={(e) => { e.preventDefault(); this.setState({ checkedBox: false }); }}
            >Custom Input</button>
          </div>
          
          {!this.state.checkedBox && (
            <div className="custom-input-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <textarea 
                className="custom-textarea"
                placeholder="Enter custom stdin here..."
                value={this.state.user_input}
                onChange={this.userInput}
                style={{ flex: '0 0 50%', borderBottom: '1px solid var(--border)' }}
              ></textarea>
              <div className="terminal-content" id="terminal-output" style={{ flex: '1', overflowY: 'auto', padding: '16px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Run your code to see output here.</span>
              </div>
            </div>
          )}

          {this.state.checkedBox && (
            <div className="test-results-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', overflowY: 'auto' }}>
               {!this.state.testResults ? (
                  <span style={{ color: 'var(--text-muted)' }}>Run your code to see output here.</span>
               ) : (
                  <div>
                    {/* Overall Status */}
                    <div style={{ marginBottom: '16px' }}>
                       <span className={this.state.overallStatus === 'Accepted' ? 'test-passed' : 'test-failed'} style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {this.state.overallStatus === 'Accepted' ? <><i className="fas fa-check-circle"></i> Accepted</> : 
                           this.state.overallStatus === 'Error' ? <><i className="fas fa-exclamation-circle"></i> Error</> : 
                           <><i className="fas fa-times-circle"></i> Wrong Answer ({this.state.overallPassed}/{this.props.testCases.length} passed)</>}
                       </span>
                    </div>
                    {/* Pills */}
                    <div className="case-pills" style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                       {this.state.testResults.map((result, idx) => (
                          <button 
                             key={idx}
                             className={`case-pill ${this.state.activeCaseIndex === idx ? 'active' : ''}`}
                             onClick={(e) => { e.preventDefault(); this.setState({ activeCaseIndex: idx }); }}
                          >
                             <span className={`case-dot ${result.status === 'Accepted' ? 'green' : 'red'}`}>•</span> Case {idx + 1}
                          </button>
                       ))}
                       {this.state.isRunning && this.state.testResults.length < this.props.testCases.length && (
                          <span style={{ color: 'var(--text-muted)', padding: '6px 12px', fontSize: '13px' }}><i className="fas fa-circle-notch fa-spin"></i> Running...</span>
                       )}
                    </div>
                    {/* Active Case Details */}
                    {this.state.testResults[this.state.activeCaseIndex] && (
                       <div className="case-details">
                          <div className="io-block">
                             <span className="io-label">Input</span>
                             <div className="io-value">{this.state.testResults[this.state.activeCaseIndex].input}</div>
                          </div>
                          <div className="io-block">
                             <span className="io-label">Expected Output</span>
                             <div className="io-value">{this.state.testResults[this.state.activeCaseIndex].expectedOutput}</div>
                          </div>
                          {this.state.testResults[this.state.activeCaseIndex].status === "Error" || this.state.testResults[this.state.activeCaseIndex].status === "API Error" ? (
                             <div className="io-block" style={{ border: '1px solid var(--error)', background: 'rgba(255, 85, 85, 0.1)' }}>
                                <span className="io-label" style={{ color: 'var(--error)' }}>Error</span>
                                <div className="io-value" style={{ color: 'var(--error)' }}>{this.state.testResults[this.state.activeCaseIndex].stderr}</div>
                             </div>
                          ) : (
                             <div className="io-block">
                                <span className="io-label">Your Output</span>
                                <div className="io-value">{this.state.testResults[this.state.activeCaseIndex].actualOutput || " "}</div>
                                {this.state.testResults[this.state.activeCaseIndex].stderr && (
                                   <div style={{ color: '#ffb86c', fontSize: '12px', marginTop: '5px' }}>Warning: {this.state.testResults[this.state.activeCaseIndex].stderr}</div>
                                )}
                             </div>
                          )}
                       </div>
                    )}
                  </div>
               )}
            </div>
          )}
        </div>
      </Split>
    );
  }
}
