// src/pages/Shared/NotFoundPage.jsx
import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NotFoundPage = () => {
  const { getDefaultRoute, isAuthenticated } = useAuth();

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <Card className="text-center shadow">
        <Card.Body className="p-5">
          <div className="mb-4">
            <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
          </div>
          <Card.Title className="h1 text-danger mb-3">
            404
          </Card.Title>
          <Card.Text className="h4 text-muted mb-4">
            הדף לא נמצא
          </Card.Text>
          <Card.Text className="text-muted mb-4">
            הדף שחיפשת לא קיים או הועבר למקום אחר.
          </Card.Text>
          <div className="d-flex gap-3 justify-content-center">
            {isAuthenticated ? (
              <Button as={Link} to={getDefaultRoute()} variant="primary">
                <i className="bi bi-house me-2"></i>
                דף הבית
              </Button>
            ) : (
              <Button as={Link} to="/login" variant="primary">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                התחבר
              </Button>
            )}
            <Button onClick={() => window.history.back()} variant="outline-secondary">
              <i className="bi bi-arrow-right me-2"></i>
              חזור
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NotFoundPage;
