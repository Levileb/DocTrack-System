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

  const API_URL = process.env.REACT_APP_API_URL;

  const [formData, setFormData] = useState({
    date: "",
    title: "",
    sender: "",
    originating: "",
    recipient: "",
    destination: "",
    remarks: "",
  });

  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [offices, setOffices] = useState([]);

  useEffect(() => {
    const fetchUserDetails = () => {
      axios
        .get(`${API_URL}/api/user/details`, {
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
    const fetchData = async () => {
      try {
        const userResponse = await axios.get(`${API_URL}/view-user`);
        const filteredUsers = userResponse.data.filter(
          (user) => user.role === "user" && !user.isArchived
        );
        setAllUsers(filteredUsers);
        setFilteredUsers(filteredUsers);

        const officeResponse = await axios.get(`${API_URL}/offices`);
        const filteredOffices = officeResponse.data.filter(
          (office) => !office.isArchived
        );
        setOffices(filteredOffices);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchUserDetails();
    fetchData();
  }, );

  useEffect(() => {
    if (docId) {
      const fetchDocument = async () => {
        try {
          const docResponse = await axios.get(`${API_URL}/api/docs/${docId}`, {
            withCredentials: true,
          });
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
  }, [API_URL, docId]);

  // Update filtered users based on selected destination office
  const handleDestinationChange = (event) => {
    const selectedOffice = event.target.value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      destination: selectedOffice,
      recipient: "",
    }));

    const officeUsers = allUsers.filter(
      (user) => user.office === selectedOffice
    );
    setFilteredUsers(officeUsers);
  };

  const handleRecipientChange = (event) => {
    const selectedRecipient = event.target.value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      recipient: selectedRecipient,
    }));
  };

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
    console.log("Form Data: ", formData);
  };

  const handleCancel = () => {
    navigate("/home");
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    try {
      toast.info("Please wait for a moment..", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      // Send the forwarding log data
      await axios.post(
        `${API_URL}/api/docs/log-forwarding`,
        {
          docId: docId,
          forwardedTo: formData.recipient, // Ensure this is correctly set
          remarks: formData.remarks,
        },
        { withCredentials: true }
      );

      // Update document status
      await axios.post(`${API_URL}/api/docs/update-status`, {
        docId: docId,
        status: "Forwarded",
      });

      // Handle success message and clear form
      toast.success("Forwarded Successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      setFormData((prevFormData) => ({
        ...prevFormData,
        recipient: "",
        destination: "",
        remarks: "",
      }));
    } catch (error) {
      // Handle error
      console.error("Error forwarding document:", error);
      toast.error("Something went wrong, please try again!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setFormData((prevFormData) => ({
        ...prevFormData,
        recipient: "",
        destination: "",
        remarks: "",
      }));
    }
    setTimeout(() => {
      handleCancel(); // Navigate after the popup is hidden
    }, 2500);
  };

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

                <p>Destination Office:</p>
                <div className="input-new">
                  <select
                    id="destination"
                    value={formData.destination}
                    onChange={handleDestinationChange}
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

                <p>Recipient:</p>
                <div className="input-new">
                  <select
                    id="recipient"
                    value={formData.recipient}
                    onChange={handleRecipientChange}
                    required
                  >
                    <option value="" disabled>
                      Select Recipient
                    </option>
                    {filteredUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.firstname} {user.lastname}
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
                    required
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
