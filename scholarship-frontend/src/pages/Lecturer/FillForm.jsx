// src/pages/Lecturer/FillForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Accordion } from 'react-bootstrap';
import { formService } from '../../services/formService';
import { instanceService } from '../../services/instanceService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const FillForm = () => {
  const { id: formId } = useParams();
  const [searchParams] = useSearchParams();
  const instanceId = searchParams.get('instance');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState(null);
  const [formStructure, setFormStructure] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentInstance, setCurrentInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    loadFormData();
  }, [formId, instanceId]);

  const loadFormData = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת נתוני הטופס
      const form = await formService.getFormById(formId);
      setFormData(form);

      // טעינת מבנה הטופס
      const structure = await formService.getFormStructure(formId);
      setFormStructure(structure);

      // אם זה עריכת מופע קיים
      if (instanceId) {
        const instance = await instanceService.getInstanceById(instanceId);
        if (instance.userID !== user.personId) {
          throw new Error('אין הרשאה לערוך מופע זה');
        }
        setCurrentInstance(instance);
        
        // טעינת התשובות הקיימות
        try {
          const existingAnswers = await instanceService.getInstanceAnswers(instanceId);
          const answersMap = {};
          existingAnswers.forEach(answer => {
            answersMap[answer.fieldID] = answer.answerValue;
          });
          setAnswers(answersMap);
        } catch (err) {
          console.log('No existing answers found');
        }
      } else {
        // יצירת מופע חדש
        const newInstance = await instanceService.createInstance(formId);
        setCurrentInstance(newInstance);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setAnswers(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const saveProgress = async () => {
    if (!currentInstance) return;

    setSaving(true);
    try {
      // שמירת התשובות
      const answersArray = Object.entries(answers).map(([fieldId, value]) => ({
        fieldID: parseInt(fieldId),
        answerValue: value
      }));

      await instanceService.saveFieldAnswers(currentInstance.instanceId, answersArray);
      
      // הצגת הודעת הצלחה
      setError('');
      // יכול להוסיף toast notification כאן
    } catch (err) {
      setError(`שגיאה בשמירה: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentInstance) return;

    setSubmitting(true);
    try {
      // שמירת התשובות לפני הגשה
      await saveProgress();
      
      // הגשת הטופס
      await instanceService.submitInstance(currentInstance.instanceId);
      
      // הפניה לדף הטפסים שלי
      navigate('/lecturer/my-forms', { 
        state: { message: 'הטופס הוגש בהצלחה!' }
      });
    } catch (err) {
      setError(`שגיאה בהגשה: ${err.message}`);
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const renderField = (field) => {
    const fieldValue = answers[field.fieldID] || '';

    switch (field.fieldType) {
      case 'Text':
        return (
          <Form.Control
            type="text"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.fieldID, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
          />
        );

      case 'TextArea':
        return (
          <Form.Control
            as="textarea"
            rows={3}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.fieldID, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
          />
        );

      case 'Number':
        return (
          <Form.Control
            type="number"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.fieldID, e.target.value)}
            placeholder={field.placeholder}
            min={field.minValue}
            max={field.maxValue}
            required={field.isRequired}
          />
        );

      case 'Select':
        return (
          <Form.Select
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.fieldID, e.target.value)}
            required={field.isRequired}
          >
            <option value="">בחר אפשרות...</option>
            {field.options?.map(option => (
              <option key={option.optionID} value={option.optionValue}>
                {option.optionLabel}
              </option>
            ))}
          </Form.Select>
        );

      case 'Radio':
        return (
          <div>
            {field.options?.map(option => (
              <Form.Check
                key={option.optionID}
                type="radio"
                name={`field_${field.fieldID}`}
                id={`field_${field.fieldID}_${option.optionID}`}
                label={option.optionLabel}
                value={option.optionValue}
                checked={fieldValue === option.optionValue}
                onChange={(e) => handleFieldChange(field.fieldID, e.target.value)}
                required={field.isRequired}
              />
            ))}
          </div>
        );

      case 'Checkbox':
        const checkedValues = fieldValue ? fieldValue.split(',') : [];
        return (
          <div>
            {field.options?.map(option => (
              <Form.Check
                key={option.optionID}
                type="checkbox"
                id={`field_${field.fieldID}_${option.optionID}`}
                label={option.optionLabel}
                checked={checkedValues.includes(option.optionValue)}
                onChange={(e) => {
                  const newValues = e.target.checked
                    ? [...checkedValues, option.optionValue]
                    : checkedValues.filter(v => v !== option.optionValue);
                  handleFieldChange(field.fieldID, newValues.join(','));
                }}
              />
            ))}
          </div>
        );

      case 'Date':
        return (
          <Form.Control
            type="date"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.fieldID, e.target.value)}
            required={field.isRequired}
          />
        );

      default:
        return (
          <Form.Control
            type="text"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.fieldID, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
          />
        );
    }
  };

  if (loading) return <LoadingSpinner message="טוען את הטופס..." />;

  if (error && !formData) {
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
              <h2>{formData?.formName}</h2>
              <p className="text-muted">{formData?.description}</p>
            </div>
            <div>
              <Button variant="outline-secondary" onClick={() => navigate(-1)} className="me-2">
                <i className="bi bi-arrow-right me-1"></i>
                חזור
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      {/* הטופס */}
      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              {formStructure.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-clipboard-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3 text-muted">הטופס ריק</h4>
                  <p className="text-muted">אין שדות בטופס זה</p>
                </div>
              ) : (
                <Form>
                  <Accordion defaultActiveKey="0">
                    {formStructure.map((section, index) => (
                      <Accordion.Item key={section.sectionID} eventKey={index.toString()}>
                        <Accordion.Header>
                          <div>
                            <strong>{section.title}</strong>
                            {section.description && (
                              <div className="small text-muted">{section.description}</div>
                            )}
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          {section.explanation && (
                            <Alert variant="info" className="mb-3">
                              <small>{section.explanation}</small>
                            </Alert>
                          )}
                          
                          {section.fields?.map(field => (
                            <Form.Group key={field.fieldID} className="mb-3">
                              <Form.Label className="fw-bold">
                                {field.fieldLabel}
                                {field.isRequired && <span className="text-danger ms-1">*</span>}
                              </Form.Label>
                              
                              {field.description && (
                                <Form.Text className="d-block mb-2 text-muted">
                                  {field.description}
                                </Form.Text>
                              )}
                              
                              {renderField(field)}
                            </Form.Group>
                          ))}
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* פאנל צד */}
        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '90px' }}>
            <Card.Header>
              <h6 className="mb-0">פעולות הטופס</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button
                  variant="secondary"
                  onClick={saveProgress}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="spinner-border spinner-border-sm me-2"></i>
                      שומר...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-2"></i>
                      שמור טיוטה
                    </>
                  )}
                </Button>

                <Button
                  variant="primary"
                  onClick={() => setShowSubmitModal(true)}
                  disabled={submitting || Object.keys(answers).length === 0}
                >
                  <i className="bi bi-send me-2"></i>
                  הגש טופס
                </Button>
              </div>

              <hr />

              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span>שדות מולאו:</span>
                  <span>{Object.keys(answers).length}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>סך שדות:</span>
                  <span>{formStructure.reduce((acc, section) => acc + (section.fields?.length || 0), 0)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal אישור הגשה */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>אישור הגשת הטופס</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="bi bi-send text-primary" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">האם אתה בטוח?</h5>
            <p className="text-muted">
              לאחר הגשת הטופס לא יהיה ניתן לערוך אותו.
              הטופס יועבר לבדיקת ראש המחלקה.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            ביטול
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'מגיש...' : 'אישור הגשה'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FillForm;