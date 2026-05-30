import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { DataProvider } from './context/DataContext';
import AppRoutes from './routes';

function App() {
  return (
    <DataProvider>
      <Router>
        <Toaster position="top-right" richColors closeButton duration={3000} />
        <AppRoutes />
      </Router>
    </DataProvider>
  );
}

export default App;
