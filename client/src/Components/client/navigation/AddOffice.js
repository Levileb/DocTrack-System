import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import axios from "axios";
import { Link } from "react-router-dom";
import { RiArrowGoBackFill } from "react-icons/ri";
import "../navigation/newcontent.css";

const AddOffice = () => {
  const [office, setOffice] = useState("");
  const [offices, setOffices] = useState([]); // State to hold fetched offices

  const [showPopup, setShowPopup] = useState(false); // State for popup visibility
  const [isOfficeSaved, setIsOfficeSaved] = useState(false); // State to track office save success
  const saveSuccess = true;
  const saveUnsuccessful = false;

  useEffect(() => {
    // Fetch offices when the component mounts
    axios
      .get("http://localhost:3001/offices")
      .then((res) => {
        setOffices(res.data); // Assuming the response contains an array of offices
      })
      .catch((err) => {
        console.log(err);
      });
  }, []); // Empty dependency array to run the effect only once when the component mounts

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/add-office", { office })
      .then((res) => {
        setIsOfficeSaved(saveSuccess);
        setShowPopup(true);
        // Resetting form fields
        setOffice("");
        // Fetch updated list of offices after saving new office
        axios
          .get("http://localhost:3001/offices")
          .then((res) => {
            setOffices(res.data); // Update the list of offices
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
        setIsOfficeSaved(saveUnsuccessful);
        setShowPopup(true);
      });

    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  const handleClear = () => {
    // Clear form fields
    setOffice("");
  };

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
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="AddUserHeader">
            <div className="back-btn">
              <Link to="/view-user">
                <button>
                  <Tooltip text={"Click to go back, View Users"}>
                    <RiArrowGoBackFill className="back-icon" />
                  </Tooltip>
                </button>
              </Link>
            </div>
            <p>Add Office</p>
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
                  {offices.map((val, index) => {
                    return (
                      <tr key={val._id}>
                        <td>{index + 1}</td>{" "}
                        {/* Display index starting from 1 */}
                        <td>{val.office}</td>
                        <td>
                          <div className="Arch-Btn">
                            <button type="button">Archive</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="FormWrapper noffice">
              <form action="" className="AddOfficeForm" onSubmit={handleSubmit}>
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
                    <button type="button" onClick={handleClear}>
                      Clear
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
      <SidePanel /> {/* Always render the SidePanel */}
      <Footer />
      {showPopup && (
        <div
          className={`popup-container ${
            isOfficeSaved ? "savesuccess" : "savefailure"
          }`}
        >
          <div className="popup savesuccess">
            <p>
              {isOfficeSaved
                ? "Office saved successfully!"
                : "Failed to save office!"}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AddOffice;
