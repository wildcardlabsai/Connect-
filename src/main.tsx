import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

/* Self-hosted variable Inter: no third-party font request at runtime. */
import '@fontsource-variable/inter';

import './styles/tokens.css';
import './styles/base.css';

import { AuthProvider } from './lib/auth';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
