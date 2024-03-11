import React, { useState } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import axios from 'axios'
//import {useNavigate} from 'react-router-dom'



const AddUsers = () => {

  const [firstname, setFirstName] = useState()
  const [lastname, setLastName] = useState()
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [position, setPosition] = useState()
  const [office, setOffice] = useState()
  //const navigate = useNavigate()

  const handleSubmit = (e) => {
  e.preventDefault();
  axios.post('http://localhost:3001/add-user', {firstname, lastname, email, password, position, office})
    .then(res => {
      // Displaying an alert for successful save
      window.alert("Data successfully saved!");

      // Resetting form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPosition("");
      setOffice("");

      // Refreshing the page
      window.location.reload();
    })
    .catch(err => console.log(err));
};
  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="AddUserHeader">
            <h2>Add User</h2>
          </div>

          <div className="FormWrapper">
            <form action="" className="AddUserForm" onSubmit={handleSubmit}> 
              <div className="FormText">
                <p>First Name:</p>
                <div className="input-new">
                  <input type="text" id="firstname" required 
                  onChange={(e) => setFirstName(e.target.value)} />
                </div>

                <p>Last Name:</p>
                <div className="input-new">
                  <input type="text" id="lastname" required 
                  onChange={(e) => setLastName(e.target.value)}/>
                </div>

                <p>Designated Office:</p>
                <div className="input-new">
                  <input type="text" id="office" required 
                  onChange={(e) => setOffice(e.target.value)}/>
                </div>

                <p>Position:</p>
                <div className="input-new">
                  <input type="text" id="position" required
                  onChange={(e) => setPosition(e.target.value)} />
                </div>

                <p>Email:</p>
                <div className="input-new">
                  <input type="email" id="email" required 
                  onChange={(e) => setEmail(e.target.value)}/>
                </div>

                <p>Password:</p>
                <div className="input-new">
                  <input type="password" id="password" required 
                  onChange={(e) => setPassword(e.target.value)}/>
                </div>
              </div>
              <div className="adduserbuttons">
                <div className="ClearButton">
                  <button type="button" onClick={() => {
                    setFirstName("");
                    setLastName("");
                    setEmail("");
                    setPassword("");
                    setPosition("");
                    setOffice("");
                  }}>Clear</button>
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
    </>
  );
};

export default AddUsers;
