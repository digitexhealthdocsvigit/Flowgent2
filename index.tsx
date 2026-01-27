
import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';
import { InsforgeProvider } from '@insforge/react';
import { insforge } from './lib/insforge';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <InsforgeProvider client={insforge}>
      <App />
    </InsforgeProvider>
  </React.StrictMode>
);
