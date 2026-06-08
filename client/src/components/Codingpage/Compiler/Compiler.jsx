import React, { Component } from "react";
import Editor from "@monaco-editor/react";
import "./Compiler.css";

import Split from "react-split";
// Native WebSocket — connects to FastAPI executor on port 8000
import ThemeContext from "../../../ThemeContext";

const LANGUAGE_MAP = {
  cpp: "cpp",
  c: "c",
  java: "java",
  python3: "python",
};

const BOILERPLATE = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write C++ code here
    
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // Write C code here
    
    return 0;
}`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // Write Java code here
        
    }
}`,
  python3: `# Write Python 3 code here
`
};

let checkErr;
export default class Compiler extends Component {
  static contextType = ThemeContext;

  constructor(props) {
    super(props);
    const savedLang = localStorage.getItem("languageId") || "cpp";
    this.state = {
      input: sessionStorage.getItem("sourceCode") || BOILERPLATE[savedLang] || "",
      output: ``,
      language_id: savedLang,
      user_input: ``,
      checkedBox: true,
      isRunning: false,
      isSaved: false,
      isGeneratingTests: false,
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
    const newLang = event.target.value;
    this.setState({ 
      language_id: newLang,
      input: BOILERPLATE[newLang] || ""
    });
    localStorage.setItem("languageId", newLang);
  };
  
  handleEditorChange = (value) => {
    // WebSocket is created fresh per execution (see executeWithWebSocket)
    this.setState({ input: value || "" });
  };

  saveProgress = (e) => {
    if (e) e.preventDefault();
    sessionStorage.setItem("sourceCode", this.state.input);
    this.setState({ isSaved: true });
    setTimeout(() => this.setState({ isSaved: false }), 2000);
  };

  generateAITestCases = async (e) => {
    if (e) e.preventDefault();
    if (!this.props.question) return;

    this.setState({ isGeneratingTests: true });
    try {
      const res = await fetch("/ai/testcases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: this.props.question.title,
          description: this.props.question.instruction
        })
      });

      if (res.ok) {
        const data = await res.json();
        const currentInput = this.state.user_input;
        const newInput = currentInput ? currentInput + "\n" + data.testcases : data.testcases;
        this.setState({ user_input: newInput });
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert("Failed to generate AI test cases: " + (errorData.detail || res.statusText));
      }
    } catch (err) {
      alert("Network error generating test cases.");
    } finally {
      this.setState({ isGeneratingTests: false });
    }
  };
  
  handleCheckbox = () => {
    this.setState({ checkedBox: !this.state.checkedBox });
  };

  componentWillUnmount() {
    // Close any in-flight WebSocket if the component unmounts mid-execution
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.close();
    }
  }

  executeWithWebSocket = (language, code, stdin) => {
    return new Promise((resolve) => {
      // Always use relative WebSocket URL so the Vite proxy (dev) or
      // the reverse proxy (prod) forwards to FastAPI correctly.
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws/execute`;

      const ws = new WebSocket(wsUrl);
      this._ws = ws;  // keep ref for componentWillUnmount cleanup
      let fullOutput = '';
      let result     = null;

      ws.onopen = () => {
        ws.send(JSON.stringify({ language, code, stdin: stdin || '' }));
      };

      ws.onmessage = (event) => {
        // FastAPI sends JSON objects for control messages
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'output') {
            // Real-time output chunk
            fullOutput += msg.data;
            const outputEl = document.getElementById('terminal-output');
            if (outputEl && !this.state.checkedBox) {
              outputEl.innerHTML += msg.data.replace(/\n/g, '<br/>');
            }
            return;
          }

          if (msg.type === 'done') {
            result = msg.result;  // { status: 'success'|'error', message?: '...' }
            ws.close();
            return;
          }
        } catch (_) {
          // Plain-text fallback (shouldn't happen with FastAPI service)
          fullOutput += event.data;
        }
      };

      ws.onclose = () => {
        const isError  = result?.status === 'error';
        resolve({
          exit_code:          isError ? 1 : 0,
          stdout:             isError ? '' : fullOutput,
          stderr:             isError ? (result?.message || fullOutput) : null,
          execution_time_ms:  'N/A',
          memory_used_kb:     'N/A',
        });
      };

      ws.onerror = () => {
        resolve({
          exit_code: 1,
          stdout:    '',
          stderr:    'WebSocket connection failed — is the FastAPI server running? (uvicorn main:app --port 8000)',
          execution_time_ms: 'N/A',
          memory_used_kb:     'N/A',
        });
      };
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
        const jsonGetSolution = await this.executeWithWebSocket(
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
      
      const jsonGetSolution = await this.executeWithWebSocket(
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
    const { theme } = this.context;
    const monacoTheme = theme === "dark" ? "vs-dark" : "light";

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
          </div>
          
          <div className="compiler-actions">
            <button
              className="btn-accent"
              onClick={this.saveProgress}
              style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              {this.state.isSaved ? (
                <><i className="fas fa-check" style={{ color: 'var(--success)' }}></i> Saved</>
              ) : (
                <><i className="fas fa-save"></i> Save Code</>
              )}
            </button>
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

        {/* Monaco Code Editor */}
        <div className="ide-wrapper">
          <Editor
            value={this.state.input}
            language={LANGUAGE_MAP[this.state.language_id] || "cpp"}
            theme={monacoTheme}
            onChange={this.handleEditorChange}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: "on",
              lineNumbers: "on",
              renderLineHighlight: "line",
              matchBrackets: "always",
              suggestOnTriggerCharacters: true,
              padding: { top: 12 },
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
                <button 
                  className="btn-accent" 
                  onClick={this.generateAITestCases} 
                  disabled={this.state.isGeneratingTests}
                  style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: 'transparent', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}
                >
                  {this.state.isGeneratingTests ? <><i className="fas fa-spinner fa-spin"></i> Generating...</> : <><i className="fas fa-robot"></i> Generate AI Test Cases</>}
                </button>
              </div>
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
