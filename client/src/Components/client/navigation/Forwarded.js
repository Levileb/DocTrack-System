import React, { useState } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import { AiFillCloseCircle } from "react-icons/ai";
import { Link } from "react-router-dom";

const Forwarded = () => {
  const data = [
    {
      date: "2024/03/12",
      title: "OJT Application",
      sender: "Harvey John Abello",
      officefrom: "HR Section",
      receipient: "Kyle Bryan Valencia",
      officeto: "Cyber Security",
      status: "Forwarded",
    },
  ];

  const [showPopup, setShowPopup] = useState(false); // State for popup visibility

  const handlePopup = (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    // Add your form submission logic here

    // Show popup notification
    setShowPopup(true);
  };
  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="filter">
              <p>Forwarded</p>
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
            {/* <p>Contents will be displayed here.</p> */}
            <div className="content-table">
              <table>
                <thead>
                  <tr>
                    <td>Date</td>
                    <td>Title</td>
                    <td>From</td>
                    {/* <td>Originating Office </td>  */}
                    <td>To</td>
                    {/* <td>Destination Office</td>  */}
                    <td>Action</td>
                  </tr>
                </thead>
                <tbody>
                  {data.map((val, key) => {
                    return (
                      <tr key={key}>
                        <td>{val.date}</td>
                        <td>{val.title}</td>
                        <td>{val.sender}</td>
                        {/* <td>{val.officefrom}</td>  */}
                        <td>{val.receipient}</td>
                        {/* <td>{val.officeto}</td>  */}
                        <td>
                          <div className="viewbtn">
                            <button onClick={handlePopup}>View</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <SidePanel />
      <Footer />

      {showPopup && (
        <div className="popup-container">
          <div className="popup">
            <p>User Information</p>
            {data.map((val) => {
              return (
                <ul className="view-userinfo">
                  <li>
                    Date: <strong>{val.date}</strong>
                  </li>
                  <li>
                    Title: <strong>{val.title}</strong>
                  </li>
                  <li>
                    From: <strong>{val.sender}</strong>
                  </li>
                  <li>
                    Office From: <strong>{val.officefrom}</strong>
                  </li>
                  <li>
                    To: <strong>{val.receipient}</strong>
                  </li>
                  <li>
                    Office to: <strong>{val.officeto}</strong>
                  </li>
                  <li>
                    Status:{" "}
                    <strong style={{ color: "#d4a300" }}>{val.status}</strong>
                  </li>
                </ul>
              );
            })}

            <button className="closebtn" onClick={closePopup}>
              <AiFillCloseCircle className="closeicon" />
            </button>
            <div className="actionbtn">
              <div className="archivebtn secondarybtn">
                <button className="ack-btn">Acknowledge</button>
              </div>
              <div className="archivebtn secondarybtn">
                <button className="comp-btn">Complete</button>
              </div>
              <div className="archivebtn secondarybtn">
                <Link to={"/forwarding-document"}>
                  <button className="forw-btn">Forward</button>
                </Link>{" "}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Forwarded;
