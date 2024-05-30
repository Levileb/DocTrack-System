import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import { FiUserPlus } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { IoSearch } from "react-icons/io5";
import axios from "axios";
import { AiFillCloseCircle } from "react-icons/ai";
import { BsBuildingAdd } from "react-icons/bs";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupUserData, setPopupUserData] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    // Fetch users data from the database
    axios.get("http://localhost:3001/view-user")
      .then(response => {
        setUsers(response.data); // Set the fetched data to the state
      })
      .catch(error => {
        console.error("Error fetching users:", error);
      });
  }, []);

  const handlePopup = (userId) => {
    setSelectedUserId(userId); // Set the selected user id
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    if (selectedUserId !== null) {
      // Fetch details of the selected user based on the id
      axios.get(`http://localhost:3001/api/user/details/${selectedUserId}`)
        .then(response => {
          setPopupUserData(response.data); // Set the fetched user data for the popup
        })
        .catch(error => {
          console.error("Error fetching user details:", error);
        });
    }
  }, [selectedUserId]);

  const handleEditUser = () => {
    navigate(`/update-user/${selectedUserId}`); // Pass selectedUserId in the URL
  };
  
  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="filter viewusers">
              <p>View Users</p>
            </div>
            <div className="navbuttons">
              <div className="adduserbtn secondarybtn">
                <Link to="/add-user" style={{ textDecoration: "none" }}>
                  <button>
                    <FiUserPlus className="icon" />
                    <p>Add User</p>
                  </button>
                </Link>
              </div>
              <div className="adduserbtn nf secondarybtn">
                <Link to="/add-office" style={{ textDecoration: "none" }}>
                  <button>
                    <BsBuildingAdd className="icon" />
                    <p>New Office</p>
                  </button>
                </Link>
              </div>
            </div>
            <div className="search">
              <div className="search-border">
                <IoSearch className="searchIcon" />
                <input
                  type="text"
                  placeholder="Search.."
                  className="search-bar"
                ></input>
              </div>
            </div>
          </div>

          <a className="loe">List of Employees</a>

          <div className="usertable content-table">
            <table>
              <thead>
                <tr>
                  <td>#</td>
                  <td>Name</td>
                  <td>Office</td>
                  <td>Position</td>
                  <td>Action</td>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.firstname} {user.lastname}</td>
                    <td>{user.office}</td>
                    <td>{user.position}</td>
                    <td>
                      <div className="view-user primarybtn">
                        <button onClick={() => handlePopup(user._id)}>View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <SidePanel />
      <Footer />

      {showPopup && (
        <div className="popup-container">
          <div className="popup pop-info">
            <p>User Information</p>
            {popupUserData && (
              <ul className="view-userinfo">
                <li>
                  Name:{" "}
                  <strong>
                    {popupUserData.firstname} {popupUserData.lastname}
                  </strong>
                </li>
                <li>
                  Position: <strong>{popupUserData.position}</strong>
                </li>
                <li>
                  Office: <strong>{popupUserData.office}</strong>
                </li>
                <li>
                  Role: <strong>{popupUserData.role}</strong>
                </li>
                <li>
                  Email: <strong>{popupUserData.email}</strong>
                </li>
              </ul>
            )}

            <button className="closebtn" onClick={closePopup}>
              <AiFillCloseCircle className="closeicon" />
            </button>
            <div className="actionbtn">
              <div className="editbtn secondarybtn">
                <button className="ed-btn" onClick={handleEditUser}>Edit</button> {/* Call handleEditUser on click */}
              </div>
              <div className="archivebtn secondarybtn">
                <button className="arc-btn">Archive</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
