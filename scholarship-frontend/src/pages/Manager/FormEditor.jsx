// src/pages/Manager/FormEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Accordion, Badge, ProgressBar, Tabs, Tab } from 'react-bootstrap';
import { formService } from '../../services/formService';
import { instanceService } from '../../services/instanceService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const FormEditor = () => {
  const { id: formId } = useParams();
  const navigate = useNavigate();
  
  // Form data
  const [originalForm, setOriginalForm] = useState(null);
  const [formInfo, setFormInfo] = useState({
    formName: '',
    description: '',
    academicYear: new Date().getFullYear(),
    semester: 'A',
    startDate: '',
    endDate: '',
    isActive: true,
    isPublished: false
  });

  // Form structure
  const [sections, setSections] = useState([]);
  const [formStats, setFormStats] = useState({});
  
  // UI states
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Modals
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  // Add section form
  const [newSection, setNewSection] = useState({
    title: '',
    description: '',
    explanation: '',
    maxPoints: '',
    isRequired: false,
    orderIndex: 0
  });

  // Add field form
  const [newField, setNewField] = useState({
    fieldLabel: '',
    fieldType: 'Text',
    description: '',
    placeholder: '',
    isRequired: false,
    options: []
  });

  useEffect(() => {
    loadFormData();
  }, [formId]);

  useEffect(() => {
    if (originalForm) {
      const changed = JSON.stringify({...formInfo, sections}) !== JSON.stringify({
        formName: originalForm.formName,
        description: originalForm.description,
        academicYear: originalForm.academicYear,
        semester: originalForm.semester,
        startDate: originalForm.startDate,
        endDate: originalForm.endDate,
        isActive: originalForm.isActive,
        isPublished: originalForm.isPublished,
        sections: originalForm.sections || []
      });
      setHasChanges(changed);
    }
  }, [formInfo, sections, originalForm]);

  const loadFormData = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת נתוני הטופס
      const form = await formService.getFormById(formId);
      setOriginalForm(form);
      
      setFormInfo({
        formName: form.formName || '',
        description: form.description || '',
        academicYear: form.academicYear || new Date().getFullYear(),
        semester: form.semester || 'A',
        startDate: form.startDate || '',
        endDate: form.endDate || '',
        isActive: form.isActive !== false,
        isPublished: form.isPublished || false
      });

      // טעינת מבנה הטופס
      try {
        const structure = await formService.getFormStructure(formId);
        setSections(Array.isArray(structure) ? structure : []);
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

  const handleSave = async (publish = false) => {
    if (publish) {
      setPublishing(true);
    } else {
      setSaving(true);
    }

    try {
      // עדכון פרטי הטופס
      const updatedForm = {
        ...originalForm,
        ...formInfo,
        isPublished: publish || formInfo.isPublished
      };

      await formService.updateForm(formId, updatedForm);

      if (publish && !formInfo.isPublished) {
        // פרסום הטופס
        await formService.publishForm(formId);
      }

      // רענון הנתונים
      await loadFormData();
      setError('');
      
      // הודעת הצלחה (יכול להוסיף toast)
      console.log(publish ? 'Form published successfully' : 'Form saved successfully');

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setPublishing(false);
      setShowPublishModal(false);
    }
  };

  const addSection = () => {
    const section = {
      ...newSection,
      id: Date.now(),
      orderIndex: sections.length + 1,
      fields: []
    };
    
    setSections([...sections, section]);
    setNewSection({
      title: '',
      description: '',
      explanation: '',
      maxPoints: '',
      isRequired: false,
      orderIndex: 0
    });
    setShowAddSectionModal(false);
    setHasChanges(true);
  };

  const removeSection = (index) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הסעיף?')) {
      const updated = sections.filter((_, i) => i !== index);
      setSections(updated);
      setHasChanges(true);
    }
  };

  const addFieldToSection = (sectionIndex) => {
    const field = {
      ...newField,
      id: Date.now(),
      orderIndex: (sections[sectionIndex]?.fields?.length || 0) + 1
    };
    
    const updated = [...sections];
    if (!updated[sectionIndex].fields) {
      updated[sectionIndex].fields = [];
    }
    updated[sectionIndex].fields.push(field);
    
    setSections(updated);
    setNewField({
      fieldLabel: '',
      fieldType: 'Text',
      description: '',
      placeholder: '',
      isRequired: false,
      options: []
    });
    setShowAddFieldModal(false);
    setHasChanges(true);
  };

  const removeField = (sectionIndex, fieldIndex) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את השדה?')) {
      const updated = [...sections];
      updated[sectionIndex].fields = updated[sectionIndex].fields.filter((_, i) => i !== fieldIndex);
      setSections(updated);
      setHasChanges(true);
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

  if (loading) return <LoadingSpinner message="טוען נתוני הטופס..." />;

  if (error && !originalForm) {
    return (
      <Container>
        <ErrorAlert error={error} onRetry={loadFormData} />
      </Container>
    );
  }

  const canEdit = !formInfo.isPublished || formStats.totalSubmissions === 0;

  return (
    <Container>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-pencil-square me-2"></i>
                עריכת טופס: {formInfo.formName}
              </h2>
              <div className="d-flex gap-2 mt-2">
                <Badge bg={formInfo.isPublished ? 'success' : 'warning'}>
                  {formInfo.isPublished ? 'מפורסם' : 'טיוטה'}
                </Badge>
                <Badge bg={formInfo.isActive ? 'success' : 'secondary'}>
                  {formInfo.isActive ? 'פעיל' : 'לא פעיל'}
                </Badge>
                {formStats.totalSubmissions > 0 && (
                  <Badge bg="info">
                    {formStats.totalSubmissions} הגשות
                  </Badge>
                )}
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
              
              {hasChanges && (
                <Button 
                  variant="warning" 
                  onClick={() => handleSave(false)}
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
                      שמור שינויים
                    </>
                  )}
                </Button>
              )}

              {canEdit && !formInfo.isPublished && (
                <Button 
                  variant="success" 
                  onClick={() => setShowPublishModal(true)}
                  disabled={publishing}
                >
                  <i className="bi bi-globe me-2"></i>
                  פרסם טופס
                </Button>
              )}
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

      {!canEdit && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>אזהרה:</strong> הטופס מפורסם ויש לו הגשות. שינויים במבנה יכולים להשפיע על הנתונים הקיימים.
            </Alert>
          </Col>
        </Row>
      )}

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
                <Form>
                  <Row>
                    <Col md={8}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>שם הטופס <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              value={formInfo.formName}
                              onChange={(e) => setFormInfo({...formInfo, formName: e.target.value})}
                              placeholder="הכנס שם לטופס"
                              disabled={!canEdit}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>שנה אקדמית</Form.Label>
                            <Form.Control
                              type="number"
                              value={formInfo.academicYear}
                              onChange={(e) => setFormInfo({...formInfo, academicYear: parseInt(e.target.value)})}
                              min="2020"
                              max="2030"
                              disabled={!canEdit}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>תיאור הטופס</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={formInfo.description}
                          onChange={(e) => setFormInfo({...formInfo, description: e.target.value})}
                          placeholder="תאר את מטרת הטופס ותוכנו"
                          disabled={!canEdit}
                        />
                      </Form.Group>

                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>סמסטר</Form.Label>
                            <Form.Select
                              value={formInfo.semester}
                              onChange={(e) => setFormInfo({...formInfo, semester: e.target.value})}
                              disabled={!canEdit}
                            >
                              <option value="A">סמסטר א'</option>
                              <option value="B">סמסטר ב'</option>
                              <option value="C">סמסטר ג' (קיץ)</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>תאריך התחלה</Form.Label>
                            <Form.Control
                              type="date"
                              value={formInfo.startDate}
                              onChange={(e) => setFormInfo({...formInfo, startDate: e.target.value})}
                              disabled={!canEdit}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>תאריך סיום</Form.Label>
                            <Form.Control
                              type="date"
                              value={formInfo.endDate}
                              onChange={(e) => setFormInfo({...formInfo, endDate: e.target.value})}
                              disabled={!canEdit}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Check
                            type="switch"
                            id="isActive"
                            label="טופס פעיל"
                            checked={formInfo.isActive}
                            onChange={(e) => setFormInfo({...formInfo, isActive: e.target.checked})}
                            disabled={!canEdit}
                          />
                        </Col>
                      </Row>
                    </Col>

                    <Col md={4}>
                      <Card className="bg-light">
                        <Card.Header>
                          <h6 className="mb-0">מידע על הטופס</h6>
                        </Card.Header>
                        <Card.Body>
                          <div className="small">
                            <div className="d-flex justify-content-between mb-2">
                              <span>נוצר:</span>
                              <span>{formatDate(originalForm?.creationDate)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span>עודכן:</span>
                              <span>{formatDate(originalForm?.lastModifiedDate)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span>יוצר:</span>
                              <span>{originalForm?.createdBy || 'לא זמין'}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span>סעיפים:</span>
                              <span>{sections.length}</span>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Form>
              )}

              {/* Structure Tab */}
              {activeTab === 'structure' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5>מבנה הטופס</h5>
                    {canEdit && (
                      <Button variant="primary" onClick={() => setShowAddSectionModal(true)}>
                        <i className="bi bi-plus-circle me-2"></i>
                        הוסף סעיף
                      </Button>
                    )}
                  </div>

                  {sections.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-diagram-3 text-muted" style={{ fontSize: '3rem' }}></i>
                      <h4 className="mt-3 text-muted">אין סעיפים בטופס</h4>
                      <p className="text-muted">התחל בהוספת הסעיף הראשון</p>
                      {canEdit && (
                        <Button variant="primary" onClick={() => setShowAddSectionModal(true)}>
                          הוסף סעיף ראשון
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Accordion>
                      {sections.map((section, sectionIndex) => (
                        <Accordion.Item key={section.id || sectionIndex} eventKey={sectionIndex.toString()}>
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
                                  {section.fields?.length || 0} שדות
                                </Badge>
                                {section.maxPoints && (
                                  <Badge bg="info">{section.maxPoints} נקודות</Badge>
                                )}
                              </div>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            {section.explanation && (
                              <Alert variant="info" className="mb-3">
                                <small>{section.explanation}</small>
                              </Alert>
                            )}

                            {/* Fields */}
                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6>שדות בסעיף:</h6>
                                {canEdit && (
                                  <Button 
                                    size="sm" 
                                    variant="outline-primary"
                                    onClick={() => {
                                      setSelectedSection(sectionIndex);
                                      setShowAddFieldModal(true);
                                    }}
                                  >
                                    <i className="bi bi-plus me-1"></i>
                                    הוסף שדה
                                  </Button>
                                )}
                              </div>

                              {(!section.fields || section.fields.length === 0) ? (
                                <div className="text-center py-3 text-muted">
                                  <i className="bi bi-input-cursor-text"></i>
                                  <div>אין שדות בסעיף זה</div>
                                </div>
                              ) : (
                                <div className="row">
                                  {section.fields.map((field, fieldIndex) => (
                                    <div key={field.id || fieldIndex} className="col-md-6 mb-2">
                                      <div className="border rounded p-2 d-flex justify-content-between align-items-center">
                                        <div>
                                          <div className="d-flex align-items-center">
                                            <i className={`${getFieldTypeIcon(field.fieldType)} me-2 text-primary`}></i>
                                            <strong>{field.fieldLabel}</strong>
                                            {field.isRequired && <span className="text-danger ms-1">*</span>}
                                          </div>
                                          <small className="text-muted">{field.fieldType}</small>
                                        </div>
                                        {canEdit && (
                                          <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => removeField(sectionIndex, fieldIndex)}
                                          >
                                            <i className="bi bi-trash"></i>
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {canEdit && (
                              <div className="text-end">
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => removeSection(sectionIndex)}
                                >
                                  <i className="bi bi-trash me-1"></i>
                                  מחק סעיף
                                </Button>
                              </div>
                            )}
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  )}
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

                  {formStats.totalSubmissions > 0 && (
                    <Card>
                      <Card.Header>
                        <h6 className="mb-0">התפלגות סטטוסים</h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>מאושרים ({formStats.approved})</span>
                            <span>{Math.round((formStats.approved / formStats.totalSubmissions) * 100)}%</span>
                          </div>
                          <ProgressBar 
                            variant="success" 
                            now={(formStats.approved / formStats.totalSubmissions) * 100} 
                          />
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>בבדיקה ({formStats.pending})</span>
                            <span>{Math.round((formStats.pending / formStats.totalSubmissions) * 100)}%</span>
                          </div>
                          <ProgressBar 
                            variant="warning" 
                            now={(formStats.pending / formStats.totalSubmissions) * 100} 
                          />
                        </div>
                        
                        <div className="mb-0">
                          <div className="d-flex justify-content-between mb-1">
                            <span>נדחו ({formStats.rejected})</span>
                            <span>{Math.round((formStats.rejected / formStats.totalSubmissions) * 100)}%</span>
                          </div>
                          <ProgressBar 
                            variant="danger" 
                            now={(formStats.rejected / formStats.totalSubmissions) * 100} 
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  )}

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

      {/* Modal Add Section */}
      <Modal show={showAddSectionModal} onHide={() => setShowAddSectionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>הוספת סעיף חדש</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>כותרת הסעיף <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={newSection.title}
                    onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                    placeholder="הכנס כותרת לסעיף"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>ניקוד מקסימלי</Form.Label>
                  <Form.Control
                    type="number"
                    value={newSection.maxPoints}
                    onChange={(e) => setNewSection({...newSection, maxPoints: e.target.value})}
                    placeholder="0"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>תיאור הסעיף</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newSection.description}
                onChange={(e) => setNewSection({...newSection, description: e.target.value})}
                placeholder="תאר את מטרת הסעיף"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>הסבר מפורט</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newSection.explanation}
                onChange={(e) => setNewSection({...newSection, explanation: e.target.value})}
                placeholder="הסבר מפורט שיוצג למשתמש"
              />
            </Form.Group>

            <Form.Check
              type="switch"
              id="sectionRequired"
              label="סעיף חובה"
              checked={newSection.isRequired}
              onChange={(e) => setNewSection({...newSection, isRequired: e.target.checked})}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddSectionModal(false)}>
            ביטול
          </Button>
          <Button 
            variant="primary" 
            onClick={addSection}
            disabled={!newSection.title.trim()}
          >
            <i className="bi bi-plus-circle me-2"></i>
            הוסף סעיף
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Add Field */}
      <Modal show={showAddFieldModal} onHide={() => setShowAddFieldModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>הוספת שדה חדש</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>תווית השדה <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={newField.fieldLabel}
                    onChange={(e) => setNewField({...newField, fieldLabel: e.target.value})}
                    placeholder="הכנס תווית לשדה"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>סוג השדה</Form.Label>
                  <Form.Select
                    value={newField.fieldType}
                    onChange={(e) => setNewField({...newField, fieldType: e.target.value})}
                  >
                    <option value="Text">טקסט קצר</option>
                    <option value="TextArea">טקסט ארוך</option>
                    <option value="Number">מספר</option>
                    <option value="Select">רשימה נפתחת</option>
                    <option value="Radio">בחירה יחידה</option>
                    <option value="Checkbox">בחירה מרובה</option>
                    <option value="Date">תאריך</option>
                    <option value="File">העלאת קובץ</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>תיאור השדה</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newField.description}
                onChange={(e) => setNewField({...newField, description: e.target.value})}
                placeholder="הסבר מה המשתמש צריך למלא"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>טקסט עזר (Placeholder)</Form.Label>
              <Form.Control
                type="text"
                value={newField.placeholder}
                onChange={(e) => setNewField({...newField, placeholder: e.target.value})}
                placeholder="דוגמה: הכנס את שמך המלא"
              />
            </Form.Group>

            <Form.Check
              type="switch"
              id="fieldRequired"
              label="שדה חובה"
              checked={newField.isRequired}
              onChange={(e) => setNewField({...newField, isRequired: e.target.checked})}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddFieldModal(false)}>
            ביטול
          </Button>
          <Button 
            variant="primary" 
            onClick={() => addFieldToSection(selectedSection)}
            disabled={!newField.fieldLabel.trim()}
          >
            <i className="bi bi-plus-circle me-2"></i>
            הוסף שדה
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Publish Confirmation */}
      <Modal show={showPublishModal} onHide={() => setShowPublishModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>פרסום הטופס</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="bi bi-globe text-success" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">האם אתה בטוח?</h5>
            <p className="text-muted">
              לאחר פרסום הטופס, הוא יהיה זמין לכל המרצים למילוי.
              לא יהיה ניתן לערוך את המבנה הבסיסי שלו.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPublishModal(false)}>
            ביטול
          </Button>
          <Button variant="success" onClick={() => handleSave(true)} disabled={publishing}>
            {publishing ? (
              <>
                <i className="spinner-border spinner-border-sm me-2"></i>
                מפרסם...
              </>
            ) : (
              <>
                <i className="bi bi-globe me-2"></i>
                פרסם טופס
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FormEditor;