import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { useGame } from './state/store';
import './index.css';

// Dev-only handle for poking at state from the console (e.g. finishing an adventure early).
if (import.meta.env.DEV) (window as unknown as { __finch: typeof useGame }).__finch = useGame;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
