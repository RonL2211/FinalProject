// src/pages/Lecturer/AvailableForms.jsx - תיקון
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, InputGroup, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { formService } from '../../services/formService';
import { instanceService } from '../../services/instanceService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const AvailableForms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [userInstances, setUserInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterForms();
  }, [forms, searchTerm, userInstances]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת טפסים זמינים
      const allForms = await formService.getAllForms();
      const availableForms = allForms.filter(form => form.isPublished && form.isActive);

      // טעינת הטפסים שהמשתמש כבר מילא
      const instances = await instanceService.getUserInstances(user.personId);

      setForms(availableForms);
      setUserInstances(instances);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterForms = () => {
    let filtered = [...forms];

    // חיפוש טקסט
    if (searchTerm) {
      filtered = filtered.filter(form =>
        form.formName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredForms(filtered);
  };

  // תיקון: פונקציה משופרת לבדיקת מופע פעיל
  const getActiveInstance = (formId) => {
    return userInstances.find(instance => 
      instance.formId === formId && 
      ['Draft', 'Submitted', 'ApprovedByDepartment', 'ApprovedByDean', 'UnderAppeal'].includes(instance.currentStage)
    );
  };

  const hasActiveInstance = (formId) => {
    return !!getActiveInstance(formId);
  };

  const getInstanceStatus = (formId) => {
    const instance = userInstances.find(i => i.formId === formId);
    return instance?.currentStage || null;
  };

  // תיקון: פונקציה לניהול לחיצה על "מלא טופס"
  const handleFillForm = (formId) => {
    const existingInstance = getActiveInstance(formId);
    
    if (existingInstance) {
      // אם יש מופע קיים, עבור אליו
      navigate(`/lecturer/fill/${formId}?instance=${existingInstance.instanceId}`);
    } else {
      // אחרת, צור חדש
      navigate(`/lecturer/fill/${formId}`);
    }
  };

  // תיקון: פונקציה לניהול צפייה/עריכה
  const handleViewEdit = (formId) => {
    const instance = getActiveInstance(formId);
    
    if (instance) {
      if (instance.currentStage === 'Draft') {
        // טיוטה - אפשר לערוך
        navigate(`/lecturer/fill/${formId}?instance=${instance.instanceId}`);
      } else {
        // הוגש - רק צפייה
        navigate(`/lecturer/my-forms#form-${instance.instanceId}`);
      }
    }
  };

  if (loading) return <LoadingSpinner message="טוען טפסים זמינים..." />;

  return (
    <Container>
      {/* כותרת */}
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="bi bi-clipboard-check me-2"></i>
            טפסים זמינים למילוי
          </h2>
          <p className="text-muted">בחר טופס למילוי מהרשימה למטה</p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <ErrorAlert error={error} onRetry={loadData} />
          </Col>
        </Row>
      )}

      {/* חיפוש וסינון */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="חפש טופס..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="d-flex align-items-center">
          <small className="text-muted">
            נמצאו {filteredForms.length} טפסים זמינים
          </small>
        </Col>
      </Row>

      {/* רשימת טפסים */}
      <Row>
        {filteredForms.length === 0 ? (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
                <h4 className="mt-3 text-muted">
                  {searchTerm ? 'לא נמצאו טפסים התואמים לחיפוש' : 'אין טפסים זמינים'}
                </h4>
                {searchTerm && (
                  <Button variant="outline-primary" onClick={() => setSearchTerm('')}>
                    נקה חיפוש
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredForms.map((form) => {
            const activeInstance = getActiveInstance(form.formID);
            const hasActive = !!activeInstance;
            const status = activeInstance?.currentStage;
            const isDraft = status === 'Draft';

            return (
              <Col key={form.formID} lg={6} className="mb-4">
                <Card className="card-hover h-100">
                  <Card.Body>
                    <Row className="align-items-start">
                      <Col>
                        <h5 className="card-title mb-2">{form.formName}</h5>
                        {form.description && (
                          <p className="text-muted mb-3">{form.description}</p>
                        )}
                        
                        <div className="mb-3">
                          <small className="text-muted">
                            <i className="bi bi-calendar me-1"></i>
                            נוצר: {new Date(form.creationDate).toLocaleDateString('he-IL')}
                          </small>
                          {form.dueDate && (
                            <small className="text-muted ms-3">
                              <i className="bi bi-clock me-1"></i>
                              יש להגיש עד: {new Date(form.dueDate).toLocaleDateString('he-IL')}
                            </small>
                          )}
                          {form.academicYear && (
                            <small className="text-muted ms-3">
                              <i className="bi bi-mortarboard me-1"></i>
                              שנה: {form.academicYear}
                            </small>
                          )}
                        </div>

                        {hasActive && (
                          <div className="mb-3">
                            <Badge bg={getStatusBadgeColor(status)}>
                              <i className="bi bi-info-circle me-1"></i>
                              סטטוס: {getStatusText(status)}
                            </Badge>
                          </div>
                        )}
                      </Col>
                    </Row>

                    <div className="d-flex gap-2 justify-content-end">
                      {!hasActive ? (
                        // אין מופע - כפתור מילוי חדש
                        <Button
                          variant="primary"
                          onClick={() => handleFillForm(form.formID)}
                        >
                          <i className="bi bi-pencil me-1"></i>
                          מלא טופס
                        </Button>
                      ) : isDraft ? (
                        // יש טיוטה - כפתור המשך מילוי
                        <>
                          <Button
                            variant="warning"
                            onClick={() => handleViewEdit(form.formID)}
                          >
                            <i className="bi bi-pencil-square me-1"></i>
                            המשך מילוי טיוטה
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => navigate('/lecturer/my-forms')}
                          >
                            <i className="bi bi-eye me-1"></i>
                            לטפסים שלי
                          </Button>
                        </>
                      ) : (
                        // הוגש - כפתורי צפייה וערעור
                        <>
                          <Button
                            variant="outline-secondary"
                            disabled
                          >
                            <i className="bi bi-check-circle me-1"></i>
                            הטופס הוגש
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleViewEdit(form.formID)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            צפה
                          </Button>
                        
                        </>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        )}
      </Row>
    </Container>
  );
};

// פונקציות עזר
const getStatusText = (status) => {
  const statusMap = {
    'Draft': 'טיוטה',
    'Submitted': 'הוגש',
    'ApprovedByDepartment': 'אושר במחלקה',
    'ApprovedByDean': 'אושר בפקולטה',
    'FinalApproved': 'אושר סופית',
    'Rejected': 'נדחה',
    'UnderAppeal': 'בערעור',
    'AppealApproved': 'ערעור אושר',
    'AppealRejected': 'ערעור נדחה'
  };
  return statusMap[status] || status;
};

const getStatusBadgeColor = (status) => {
  const colorMap = {
    'Draft': 'warning',
    'Submitted': 'info',
    'ApprovedByDepartment': 'primary',
    'ApprovedByDean': 'primary',
    'FinalApproved': 'success',
    'Rejected': 'danger',
    'UnderAppeal': 'secondary',
    'AppealApproved': 'success',
    'AppealRejected': 'danger'
  };
  return colorMap[status] || 'secondary';
};

export default AvailableForms;