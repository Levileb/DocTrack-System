import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../AdminSidePanel";
import Footer from "../Footer";
import "../navigation/newcontent.css";
import logo from "../assets/kabankalan-logo.png";
import axios from "axios";

const AdminProfile = () => {
  const [user, setUser] = useState({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios
      .get(`${API_URL}/api/user/details`, { withCredentials: true })
      .then((res) => {
        // console.log(res.data);
        setUser(res.data);
      })
      .catch((err) => {
        console.error("Error fetching user details: ", err);
      });
  }, [API_URL]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const evaluatePasswordStrength = (password) => {
    let strength = "";

    const regexStrong =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const regexMedium = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{6,}$/;

    if (regexStrong.test(password)) {
      strength = "Strong Password";
    } else if (regexMedium.test(password)) {
      strength = "Medium Password";
    } else {
      strength = "Weak Password";
    }

    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(evaluatePasswordStrength(newPassword));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    axios
      .post(`${API_URL}/api/user/update-password`, { password })
      .then(() => {
        setErrorMessage("");
        setShowPopup(true);
        // console.log("Password changed successfully!");

        setPassword("");
        setConfirmPassword("");
        setPasswordStrength("");
        setTimeout(() => setShowPopup(false), 1500);
      })
      .catch((err) => {
        console.error("Error updating password: ", err);
        setErrorMessage("Failed to change password. Please try again.");
      });
  };

  return (
    <>
      <Header />
      <SidePanel />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="AddUserHeader">
            <div className="filter">
              <p>User Profile</p>
            </div>
          </div>

          <div className="profile-container">
            <div className="display-user-info">
              <div className="view-user-info">
                <p className="user-fullname">
                  {user.firstname} {user.lastname}
                </p>
                <p className="user-position">{user.position}</p>
                <p>Office: {user.office}</p>
                <p>
                  Role:{" "}
                  {user.role
                    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    : "N/A"}
                </p>

                <p>Email: {user.email}</p>
              </div>
              <div className="change-pass">
                <form onSubmit={handleSubmit}>
                  <div className="password-container">
                    <label htmlFor="password">Change Password:</label>
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      id="password"
                      name="password"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      required
                    />
                    <p
                      style={{
                        fontSize: "14px",
                        color:
                          passwordStrength === "Strong Password"
                            ? "green"
                            : passwordStrength === "Medium Password"
                            ? "orange"
                            : "red",
                      }}
                    >
                      {passwordStrength}
                    </p>

                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      required
                    />
                    <span
                      className="toggle-password"
                      onClick={togglePasswordVisibility}
                    >
                      {isPasswordVisible ? "Hide Password" : "Show Password"}
                    </span>
                  </div>

                  {errorMessage && (
                    <p
                      style={{ color: "red", fontSize: "15px" }}
                      className="error-message"
                    >
                      {errorMessage}
                    </p>
                  )}
                  <div className="savePass-btn">
                    <button type="submit">Save Password</button>
                  </div>
                </form>
              </div>
            </div>
            <div className="logo-user-container">
              <img src={logo} alt="logo"></img>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {showPopup && (
        <div className="popup-container">
          <div className="popup savepass">
            <p className="message">Password changed successfully!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProfile;
