import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import { Link } from "react-router-dom";

const Completed = () => {
  const [data, setData] = useState([]); // State to hold fetched documents

  // Function to fetch completed documents
  const fetchDocs = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/docs");
      const completedDocs = response.data.filter(
        (doc) => doc.status === "Completed"
      );
      // Sort documents from most recent to oldest
      completedDocs.sort((a, b) => new Date(b.date) - new Date(a.date));

      setData(completedDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchDocs(); // Fetch documents when the component mounts
  }, []);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="filter">
              <p>Completed</p>
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
                  {data.map((doc) => (
                    <tr key={doc._id}>
                      <td>{formatDate(doc.date)}</td>
                      <td>{doc.title}</td>
                      <td>{doc.sender}</td>
                      <td>{doc.recipient}</td>
                      <td>
                        <div className="viewbtn">
                          <Link to={`/view-complete/${doc._id}`}>
                            <button>View</button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
