// src/pages/Lecturer/MyForms.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Modal, Table, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { instanceService } from '../../services/instanceService';
import { appealService } from '../../services/appealService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const MyForms = () => {
  const { user } = useAuth();
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadMyForms();
  }, []);

  const loadMyForms = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await instanceService.getUserInstances(user.personId);
      // מיון לפי תאריך עדכון אחרון
      const sortedData = data.sort((a, b) => 
        new Date(b.lastModifiedDate) - new Date(a.lastModifiedDate)
      );
      setInstances(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Draft': { 
        variant: 'secondary', 
        text: 'טיוטה', 
        icon: 'bi-pencil',
        canEdit: true,
        canSubmit: true
      },
      'Submitted': { 
        variant: 'info', 
        text: 'הוגש לבדיקה', 
        icon: 'bi-hourglass-split',
        canEdit: false,
        canSubmit: false
      },
      'ApprovedByDepartment': { 
        variant: 'primary', 
        text: 'אושר במחלקה', 
        icon: 'bi-check-circle',
        canEdit: false,
        canSubmit: false
      },
      'ApprovedByDean': { 
        variant: 'primary', 
        text: 'אושר בפקולטה', 
        icon: 'bi-check-circle-fill',
        canEdit: false,
        canSubmit: false
      },
      'FinalApproved': { 
        variant: 'success', 
        text: 'אושר סופית', 
        icon: 'bi-check2-all',
        canEdit: false,
        canSubmit: false,
        canAppeal: true
      },
      'Rejected': { 
        variant: 'danger', 
        text: 'נדחה', 
        icon: 'bi-x-circle',
        canEdit: false,
        canSubmit: false,
        canAppeal: true
      },
      'UnderAppeal': { 
        variant: 'warning', 
        text: 'בערעור', 
        icon: 'bi-exclamation-triangle',
        canEdit: false,
        canSubmit: false
      },
      'AppealApproved': { 
        variant: 'success', 
        text: 'ערעור אושר', 
        icon: 'bi-shield-check',
        canEdit: false,
        canSubmit: false
      },
      'AppealRejected': { 
        variant: 'danger', 
        text: 'ערעור נדחה', 
        icon: 'bi-shield-x',
        canEdit: false,
        canSubmit: false
      }
    };
    
    return configs[status] || { 
      variant: 'light', 
      text: status, 
      icon: 'bi-question-circle',
      canEdit: false,
      canSubmit: false
    };
  };

  const handleShowDetails = (instance) => {
    setSelectedInstance(instance);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'לא זמין';
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner message="טוען את הטפסים שלך..." />;

  return (
    <Container>
      {/* כותרת */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-file-person me-2"></i>
                הטפסים שלי
              </h2>
              <p className="text-muted">כל הטפסים שמילאת והגשת במערכת</p>
            </div>
            <Button as={Link} to="/lecturer/forms" variant="primary">
              <i className="bi bi-plus-circle me-2"></i>
              מלא טופס חדש
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <ErrorAlert error={error} onRetry={loadMyForms} />
          </Col>
        </Row>
      )}

      {/* סטטיסטיקות מהירות */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="text-primary">{instances.length}</h3>
              <small className="text-muted">סך הכל טפסים</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="text-success">
                {instances.filter(i => ['FinalApproved', 'AppealApproved'].includes(i.currentStage)).length}
              </h3>
              <small className="text-muted">אושרו</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="text-info">
                {instances.filter(i => ['Submitted', 'ApprovedByDepartment', 'ApprovedByDean'].includes(i.currentStage)).length}
              </h3>
              <small className="text-muted">בבדיקה</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="text-warning">
                {instances.filter(i => i.currentStage === 'Draft').length}
              </h3>
              <small className="text-muted">טיוטות</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* רשימת טפסים */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">רשימת הטפסים</h5>
            </Card.Header>
            <Card.Body>
              {instances.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
                  <h4 className="mt-3 text-muted">עדיין לא מילאת טפסים</h4>
                  <p className="text-muted">התחל במילוי הטופס הראשון שלך</p>
                  <Button as={Link} to="/lecturer/forms" variant="primary">
                    צפה בטפסים זמינים
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>שם הטופס</th>
                        <th>סטטוס</th>
                        <th>תאריך יצירה</th>
                        <th>עדכון אחרון</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instances.map((instance) => {
                        const statusConfig = getStatusConfig(instance.currentStage);
                        return (
                          <tr key={instance.instanceId}>
                            <td>
                              <div>
                                <strong>{instance.formName || `טופס ${instance.formId}`}</strong>
                                {instance.totalScore > 0 && (
                                  <div className="small text-muted">
                                    ציון: {instance.totalScore}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <Badge bg={statusConfig.variant}>
                                <i className={`${statusConfig.icon} me-1`}></i>
                                {statusConfig.text}
                              </Badge>
                            </td>
                            <td>{formatDate(instance.createdDate)}</td>
                            <td>{formatDate(instance.lastModifiedDate)}</td>
                            <td>
                              <Dropdown>
  <Dropdown.Toggle variant="outline-secondary" size="sm">
    פעולות
  </Dropdown.Toggle>
  <Dropdown.Menu>
    {/* צפייה בפרטים בסיסיים */}
    <Dropdown.Item onClick={() => handleShowDetails(instance)}>
      <i className="bi bi-info-circle me-2"></i>
      פרטי מופע
    </Dropdown.Item>
    
    {/* צפייה בטופס המלא עם התשובות */}
    {instance.currentStage !== 'Draft' && (
      <Dropdown.Item as={Link} to={`/lecturer/view/${instance.instanceId}`}>
        <i className="bi bi-eye me-2"></i>
        צפה בטופס המלא
      </Dropdown.Item>
    )}
    
    {/* עריכה - רק לטיוטה */}
    {statusConfig.canEdit && (
      <Dropdown.Item as={Link} to={`/lecturer/fill/${instance.formId}?instance=${instance.instanceId}`}>
        <i className="bi bi-pencil me-2"></i>
        המשך עריכה
      </Dropdown.Item>
    )}
    
    {/* ערעור - רק אם נדחה */}
    {statusConfig.canAppeal && (
      <>
        <Dropdown.Divider />
        <Dropdown.Item as={Link} to={`/lecturer/appeal/${instance.instanceId}`}>
          <i className="bi bi-megaphone me-2"></i>
          הגש ערעור
        </Dropdown.Item>
      </>
    )}
  </Dropdown.Menu>
</Dropdown>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal פרטי טופס */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>פרטי מופע הטופס</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedInstance && (
      <div>
        <Alert variant="info">
          <i className="bi bi-info-circle me-2"></i>
          זהו מידע כללי על המופע. 
          {selectedInstance.currentStage !== 'Draft' && (
            <span> לצפייה בטופס המלא עם התשובות, השתמש בכפתור "צפה בטופס המלא".</span>
          )}
        </Alert>
        
        <Row className="mb-3">
          <Col sm={4}><strong>שם הטופס:</strong></Col>
          <Col>{selectedInstance.formName || `טופס ${selectedInstance.formId}`}</Col>
        </Row>
        <Row className="mb-3">
          <Col sm={4}><strong>מזהה מופע:</strong></Col>
          <Col>#{selectedInstance.instanceId}</Col>
        </Row>
        <Row className="mb-3">
          <Col sm={4}><strong>סטטוס:</strong></Col>
          <Col>
            <Badge bg={getStatusConfig(selectedInstance.currentStage).variant}>
              {getStatusConfig(selectedInstance.currentStage).text}
            </Badge>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col sm={4}><strong>תאריך יצירה:</strong></Col>
          <Col>{formatDate(selectedInstance.createdDate)}</Col>
        </Row>
        <Row className="mb-3">
          <Col sm={4}><strong>תאריך הגשה:</strong></Col>
          <Col>{selectedInstance.submissionDate ? 
            formatDate(selectedInstance.submissionDate) : 
            <span className="text-muted">טרם הוגש</span>}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col sm={4}><strong>עדכון אחרון:</strong></Col>
          <Col>{formatDate(selectedInstance.lastModifiedDate)}</Col>
        </Row>
        {selectedInstance.totalScore > 0 && (
          <Row className="mb-3">
            <Col sm={4}><strong>ציון:</strong></Col>
            <Col><Badge bg="info">{selectedInstance.totalScore}</Badge></Col>
          </Row>
        )}
        {selectedInstance.comments && (
          <Row className="mb-3">
            <Col sm={4}><strong>הערות:</strong></Col>
            <Col>
              <Alert variant="secondary" className="mb-0">
                {selectedInstance.comments}
              </Alert>
            </Col>
          </Row>
        )}
      </div>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
      סגור
    </Button>
    {selectedInstance && selectedInstance.currentStage !== 'Draft' && (
      <Button 
        as={Link} 
        to={`/lecturer/view/${selectedInstance.instanceId}`}
        variant="primary"
      >
        <i className="bi bi-eye me-2"></i>
        צפה בטופס המלא
      </Button>
    )}
  </Modal.Footer>
</Modal>
    </Container>
  );
};

export default MyForms;

