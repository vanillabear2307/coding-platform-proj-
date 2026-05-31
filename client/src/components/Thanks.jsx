import React from "react";
import { useParams, useHistory } from "react-router-dom";

const Thanks = (props) => {
  const params = useParams();
  const history = useHistory();

  return (
    <div className="thanks-page">
      <div className="thanks-card">
        <div className="check-icon">
          <i className="fas fa-check"></i>
        </div>
        <h2>Thanks for subscribing!</h2>
        <p style={{ margin: '20px 0', color: 'var(--text-secondary)' }}>
          We'll send updates to <span style={{ color: 'var(--accent-primary)' }}>{params.name}</span>
        </p>
        <button 
          className="btn-ghost" 
          onClick={() => history.push("/")}
          style={{ marginTop: '16px' }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default Thanks;