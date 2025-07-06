// src/components/Layout/Layout.jsx
import React from 'react';
import { Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import AppNavbar from './AppNavbar';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-vh-100 bg-light" dir="rtl">
      {isAuthenticated && <AppNavbar />}
      <main style={{ paddingTop: isAuthenticated ? '80px' : '0' }}>
        <Container fluid className="py-4">
          {children}
        </Container>
      </main>
    </div>
  );
};

export default Layout;