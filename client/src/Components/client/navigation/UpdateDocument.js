import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";

const UpdateDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: "",
    title: "",
    sender: "",
    originating: "",
    recipient: "",
    destination: ""
  });

  useEffect(() => {
    // Fetch document data from the server based on the document id
    axios.get(`http://localhost:3001/api/docs/${id}`)
      .then(result => {
        const { date, title, sender, originating, recipient, destination } = result.data;
        setFormData({ date, title, sender, originating, recipient, destination });
      })
      .catch(err => console.log(err));
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
    axios.put(`http://localhost:3001/api/docs/${id}`, formData)
      .then(res => {
        window.alert("Document successfully updated!");
        navigate('/home');
      })
      .catch(err => console.log(err));
  };

  const handleClear = () => {
    setFormData({
      date: "",
      title: "",
      sender: "",
      originating: "",
      recipient: "",
      destination: ""
    });
  };

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="AddUserHeader">
            <h2>Update Document</h2>
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
                  <input type="text" id="sender" value={formData.sender} readOnly />
                </div>

                <p>Originating Office:</p>
                <div className="input-new">
                  <input type="text" id="originating" value={formData.originating}  readOnly />
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
                  <button type="button" onClick={handleClear}>Clear</button>
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
    </>
  );
};

export default UpdateDocument;
