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
  const isInitializedRef = useRef(false); // To prevent multiple initializations

  // Memoize the onScanSuccess function to avoid recreating it on every render
  const onScanSuccess = useCallback(
    (result) => {
      if (scanner.current) {
        scanner.current.stop(); // Stop the scanner after successful scan
        scanner.current.destroy(); // Properly destroy the scanner instance
        scanner.current = null;
      }
      onScan(result?.data); // Call the parent callback with the result
      onClose(); // Close the scanner component
    },
    [onClose, onScan] // Dependencies for useCallback
  );

  const onScanFail = useCallback((error) => {
    // Only log actual decode errors, not AbortErrors from video interruptions
    if (error.name !== 'AbortError') {
      console.log("Scan Error: ", error);
    }
  }, []);

  useEffect(() => {
    // Prevent multiple initializations
    if (scanner.current || !videoEl.current || isInitializedRef.current) {
      return;
    }

    isInitializedRef.current = true;

    scanner.current = new QrScanner(
      videoEl.current,
      onScanSuccess, // Success callback
      {
        onDecodeError: onScanFail, // Error callback
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxEl.current, // QR Box element
        returnDetailedScanResult: true, // Get more detailed results
      }
    );

    // Configure video element for better performance
    if (videoEl.current) {
      videoEl.current.setAttribute('autoplay', 'true');
      videoEl.current.setAttribute('muted', 'true');
      videoEl.current.setAttribute('playsinline', 'true');
    }

    scanner.current.start().catch((error) => {
      console.error("Camera Error: ", error);
      setIsCameraAccessible(false); // If camera is not accessible, display an alert
      if (scanner.current) {
        scanner.current.destroy();
        scanner.current = null;
      }
      isInitializedRef.current = false;
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

    return () => {
      if (scanner.current) {
        scanner.current.stop(); // Cleanup: Stop scanner when component unmounts
        scanner.current.destroy(); // Properly destroy the scanner instance
        scanner.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [onScanSuccess, onScanFail]); // Dependencies: Only re-run if callbacks change

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>Scan QR Code</h4>
        <button 
          onClick={onClose}
          style={{
            background: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>
      <video 
        ref={videoEl} 
        style={{ width: "100%", height: "100%" }}
        autoPlay 
        muted 
        playsInline
        willReadFrequently="true"
      ></video>
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
