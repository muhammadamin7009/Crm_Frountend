import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";

// Axios
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3001";

axios.defaults.headers.common["Content-Type"] = "application/json";
let token = localStorage.getItem("token");
if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Router
import { BrowserRouter as Router } from "react-router-dom";

// Styles
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { AuthProvider } from "./Context/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <AuthProvider>
      <App />
      <ToastContainer theme="colored" />
    </AuthProvider>
  </Router>,
);
