import React from "react";
import logo from "./assets/dict-logo.png";
import logo2 from "./assets/kabankalan-logo.png";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <div className="FooterContainer">
      <div className="FooterWrapper">
        <div className="company">
          <img src={logo} alt="logo"></img>
          <img src={logo2} alt="logo"></img>
          <h2>City Government of Kabankalan</h2>
        </div>
        <div className="credits">
          <p>Developed by DICT Regional Office VI</p>
          <p>{`© ${year} | All Rights Reserved`}</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
