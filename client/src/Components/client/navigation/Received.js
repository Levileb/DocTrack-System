import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import { AiFillCloseCircle } from "react-icons/ai";
import axios from "axios";

const Received = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [data, setData] = useState([]); // This will hold the filtered data
  const [originalData, setOriginalData] = useState([]); // This will hold the original data
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchReceivedDocuments();
  }, []);

  const fetchReceivedDocuments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/docs/received",
        {
          withCredentials: true,
        }
      );
      // Sort documents from most recent to oldest
      response.data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setData(response.data); // Assuming the response is already the list of documents
      setOriginalData(response.data); // Store the original data separately
      console.log("DATA", response.data);
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

    // Filter data based on search query, but use originalData for reference
    const filteredData = originalData.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(query.toLowerCase())
      )
    );
    setData(filteredData);
  };

  const formatDateForDisplay = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;

    return `${month}/${day}/${year} - ${hours}:${minutes} ${ampm}`;
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
                    <td>Sender</td>
                    <td>Action</td>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((val, key) => (
                      <tr key={key}>
                        <td>{formatDateForDisplay(val.date)}</td>
                        <td>{val.title}</td>
                        <td>{val.sender}</td> {/* Full name of the sender */}
                        <td>
                          <div className="viewbtn">
                            <button onClick={() => handlePopup(val)}>
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No Logs Available</td>
                    </tr>
                  )}
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
                Date: <strong>{formatDateForDisplay(selectedItem.date)}</strong>
              </li>
              <li>
                Title: <strong>{selectedItem.title}</strong>
              </li>
              <li>
                Code Number: <strong>{selectedItem.codeNumber}</strong>
              </li>
              <li>
                From: <strong>{selectedItem.sender}</strong>
              </li>
              <li>
                Remarks: <strong>{selectedItem.remarks}</strong>{" "}
                {/* New field */}
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

export default Received;
