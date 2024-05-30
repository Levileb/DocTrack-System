import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import QrFrame from "../assets/qr-frame.svg";

const QrReader = ({ onClose, onScan }) => {
  // Pass onClose prop to signal closing the scanner
  const scanner = useRef(null);
  const videoEl = useRef(null);
  const qrBoxEl = useRef(null);
  const [qrOn, setQrOn] = useState(true);
  const [scannedResult, setScannedResult] = useState("");
  const [isScanned, setIsScanned] = useState(false);

  const onScanSuccess = (result) => {
    console.log(result);
    console.log("Scanned Result: ", result?.data);
    setScannedResult(result?.data);
    setIsScanned(true); // Set the state to indicate that code is scanned
    scanner.current.stop(); // Stop the scanner after successful scan
    alert("Scanning Successful!");
    onClose(); // Close the scanner component
    onScan(result?.data); // Call the onScan callback with scanned data
  };

  const onScanFail = (err) => {
    console.log(err);
  };

  // QR Code Scanner
  useEffect(() => {
    if (videoEl.current && !scanner.current) {
      scanner.current = new QrScanner(videoEl.current, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxEl.current || undefined,
      });

      scanner.current
        .start()
        .then(() => setQrOn(true))
        .catch((err) => {
          if (err) setQrOn(false);
        });
      console.log("Scanned Result: ", { scannedResult });
    }

    return () => {
      if (!videoEl.current) {
        scanner.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!qrOn) {
      alert(
        "Camera is blocked or not accessible. Please allow camera in your browser permissions and reload."
      );
    }
  }, [qrOn]);

  return (
    <div className="qr-reader">
      <h4>Click outside to close scanner.</h4>
      <video ref={videoEl}></video>
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
