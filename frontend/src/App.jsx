import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AppRouter from "./app/router";
import "./index.css";
import "./styles/toast.css";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-white">
        <AppRouter />
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={true} // Changed to true to remove the loading bar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
