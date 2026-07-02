import React from "react";
import "./Errorpage.css";
import { Link } from "react-router-dom";

export default function Errorpage() {
  return (
    <section className="page_404">
      <div className="container" style={{ position: 'relative' }}>
        {/* Decorative floating code symbols */}
        <div className="floating-symbols symbol-1">&lt;div&gt;</div>
        <div className="floating-symbols symbol-2">&#123; error: 404 &#125;</div>
        <div className="floating-symbols symbol-3">[] == ![]</div>
        <div className="floating-symbols symbol-4">return null;</div>

        <div className="row justify-content-center">
          <div className="col-sm-10 col-sm-offset-1 text-center">
            <div className="four_zero_four_container">
              <h1 className="error-title">404</h1>
              <div className="glitch-text">LOST IN CODE SPACE</div>
            </div>

            <div className="contant_box_404">
              <h3 className="h2">Looks like you're lost</h3>
              <p>The page you are looking for is not available or has been moved!</p>

              <Link to="/" className="link_404">
                <i className="fas fa-home" style={{ marginRight: '8px' }}></i> Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
