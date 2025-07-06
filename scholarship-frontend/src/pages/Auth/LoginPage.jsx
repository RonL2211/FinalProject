// src/pages/Auth/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    personId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError, isAuthenticated, getDefaultRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // אם המשתמש כבר מחובר, הפנה אותו לדף הראשי שלו
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || getDefaultRoute();
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, getDefaultRoute]);

  // ניקוי שגיאות כשמתחילים להקליד
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData.personId, formData.password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.personId || !formData.password) {
      return;
    }

    try {
      const result = await login(formData.personId, formData.password);
      console.log('Login successful:', result);
      // ההפניה תקרה אוטומטית דרך useEffect למעלה
    } catch (err) {
      // השגיאה כבר מטופלת ב-AuthContext
      console.error('Login failed:', err);
    }
  };

  const isFormValid = formData.personId.length >= 9 && formData.password.length >= 1;

  return (
    <Container fluid className="vh-100 bg-light">
      <Row className="h-100 justify-content-center align-items-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              {/* לוגו וכותרת */}
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="bi bi-award text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
                <h2 className="text-primary fw-bold">RuppStar</h2>
                <p className="text-muted">מערכת הצטיינות מרצים</p>
              </div>

              {/* הצגת שגיאות */}
              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {/* טופס התחברות */}
              <Form onSubmit={handleSubmit} dir="rtl">
                <Form.Group className="mb-3">
                  <Form.Label>תעודת זהות</Form.Label>
                  <Form.Control
                    type="text"
                    name="personId"
                    value={formData.personId}
                    onChange={handleInputChange}
                    placeholder="הכנס תעודת זהות"
                    maxLength="9"
                    disabled={isLoading}
                    required
                    autoComplete="username"
                  />
                  <Form.Text className="text-muted">
                    הכנס תעודת זהות של 9 ספרות
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>סיסמה</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="הכנס סיסמה"
                      disabled={isLoading}
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      variant="link"
                      className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted"
                      style={{ border: 'none', background: 'none', zIndex: 10 }}
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </Button>
                  </div>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={!isFormValid || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          className="me-2"
                        />
                        מתחבר...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        התחבר
                      </>
                    )}
                  </Button>
                </div>
              </Form>

              {/* מידע נוסף */}
              <div className="text-center mt-4">
                <small className="text-muted">
                  מערכת הצטיינות מרצים | גרסה 1.0
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
