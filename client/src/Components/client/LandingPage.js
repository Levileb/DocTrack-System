import React from "react";
import "./LoginForm/LoginForm.css";
import Footer from "./Footer.js";
import logo from "./assets/kabankalan-logo.png";
// import axios from "axios";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  const handleButton = () => {
    navigate("/login");
  };

  return (
    <>
      <header>
        <nav className="head">
          <img src={logo} alt="logo"></img>
          <div className="comp">
            <h1>City Government of Kabankalan</h1>
          </div>
        </nav>
      </header>
      <div className="container-landing">
        <div className="signIn">
          <h1>
            Document <br />
            Tracking System
          </h1>
          <button onClick={handleButton}>Sign In</button>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default LandingPage;
