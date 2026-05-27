import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "./themes/default.css";
import App from './App.tsx'

document.documentElement.setAttribute(
  "data-theme",
  "default"
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
