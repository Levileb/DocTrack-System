import React, { useState } from "react";
import axios from "axios";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";

const Tracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [trackingInfo, setTrackingInfo] = useState(null);

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`http://localhost:3001/api/docs/tracking-info/${searchTerm}`);
      setTrackingInfo(response.data);
    } catch (error) {
      console.error("Error fetching tracking information:", error);
      setTrackingInfo(null);
    }
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      <Header />
      <SidePanel />
      <div>
        <div className="MainPanel">
          <div className="PanelWrapper">
            <div className="PanelHeader">
              <div className="filter">
                <p>Document Tracking</p>
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
                  ></input>
                </div>
                <div className="search-button primarybtn">
                  <button type="submit">Search</button>
                </div>
              </form>
            </div>
            <div className="dtp-center">
              {trackingInfo ? (
                <div>
                  <h2>Tracking Information</h2>
                  <p>Code Number: {trackingInfo.codeNumber}</p>
                  <p>Status: {trackingInfo.status}</p>
                  <p>Location: {trackingInfo.location}</p>
                  <p>Document Title: {trackingInfo.documentTitle}</p>
                  <h3>Receiving Logs</h3>
                  {trackingInfo.receivingLogs.length > 0 ? (
                    trackingInfo.receivingLogs.map((log, index) => (
                      <div key={index}>
                        <p>Received By: {log.receivedBy}</p>
                        <p>Received At: {new Date(log.receivedAt).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p>No receiving logs available.</p>
                  )}
                  <h3>Forwarding Logs</h3>
                  {trackingInfo.forwardingLogs.length > 0 ? (
                    trackingInfo.forwardingLogs.map((log, index) => (
                      <div key={index}>
                        <p>Forwarded By: {log.forwardedBy}</p>
                        <p>Forwarded To: {log.forwardedTo}</p>
                        <p>Forwarded At: {new Date(log.forwardedAt).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p>No forwarding logs available.</p>
                  )}
                </div>
              ) : (
                <p>Search result will be displayed here shortly..</p>
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
