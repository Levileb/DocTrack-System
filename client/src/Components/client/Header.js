import React, { useState, useEffect } from "react";
import logo from "./assets/kabankalan-logo.png";

const Header = () => {
  const getCurrentDateTime = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    return `${month}/${day}/${year} - ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 1000);

    return () => clearInterval(interval); // Clear the interval on component unmount
  }, []);

  return (
    <>
      {/*Header*/}
      <header>
        <nav className="header">
          <div className="logo">
            <img src={logo} alt="logo"></img>
            {/* <h1>City Government of Kabankalan</h1> */}
            <h1>Document Tracking System</h1>
          </div>
          <div className="essentials">
            {/* <h5></h5> */}
            <div className="date-time" style={{ color: "white" }}>
              <small>Philippines | {currentDateTime}</small>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
