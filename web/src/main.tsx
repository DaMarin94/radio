import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "./themes/default.css";
import "./themes/retro.css";
import App from './App.tsx'

document.documentElement.setAttribute(
  "data-theme",
  localStorage.getItem("theme") ?? "retro"
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
