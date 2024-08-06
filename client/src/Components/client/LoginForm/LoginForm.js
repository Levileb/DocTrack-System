import React, { useState } from "react";
import "./LoginForm.css";
import { MdOutlineEmail } from "react-icons/md";
import { IoIosLock } from "react-icons/io";
import Footer from "../Footer";
import logo from "../assets/kabankalan-logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState(""); // State to track login status
  const [showPopup, setShowPopup] = useState(false); // Recently Added Popup
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      window.alert("Please enter both email and password");
      return;
    }

    axios
      .post("http://localhost:3001", { email, password })
      .then((res) => {
        if (res.data.Status === "Success") {
          // Displaying a success message
          setShowPopup(true);

          // Storing token and role in local storage
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("role", res.data.role);

          if (res.data.role === "admin") {
            setTimeout(() => {
              navigate("/home");
              setShowPopup(false);
            }, 1000);
          } else {
            setTimeout(() => {
              navigate("/home");
              setShowPopup(false);
            }, 1000);
          }
        } else {
          // If login fails, set loginStatus state to display error message
          setLoginStatus("Incorrect email or password. Please try again.");
        }
      })
      .catch((err) => {
        console.log(err);
        // Reset email and password fields after an unsuccessful login attempt
        setEmail("");
        setPassword("");
      });
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
      <div className="container">
        <div className="wrapper">
          <form className="formlogin" onSubmit={handleSubmit}>
            <h1>Document Tracking System</h1>
            <h3>Login to your Account</h3>

            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                id="email"
                required
                value={email} // Set value attribute to control the input field
                onChange={(e) => setEmail(e.target.value)}
              />
              <MdOutlineEmail className="icon" />
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                id="password"
                required
                value={password} // Set value attribute to control the input field
                onChange={(e) => setPassword(e.target.value)}
              />
              <IoIosLock className="icon" />
            </div>

            {/* Conditionally render login status message */}
            {loginStatus && (
              <p style={{ color: "white" }} className="error-message">
                {loginStatus}
              </p>
            )}

            {/* Removed unnecessary <a> tag wrapping the button */}
            <button className="loginBtn" type="submit">
              Login
            </button>
          </form>
        </div>
      </div>
      <Footer />
      {/* Recently Added Popup */}
      {showPopup && (
        <div className="popup-container">
          <div className="popuplogsuccess">
            <p>Login Successfully!</p>
          </div>
        </div>
      )}
    </>
  );
}

export default LoginForm;
