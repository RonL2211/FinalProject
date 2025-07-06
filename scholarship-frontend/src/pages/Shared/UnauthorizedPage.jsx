// src/pages/Shared/UnauthorizedPage.jsx
import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UnauthorizedPage = () => {
  const { getDefaultRoute } = useAuth();

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <Card className="text-center shadow">
        <Card.Body className="p-5">
          <div className="mb-4">
            <i className="bi bi-shield-exclamation text-warning" style={{ fontSize: '4rem' }}></i>
          </div>
          <Card.Title className="h2 text-warning mb-3">
            אין הרשאה
          </Card.Title>
          <Card.Text className="text-muted mb-4">
            אין לך הרשאה לגשת לדף זה.
            <br />
            אנא פנה למנהל המערכת או חזור לדף הבית.
          </Card.Text>
          <div className="d-flex gap-3 justify-content-center">
            <Button as={Link} to={getDefaultRoute()} variant="primary">
              <i className="bi bi-house me-2"></i>
              דף הבית
            </Button>
            <Button as={Link} to="/login" variant="outline-secondary">
              <i className="bi bi-box-arrow-in-right me-2"></i>
              התחבר מחדש
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UnauthorizedPage;