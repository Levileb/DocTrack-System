import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import { RiArrowGoBackFill } from "react-icons/ri";
import "../navigation/newcontent.css";
import { Link } from "react-router-dom";

const ArchiveUsers = () => {
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [data, setData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const filteredData = data.filter((val) => {
    // Check for search query match (case insensitive)
    const searchMatch =
      val.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.originating.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.destination.toLowerCase().includes(searchQuery.toLowerCase());

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
                        <td>Date</td>
                        <td>Title</td>
                        <td>From</td>
                        <td>To</td>
                        <td>Action</td>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((val, key) => {
                        return (
                          <tr key={key}>
                            <td>{new Date(val.date).toLocaleDateString()}</td>
                            <td>{val.title}</td>
                            <td>{val.sender}</td>
                            <td>{val.recipient}</td>
                            <td>
                              <div className="viewbtn">
                                <button>Restore</button>
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

export default ArchiveUsers;
