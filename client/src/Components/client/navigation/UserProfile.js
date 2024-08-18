import React, { useState } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import "../navigation/newcontent.css";
import logo from "../assets/kabankalan-logo.png";

const UserProfile = () => {
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
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
                <form>
                  <div className="password-container">
                    <label htmlFor="password">Change Password:</label>
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                    />

                    <input
                      type={isPasswordVisible ? "text" : "cpassword"}
                      id="cpassword"
                      name="cpassword"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Confirm password"
                    />
                    <span
                      className="toggle-password"
                      onClick={togglePasswordVisibility}
                    >
                      {isPasswordVisible ? "Hide Password" : "Show Password"}
                    </span>
                  </div>

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
    </>
  );
};

export default UserProfile;
