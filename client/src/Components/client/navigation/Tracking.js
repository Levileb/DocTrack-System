import React, { useState } from "react";
import axios from "axios";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Tracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [trackingInfo, setTrackingInfo] = useState(null);

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(
        `http://localhost:3001/api/docs/tracking-info/${searchTerm}`
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
      toast.error("No document found!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      <Header />
      <SidePanel />
      <ToastContainer />
      <div>
        <div className="MainPanel">
          <div className="PanelWrapper">
            <div className="PanelHeader">
              <div className="filter">
                <p>Track Document</p>
              </div>
            </div>

            <div className="dtp-top">
              <form onSubmit={handleSearch}>
                <div className="search-box">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleChange}
                    placeholder="Enter code number.."
                    className="search-bar"
                  />
                </div>
                <div className="search-button primarybtn">
                  <button type="submit">Search</button>
                </div>
              </form>
            </div>
            <div className="dtp-center">
              {trackingInfo ? (
                <div className="track-results">
                  <h2>Tracking Information</h2>
                  <p>Code Number: {trackingInfo.codeNumber}</p>
                  <p>Title: {trackingInfo.documentTitle}</p>
                  <p>
                    Submitted By: {trackingInfo.sender} -{" "}
                    {trackingInfo.officeOrigin}
                  </p>
                  <p>Current Status: {trackingInfo.status}</p>

                  <div className="tracking-history">
                    <div className="timeline">
                      {trackingInfo.combinedLogs.map((log, index) => (
                        <div
                          key={index}
                          className={`track-container ${
                            index % 2 === 0 ? "left" : "right"
                          }`}
                        >
                          <div className="track-content">
                            {log.type === "receiving" ? (
                              <>
                                <p>
                                  <strong
                                    style={{
                                      color: "#0060bf",
                                      textShadow:
                                        "1px 1px 1px rgba(0, 0, 0, 0.5)",
                                    }}
                                  >
                                    Received
                                  </strong>{" "}
                                  At:{" "}
                                  {new Date(log.receivedAt).toLocaleString()}
                                </p>
                                <p>Received By: {log.receivedBy}</p>
                                <p>Office: {log.office}</p>
                                <p>Document Title: {log.documentTitle}</p>
                                <p className="remarks">
                                  Remarks: {log.remarks}
                                </p>{" "}
                                {/* Apply the CSS class here */}
                              </>
                            ) : log.type === "forwarding" ? (
                              <>
                                <p>
                                  <strong
                                    style={{
                                      color: "#fab905",
                                      textShadow:
                                        "1px 1px 1px rgba(0, 0, 0, 0.9)",
                                    }}
                                  >
                                    Forwarded
                                  </strong>{" "}
                                  At:{" "}
                                  {new Date(log.forwardedAt).toLocaleString()}
                                </p>
                                <p>Forwarded By: {log.forwardedBy}</p>
                                <p>Forwarded To: {log.forwardedTo}</p>
                                <p>Document Title: {log.documentTitle}</p>
                                <p className="remarks">
                                  Remarks: {log.remarks}
                                </p>{" "}
                                {/* Apply the CSS class here */}
                              </>
                            ) : (
                              <>
                                <p>
                                  <strong
                                    style={{
                                      color: "#109903",
                                      textShadow:
                                        "1px 1px 1px rgba(0, 0, 0, 0.5)",
                                    }}
                                  >
                                    Completed
                                  </strong>{" "}
                                  At:{" "}
                                  {new Date(log.completedAt).toLocaleString()}
                                </p>
                                <p>Completed By: {log.completedBy}</p>
                                <p>Office: {log.office}</p>
                                <p>Document Title: {log.documentTitle}</p>
                                <p className="remarks">
                                  Remarks: {log.remarks}
                                </p>{" "}
                                {/* Apply the CSS class here */}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p>
                  <small>
                    Note: Copy and Paste here the control number to track a
                    document.
                  </small>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Tracking;
