import { useState } from 'react';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sendReset = async () => {
    if (!validateEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      alert(response.data.message || 'Check your email for the reset link');
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'Error sending reset link';
      alert(errorMessage);
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={sendReset}>Send Link</button>
    </div>
  );
}

export default ForgotPassword;
