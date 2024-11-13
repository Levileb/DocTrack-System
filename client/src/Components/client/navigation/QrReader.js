import React, { useEffect, useRef, useState, useCallback } from "react";
import QrScanner from "qr-scanner";
import QrFrame from "../assets/qr-frame.svg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const QrReader = ({ onClose, onScan }) => {
  const videoEl = useRef(null); // For holding the video element
  const qrBoxEl = useRef(null); // For holding the QR box element
  const scanner = useRef(null); // For holding the QrScanner instance
  const [isCameraAccessible, setIsCameraAccessible] = useState(true); // To handle camera access issues

  // Memoize the onScanSuccess function to avoid recreating it on every render
  const onScanSuccess = useCallback(
    (result) => {
      // console.log("Scanned Result: ", result?.data);
      scanner.current?.stop(); // Stop the scanner after successful scan

      onScan(result?.data); // Call the parent callback with the result
      onClose(); // Close the scanner component
    },
    [onClose, onScan] // Dependencies for useCallback
  );

  const onScanFail = (error) => {
    console.log("Scan Error: ", error);
  };

  useEffect(() => {
    if (videoEl.current) {
      scanner.current = new QrScanner(
        videoEl.current,
        onScanSuccess, // Success callback
        {
          onDecodeError: onScanFail, // Error callback
          preferredCamera: "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
          overlay: qrBoxEl.current, // QR Box element
        }
      );

      scanner.current.start().catch((error) => {
        console.error("Camera Error: ", error);
        setIsCameraAccessible(false); // If camera is not accessible, display an alert
        toast.error("Camera Error. Unable to open camera.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      });
    }

    return () => {
      if (scanner.current) {
        scanner.current.stop(); // Cleanup: Stop scanner when component unmounts
      }
    };
  }, [onScanSuccess]); // Dependencies: Only re-run if onScanSuccess changes

  useEffect(() => {
    if (!isCameraAccessible) {
      toast.warning(
        "Camera is blocked or not accessible. Please check permissions and try again!",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  }, [isCameraAccessible]);

  return (
    <div className="qr-reader">
      <h4>Click outside to close the scanner.</h4>
      <video ref={videoEl} style={{ width: "100%", height: "100%" }}></video>
      <div ref={qrBoxEl} className="qr-box">
        <img
          src={QrFrame}
          alt="Qr Frame"
          width={256}
          height={256}
          className="qr-frame"
        />
      </div>
    </div>
  );
};

export default QrReader;
