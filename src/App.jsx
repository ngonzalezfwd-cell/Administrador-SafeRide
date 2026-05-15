import React from 'react';
import Routing from './routes/routing';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Routing />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
