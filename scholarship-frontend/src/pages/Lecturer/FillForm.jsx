// src/pages/Lecturer/FillForm.jsx - תיקון מלא
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

      // תיקון: טעינת מבנה הטופס בצורה נכונה
      try {
        // נסה קודם את השיטה הישנה
        const structure = await formService.getFormStructure(formId);
        console.log('Form structure loaded:', structure);
        setFormStructure(structure);
      } catch (structureError) {
        console.warn('Failed to load form structure, trying alternative method...');
        
        // אם לא עובד, נסה endpoint חלופי
        try {
          const response = await api.get(`/Form/${formId}/complete`);
          if (response.data?.sections) {
            setFormStructure(response.data.sections);
          } else {
            // אם גם זה לא עובד, נסה להביא סעיפים בלבד
            const sectionsResponse = await api.get(`/FormSection/byForm/${formId}`);
            const sections = sectionsResponse.data || [];
            
            // טען שדות לכל סעיף
            const sectionsWithFields = await Promise.all(
              sections.map(async (section) => {
                try {
                  const fieldsResponse = await api.get(`/SectionField/bySection/${section.sectionID}`);
                  
                  // טען אפשרויות לשדות שצריכים
                  const fields = await Promise.all(
                    (fieldsResponse.data || []).map(async (field) => {
                      if (['Select', 'Radio', 'Checkbox'].includes(field.fieldType)) {
                        try {
                          const optionsResponse = await api.get(`/FieldOption/byField/${field.fieldID}`);
                          return { ...field, options: optionsResponse.data || [] };
                        } catch (err) {
                          console.warn(`No options for field ${field.fieldID}`);
                          return field;
                        }
                      }
                      return field;
                    })
                  );
                  
                  return { ...section, fields };
                } catch (err) {
                  console.warn(`Could not load fields for section ${section.sectionID}`);
                  return { ...section, fields: [] };
                }
              })
            );
            
            setFormStructure(sectionsWithFields);
          }
        } catch (altError) {
          console.error('All methods to load form structure failed:', altError);
          setFormStructure([]);
        }
      }

      // תיקון: טיפול נכון במופעים - בדוק אם כבר יש מופע לפני יצירת חדש
      if (instanceId) {
        // עריכת מופע קיים
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
            answersMap[answer.fieldID] = answer.answerValue || answer.value;
          });
          setAnswers(answersMap);
        } catch (err) {
          console.log('No existing answers found');
        }
      } else {
        // תיקון משופר: בדוק אם כבר יש מופע פעיל למשתמש לפני יצירת חדש
        try {
          // נסה לקבל מופעים של המשתמש לטופס הזה
          const userInstances = await instanceService.getUserInstances(user.personId);
          const existingInstance = userInstances.find(inst => 
            inst.formId === parseInt(formId) && 
            ['Draft', 'Submitted', 'ApprovedByDepartment', 'ApprovedByDean'].includes(inst.currentStage)
          );

          if (existingInstance) {
            // יש כבר מופע - בדוק אם זה טיוטה או הוגש
            console.log('Found existing instance:', existingInstance);
            
            if (existingInstance.currentStage === 'Draft') {
              // טיוטה - אפשר לערוך
              setCurrentInstance(existingInstance);
              
              // טען תשובות קיימות אם יש
              try {
                const existingAnswers = await instanceService.getInstanceAnswers(existingInstance.instanceId);
                const answersMap = {};
                existingAnswers.forEach(answer => {
                  answersMap[answer.fieldID] = answer.answerValue || answer.value || answer.Answer;
                });
                setAnswers(answersMap);
              } catch (err) {
                console.log('No existing answers in instance');
              }
            } else {
              // כבר הוגש - אי אפשר לערוך
              throw new Error(`הטופס כבר הוגש (סטטוס: ${existingInstance.currentStage}). לא ניתן לערוך טופס שהוגש.`);
            }
          } else {
            // אין מופע קיים - צור חדש
            console.log('Creating new instance...');
            try {
              const newInstance = await instanceService.createInstance(formId);
              console.log('New instance created:', newInstance);
              setCurrentInstance(newInstance);
            } catch (createError) {
              // בדוק אם השגיאה היא בגלל מופע קיים
              if (createError.message?.includes('already has an active instance')) {
                // נסה שוב לטעון את המופעים - אולי יש עיכוב
                const retryInstances = await instanceService.getUserInstances(user.personId);
                const retryInstance = retryInstances.find(inst => 
                  inst.formId === parseInt(formId) && inst.currentStage === 'Draft'
                );
                
                if (retryInstance) {
                  setCurrentInstance(retryInstance);
                } else {
                  throw new Error('נמצא מופע קיים אך לא ניתן לטעון אותו. אנא רענן את הדף.');
                }
              } else {
                throw createError;
              }
            }
          }
        } catch (checkError) {
          console.error('Error in form instance handling:', checkError);
          throw checkError;
        }
      }
    } catch (err) {
      console.error('Error in loadFormData:', err);
      setError(err.message || 'שגיאה בטעינת הטופס');
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
    if (!currentInstance) {
      setError('לא נמצא מופע טופס לשמירה');
      return;
    }

    setSaving(true);
    setError(''); // נקה שגיאות קודמות
    
    try {
      // הכן את התשובות לשמירה
      const answersArray = Object.entries(answers).map(([fieldId, value]) => ({
        fieldID: parseInt(fieldId),
        answerValue: value || ''
      }));

      console.log('Saving answers:', answersArray);
      
      // שליחה לשרת
      await instanceService.saveFieldAnswers(currentInstance.instanceId, answersArray);
      
      // הצגת הודעת הצלחה
      alert('השינויים נשמרו בהצלחה!');
    } catch (err) {
      console.error('Save error:', err);
      // בדוק אם זו בעיית 404
      if (err.message?.includes('404') || err.message?.includes('Not Found')) {
        setError('שגיאה: אין אפשרות לשמור תשובות כרגע. ה-API לשמירת תשובות חסר בשרת.');
      } else {
        setError(`שגיאה בשמירה: ${err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentInstance) {
      setError('לא נמצא מופע טופס להגשה');
      return;
    }

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
      console.error('Submit error:', err);
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
            placeholder={field.placeholder || field.helpText}
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
            placeholder={field.placeholder || field.helpText}
            required={field.isRequired}
          />
        );

      case 'Number':
        return (
          <Form.Control
            type="number"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.fieldID, e.target.value)}
            placeholder={field.placeholder || field.helpText}
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

      case 'File':
        return (
          <Form.Control
            type="file"
            onChange={(e) => {
              // TODO: implement file upload
              console.log('File selected:', e.target.files[0]);
            }}
            required={field.isRequired}
          />
        );

      default:
        return (
          <Form.Control
            type="text"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.fieldID, e.target.value)}
            placeholder={field.placeholder || field.helpText}
            required={field.isRequired}
          />
        );
    }
  };

  // פונקציה לרנדור סעיפים עם תתי-סעיפים
  const renderSection = (section, index) => {
    return (
      <Accordion.Item key={section.sectionID} eventKey={index.toString()}>
        <Accordion.Header>
          <div className="w-100">
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
          
          {/* רנדור שדות של הסעיף */}
          {Array.isArray(section.fields) && section.fields.length > 0 && (
            <div className="mb-4">
              {section.fields.map(field => (
                <Form.Group key={field.fieldID} className="mb-3">
                  <Form.Label className="fw-bold">
                    {field.fieldLabel}
                    {field.isRequired && <span className="text-danger ms-1">*</span>}
                  </Form.Label>
                  
                  {field.helpText && (
                    <Form.Text className="d-block mb-2 text-muted">
                      {field.helpText}
                    </Form.Text>
                  )}
                  
                  {renderField(field)}
                </Form.Group>
              ))}
            </div>
          )}
          
          {/* רנדור תתי-סעיפים אם יש */}
          {Array.isArray(section.subSections) && section.subSections.length > 0 && (
            <div className="ms-4">
              <h6 className="text-secondary mb-3">תתי-סעיפים:</h6>
              {section.subSections.map((subSection, subIndex) => (
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
                      <Form.Group key={field.fieldID} className="mb-3">
                        <Form.Label className="fw-bold">
                          {field.fieldLabel}
                          {field.isRequired && <span className="text-danger ms-1">*</span>}
                        </Form.Label>
                        
                        {field.helpText && (
                          <Form.Text className="d-block mb-2 text-muted">
                            {field.helpText}
                          </Form.Text>
                        )}
                        
                        {renderField(field)}
                      </Form.Group>
                    ))}
                    
                    {(!subSection.fields || subSection.fields.length === 0) && (
                      <div className="text-muted text-center py-2">
                        <i className="bi bi-info-circle me-1"></i>
                        אין שדות בתת-סעיף זה
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
          
          {/* אם אין שדות ואין תתי-סעיפים */}
          {(!section.fields || section.fields.length === 0) && 
           (!section.subSections || section.subSections.length === 0) && (
            <div className="text-muted text-center py-3">
              <i className="bi bi-info-circle me-1"></i>
              אין תוכן בסעיף זה
            </div>
          )}
        </Accordion.Body>
      </Accordion.Item>
    );
  };

  if (loading) return <LoadingSpinner message="טוען את הטופס..." />;

  if (error && !formData) {
    return (
      <Container>
        <ErrorAlert error={error} onRetry={loadFormData} />
      </Container>
    );
  }

  // וידוא ש-formStructure הוא מערך
  const safeFormStructure = Array.isArray(formStructure) ? formStructure : [];

  // חישוב מספר השדות הכולל
  const getTotalFields = () => {
    let total = 0;
    safeFormStructure.forEach(section => {
      if (Array.isArray(section.fields)) {
        total += section.fields.length;
      }
      if (Array.isArray(section.subSections)) {
        section.subSections.forEach(subSection => {
          if (Array.isArray(subSection.fields)) {
            total += subSection.fields.length;
          }
        });
      }
    });
    return total;
  };

  return (
    <Container>
      {/* כותרת */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>{formData?.formName}</h2>
              <p className="text-muted">{formData?.description}</p>
              {formData?.instructions && (
                <Alert variant="secondary">
                  <i className="bi bi-info-circle me-2"></i>
                  {formData.instructions}
                </Alert>
              )}
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
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* הטופס */}
      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              {safeFormStructure.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-clipboard-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3 text-muted">הטופס ריק</h4>
                  <p className="text-muted">אין סעיפים או שדות בטופס זה</p>
                  <Button variant="outline-primary" onClick={loadFormData}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    נסה לטעון שוב
                  </Button>
                </div>
              ) : (
                <Form>
                  <Accordion defaultActiveKey="0">
                    {safeFormStructure.map((section, index) => renderSection(section, index))}
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
                  disabled={saving || !currentInstance}
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
                  disabled={submitting || Object.keys(answers).length === 0 || !currentInstance}
                >
                  <i className="bi bi-send me-2"></i>
                  הגש טופס
                </Button>
              </div>

              <hr />

              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span>שדות שמולאו:</span>
                  <span className="badge bg-primary">{Object.keys(answers).length}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>סך הכל שדות:</span>
                  <span className="badge bg-secondary">{getTotalFields()}</span>
                </div>
                {currentInstance && (
                  <div className="d-flex justify-content-between">
                    <span>מזהה מופע:</span>
                    <span className="text-muted">#{currentInstance.instanceId}</span>
                  </div>
                )}
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