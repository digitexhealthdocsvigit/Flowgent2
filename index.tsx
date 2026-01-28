
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { InsForgeProvider } from '@insforge/react';
import { insforge } from './lib/insforge';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <InsForgeProvider client={insforge}>
      <App />
    </InsForgeProvider>
  </React.StrictMode>
);
