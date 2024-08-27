import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import "../navigation/newcontent.css";
import logo from "../assets/kabankalan-logo.png";
import { RiArrowGoBackFill } from "react-icons/ri";
import QRCode from "qrcode.react";

const ViewCompleted = () => {
  const { docId } = useParams(); // Get the document ID from URL parameters
  const [document, setDocument] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/docs/${docId}`
        );
        setDocument(response.data);
      } catch (error) {
        console.error(
          "Error fetching document:",
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchDocument();
  }, [docId]);

  // Check if document is still loading
  if (!document) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <SidePanel />
      <div>
        <div className="MainPanel">
          <div className="PanelWrapper">
            <div className="PanelHeader">
              <div className="filter vd">
                <Link to="/completed">
                  <button className="back-btn">
                    <RiArrowGoBackFill className="back-icon" />
                  </button>
                </Link>
                <p>View Document</p>
              </div>
            </div>

            <div className="view-doc-info">
              <div className="doc-header">
                <img src={logo} alt="logo" />
                <div className="doc-header-title">
                  <h3>City Government of Kabankalan</h3>
                  <p>Document Routing Slip</p>
                </div>
              </div>

              <p>
                <small>
                  Control Number:
                  <strong> {document.codeNumber}</strong>
                </small>
              </p>
              <div className="docu-info-head-container">
                <div className="doc-information">
                  <h4>Document Information</h4>
                  <ul className="view-document">
                    <li>
                      Date: {new Date(document.date).toLocaleDateString()}
                    </li>
                    <li>Title: {document.title}</li>
                    <li>From: {document.sender}</li>
                    <li>Office From: {document.originating}</li>
                    <li>To: {document.recipient}</li>
                    <li>Office to: {document.destination}</li>
                    <li>Status: {document.status}</li>
                  </ul>
                </div>
                <div className="docu-qrcode">
                  <QRCode id="qrCode" value={JSON.stringify(document)} />
                </div>
              </div>
              <div className="docu-logs">
                <table>
                  <thead>
                    <tr>
                      <td>Date</td>
                      <td>Status</td>
                      <td>For</td>
                      <td>Remarks</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Not Available</td>
                      <td>Not Available</td>
                      <td>Not Available</td>
                      <td>Not Available</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="print-btn">
              <button>Print</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewCompleted;
