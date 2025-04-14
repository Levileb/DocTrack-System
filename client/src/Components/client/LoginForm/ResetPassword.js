import React, { useState } from "react";

import axios from "axios";
import { useSearchParams } from "react-router-dom";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!newPassword) {
            setError("New password is required");
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/reset-password`, {
                token,
                newPassword,
            });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error || "An error occurred");
        }
    };

    return (
        <div className="reset-password-form">
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="newPassword">New Password:</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Reset Password</button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default ResetPassword;
