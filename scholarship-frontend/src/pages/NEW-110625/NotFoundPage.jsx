// src/components/shared/NotFoundPage.jsx
import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <Container 
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}
      dir="rtl"
    >
      <Card className="text-center shadow-lg border-0" style={{ maxWidth: '500px' }}>
        <Card.Body className="p-5">
          {/* 404 Icon */}
          <div className="mb-4">
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle"
              style={{ 
                width: '120px', 
                height: '120px', 
                backgroundColor: '#e3f2fd',
                fontSize: '48px',
                color: '#1976d2'
              }}
            >
              <i className="bi bi-exclamation-circle"></i>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="display-1 fw-bold text-primary mb-3">404</h1>
          <h4 className="mb-3">העמוד לא נמצא</h4>
          <p className="text-muted mb-4">
            מצטערים, הדף שחיפשתם אינו קיים או שהקישור שגוי.
            <br />
            ייתכן שהעמוד הועבר או נמחק.
          </p>

          {/* Action Buttons */}
          <div className="d-flex gap-3 justify-content-center">
            <Button 
              variant="outline-secondary" 
              onClick={goBack}
              className="rounded-pill px-4"
            >
              <i className="bi bi-arrow-right me-2"></i>
              חזור
            </Button>
            <Button 
              variant="primary" 
              onClick={goHome}
              className="rounded-pill px-4"
            >
              <i className="bi bi-house-door me-2"></i>
              דף הבית
            </Button>
          </div>

          {/* Additional Help */}
          <hr className="my-4" />
          <div className="text-muted">
            <small>
              <i className="bi bi-info-circle me-1"></i>
              אם אתה מאמין שזו שגיאה, אנא פנה למנהל המערכת
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NotFoundPage;