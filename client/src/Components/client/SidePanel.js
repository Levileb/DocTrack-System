import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuHome, LuFolderCheck } from "react-icons/lu";
import { RiFolderReceivedLine, RiMailSendLine } from "react-icons/ri";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { MdLogout, MdOutlineContentPasteSearch } from "react-icons/md";
import { BsArrowLeftCircleFill } from "react-icons/bs";
import axios from "axios";
import { AiFillCloseCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const fetchUserDetails = () => {
      const token = localStorage.getItem("token");
      console.log("Token Retrieved", token);
      if (!token) {
        console.error("Token is missing");
        navigate("/"); // Redirect to login page if token is missing
        return;
      }

      axios
        .get("http://localhost:3001/api/user/details", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUserDetails(response.data);
          console.log("User details fetched:", response.data);
        })
        .catch((error) => {
          console.error("Error fetching user details:", error);
          if (error.response && error.response.status === 401) {
            // Handle unauthorized error (e.g., redirect to login)
            navigate("/");
          }
        });
    };

    fetchUserDetails();
  }, [navigate]); // Dependency array should include 'navigate'

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    setArrowRotated(!arrowRotated);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const { firstname, role } = userDetails;

  const handleLogout = () => {
    const confirmLogout = handlePopup;
    if (confirmLogout) {
      localStorage.removeItem("token");
      window.location.href = "/";
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

                <li>
                  <small>{capitalizeRole(role)}</small>
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
                  <MdOutlineContentPasteSearch
                    className="icon"
                    title="Track Document Page"
                  />
                  <p>Track Document</p>
                </li>
              </Link>

              <Link to="/incoming">
                <li
                  onClick={scrollToTop}
                  className={isActive("/incoming") ? "active" : ""}
                  title="Incoming Page"
                >
                  <RiFolderReceivedLine
                    className="icon"
                    title="Incoming Page"
                  />

                  <p>Incoming</p>
                </li>
              </Link>

              <Link to="/outgoing">
                <li
                  onClick={scrollToTop}
                  className={isActive("/outgoing") ? "active" : ""}
                  title="Outgoing Page"
                >
                  <FaRegShareFromSquare
                    className="icon"
                    title="Outgoing Page"
                  />
                  <p>Outgoing</p>
                </li>
              </Link>

              <Link onClick={scrollToTop} to="/completed">
                <li
                  className={isActive("/completed") ? "active" : ""}
                  title="Completed Page"
                >
                  <LuFolderCheck className="icon" title="Completed Page" />
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

            <button className="closebtn" onClick={closePopup}>
              <AiFillCloseCircle className="closeicon" />
            </button>

            <div className="yesnobtns">
              <div className="primarybtn" onClick={closePopup}>
                <button class="no-button" autoFocus>
                  No
                </button>
              </div>

              <div className="primarybtn" onClick={handleLogout}>
                <button class="yes-button">Yes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SidePanel;
