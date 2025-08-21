// src/pages/Shared/ViewSubmission.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert, Form, Modal, Accordion } from 'react-bootstrap';
import { instanceService } from '../../services/instanceService';
import { formService } from '../../services/formService';
import { getCurrentUser } from '../../services/authService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';
import Swal from 'sweetalert2';

const ViewSubmission = () => {
  const { instanceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [instance, setInstance] = useState(null);
  const [formInfo, setFormInfo] = useState(null);
  const [sections, setSections] = useState([]);
  const [fieldOptions, setFieldOptions] = useState({});
  const [answers, setAnswers] = useState({});
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionComments, setActionComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [canApprove, setCanApprove] = useState(false);

  useEffect(() => {
    loadSubmissionData();
    setCurrentUser(getCurrentUser());
  }, [instanceId]);

  useEffect(() => {
    checkApprovalPermissions();
  }, [instance, currentUser]);

  const loadSubmissionData = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת פרטי המופע
      const instanceData = await instanceService.getInstanceById(instanceId);
      setInstance(instanceData);

      // טעינת נתוני הטופס
      const form = await formService.getFormById(instanceData.formId);
      setFormInfo(form);

      // טעינת מבנה הטופס
      try {
        const structure = await formService.getFormStructure(instanceData.formId);
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

      // טעינת התשובות של המופע
      try {
        const answersData = await instanceService.getInstanceAnswers(instanceId);
        const answersMap = {};
        if (Array.isArray(answersData)) {
          answersData.forEach(answer => {
            answersMap[answer.fieldID] = answer.answer || answer.answerValue || answer.Answer;
          });
        }
        setAnswers(answersMap);
      } catch (err) {
        console.warn('Could not load answers:', err);
        setAnswers({});
      }

    } catch (err) {
      console.error('Error loading submission data:', err);
      setError(err.message || 'שגיאה בטעינת הטופס');
    } finally {
      setLoading(false);
    }
  };

  const checkApprovalPermissions = () => {
    if (!instance || !currentUser) return;

    const userRoles = currentUser.roles || [];
    const currentStage = instance.currentStage || instance.status || instance.CurrentStage;
    // בדיקה האם המשתמש יכול לאשר/לדחות
    if (userRoles[0].roleName === 'מנהל סטודנטים' && currentStage === 'ApprovedByDean') {
      setCanApprove(true);
    } else if (userRoles[0].roleName === 'דיקאן' && currentStage === 'ApprovedByDepartment') {
      setCanApprove(true);
    } else if ((userRoles[0].roleName === 'ראש מחלקה' || userRoles[0].roleName === 'ראש התמחות') && currentStage === 'Submitted') {
      setCanApprove(true);
    } else {
      setCanApprove(false);
    }
    console.log(userRoles,canApprove , currentStage)
  };

  const handleAction = (type) => {
    setActionType(type);
    setActionComments('');
    setShowActionModal(true);
  };

  const handleActionSubmit = async () => {
    setProcessing(true);
    setError('');

    try {
      const id = instance.instanceId || instance.instanceID || instance.InstanceId;
      
      if (actionType === 'approve') {
        await instanceService.approveInstance(id, actionComments);
        Swal.fire({
          icon: 'success',
          title: 'הטופס אושר בהצלחה!',
          text: 'הטופס אושר בהצלחה ועבר למנהל סטודנטים.',
        });
      } else if (actionType === 'reject') {
        if (!actionComments.trim()) {
          setError('יש להוסיף הערה בעת דחיית טופס');
          setProcessing(false);
          return;
        }
        await instanceService.rejectInstance(id, actionComments);
        Swal.fire({
          icon: 'error',
          title: 'הטופס נדחה.',
          text: 'הטופס נדחה.',
        });
      }

      setShowActionModal(false);
      navigate(-1); // חזרה לדף הקודם
    } catch (err) {
      console.error('Error processing action:', err);
      setError(err.message || 'שגיאה בביצוע הפעולה');
      setProcessing(false);
    }
  };

  const getStatusBadge = (stage) => {
    const status = stage || '';
    
    const stageMap = {
      'Draft': { variant: 'secondary', text: 'טיוטה', icon: 'bi-pencil' },
      'Submitted': { variant: 'primary', text: 'הוגש', icon: 'bi-send' },
      'ApprovedByDepartment': { variant: 'info', text: 'אושר במחלקה', icon: 'bi-check' },
      'ApprovedByDean': { variant: 'warning', text: 'אושר בדיקאן', icon: 'bi-check-all' },
      'FinalApproved': { variant: 'success', text: 'אושר סופית', icon: 'bi-check-circle' },
      'Approved': { variant: 'success', text: 'אושר', icon: 'bi-check-circle' },
      'Rejected': { variant: 'danger', text: 'נדחה', icon: 'bi-x-circle' }
    };

    const config = stageMap[status] || { variant: 'light', text: status, icon: 'bi-question' };
    return (
      <Badge bg={config.variant} className="fs-6">
        <i className={`${config.icon} me-1`}></i>
        {config.text}
      </Badge>
    );
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

  const renderFieldValue = (field, value) => {
    if (!value && value !== 0 && value !== false) {
      return <span className="text-muted">לא הוזן</span>;
    }

    switch (field.fieldType) {
      case 'Boolean':
        return value === 'true' || value === true || value === '1' ? 
          <Badge bg="success">כן</Badge> : 
          <Badge bg="secondary">לא</Badge>;
      
      case 'Number':
        return <strong>{value}</strong>;
      
      case 'Date':
        return formatDate(value);
      
      case 'LongText':
      case 'Textarea':
        return (
          <div className="border rounded p-2 bg-light">
            {String(value).split('\n').map((line, idx) => (
              <div key={idx}>{line || <br />}</div>
            ))}
          </div>
        );
      
      case 'Select':
      case 'Radio':
        // נסה למצוא את הטקסט של האופציה
        const options = fieldOptions[field.fieldID] || [];
        const selectedOption = options.find(opt => 
          opt.optionValue === value || opt.value === value
        );
        return (
          <Badge bg="primary">
            {selectedOption?.optionText || selectedOption?.text || value}
          </Badge>
        );
      
      case 'Checkbox':
        // עבור Checkbox מרובה
        if (typeof value === 'string' && value.includes(',')) {
          const values = value.split(',');
          return (
            <div>
              {values.map((v, idx) => (
                <Badge key={idx} bg="primary" className="me-1 mb-1">
                  {v.trim()}
                </Badge>
              ))}
            </div>
          );
        }
        return <Badge bg="primary">{value}</Badge>;
      
      default:
        return <span>{value}</span>;
    }
  };

  const renderFields = (fields) => {
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return null;
    }

    return (
      <div className="mb-3">
        {fields.map(field => (
          <Row key={field.fieldID} className="mb-3 pb-3 border-bottom">
            <Col md={4}>
              <strong>{field.fieldLabel || field.fieldName}</strong>
              {field.isRequired && <span className="text-danger ms-1">*</span>}
              {field.helpText && (
                <div className="small text-muted">{field.helpText}</div>
              )}
            </Col>
            <Col md={8}>
              {renderFieldValue(field, answers[field.fieldID])}
            </Col>
          </Row>
        ))}
      </div>
    );
  };

  const renderSubSection = (subSection) => {
    return (
      <div key={subSection.subSectionID} className="border-start border-3 ps-3 mb-3">
        <h6 className="text-secondary mb-3">
          {subSection.title}
        </h6>
        {subSection.description && (
          <p className="text-muted small">{subSection.description}</p>
        )}
        {renderFields(subSection.fields)}
      </div>
    );
  };

  const renderSection = (section, index) => {
    const hasContent = (section.fields && section.fields.length > 0) || 
                      (section.subSections && section.subSections.length > 0);
    
    if (!hasContent) return null;

    return (
      <Accordion.Item key={section.sectionID} eventKey={index.toString()}>
        <Accordion.Header>
          <div className="d-flex justify-content-between align-items-center w-100 me-2">
            <div>
              <strong>{section.title}</strong>
              {section.description && (
                <div className="small text-muted">{section.description}</div>
              )}
            </div>
            {section.maxPoints > 0 && (
              <Badge bg="info" className="ms-2">
                {section.maxPoints} נקודות
              </Badge>
            )}
          </div>
        </Accordion.Header>
        <Accordion.Body>
          {/* הצגת השדות של הסעיף */}
          {renderFields(section.fields)}
          
          {/* הצגת תתי-סעיפים */}
          {section.subSections && section.subSections.length > 0 && (
            <div className="mt-4">
              {section.subSections.map(subSection => renderSubSection(subSection))}
            </div>
          )}
        </Accordion.Body>
      </Accordion.Item>
    );
  };

  if (loading) return <LoadingSpinner message="טוען פרטי טופס..." />;

  if (error && !instance) {
    return (
      <Container>
        <ErrorAlert error={error} onRetry={loadSubmissionData} />
      </Container>
    );
  }

  const instanceId_display = instance?.instanceId || instance?.instanceID || instance?.InstanceId;
  const userId_display = instance?.userID || instance?.userId || instance?.UserID;
  const currentStage = instance?.currentStage || instance?.status || instance?.CurrentStage;
  const submissionDate = instance?.submissionDate || instance?.SubmissionDate;
  const totalScore = instance?.totalScore || instance?.TotalScore;
  const comments = instance?.comments || instance?.Comments;

  return (
    <Container>
      {/* כותרת וכפתורי פעולה */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-file-text me-2"></i>
                צפייה בטופס שהוגש
              </h2>
              {formInfo && (
                <p className="text-muted mb-0">{formInfo.formName}</p>
              )}
            </div>
            <div>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate(-1)}
                className="me-2"
              >
                <i className="bi bi-arrow-right me-1"></i>
                חזור
              </Button>
              {canApprove && (
                <>
                  <Button 
                    variant="success" 
                    onClick={() => handleAction('approve')}
                    className="me-2"
                  >
                    <i className="bi bi-check-lg me-1"></i>
                    אשר
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => handleAction('reject')}
                  >
                    <i className="bi bi-x-lg me-1"></i>
                    דחה
                  </Button>
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* פרטי המופע */}
      {instance && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  פרטי ההגשה
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="mb-3">
                    <strong>מספר מופע:</strong>
                    <div className="text-primary">{instanceId_display}</div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <strong>מגיש:</strong>
                    <div>{userId_display}</div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <strong>תאריך הגשה:</strong>
                    <div>{formatDate(submissionDate)}</div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <strong>סטטוס:</strong>
                    <div>{getStatusBadge(currentStage)}</div>
                  </Col>
                </Row>
                
                {(totalScore || comments) && (
                  <Row>
                    {totalScore && (
                      <Col md={3} className="mb-3">
                        <strong>ציון כולל:</strong>
                        <div>
                          <Badge bg="primary" className="fs-5">
                            {totalScore}
                          </Badge>
                        </div>
                      </Col>
                    )}
                    {comments && (
                      <Col md={totalScore ? 9 : 12} className="mb-3">
                        <strong>הערות:</strong>
                        <div className="border rounded p-2 bg-light mt-1">
                          {comments}
                        </div>
                      </Col>
                    )}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* פרטי הטופס */}
      {formInfo && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  פרטי הטופס
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6} className="mb-3">
                    <strong>שם הטופס:</strong>
                    <div>{formInfo.formName}</div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <strong>שנה אקדמית:</strong>
                    <div>{formInfo.academicYear || formInfo.AcademicYear || '-'}</div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <strong>סמסטר:</strong>
                    <div>{formInfo.semester || formInfo.Semester || '-'}</div>
                  </Col>
                </Row>
                {formInfo.description && (
                  <Row>
                    <Col className="mb-3">
                      <strong>תיאור:</strong>
                      <div>{formInfo.description}</div>
                    </Col>
                  </Row>
                )}
                {formInfo.instructions && (
                  <Row>
                    <Col>
                      <strong>הוראות:</strong>
                      <div className="border rounded p-2 bg-light mt-1">
                        {formInfo.instructions}
                      </div>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* תוכן הטופס - סעיפים ותשובות */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="bi bi-list-check me-2"></i>
                תוכן הטופס ותשובות
              </h5>
            </Card.Header>
            <Card.Body>
              {sections.length > 0 ? (
                <Accordion defaultActiveKey="0" flush>
                  {sections.map((section, index) => renderSection(section, index))}
                </Accordion>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">אין סעיפים להצגה</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal לאישור/דחייה */}
      <Modal show={showActionModal} onHide={() => !processing && setShowActionModal(false)} centered>
        <Modal.Header closeButton={!processing}>
          <Modal.Title>
            {actionType === 'approve' ? (
              <>
                <i className="bi bi-check-circle text-success me-2"></i>
                אישור הטופס
              </>
            ) : (
              <>
                <i className="bi bi-x-circle text-danger me-2"></i>
                דחיית הטופס
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant={actionType === 'approve' ? 'success' : 'danger'}>
            {actionType === 'approve' 
              ? 'אתה עומד לאשר את הטופס. הטופס יועבר לשלב הבא בתהליך.'
              : 'אתה עומד לדחות את הטופס. המגיש יקבל הודעה על הדחייה.'}
          </Alert>
          
          <Form.Group>
            <Form.Label>
              <strong>
                הערות 
                {actionType === 'reject' && <span className="text-danger"> *</span>}
              </strong>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={actionComments}
              onChange={(e) => setActionComments(e.target.value)}
              placeholder={
                actionType === 'approve' 
                  ? 'הערות אופציונליות...'
                  : 'נמק את סיבת הדחייה (חובה)...'
              }
              required={actionType === 'reject'}
            />
          </Form.Group>

          {error && (
            <Alert variant="danger" className="mt-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowActionModal(false)}
            disabled={processing}
          >
            ביטול
          </Button>
          <Button 
            variant={actionType === 'approve' ? 'success' : 'danger'} 
            onClick={handleActionSubmit}
            disabled={processing || (actionType === 'reject' && !actionComments.trim())}
          >
            {processing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                מעבד...
              </>
            ) : (
              <>
                <i className={`bi ${actionType === 'approve' ? 'bi-check' : 'bi-x'} me-2`}></i>
                {actionType === 'approve' ? 'אשר' : 'דחה'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ViewSubmission;