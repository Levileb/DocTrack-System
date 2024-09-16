import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../AdminSidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import { RiArrowGoBackFill } from "react-icons/ri";
import "../navigation/newcontent.css";
import { Link } from "react-router-dom";
import axios from "axios";

const ArchiveOffice = () => {
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [data, setData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Fetch archived offices from the backend
    const fetchArchivedOffices = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/archived-offices"
        ); // Corrected URL
        console.log("Fetched archived offices:", response.data); // Log response data
        setData(response.data);
      } catch (error) {
        console.error("Error fetching archived offices", error);
      }
    };

    fetchArchivedOffices();
  }, []);

  const handleRestore = async (officeId) => {
    try {
      await axios.post(`http://localhost:3001/restore-office/${officeId}`); // Corrected URL
      // Update the local state to reflect the restored office
      setData(data.filter((office) => office._id !== officeId));
      console.log("Office restored:", officeId); // Log restored office ID
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000); // Hide popup after 3 seconds
    } catch (error) {
      console.error("Error restoring office", error);
    }
  };

  const filteredData = data.filter((val) => {
    // Check for search query match (case insensitive)
    const searchMatch =
      val.office &&
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
                <Link to="/add-office">
                  <button>
                    <Tooltip text={"Click to go back, Home page"}>
                      <RiArrowGoBackFill className="back-icon" />
                    </Tooltip>{" "}
                  </button>
                </Link>
              </div>
              <div className="filter">
                <p>Archived Offices</p>
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
                        <td>Name</td>
                        <td>Action</td>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((val, key) => {
                        return (
                          <tr key={key}>
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
            <p>Office Restored!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ArchiveOffice;
