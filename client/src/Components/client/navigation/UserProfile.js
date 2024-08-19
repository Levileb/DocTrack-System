import React, { useState } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import "../navigation/newcontent.css";
import logo from "../assets/kabankalan-logo.png";

const UserProfile = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const evaluatePasswordStrength = (password) => {
    let strength = "";

    // New criteria: At least one letter and one number, and a minimum of 8 characters.
    const regexStrong =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // New criteria: At least one letter and one number, and a minimum of 6 characters.
    const regexMedium = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{6,}$/;

    if (regexStrong.test(password)) {
      strength = "Strong Password";
      console.log("Strong");
    } else if (regexMedium.test(password)) {
      strength = "Medium Password";
      console.log("Medium");
    } else {
      strength = "Weak Password";
      console.log("Weak");
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

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    // Passwords match and strong enough, proceed with form submission logic
    setErrorMessage(""); // Clear any error messages
    setShowPopup(true);
    console.log("Password changed successfully!");

    // Reset the form (optional)
    setPassword("");
    setConfirmPassword("");
    setPasswordStrength("");
    setTimeout(() => setShowPopup(false), 1500);
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
                <p className="user-fullname">Theuser S. Fullname</p>
                <p className="user-position">IT Officer II </p>
                <p>Office: Plannning</p>
                <p>Role: User</p>
                <p>Email: user@mail.com</p>
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

export default UserProfile;
