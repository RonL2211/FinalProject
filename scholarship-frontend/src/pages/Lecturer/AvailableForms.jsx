// src/pages/Lecturer/AvailableForms.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, InputGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formService } from '../../services/formService';
import { instanceService } from '../../services/instanceService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const AvailableForms = () => {
  const { user } = useAuth();
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

  const hasActiveInstance = (formId) => {
    return userInstances.some(instance => 
      instance.formId === formId && 
      !['FinalApproved', 'Rejected', 'AppealRejected'].includes(instance.currentStage)
    );
  };

  const getInstanceStatus = (formId) => {
    const instance = userInstances.find(i => i.formId === formId);
    return instance?.currentStage || null;
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
            const hasActive = hasActiveInstance(form.formID);
            const status = getInstanceStatus(form.formID);

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
                          {form.academicYear && (
                            <small className="text-muted ms-3">
                              <i className="bi bi-mortarboard me-1"></i>
                              שנה: {form.academicYear}
                            </small>
                          )}
                        </div>

                        {hasActive && (
                          <div className="mb-3">
                            <Badge bg="info">
                              <i className="bi bi-info-circle me-1"></i>
                              כבר מולא - סטטוס: {getStatusText(status)}
                            </Badge>
                          </div>
                        )}
                      </Col>
                    </Row>

                    <div className="d-flex gap-2 justify-content-end">
                      <Button
                        as={Link}
                        to={`/lecturer/fill/${form.formID}`}
                        variant={hasActive ? "outline-secondary" : "primary"}
                        disabled={hasActive}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        {hasActive ? "כבר מולא" : "מלא טופס"}
                      </Button>
                      
                      {hasActive && (
                        <Button
                          as={Link}
                          to={`/lecturer/my-forms#form-${form.formID}`}
                          variant="outline-info"
                          size="sm"
                        >
                          <i className="bi bi-eye me-1"></i>
                          צפה
                        </Button>
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

export default AvailableForms;