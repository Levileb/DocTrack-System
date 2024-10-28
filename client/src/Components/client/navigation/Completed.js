import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import { Link } from "react-router-dom";
import { GrCaretNext, GrCaretPrevious } from "react-icons/gr";

const Completed = () => {
  const [data, setData] = useState([]); // State to hold fetched documents (Completed Documents)
  const [currentPage, setCurrentPage] = useState(1); // Pagination state for current page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const docsPerPage = 10; // Number of documents per page

  // Function to fetch completed documents
  const fetchDocs = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/docs/completed",
        {
          withCredentials: true,
        }
      );

      // Sort documents from most recent to oldest, checking if 'date' exists
      response.data.sort(
        (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
      );

      setData(response.data);
      setTotalPages(Math.ceil(response.data.length / docsPerPage));
      // console.log("Document data: ", response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchDocs(); // Fetch documents when the component mounts
  }, []);

  const formatDateForDisplay = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;

    return `${month}/${day}/${year} - ${hours}:${minutes} ${ampm}`;
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * docsPerPage;
  const endIndex = startIndex + docsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  // console.log(paginatedData.map((doc) => doc.docId));

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="filter">
              <p>Completed Logs</p>
            </div>
            <div className="search">
              <div className="search-border">
                <IoSearch className="searchIcon" />
                <input
                  type="text"
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
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((doc) => (
                      <tr key={doc.docId}>
                        <td>{formatDateForDisplay(doc.completedAt)}</td>
                        <td>{doc.title}</td>
                        <td>{doc.sender}</td>
                        <td>{doc.recipient}</td>
                        <td>
                          <div className="viewbtn">
                            <Link to={`/view-complete/${doc.docId}`}>
                              <button>View</button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No Logs Available</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="pagination-controls">
                <button
                  className="prev-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <GrCaretPrevious />
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="next-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <GrCaretNext />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SidePanel />
      <Footer />
    </>
  );
};

export default Completed;
