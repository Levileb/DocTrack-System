import React from "react";
import "./LoginForm.css";
import { MdOutlineEmail } from "react-icons/md";
import { IoIosLock } from "react-icons/io";
import Footer from "../Footer";
import logo from "../assets/logo.png";
import { IoInformationCircleOutline } from "react-icons/io5";
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import { useState } from "react";

// ADMIN LOGIN FORM
function LoginForm() {
  const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const navigate = useNavigate()

    axios.defaults.withCredentials = true;
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!email || !password) {
        window.alert("Please enter both email and password");
        return;
      }
    
      axios.post('http://localhost:3001', {email, password})
        .then(res => {
          if(res.data.Status === "Success") {
            // Displaying a success message
            window.alert("Login successful!");
    
            if(res.data.role === "admin") {
              navigate('/home');
            } else {
              navigate('/home');
            }
          }
        }).catch(err => console.log(err));
    }
    
  return (
    <>
      <header>
        <nav className="head">
          <img src={logo} alt="logo"></img>

          <div className="comp">
            <h1>Company Name</h1>
          </div>
          <div className="info">
            <IoInformationCircleOutline className="icon" />
          </div>
        </nav>
      </header>
      <div className="container">
        <div className="wrapper">
          <form className="formlogin" onSubmit={handleSubmit}>
            <h1>Document Tracking System</h1>
            <h2>Login to your Account</h2>

            <div className="input-box">
              <input type="email" placeholder="Email" id="email" required
              onChange={(e) => setEmail(e.target.value)} />
              <MdOutlineEmail className="icon" />
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                id="password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <IoIosLock className="icon" />
            </div>
            <a href="/home.admin">
              <button className="loginBtn" type="submit">
                Login
              </button>
            </a>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default LoginForm;
