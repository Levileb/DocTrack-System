import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [status, setStatus] = useState("Verifying...");
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = process.env.REACT_APP_API_URL; // Make sure this is set to your backend URL

  useEffect(() => {
    // Extract token from URL
    const token = new URLSearchParams(location.search).get("token");
    console.log("Token from URL:", token);

    if (token) {
      // Send verification request to backend
      axios
        .get(`${API_URL}/verify-email?token=${token}`)
        .then((response) => {
          if (response.status === 200) {
            // Email verified successfully
            setStatus("Email verified successfully! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000); // Redirect after 3 seconds
          } else {
            setStatus("Verification failed or link expired.");
          }
        })
        .catch(() => {
          setStatus("Invalid or expired verification link.");
        });
    } else {
      setStatus("No verification token provided.");
    }
  }, [location, API_URL, navigate]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Email Verification</h2>
      <p>{status}</p>
    </div>
  );
};

export default VerifyEmail;
