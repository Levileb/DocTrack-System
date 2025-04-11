import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../AdminSidePanel";
import Footer from "../Footer";
import { IoSearch } from "react-icons/io5";
import { RiArrowGoBackFill } from "react-icons/ri";
import "../navigation/newcontent.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ArchiveOffice = () => {
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [data, setData] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false); // State for confirmation popup
  const [selectedOfficeId, setSelectedOfficeId] = useState(null); // State to store the selected office ID

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Fetch archived offices from the backend
    const fetchArchivedOffices = async () => {
      try {
        const response = await axios.get(`${API_URL}/archived-offices`);
        // console.log("Fetched archived offices:", response.data);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching archived offices: ", error);
      }
    };

    fetchArchivedOffices();
  },);

  const handleRestoreClick = (officeId) => {
    setSelectedOfficeId(officeId);
    setShowConfirmPopup(true); // Show the confirmation popup
  };

  const confirmRestore = async () => {
    if (!selectedOfficeId) return;

    try {
      await axios.post(`${API_URL}/restore-office/${selectedOfficeId}`);
      setData(data.filter((office) => office._id !== selectedOfficeId)); // Update state
      toast.success("Office Restored!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      console.error("Error restoring office: ", error);
      toast.error("Something went wrong, please try again!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setShowConfirmPopup(false); // Hide the confirmation popup
      setSelectedOfficeId(null); // Reset the selected office ID
    }
  };

  const cancelRestore = () => {
    setShowConfirmPopup(false); // Hide the confirmation popup
    setSelectedOfficeId(null); // Reset the selected office ID
  };

  const filteredData = data.filter((val) => {
    // Check for search query match (case insensitive)
    const searchMatch =
      val.office &&
      val.office.toLowerCase().includes(searchQuery.toLowerCase());

    return searchMatch;
  });

  return (
    <>
      <Header />
      <SidePanel />
      <div>
        <div className="MainPanel">
          <div className="PanelWrapper">
            <div className="AddUserHeader arc">
              <div className="back-btn">
                <Link to="/add-office">
                  <button title="Go back to View Offices">
                    <RiArrowGoBackFill className="back-icon" />
                  </button>
                </Link>
              </div>
              <div className="filter">
                <p>Archived Offices</p>
              </div>
              <div className="search">
                <div className="search-border">
                  <IoSearch className="searchIcon" />
                  <input
                    type="search"
                    placeholder="Search.."
                    className="search-bar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="logList-container">
              <div className="contents">
                <div className="content-table">
                  <table>
                    <thead>
                      <tr>
                        <td>#</td>
                        <td>Name</td>
                        <td>Action</td>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length > 0 ? (
                        filteredData.map((val, index) => (
                          <tr key={val._id}>
                            <td>{index + 1}</td>
                            <td>{val.office}</td>
                            <td>
                              <div className="viewbtn">
                                <button
                                  onClick={() => handleRestoreClick(val._id)}
                                >
                                  Restore
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2">No Archived Office Available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer />

      {showConfirmPopup && (
        <div className="confirm-popup">
          <p>Are you sure you want to restore this office?</p>
          <div className="popup-content">
            <button onClick={confirmRestore} className="confirm-btn">
              Yes
            </button>
            <button onClick={cancelRestore} className="cancel-btn">
              No
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ArchiveOffice;
