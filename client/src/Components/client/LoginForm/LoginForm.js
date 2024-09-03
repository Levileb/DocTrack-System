import React, { useState } from "react";
import "./LoginForm.css";
import { MdOutlineEmail } from "react-icons/md";
import { IoEyeSharp, IoEyeOffSharp } from "react-icons/io5"; // Import eye icons
import Footer from "../Footer";
import logo from "../assets/kabankalan-logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoIosLock } from "react-icons/io";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
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
          setShowPopup(true);
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("role", res.data.role);

          setTimeout(() => {
            navigate("/home");
            setShowPopup(false);
          }, 1000);
        } else {
          setEmail("");
          setPassword("");
          setLoginStatus("Incorrect email or password. Please try again.");
        }
      })
      .catch((err) => {
        console.log(err);
        setEmail("");
        setPassword("");
        setLoginStatus("Incorrect email or password. Please try again.");
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <MdOutlineEmail className="icon" />
            </div>

            <div className="input-box">
              <input
                type={showPassword ? "text" : "password"} // Toggle between text and password type
                placeholder="Password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {showPassword ? (
                <IoEyeOffSharp
                  className="icon eye"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <IoEyeSharp
                  className="icon eye"
                  onClick={() => setShowPassword(true)}
                />
              )}
              <IoIosLock className="icon" />
            </div>

            {loginStatus && (
              <p style={{ color: "white" }} className="error-message">
                {loginStatus}
              </p>
            )}

            <button className="loginBtn" type="submit">
              Login
            </button>
          </form>
        </div>
      </div>
      <Footer />
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
