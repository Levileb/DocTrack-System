import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import "./contentdesign.css";
import { IoSearch } from "react-icons/io5";
import { Link } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import axios from "axios";
import { GrCaretPrevious } from "react-icons/gr";
import { GrCaretNext } from "react-icons/gr";
import { FaRegCopy } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QrReader from "./QrReader";
import { useNavigate } from "react-router-dom";

const Received = () => {
  const [docs, setDocs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue] = useState("");
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const [scanned_id, setScanned_Id] = useState(null);
  const [scanDoc, setScanDoc] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    const filtered = docs.filter(
      (doc) =>
        (filterValue === "" || doc.status === filterValue) &&
        (doc.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.recipient.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredDocs(filtered);
  }, [searchQuery, docs, filterValue]);

  const fetchDocs = () => {
    axios
      .get(`${API_URL}/api/docs/inbox`, {
        withCredentials: true,
      })
      .then((response) => {
        const activeDocs = response.data.filter(
          (doc) => doc.status !== "Archived"
        );

        // Sort documents from most recent to oldest
        activeDocs.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Set the sorted documents in the state
        setDocs(activeDocs);
        setScanDoc(activeDocs);
        setFilteredDocs(activeDocs);
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
      });
  };
  const closeOptions = () => {
    setShowOptions(false);
  };

  const qrButtonHandler = (event) => {
    event.preventDefault();
    setShowPopup(false);
    setShowScanner(true);
  };

  const closeScanner = () => {
    setShowScanner(false);
  };

  // Handle QR Code Scanning
  const handleScan = async (data) => {
    try {
      const scannedData = JSON.parse(data);
      console.log("Scanned Data:", scannedData);

      const selectedDoc = scanDoc.find((doc) => {
        return (
          doc.date === scannedData.date &&
          doc.title === scannedData.title &&
          doc.sender === scannedData.sender &&
          doc.originating === scannedData.originating &&
          doc.recipient === scannedData.recipient &&
          doc.destination === scannedData.destination &&
          doc.codeNumber === scannedData.codeNumber
        );
      });

      if (selectedDoc) {
        // Check if the document status is already "Completed"
        if (selectedDoc.status === "Completed") {
          toast.info("This document is already marked as Completed.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          console.log('Document already marked as "Completed"');
        }
        if (selectedDoc.status === "Received") {
          setScanned_Id(selectedDoc._id);
          setShowOptions(true);
        } else {
          // If not "Completed or Received", proceed with updating the status to "Viewed"
          await axios.post(`${API_URL}/api/docs/update-status`, {
            docId: selectedDoc._id,
            // status: "Viewed",
          });
          navigate(`/receiving-document/${selectedDoc._id}`);

          toast.success("QR Code Scanned Successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          console.log('Document status updated to "Viewed"');
          setSelectedDoc({ ...selectedDoc, status: "Viewed" });
        }
      } else {
        console.log("No matching document found.");
        toast.error("No matching document found. Please try again!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Error handling scanned data:", error);
      toast.error("Something went wrong, please try again!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const handlePopup = (doc) => {
    setShowPopup(true);
    setSelectedDoc(doc);
  };

  const closePopup = () => {
    setSelectedDoc(null);
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

  // This is for the list of displayed documents in the table
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const docsPerPage = 20;

  const startIndex = (currentPage - 1) * docsPerPage;
  const endIndex = startIndex + docsPerPage;
  const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

  useEffect(() => {
    const totalPages = Math.ceil(filteredDocs.length / docsPerPage);
    setTotalPages(totalPages);
  }, [filteredDocs]);

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="filter">
              <p>Inbox</p>
            </div>
            <div className="search">
              <div className="search-border">
                <IoSearch className="searchIcon" />
                <input
                  type="search"
                  placeholder="Search.."
                  className="search-bar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    <td>From</td>
                    {/* <td>To</td> */}
                    <td>Action</td>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDocs.length > 0 ? (
                    paginatedDocs.map((val, key) => (
                      <tr key={key}>
                        <td>{formatDateForDisplay(val.date)}</td>
                        <td>{val.title}</td>
                        <td>{val.sender}</td>
                        {/* <td>{val.recipient}</td> */}
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
                      <td colSpan="4">No Inbox Documents Available</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="pagination-controls">
                <button
                  className="prev-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <GrCaretPrevious />
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="next-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
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

      {showScanner && (
        <div className="popup-container qr" onClick={closeScanner}>
          <div className="popup qrscanner">
            <QrReader onClose={closeScanner} onScan={handleScan} />
          </div>
        </div>
      )}

      {showPopup && selectedDoc && (
        <div className="popup-container">
          <div className="popup homeView">
            <p>Document Information</p>
            <ul className="view-userinfo">
              <li>
                Date: <strong>{formatDateForDisplay(selectedDoc.date)}</strong>
              </li>
              <li>
                Control Number:
                <strong>{selectedDoc.codeNumber}</strong>
                <button
                  onClick={() => handleCopyCode(selectedDoc.codeNumber)}
                  title="Copy Control Number"
                  className="copy-btn"
                >
                  <FaRegCopy />
                </button>
              </li>
              <li>
                Title: <strong>{selectedDoc.title}</strong>
              </li>
              <li>
                From: <strong>{selectedDoc.sender}</strong>
              </li>
              <li>
                Originating Office: <strong>{selectedDoc.originating}</strong>
              </li>
              <li>
                To: <strong>{selectedDoc.recipient}</strong>
              </li>
              <li>
                Destination Office: <strong>{selectedDoc.destination}</strong>
              </li>
              <li>
                Status:{" "}
                <strong style={{ color: "green" }}>{selectedDoc.status}</strong>
              </li>
            </ul>
            <button className="closebtn" onClick={closePopup}>
              <AiFillCloseCircle className="closeicon" />
            </button>
            <div className="actionbtn">
              <div
                className="archivebtn secondarybtn"
                hidden={
                  selectedDoc.status === "Restored" ||
                  selectedDoc.status === "Completed" ||
                  selectedDoc.status === "Archived"
                }
              >
                <button onClick={qrButtonHandler} className="comp-btn">
                  Receive
                </button>
              </div>
              <div
                className="archivebtn secondarybtn"
                hidden={
                  selectedDoc.status === "Restored" ||
                  selectedDoc.status === "Completed" ||
                  selectedDoc.status === "Archived"
                }
              >
                <Link to={`/forwarding-document/${selectedDoc._id}`}>
                  <button className="forw-btn">Forward</button>
                </Link>
              </div>
              <div
                className="archivebtn secondarybtn"
                hidden={
                  selectedDoc.status === "Restored" ||
                  selectedDoc.status === "Completed" ||
                  selectedDoc.status === "Archived"
                }
              >
                <Link to={`/completing-document/${selectedDoc._id}`}>
                  <button className="comp-btn">Complete</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOptions && (
        <div className="popup-container options-wrapper">
          <div className="option-container">
            <section>
              <h3>This document is already marked as received.</h3>
              <label>
                Do you still want to{" "}
                <Link
                  to={`/receiving-document/${scanned_id}`}
                  title="Receive the document?"
                >
                  continue
                </Link>
                ?
              </label>
              <p>or</p>
            </section>
            <p>Do more other options:</p>
            <div className="option-buttons">
              <div className="secondarybtn cncl">
                <button onClick={closeOptions} title="Cancel?">
                  Cancel
                </button>
              </div>
              <div className="secondarybtn fwd">
                <Link to={`/forwarding-document/${scanned_id}`}>
                  <button title="Forward the document?">Forward</button>
                </Link>
              </div>
              <div className="secondarybtn cmp">
                <Link to={`/completing-document/${scanned_id}`}>
                  <button title="Complete the document?">Complete</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Received;
