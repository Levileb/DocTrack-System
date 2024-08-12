import React, { useState, useEffect, useRef } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import "./contentdesign.css";
import { MdQrCodeScanner } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { Link } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai"; // Added printer icon
import { RiMailSendLine } from "react-icons/ri";
import { FaAngleDown } from "react-icons/fa6";
import axios from "axios";
import QrReader from "./QrReader";
import qrCode from "qrcode";
import logo from "../assets/kabankalan-logo.png";

const Home = () => {
  const [docs, setDocs] = useState([]); // State to store documents
  const [selectedDoc, setSelectedDoc] = useState(null); // State to store the selected document
  const [showScanner, setShowScanner] = useState(false); // State for popup visibility
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [filteredDocs, setFilteredDocs] = useState([]); // State for filtered documents
  const [showPopup] = useState(false); // Recently Added Popup
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null); // State to manage dropdowns
  const dropdownRefs = useRef([]); // Array of refs for dropdowns

  useEffect(() => {
    fetchDocs();
  }, []); // Fetch documents on component mount

  useEffect(() => {
    // Filter documents based on search query
    const filtered = docs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.recipient.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDocs(filtered);
  }, [searchQuery, docs]);

  useEffect(() => {
    // Close the dropdown if clicked outside
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

  const fetchDocs = () => {
    axios
      .get("http://localhost:3001/api/docs")
      .then((response) => {
        setDocs(response.data);
        setFilteredDocs(response.data); // Initialize filteredDocs with all documents
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
      });
  };

  const handlePopup = (event, doc) => {
    event.preventDefault(); // Prevent default form submission behavior
    setSelectedDoc(doc); // Set the selected document
    setOpenDropdownIndex(null); // Close the dropdown
  };

  const closePopup = () => {
    setSelectedDoc(null); // Clear the selected document
  };

  const printDocument = (doc) => {
    // Generate QR code image
    qrCode.toDataURL(JSON.stringify(doc), (err, url) => {
      if (err) {
        console.error("Error generating QR code:", err);
        return;
      }

      // Write HTML content with QR code image
      const printWindow = window.open("", "_blank");
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <style>
              /* CSS styles */
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
                height: 140px;
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
              label {
                font-weight: bold;
              }
              img {
                display: flex;
                max-width: 100px;
                max-height: 100px;
              }
              header {
                display: flex;
                justify-content: center;
                margin-bottom: 10px;
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
                max-height: 45px;
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
                <h5 class="title">Document Tracking System</h5>
              </div>
            </header>

            <div id="drs">
              <h4>Document Routing Slip</h4>
            </div>
            <main>
              <div>
                <ul>
                  <li>Date: <strong>${new Date(
                    doc.date
                  ).toLocaleDateString()}</strong></li>
                  <li>Title: <strong>${doc.title}</strong></li>
                  <li>From: <strong>${doc.sender}</strong></li>
                  <li>Originating Office: <strong>${
                    doc.originating
                  }</strong></li>
                  <li>To: <strong>${doc.recipient}</strong></li>
                  <li>Destination Office: <strong>${
                    doc.destination
                  }</strong></li>
                </ul>
              </div>
              <div>
                <label>QR Code:</label>
                <img src="${url}" alt="QR Code" />
                <label>Code Number: ${doc.codeNumber}</label>
              </div>
            </main>
          </body>
        </html>
      `);
      printWindow.document.close();
    });
    setOpenDropdownIndex(null); // Close the dropdown
  };

  const qrButtonHandler = (event) => {
    event.preventDefault();
    setShowScanner(true);
  };

  const closeScanner = () => {
    setShowScanner(false);
  };

  const handleScan = async (data) => {
    try {
      // Parse the scanned JSON data
      const scannedData = JSON.parse(data);
      console.log("Scanned Data:", scannedData);

      // Find the document with matching data
      const selectedDoc = docs.find((doc) => {
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

      // If a document with matching data is found, display the pop-up container
      if (selectedDoc) {
        // Update the document's status to "Viewed"
        await axios.post("http://localhost:3001/api/docs/update-status", {
          docId: selectedDoc._id,
        });
        console.log('Document status updated to "Viewed"');

        // Update the selectedDoc state with the updated status
        setSelectedDoc({ ...selectedDoc, status: "Viewed" });
      } else {
        console.log("No matching document found.");
      }
    } catch (error) {
      console.error("Error handling scanned data:", error);
    }
  };

  

  const toggleDropdown = (index) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

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
            <div className="scannerIcon secondarybtn">
              <button onClick={qrButtonHandler}>
                <MdQrCodeScanner className="qrIcon" />
              </button>
            </div>
            <div className="submitdocuBtn secondarybtn ">
              <Link to="/submit-document">
                <button>
                  <RiMailSendLine className="icon" />
                  <p>Submit Document</p>
                </button>
              </Link>
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
                  {filteredDocs.map((val, key) => (
                    <tr key={key}>
                      <td>{val.date.substring(0, 10)}</td>
                      <td>{val.title}</td>
                      <td>{val.sender}</td>
                      <td>{val.recipient}</td>
                      <td>
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

                                  <li>
                                    <Link
                                      className="edit-link"
                                      to={`/update-document/${val._id}`}
                                      onClick={() => setOpenDropdownIndex(null)}
                                    >
                                      Edit
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
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

      {selectedDoc && (
        <div className="popup-container">
          <div className="popup homeView">
            <p>Document Information</p>
            <ul className="view-userinfo">
              <li>
                Date:{" "}
                <strong>
                  {new Date(selectedDoc.date).toLocaleDateString()}
                </strong>
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
                Code Number: <strong>{selectedDoc.codeNumber}</strong>
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
              {/* <div className="archivebtn secondarybtn">
                <Link to={`/update-document/${selectedDoc._id}`}>
                  <button className="edit-btn">Edit</button>
                </Link>
              </div> */}
              <div className="archivebtn secondarybtn">
                <Link to={`/receiving-document/${selectedDoc._id}`}>
                  <button className="ack-btn">Receive</button>
                </Link>
              </div>
              <div className="archivebtn secondarybtn">
                <Link to={`/forwarding-document/${selectedDoc._id}`}>
                  <button className="forw-btn">Forward</button>
                </Link>
              </div>
              <div className="archivebtn secondarybtn">
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
            <QrReader onClose={closeScanner} onScan={handleScan} />{" "}
            {/* Pass onScan prop */}
          </div>
        </div>
      )}

      {showPopup && (
        <div className="popup-container">
          <div className="popup-received">
            <p>Document Received!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
