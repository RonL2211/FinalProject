// src/pages/Manager/FormBuilder.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Accordion, Badge, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { formService } from '../../services/formService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const   FormBuilder = () => {
  const navigate = useNavigate();
  
  // Form basic info
  const [formInfo, setFormInfo] = useState({
    formName: '',
    description: '',
    academicYear: new Date().getFullYear(),
    semester: 'A',
    startDate: '',
    endDate: '',
    isActive: true
  });

  // Form structure
  const [sections, setSections] = useState([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: Basic Info, 2: Build Structure, 3: Preview
  
  // UI states
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  // Add section form
  const [newSection, setNewSection] = useState({
    title: '',
    description: '',
    explanation: '',
    maxPoints: 0,
    level: 0,
    parentSectionID: null,
    isRequired: false,
    orderIndex: 1
  });

  // Add field form
  const [newField, setNewField] = useState({
    fieldLabel: '',
    description: '',
    fieldType: 'Text',
    isRequired: false,
    placeholder: '',
    minValue: '',
    maxValue: '',
    options: []
  });

  // Field types available
  const fieldTypes = [
    { value: 'Text', label: 'תיבת טקסט קצר' },
    { value: 'TextArea', label: 'תיבת טקסט ארוך' },
    { value: 'Number', label: 'מספר' },
    { value: 'Select', label: 'רשימה נפתחת' },
    { value: 'Radio', label: 'בחירה יחידה' },
    { value: 'Checkbox', label: 'בחירה מרובה' },
    { value: 'Date', label: 'תאריך' },
    { value: 'File', label: 'העלאת קובץ' }
  ];

  useEffect(() => {
    // Initialize with current academic year dates
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 9, 1); // October 1st
    const endDate = new Date(currentYear + 1, 8, 30); // September 30th next year
    
    setFormInfo(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));
  }, []);

  const validateStep1 = () => {
    return formInfo.formName.trim() && 
           formInfo.description.trim() && 
           formInfo.startDate && 
           formInfo.endDate;
  };

  const validateStep2 = () => {
    if (sections.length === 0) return false;
    
    // Check if all sections have at least one field
    return sections.every(section => 
      section.fields && section.fields.length > 0
    );
  };

  const handleAddSection = () => {
    if (!newSection.title.trim()) {
      setError('יש להזין כותרת לסעיף');
      return;
    }

    const section = {
      id: Date.now(), // Temporary ID
      ...newSection,
      orderIndex: sections.length + 1,
      fields: []
    };

    setSections([...sections, section]);
    setNewSection({
      title: '',
      description: '',
      explanation: '',
      maxPoints: 0,
      level: 0,
      parentSectionID: null,
      isRequired: false,
      orderIndex: 1
    });
    setShowAddSectionModal(false);
    setError('');
  };

  const handleAddField = () => {
    if (!selectedSection || !newField.fieldLabel.trim()) {
      setError('יש להזין תווית לשדה');
      return;
    }

    const field = {
      id: Date.now(), // Temporary ID
      ...newField,
      orderIndex: selectedSection.fields.length + 1
    };

    const updatedSections = sections.map(section => {
      if (section.id === selectedSection.id) {
        return {
          ...section,
          fields: [...(section.fields || []), field]
        };
      }
      return section;
    });

    setSections(updatedSections);
    setNewField({
      fieldLabel: '',
      description: '',
      fieldType: 'Text',
      isRequired: false,
      placeholder: '',
      minValue: '',
      maxValue: '',
      options: []
    });
    setShowAddFieldModal(false);
    setSelectedSection(null);
    setError('');
  };

  const handleRemoveSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const handleRemoveField = (sectionId, fieldId) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          fields: section.fields.filter(f => f.id !== fieldId)
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const handleAddFieldOption = () => {
    setNewField({
      ...newField,
      options: [...newField.options, { label: '', value: '', isDefault: false }]
    });
  };

  const handleRemoveFieldOption = (index) => {
    const updatedOptions = newField.options.filter((_, i) => i !== index);
    setNewField({ ...newField, options: updatedOptions });
  };

  const handleUpdateFieldOption = (index, key, value) => {
    const updatedOptions = newField.options.map((option, i) => {
      if (i === index) {
        return { ...option, [key]: value };
      }
      return option;
    });
    setNewField({ ...newField, options: updatedOptions });
  };

  const handleSaveForm = async (publish = false) => {
    if (publish) {
      setPublishing(true);
    } else {
      setSaving(true);
    }
    
    setError('');

    try {
      // Prepare form data for API
      const formData = {
        ...formInfo,
        isPublished: publish,
        sections: sections
      };

      const result = await formService.createForm(formData);
      
      if (publish && result.formID) {
        await formService.publishForm(result.formID);
      }

      navigate('/manager/forms', { 
        state: { 
          message: publish ? 'הטופס נוצר ופורסם בהצלחה!' : 'הטופס נשמר בהצלחה!' 
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const renderStepIndicator = () => (
    <Card className="mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">שלבי בניית הטופס</h6>
          <Badge bg="primary">{currentStep}/3</Badge>
        </div>
        <ProgressBar now={(currentStep / 3) * 100} className="mb-2" />
        <div className="d-flex justify-content-between small text-muted">
          <span className={currentStep >= 1 ? 'text-primary fw-bold' : ''}>פרטי בסיס</span>
          <span className={currentStep >= 2 ? 'text-primary fw-bold' : ''}>בניית מבנה</span>
          <span className={currentStep >= 3 ? 'text-primary fw-bold' : ''}>תצוגה מקדימה</span>
        </div>
      </Card.Body>
    </Card>
  );

  const renderStep1 = () => (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-info-circle me-2"></i>
          פרטי הטופס הבסיסיים
        </h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col lg={8}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>שם הטופס <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={formInfo.formName}
                  onChange={(e) => setFormInfo({...formInfo, formName: e.target.value})}
                  placeholder="לדוגמה: טופס הצטיינות מרצים 2024"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>תיאור הטופס <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formInfo.description}
                  onChange={(e) => setFormInfo({...formInfo, description: e.target.value})}
                  placeholder="תאר את מטרת הטופס ואת התהליך..."
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>שנה אקדמית</Form.Label>
                    <Form.Control
                      type="number"
                      value={formInfo.academicYear}
                      onChange={(e) => setFormInfo({...formInfo, academicYear: parseInt(e.target.value)})}
                      min="2020"
                      max="2030"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>סמסטר</Form.Label>
                    <Form.Select
                      value={formInfo.semester}
                      onChange={(e) => setFormInfo({...formInfo, semester: e.target.value})}
                    >
                      <option value="A">סמסטר א'</option>
                      <option value="B">סמסטר ב'</option>
                      <option value="Summer">קיץ</option>
                      <option value="Annual">שנתי</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>תאריך התחלה <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="date"
                      value={formInfo.startDate}
                      onChange={(e) => setFormInfo({...formInfo, startDate: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>תאריך סיום <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="date"
                      value={formInfo.endDate}
                      onChange={(e) => setFormInfo({...formInfo, endDate: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="הטופס פעיל"
                  checked={formInfo.isActive}
                  onChange={(e) => setFormInfo({...formInfo, isActive: e.target.checked})}
                />
                <Form.Text className="text-muted">
                  טופס לא פעיל לא יוצג למרצים
                </Form.Text>
              </Form.Group>
            </Form>
          </Col>
          <Col lg={4}>
            <Card className="bg-light">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0">
                  <i className="bi bi-lightbulb me-2"></i>
                  טיפים לבניית טופס
                </h6>
              </Card.Header>
              <Card.Body>
                <ul className="small mb-0">
                  <li className="mb-2">בחר שם ברור ומתאר לטופס</li>
                  <li className="mb-2">כתב תיאור מפורט של המטרה</li>
                  <li className="mb-2">הגדר תאריכים מדויקים למילוי</li>
                  <li className="mb-0">ודא שהטופס פעיל לפני פרסום</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  const renderStep2 = () => (
    <Row>
      <Col lg={8}>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-building me-2"></i>
              מבנה הטופס
            </h5>
            <Button 
              variant="primary" 
              onClick={() => setShowAddSectionModal(true)}
            >
              <i className="bi bi-plus me-2"></i>
              הוסף סעיף
            </Button>
          </Card.Header>
          <Card.Body>
            {sections.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-file-earmark-plus text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 text-muted">אין סעיפים בטופס</h5>
                <p className="text-muted">התחל בהוספת הסעיף הראשון</p>
                <Button 
                  variant="primary" 
                  onClick={() => setShowAddSectionModal(true)}
                >
                  <i className="bi bi-plus me-2"></i>
                  הוסף סעיף ראשון
                </Button>
              </div>
            ) : (
              <Accordion defaultActiveKey="0">
                {sections.map((section, index) => (
                  <Accordion.Item key={section.id} eventKey={index.toString()}>
                    <Accordion.Header>
                      <div className="d-flex align-items-center justify-content-between w-100 me-3">
                        <div>
                          <strong>{section.title}</strong>
                          {section.maxPoints > 0 && (
                            <Badge bg="info" className="ms-2">{section.maxPoints} נקודות</Badge>
                          )}
                        </div>
                        <div>
                          <Badge bg="secondary" className="me-2">
                            {section.fields?.length || 0} שדות
                          </Badge>
                          {section.isRequired && (
                            <Badge bg="danger">חובה</Badge>
                          )}
                        </div>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="mb-3">
                        <strong>תיאור:</strong> {section.description || 'אין תיאור'}
                      </div>
                      {section.explanation && (
                        <div className="mb-3">
                          <strong>הסבר:</strong> {section.explanation}
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">שדות הסעיף:</h6>
                        <div>
                          <Button 
                            size="sm" 
                            variant="success" 
                            onClick={() => {
                              setSelectedSection(section);
                              setShowAddFieldModal(true);
                            }}
                            className="me-2"
                          >
                            <i className="bi bi-plus me-1"></i>
                            הוסף שדה
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger" 
                            onClick={() => handleRemoveSection(section.id)}
                          >
                            <i className="bi bi-trash me-1"></i>
                            מחק סעיף
                          </Button>
                        </div>
                      </div>

                      {(!section.fields || section.fields.length === 0) ? (
                        <Alert variant="warning">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          אין שדות בסעיף זה. הוסף לפחות שדה אחד.
                        </Alert>
                      ) : (
                        <div className="list-group">
                          {section.fields.map((field, fieldIndex) => (
                            <div key={field.id} className="list-group-item">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <strong>{field.fieldLabel}</strong>
                                  {field.isRequired && <span className="text-danger ms-1">*</span>}
                                  <div className="small text-muted">
                                    סוג: {fieldTypes.find(t => t.value === field.fieldType)?.label}
                                    {field.description && ` • ${field.description}`}
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline-danger"
                                  onClick={() => handleRemoveField(section.id, field.id)}
                                >
                                  <i className="bi bi-x"></i>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col lg={4}>
        <Card className="sticky-top" style={{ top: '90px' }}>
          <Card.Header className="bg-success text-white">
            <h6 className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              מדריך בניית מבנה
            </h6>
          </Card.Header>
          <Card.Body>
            <div className="small">
              <div className="mb-3">
                <strong>שלב 1:</strong> הוספת סעיפים
                <ul className="mt-1 mb-0">
                  <li>כל סעיף מייצג נושא מרכזי</li>
                  <li>ניתן להגדיר ניקוד לכל סעיף</li>
                  <li>סמן סעיפים חובה</li>
                </ul>
              </div>
              
              <div className="mb-3">
                <strong>שלב 2:</strong> הוספת שדות
                <ul className="mt-1 mb-0">
                  <li>כל סעיף צריך לפחות שדה אחד</li>
                  <li>בחר סוג שדה מתאים</li>
                  <li>הוסף הסברים לשדות מורכבים</li>
                </ul>
              </div>

              <div className="mb-0">
                <strong>סוגי שדות זמינים:</strong>
                <ul className="mt-1 mb-0 small">
                  <li>טקסט קצר/ארוך</li>
                  <li>מספר עם טווח</li>
                  <li>רשימות ובחירות</li>
                  <li>תאריך והעלאת קבצים</li>
                </ul>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderStep3 = () => (
    <Row>
      <Col lg={8}>
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              <i className="bi bi-eye me-2"></i>
              תצוגה מקדימה של הטופס
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="mb-4 p-3 bg-light border rounded">
              <h4>{formInfo.formName}</h4>
              <p className="text-muted mb-2">{formInfo.description}</p>
              <div className="small text-muted">
                שנה אקדמית: {formInfo.academicYear} • סמסטר: {formInfo.semester}
                <br />
                תקופת מילוי: {new Date(formInfo.startDate).toLocaleDateString('he-IL')} - {new Date(formInfo.endDate).toLocaleDateString('he-IL')}
              </div>
            </div>

            {sections.map((section, index) => (
              <Card key={section.id} className="mb-3">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      {section.title}
                      {section.isRequired && <span className="text-danger ms-1">*</span>}
                    </h6>
                    {section.maxPoints > 0 && (
                      <Badge bg="info">{section.maxPoints} נקודות</Badge>
                    )}
                  </div>
                  {section.description && (
                    <small className="text-muted">{section.description}</small>
                  )}
                </Card.Header>
                <Card.Body>
                  {section.explanation && (
                    <Alert variant="info" className="small mb-3">
                      {section.explanation}
                    </Alert>
                  )}
                  
                  {section.fields?.map((field) => (
                    <Form.Group key={field.id} className="mb-3">
                      <Form.Label>
                        {field.fieldLabel}
                        {field.isRequired && <span className="text-danger ms-1">*</span>}
                      </Form.Label>
                      {field.description && (
                        <Form.Text className="d-block mb-2 text-muted">
                          {field.description}
                        </Form.Text>
                      )}
                      
                      {/* Render field preview based on type */}
                      {field.fieldType === 'Text' && (
                        <Form.Control 
                          type="text" 
                          placeholder={field.placeholder || field.fieldLabel}
                          disabled 
                        />
                      )}
                      {field.fieldType === 'TextArea' && (
                        <Form.Control 
                          as="textarea" 
                          rows={3}
                          placeholder={field.placeholder || field.fieldLabel}
                          disabled 
                        />
                      )}
                      {field.fieldType === 'Number' && (
                        <Form.Control 
                          type="number" 
                          placeholder={field.placeholder}
                          min={field.minValue}
                          max={field.maxValue}
                          disabled 
                        />
                      )}
                      {field.fieldType === 'Select' && (
                        <Form.Select disabled>
                          <option>בחר אפשרות...</option>
                          {field.options?.map((option, i) => (
                            <option key={i} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                      )}
                      {field.fieldType === 'Date' && (
                        <Form.Control type="date" disabled />
                      )}
                      {field.fieldType === 'File' && (
                        <Form.Control type="file" disabled />
                      )}
                    </Form.Group>
                  ))}
                </Card.Body>
              </Card>
            ))}
          </Card.Body>
        </Card>
      </Col>
      <Col lg={4}>
        <Card className="sticky-top" style={{ top: '90px' }}>
          <Card.Header className="bg-info text-white">
            <h6 className="mb-0">
              <i className="bi bi-check-circle me-2"></i>
              סיכום הטופס
            </h6>
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span>סך סעיפים:</span>
                <Badge bg="primary">{sections.length}</Badge>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>סך שדות:</span>
                <Badge bg="info">{sections.reduce((sum, s) => sum + (s.fields?.length || 0), 0)}</Badge>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>סעיפים חובה:</span>
                <Badge bg="warning">{sections.filter(s => s.isRequired).length}</Badge>
              </div>
              <div className="d-flex justify-content-between">
                <span>סך ניקוד:</span>
                <Badge bg="success">{sections.reduce((sum, s) => sum + (s.maxPoints || 0), 0)}</Badge>
              </div>
            </div>
            
            <hr />
            
            <div className="small text-muted">
              <strong>שם:</strong> {formInfo.formName}
              <br />
              <strong>תקופה:</strong> {new Date(formInfo.startDate).toLocaleDateString('he-IL')} - {new Date(formInfo.endDate).toLocaleDateString('he-IL')}
              <br />
              <strong>סטטוס:</strong> {formInfo.isActive ? 'פעיל' : 'לא פעיל'}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  if (error && !formInfo.formName) {
    return (
      <Container>
        <ErrorAlert error={error} onRetry={() => setError('')} />
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-plus-square me-2"></i>
                בניית טופס חדש
              </h2>
              <p className="text-muted">צור טופס הצטיינות חדש עם סעיפים ושדות מותאמים</p>
            </div>
            <Button variant="outline-secondary" onClick={() => navigate('/manager/forms')}>
              <i className="bi bi-arrow-right me-2"></i>
              חזור לניהול טפסים
            </Button>
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

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Steps Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Navigation Buttons */}
      <Row className="mt-4">
        <Col>
          <div className="d-flex justify-content-between">
            <div>
              {currentStep > 1 && (
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <i className="bi bi-arrow-right me-2"></i>
                  שלב קודם
                </Button>
              )}
            </div>
            
            <div className="d-flex gap-2">
              {currentStep < 3 ? (
                <Button 
                  variant="primary" 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && !validateStep1()) ||
                    (currentStep === 2 && !validateStep2())
                  }
                >
                  שלב הבא
                  <i className="bi bi-arrow-left ms-2"></i>
                </Button>
              ) : (
                <>
                  <Button 
                    variant="warning" 
                    onClick={() => handleSaveForm(false)}
                    disabled={saving || publishing}
                  >
                    {saving ? (
                      <>
                        <i className="spinner-border spinner-border-sm me-2"></i>
                        שומר...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        שמור כטיוטה
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={() => handleSaveForm(true)}
                    disabled={saving || publishing}
                  >
                    {publishing ? (
                      <>
                        <i className="spinner-border spinner-border-sm me-2"></i>
                        מפרסם...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-globe me-2"></i>
                        שמור ופרסם
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Add Section Modal */}
      <Modal show={showAddSectionModal} onHide={() => setShowAddSectionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>הוספת סעיף חדש</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>כותרת הסעיף <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={newSection.title}
                onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                placeholder="לדוגמה: פעילויות הוראה"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>תיאור הסעיף</Form.Label>
              <Form.Control
                type="text"
                value={newSection.description}
                onChange={(e) => setNewSection({...newSection, description: e.target.value})}
                placeholder="תיאור קצר של הסעיף"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>הסבר מפורט</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newSection.explanation}
                onChange={(e) => setNewSection({...newSection, explanation: e.target.value})}
                placeholder="הסבר מפורט שיוצג למרצה במילוי הטופס"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ניקוד מקסימלי</Form.Label>
                  <Form.Control
                    type="number"
                    value={newSection.maxPoints}
                    onChange={(e) => setNewSection({...newSection, maxPoints: parseInt(e.target.value) || 0})}
                    min="0"
                    max="100"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>רמה</Form.Label>
                  <Form.Select
                    value={newSection.level}
                    onChange={(e) => setNewSection({...newSection, level: parseInt(e.target.value)})}
                  >
                    <option value={0}>סעיף ראשי</option>
                    <option value={1}>תת-סעיף</option>
                    <option value={2}>תת-תת-סעיף</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="סעיף חובה"
                checked={newSection.isRequired}
                onChange={(e) => setNewSection({...newSection, isRequired: e.target.checked})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddSectionModal(false)}>
            ביטול
          </Button>
          <Button variant="primary" onClick={handleAddSection}>
            <i className="bi bi-plus me-2"></i>
            הוסף סעיף
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Field Modal */}
      <Modal show={showAddFieldModal} onHide={() => setShowAddFieldModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>הוספת שדה חדש</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>תווית השדה <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={newField.fieldLabel}
                onChange={(e) => setNewField({...newField, fieldLabel: e.target.value})}
                placeholder="לדוגמה: מספר שיעורים שניתנו"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>תיאור השדה</Form.Label>
              <Form.Control
                type="text"
                value={newField.description}
                onChange={(e) => setNewField({...newField, description: e.target.value})}
                placeholder="הסבר נוסף על השדה"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>סוג השדה</Form.Label>
                  <Form.Select
                    value={newField.fieldType}
                    onChange={(e) => setNewField({...newField, fieldType: e.target.value})}
                  >
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>טקסט רושם</Form.Label>
                  <Form.Control
                    type="text"
                    value={newField.placeholder}
                    onChange={(e) => setNewField({...newField, placeholder: e.target.value})}
                    placeholder="טקסט עזר בשדה"
                  />
                </Form.Group>
              </Col>
            </Row>

            {newField.fieldType === 'Number' && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ערך מינימלי</Form.Label>
                    <Form.Control
                      type="number"
                      value={newField.minValue}
                      onChange={(e) => setNewField({...newField, minValue: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ערך מקסימלי</Form.Label>
                    <Form.Control
                      type="number"
                      value={newField.maxValue}
                      onChange={(e) => setNewField({...newField, maxValue: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            {(newField.fieldType === 'Select' || newField.fieldType === 'Radio' || newField.fieldType === 'Checkbox') && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="mb-0">אפשרויות</Form.Label>
                  <Button size="sm" variant="outline-primary" onClick={handleAddFieldOption}>
                    <i className="bi bi-plus me-1"></i>
                    הוסף אפשרות
                  </Button>
                </div>
                {newField.options.map((option, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <Form.Control
                      type="text"
                      placeholder="תווית"
                      value={option.label}
                      onChange={(e) => handleUpdateFieldOption(index, 'label', e.target.value)}
                      className="me-2"
                    />
                    <Form.Control
                      type="text"
                      placeholder="ערך"
                      value={option.value}
                      onChange={(e) => handleUpdateFieldOption(index, 'value', e.target.value)}
                      className="me-2"
                    />
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleRemoveFieldOption(index)}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="שדה חובה"
                checked={newField.isRequired}
                onChange={(e) => setNewField({...newField, isRequired: e.target.checked})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddFieldModal(false)}>
            ביטול
          </Button>
          <Button variant="primary" onClick={handleAddField}>
            <i className="bi bi-plus me-2"></i>
            הוסף שדה
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FormBuilder;