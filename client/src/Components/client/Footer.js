import React from "react";
import logo from "./assets/logo.png";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <div className="FooterContainer">
      <div className="FooterWrapper">
        <div className="company">
          <img src={logo} alt="logo"></img>
          <h1>Company Name</h1>
        </div>
        <div className="credits">
          <p>Developed by DICT Regional Office VI</p>
          <p>{`© ${year} | All Rights Reserved`}</p>
        </div>
      </div>
      <div className="LowerFooter">
        {/* <p>Developers: <br/>Harvey John Abello <br/>Julex Jones Severo</p> */}
      </div>
    </div>
  );
};

export default Footer;
