import React, { useRef, useState } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import "../navigation/newcontent.css";
import { Link } from "react-router-dom";
import logo from "../assets/kabankalan-logo.png";
import SampleQRcode from "../assets/sample-qrcode.jpg";
import { RiArrowGoBackFill } from "react-icons/ri";

const ViewCompleted = () => {
  const data = [
    {
      date: "07/10/2024",
      title: "OJT Application",
      sender: "Adam White",
      officefrom: "HR Section",
      receipient: "Kyle Bryan",
      officeto: "GovNet",
      status: "Completed",
      codenum: "12345678",
    },
  ];

  const dummylogs = [
    {
      status: "Received",
      datetime: "08/09/2024, 8:55:12 AM",
      from: "Adam White",
      receipient: "Kyle Bryan",
      title: "Sample Title",
      remarks:
        "Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      status: "Forwarded",
      datetime: "08/09/2024, 9:07:42 AM",
      from: "Adam White",
      receipient: "Adam White",
      title: "Sample Title",
      remarks:
        "Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      status: "Completed",
      datetime: "08/10/2024, 3:28:55 PM",
      from: "Adam White",
      receipient: "Adam White",
      title: "Sample Title",
      remarks:
        "Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ];

  const componentRef = useRef();

  const handlePrint = () => {
    const printContents = componentRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload the page to restore original content
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

  return (
    <>
      <Header />
      <SidePanel />
      <div>
        <div className="MainPanel">
          <div className="PanelWrapper">
            <div className="PanelHeader">
              <div className="filter vd">
                <Link to="/completed">
                  <button className="back-btn">
                    <Tooltip text={"Click to go back, Completed"}>
                      <RiArrowGoBackFill className="back-icon" />
                    </Tooltip>
                  </button>
                </Link>
                <p>View Document</p>
              </div>
            </div>

            <div className="view-doc-info" ref={componentRef}>
              <div className="doc-header">
                <img src={logo} alt="logo"></img>
                <div className="doc-header-title">
                  <h3>City Government of Kabankalan</h3>
                  <p>Document Routing Slip</p>
                </div>
              </div>

              <p>
                <small>
                  Control Number:
                  <strong> {data[0].codenum}</strong>
                </small>
              </p>
              <div className="docu-info-head-container">
                <div className="doc-information">
                  <h4>Document Information</h4>
                  {data.map((val) => {
                    return (
                      <ul className="view-document" key={val.codenum}>
                        <li>Date: {val.date}</li>
                        <li>Title: {val.title}</li>
                        <li>From: {val.sender}</li>
                        <li>Office From: {val.officefrom}</li>
                        <li>To: {val.receipient}</li>
                        <li>Office to: {val.officeto}</li>
                        <li>Status: {val.status}</li>
                      </ul>
                    );
                  })}
                </div>
                <div className="docu-qrcode">
                  <img src={SampleQRcode} alt="QR Code"></img>
                </div>
              </div>
              <div className="docu-logs">
                <table>
                  <thead>
                    <tr>
                      <td>Date</td>
                      <td>Status</td>
                      <td>For</td>
                      <td>Remarks</td>
                    </tr>
                  </thead>
                  <tbody>
                    {dummylogs.map((val, key) => {
                      return (
                        <tr key={key}>
                          <td>{val.datetime}</td>
                          <td>{val.status}</td>
                          <td>{val.receipient}</td>
                          <td>{val.remarks}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="print-btn">
              <button onClick={handlePrint}>Print</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewCompleted;
