import React, { useState, useEffect } from "react";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import Header from "../Header";
import Dropdown from "../Dropdown";
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Forwarding = () => {
  const { docId } = useParams();

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
  });

  const [users, setUsers] = useState([]);
  const [offices, setOffices] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedOffice, setSelectedOffice] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get("http://localhost:3001/view-user");
        setUsers(userResponse.data);

        const officeResponse = await axios.get("http://localhost:3001/offices");
        setOffices(officeResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (docId) {
      const fetchDocument = async () => {
        try {
          const docResponse = await axios.get(`http://localhost:3001/api/docs/${docId}`);
          setFormData((prevFormData) => ({
            ...prevFormData,
            title: docResponse.data.title,
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

  const handleClearForm2 = () => {
    setFormData({
      date: getCurrentDateTime(),
      title: formData.title,
      sender: "",
      orgOffice: "",
      recipient: "",
      desOffice: "",
    });
    setSelectedEmployee("");
    setSelectedOffice("");
  };

  const handleSubmitForm = (event) => {
    event.preventDefault();
    setShowPopup(true);
    handleClearForm2();
    setTimeout(() => setShowPopup(false), 1000);
  };

  const handleEmployeeSelect = (employee) => setSelectedEmployee(employee);

  const handleOfficeSelect = (office) => setSelectedOffice(office);

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="filter">
              <p>Forwarding</p>
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

                <Dropdown
                  data={users.map(user => ({ id: user._id, name: `${user.firstname} ${user.lastname}` }))}
                  label="Recipient"
                  selectedValue={selectedEmployee}
                  onSelect={handleEmployeeSelect}
                />

                <Dropdown
                  data={offices.map(office => ({ id: office._id, name: office.office, location: office.location }))}
                  label="Designated Office"
                  selectedValue={selectedOffice}
                  onSelect={handleOfficeSelect}
                />
              </div>
              <div className="submitbuttons">
                <div className="ClearBtn secondarybtn">
                  <button type="button" onClick={handleClearForm2}>
                    Clear
                  </button>
                </div>
                <div className="ForwardBtn primarybtn">
                  <button type="submit">Forward</button>
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
          <div className="popup">
            <p>Forwarded Successfully!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Forwarding;
