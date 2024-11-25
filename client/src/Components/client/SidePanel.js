import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuHome, LuFolderCheck } from "react-icons/lu";
import { RiMailSendLine } from "react-icons/ri";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { FiInbox } from "react-icons/fi";
import { MdLogout } from "react-icons/md";
import { GrMapLocation } from "react-icons/gr";
import { CiUser } from "react-icons/ci";
import { BsArrowLeftCircleFill } from "react-icons/bs";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const SidePanel = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [arrowRotated, setArrowRotated] = useState(true);
  const [userDetails, setUserDetails] = useState({
    firstname: "",
    lastname: "",
    role: "",
  });
  const location = useLocation();
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch user details and handle token refreshing
  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = Cookies.get("accessToken");
      // console.log("Access Token:", token);

      // If access token is missing, try to refresh it
      if (!token) {
        console.error("Access token is missing");
        await refreshToken(); // Await refresh to ensure the token is set before retrying
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/user/details`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDetails(res.data);
        // console.log("User details fetched:", res.data);
      } catch (err) {
        console.error("Error: ", err);
        await refreshToken();
      }
    };

    // Function to refresh the access token using the refresh token
    const refreshToken = async () => {
      const refreshToken = Cookies.get("refreshToken");
      // console.log("Refresh Token:", refreshToken);

      if (!refreshToken) {
        console.error("Refresh token is missing");
        navigate("/login"); // Redirect to login if no refresh token
        return;
      }

      try {
        const res = await axios.post(`${API_URL}/api/refresh-token`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
          withCredentials: true,
        });

        const newAccessToken = res.data.accessToken;
        // console.log("New Access Token:", newAccessToken);

        // Set the new access token in cookies
        Cookies.set("accessToken", newAccessToken, {
          secure: true,
          sameSite: "Strict",
        });

        // Retry fetching user details with the new access token
        await fetchUserDetails();
      } catch (err) {
        console.error("Error refreshing token: ", err);
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        navigate("/login");
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    setArrowRotated(!arrowRotated);
  };

  const isActive = (path) => location.pathname === path;

  const { firstname, role } = userDetails;

  const handleLogout = () => {
    const confirmLogout = handlePopup;
    if (confirmLogout) {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      window.location.href = "/login";
    }
  };

  const [showPopup, setShowPopup] = useState(false);

  const handlePopup = (event) => {
    event.preventDefault();
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const firstLetter = firstname ? firstname.charAt(0).toUpperCase() : "";
  const capitalizeRole = (role) => role.toUpperCase();

  const handleGotoProfile = () => {
    navigate("/user-profile");
  };

  return (
    <>
      <div
        className={`spBackground ${!collapsed ? "visible" : ""}`}
        onClick={toggleCollapse}
      >
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <div className="user">
            <div className="user-acro">
              <h1>{firstLetter}</h1>
            </div>
            <div className="username">
              <ul>
                <li
                  className="user-fullname"
                  title="Go to User Profile"
                  onClick={handleGotoProfile}
                  style={{
                    fontFamily: "Poppins",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {firstname}
                </li>
                <li className="role-container">
                  <small className="role-user">
                    {capitalizeRole(role)} <CiUser className="role-icon" />
                  </small>
                </li>
              </ul>
            </div>
          </div>
          <div className="menus">
            <ul>
              <Link to="/home">
                <li
                  onClick={scrollToTop}
                  className={isActive("/home") ? "active" : ""}
                  title="Home Page"
                >
                  <LuHome className="icon" title="Home Page" />
                  <p>Home</p>
                </li>
              </Link>

              <Link to="/submit-document">
                <li
                  onClick={scrollToTop}
                  className={isActive("/submit-document") ? "active" : ""}
                  title="Submit Document Page"
                >
                  <RiMailSendLine
                    className="icon"
                    title="Submit Document Page"
                  />
                  <p>Submit Document</p>
                </li>
              </Link>

              <Link onClick={scrollToTop} to="/track-document">
                <li
                  className={isActive("/track-document") ? "active" : ""}
                  title="Track Document Page"
                >
                  <GrMapLocation className="icon" title="Track Document Page" />
                  <p>Track Document</p>
                </li>
              </Link>

              <Link to="/inbox">
                <li
                  onClick={scrollToTop}
                  className={isActive("/inbox") ? "active" : ""}
                  title="Inbox Page"
                >
                  <FiInbox className="icon" title="Inbox Page" />
                  <p>Inbox</p>
                </li>
              </Link>

              <Link to="/forwarded-logs">
                <li
                  onClick={scrollToTop}
                  className={isActive("/forwarded-logs") ? "active" : ""}
                  title="Forwarded Logs"
                >
                  <FaRegShareFromSquare
                    className="icon"
                    title="Forwarded Logs"
                  />
                  <p>Forwarded</p>
                </li>
              </Link>

              <Link onClick={scrollToTop} to="/completed">
                <li
                  className={isActive("/completed") ? "active" : ""}
                  title="Completed Logs"
                >
                  <LuFolderCheck className="icon" title="Completed Logs" />
                  <p>Completed</p>
                </li>
              </Link>
            </ul>
          </div>
          <div
            className={`wiper ${arrowRotated ? "rotated" : ""}`}
            onClick={toggleCollapse}
          >
            <BsArrowLeftCircleFill className="arrow" />
          </div>

          <div className="logout">
            <MdLogout className="icon" title="Logout?" />
            <button onClick={handlePopup} title="Logout?">
              Logout
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-container">
          <div className="popup lgt">
            <label>Are you sure you want to logout?</label>

            <div className="yesnobtns">
              <div className="primarybtn" onClick={closePopup}>
                <button className="no-button" autoFocus>
                  No
                </button>
              </div>

              <div className="primarybtn" onClick={handleLogout}>
                <button className="yes-button">Yes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SidePanel;
