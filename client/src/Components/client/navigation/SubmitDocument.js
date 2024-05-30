import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import axios from 'axios';
import QRCode from 'qrcode.react'; // Import QR code library
import { AiFillCloseCircle } from "react-icons/ai";
import logo from "../assets/logo.png";

const SubmitDocument = () => {
  const [formData, setFormData] = useState({
    date: getCurrentDate(),
    title: "",
    sender: "", // Initialize sender with an empty string
    originating: "",
    recipient: "",
    destination: ""
  });
  

  // State variable to control the visibility of QR code pop-up
  const [showQR, setShowQR] = useState(false);
  // State variable to store the generated code number
  const [codeNumber, setCodeNumber] = useState('');

  useEffect(() => {
    // Fetch user details when the component mounts
    fetchUserDetails();
  }, []);

  const fetchUserDetails = () => {
    axios.get('http://localhost:3001/api/user/details', { withCredentials: true })
      .then(res => {
        const { firstname, lastname, office } = res.data;
        const fullName = `${firstname} ${lastname}`;
        setFormData(prevFormData => ({
          ...prevFormData,
          sender: fullName, // Set sender field to user's full name
          originating: office // Set originating field
        }));
      })
      .catch(err => console.error(err));
  };
  


  function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
  
    // Ensure month and day are always two digits
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
  
    // Return the date in "YYYY-MM-DD" format
    return `${year}-${month}-${day}`;
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
  
    // Convert the date string to a Date object
    const dateObject = parseDate(formData.date);
  
    // Generate a random code number
    const newCodeNumber = generateCodeNumber();
    setCodeNumber(newCodeNumber);
  
    // Update formData with the code number and date object
    const updatedFormData = {
      ...formData,
      codeNumber: newCodeNumber,
      date: dateObject, // Convert date string to Date object
    };
  
    setFormData(updatedFormData); // Update formData immediately
  
    axios.post('http://localhost:3001/submit-document', updatedFormData)
      .then(res => {
        window.alert("Document successfully submitted!");
        setShowQR(true); // Show QR code pop-up
      })
      .catch(err => console.log(err));
  };

  const generateCodeNumber = () => {
    // Generate a random 8-digit code number (you can customize the length and format)
    const codeNumber = Math.floor(10000000 + Math.random() * 90000000);
    return codeNumber.toString();
  };

  // Function to convert date string to Date object
const parseDate = (dateString) => {
  // Ensure that the date string is in the format 'YYYY-MM-DD'
  const [year, month, day] = dateString.split('-');
  return new Date(year, month - 1, day); // Month is 0-based
};

  const printQR = () => {
    const content = document.getElementById('divToPrint').innerHTML;
    const qrCodeImage = document.getElementById('qrCode').toDataURL(); // Convert QR code to data URL
    const codeNum = document.getElementById('codeNum').innerText;
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Routing Slip</title>

          <style>
            body {
              font-family: 'Arial';
              font-size: 12pt;
              display: flex;
              flex-direction: column;
              margin: 0.5in;
            }
            main {
              display: flex;
              justify-content: space-between;
              border: 1px solid #000;
              padding: 15px;
            }
            div {
              display: flex;
              width: max-content;
              height: 140px;
              flex-direction: column;
            }
            p {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              display: flex;
            }
            ul {
              text-decoration: none;
              list-style: none;
              padding: 0;
              margin: 0;
              display: flex;
              flex-direction: column;
            }
            ul li {
              margin-bottom: 5px;
            }
            label {
              font-weight: bold;
            }
            img {
              display: flex;
              max-width: 100px;
              max-height: 100px;
            }
            header {
              display: flex;
              justify-content: center;
              margin-bottom: 10px;
            }
            #logoImg {
              height: 100px;
              display: flex;
              margin-right: 15px;
            }
            #companyTitle {
              display: flex;
              align-items: center;
              height: 100px;
              justify-content: center;
            }
            #companyTitle .title {
              margin: 0;
            }
            #drs {
              display: flex;
              width: 100%;
              max-height: 45px;
            }


          </style>
        </head>
        <body onload="window.print();">

        <header>
          <div id="logoImg">
            <img style="max-width: 100px; max-height: 100px;" src="${logo}" alt="logo" />
          </div>
          <div id="companyTitle">
            <h2 class="title">Company Name</h2>
            <h5 class="title">Document Tracking System</h5>
          </div>

        </header>

          <div id="drs"><h4>Document Routing Slip</h4></div>

        <main>
            <div>
              ${content}
            </div>

            <div>
              <label>QR Code:</label>
              <img style="margin-bottom: 10px;" src="${qrCodeImage}" alt="QR Code" /> <!-- Include QR code image -->
              <label>${codeNum}</label>
            </div>
        </main>

        </body>
      </html>
    `);
    printWindow.document.close();
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
                  {formData.sender && (
                    <input type="text" id="sender"value={formData.sender} readOnly/>
                  )}
                </div>


                <p>Originating Office:</p>
                <div className="input-new">
                  {formData.originating && (
                    <input type="text" id="originating"value={formData.originating} readOnly/>
                  )}
                </div>

                <p>Recipient:</p>
                <div className="input-new">
                  <input type="text" id="recipient" value={formData.recipient} onChange={handleInputChange} required />
                </div>

                <p>Destination Office:</p>
                <div className="input-new">
                  <input type="text" id="destination" value={formData.destination} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="adduserbuttons">
                <div className="ClearButton">
                  <button type="button" onClick={() => setFormData({
                      date: getCurrentDate(),
                      title: "",
                      sender: formData.sender,
                      originating: formData.originating,
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
        <div className="popup-container submitdocs" >
          <div className="popupsubmitting">
          <p>Document Information</p>
            <div className="infoToPrint" id="divToPrint">
             
              <ul className="view-userinfo sd">
              <li>
  Date: <strong>{formData.date.toLocaleDateString()}</strong>
</li>

                <li>
                  Title: <strong>{formData.title}</strong>
                </li>
                <li>
                  Sender: <strong>{formData.sender}</strong>
                </li>
                <li>
                  Originating Office: <strong>{formData.originating}</strong>
                </li>
                <li>
                  Recipient: <strong>{formData.recipient}</strong>
                </li>
                <li>
                Destination Office: <strong>{formData.destination}</strong>
                </li>
              </ul>
              </div>
              {/* Display QR code and code number */}
              <div className="qrCodeImage">
                <label><small>QR Code:</small></label>
                <QRCode id="qrCode" value={JSON.stringify(formData)} />
                <br/>
                <label id="codeNum"><small>Code Number: {codeNumber}</small></label>
              </div>
              
            
            {/* Print button */}
            <div className="actionbtn primarybtn">
              <button className="printbtn " onClick={() => printQR()}>Print</button>
            </div>

            {/* Close button */}
            <button className="closebtn" onClick={() => setShowQR(false)}>
              <AiFillCloseCircle className="closeicon" />
            </button>
          </div>
        </div>
      )}

    </>
  );
};

export default SubmitDocument;
