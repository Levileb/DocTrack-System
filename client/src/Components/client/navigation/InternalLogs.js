import React, { useState } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import "../navigation/newcontent.css";

const InternalLogs = () => {
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
      status: "Received",
      codenum: "12345678",
    },
    {
      date: "07/10/2024",
      title: "Sample Title 2",
      sender: "Jhon Lou",
      officefrom: "Free WiFi Office",
      receipient: "Bruce Lee",
      officeto: "Planning",
      status: "Forwarded",
      codenum: "12345678",
    },
    {
      date: "07/10/2024",
      title: "Sample Title 3",
      sender: "Jez Garcia",
      officefrom: "ILCDB",
      receipient: "Jonas Sacarias",
      officeto: "IRM Unit",
      status: "Completed",
      codenum: "12345678",
    },
  ]);

  const handleFilterChange = (event) => {
    setFilterValue(event.target.value);
  };

  const filteredData = data.filter((val) => {
    if (filterValue === "") {
      return true;
    } else {
      return val.status === filterValue;
    }
  });

  return (
    <>
      <Header />
      <SidePanel />
      <div>
        <div className="MainPanel">
          <div className="PanelWrapper">
            <div className="PanelHeader">
              <div className="filter">
                <p>Internal Logs</p>
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
                  <div className="docFilter-container">
                    <select
                      value={filterValue}
                      onChange={handleFilterChange}
                      className="docFilter"
                    >
                      <option className="selection" value="">
                        All
                      </option>
                      <option className="selection" value="Received">
                        Received
                      </option>
                      <option className="selection" value="Forwarded">
                        Forwarded
                      </option>
                      <option className="selection" value="Completed">
                        Completed
                      </option>
                    </select>
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
                      {filteredData.map((val, key) => {
                        return (
                          <tr key={key}>
                            <td>{val.date}</td>
                            <td>{val.title}</td>
                            <td>{val.sender}</td>
                            <td>{val.receipient}</td>
                            <td>
                              <div className="viewbtn">
                                <button>View</button>
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

export default InternalLogs;
