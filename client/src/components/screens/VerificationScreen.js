import { useState , useEffect} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./RegisterScreen.css";

const VerificationScreen = ({ history }) => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(()=> {
      setEmail(localStorage.getItem('email'));
  },[])

  const verificationHandler = async (e) => {
    e.preventDefault();

    const config = {
      header: {
        "Content-Type": "application/json",
      },
    };

    if (otp.length < 4) {
      setOtp("");
      setTimeout(() => {
        setError("");
      }, 5000);
      return setError("Please enter valid OTP");
    }

    try {
      const { data } = await axios.post(
        "/api/auth/verify-otp",
        {
          email,
          otp,
        },
        config
      );
    console.log('data.token', data.token);
    localStorage.setItem("authToken", data.token);
    localStorage.removeItem("email");

      history.push("/");
    } catch (error) {
      setError(error.response.data.error);
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  return (
    <div className="register-screen">
      <form onSubmit={verificationHandler} className="register-screen__form">
        <h3 className="register-screen__title">Verify OTP</h3>
        {error && <span className="error-message">{error}</span>}
        <div className="form-group">
          <label htmlFor="otp">OTP:</label>
          <input
            type="text"
            required
            id="otp"
            maxLength={4}
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>
        
        <button type="submit" className="btn btn-primary">
          Submit OTP
        </button>
      </form>
    </div>
  );
};

export default VerificationScreen;
