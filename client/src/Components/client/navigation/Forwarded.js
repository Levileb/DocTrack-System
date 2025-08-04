import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import { AiFillCloseCircle } from "react-icons/ai";
import axios from "axios";
import Cookies from "js-cookie";
import { GrCaretPrevious } from "react-icons/gr";
import { GrCaretNext } from "react-icons/gr";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegCopy } from "react-icons/fa6";

const Forwarded = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [data, setData] = useState([]); // Filtered data for Outgoing
  const [originalData, setOriginalData] = useState([]); // Original data for Outgoing
  const [recData, setRecData] = useState([]); // Filtered data for Incoming
  const [searchQueryRec, setSearchQueryRec] = useState(""); // Search query for Incoming
  const [searchQueryOut, setSearchQueryOut] = useState(""); // Search query for Outgoing
  const [originalRecData, setOriginalRecData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  // Pagination states for Incoming table
  const [currentRecPage, setCurrentRecPage] = useState(1);
  const [totalRecPages, setTotalRecPages] = useState(1);
  const recDocsPerPage = 10;

  // Pagination states for Outgoing table
  const [currentOutPage, setCurrentOutPage] = useState(1);
  const [totalOutPages, setTotalOutPages] = useState(1);
  const outDocsPerPage = 10;

  useEffect(() => {
    fetchReceivedDocuments();
    fetchForwardedDocuments();
  }, );

  const fetchForwardedDocuments = async () => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(`${API_URL}/api/docs/forwarded`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      // Sort documents from most recent to oldest
      response.data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setData(response.data); // Set filtered data
      setOriginalData(response.data); // Set original data
    } catch (error) {
      console.error("Error fetching forwarded documents:", error);
    }
  };

  const fetchReceivedDocuments = async () => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(`${API_URL}/api/docs/received`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      // Sort documents from most recent to oldest
      response.data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setRecData(response.data);
      setOriginalRecData(response.data);
      // console.log("DATA", response.data);
    } catch (error) {
      console.error("Error fetching received documents:", error);
    }
  };

  useEffect(() => {
    const totalRecPages = Math.ceil(recData.length / recDocsPerPage);
    setTotalRecPages(totalRecPages);
  }, [recData]);

  useEffect(() => {
    const totalOutPages = Math.ceil(data.length / outDocsPerPage);
    setTotalOutPages(totalOutPages);
  }, [data]);

  const handlePopup = (selectedItem) => {
    setShowPopup(true);
    setSelectedItem(selectedItem);
  };
  const handlePopup2 = (selectedItem) => {
    setShowPopup2(true);
    setSelectedItem(selectedItem);
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowPopup2(false);
  };

  const handleSearchChangeRec = (event) => {
    const query = event.target.value;
    setSearchQueryRec(query);

    const filteredData = originalRecData.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(query.toLowerCase())
      )
    );
    setRecData(filteredData);
  };

  const handleSearchChangeOut = (event) => {
    const query = event.target.value;
    setSearchQueryOut(query);

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

  // Pagination for Incoming table
  const recStartIndex = (currentRecPage - 1) * recDocsPerPage;
  const recEndIndex = recStartIndex + recDocsPerPage;
  const paginatedRecData = recData.slice(recStartIndex, recEndIndex);

  // Pagination for Outgoing table
  const outStartIndex = (currentOutPage - 1) * outDocsPerPage;
  const outEndIndex = outStartIndex + outDocsPerPage;
  const paginatedOutData = data.slice(outStartIndex, outEndIndex);

  // console.log(paginatedRecData.map((doc) => doc.docId));

  //Copy Code Number to clipboard
  const handleCopyCode = (codeNumber) => {
    navigator.clipboard
      .writeText(codeNumber)
      .then(() => {
        toast.success("Copied to clipboard!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      })
      .catch(() => {
        toast.error("Failed to copy control number!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      });
  };

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="filter">
              <p>Forwarded</p>
            </div>
          </div>
          <div className="contents">
            <div className="content-table">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <label>Incoming</label>
                <div className="search">
                  <div className="search-border">
                    <IoSearch className="searchIcon" />
                    <input
                      type="search"
                      placeholder="Search.."
                      className="search-bar"
                      value={searchQueryRec}
                      onChange={handleSearchChangeRec}
                    />
                  </div>
                </div>
              </div>

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
                  {paginatedRecData.length > 0 ? (
                    paginatedRecData.map((val) => (
                      <tr key={val.docId}>
                        <td>{formatDateForDisplay(val.date)}</td>
                        <td>{val.title}</td>
                        <td>{val.sender}</td>
                        <td>
                          <div className="viewbtn">
                            <button onClick={() => handlePopup2(val)}>
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No Incoming Logs Available</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="pagination-controls">
                <button
                  className="prev-btn"
                  onClick={() => setCurrentRecPage(currentRecPage - 1)}
                  disabled={currentRecPage === 1}
                >
                  <GrCaretPrevious />
                </button>
                <span>
                  Page {currentRecPage} of {totalRecPages}
                </span>
                <button
                  className="next-btn"
                  disabled={currentRecPage === totalRecPages}
                  onClick={() => setCurrentRecPage(currentRecPage + 1)}
                >
                  <GrCaretNext />
                </button>
              </div>
            </div>
            <div className="content-table">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <label>Outgoing</label>
                <div className="search">
                  <div className="search-border">
                    <IoSearch className="searchIcon" />
                    <input
                      type="search"
                      placeholder="Search.."
                      className="search-bar"
                      value={searchQueryOut}
                      onChange={handleSearchChangeOut}
                    />
                  </div>
                </div>
              </div>
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
                  {paginatedOutData.length > 0 ? (
                    paginatedOutData.map((val) => (
                      <tr key={val.docId}>
                        <td>{formatDateForDisplay(val.date)}</td>
                        <td>{val.title}</td>
                        <td>{val.forwardedTo}</td>
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
                      <td colSpan="4">No Outgoing Logs Available</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="pagination-controls">
                <button
                  className="prev-btn"
                  disabled={currentOutPage === 1}
                  onClick={() => setCurrentOutPage(currentOutPage - 1)}
                >
                  <GrCaretPrevious />
                </button>
                <span>
                  Page {currentOutPage} of {totalOutPages}
                </span>
                <button
                  className="next-btn"
                  disabled={currentOutPage === totalOutPages}
                  onClick={() => setCurrentOutPage(currentOutPage + 1)}
                >
                  <GrCaretNext />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SidePanel />
      <Footer />
      <ToastContainer />

      {showPopup && selectedItem && (
        <div className="popup-container">
          <div className="popup">
            <p>Document Information</p>
            <ul className="view-userinfo">
              <li>
                Date: <strong>{formatDateForDisplay(selectedItem.date)}</strong>
              </li>
              <li>
                Code Number: <strong>{selectedItem.codeNumber}</strong>
                <button
                  onClick={() => handleCopyCode(selectedItem.codeNumber)}
                  title="Copy Control Number"
                  className="copy-btn"
                >
                  <FaRegCopy />
                </button>
              </li>
              <li>
                Title: <strong>{selectedItem.title}</strong>
              </li>
              <li>
                Recipient: <strong>{selectedItem.forwardedTo}</strong>
              </li>
              <li>
                Status: <strong>{selectedItem.status}</strong>
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
      {showPopup2 && selectedItem && (
        <div className="popup-container">
          <div className="popup">
            <p>Document Information</p>
            <ul className="view-userinfo">
              <li>
                Date: <strong>{formatDateForDisplay(selectedItem.date)}</strong>
              </li>
              <li>
                Code Number: <strong>{selectedItem.codeNumber}</strong>
                <button
                  onClick={() => handleCopyCode(selectedItem.codeNumber)}
                  title="Copy Control Number"
                  className="copy-btn"
                >
                  <FaRegCopy />
                </button>
              </li>
              <li>
                Title: <strong>{selectedItem.title}</strong>
              </li>
              <li>
                Sender: <strong>{selectedItem.sender}</strong>
              </li>
              <li>
                Status: <strong>{selectedItem.status}</strong>
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
