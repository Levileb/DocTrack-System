import React, { useState, useEffect } from "react";
import user from "./assets/sample-profile.png";
import { Link, useLocation } from "react-router-dom";
import { LuHome } from "react-icons/lu";
import { LuUserSquare2 } from "react-icons/lu";
import { RiFolderReceivedLine } from "react-icons/ri";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { LuFolderCheck } from "react-icons/lu";
import { RiMailSendLine } from "react-icons/ri";
import { MdLogout } from "react-icons/md";
import { BsArrowLeftCircleFill } from "react-icons/bs";
import axios from 'axios'; // Import axios for making HTTP requests
import { AiFillCloseCircle } from "react-icons/ai";
import { MdOutlineContentPasteSearch } from "react-icons/md";

const SidePanel = () => {
  const [collapsed, setCollapsed] = useState(true); // State to track whether the side panel is collapsed or not
  const [arrowRotated, setArrowRotated] = useState(true); // State to track arrow rotation
  const [userDetails, setUserDetails] = useState({ firstname: "", lastname: "",  role: "" }); // State to store user details
  const location = useLocation(); // get current location

  useEffect(() => {
    // Fetch user details from the backend when component mounts
    fetchUserDetails();
  }, []);

  const fetchUserDetails = () => {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    if (!token) {
      console.error("Token is missing");
      return;
    }
  
    // Wait for the token to become available
    const intervalId = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        clearInterval(intervalId); // Stop waiting once token is available
        axios.get('http://localhost:3001/api/user/details', {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the request headers
          }
        })
          .then(response => {
            setUserDetails(response.data); // Set the user details in the state
          })
          .catch(error => {
            console.error("Error fetching user details:", error);
          });
      }
    }, 1000); // Check for token availability every 1 second
  };
  
  
  
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    setArrowRotated(!arrowRotated); // Toggle arrow rotation
  };

  const isActive = (path) => {
    return location.pathname === path; // check if path matches current location
  };

  const { firstname, lastname, role } = userDetails; // Destructure user details

  const handleLogout = () => {
    // const confirmLogout = window.confirm("Are you sure you want to Log out?");
    const confirmLogout = handlePopup;
    if (confirmLogout) {
      // Perform logout action
      // For example, clearing local storage and redirecting to login page
      localStorage.removeItem("token");
      window.location.href = "/"; // Assuming "/login" is your login page route
    }
  };

  const [showPopup, setShowPopup] = useState(false); // State for popup visibility

  const handlePopup = (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    // Add your form submission logic here

    // Show popup notification
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

  return (
    <>
    <div
        className={`spBackground ${!collapsed ? "visible" : ""}`}
        onClick={toggleCollapse}
        >
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <div className="user">
            <img src={user} alt="user profile"></img>
            <div className="username">
              <ul>
                <li
                  style={{
                    fontFamily: "Poppins",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {firstname} 
                </li>
                <li>{role}</li>
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
                  <MdOutlineContentPasteSearch className="icon" />
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

              <Link to="/received">
                <li
                  onClick={scrollToTop}
                  className={isActive("/received") ? "active" : ""}
                >
                  <Tooltip text={"Received"}>
                    <RiFolderReceivedLine className="icon" />
                  </Tooltip>

                  <p href="/received">Received</p>
                </li>
              </Link>

              <Link to="/forwarded">
                <li
                  onClick={scrollToTop}
                  className={isActive("/forwarded") ? "active" : ""}
                >
                  <Tooltip text={"Forwarded"}>
                    <FaRegShareFromSquare className="icon" />
                  </Tooltip>

                  <p href="/forwarded">Forwarded</p>
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

              {role === "admin" && ( // Conditionally render based on user's position
                <Link to="/view-user">
                  <li onClick={scrollToTop} className={isActive("/view-user") ? "active" : ""}>
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

          <div className="logout" >
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
              <div className=" primarybtn" onClick={closePopup}>
                <button>No</button>
              </div>

              <div className="primarybtn" onClick={handleLogout}>
                <button>Yes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SidePanel;
