import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// GitHub Pages no permite X-Frame-Options; esto frena el clickjacking básico.
try {
  if (window.top && window.top !== window.self) {
    window.top.location.href = window.self.location.href;
  }
} catch {
  /* si el navegador bloquea el acceso, no rompemos la app */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
