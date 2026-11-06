import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept transient IndexedDB lifecycle errors occurring when tabs/iframes are backgrounded or closing
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event?.reason?.message || event?.reason || '');
    if (
      reasonStr.includes('Database is closing/hidden') || 
      reasonStr.includes('closing/hidden') || 
      reasonStr.includes('database connection is closing')
    ) {
      event.preventDefault();
      console.warn('[Storage] Intercepted transient IndexedDB closing/hidden event:', reasonStr);
    }
  });

  window.addEventListener('error', (event) => {
    const errorStr = String(event?.message || event?.error?.message || '');
    if (
      errorStr.includes('Database is closing/hidden') || 
      errorStr.includes('closing/hidden') || 
      errorStr.includes('database connection is closing')
    ) {
      event.preventDefault();
      console.warn('[Storage] Intercepted transient IndexedDB error:', errorStr);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
