import React, { useState, useEffect } from "react";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import Header from "../Header";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const Completing = () => {
  const { docId } = useParams();
  const navigate = useNavigate();

  const getCurrentDateTime = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;

    return `${month}/${day}/${year} - ${hours}:${minutes} ${ampm}`;
  };

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
      await axios.post("http://localhost:3001/api/docs/complete", {
        docId: docId,
        remarks: formData.remarks,
      });
      // Handle success message and clear form
    } catch (error) {
      console.error("Error completing document:", error);
      // Handle error message
    }

    setFormData({
      date: getCurrentDateTime(),
      title: formData.title,
      sender: formData.sender,
      orgOffice: formData.orgOffice,
      recipient: "",
      desOffice: "",
      remarks: "",
    });

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
              <p>Completing</p>
            </div>
          </div>
          <div className="contents">
            <form className="SendingForm" onSubmit={handleSubmitForm}>
              <div className="FormText">
                <p>Date:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    readOnly
                    style={{ fontWeight: "bold" }}
                  />
                </div>

                <p>Title:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    autoComplete="off"
                    readOnly
                    required
                  />
                </div>

                <p>Sender:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="sender"
                    value={formData.sender}
                    onChange={handleInputChange}
                    autoComplete="off"
                    readOnly
                    required
                  />
                </div>

                <p>Originating Office:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="orgOffice"
                    value={formData.orgOffice}
                    onChange={handleInputChange}
                    autoComplete="off"
                    readOnly
                    required
                  />
                </div>

                <p>Remarks:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
              <div className="submitbuttons">
                <div className="ClearBtn secondarybtn">
                  <button type="button" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
                <div className="ForwardBtn primarybtn">
                  <button type="submit">Complete</button>
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
            <p>Completed Successfully!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Completing;
