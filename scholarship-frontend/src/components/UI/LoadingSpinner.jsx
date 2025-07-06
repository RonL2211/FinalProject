// src/components/UI/LoadingSpinner.jsx
import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'טוען...' }) => {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <div className="mt-2">{message}</div>
      </div>
    </Container>
  );
};

export default LoadingSpinner;
