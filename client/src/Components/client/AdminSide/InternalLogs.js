import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../AdminSidePanel";
import Footer from "../Footer";
import axios from "axios";
import { IoSearch } from "react-icons/io5";
import "../navigation/newcontent.css";
import { GrCaretPrevious } from "react-icons/gr";
import { GrCaretNext } from "react-icons/gr";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaRegCopy } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx"; // Import xlsx library

const InternalLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const docsPerPage = 20;

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchDocs();
  }, );
  const fetchDocs = () => {
    axios
      .get(`${API_URL}/api/docs`)
      .then((response) => {
        const activeDocs = response.data.filter(
          (doc) => doc.status !== "Archived"
        );
        // Sort documents from most recent to oldest
        activeDocs.sort((a, b) => new Date(b.date) - new Date(a.date));

        setFilteredDocs(activeDocs);
      })
      .catch((error) => {
        console.error("Error fetching documents: ", error);
      });
  };

  // Export to Excel function
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((doc) => ({
        Date: dateFormat(doc.date),
        Control_No: doc.codeNumber,
        Title: doc.title,
        Status: doc.status,
        From: doc.sender,
        Office: doc.originating,
        For: doc.recipient,
        Destination: doc.destination,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "InternalLogs");
    XLSX.writeFile(workbook, "InternalLogs.xlsx");
  };

  const handlePopup = (event, doc) => {
    event.preventDefault();
    setSelectedDoc(doc);
  };

  const closePopup = () => {
    setSelectedDoc(null);
  };

  const handleDateChange = (e) => {
    if (e.target.name === "startDate") {
      setStartDate(e.target.value);
    } else if (e.target.name === "endDate") {
      setEndDate(e.target.value);
    }
  };

  const startIndex = (currentPage - 1) * docsPerPage;
  const endIndex = startIndex + docsPerPage;
  const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

  const dateFormat = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const filteredData = paginatedDocs.filter((val) => {
    const documentDate = new Date(val.date);
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    // Set the time to midnight to ignore time differences
    documentDate.setHours(0, 0, 0, 0);
    if (startDate) startDateTime.setHours(0, 0, 0, 0);
    if (endDate) endDateTime.setHours(23, 59, 59, 999); // End of the day

    const filterMatch =
      (!startDate || documentDate >= startDateTime) &&
      (!endDate || documentDate <= endDateTime);

    const searchMatch =
      (val.title &&
        val.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (val.sender &&
        val.sender.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (val.recipient &&
        val.recipient.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (val.officefrom &&
        val.officefrom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (val.officeto &&
        val.officeto.toLowerCase().includes(searchQuery.toLowerCase()));

    return filterMatch && searchMatch;
  });

  useEffect(() => {
    const totalPages = Math.ceil(filteredDocs.length / docsPerPage);
    setTotalPages(totalPages);
  }, [filteredDocs]);

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

  //Copy Code Number to clipboard
  const handleCopyCode = (codeNumber) => {
    navigator.clipboard
      .writeText(codeNumber)
      .then(() => {
        toast.success("Copied to clipboard!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      })
      .catch(() => {
        toast.error("Failed to copy code number!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      });
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
                  <div className="dateFilter-container">
                    <label>
                      Start Date:
                      <input
                        type="date"
                        name="startDate"
                        value={startDate}
                        onChange={handleDateChange}
                      />
                    </label>
                    <label>
                      End Date:
                      <input
                        type="date"
                        name="endDate"
                        value={endDate}
                        onChange={handleDateChange}
                      />
                    </label>
                    <button className="export-btn" onClick={exportToExcel}>
                      Export to Excel
                    </button>
                    {/* Export Button */}
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
                            <td>{formatDateForDisplay(val.date)}</td>
                            <td>{val.title}</td>
                            <td>{val.sender}</td>
                            <td>{val.recipient}</td>
                            <td>
                              <div className="viewbtn">
                                <button onClick={(e) => handlePopup(e, val)}>
                                  View
                                </button>
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

      <ToastContainer />

      {selectedDoc && (
        <div className="popup-container">
          <div className="popup homeView">
            <p>Document Information</p>
            <ul className="view-userinfo">
              <li>
                Date: <strong>{formatDateForDisplay(selectedDoc.date)}</strong>
              </li>
              <li>
                Control Number:
                <strong>{selectedDoc.codeNumber}</strong>
                <button
                  onClick={() => handleCopyCode(selectedDoc.codeNumber)}
                  title="Copy Control Number"
                  className="copy-btn"
                >
                  <FaRegCopy />
                </button>
              </li>
              <li>
                Title: <strong>{selectedDoc.title}</strong>
              </li>
              <li>
                From: <strong>{selectedDoc.sender}</strong>
              </li>
              <li>
                Originating Office: <strong>{selectedDoc.originating}</strong>
              </li>
              <li>
                To: <strong>{selectedDoc.recipient}</strong>
              </li>
              <li>
                Destination Office: <strong>{selectedDoc.destination}</strong>
              </li>

              <li>
                Status:{" "}
                <strong style={{ color: "green" }}>{selectedDoc.status}</strong>
              </li>
            </ul>
            <button className="closebtn" onClick={closePopup} title="Close">
              <AiFillCloseCircle className="closeicon" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InternalLogs;
