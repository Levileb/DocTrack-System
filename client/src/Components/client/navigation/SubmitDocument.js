import React, { useState } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import axios from 'axios';
import QRCode from 'qrcode.react'; // Import QR code library

const SubmitDocument = () => {
  const [formData, setFormData] = useState({
    date: getCurrentDate(),
    title: "",
    sender: "",
    originating: "",
    recipient: "",
    destination: ""
  });

  // State variable to control the visibility of QR code pop-up
  const [showQR, setShowQR] = useState(false);

  function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    if (month < 10) {
      month = "0" + month;
    }
    if (day < 10) {
      day = "0" + day;
    }

    return `${month}/${day}/${year}`;
  }

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/submit-document', formData)
      .then(res => {
        window.alert("Document successfully submitted!");
        setShowQR(true); // Show QR code pop-up
        setFormData({
          date: getCurrentDate(),
          title: "",
          sender: "",
          originating: "",
          recipient: "",
          destination: ""
        });
      })
      .catch(err => console.log(err));
  };

  const printQR = () => {
    window.print(); // Print the QR code
  };

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="AddUserHeader">
            <h2>Submit Document</h2>
          </div>

          <div className="FormWrapper">
            <form action="" className="AddUserForm" onSubmit={handleSubmit}> 
              <div className="FormText">
              <p>Date:</p>
                <div className="input-new">
                  <input type="text" id="date" value={formData.date} readOnly />
                </div>

                <p>Title:</p>
                <div className="input-new">
                  <input type="text" id="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <p>Sender:</p>
                <div className="input-new">
                  <input type="text" id="sender" value={formData.sender} onChange={handleInputChange} required />
                </div>

                <p>Originating:</p>
                <div className="input-new">
                  <input type="text" id="originating" value={formData.originating} onChange={handleInputChange} required />
                </div>

                <p>Recipient:</p>
                <div className="input-new">
                  <input type="text" id="recipient" value={formData.recipient} onChange={handleInputChange} required />
                </div>

                <p>Destination:</p>
                <div className="input-new">
                  <input type="text" id="destination" value={formData.destination} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="adduserbuttons">
                <div className="ClearButton">
                  <button type="button" onClick={() => setFormData({
                      date: getCurrentDate(),
                      title: "",
                      sender: "",
                      originating: "",
                      recipient: "",
                      destination: ""
                    })}>Clear</button>
                </div>
                <div className="SubmitButton">
                  <button type="submit">Submit</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <SidePanel />
      <Footer />

      {/* QR code pop-up */}
      {showQR && (
        <div className="qr-popup">
          <div className="qr-content">
            <QRCode value={JSON.stringify(formData)} />
            <button onClick={printQR}>Print</button>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmitDocument;
