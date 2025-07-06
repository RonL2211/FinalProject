// src/pages/Lecturer/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { instanceService } from '../../services/instanceService';
import { formService } from '../../services/formService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const LecturerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    myForms: [],
    availableForms: [],
    stats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת הטפסים שלי
      const myFormsData = await instanceService.getUserInstances(user.personId);
      
      // טעינת טפסים זמינים
      const allForms = await formService.getAllForms();
      const availableForms = allForms.filter(form => form.isPublished && form.isActive);

      // חישוב סטטיסטיקות
      const stats = calculateStats(myFormsData);

      setDashboardData({
        myForms: myFormsData.slice(0, 5), // 5 האחרונים
        availableForms: availableForms.slice(0, 3), // 3 הראשונים
        stats
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (forms) => {
    const stats = {
      total: forms.length,
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      underAppeal: 0
    };

    forms.forEach(form => {
      switch (form.currentStage) {
        case 'Draft':
          stats.draft++;
          break;
        case 'Submitted':
        case 'ApprovedByDepartment':
        case 'ApprovedByDean':
          stats.submitted++;
          break;
        case 'FinalApproved':
        case 'AppealApproved':
          stats.approved++;
          break;
        case 'Rejected':
        case 'AppealRejected':
          stats.rejected++;
          break;
        case 'UnderAppeal':
          stats.underAppeal++;
          break;
        default:
          break;
      }
    });

    return stats;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Draft': { variant: 'secondary', text: 'טיוטה' },
      'Submitted': { variant: 'info', text: 'הוגש' },
      'ApprovedByDepartment': { variant: 'primary', text: 'אושר במחלקה' },
      'ApprovedByDean': { variant: 'primary', text: 'אושר בפקולטה' },
      'FinalApproved': { variant: 'success', text: 'אושר סופית' },
      'Rejected': { variant: 'danger', text: 'נדחה' },
      'UnderAppeal': { variant: 'warning', text: 'בערעור' },
      'AppealApproved': { variant: 'success', text: 'ערעור אושר' },
      'AppealRejected': { variant: 'danger', text: 'ערעור נדחה' }
    };

    const config = statusMap[status] || { variant: 'light', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  if (loading) return <LoadingSpinner message="טוען את לוח הבקרה..." />;

  return (
    <Container>
      {/* כותרת ברכה */}
      <Row className="mb-4">
        <Col>
          <Card className="bg-primary text-white">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <h2 className="mb-1">שלום {user?.firstName} {user?.lastName}!</h2>
                  <p className="mb-0 opacity-75">ברוך הבא למערכת הצטיינות מרצים</p>
                </Col>
                <Col xs="auto">
                  <i className="bi bi-person-circle" style={{ fontSize: '3rem' }}></i>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <ErrorAlert error={error} onRetry={loadDashboardData} />
          </Col>
        </Row>
      )}

      {/* סטטיסטיקות מהירות */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="card-hover h-100">
            <Card.Body className="text-center">
              <i className="bi bi-file-earmark-text text-primary" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1">{dashboardData.stats.total}</h3>
              <small className="text-muted">סך הכל טפסים</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="card-hover h-100">
            <Card.Body className="text-center">
              <i className="bi bi-clock text-warning" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1">{dashboardData.stats.draft}</h3>
              <small className="text-muted">טיוטות</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="card-hover h-100">
            <Card.Body className="text-center">
              <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1">{dashboardData.stats.approved}</h3>
              <small className="text-muted">אושרו</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="card-hover h-100">
            <Card.Body className="text-center">
              <i className="bi bi-hourglass-split text-info" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1">{dashboardData.stats.submitted}</h3>
              <small className="text-muted">בבדיקה</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* הטפסים שלי */}
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-file-person me-2"></i>
                הטפסים שלי
              </h5>
              <Button as={Link} to="/lecturer/my-forms" variant="outline-primary" size="sm">
                צפה בכולם
              </Button>
            </Card.Header>
            <Card.Body>
              {dashboardData.myForms.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-2 mb-0">עדיין לא מילאת טפסים</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {dashboardData.myForms.map((instance) => (
                    <div key={instance.instanceId} className="list-group-item px-0">
                      <Row className="align-items-center">
                        <Col>
                          <h6 className="mb-1">{instance.formName || `טופס ${instance.formId}`}</h6>
                          <small className="text-muted">
                            נוצר: {new Date(instance.createdDate).toLocaleDateString('he-IL')}
                          </small>
                        </Col>
                        <Col xs="auto">
                          {getStatusBadge(instance.currentStage)}
                        </Col>
                        <Col xs="auto">
                          <Button
                            as={Link}
                            to={`/lecturer/my-forms#${instance.instanceId}`}
                            variant="outline-primary"
                            size="sm"
                          >
                            צפה
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* טפסים זמינים */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                טפסים זמינים
              </h5>
              <Button as={Link} to="/lecturer/forms" variant="outline-success" size="sm">
                צפה בכולם
              </Button>
            </Card.Header>
            <Card.Body>
              {dashboardData.availableForms.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-clipboard-x" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2 mb-0">אין טפסים זמינים</p>
                </div>
              ) : (
                <div className="d-grid gap-2">
                  {dashboardData.availableForms.map((form) => (
                    <Button
                      key={form.formID}
                      as={Link}
                      to={`/lecturer/fill/${form.formID}`}
                      variant="outline-success"
                      className="text-start"
                    >
                      <div>
                        <div className="fw-bold">{form.formName}</div>
                        <small className="text-muted">{form.description}</small>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* פעולות מהירות */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                פעולות מהירות
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="mb-3">
                  <Button
                    as={Link}
                    to="/lecturer/forms"
                    variant="primary"
                    size="lg"
                    className="w-100"
                  >
                    <i className="bi bi-file-plus me-2"></i>
                    מלא טופס חדש
                  </Button>
                </Col>
                <Col md={4} className="mb-3">
                  <Button
                    as={Link}
                    to="/lecturer/my-forms"
                    variant="info"
                    size="lg"
                    className="w-100"
                  >
                    <i className="bi bi-files me-2"></i>
                    הטפסים שלי
                  </Button>
                </Col>
                <Col md={4} className="mb-3">
                  <Button
                    as={Link}
                    to="/profile"
                    variant="secondary"
                    size="lg"
                    className="w-100"
                  >
                    <i className="bi bi-person-gear me-2"></i>
                    עדכון פרופיל
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LecturerDashboard;

