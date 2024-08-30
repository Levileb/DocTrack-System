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
      setData(response.data); // Assuming the response is already the list of documents
      setOriginalData(response.data); // Store the original data separately
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
                  {data.map((val, key) => (
                    <tr key={key}>
                      <td>{new Date(val.date).toLocaleDateString()}</td>
                      <td>{val.title}</td>
                      <td>{val.sender}</td> {/* Full name of the sender */}
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
                Date:{" "}
                <strong>
                  {new Date(selectedItem.date).toLocaleDateString()}
                </strong>
              </li>
              <li>
                Title: <strong>{selectedItem.title}</strong>
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
