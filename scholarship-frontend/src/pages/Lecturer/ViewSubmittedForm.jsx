// src/pages/Lecturer/ViewSubmittedForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Accordion, Badge, Table } from 'react-bootstrap';
import { formService } from '../../services/formService';
import { instanceService } from '../../services/instanceService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const ViewSubmittedForm = () => {
  const { instanceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState(null);
  const [formStructure, setFormStructure] = useState([]);
  const [answers, setAnswers] = useState({});
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFormData();
  }, [instanceId]);

  const loadFormData = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת המופע
      const instanceData = await instanceService.getInstanceById(instanceId);
      
      // בדיקת הרשאות
      if (instanceData.userID !== user.personId) {
        // כאן אפשר להוסיף בדיקה אם המשתמש הוא ראש מחלקה/דיקאן שרשאי לראות
        throw new Error('אין הרשאה לצפות במופע זה');
      }
      
      setInstance(instanceData);

      // טעינת נתוני הטופס
      const form = await formService.getFormById(instanceData.formId);
      setFormData(form);

      // טעינת מבנה הטופס
      const structure = await formService.getFormStructure(instanceData.formId);
      setFormStructure(structure);

      // טעינת התשובות
      try {
        const existingAnswers = await instanceService.getInstanceAnswers(instanceId);
        const answersMap = {};
        existingAnswers.forEach(answer => {
          answersMap[answer.fieldID] = answer.answerValue || answer.value || answer.Answer;
        });
        setAnswers(answersMap);
      } catch (err) {
        console.log('No answers found');
      }
    } catch (err) {
      setError(err.message || 'שגיאה בטעינת הטופס');
    } finally {
      setLoading(false);
    }
  };

  const renderFieldValue = (field) => {
    const value = answers[field.fieldID];
    
    if (!value) {
      return <span className="text-muted">לא מולא</span>;
    }

    switch (field.fieldType) {
      case 'Select':
      case 'Radio':
        // מצא את הלייבל של האפשרות שנבחרה
        const selectedOption = field.options?.find(opt => opt.optionValue === value);
        return selectedOption ? selectedOption.optionLabel : value;
        
      case 'Checkbox':
        // הצג רשימת אפשרויות שנבחרו
        const selectedValues = value.split(',');
        const selectedLabels = field.options
          ?.filter(opt => selectedValues.includes(opt.optionValue))
          .map(opt => opt.optionLabel);
        return selectedLabels?.join(', ') || value;
        
      case 'Date':
        return new Date(value).toLocaleDateString('he-IL');
        
      case 'TextArea':
        return <div style={{ whiteSpace: 'pre-wrap' }}>{value}</div>;
        
      default:
        return value;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Draft': { text: 'טיוטה', variant: 'secondary' },
      'Submitted': { text: 'הוגש', variant: 'primary' },
      'ApprovedByDepartment': { text: 'אושר במחלקה', variant: 'info' },
      'ApprovedByDean': { text: 'אושר בפקולטה', variant: 'info' },
      'FinalApproved': { text: 'אושר סופית', variant: 'success' },
      'Rejected': { text: 'נדחה', variant: 'danger' },
      'UnderAppeal': { text: 'בערעור', variant: 'warning' },
      'AppealApproved': { text: 'ערעור אושר', variant: 'success' },
      'AppealRejected': { text: 'ערעור נדחה', variant: 'danger' }
    };
    
    const config = statusConfig[status] || { text: status, variant: 'secondary' };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const renderSection = (section, index) => {
    return (
      <Accordion.Item key={section.sectionID} eventKey={index.toString()}>
        <Accordion.Header>
          <div className="w-100 d-flex justify-content-between align-items-center">
            <div>
              <strong>{section.title}</strong>
              {section.description && (
                <div className="small text-muted">{section.description}</div>
              )}
            </div>
            {/* הצג כמה שדות מולאו בסעיף */}
            <Badge bg="secondary" className="me-2">
              {countFilledFields(section)} / {countTotalFields(section)} שדות מולאו
            </Badge>
          </div>
        </Accordion.Header>
        <Accordion.Body>
          {section.explanation && (
            <Alert variant="info" className="mb-3">
              <small>{section.explanation}</small>
            </Alert>
          )}
          
          {/* רנדור שדות של הסעיף */}
          {Array.isArray(section.fields) && section.fields.length > 0 && (
            <div className="mb-4">
              {section.fields.map(field => (
                <div key={field.fieldID} className="mb-3 pb-3 border-bottom">
                  <Row>
                    <Col md={4}>
                      <strong>{field.fieldLabel}</strong>
                      {field.isRequired && <span className="text-danger ms-1">*</span>}
                      {field.helpText && (
                        <div className="small text-muted">{field.helpText}</div>
                      )}
                    </Col>
                    <Col md={8}>
                      <div className="p-2 bg-light rounded">
                        {renderFieldValue(field)}
                      </div>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          )}
          
          {/* רנדור תתי-סעיפים אם יש */}
          {Array.isArray(section.subSections) && section.subSections.length > 0 && (
            <div className="ms-4">
              <h6 className="text-secondary mb-3">תתי-סעיפים:</h6>
              {section.subSections.map((subSection) => (
                <Card key={subSection.sectionID} className="mb-3">
                  <Card.Header className="bg-light">
                    <strong>{subSection.title}</strong>
                    {subSection.description && (
                      <div className="small text-muted">{subSection.description}</div>
                    )}
                  </Card.Header>
                  <Card.Body>
                    {subSection.explanation && (
                      <Alert variant="info" className="mb-3">
                        <small>{subSection.explanation}</small>
                      </Alert>
                    )}
                    
                    {Array.isArray(subSection.fields) && subSection.fields.map(field => (
                      <div key={field.fieldID} className="mb-3 pb-3 border-bottom">
                        <Row>
                          <Col md={4}>
                            <strong>{field.fieldLabel}</strong>
                            {field.isRequired && <span className="text-danger ms-1">*</span>}
                          </Col>
                          <Col md={8}>
                            <div className="p-2 bg-light rounded">
                              {renderFieldValue(field)}
                            </div>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Accordion.Body>
      </Accordion.Item>
    );
  };

  const countFilledFields = (section) => {
    let count = 0;
    if (section.fields) {
      count += section.fields.filter(f => answers[f.fieldID]).length;
    }
    if (section.subSections) {
      section.subSections.forEach(sub => {
        if (sub.fields) {
          count += sub.fields.filter(f => answers[f.fieldID]).length;
        }
      });
    }
    return count;
  };

  const countTotalFields = (section) => {
    let count = 0;
    if (section.fields) {
      count += section.fields.length;
    }
    if (section.subSections) {
      section.subSections.forEach(sub => {
        if (sub.fields) {
          count += sub.fields.length;
        }
      });
    }
    return count;
  };

  if (loading) return <LoadingSpinner message="טוען את הטופס..." />;

  if (error) {
    return (
      <Container>
        <ErrorAlert error={error} onRetry={loadFormData} />
      </Container>
    );
  }

  return (
    <Container>
      {/* כותרת */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-file-text me-2"></i>
                צפייה בטופס שהוגש
              </h2>
              <h4 className="text-muted">{formData?.formName}</h4>
              {formData?.description && (
                <p className="text-muted">{formData.description}</p>
              )}
            </div>
            <div>
              <Button variant="outline-secondary" onClick={() => navigate(-1)} className="me-2">
                <i className="bi bi-arrow-right me-1"></i>
                חזור
              </Button>
              <Button variant="primary" onClick={() => window.print()}>
                <i className="bi bi-printer me-1"></i>
                הדפס
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* פרטי המופע */}
      <Row className="mb-4">
        <Col>
          <Card bg="light">
            <Card.Body>
              <Row>
                <Col md={3}>
                  <strong>סטטוס:</strong> {getStatusBadge(instance?.currentStage)}
                </Col>
                <Col md={3}>
                  <strong>תאריך הגשה:</strong> {instance?.submissionDate ? 
                    new Date(instance.submissionDate).toLocaleDateString('he-IL') : 
                    'טרם הוגש'}
                </Col>
                <Col md={3}>
                  <strong>עדכון אחרון:</strong> {instance?.lastModifiedDate ? 
                    new Date(instance.lastModifiedDate).toLocaleDateString('he-IL') : 
                    '-'}
                </Col>
                <Col md={3}>
                  <strong>מזהה מופע:</strong> #{instance?.instanceId}
                </Col>
              </Row>
              {instance?.comments && (
                <Row className="mt-3">
                  <Col>
                    <Alert variant="info">
                      <strong>הערות:</strong> {instance.comments}
                    </Alert>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* תוכן הטופס */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">תוכן הטופס</h5>
            </Card.Header>
            <Card.Body>
              {formStructure.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-clipboard-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3 text-muted">אין תוכן להצגה</h4>
                </div>
              ) : (
                <Accordion defaultActiveKey="0">
                  {formStructure.map((section, index) => renderSection(section, index))}
                </Accordion>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* סיכום */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <h6>סיכום מילוי:</h6>
              <div className="d-flex justify-content-around text-center">
                <div>
                  <h3 className="text-primary">
                    {Object.keys(answers).length}
                  </h3>
                  <small className="text-muted">שדות מולאו</small>
                </div>
                <div>
                  <h3 className="text-secondary">
                    {formStructure.reduce((acc, section) => 
                      acc + countTotalFields(section), 0)}
                  </h3>
                  <small className="text-muted">סך הכל שדות</small>
                </div>
                <div>
                  <h3 className="text-success">
                    {Math.round((Object.keys(answers).length / 
                      formStructure.reduce((acc, section) => 
                        acc + countTotalFields(section), 0) || 1) * 100)}%
                  </h3>
                  <small className="text-muted">אחוז השלמה</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ViewSubmittedForm;