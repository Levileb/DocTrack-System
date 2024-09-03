import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import axios from "axios";
import { IoSearch } from "react-icons/io5";
import "../navigation/newcontent.css";
import { GrCaretPrevious } from "react-icons/gr";
import { GrCaretNext } from "react-icons/gr";

const InternalLogs = () => {
  const [docs, setDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [filterValue, setFilterValue] = useState("");
  const [filteredDocs, setFilteredDocs] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const docsPerPage = 20;

  useEffect(() => {
    fetchDocs();
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

  const handleFilterChange = (event) => {
    setFilterValue(event.target.value);
  };

  const startIndex = (currentPage - 1) * docsPerPage;
  const endIndex = startIndex + docsPerPage;
  const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

  const filteredData = paginatedDocs.filter((val) => {
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

  useEffect(() => {
    const totalPages = Math.ceil(filteredDocs.length / docsPerPage);
    setTotalPages(totalPages);
  }, [filteredDocs]);

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
                      <option className="selection" value="Created">
                        Created
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
                            <td>{val.date.substring(0, 10)}</td>
                            <td>{val.title}</td>
                            <td>{val.sender}</td>
                            <td>{val.recipient}</td>
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InternalLogs;
