import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import Header from "../Header";
import axios from "axios";

const Receiving = () => {
  const { docId } = useParams();
  const navigate = useNavigate();

  const getCurrentDateTime = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    return `${month}/${day}/${year} - ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 1000);

    return () => clearInterval(interval); // Clear the interval on component unmount
  }, []);

  const [formData, setFormData] = useState({
    date: getCurrentDateTime(),
    title: "",
    sender: "",
    orgOffice: "",
    recipient: "",
    desOffice: "",
    remarks: "",
  });

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (docId) {
      const fetchDocument = async () => {
        try {
          const docResponse = await axios.get(
            `http://localhost:3001/api/docs/${docId}`
          );
          setFormData((prevFormData) => ({
            ...prevFormData,
            title: docResponse.data.title,
            sender: docResponse.data.sender,
            orgOffice: docResponse.data.originating,
          }));
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      };

      fetchDocument();
    }
  }, [docId]);

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleCancel = () => {
    navigate("/home");
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();
    setShowPopup(true);

    try {
      await axios.post("http://localhost:3001/api/docs/log-receipt", {
        docId: docId,
        remarks: formData.remarks,
      });
      await axios.post("http://localhost:3001/api/docs/update-received", {
        docId: docId,
      });
      // Handle success message and clear form
    } catch (error) {
      console.error("Error receiving document:", error);
      // Handle error message
    }

    // Delay hiding the popup for 1 second
    setTimeout(() => {
      setShowPopup(false);
      handleCancel(); // Navigate after the popup is hidden
    }, 1000);
  };

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="filter">
              <p>Receiving</p>
            </div>
            <div className="date-time" style={{ marginRight: "5px" }}>
              <small>Philippines | {currentDateTime}</small>
            </div>
          </div>
          <div className="contents">
            <form className="SendingForm" onSubmit={handleSubmitForm}>
              <div className="FormText submitdocument">
                <div
                  style={{
                    borderBottom: "solid 1px black",
                    paddingBottom: "5px",
                    marginBottom: "5px",
                  }}
                >
                  <p>
                    Date Released: <strong>{formData.date}</strong>
                  </p>
                  <p>
                    Title: <strong>{formData.title}</strong>
                  </p>
                  <p>
                    Sender: <strong>{formData.sender}</strong>
                  </p>
                  <p>
                    Originating Office: <strong>{formData.orgOffice}</strong>
                  </p>
                </div>

                <div className="input-new">
                  <p>Remarks:</p>
                  <textarea
                    className="inp-remarks"
                    type="text"
                    id="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
              <div className="adduserbuttons recfor">
                <div className="ClearBtn secondarybtn">
                  <button type="button" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
                <div className="ForwardBtn primarybtn">
                  <button type="submit">Receive</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <SidePanel />
      <Footer />

      {showPopup && (
        <div className="popup-container">
          <div className="popup forwarding">
            <p>Received Successfully!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Receiving;
