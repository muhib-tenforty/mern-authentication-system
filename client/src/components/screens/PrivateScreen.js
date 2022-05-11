import { useState, useEffect } from "react";
import axios from "axios";
import "./PrivateScreen.css";
import { useHistory } from "react-router-dom";

const PrivateScreen = () => {
  const [error, setError] = useState("");
  const [privateData, setPrivateData] = useState("");
  const history = useHistory();
  useEffect(() => {
    const fetchPrivateDate = async () => {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      };

      try {
        const { data } = await axios.get("/api/private", config);
        setPrivateData(data.data);
      } catch (error) {
        localStorage.removeItem("authToken");
        setError("You are not authorized please login");
      }
    };

    fetchPrivateDate();
  }, []);

const logout = () => {
  localStorage.removeItem("authToken");
  history.push("/");
}

  return error ? (
    <span className="error-message">{error}</span>
  ) : (
    <div className="private-screen">
      <div>
        <img className="private-screen__img" src="./welcome.png" alt="#"/>
        <div className="private-screen__logout">
        <button type="submit" className="btn btn-primary" onClick={() => logout()}>
          Logout
        </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateScreen;
