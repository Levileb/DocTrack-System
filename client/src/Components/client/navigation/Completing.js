import React, { useState, useEffect } from "react";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import Header from "../Header";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Completing = () => {
  const { docId } = useParams();
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  const [formData, setFormData] = useState({
    date: "",
    title: "",
    sender: "",
    orgOffice: "",
    recipient: "",
    desOffice: "",
    remarks: "",
  });

  useEffect(() => {
    if (docId) {
      const fetchDocument = async () => {
        try {
          const token = Cookies.get("accessToken");
          const docResponse = await axios.get(`${API_URL}/api/docs/${docId}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          setFormData((prevFormData) => ({
            ...prevFormData,
            date: docResponse.data.date,
            title: docResponse.data.title,
            sender: docResponse.data.sender,
            orgOffice: docResponse.data.originating,
          }));
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      };

      fetchDocument();
    }
  }, [API_URL, docId]);

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
      const token = Cookies.get("accessToken");
      await axios.post(`${API_URL}/api/docs/complete`, {
        docId: docId,
        remarks: formData.remarks,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      // Handle success message and clear form
      toast.success("Document Process Completed!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      console.error("Error completing document:", error);
      // Handle error message
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
    }
    setFormData({
      date: formData.date,
      title: formData.title,
      sender: formData.sender,
      orgOffice: formData.orgOffice,
      recipient: "",
      desOffice: "",
      remarks: "",
    });
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
              <p>Completing</p>
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
                    <strong>{formatDateForDisplay(formData.date)}</strong>
                  </p>
                  <p>
                    Title: <strong>{formData.title}</strong>
                  </p>
                  <p>
                    Sender: <strong>{formData.sender}</strong>
                  </p>
                  <p>
                    Originating Office: <strong>{formData.orgOffice}</strong>
                  </p>
                </div>

                <div className="input-new">
                  <p>Remarks:</p>
                  <textarea
                    className="inp-remarks"
                    type="text"
                    id="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
              <div className="adduserbuttons recfor">
                <div className="ClearBtn secondarybtn">
                  <button type="button" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
                <div className="ForwardBtn primarybtn">
                  <button type="submit">Complete</button>
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

export default Completing;
