import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuHome, LuUserSquare2 } from "react-icons/lu";
import { BsBuildingAdd } from "react-icons/bs";

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
    navigate("/user-profile-admin");
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
                  title="Go to User Profile?"
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
              <Link to="/admin">
                <li
                  onClick={scrollToTop}
                  className={isActive("/admin") ? "active" : ""}
                  title="Home Page"
                >
                  <LuHome className="icon" />
                  <p>Home</p>
                </li>
              </Link>

              <Link onClick={scrollToTop} to="/document-tracking">
                <li
                  className={isActive("/document-tracking") ? "active" : ""}
                  title="Track Document Page"
                >
                  <MdOutlineContentPasteSearch className="icon" />
                  <p>Track Document</p>
                </li>
              </Link>

              {/* <Link onClick={scrollToTop} to="/completed">
                <li className={isActive("/completed") ? "active" : ""}>
                  <Tooltip text={"Completed"}>
                    <LuFolderCheck className="icon" />
                  </Tooltip>
                  <p>Completed</p>
                </li>
              </Link> */}

              <Link to="/view-user">
                <li
                  onClick={scrollToTop}
                  className={isActive("/view-user") ? "active" : ""}
                  title="View Users"
                >
                  <LuUserSquare2 className="icon" />

                  <p>View Users</p>
                </li>
              </Link>

              <Link to="/add-office">
                <li
                  onClick={scrollToTop}
                  className={isActive("/add-office") ? "active" : ""}
                  title="View Offices"
                >
                  <BsBuildingAdd className="icon" />

                  <p>View Offices</p>
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
