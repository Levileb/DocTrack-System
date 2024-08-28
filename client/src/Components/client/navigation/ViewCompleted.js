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
  const [trackingInfo, setTrackingInfo] = useState(null);

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

  useEffect(() => {
    const fetchTrackingInfo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/docs/view-complete/${docId}`
        );
        const data = response.data;

        // Ensure receivingLogs and forwardingLogs are arrays
        const receivingLogs = Array.isArray(data.receivingLogs)
          ? data.receivingLogs
          : [];
        const forwardingLogs = Array.isArray(data.forwardingLogs)
          ? data.forwardingLogs
          : [];
        const completedLog = data.completedLog ? [data.completedLog] : [];

        // Combine receiving, forwarding, and completed logs into a single array
        const combinedLogs = [
          ...receivingLogs.map((log) => ({ ...log, type: "receiving" })),
          ...forwardingLogs.map((log) => ({ ...log, type: "forwarding" })),
          ...completedLog.map((log) => ({ ...log, type: "completed" })),
        ];

        // Sort combined logs by their respective timestamps
        combinedLogs.sort((a, b) => {
          const timeA = a.receivedAt || a.forwardedAt || a.completedAt;
          const timeB = b.receivedAt || b.forwardedAt || b.completedAt;
          return new Date(timeA) - new Date(timeB);
        });

        setTrackingInfo({ ...data, combinedLogs });
      } catch (error) {
        console.error("Error fetching tracking information:", error);
        setTrackingInfo(null);
      }
    };

    fetchTrackingInfo();
  }, [docId]);

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  // Check if document or tracking info is still loading
  if (!document || !trackingInfo) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <label>Document Not Found...</label>
        <Link to="/completed">Go Back</Link>
      </div>
    );
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
                      <td>Recipient</td>
                      <td>Remarks</td>
                    </tr>
                  </thead>
                  <tbody>
                    {trackingInfo.combinedLogs.length > 0 ? (
                      trackingInfo.combinedLogs.map((log, index) => (
                        <tr key={index}>
                          <td>
                            {new Date(
                              log.receivedAt ||
                                log.forwardedAt ||
                                log.completedAt
                            ).toLocaleString()}
                          </td>
                          <td>
                            {log.type === "receiving"
                              ? "Received"
                              : log.type === "forwarding"
                              ? "Forwarded To"
                              : "Completed"}
                          </td>
                          <td>
                            {log.receivedBy ||
                              log.forwardedTo ||
                              log.completedBy}
                          </td>
                          <td>{log.remarks || " "}</td>
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
            <div className="print-btn">
              <button onClick={handlePrint}>Print</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewCompleted;
