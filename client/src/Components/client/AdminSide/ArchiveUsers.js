import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../AdminSidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import { RiArrowGoBackFill } from "react-icons/ri";
import "../navigation/newcontent.css";
import { Link } from "react-router-dom";
import axios from "axios";

const ArchiveUsers = () => {
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [data, setData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Fetch archived users from the backend
    const fetchArchivedUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/archived-users"
        ); // Corrected URL
        console.log("Fetched archived users:", response.data); // Log response data
        setData(response.data);
      } catch (error) {
        console.error("Error fetching archived users", error);
      }
    };

    fetchArchivedUsers();
  }, []);

  const handleRestore = async (userId) => {
    try {
      await axios.post(`http://localhost:3001/restore-user/${userId}`); // Corrected URL
      // Update the local state to reflect the restored user
      setData(data.filter((user) => user._id !== userId));
      console.log("User restored:", userId); // Log restored user ID
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000); // Hide popup after 3 seconds
    } catch (error) {
      console.error("Error restoring user", error);
    }
  };

  const filteredData = data.filter((val) => {
    // Check for search query match (case insensitive)
    const searchMatch =
      val.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.office.toLowerCase().includes(searchQuery.toLowerCase());

    return searchMatch;
  });

  const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
      <div
        className="tooltip2-container"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        {isVisible && <div className="tooltip2">{text}</div>}
      </div>
    );
  };

  return (
    <>
      <Header />
      <SidePanel />
      <div>
        <div className="MainPanel">
          <div className="PanelWrapper">
            <div className="AddUserHeader arc">
              <div className="back-btn">
                <Link to="/view-user">
                  <button>
                    <Tooltip text={"Click to go back, Home page"}>
                      <RiArrowGoBackFill className="back-icon" />
                    </Tooltip>{" "}
                  </button>
                </Link>
              </div>
              <div className="filter">
                <p>Archived Users</p>
              </div>
              <div className="search">
                <div className="search-border">
                  <IoSearch className="searchIcon" />
                  <input
                    type="search"
                    name=""
                    id=""
                    placeholder="Search.."
                    className="search-bar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  ></input>
                </div>
              </div>
            </div>
            <div className="logList-container">
              <div className="contents">
                <div className="content-table">
                  <table>
                    <thead>
                      <tr>
                        <td>First Name</td>
                        <td>Last Name</td>
                        <td>Email</td>
                        <td>Position</td>
                        <td>Office</td>
                        <td>Action</td>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((val, key) => {
                        return (
                          <tr key={key}>
                            <td>{val.firstname}</td>
                            <td>{val.lastname}</td>
                            <td>{val.email}</td>
                            <td>{val.position}</td>
                            <td>{val.office}</td>
                            <td>
                              <div className="viewbtn">
                                <button onClick={() => handleRestore(val._id)}>
                                  Restore
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {showPopup && (
        <div className="popup-container">
          <div className="popup forwarding">
            <p>User Restored!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ArchiveUsers;
