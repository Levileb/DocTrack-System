import React, { useState } from "react";
import "./LoginForm.css";
import { MdOutlineEmail } from "react-icons/md";
import { IoEyeSharp, IoEyeOffSharp } from "react-icons/io5"; // Import eye icons
import Footer from "../Footer";
import logo from "../assets/kabankalan-logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoIosLock } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [passwordFocused, setPasswordFocused] = useState(false);

  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  axios.defaults.withCredentials = true;

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${API_URL}/login`, { email, password }, { withCredentials: true }) // Ensure credentials are sent
      .then((res) => {
        if (res.data.Status === "Success") {
          toast.success("Login Success. Welcome!", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
            theme: "light",
          });

          const { accessToken, refreshToken } = res.data;
          Cookies.set("accessToken", accessToken, {
            secure: true, // Use true for HTTPS (required for production)
            sameSite: "None", // Required for cross-origin requests
            path: "/",
          });
          Cookies.set("refreshToken", refreshToken, {
            secure: true, // Use true for HTTPS (required for production)
            sameSite: "None", // Required for cross-origin requests
            path: "/",
          });
          localStorage.setItem("role", res.data.role);

          // Navigate based on the user's role
          setTimeout(() => {
            if (res.data.role === "admin") {
              navigate("/admin");
            } else if (res.data.role === "user") {
              navigate("/home");
            }
          }, 1500);
        }
      })
      .catch(() => {
        toast.error(
          "Invalid Email or Incorrect Password. Please check and try again.",
          {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
            theme: "light",
          }
        );
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
            <h1>
              Document <br /> Tracking System
            </h1>
            <h3>Log In your Account</h3>

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
                onFocus={() => setPasswordFocused(true)}
              />
              {passwordFocused && (
                <>
                  {showPassword ? (
                    <IoEyeOffSharp
                      className="icon eye"
                      title="Hide Password"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <IoEyeSharp
                      className="icon eye"
                      title="Show Password"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </>
              )}

              <IoIosLock className="icon" />
            </div>
            <div className="forgot-password"
              style={{ marginBottom:"12px" }}
            >
              <a href="/ForgotPassword"> Forgot Password?</a>
            </div>
            <button className="loginBtn" type="submit">
              Log In
            </button>
          </form>
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
}
export default LoginForm;