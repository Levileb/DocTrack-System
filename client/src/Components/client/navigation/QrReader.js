import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import QrFrame from "../assets/qr-frame.svg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const QrReader = ({ onClose, onScan }) => {
  const videoEl = useRef(null);
  const qrBoxEl = useRef(null);
  const scanner = useRef(null);
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);
  const [isCameraAccessible, setIsCameraAccessible] = useState(true);

  // Create stable references for callbacks
  const onScanSuccessRef = useRef(null);
  const onScanFailRef = useRef(null);

  // Update callback refs when props change
  useEffect(() => {
    onScanSuccessRef.current = (result) => {
      if (!isMountedRef.current) return;
      
      if (scanner.current) {
        try {
          scanner.current.stop();
          scanner.current.destroy();
        } catch (error) {
          console.log("Scanner cleanup error:", error);
        }
        scanner.current = null;
      }
      isInitializedRef.current = false;
      onScan(result?.data);
      onClose();
    };

    onScanFailRef.current = (error) => {
      // Only log actual decode errors, not AbortErrors from video interruptions
      if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
        console.log("Scan Error: ", error);
      }
    };
  }, [onClose, onScan]);

  // Initialize scanner only once
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current || !videoEl.current) {
      return;
    }

    const initializeScanner = async () => {
      try {
        isInitializedRef.current = true;

        // Create scanner with stable callback references
        scanner.current = new QrScanner(
          videoEl.current,
          (result) => onScanSuccessRef.current?.(result),
          {
            onDecodeError: (error) => onScanFailRef.current?.(error),
            preferredCamera: "environment",
            highlightScanRegion: true,
            highlightCodeOutline: true,
            overlay: qrBoxEl.current,
            returnDetailedScanResult: true,
          }
        );

        // Configure video element for better performance
        if (videoEl.current) {
          videoEl.current.setAttribute('autoplay', 'true');
          videoEl.current.setAttribute('muted', 'true');
          videoEl.current.setAttribute('playsinline', 'true');
          videoEl.current.setAttribute('willReadFrequently', 'true');
        }

        // Start scanner
        await scanner.current.start();
        
      } catch (error) {
        console.error("Camera initialization error:", error);
        if (isMountedRef.current) {
          setIsCameraAccessible(false);
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
        }
        
        if (scanner.current) {
          try {
            scanner.current.destroy();
          } catch (destroyError) {
            console.log("Scanner destroy error:", destroyError);
          }
          scanner.current = null;
        }
        isInitializedRef.current = false;
      }
    };

    initializeScanner();

    return () => {
      isMountedRef.current = false;
      if (scanner.current) {
        try {
          scanner.current.stop();
          scanner.current.destroy();
        } catch (error) {
          console.log("Scanner cleanup error:", error);
        }
        scanner.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array - run only once

  // Handle camera accessibility changes
  useEffect(() => {
    if (!isCameraAccessible && isMountedRef.current) {
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Manual close handler
  const handleClose = () => {
    isMountedRef.current = false;
    if (scanner.current) {
      try {
        scanner.current.stop();
        scanner.current.destroy();
      } catch (error) {
        console.log("Scanner close error:", error);
      }
      scanner.current = null;
    }
    isInitializedRef.current = false;
    onClose();
  };

  return (
    <div className="qr-reader">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>Scan QR Code</h4>
        <button 
          onClick={handleClose}
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
