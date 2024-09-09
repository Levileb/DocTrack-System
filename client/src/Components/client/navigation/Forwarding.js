import React, { useState, useEffect } from "react";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import Header from "../Header";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const Forwarding = () => {
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
          const docResponse = await axios.get(
            `http://localhost:3001/api/docs/${docId}`
          );
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

  const handleCancel = () => {
    navigate("/home");
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();
    setShowPopup(true);

    try {
      // Send the forwarding log data
      await axios.post("http://localhost:3001/api/docs/log-forwarding", {
        docId: docId,
        forwardedTo: selectedEmployee, // Ensure this is correctly set
        remarks: formData.remarks,
      });

      // Update document status
      await axios.post("http://localhost:3001/api/docs/update-status", {
        docId: docId,
        status: "Forwarded",
      });

      // Handle success message and clear form
      setFormData((prevFormData) => ({
        ...prevFormData,
        recipient: "",
        desOffice: "",
        remarks: "",
      }));
      setSelectedEmployee("");
      setSelectedOffice("");
    } catch (error) {
      console.error("Error forwarding document:", error);
      // Handle error message
    }

    setTimeout(() => {
      setShowPopup(false);
      handleCancel(); // Navigate after the popup is hidden
    }, 1000);
  };

  const handleEmployeeSelect = (event) =>
    setSelectedEmployee(event.target.value);

  const handleOfficeSelect = (event) => setSelectedOffice(event.target.value);

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

                <p>Recipient:</p>
                <div className="input-new">
                  <select
                    id="recipient"
                    className="input-field"
                    required
                    value={selectedEmployee}
                    onChange={handleEmployeeSelect}
                  >
                    <option value="" disabled>
                      Select Employee
                    </option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {`${user.firstname} ${user.lastname}`}
                      </option>
                    ))}
                  </select>
                </div>

                <p>Designated Office:</p>
                <div className="input-new">
                  <select
                    id="desOffice"
                    className="input-field"
                    required
                    value={selectedOffice}
                    onChange={handleOfficeSelect}
                  >
                    <option value="" disabled>
                      Select Office
                    </option>
                    {offices.map((office) => (
                      <option key={office._id} value={office._id}>
                        {office.office}
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
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
              <div className="submitbuttons">
                <div className="CancelBtn secondarybtn">
                  <button type="button" onClick={handleCancel}>
                    Cancel
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
          <div className="popup forwarding">
            <p>Forwarded Successfully!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Forwarding;
