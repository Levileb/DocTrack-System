import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuHome, LuUserSquare2, LuFolderCheck } from "react-icons/lu";
import { RiFolderReceivedLine, RiMailSendLine } from "react-icons/ri";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { MdLogout, MdOutlineContentPasteSearch } from "react-icons/md";
import { BsArrowLeftCircleFill } from "react-icons/bs";
import axios from "axios";
import { AiFillCloseCircle } from "react-icons/ai";
import { GrDocumentTime } from "react-icons/gr";
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
    fetchUserDetails();
  }, []);

  const fetchUserDetails = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token is missing");
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
      });
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    setArrowRotated(!arrowRotated);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const { firstname, lastname, role } = userDetails;

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

  const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
      <div
        className="tooltip-container"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        {isVisible && <div className="tooltip">{text}</div>}
      </div>
    );
  };
  const TooltipUser = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
      <div
        className="tooltipUser-container"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        {isVisible && <div className="tooltipUser">{text}</div>}
      </div>
    );
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
                  onClick={handleGotoProfile}
                  style={{
                    fontFamily: "Poppins",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  <TooltipUser text={"View Profile"}>{firstname}</TooltipUser>
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
                >
                  <Tooltip text={"Home"}>
                    <LuHome className="icon" />
                  </Tooltip>

                  <p href="/home">Home</p>
                </li>
              </Link>

              <Link onClick={scrollToTop} to="/track-document">
                <li className={isActive("/track-document") ? "active" : ""}>
                  <Tooltip text={"Track Document"}>
                    <MdOutlineContentPasteSearch className="icon" />
                  </Tooltip>
                  <p>Track Document</p>
                </li>
              </Link>

              <Link to="/submit-document">
                <li
                  onClick={scrollToTop}
                  className={isActive("/submit-document") ? "active" : ""}
                >
                  <Tooltip text={"Submit Document"}>
                    <RiMailSendLine className="icon" />
                  </Tooltip>

                  <p href="/submit-document">Submit Document</p>
                </li>
              </Link>

              <Link to="/incoming">
                <li
                  onClick={scrollToTop}
                  className={isActive("/incoming") ? "active" : ""}
                >
                  <Tooltip text={"Incoming"}>
                    <RiFolderReceivedLine className="icon" />
                  </Tooltip>

                  <p href="/incoming">Incoming</p>
                </li>
              </Link>

              <Link to="/outgoing">
                <li
                  onClick={scrollToTop}
                  className={isActive("/outgoing") ? "active" : ""}
                >
                  <Tooltip text={"Outgoing"}>
                    <FaRegShareFromSquare className="icon" />
                  </Tooltip>

                  <p href="/outgoing">Outgoing</p>
                </li>
              </Link>

              <Link onClick={scrollToTop} to="/completed">
                <li className={isActive("/completed") ? "active" : ""}>
                  <Tooltip text={"Completed"}>
                    <LuFolderCheck className="icon" />
                  </Tooltip>

                  <p href="/completed">Completed</p>
                </li>
              </Link>

              {role === "admin" && (
                <Link to="/internal-logs">
                  <li
                    onClick={scrollToTop}
                    className={isActive("/internal-logs") ? "active" : ""}
                  >
                    <Tooltip text={"Internal Logs"}>
                      <GrDocumentTime className="icon" />
                    </Tooltip>
                    <p href="/view-user">Internal Logs</p>
                  </li>
                </Link>
              )}
              {role === "admin" && (
                <Link to="/view-user">
                  <li
                    onClick={scrollToTop}
                    className={isActive("/view-user") ? "active" : ""}
                  >
                    <Tooltip text={"View Users"}>
                      <LuUserSquare2 className="icon" />
                    </Tooltip>
                    <p href="/view-user">View Users</p>
                  </li>
                </Link>
              )}
            </ul>
          </div>
          <div
            className={`wiper ${arrowRotated ? "rotated" : ""}`}
            onClick={toggleCollapse}
          >
            <BsArrowLeftCircleFill className="arrow" />
          </div>

          <div className="logout">
            <Tooltip text={"Logout?"}>
              <MdLogout className="icon" />
            </Tooltip>
            <button onClick={handlePopup}>Logout</button>
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
