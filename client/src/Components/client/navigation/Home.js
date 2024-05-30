import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import "./contentdesign.css";
import { MdQrCodeScanner } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { Link } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai"; // Added printer icon
import { RiMailSendLine } from "react-icons/ri";
import axios from "axios";
import QrReader from "./QrReader";
import qrCode from "qrcode";
import logo from "../assets/logo.png";

const Home = () => {
  const [docs, setDocs] = useState([]); // State  to store documents
  const [selectedDoc, setSelectedDoc] = useState(null); // State to store the selected document
  const [showScanner, setShowScanner] = useState(false); // State for popup visibility

  useEffect(() => {
    fetchDocs();
  }, []); // Fetch documents on component mount

  const fetchDocs = () => {
    axios
      .get("http://localhost:3001/api/docs")
      .then((response) => {
        setDocs(response.data);
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
      });
  };

  const handlePopup = (event, doc) => {
    event.preventDefault(); // Prevent default form submission behavior
    setSelectedDoc(doc); // Set the selected document
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
            <title>Routing Slip</title>
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
            <h2 class="title">Company Name</h2>
            <h5 class="title">Document Tracking System</h5>
          </div>

        </header>

            <div id="drs">
              <h4>Document Routing Slip</h4>
            </div>
            <main>
              <div>
                <ul>
                  <li>Date: <strong>${new Date(doc.date).toLocaleDateString()}</strong></li>
                  <li>Title: <strong>${doc.title}</strong></li>
                  <li>From: <strong>${doc.sender}</strong></li>
                  <li>Originating Office: <strong>${doc.originating}</strong></li>
                  <li>To: <strong>${doc.recipient}</strong></li>
                  <li>Destination Office: <strong>${doc.destination}</strong></li>
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
        await axios.post('http://localhost:3001/api/docs/update-status', { docId: selectedDoc._id });
        console.log('Document status updated to "Viewed"');

        // Update the selectedDoc state with the updated status
        setSelectedDoc({ ...selectedDoc, status: 'Viewed' });
      } else {
        console.log("No matching document found.");
      }
    } catch (error) {
      console.error("Error handling scanned data:", error);
    }
  };

  const handleAcknowledge = async () => {
    try {
        // Update the document's status to "Received"
        const response = await axios.post('http://localhost:3001/api/docs/update-received', { docId: selectedDoc._id });
        console.log('Document status updated to "Received"', response.data);

        // Update the selectedDoc state with the updated status
        setSelectedDoc({ ...selectedDoc, status: 'Received' });
    } catch (error) {
        console.error("Error acknowledging document:", error);
    }
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
                    <td>Print</td>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((val, key) => (
                    <tr key={key}>
                      <td>{val.date.substring(0, 10)}</td>
                      <td>{val.title}</td>
                      <td>{val.sender}</td>
                      <td>{val.recipient}</td>
                      <td>
                        <div className="viewbtn secondarybtn">
                          <button onClick={(e) => handlePopup(e, val)}>
                            View
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="viewbtn secondarybtn">
                          <button onClick={() => printDocument(val)}>
                            <p>Print</p>
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

      {selectedDoc && (
        <div className="popup-container">
          <div className="popup homeView">
            <p>Document Information</p>
            <ul className="view-userinfo">
              <li>
                Date:{" "}
                <strong>{new Date(selectedDoc.date).toLocaleDateString()}</strong>
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
                <Link to={`/update-document/${selectedDoc._id}`}>
                  <button className="edit-btn">Edit</button>
                </Link>
              </div>
              <div className="archivebtn secondarybtn">
                <button className="ack-btn" onClick={handleAcknowledge}>Receive</button>
              </div>
              <div className="archivebtn secondarybtn">
              <Link to={`/forwarding-document/${selectedDoc._id}`}>
  <button className="forw-btn">Forward</button>
</Link>

              </div>
            </div>
          </div>
        </div>
      )}

{showScanner && (
  <div className="popup-container qr" onClick={closeScanner}>
    <div className="popup qrscanner">
      <QrReader onClose={closeScanner} onScan={handleScan} /> {/* Pass onScan prop */}
    </div>
  </div>
)}

    </>
  );
};

export default Home;