import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { BrowserRouter } from "react-router-dom";


// Configure Amplify with AWS exports
Amplify.configure(awsExports);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App /> {/* Rendering App component first */}
    </BrowserRouter>
  </React.StrictMode>
);
