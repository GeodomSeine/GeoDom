import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const Root = () => {

  return (
    <App />
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
