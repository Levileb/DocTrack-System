import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import "./ResetPassword.css"; // Import the external CSS
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Footer from "../Footer"; // Import the Footer component

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate(); // Initialize useNavigate
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // Add loading state

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!newPassword || !confirmPassword) {
            setError("Both fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true); // Set loading to true
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/reset-password`, {
                token,
                newPassword,
            });
            setMessage(response.data.message);
            setNewPassword("");
            setConfirmPassword("");

            // Redirect to login after a short delay
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || "An error occurred");
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    useEffect(() => {
        if (message) {
            toast.success(message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                theme: "light",
            });
        }

        if (error) {
            toast.error(error, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                theme: "light",
            });
        }
    }, [message, error]);

    return (
        <><div className="reset-password-container">
            <h2>Reset Your Password</h2>
            <form className="reset-password-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required />
                        <span onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="password-wrapper">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required />
                        <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                        <p className="error-text">Passwords do not match</p>
                    )}
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>

            <ToastContainer />
        </div><Footer /></>
    );
};

export default ResetPassword;
