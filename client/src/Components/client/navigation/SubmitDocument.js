import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import axios from "axios";
import QRCode from "qrcode.react";
import { AiFillCloseCircle } from "react-icons/ai";
import logo from "../assets/kabankalan-logo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SubmitDocument = () => {
  const getCurrentDateTime = () => {
    return new Date().toISOString(); // Returns a string in ISO 8601 format
  };

  // Convert ISO format date to display format for the read-only input
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

  const [formData, setFormData] = useState({
    date: getCurrentDateTime(),
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

  useEffect(() => {
    const fetchUserDetails = () => {
      axios
        .get("http://localhost:3001/api/user/details", {
          withCredentials: true,
        })
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

  // Handle document submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newCodeNumber = generateCodeNumber();
    setCodeNumber(newCodeNumber);
    const updatedFormData = {
      ...formData,
      codeNumber: newCodeNumber,
      date: getCurrentDateTime(), // Use ISO format
    };
    setFormData(updatedFormData);
    axios
      .post("http://localhost:3001/submit-document", updatedFormData)
      .then((res) => {
        toast.success("Submitted Successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setShowQR(true);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong, please try again!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      });
  };

  const generateCodeNumber = () => {
    const codeNumber = Math.floor(10000000 + Math.random() * 90000000);
    return codeNumber.toString();
  };

  // const parseDate = (dateString) => {
  //   const [year, month, day] = dateString.split("-");
  //   return new Date(year, month - 1, day);
  // };

  const handleClear = () => {
    setFormData({
      date: getCurrentDateTime(),
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
            #qrCode {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
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
              <h4 class="title">Document Routing Slip</h4>
            </div>
          </header>
          <label>${codeNum}</label>
          <main>
            <div>
              ${content}
            </div>
            <div id="qrCode">
              <img src="${qrCodeImage}" alt="QR Code" />
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
          <div className="PanelHeader">
            <div className="filter">
              <p>Submit Document</p>
            </div>
          </div>
          <div className="FormWrapper">
            <form action="" className="AddUserForm" onSubmit={handleSubmit}>
              <div className="FormText submitdocument">
                <p>Date:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="date"
                    value={formatDateForDisplay(formData.date)}
                    readOnly
                  />
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
                {/* <p>Sender:</p>
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
                </div> */}
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
                  <textarea
                    className="inp-remarks"
                    type="text"
                    id="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
              <div className="adduserbuttons submit">
                <div className="ClearButton">
                  <button type="button" onClick={handleClear}>
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
      <ToastContainer />
      {showQR && (
        <div className="popup-container submitdocs">
          <div className="popupsubmitting">
            <p>Document Information</p>
            <div className="infoToPrint" id="divToPrint">
              <ul className="view-userinfo sd">
                <li>
                  Date:
                  <strong>{formatDateForDisplay(formData.date)}</strong>
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
              <QRCode id="qrCode" value={JSON.stringify(formData)} />
              <br />
              <label id="codeNum">
                <small>
                  Control No.: <strong>{codeNumber}</strong>
                </small>
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
    </>
  );
};

export default SubmitDocument;
