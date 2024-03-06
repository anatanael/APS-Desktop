import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ToastContainer theme="colored" />
    <AppRoutes />
  </React.StrictMode>
);
