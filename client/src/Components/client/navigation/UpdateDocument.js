import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { RiArrowGoBackFill } from "react-icons/ri";
import "../navigation/newcontent.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
    // Fetch document data from the server based on the document id
    axios
      .get(`http://localhost:3001/api/docs/${id}`, { withCredentials: true })
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
  }, [id]);

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
      .put(`http://localhost:3001/api/docs/${id}`, formData, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success("Document Successfully Updated!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
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
          hideProgressBar: false,
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
                {/* <div className="input-new">
                  <input type="text" id="date" value={formData.date} readOnly />
                </div> */}

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
                  <input
                    type="text"
                    id="sender"
                    value={formData.sender}
                    readOnly
                  />
                </div>

                <p>Originating Office:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="originating"
                    value={formData.originating}
                    readOnly
                  />
                </div> */}

                <p>Recipient:</p>
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
