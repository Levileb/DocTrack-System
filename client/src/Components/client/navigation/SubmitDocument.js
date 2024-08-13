import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import axios from "axios";
import QRCode from "qrcode.react";
import { AiFillCloseCircle } from "react-icons/ai";
import logo from "../assets/kabankalan-logo.png";

const SubmitDocument = () => {
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    date: getCurrentDate(),
    title: "",
    sender: "",
    originating: "",
    recipient: "",
    destination: "",
    remarks: "",
  });

  const [showQR, setShowQR] = useState(false);
  const [codeNumber, setCodeNumber] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [offices, setOffices] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchUserDetails = () => {
      axios
        .get("http://localhost:3001/api/user/details", { withCredentials: true })
        .then((res) => {
          const { firstname, lastname, office } = res.data;
          const fullName = `${firstname} ${lastname}`;
          setFormData((prevFormData) => ({
            ...prevFormData,
            sender: fullName,
            originating: office,
          }));
        })
        .catch((err) => console.error(err));
    };

    const fetchUsers = () => {
      axios
        .get("http://localhost:3001/view-user")
        .then((res) => {
          const allUsers = res.data;
          setUsers(allUsers);
          // Filter out the sender from the list of users for the recipient dropdown
          const filtered = allUsers.filter(
            (user) => `${user.firstname} ${user.lastname}` !== formData.sender
          );
          setFilteredUsers(filtered);
        })
        .catch((err) => console.error("Error fetching users:", err));
    };

    const fetchOffices = () => {
      axios
        .get("http://localhost:3001/offices")
        .then((res) => {
          setOffices(res.data);
        })
        .catch((err) => console.error("Error fetching offices:", err));
    };

    fetchUserDetails();
    fetchUsers();
    fetchOffices();
  }, [formData.sender]); // Added dependency here

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    let destination = formData.destination;

    if (id === "recipient") {
      const selectedUser = users.find(
        (user) => `${user.firstname} ${user.lastname}` === value
      );
      if (selectedUser) {
        destination = selectedUser.office;
      }
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
      destination: id === "recipient" ? destination : prevFormData.destination,
    }));
  };

  useEffect(() => {
    // Update the filteredUsers list whenever the sender changes
    if (formData.sender) {
      const filtered = users.filter(
        (user) => `${user.firstname} ${user.lastname}` !== formData.sender
      );
      setFilteredUsers(filtered);
    }
  }, [formData.sender, users]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dateObject = parseDate(formData.date);
    const newCodeNumber = generateCodeNumber();
    setCodeNumber(newCodeNumber);
    const updatedFormData = {
      ...formData,
      codeNumber: newCodeNumber,
      date: dateObject,
    };
    setFormData(updatedFormData);
    axios
      .post("http://localhost:3001/submit-document", updatedFormData)
      .then((res) => {
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          setShowQR(true);
        }, 1300);
      })
      .catch((err) => console.log(err));
  };

  const generateCodeNumber = () => {
    const codeNumber = Math.floor(10000000 + Math.random() * 90000000);
    return codeNumber.toString();
  };

  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return new Date(year, month - 1, day);
  };

  const handleClear = () => {
    setFormData({
      date: getCurrentDate(),
      title: "",
      sender: formData.sender,
      originating: formData.originating,
      recipient: "",
      destination: "",
      remarks: "",
    });
  };

  const printQR = () => {
    const content = document.getElementById("divToPrint").innerHTML;
    const qrCodeImage = document.getElementById("qrCode").toDataURL();
    const codeNum = document.getElementById("codeNum").innerText;
    const printWindow = window.open("", "_blank");
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
              <h2 class="title">City Government of Kabankalan</h2>
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
              <img style="margin-bottom: 10px;" src="${qrCodeImage}" alt="QR Code" />
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
      <SidePanel />
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
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <p>Sender:</p>
                <div className="input-new">
                  {formData.sender && (
                    <input
                      type="text"
                      id="sender"
                      value={formData.sender}
                      readOnly
                    />
                  )}
                </div>
                <p>Originating Office:</p>
                <div className="input-new">
                  {formData.originating && (
                    <input
                      type="text"
                      id="originating"
                      value={formData.originating}
                      readOnly
                    />
                  )}
                </div>
                <p>Recipient:</p>
                <div className="input-new">
                  <select
                    id="recipient"
                    value={formData.recipient}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>
                      Select Recipient
                    </option>
                    {filteredUsers.map((user) => (
                      <option
                        key={user._id}
                        value={`${user.firstname} ${user.lastname}`}
                      >
                        {user.firstname} {user.lastname}
                      </option>
                    ))}
                  </select>
                </div>
                <p>Destination Office:</p>
                <div className="input-new">
                  <select
                    id="destination" // Make sure this matches the key in the state
                    value={formData.destination}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Select Office
                    </option>
                    {offices.map((officeItem, index) => (
                      <option key={index} value={officeItem.office}>
                        {officeItem.office}
                      </option>
                    ))}
                  </select>
                </div>
                <p>Remarks:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="adduserbuttons">
                <div className="ClearButton">
                  <button
                    type="button"
                    onClick={handleClear}
                  >
                    Clear
                  </button>
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
      {showQR && (
        <div className="popup-container submitdocs">
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
            <div className="qrCodeImage">
              <label>
                <small>QR Code:</small>
              </label>
              <QRCode id="qrCode" value={JSON.stringify(formData)} />
              <br />
              <label id="codeNum">
                <small>Code Number: {codeNumber}</small>
              </label>
            </div>
            <div className="actionbtn primarybtn">
              <button className="printbtn" onClick={printQR}>
                Print
              </button>
            </div>
            <button
              className="closebtn"
              onClick={() => {
                setShowQR(false);
                handleClear();
              }}
            >
              <AiFillCloseCircle className="closeicon" />
            </button>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="popup-container">
          <div className="popup submitting">
            <p>Document Submitted Successfully.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmitDocument;
