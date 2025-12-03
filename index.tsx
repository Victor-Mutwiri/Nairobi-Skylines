import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Fix for generic JSX element type issues across the project
// This ensures that all HTML tags (div, span, etc.) and R3F tags (mesh, ambientLight, etc.)
// are treated as valid intrinsic elements by TypeScript.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);