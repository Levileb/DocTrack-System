import React, { useState, useEffect, useRef } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import "./contentdesign.css";
import { MdQrCodeScanner } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { Link } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import { RiMailSendLine } from "react-icons/ri";
import { FaAngleDown } from "react-icons/fa6";
import axios from "axios";
import QrReader from "./QrReader";
import qrCode from "qrcode";
import logo from "../assets/kabankalan-logo.png";
import { GrCaretPrevious } from "react-icons/gr";
import { GrCaretNext } from "react-icons/gr";
import { LuArchive } from "react-icons/lu";

const Home = () => {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const dropdownRefs = useRef([]);

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    const filtered = docs.filter(
      (doc) =>
        (filterValue === "" || doc.status === filterValue) &&
        (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const fetchDocs = () => {
    axios
      .get("http://localhost:3001/api/docs")
      .then((response) => {
        const activeDocs = response.data.filter(
          (doc) => doc.status !== "Archived"
        );
        setDocs(activeDocs);
        setFilteredDocs(activeDocs);
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
      });
  };

  const handlePopup = (event, doc) => {
    event.preventDefault();
    setSelectedDoc(doc);
    setOpenDropdownIndex(null);
  };

  const closePopup = () => {
    setSelectedDoc(null);
  };

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
              img {
                display: flex;
                max-width: 100px;
                max-height: 100px;
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
                <label>Code No: ${doc.codeNumber}</label>
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

  const handleScan = async (data) => {
    try {
      const scannedData = JSON.parse(data);
      console.log("Scanned Data:", scannedData);

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

      if (selectedDoc) {
        await axios.post("http://localhost:3001/api/docs/update-status", {
          docId: selectedDoc._id,
        });
        console.log('Document status updated to "Viewed"');
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

  const archiveDocument = async (docId) => {
    try {
      await axios.post("http://localhost:3001/archive-document", { docId });
      setDocs(docs.filter((doc) => doc._id !== docId));
      setFilteredDocs(filteredDocs.filter((doc) => doc._id !== docId));
      setShowPopup(true);
    } catch (error) {
      console.error("Error archiving document:", error);
    }
    setTimeout(() => setShowPopup(false), 1000);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  // This is for the Dropdown Filter
  // const handleFilterChange = (event) => {
  //   setFilterValue(event.target.value);
  // };

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
                {/* <div className="docFilter-container">
                  <select
                    value={filterValue}
                    onChange={handleFilterChange}
                    className="docFilter"
                  >
                    <option className="selection" value="">
                      All
                    </option>
                    <option className="selection" value="Created">
                      Submitted
                    </option>
                    <option className="selection" value="Received">
                      Received
                    </option>
                    <option className="selection" value="Forwarded">
                      Forwarded
                    </option>
                  </select>
                </div> */}
              </div>
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
                  {paginatedDocs.map((val, key) => (
                    <tr key={key}>
                      <td>{formatDate(val.date)}</td>
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
                                  <li onClick={() => archiveDocument(val._id)}>
                                    Archive
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
            <QrReader onClose={closeScanner} onScan={handleScan} />
          </div>
        </div>
      )}

      {showPopup && (
        <div className="popup-container">
          <div className="popup-received">
            <p>Document Moved to Archive!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
