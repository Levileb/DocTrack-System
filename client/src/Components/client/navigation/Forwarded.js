import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import { AiFillCloseCircle } from "react-icons/ai";
import axios from "axios";

const Forwarded = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [data, setData] = useState([]); // Filtered data
  const [originalData, setOriginalData] = useState([]); // Original data
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchForwardedDocuments();
  }, []);

  const fetchForwardedDocuments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/docs/forwarded",
        {
          withCredentials: true,
        }
      );
      // Sort documents from most recent to oldest
      response.data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setData(response.data); // Set filtered data
      setOriginalData(response.data); // Set original data
    } catch (error) {
      console.error("Error fetching forwarded documents:", error);
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

    const filteredData = originalData.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(query.toLowerCase())
      )
    );
    setData(filteredData);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="filter">
              <p>Outgoing Logs</p>
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
                />
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
                    <td>Recipient</td>
                    <td>Action</td>
                  </tr>
                </thead>
                <tbody>
                  {data.map((val, key) => (
                    <tr key={key}>
                      <td>{formatDate(val.date)}</td>
                      <td>{val.title}</td>
                      <td>{val.forwardedTo}</td>{" "}
                      {/* Now displays the full name */}
                      <td>
                        <div className="viewbtn">
                          <button onClick={() => handlePopup(val)}>View</button>
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
      {showPopup && selectedItem && (
        <div className="popup-container">
          <div className="popup">
            <p>Document Information</p>
            <ul className="view-userinfo">
              <li>
                Date: <strong>{formatDate(selectedItem.date)}</strong>
              </li>
              <li>
                Title: <strong>{selectedItem.title}</strong>
              </li>
              <li>
                Recipient: <strong>{selectedItem.forwardedTo}</strong>{" "}
                {/* Display full name */}
              </li>
              <li>
                Remarks: <strong>{selectedItem.remarks}</strong>
              </li>
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

export default Forwarded;
