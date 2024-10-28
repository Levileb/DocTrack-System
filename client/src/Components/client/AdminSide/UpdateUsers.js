import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../AdminSidePanel";
import Footer from "../Footer";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateUsers = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [office, setOffice] = useState("");
  const [offices, setOffices] = useState([]); // State to store the list of offices

  useEffect(() => {
    axios
      .get(`http://localhost:3001/getUser/` + id)
      .then((result) => {
        setFirstName(result.data.firstname || "");
        setLastName(result.data.lastname || "");
        setEmail(result.data.email || "");
        setPosition(result.data.position || "");
        setOffice(result.data.office || "");
      })
      .catch((err) => console.log("Error: ", err));
  }, [id]);

  // Fetch the list of offices
  useEffect(() => {
    axios
      .get("http://localhost:3001/offices")
      .then((result) => {
        const activeOffices = result.data.filter(
          (office) => !office.isArchived
        );
        setOffices(activeOffices);
      })
      .catch((err) => console.log("Error: ", err));
  }, []);

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
      .then(() => {
        toast.success("User Updated Successfully!", {
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
        toast.error("Something went wrong, please try again!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        console.log("Error: ", err);
      });
    setTimeout(() => {
      navigate("/view-user");
    }, 2100);
  };

  const handleCancel = () => {
    navigate("/view-user");
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
                  <select
                    id="office"
                    required
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                  >
                    <option value="" disabled>
                      Select an office
                    </option>
                    {offices.map((officeItem) => (
                      <option key={officeItem._id} value={officeItem.office}>
                        {officeItem.office}
                      </option>
                    ))}
                  </select>
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

export default UpdateUsers;
