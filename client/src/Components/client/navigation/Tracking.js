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
      const response = await axios.get(
        `http://localhost:3001/api/docs/tracking-info/${searchTerm}`
      );
      setTrackingInfo(response.data);
    } catch (error) {
      console.error("Error fetching tracking information:", error);
      setTrackingInfo(null);
    }
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Dummy data for the output timeline
  const history = [
    {
      datetime: "08/01/2024, 9:11 AM",
      info: "Forwarded To: Randy Smith",
      office: "IRM Unit",
    },
    {
      datetime: "08/01/2024, 11:33 AM",
      info: "Received By: Randy Smith",
      office: "IRM Unit",
    },
    {
      datetime: "08/02/2024, 3:42 PM",
      info: "Forwarded To: Lucky Roo",
      office: "HR Office",
    },
    {
      datetime: "08/02/2024, 4:08 PM",
      info: "Received By: Lucky Roo",
      office: "HR Office",
    },
    {
      datetime: "08/05/2024, 10:28 AM",
      status: "Completed",
    },
  ];

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
                <div className="track-results">
                  <h2>Tracking Information</h2>
                  <p>Code Number: {trackingInfo.codeNumber}</p>
                  <p>Title: {trackingInfo.documentTitle}</p>
                  <p>Status: {trackingInfo.status}</p>

                  <div className="tracking-history">
                    <div className="timeline">
                      {history.map((tracking, index) => (
                        <div
                          key={index}
                          className={`track-container ${
                            index % 2 === 0 ? "left" : "right"
                          }`}
                        >
                          <div className="track-content">
                            <p>{tracking.datetime}</p>
                            <p>{tracking.info}</p>
                            <p>{tracking.office}</p>
                            <p>{tracking.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
