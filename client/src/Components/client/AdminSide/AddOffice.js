import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../AdminSidePanel";
import Footer from "../Footer";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { LuArchive } from "react-icons/lu";
import "../navigation/newcontent.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddOffice = () => {
  const [office, setOffice] = useState("");
  const [offices, setOffices] = useState([]); // State to hold fetched offices
  const [searchTerm, setSearchTerm] = useState(""); // State to hold search input
  const [showConfirmPopup, setShowConfirmPopup] = useState(false); // State for confirmation popup
  const [officeToArchive, setOfficeToArchive] = useState(null); // State to track which office is being archived
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Fetch offices when the component mounts
    fetchOffices();
  }, []);

  const fetchOffices = () => {
    axios
      .get(`${API_URL}/offices`)
      .then((res) => {
        const activeOffices = res.data.filter((office) => !office.isArchived);
        setOffices(activeOffices);
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${API_URL}/add-office`, { office })
      .then((res) => {
        toast.success("A new Office is added successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setOffice("");
        fetchOffices(); // Fetch updated list of offices
      })
      .catch((err) => {
        console.log("Error: ", err);
        toast.error("Something went wrong, please try again!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      });
  };

  const handleArchive = (id) => {
    // Set the office to archive and show the confirmation popup
    setOfficeToArchive(id);
    setShowConfirmPopup(true);
  };

  const handleArchiveConfirm = () => {
    // Proceed with archiving the selected office
    if (officeToArchive) {
      axios
        .post(`${API_URL}/archive-office/${officeToArchive}`)
        .then((res) => {
          toast.success("Office moved to Archived!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          fetchOffices(); // Fetch updated list of offices
        })
        .catch((err) => {
          console.error("Error archiving office:", err);
          toast.error("Something went wrong, please try again!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        })
        .finally(() => {
          setShowConfirmPopup(false);
          setOfficeToArchive(null);
        });
    }
  };

  const handleCancelArchive = () => {
    setShowConfirmPopup(false);
    setOfficeToArchive(null);
  };

  const handleCancel = () => {
    navigate("/admin");
  };

  // Filter offices based on the search input
  const filteredOffices = offices.filter((office) =>
    office.office.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="filter viewusers">
              <p>View Offices</p>
            </div>
            <div className="navbuttons">
              <div className="adduserbtn nf secondarybtn">
                <Link to="/archived-offices" style={{ textDecoration: "none" }}>
                  <button title="View Archived Offices">
                    <LuArchive className="icon" />
                    <p>Archived</p>
                  </button>
                </Link>
              </div>
            </div>
            <div className="search">
              <div className="search-border">
                <IoSearch className="searchIcon" />
                <input
                  type="search"
                  name="search"
                  id="search"
                  placeholder="Search.."
                  className="search-bar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} // Update search input
                />
              </div>
            </div>
          </div>
          <div className="noContainer">
            <div className="listofficetable content-table">
              <table>
                <thead>
                  <tr>
                    <td>#</td>
                    <td>List of Offices</td>
                    <td>Action</td>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffices.map((val, index) => (
                    <tr key={val._id}>
                      <td>{index + 1}</td>
                      <td>{val.office}</td>
                      <td>
                        <div className="Arch-Btn">
                          <button
                            type="button"
                            onClick={() => handleArchive(val._id)}
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="FormWrapper noffice">
              <form className="AddOfficeForm" onSubmit={handleSubmit}>
                <div className="FormText">
                  <p>New Office Name:</p>
                  <div className="input-new">
                    <input
                      type="text"
                      id="office"
                      required
                      value={office}
                      onChange={(e) => setOffice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="adduserbuttons">
                  <div className="Clr-Btn">
                    <button type="button" onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
                  <div className="Sub-Btn">
                    <button type="submit">Save</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <SidePanel />
      <Footer />
      <ToastContainer />

      {showConfirmPopup && (
        <div className="confirm-popup">
          <p>Are you sure you want to archive this office?</p>
          <div className="popup-content">
            <button onClick={handleArchiveConfirm} className="confirm-btn">
              Yes
            </button>
            <button onClick={handleCancelArchive} className="cancel-btn">
              No
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddOffice;
