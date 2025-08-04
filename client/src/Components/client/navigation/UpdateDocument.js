import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { RiArrowGoBackFill } from "react-icons/ri";
import "../navigation/newcontent.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [offices, setOffices] = useState([]);

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
        const token = Cookies.get("accessToken");
        const userResponse = await axios.get(`${API_URL}/view-user`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const filteredUsers = userResponse.data.filter(
          (user) => user.role === "user" && !user.isArchived
        );
        setAllUsers(filteredUsers);
        setFilteredUsers(filteredUsers);

        const officeResponse = await axios.get(`${API_URL}/offices`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
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
  }, [API_URL]);
  useEffect(() => {
    // Fetch document data from the server based on the document id
    axios
      .get(`${API_URL}/api/docs/${id}`, { withCredentials: true })
      .then((result) => {
        const {
          date,
          title,
          sender,
          originating,
          recipient,
          destination,
          remarks,
        } = result.data;

        setFormData({
          date,
          title,
          sender,
          originating,
          recipient,
          destination,
          remarks,
        });
      })
      .catch((err) => console.log(err));
  }, [API_URL, id]);

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Update the document data
    axios
      .put(`${API_URL}/api/docs/${id}`, formData, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success("Document Updated!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      })
      .catch((err) => {
        console.log(err);
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
      });
    setTimeout(() => {
      navigate("/home");
    }, 2100);
  };

  const handleCancel = () => {
    navigate("/home");
  };

  const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
      <div
        className="tooltip2-container"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        {isVisible && <div className="tooltip2">{text}</div>}
      </div>
    );
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
          <div className="AddUserHeader">
            <div className="back-btn">
              <Link to="/home">
                <button>
                  <Tooltip text={"Click to go back, Home page"}>
                    <RiArrowGoBackFill className="back-icon" />
                  </Tooltip>{" "}
                </button>
              </Link>
            </div>
            <h2>Update Document</h2>
          </div>

          <div className="FormWrapper">
            <form action="" className="AddUserForm" onSubmit={handleSubmit}>
              <div className="FormText submitdocument">
                <p>Date Submitted: {formatDateForDisplay(formData.date)}</p>

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
                      <option
                        key={user._id}
                        value={`${user.firstname} ${user.lastname}`}
                      >
                        {user.firstname} {user.lastname}
                      </option>
                    ))}
                  </select>
                </div>

                {/* <p>Recipient:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="recipient"
                    value={formData.recipient}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <p>Destination Office:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    required
                  />
                </div> */}

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
                  <button type="button" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
                <div className="SubmitButton">
                  <button type="submit">Update</button>
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

export default UpdateDocument;
