// src/pages/Manager/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Table, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formService } from '../../services/formService';
import { instanceService } from '../../services/instanceService';
import { appealService } from '../../services/appealService';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';
import Swal from 'sweetalert2';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    systemStats: {},
    recentForms: [],
    pendingAppeals: [],
    recentUsers: [],
    alerts: []
  });
  const [quickAppeal, setQuickAppeal] = useState(null);
  const [appealResponse, setAppealResponse] = useState('');
  const [appealDecision, setAppealDecision] = useState('');
  const [showQuickAppealModal, setShowQuickAppealModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת נתונים מרכזיים
      const [forms, appeals, users] = await Promise.all([
        formService.getAllForms().catch(() => []),
        appealService.getPendingAppeals().catch(() => []),
        userService.getAllUsers().catch(() => [])
      ]);

      // חישוב סטטיסטיקות מערכת
      const systemStats = {
        totalForms: forms.length,
        activeForms: forms.filter(f => f.isActive && f.isPublished).length,
        draftForms: forms.filter(f => !f.isPublished).length,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        pendingAppeals: appeals.length,
        totalInstances: 0 // יתעדכן אם יש API
      };

      // ערעורים ממתינים (עד 5 האחרונים)
      const pendingAppeals = appeals
        .sort((a, b) => new Date(b.appealDate) - new Date(a.appealDate))
        .slice(0, 5);

      // טפסים אחרונים
      const recentForms = forms
        .sort((a, b) => new Date(b.lastModifiedDate) - new Date(a.lastModifiedDate))
        .slice(0, 5);

      // משתמשים חדשים
      const recentUsers = users
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
        .slice(0, 3);

      // התראות מערכת
      const alerts = [];
      if (appeals.length > 0) {
        alerts.push({
          type: 'warning',
          message: `יש ${appeals.length} ערעורים הממתינים לטיפול`,
          action: '/manager/appeals'
        });
      }
      if (systemStats.draftForms > 0) {
        alerts.push({
          type: 'info',
          message: `יש ${systemStats.draftForms} טפסים שטרם פורסמו`,
          action: '/manager/forms'
        });
      }

      setDashboardData({
        systemStats,
        recentForms,
        pendingAppeals,
        recentUsers,
        alerts
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
const handlePublishForm = async (formId) => {
    setProcessing(true);
    try {
      await formService.publishForm(formId);
Swal.fire({
  icon: 'success',
  title: 'פורסם בהצלחה',
  text: 'הטופס פורסם בהצלחה',
  confirmButtonText: 'אוקי'
}).then(() => {
  loadDashboardData();
});

      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };
  const handleQuickAppealResponse = async () => {
    if (!quickAppeal || !appealDecision) return;

    setProcessing(true);
    try {
      const isApproved = appealDecision === 'approve';
      await appealService.respondToAppeal(quickAppeal.appealID, isApproved, appealResponse);
      
      // רענון הנתונים
      await loadDashboardData();
      
      // סגירת המודל
      setShowQuickAppealModal(false);
      setQuickAppeal(null);
      setAppealResponse('');
      setAppealDecision('');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'לא זמין';
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',  
      day: 'numeric'
    });
  };

  const getFormStatusBadge = (form) => {
    if (!form.isActive) {
      return <Badge bg="secondary">לא פעיל</Badge>;
    }
    if (!form.isPublished) {
      return <Badge bg="warning">טיוטה</Badge>;
    }
    return <Badge bg="success">פעיל</Badge>;
  };

  const getRoleBadge = (roles) => {
    if (!roles || roles.length === 0) return <Badge bg="light" text="dark">לא מוקצה</Badge>;
    
    const roleNames = roles.map(r => r.roleName || r.RoleName);
    const primaryRole = roleNames.includes('מנהל סטודנטים') ? 'מנהל סטודנטים' :
                       roleNames.includes('דיקאן') ? 'דיקאן' :
                       roleNames.includes('ראש מחלקה') ? 'ראש מחלקה' :
                       roleNames[0];
    
    const variant = primaryRole === 'מנהל סטודנטים' ? 'danger' :
                   primaryRole === 'דיקאן' ? 'primary' :
                   primaryRole === 'ראש מחלקה' ? 'info' : 'success';
    
    return <Badge bg={variant}>{primaryRole}</Badge>;
  };

  if (loading) return <LoadingSpinner message="טוען לוח בקרה..." />;

  return (
    <Container>
      {/* כותרת ראשית */}
      <Row className="mb-4">
        <Col>
          <Card className="bg-gradient-primary text-white border-0">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <h1 className="mb-1">
                    <i className="bi bi-speedometer2 me-2"></i>
                    לוח בקרה מנהל המערכת
                  </h1>
                  <p className="mb-0 opacity-75">
                    שלום {user?.firstName} {user?.lastName} - ניהול מערכת הצטיינות מרצים
                  </p>
                </Col>
                <Col xs="auto">
                  <div className="text-center">
                    <i className="bi bi-gear-fill" style={{ fontSize: '3rem', opacity: 0.7 }}></i>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* התראות מערכת */}
      {dashboardData.alerts.length > 0 && (
        <Row className="mb-4">
          <Col>
            {dashboardData.alerts.map((alert, index) => (
              <Alert 
                key={index} 
                variant={alert.type} 
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <i className={`bi ${alert.type === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle'} me-2`}></i>
                  {alert.message}
                </div>
                {alert.action && (
                  <Button 
                    as={Link} 
                    to={alert.action} 
                    variant={`outline-${alert.type}`} 
                    size="sm"
                  >
                    טפל עכשיו
                  </Button>
                )}
              </Alert>
            ))}
          </Col>
        </Row>
      )}

      {error && (
        <Row className="mb-4">
          <Col>
            <ErrorAlert error={error} onRetry={loadDashboardData} />
          </Col>
        </Row>
      )}

      {/* סטטיסטיקות ראשיות */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-left-primary">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    טפסים במערכת
                  </div>
                  <div className="h5 mb-0 text-gray-800">
                    {dashboardData.systemStats.totalForms}
                  </div>
                </Col>
                <Col xs="auto">
                  <i className="bi bi-file-text text-primary" style={{ fontSize: '2rem' }}></i>
                </Col>
              </Row>
              <div className="mt-2">
                <small className="text-success">
                  {dashboardData.systemStats.activeForms} פעילים
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-left-success">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    משתמשים במערכת
                  </div>
                  <div className="h5 mb-0 text-gray-800">
                    {dashboardData.systemStats.totalUsers}
                  </div>
                </Col>
                <Col xs="auto">
                  <i className="bi bi-people text-success" style={{ fontSize: '2rem' }}></i>
                </Col>
              </Row>
              <div className="mt-2">
                <small className="text-success">
                  {dashboardData.systemStats.activeUsers} פעילים
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-left-warning">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    ערעורים ממתינים
                  </div>
                  <div className="h5 mb-0 text-gray-800">
                    {dashboardData.systemStats.pendingAppeals}
                  </div>
                </Col>
                <Col xs="auto">
                  <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '2rem' }}></i>
                </Col>
              </Row>
              <div className="mt-2">
                {dashboardData.systemStats.pendingAppeals > 0 ? (
                  <small className="text-warning">דורש טיפול</small>
                ) : (
                  <small className="text-success">הכל מטופל</small>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-left-info">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    טפסים בטיוטה
                  </div>
                  <div className="h5 mb-0 text-gray-800">
                    {dashboardData.systemStats.draftForms}
                  </div>
                </Col>
                <Col xs="auto">
                  <i className="bi bi-file-earmark-text text-info" style={{ fontSize: '2rem' }}></i>
                </Col>
              </Row>
              <div className="mt-2">
                <small className="text-muted">טרם פורסמו</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* ערעורים ממתינים */}
        <Col xl={8} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="bi bi-megaphone me-2 text-warning"></i>
                ערעורים ממתינים לטיפול
              </h6>
              <Button as={Link} to="/manager/appeals" variant="outline-primary" size="sm">
                צפה בכולם
              </Button>
            </Card.Header>
            <Card.Body>
              {dashboardData.pendingAppeals.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-2 mb-0">אין ערעורים ממתינים</p>
                  <small>כל הערעורים טופלו</small>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>מרצה</th>
                        <th>טופס</th>
                        <th>תאריך ערעור</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.pendingAppeals.map((appeal) => (
                        <tr key={appeal.appealID}>
                          <td>
                            <div>
                              <strong>{appeal.firstName} {appeal.lastName}</strong>
                              <div className="small text-muted">{appeal.userID}</div>
                            </div>
                          </td>
                          <td>
                            <div>
                              {appeal.formName || `טופס ${appeal.formId}`}
                              <div className="small text-muted">
                                מופע #{appeal.instanceId}
                              </div>
                            </div>
                          </td>
                          <td>{formatDate(appeal.appealDate)}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => {
                                  setQuickAppeal(appeal);
                                  setShowQuickAppealModal(true);
                                }}
                              >
                                <i className="bi bi-lightning me-1"></i>
                                טפל מהר
                              </Button>
                              <Button
                                as={Link}
                                to={`/manager/appeals#appeal-${appeal.appealID}`}
                                variant="outline-primary"
                                size="sm"
                              >
                                <i className="bi bi-eye me-1"></i>
                                פרטים
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* פעולות מהירות */}
        <Col xl={4} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                פעולות מהירות
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button
                  as={Link}
                  to="/manager/forms/new"
                  variant="primary"
                  size="lg"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  צור טופס חדש
                </Button>

                <Button
                  as={Link}
                  to="/manager/appeals"
                  variant="warning"
                  size="lg"
                  className="position-relative"
                >
                  <i className="bi bi-megaphone me-2"></i>
                  ערעורים
                  {dashboardData.systemStats.pendingAppeals > 0 && (
                    <Badge 
                      bg="danger" 
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {dashboardData.systemStats.pendingAppeals}
                    </Badge>
                  )}
                </Button>

                <Button
                  as={Link}
                  to="/manager/users"
                  variant="info"
                  size="lg"
                >
                  <i className="bi bi-people me-2"></i>
                  ניהול משתמשים
                </Button>

                <Button
                  as={Link}
                  to="/manager/forms"
                  variant="secondary"
                  size="lg"
                >
                  <i className="bi bi-files me-2"></i>
                  ניהול טפסים
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* משתמשים חדשים */}
          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-person-plus me-2"></i>
                משתמשים חדשים
              </h6>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentUsers.length === 0 ? (
                <div className="text-center py-2 text-muted">
                  <small>אין משתמשים חדשים</small>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {dashboardData.recentUsers.map((user) => (
                    <div key={user.personId} className="list-group-item px-0 py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold">{user.firstName} {user.lastName}</div>
                          <small className="text-muted">{user.email}</small>
                        </div>
                        <div className="text-end">
                          {getRoleBadge(user.roles)}
                          <div className="small text-muted">
                            {formatDate(user.createdDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* טפסים אחרונים */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="bi bi-file-text me-2"></i>
                טפסים אחרונים
              </h6>
              <Button as={Link} to="/manager/forms" variant="outline-primary" size="sm">
                צפה בכולם
              </Button>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentForms.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-file-plus" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-2 mb-0">אין טפסים במערכת</p>
                  <Button as={Link} to="/manager/forms/new" variant="primary" className="mt-2">
                    צור טופס ראשון
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>שם הטופס</th>
                        <th>תאריך יצירה</th>
                        <th>עדכון אחרון</th>
                        <th>סטטוס</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentForms.map((form) => (
                        <tr key={form.formID}>
                          <td>
                            <div>
                              <strong>{form.formName}</strong>
                              {form.description && (
                                <div className="small text-muted">{form.description}</div>
                              )}
                            </div>
                          </td>
                          <td>{formatDate(form.creationDate)}</td>
                          <td>{formatDate(form.lastModifiedDate)}</td>
                          <td>{getFormStatusBadge(form)}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                as={Link}
                                to={`/manager/forms/edit/${form.formID}`}
                                variant="outline-primary"
                                size="sm"
                              >
                                <i className="bi bi-pencil me-1"></i>
                                ערוך
                              </Button>
                              {!form.isPublished && (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handlePublishForm(form.formID)}
                                >
                                  <i className="bi bi-upload me-1"></i>
                                  פרסם
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal טיפול מהיר בערעור */}
      <Modal show={showQuickAppealModal} onHide={() => setShowQuickAppealModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-lightning me-2"></i>
            טיפול מהיר בערעור
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {quickAppeal && (
            <>
              <div className="mb-3">
                <h6>פרטי הערעור:</h6>
                <div className="bg-light p-3 rounded">
                  <div><strong>מרצה:</strong> {quickAppeal.firstName} {quickAppeal.lastName}</div>
                  <div><strong>טופס:</strong> {quickAppeal.formName || `טופס ${quickAppeal.formId}`}</div>
                  <div><strong>תאריך ערעור:</strong> {formatDate(quickAppeal.appealDate)}</div>
                  <div className="mt-2">
                    <strong>נימוק הערעור:</strong>
                    <div className="mt-1 p-2 bg-white border rounded">
                      {quickAppeal.appealReason}
                    </div>
                  </div>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label><strong>החלטה</strong></Form.Label>
                <div>
                  <Form.Check
                    type="radio"
                    id="approve-appeal"
                    name="appealDecision"
                    label="אשר את הערעור"
                    value="approve"
                    checked={appealDecision === 'approve'}
                    onChange={(e) => setAppealDecision(e.target.value)}
                  />
                  <Form.Check
                    type="radio"
                    id="reject-appeal"
                    name="appealDecision"
                    label="דחה את הערעור"
                    value="reject"
                    checked={appealDecision === 'reject'}
                    onChange={(e) => setAppealDecision(e.target.value)}
                  />
                </div>
              </Form.Group>

              <Form.Group>
                <Form.Label><strong>תגובה/הנמקה</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={appealResponse}
                  onChange={(e) => setAppealResponse(e.target.value)}
                  placeholder="הוסף הסבר להחלטה..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuickAppealModal(false)} disabled={processing}>
            ביטול
          </Button>
          <Button 
            variant={appealDecision === 'approve' ? 'success' : 'danger'} 
            onClick={handleQuickAppealResponse}
            disabled={processing || !appealDecision}
          >
            {processing ? (
              <>
                <i className="spinner-border spinner-border-sm me-2"></i>
                מעבד...
              </>
            ) : (
              <>
                <i className={`bi ${appealDecision === 'approve' ? 'bi-check' : 'bi-x'} me-2`}></i>
                {appealDecision === 'approve' ? 'אשר ערעור' : 'דחה ערעור'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* CSS נוסף לעיצוב */}
      <style jsx>{`
        .border-left-primary { border-left: 4px solid #007bff !important; }
        .border-left-success { border-left: 4px solid #28a745 !important; }
        .border-left-warning { border-left: 4px solid #ffc107 !important; }
        .border-left-info { border-left: 4px solid #17a2b8 !important; }
        
        .bg-gradient-primary {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
        }
        
        .text-xs {
          font-size: 0.75rem;
        }
        
        .font-weight-bold {
          font-weight: 700;
        }
        
        .text-gray-800 {
          color: #5a5c69;
        }
      `}</style>
    </Container>
  );
};

export default ManagerDashboard;