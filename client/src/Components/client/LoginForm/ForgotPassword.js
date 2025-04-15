import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from "../Footer";
import './ResetPassword.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sendReset = async () => {
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true); // Set loading to true
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      toast.success(response.data.message || 'Check your email for the reset link');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error sending reset link';
      toast.error(errorMessage);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      
      <button className="back-button" onClick={() => navigate('/login')}>
        &larr; Back to Login
      </button>

      <div className="reset-password-container">
        <h2>Forgot Password</h2>
        <form className="reset-password-form" onSubmit={(e) => { e.preventDefault(); sendReset(); }}>
          <div className="input-group">
            <div className="password-wrapper">
              <input
                id="email"
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Link'}
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
}

export default ForgotPassword;
