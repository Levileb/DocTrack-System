import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const UpdateUsers = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [office, setOffice] = useState("");

  useEffect(() => {
    console.log("ID:", id);
    axios
      .get(`http://localhost:3001/getUser/` + id)
      .then((result) => {
        console.log(result);
        setFirstName(result.data.firstname || ""); // Set initial name value or empty string
        setLastName(result.data.lastname || "");
        setEmail(result.data.email || ""); // Set initial email value or empty string
        setPosition(result.data.position || "");
        setOffice(result.data.office || "");
      })
      .catch((err) => console.log(err));
  }, [id]);

  const Update = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:3001/updateUser/` + id, {
        firstname,
        lastname,
        email,
        position,
        office,
      })
      .then((result) => {
        console.log(result);
        navigate("/view-user");
        // Display alert after successful update
        alert("Data Updated Successfully");
      })
      .catch((err) => console.log(err));
  };

  const handleClear = () => {
    // Clear form fields
    setFirstName("");
    setLastName("");
    setEmail("");
    setPosition("");
    setOffice("");
  };

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="AddUserHeader">
            <p>Update User</p>
          </div>

          <div className="FormWrapper">
            <form action="" className="UpdateUserForm" onSubmit={Update}>
              <div className="FormText">
                <p>First Name:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="firstname"
                    required
                    value={firstname}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <p>Last Name:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="lastname"
                    required
                    value={lastname}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <p>Designated Office:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="office"
                    required
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                  />
                </div>

                <p>Position:</p>
                <div className="input-new">
                  <input
                    type="text"
                    id="position"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>

                <p>Email:</p>
                <div className="input-new">
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                
              </div>
              <div className="adduserbuttons">
                <div className="ClearButton">
                  <button type="button" onClick={handleClear}>
                    Clear
                  </button>
                </div>
                <div className="SubmitButton">
                  <button type="submit">Update</button> {/* Change here */}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <SidePanel /> {/* Always render the SidePanel */}
      <Footer />
    </>
  );
};

export default UpdateUsers;
