import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import axios from 'axios'; // Import axios
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

// Configure Axios base URL using environment variable
// In development, this will be '/' (to use the proxy)
// In production, this will be 'https://nfact.onrender.com'
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

console.log('Axios baseURL set to:', axios.defaults.baseURL); // Optional: Log for verification

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap App with BrowserRouter */}
      <AuthProvider> {/* Wrap App with AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
