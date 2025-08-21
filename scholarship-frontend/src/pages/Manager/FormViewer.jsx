// src/pages/Manager/FormViewer.jsx - מתוקן
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Accordion, Badge, Tabs, Tab, Form } from 'react-bootstrap';
import { formService } from '../../services/formService';
import { instanceService } from '../../services/instanceService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const FormViewer = () => {
  const { id: formId } = useParams();
  const navigate = useNavigate();
  
  // Form data
  const [formInfo, setFormInfo] = useState(null);
  const [sections, setSections] = useState([]);
  const [formStats, setFormStats] = useState({});
  const [fieldOptions, setFieldOptions] = useState({}); // מחזיק את כל האופציות לפי fieldId

  // UI states
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // תיקון: הגדרת שמות סוגי השדות כקבוע ולא ב-state
  const fieldTypeNames = {
    'Select': 'בחירה',
    'Text': 'טקסט',
    'TextArea': 'שדה טקסט ארוך',
    'Number': 'מספר',
    'Radio': 'רדיו',
    'Checkbox': 'תיבת סימון',
    'Date': 'תאריך',
    'File': 'קובץ'
  };

  useEffect(() => {
    loadFormData();
  }, [formId]);

  const loadFormData = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת נתוני הטופס
      const form = await formService.getFormById(formId);
      setFormInfo(form);

      // טעינת מבנה הטופס
      try {
        const structure = await formService.getFormStructure(formId);
        const structureArray = Array.isArray(structure) ? structure : [];
        
        // טעינת אופציות לכל שדה שצריך
        const optionsMap = {};
        for (const section of structureArray) {
          if (section.fields && Array.isArray(section.fields)) {
            for (const field of section.fields) {
              if (['Select', 'Radio', 'Checkbox'].includes(field.fieldType)) {
                try {
                  const options = await formService.getFieldOptions(field.fieldID);
                  optionsMap[field.fieldID] = options;
                } catch (err) {
                  console.warn(`Could not load options for field ${field.fieldID}:`, err);
                  optionsMap[field.fieldID] = [];
                }
              }
            }
          }
          
          // גם לתתי-סעיפים
          if (section.subSections && Array.isArray(section.subSections)) {
            for (const subSection of section.subSections) {
              if (subSection.fields && Array.isArray(subSection.fields)) {
                for (const field of subSection.fields) {
                  if (['Select', 'Radio', 'Checkbox'].includes(field.fieldType)) {
                    try {
                      const options = await formService.getFieldOptions(field.fieldID);
                      optionsMap[field.fieldID] = options;
                    } catch (err) {
                      console.warn(`Could not load options for field ${field.fieldID}:`, err);
                      optionsMap[field.fieldID] = [];
                    }
                  }
                }
              }
            }
          }
        }
        
        setFieldOptions(optionsMap);
        setSections(structureArray);
      } catch (err) {
        console.warn('Could not load form structure:', err);
        setSections([]);
      }

      // טעינת סטטיסטיקות
      try {
        const instances = await instanceService.getInstancesByFormId?.(formId) || [];
        setFormStats({
          totalSubmissions: instances.length,
          approved: instances.filter(i => ['FinalApproved', 'AppealApproved'].includes(i.currentStage)).length,
          pending: instances.filter(i => ['Submitted', 'ApprovedByDepartment', 'ApprovedByDean'].includes(i.currentStage)).length,
          rejected: instances.filter(i => ['Rejected', 'AppealRejected'].includes(i.currentStage)).length
        });
      } catch (err) {
        console.warn('Could not load form stats:', err);
        setFormStats({});
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFieldTypeIcon = (type) => {
    const icons = {
      'Text': 'bi-input-cursor-text',
      'TextArea': 'bi-textarea-resize',
      'Number': 'bi-123',
      'Select': 'bi-menu-button-wide',
      'Radio': 'bi-record-circle',
      'Checkbox': 'bi-check-square',
      'Date': 'bi-calendar3',
      'File': 'bi-file-earmark-arrow-up'
    };
    return icons[type] || 'bi-question-circle';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'לא הוגדר';
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const getStatusBadge = (form) => {
    if (!form.isActive) {
      return <Badge bg="secondary">לא פעיל</Badge>;
    } else if (form.isPublished) {
      return <Badge bg="success">מפורסם</Badge>;
    } else {
      return <Badge bg="warning">טיוטה</Badge>;
    }
  };

  // פונקציה לרנדור שדה בתצוגה מקדימה
  const renderFieldPreview = (field) => {
    const options = fieldOptions[field.fieldID] || [];
    
    switch (field.fieldType) {
      case 'Text':
        return (
          <Form.Control
            type="text"
            placeholder={field.placeholder || 'הכנס טקסט...'}
            disabled
          />
        );
        
      case 'TextArea':
        return (
          <Form.Control
            as="textarea"
            rows={3}
            placeholder={field.placeholder || 'הכנס טקסט ארוך...'}
            disabled
          />
        );
        
      case 'Number':
        return (
          <Form.Control
            type="number"
            placeholder={field.placeholder || 'הכנס מספר...'}
            min={field.minValue}
            max={field.maxValue}
            disabled
          />
        );
        
      case 'Select':
        return (
          <Form.Select disabled>
            <option>בחר אפשרות...</option>
            {options.map((option, i) => (
              <option key={option.optionID || i} value={option.optionValue}>
                {option.optionLabel || option.optionValue}
              </option>
            ))}
          </Form.Select>
        );
        
      case 'Radio':
        return (
          <div>
            {options.length > 0 ? (
              options.map((option, i) => (
                <Form.Check
                  key={option.optionID || i}
                  type="radio"
                  name={`field_${field.fieldID}_preview`}
                  label={option.optionLabel || option.optionValue}
                  value={option.optionValue}
                  disabled
                />
              ))
            ) : (
              <span className="text-muted">אין אפשרויות</span>
            )}
          </div>
        );
        
      case 'Checkbox':
        return (
          <div>
            {options.length > 0 ? (
              options.map((option, i) => (
                <Form.Check
                  key={option.optionID || i}
                  type="checkbox"
                  label={option.optionLabel || option.optionValue}
                  value={option.optionValue}
                  disabled
                />
              ))
            ) : (
              <span className="text-muted">אין אפשרויות</span>
            )}
          </div>
        );
        
      case 'Date':
        return (
          <Form.Control
            type="date"
            disabled
          />
        );
        
      case 'File':
        return (
          <Form.Control
            type="file"
            disabled
          />
        );
        
      default:
        return (
          <Form.Control
            type="text"
            placeholder="סוג שדה לא מוכר"
            disabled
          />
        );
    }
  };

  if (loading) return <LoadingSpinner message="טוען נתוני הטופס..." />;

  if (error) {
    return (
      <Container>
        <ErrorAlert error={error} onRetry={loadFormData} />
      </Container>
    );
  }

  if (!formInfo) {
    return (
      <Container>
        <Alert variant="warning">הטופס לא נמצא</Alert>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-eye me-2"></i>
                צפייה בטופס: {formInfo.formName}
              </h2>
              <div className="d-flex gap-2 mt-2">
                {getStatusBadge(formInfo)}
                <Badge bg={formInfo.isActive ? 'success' : 'secondary'}>
                  {formInfo.isActive ? 'פעיל' : 'לא פעיל'}
                </Badge>
                                  {console.log(formStats)}

                {formStats.totalSubmissions > 0 && (
                  <Badge bg="info">
                    {formStats.totalSubmissions} הגשות
                  </Badge>
                )}
                <Badge bg="light" text="dark">
                  <i className="bi bi-lock me-1"></i>
                  מצב צפייה בלבד
                </Badge>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/manager/forms')}
              >
                <i className="bi bi-arrow-right me-1"></i>
                חזור לרשימה
              </Button>
              
              {!formInfo.isPublished && (
                <Button 
                  variant="primary"
                  onClick={() => navigate(`/manager/forms/edit/${formId}`)}
                >
                  <i className="bi bi-pencil me-2"></i>
                  עבור למצב עריכה
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Info Alert */}
      <Row className="mb-4">
        <Col>
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            <strong>מצב צפייה בלבד:</strong> אתה רואה את הטופס כפי שהוא יופיע למרצים. 
            {!formInfo.isPublished && ' ניתן לעבור למצב עריכה בכל עת.'}
          </Alert>
        </Col>
      </Row>

      {/* Tabs */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="p-0">
              <Tabs activeKey={activeTab} onSelect={setActiveTab} className="border-0">
                <Tab eventKey="basic" title={
                  <span>
                    <i className="bi bi-info-circle me-2"></i>
                    פרטים בסיסיים
                  </span>
                }>
                </Tab>
                <Tab eventKey="structure" title={
                  <span>
                    <i className="bi bi-diagram-3 me-2"></i>
                    מבנה הטופס
                    <Badge bg="secondary" className="ms-2">{sections.length}</Badge>
                  </span>
                }>
                </Tab>
                <Tab eventKey="preview" title={
                  <span>
                    <i className="bi bi-eye me-2"></i>
                    תצוגה מקדימה
                  </span>
                }>
                </Tab>
                <Tab eventKey="stats" title={
                  <span>
                    <i className="bi bi-bar-chart me-2"></i>
                    סטטיסטיקות
                  </span>
                }>
                </Tab>
              </Tabs>
            </Card.Header>
            <Card.Body>
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div>
                  <Row>
                    <Col md={8}>
                      <Card className="mb-4">
                        <Card.Header>
                          <h6 className="mb-0">פרטי הטופס</h6>
                        </Card.Header>
                        <Card.Body>
                          <Row className="mb-3">
                            <Col sm={3}><strong>שם הטופס:</strong></Col>
                            <Col>{formInfo.formName}</Col>
                          </Row>
                          <Row className="mb-3">
                            <Col sm={3}><strong>תיאור:</strong></Col>
                            <Col>{formInfo.description || 'אין תיאור'}</Col>
                          </Row>
                          <Row className="mb-3">
                            <Col sm={3}><strong>הוראות:</strong></Col>
                            <Col>{formInfo.instructions || 'אין הוראות מיוחדות'}</Col>
                          </Row>
                          <Row className="mb-3">
                            <Col sm={3}><strong>שנה אקדמית:</strong></Col>
                            <Col>{formInfo.academicYear || 'לא הוגדר'}</Col>
                          </Row>
                          <Row className="mb-3">
                            <Col sm={3}><strong>סמסטר:</strong></Col>
                            <Col>
                              {formInfo.semester === 'A' ? 'סמסטר א\'' : 
                               formInfo.semester === 'B' ? 'סמסטר ב\'' : 
                               formInfo.semester === 'C' ? 'סמסטר ג\' (קיץ)' : 
                               formInfo.semester || 'לא הוגדר'}
                            </Col>
                          </Row>
                          <Row className="mb-3">
                            <Col sm={3}><strong>תאריך התחלה:</strong></Col>
                            <Col>{formatDate(formInfo.startDate)}</Col>
                          </Row>
                          <Row className="mb-3">
                            <Col sm={3}><strong>תאריך סיום:</strong></Col>
                            <Col>{formatDate(formInfo.dueDate || formInfo.endDate)}</Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={4}>
                      <Card className="bg-light">
                        <Card.Header>
                          <h6 className="mb-0">מידע נוסף</h6>
                        </Card.Header>
                        <Card.Body>
                          <div className="small">
                            <div className="d-flex justify-content-between mb-2">
                              <span>נוצר:</span>
                              <span>{formatDate(formInfo.creationDate)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span>עודכן:</span>
                              <span>{formatDate(formInfo.lastModifiedDate)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span>יוצר:</span>
                              <span>{formInfo.createdBy || 'לא זמין'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span>סעיפים:</span>
                              <span>{sections.length}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span>שדות:</span>
                              <span>{sections.reduce((total, section) => 
                                total + (section.fields?.length || 0) + 
                                (section.subSections?.reduce((subTotal, sub) => 
                                  subTotal + (sub.fields?.length || 0), 0) || 0), 0)}</span>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Structure Tab */}
              {activeTab === 'structure' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5>מבנה הטופס</h5>
                    <Badge bg="light" text="dark">
                      <i className="bi bi-lock me-1"></i>
                      מצב צפייה בלבד
                    </Badge>
                  </div>

                  {sections.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-diagram-3 text-muted" style={{ fontSize: '3rem' }}></i>
                      <h4 className="mt-3 text-muted">אין סעיפים בטופס</h4>
                      <p className="text-muted">הטופס עדיין לא הוגדר</p>
                    </div>
                  ) : (
                    <Accordion>
                      {sections.map((section, sectionIndex) => (
                        <Accordion.Item key={section.sectionID || sectionIndex} eventKey={sectionIndex.toString()}>
                          <Accordion.Header>
                            <div className="d-flex justify-content-between w-100 me-3">
                              <div>
                                <strong>{section.title}</strong>
                                {section.description && (
                                  <div className="small text-muted">{section.description}</div>
                                )}
                              </div>
                              <div className="d-flex gap-2">
                                <Badge bg="light" text="dark">
                                  {(section.fields?.length || 0) + 
                                   (section.subSections?.reduce((total, sub) => 
                                     total + (sub.fields?.length || 0), 0) || 0)} שדות
                                </Badge>
                                {section.maxPoints && (
                                  <Badge bg="info">{section.maxPoints} נקודות</Badge>
                                )}
                                {section.isRequired && (
                                  <Badge bg="danger">חובה</Badge>
                                )}
                              </div>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            {section.explanation && (
                              <Alert variant="info" className="mb-3">
                                <small><strong>הסבר:</strong> {section.explanation}</small>
                              </Alert>
                            )}

                            {/* שדות של הסעיף */}
                            {section.fields && section.fields.length > 0 && (
                              <div className="mb-3">
                                <h6>שדות בסעיף:</h6>
                                <div className="row">
                                  {section.fields.map((field, fieldIndex) => {
                                    const options = fieldOptions[field.fieldID] || [];
                                    return (
                                      <div key={field.fieldID || fieldIndex} className="col-md-6 mb-3">
                                        <Card className="h-100">
                                          <Card.Body className="p-3">
                                            <div className="d-flex align-items-start justify-content-between">
                                              <div className="flex-grow-1">
                                                <div className="d-flex align-items-center mb-2">
                                                  <i className={`${getFieldTypeIcon(field.fieldType)} me-2 text-primary`}></i>
                                                  <strong>{field.fieldLabel}</strong>
                                                  {field.isRequired && <span className="text-danger ms-1">*</span>}
                                                </div>
                                                
                                                <div className="small text-muted mb-1">
                                                  <strong>סוג:</strong> {fieldTypeNames[field.fieldType] || field.fieldType}
                                                </div>
                                                
                                                {field.helpText && (
                                                  <div className="small text-muted mb-1">
                                                    <strong>תיאור:</strong> {field.helpText}
                                                  </div>
                                                )}
                                                
                                                {field.placeholder && (
                                                  <div className="small text-muted mb-1">
                                                    <strong>טקסט עזר:</strong> {field.placeholder}
                                                  </div>
                                                )}

                                                {options.length > 0 && (
                                                  <div className="small text-muted">
                                                    <strong>אפשרויות:</strong> {options.map(opt => 
                                                      opt.optionLabel || opt.optionValue).join(', ')}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* תתי-סעיפים */}
                            {section.subSections && section.subSections.length > 0 && (
                              <div className="ms-4">
                                <h6 className="text-secondary mb-3">תתי-סעיפים:</h6>
                                {section.subSections.map((subSection, subIndex) => (
                                  <Card key={subSection.sectionID || subIndex} className="mb-3">
                                    <Card.Header className="bg-light">
                                      <strong>{subSection.title}</strong>
                                      {subSection.description && (
                                        <div className="small text-muted">{subSection.description}</div>
                                      )}
                                    </Card.Header>
                                    <Card.Body>
                                      {subSection.fields && subSection.fields.length > 0 && (
                                        <div className="row">
                                          {subSection.fields.map((field, fieldIndex) => {
                                            const options = fieldOptions[field.fieldID] || [];
                                            return (
                                              <div key={field.fieldID || fieldIndex} className="col-md-6 mb-3">
                                                <Card className="h-100">
                                                  <Card.Body className="p-3">
                                                    <div className="flex-grow-1">
                                                      <div className="d-flex align-items-center mb-2">
                                                        <i className={`${getFieldTypeIcon(field.fieldType)} me-2 text-primary`}></i>
                                                        <strong>{field.fieldLabel}</strong>
                                                        {field.isRequired && <span className="text-danger ms-1">*</span>}
                                                      </div>
                                                      
                                                      <div className="small text-muted mb-1">
                                                        <strong>סוג:</strong> {fieldTypeNames[field.fieldType] || field.fieldType}
                                                      </div>
                                                      
                                                      {options.length > 0 && (
                                                        <div className="small text-muted">
                                                          <strong>אפשרויות:</strong> {options.map(opt => 
                                                            opt.optionLabel || opt.optionValue).join(', ')}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </Card.Body>
                                                </Card>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </Card.Body>
                                  </Card>
                                ))}
                              </div>
                            )}

                            {(!section.fields || section.fields.length === 0) && 
                             (!section.subSections || section.subSections.length === 0) && (
                              <div className="text-center py-3 text-muted">
                                <i className="bi bi-input-cursor-text"></i>
                                <div>אין שדות בסעיף זה</div>
                              </div>
                            )}
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  )}
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div>
                  <div className="mb-4">
                    <h5>תצוגה מקדימה - כפי שהמרצים יראו</h5>
                    <p className="text-muted">זוהי תצוגה מקדימה של איך הטופס ייראה למרצים בעת המילוי</p>
                  </div>

                  <Card className="border-primary">
                    <Card.Header className="bg-primary text-white">
                      <h6 className="mb-0">
                        <i className="bi bi-file-earmark-text me-2"></i>
                        {formInfo.formName}
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      {formInfo.instructions && (
                        <Alert variant="info" className="mb-4">
                          <h6>הוראות מילוי:</h6>
                          <p className="mb-0">{formInfo.instructions}</p>
                        </Alert>
                      )}

                      {sections.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
                          <h4 className="mt-3 text-warning">הטופס ריק</h4>
                          <p className="text-muted">הטופס לא מכיל סעיפים ושדות למילוי</p>
                        </div>
                      ) : (
                        sections.map((section, sectionIndex) => (
                          <Card key={section.sectionID || sectionIndex} className="mb-4">
                            <Card.Header>
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">
                                  {section.title}
                                  {section.isRequired && <span className="text-danger ms-1">*</span>}
                                </h6>
                                {section.maxPoints && (
                                  <Badge bg="info">{section.maxPoints} נקודות</Badge>
                                )}
                              </div>
                              {section.description && (
                                <small className="text-muted d-block mt-1">{section.description}</small>
                              )}
                            </Card.Header>
                            <Card.Body>
                              {section.explanation && (
                                <Alert variant="light" className="mb-3">
                                  <small>{section.explanation}</small>
                                </Alert>
                              )}

                              {/* שדות של הסעיף */}
                              {section.fields && section.fields.length > 0 && (
                                <div className="row">
                                  {section.fields.map((field, fieldIndex) => (
                                    <div key={field.fieldID || fieldIndex} className="col-md-6 mb-3">
                                      <Form.Group>
                                        <Form.Label>
                                          {field.fieldLabel}
                                          {field.isRequired && <span className="text-danger ms-1">*</span>}
                                        </Form.Label>
                                        
                                        {renderFieldPreview(field)}
                                        
                                        {field.helpText && (
                                          <Form.Text className="text-muted">
                                            {field.helpText}
                                          </Form.Text>
                                        )}
                                      </Form.Group>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* תתי-סעיפים */}
                              {section.subSections && section.subSections.length > 0 && (
                                <div className="ms-4 mt-3">
                                  <h6 className="text-secondary mb-3">תתי-סעיפים:</h6>
                                  {section.subSections.map((subSection, subIndex) => (
                                    <Card key={subSection.sectionID || subIndex} className="mb-3">
                                      <Card.Header className="bg-light">
                                        <strong>{subSection.title}</strong>
                                        {subSection.description && (
                                          <div className="small text-muted">{subSection.description}</div>
                                        )}
                                      </Card.Header>
                                      <Card.Body>
                                        {subSection.explanation && (
                                          <Alert variant="light" className="mb-3">
                                            <small>{subSection.explanation}</small>
                                          </Alert>
                                        )}
                                        
                                        {subSection.fields && subSection.fields.length > 0 && (
                                          <div className="row">
                                            {subSection.fields.map((field, fieldIndex) => (
                                              <div key={field.fieldID || fieldIndex} className="col-md-6 mb-3">
                                                <Form.Group>
                                                  <Form.Label>
                                                    {field.fieldLabel}
                                                    {field.isRequired && <span className="text-danger ms-1">*</span>}
                                                  </Form.Label>
                                                  
                                                  {renderFieldPreview(field)}
                                                  
                                                  {field.helpText && (
                                                    <Form.Text className="text-muted">
                                                      {field.helpText}
                                                    </Form.Text>
                                                  )}
                                                </Form.Group>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </Card.Body>
                                    </Card>
                                  ))}
                                </div>
                              )}

                              {(!section.fields || section.fields.length === 0) && 
                               (!section.subSections || section.subSections.length === 0) && (
                                <div className="text-muted text-center py-3">
                                  <i className="bi bi-info-circle me-1"></i>
                                  אין שדות בסעיף זה
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        ))
                      )}
                    </Card.Body>
                  </Card>
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === 'stats' && (
                <div>
                  <h5 className="mb-4">סטטיסטיקות הטופס</h5>
                  
                  <Row className="mb-4">
                    <Col md={3} className="mb-3">
                      <Card className="text-center h-100 border-info">
                        <Card.Body>
                          <i className="bi bi-file-earmark-text text-info" style={{ fontSize: '2rem' }}></i>
                          <h3 className="mt-2 mb-1 text-info">{formStats.totalSubmissions || 0}</h3>
                          <small className="text-muted">סך הגשות</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Card className="text-center h-100 border-success">
                        <Card.Body>
                          <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
                          <h3 className="mt-2 mb-1 text-success">{formStats.approved || 0}</h3>
                          <small className="text-muted">מאושרים</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Card className="text-center h-100 border-warning">
                        <Card.Body>
                          <i className="bi bi-hourglass-split text-warning" style={{ fontSize: '2rem' }}></i>
                          <h3 className="mt-2 mb-1 text-warning">{formStats.pending || 0}</h3>
                          <small className="text-muted">בבדיקה</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Card className="text-center h-100 border-danger">
                        <Card.Body>
                          <i className="bi bi-x-circle text-danger" style={{ fontSize: '2rem' }}></i>
                          <h3 className="mt-2 mb-1 text-danger">{formStats.rejected || 0}</h3>
                          <small className="text-muted">נדחו</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {formStats.totalSubmissions === 0 && (
                    <div className="text-center py-5">
                      <i className="bi bi-graph-up text-muted" style={{ fontSize: '3rem' }}></i>
                      <h4 className="mt-3 text-muted">אין נתונים להצגה</h4>
                      <p className="text-muted">עדיין לא הוגשו טפסים</p>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FormViewer;