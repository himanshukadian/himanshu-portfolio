import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Analytics } from '@vercel/analytics/react';

// Error handling for root render
const renderApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
        <Analytics />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    // Fallback UI
    document.body.innerHTML = `
      <div style="
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        min-height: 100vh; 
        font-family: Arial, sans-serif;
        background: #f5f5f5;
        color: #333;
        text-align: center;
        padding: 20px;
      ">
        <h1>Application Error</h1>
        <p>Something went wrong while loading the application.</p>
        <button 
          onclick="window.location.reload()" 
          style="
            padding: 10px 20px; 
            background: #007bff; 
            color: white; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
            margin-top: 20px;
          "
        >
          Reload Page
        </button>
      </div>
    `;
  }
};

renderApp();
