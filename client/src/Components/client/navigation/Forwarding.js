import React, { useState, useEffect } from "react";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import Header from "../Header";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Forwarding = () => {
  const { docId } = useParams();
  const navigate = useNavigate();

  // const getCurrentDateTime = () => {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   let month = today.getMonth() + 1;
  //   let day = today.getDate();
  //   let hours = today.getHours();
  //   let minutes = today.getMinutes();
  //   let seconds = today.getSeconds();
  //   let ampm = hours >= 12 ? "PM" : "AM";
  //   hours = hours % 12;
  //   hours = hours ? hours : 12;

  //   if (month < 10) month = "0" + month;
  //   if (day < 10) day = "0" + day;
  //   if (hours < 10) hours = "0" + hours;
  //   if (minutes < 10) minutes = "0" + minutes;
  //   if (seconds < 10) seconds = "0" + seconds;

  //   return `${month}/${day}/${year} - ${hours}:${minutes}:${seconds} ${ampm}`;
  // };

  // const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentDateTime(getCurrentDateTime());
  //   }, 1000);

  //   return () => clearInterval(interval); // Clear the interval on component unmount
  // }, []);

  const [formData, setFormData] = useState({
    date: "",
    title: "",
    sender: "",
    orgOffice: "",
    recipient: "",
    desOffice: "",
    remarks: "",
  });

  const [users, setUsers] = useState([]);
  const [offices, setOffices] = useState([]);
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
            date: docResponse.data.date,
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
      toast.success("Forwarded Successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      setFormData((prevFormData) => ({
        ...prevFormData,
        recipient: "",
        desOffice: "",
        remarks: "",
      }));
      setSelectedEmployee("");
      setSelectedOffice("");
    } catch (error) {
      // Handle error
      console.error("Error forwarding document:", error);
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
      setFormData((prevFormData) => ({
        ...prevFormData,
        recipient: "",
        desOffice: "",
        remarks: "",
      }));
      setSelectedEmployee("");
      setSelectedOffice("");
    }
  };

  const handleEmployeeSelect = (event) =>
    setSelectedEmployee(event.target.value);

  const handleOfficeSelect = (event) => setSelectedOffice(event.target.value);

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

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="filter">
              <p>Forwarding</p>
            </div>
            {/* <div className="date-time" style={{ marginRight: "5px" }}>
              <small>Philippines | {currentDateTime}</small>
            </div> */}
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
                    Date Released:{" "}
                    <strong>{formatDateForDisplay(formData.date)}</strong>{" "}
                  </p>
                  <p>
                    Title: <strong>{formData.title}</strong>
                  </p>
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
      <ToastContainer />
    </>
  );
};

export default Forwarding;
