import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "./themes/default.css";
import "./themes/digital.css";
import "./themes/amber.css";
import "./themes/blue.css";
import "./themes/light.css";
import "./themes/warm.css";
import App from './App.tsx'
import { DeviceProvider } from './context/DeviceContext'

document.documentElement.setAttribute(
  "data-theme",
  localStorage.getItem("theme") ?? "digital"
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DeviceProvider>
      <App />
    </DeviceProvider>
  </StrictMode>,
)
