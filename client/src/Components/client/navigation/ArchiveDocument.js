import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import { RiArrowGoBackFill } from "react-icons/ri";
import "../navigation/newcontent.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GrCaretNext, GrCaretPrevious } from "react-icons/gr";

const ArchiveDocument = () => {
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [data, setData] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false); // State for confirmation popup
  const [selectedDocId, setSelectedDocId] = useState(null); // State to store the selected office ID

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Fetch archived documents from the backend
    const fetchArchivedDocuments = async () => {
      try {
        const response = await axios.get(`${API_URL}/archived-document`); // Corrected URL
        // console.log("Fetched archived documents:", response.data);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching archived documents", error);
      }
    };

    fetchArchivedDocuments();
  }, []);

  const handleRestoreClick = (docId) => {
    setSelectedDocId(docId);
    setShowConfirmPopup(true); // Show the confirmation popup
  };

  const handleRestore = async (docId) => {
    if (!selectedDocId) return;
    try {
      await axios.post(`${API_URL}/restore-document`, {
        docId: selectedDocId,
      }); // Use selectedDocId here
      // Update the local state to reflect the restored document
      setData(data.filter((doc) => doc._id !== selectedDocId));
      // console.log("Document restored:", selectedDocId);
      toast.success("Document Restored!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      console.error("Error restoring document", error);
      toast.error("Something went wrong, please try again!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setShowConfirmPopup(false); // Hide the confirmation popup
      setSelectedDocId(null); // Reset the selected office ID
    }
  };

  const cancelRestore = () => {
    setShowConfirmPopup(false); // Hide the confirmation popup
    setSelectedDocId(null); // Reset the selected office ID
  };

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

  const [currentPage, setCurrentPage] = useState(1);
  const docsPerPage = 20; // Adjust this number to show more/less documents per page
  const [totalPages, setTotalPages] = useState(1);

  const startIndex = (currentPage - 1) * docsPerPage;
  const endIndex = startIndex + docsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    const totalPages = Math.ceil(filteredData.length / docsPerPage);
    setTotalPages(totalPages);
  }, [filteredData]);

  return (
    <>
      <Header />
      <SidePanel />
      <div>
        <div className="MainPanel">
          <div className="PanelWrapper">
            <div className="AddUserHeader arc">
              <div className="back-btn">
                <Link to="/home">
                  <button>
                    <Tooltip text={"Click to go back, Home page"}>
                      <RiArrowGoBackFill className="back-icon" />
                    </Tooltip>{" "}
                  </button>
                </Link>
              </div>
              <div className="filter">
                <p>Archived Document</p>
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
                      {paginatedData.length > 0 ? (
                        paginatedData.map((val, key) => (
                          <tr key={key}>
                            <td>{formatDateForDisplay(val.date)}</td>
                            <td>{val.title}</td>
                            <td>{val.sender}</td>
                            <td>{val.recipient}</td>
                            <td>
                              <div className="viewbtn">
                                <button
                                  onClick={() => handleRestoreClick(val._id)}
                                >
                                  Restore
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">No Archived Documents Available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="pagination-controls">
                    <button
                      className="prev-btn"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <GrCaretPrevious />
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="next-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <GrCaretNext />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer />
      {showConfirmPopup && (
        <div className="confirm-popup">
          <p>Are you sure you want to restore this office?</p>
          <div className="popup-content">
            <button onClick={handleRestore} className="confirm-btn">
              Yes
            </button>
            <button onClick={cancelRestore} className="cancel-btn">
              No
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ArchiveDocument;
