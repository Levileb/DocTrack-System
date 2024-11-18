import React, { useState, useEffect, useRef } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import "./contentdesign.css";
import { MdQrCodeScanner } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { Link } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaAngleDown } from "react-icons/fa6";
import axios from "axios";
import QrReader from "./QrReader";
import qrCode from "qrcode";
import logo from "../assets/kabankalan-logo.png";
import { GrCaretPrevious } from "react-icons/gr";
import { GrCaretNext } from "react-icons/gr";
import { LuArchive } from "react-icons/lu";
import { FaRegCopy } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const [docs, setDocs] = useState([]);
  const [scanDoc, setScanDoc] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue] = useState("");
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const dropdownRefs = useRef([]);
  const [user, setUser] = useState([]);
  const navigate = useNavigate();
  const [scanned_id, setScanned_Id] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [docToArchive, setDocToArchive] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchDocs();
  }, []);
  useEffect(() => {
    fetchUserData();
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRefs.current &&
        !dropdownRefs.current.some((ref) => ref && ref.contains(event.target))
      ) {
        setOpenDropdownIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user/find-user`, {
        withCredentials: true,
      });
      setUser(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDocs = () => {
    axios
      .get(`${API_URL}/api/docs/sent`, {
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
        setFilteredDocs(activeDocs);
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
      });
  };

  const fetchScanDocs = () => {
    axios
      .get(`${API_URL}/api/docs`, {
        withCredentials: true,
      })
      .then((response) => {
        const activeScanDocs = response.data.filter(
          (doc) => doc.status !== "Archived"
        );

        // Sort documents from most recent to oldest
        // activeDocs.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Set the sorted documents in the state
        setScanDoc(activeScanDocs);
        // setFilteredDocs(activeDocs);
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
      });
  };
  useEffect(() => {
    fetchScanDocs();
  }, []);

  const handlePopup = (event, doc) => {
    event.preventDefault();
    setSelectedDoc(doc);
    setOpenDropdownIndex(null);
  };

  const closePopup = () => {
    setSelectedDoc(null);
  };

  const ConfirmPopup = ({ onConfirm, onCancel }) => (
    <div className="confirm-popup">
      <p>Are you sure you want to archive this document?</p>
      <div className="popup-content">
        <button onClick={onConfirm} className="confirm-btn">
          Yes
        </button>
        <button onClick={onCancel} className="cancel-btn">
          No
        </button>
      </div>
    </div>
  );

  const printDocument = (doc) => {
    qrCode.toDataURL(JSON.stringify(doc), (err, url) => {
      if (err) {
        console.error("Error generating QR code:", err);
        return;
      }

      const printWindow = window.open("", "_blank");
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <style>
              body {
                font-family: 'Arial';
                font-size: 12pt;
                display: flex;
                flex-direction: column;
                margin: 0.5in;
              }
              main {
                display: flex;
                justify-content: space-between;
                border: 1px solid #000;
                padding: 15px;
              }
              div {
                display: flex;
                width: max-content;
                flex-direction: column;
              }
              p {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
                display: flex;
              }
              ul {
                text-decoration: none;
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
              }
              ul li {
                margin-bottom: 5px;
              }
              img {
                display: flex;
                max-width: 150px;
                max-height: 150px;
              }
              header {
                display: flex;
                justify-content: center;
                margin-bottom: 30px;
              }
              #logoImg {
                height: 100px;
                display: flex;
                margin-right: 15px;
              }
              #companyTitle {
                display: flex;
                align-items: center;
                height: 100px;
                justify-content: center;
              }
              #companyTitle .title {
                margin: 0;
              }
              #drs {
                display: flex;
                width: 100%;
                max-height: 20px;
              }
              #qrCode {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
              }
            </style>
          </head>
          <body onload="window.print();">
           <header>
              <div id="logoImg">
               <img style="max-width: 100px; max-height: 100px;" src="${logo}" alt="logo" />
              </div>
              <div id="companyTitle">
                <h2 class="title">City Government of Kabankalan</h2>
                <h4 class="title">Document Routing Slip</h4>
              </div>
            </header>

            <div id="drs">
                <label>Control No: ${doc.codeNumber}</label>
            </div>
            <main>
              <div>
                <ul>
                  <li>Date Submitted: <strong>${formatDateForDisplay(
                    doc.date
                  )}</strong></li>
                  <li>Title: <strong>${doc.title}</strong></li>
                  <li>From: <strong>${doc.sender}</strong></li>
                  <li>Originating Office: <strong>${
                    doc.originating
                  }</strong></li>
                  <li>To: <strong>${doc.recipient}</strong></li>
                  <li>Destination Office: <strong>${
                    doc.destination
                  }</strong></li>
                  <li>Remarks: <strong>${doc.remarks}</strong></li>
                </ul>
              </div>
              <div id="qrCode">
                <img src="${url}" alt="QR Code" />
              </div>
            </main>
          </body>
        </html>
      `);
      printWindow.document.close();
    });
    setOpenDropdownIndex(null);
  };

  const qrButtonHandler = (event) => {
    event.preventDefault();
    setShowScanner(true);
  };

  const closeScanner = () => {
    setShowScanner(false);
  };

  const closeOptions = () => {
    setShowOptions(false);
  };

  // Handle QR Code Scanning
  const handleScan = async (data) => {
    try {
      const scannedData = JSON.parse(data);
      // console.log("Scanned Data:", scannedData);

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
        } else if (selectedDoc.status === "Received") {
          setShowOptions(true);
          setScanned_Id(selectedDoc._id);
        } else {
          // If not "Completed", proceed with updating the status to "Viewed"
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

  const toggleDropdown = (index) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  const confirmArchive = (docId) => {
    setDocToArchive(docId);
    setShowConfirmPopup(true);
    setOpenDropdownIndex(null);
  };

  const handleArchiveConfirm = async () => {
    if (!docToArchive) return;
    try {
      await axios.post(`${API_URL}/archive-document`, {
        docId: docToArchive,
      });
      setDocs(docs.filter((doc) => doc._id !== docToArchive));
      setFilteredDocs(filteredDocs.filter((doc) => doc._id !== docToArchive));
      toast.success("Document Moved to Archive!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setShowConfirmPopup(false);
      setDocToArchive(null);
    } catch (error) {
      console.error("Error archiving document:", error);
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

  const handleCancelArchive = () => {
    setShowConfirmPopup(false);
    setDocToArchive(null);
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
            <div className="scanner secondarybtn">
              <button onClick={qrButtonHandler}>
                <MdQrCodeScanner className="qrIcon" />
                <p>QR Scanner</p>
              </button>
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
              <div className="arc-doc-container">
                <div className="archived-btn">
                  <Link to="/archived-document">
                    <button>
                      <LuArchive className="icon" />
                      <p> Archived</p>
                    </button>
                  </Link>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <td>Date</td>
                    <td>Title</td>
                    {/* <td>From</td> */}
                    <td>To</td>
                    <td>Action</td>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDocs.length > 0 ? (
                    paginatedDocs.map((val, key) => (
                      <tr key={key}>
                        <td>{formatDateForDisplay(val.date)}</td>
                        <td>{val.title}</td>
                        {/* <td>{val.sender}</td> */}
                        <td>{val.recipient}</td>
                        <td>
                          {user === val.recipient ? (
                            // Render view action only
                            <div className="viewbtn">
                              <button onClick={(e) => handlePopup(e, val)}>
                                Open
                              </button>
                            </div>
                          ) : (
                            <div className="moreActions">
                              <div
                                className="dropdownBtn"
                                ref={(el) => (dropdownRefs.current[key] = el)}
                              >
                                <button
                                  className="ddown-toggle"
                                  onClick={() => toggleDropdown(key)}
                                >
                                  Options <FaAngleDown className="down-icon" />
                                </button>
                                {openDropdownIndex === key && (
                                  <div className="ddown-menu">
                                    <ul>
                                      <li onClick={(e) => handlePopup(e, val)}>
                                        View
                                      </li>
                                      <li onClick={() => printDocument(val)}>
                                        Print
                                      </li>
                                      <li
                                        onClick={() =>
                                          navigate(
                                            `/update-document/${val._id}`
                                          ) && setOpenDropdownIndex(null)
                                        }
                                        hidden={val.status !== "Created"}
                                      >
                                        Edit
                                      </li>
                                      <li
                                        onClick={() => confirmArchive(val._id)}
                                      >
                                        Archive
                                      </li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No Submitted Documents Available</td>
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

      {selectedDoc && (
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

      {showScanner && (
        <div className="popup-container qr" onClick={closeScanner}>
          <div className="popup qrscanner">
            <QrReader onClose={closeScanner} onScan={handleScan} />
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
      {/* Archive Confirmation */}
      {showConfirmPopup && (
        <ConfirmPopup
          onConfirm={handleArchiveConfirm}
          onCancel={handleCancelArchive}
        />
      )}
    </>
  );
};

export default Home;
