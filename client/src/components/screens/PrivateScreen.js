import { useState, useEffect } from "react";
import axios from "axios";
import "./PrivateScreen.css";
import { useHistory } from "react-router-dom";
import Navbar from "../common/Navbar";

const PrivateScreen = () => {
  const history = useHistory();
  const [error, setError] = useState("");
  const [privateData, setPrivateData] = useState("");
  const [formNo, setFormNo] = useState(0);
  const [keyApi, setKeyApi] = useState("");
  const [secretApi, setSecretApi] = useState("");

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

  const formHandler = async (e) => {
    e.preventDefault();
    const config = {
      header: {
        "Content-Type": "application/json",
      },
    };
    // if (password !== confirmpassword) {
    //   setPassword("");
    //   setConfirmPassword("");
    //   setTimeout(() => {
    //     setError("");
    //   }, 5000);
    //   return setError("Passwords do not match");
    // }
    console.log('payload:', keyApi);

    try {
      const { data } = await axios.post(
        formNo == 1 ? '/api/auth/key-api' : '/api/auth/secret-api',
        formNo == 1 ? {keyApi, email: localStorage.getItem('email')} : {secretApi, email: localStorage.getItem('email')},
        config
      );

      console.log('data:', data);

      if(formNo == 2) {
        setFormNo(0);
        setKeyApi("");
        setSecretApi("");
      }
      else setFormNo(formNo + 1);

    } catch (error) {
      setError(error.response.data.error);
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

const logout = () => {
  localStorage.removeItem("authToken");
  history.push("/");
}

const changeForm = () => {
  setFormNo(formNo + 1);
}

  return error ? (
    <span className="error-message">{error}</span>
  ) : (
    <div>
      <Navbar/>
        <div className="private-screen">
        <div>
          {formNo == 0 ? 
          <img className="private-screen__img" src="./welcome.png" alt="#"/>
          : 
         <form onSubmit={formHandler} className="private-screen__form">
          <h3 className="private-screen__title">{formNo == 1 ? 'API KEY' : formNo == 2 ? "SECRET KEY" : null}</h3>
          {error && <span className="error-message">{error}</span>}
          <div className="form-group">
            {formNo == 1 ? 
            <>
            <label htmlFor="keyApi">Key API:</label>
            <input
              type="text"
              required
              id="keyApi"
              placeholder="Enter Key API"
              value={keyApi}
              onChange={(e) => setKeyApi(e.target.value)}
            />
            </>
            : formNo == 2 ? 
            <>
            <label htmlFor="secretApi">Secret API:</label>
            <input
              type="text"
              required
              id="secretApi"
              placeholder="Enter Secret API"
              value={secretApi}
              onChange={(e) => setSecretApi(e.target.value)}
            />
            </>
            : null
            }
          </div>
          {formNo > 0 && 
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
          }
        </form>
      }
      {
        formNo < 2 && 
          <div className="private-screen__button">
            <button type="submit" className="btn btn-primary" onClick={changeForm}>
              {formNo == 0 ? 'API Key' : formNo == 1 ? 'Secret Key' : null} &#x2192;
            </button>
          </div>
      }
        </div>
      </div>  
    </div>
  );
};

export default PrivateScreen;
