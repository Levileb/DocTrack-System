import React, { useState } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import { RiArrowGoBackFill } from "react-icons/ri";
import "../navigation/newcontent.css";
import { Link } from "react-router-dom";

const Archive = () => {
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [filterValue, setFilterValue] = useState("");

  const [data, setData] = useState([
    {
      date: "07/10/2024",
      title: "Sample Title 1",
      sender: "Adam White",
      officefrom: "Admin Office",
      receipient: "Kyle Bryan",
      officeto: "GovNet",
      status: "Archived",
      codenum: "12345678",
    },
    {
      date: "07/10/2024",
      title: "Sample Title 2",
      sender: "Jhon Lou",
      officefrom: "Free WiFi Office",
      receipient: "Bruce Lee",
      officeto: "Planning",
      status: "Archived",
      codenum: "12345678",
    },
    {
      date: "07/10/2024",
      title: "Sample Title 3",
      sender: "Jez Garcia",
      officefrom: "ILCDB",
      receipient: "Jonas Sacarias",
      officeto: "IRM Unit",
      status: "Archived",
      codenum: "12345678",
    },
  ]);

  const filteredData = data.filter((val) => {
    // Check for filter value match
    const filterMatch = filterValue === "" || val.status === filterValue;

    // Check for search query match (case insensitive)
    const searchMatch =
      val.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.receipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.officefrom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      val.officeto.toLowerCase().includes(searchQuery.toLowerCase());

    return filterMatch && searchMatch;
  });

  const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
      <div
        className="tooltip2-container"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        {isVisible && <div className="tooltip2">{text}</div>}
      </div>
    );
  };

  return (
    <>
      <Header />
      <SidePanel />
      <div>
        <div className="MainPanel">
          <div className="PanelWrapper">
            <div className="AddUserHeader arc">
              <div className="back-btn">
                <Link to="/home">
                  <button>
                    <Tooltip text={"Click to go back, Home page"}>
                      <RiArrowGoBackFill className="back-icon" />
                    </Tooltip>{" "}
                  </button>
                </Link>
              </div>
              <div className="filter">
                <p>Archive</p>
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
            <div className="logList-container">
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
                      {filteredData.map((val, key) => {
                        return (
                          <tr key={key}>
                            <td>{val.date}</td>
                            <td>{val.title}</td>
                            <td>{val.sender}</td>
                            <td>{val.receipient}</td>
                            <td>
                              <div className="viewbtn">
                                <button>Restore</button>
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Archive;
