// src/components/UI/ErrorAlert.jsx
import React from 'react';
import { Alert, Button } from 'react-bootstrap';

const ErrorAlert = ({ error, onRetry, onDismiss }) => {
  return (
    <Alert variant="danger" dismissible={!!onDismiss} onClose={onDismiss}>
      <Alert.Heading>שגיאה</Alert.Heading>
      <p>{error}</p>
      {onRetry && (
        <div className="mt-3">
          <Button variant="outline-danger" onClick={onRetry}>
            נסה שוב
          </Button>
        </div>
      )}
    </Alert>
  );
};

export default ErrorAlert;