import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import { AiFillCloseCircle } from "react-icons/ai";
import axios from "axios"; // Import axios for making HTTP requests

const Received = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [data, setData] = useState([]); // Initialize data state as an empty array
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch receiving logs data when the component mounts
    fetchReceivingLogs();
  }, []); // Empty dependency array to ensure this effect runs only once on component mount

  const fetchReceivingLogs = async () => {
    try {
        // Make a GET request to fetch received documents for the logged-in user
        const response = await axios.get("/api/docs/received");
        setData(response.data); // Update the state with received documents
    } catch (error) {
        console.error("Error fetching received documents:", error);
    }
};


  const handlePopup = (selectedItem) => {
    setShowPopup(true);
    setSelectedItem(selectedItem);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    // Filter data based on search query
    const filteredData = data.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(query.toLowerCase())
      )
    );
    setData(filteredData);
  };

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="filter">
              <p>Incoming Logs</p>
            </div>
            <div className="search">
              <div className="search-border">
                <IoSearch className="searchIcon" />
                <input
                  type="search"
                  placeholder="Search.."
                  className="search-bar"
                  value={searchQuery}
                  onChange={handleSearchChange}
                ></input>
              </div>
            </div>
          </div>
          <div className="contents">
            <div className="content-table">
              <table>
                <thead>
                  <tr>
                    <td>Date</td>
                    <td>Title</td>
                    <td>From</td>
                    <td>Action</td>
                  </tr>
                </thead>
                <tbody>
                  {data.map((val, key) => (
                    <tr key={key}>
                      <td>{val.date}</td>
                      <td>{val.title}</td>
                      <td>{val.sender}</td>
                      <td>
                        <div className="viewbtn">
                          <button onClick={() => handlePopup(val)}>
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <SidePanel />
      <Footer />
      {showPopup && (
        <div className="popup-container">
          <div className="popup">
            <p>Document Information</p>
            <ul className="view-userinfo">
              <li>Date: <strong>{selectedItem.date}</strong></li>
              <li>Title: <strong>{selectedItem.title}</strong></li>
              <li>From: <strong>{selectedItem.sender}</strong></li>
            </ul>
            <button className="closebtn" onClick={closePopup}>
              <AiFillCloseCircle className="closeicon" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Received;
