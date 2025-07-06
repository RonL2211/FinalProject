// src/pages/Lecturer/SubmitAppeal.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Badge } from 'react-bootstrap';
import { instanceService } from '../../services/instanceService';
import { appealService } from '../../services/appealService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const SubmitAppeal = () => {
  const { id: instanceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [instance, setInstance] = useState(null);
  const [existingAppeals, setExistingAppeals] = useState([]);
  const [canAppeal, setCanAppeal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [instanceId]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת פרטי המופע
      const instanceData = await instanceService.getInstanceById(instanceId);
      
      // בדיקת הרשאות
      if (instanceData.userID !== user.personId) {
        throw new Error('אין הרשאה לצפות במופע זה');
      }

      setInstance(instanceData);

      // בדיקה האם ניתן לערער
      const appealEligibility = await appealService.canUserAppeal(instanceId);
      setCanAppeal(appealEligibility.canAppeal);

      // טעינת ערעורים קיימים
      try {
        const appeals = await appealService.getInstanceAppeals(instanceId);
        setExistingAppeals(appeals);
      } catch (err) {
        // אין ערעורים קיימים - זה בסדר
        setExistingAppeals([]);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAppeal = async () => {
    if (!appealReason.trim()) {
      setError('יש למלא את נימוק הערעור');
      return;
    }

    setSubmitting(true);
    try {
      await appealService.createAppeal(instanceId, appealReason.trim());
      
      navigate('/lecturer/my-forms', {
        state: { message: 'הערעור הוגש בהצלחה ויטופל בהקדם' }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'Rejected': {
        variant: 'danger',
        text: 'נדחה',
        icon: 'bi-x-circle',
        description: 'הטופס נדחה ולא אושר'
      },
      'FinalApproved': {
        variant: 'success',
        text: 'אושר סופית',
        icon: 'bi-check-circle',
        description: 'הטופס אושר סופית אך ניתן עדיין לערער על ההחלטה'
      },
      'AppealRejected': {
        variant: 'danger',
        text: 'ערעור נדחה',
        icon: 'bi-shield-x',
        description: 'הערעור שהגשת נדחה'
      }
    };

    return statusMap[status] || {
      variant: 'light',
      text: status,
      icon: 'bi-question-circle',
      description: ''
    };
  };

  const getAppealStatusBadge = (status) => {
    const statusMap = {
      'Pending': { variant: 'warning', text: 'ממתין' },
      'Approved': { variant: 'success', text: 'אושר' },
      'Rejected': { variant: 'danger', text: 'נדחה' }
    };

    const config = statusMap[status] || { variant: 'light', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  if (loading) return <LoadingSpinner message="טוען פרטי הטופס..." />;

  if (error && !instance) {
    return (
      <Container>
        <ErrorAlert error={error} onRetry={loadData} />
      </Container>
    );
  }

  const statusInfo = instance ? getStatusInfo(instance.currentStage) : null;

  return (
    <Container>
      {/* כותרת */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-megaphone me-2"></i>
                הגשת ערעור
              </h2>
              <p className="text-muted">הגש ערעור על החלטה בטופס</p>
            </div>
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-right me-1"></i>
              חזור
            </Button>
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

      {instance && (
        <>
          {/* פרטי הטופס */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">פרטי הטופס</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>שם הטופס:</strong>
                        <div>{instance.formName || `טופס ${instance.formId}`}</div>
                      </div>
                      <div className="mb-3">
                        <strong>תאריך הגשה:</strong>
                        <div>
                          {instance.submissionDate 
                            ? new Date(instance.submissionDate).toLocaleDateString('he-IL')
                            : 'לא הוגש'
                          }
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>סטטוס נוכחי:</strong>
                        <div className="mt-1">
                          <Badge bg={statusInfo.variant} className="me-2">
                            <i className={`${statusInfo.icon} me-1`}></i>
                            {statusInfo.text}
                          </Badge>
                        </div>
                        <small className="text-muted">{statusInfo.description}</small>
                      </div>
                      {instance.totalScore > 0 && (
                        <div className="mb-3">
                          <strong>ציון:</strong>
                          <div><Badge bg="info">{instance.totalScore}</Badge></div>
                        </div>
                      )}
                    </Col>
                  </Row>
                  
                  {instance.comments && (
                    <div className="mt-3">
                      <strong>הערות:</strong>
                      <div className="mt-1 p-3 bg-light border rounded">
                        {instance.comments}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ערעורים קיימים */}
          {existingAppeals.length > 0 && (
            <Row className="mb-4">
              <Col>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="bi bi-clock-history me-2"></i>
                      ערעורים קודמים
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    {existingAppeals.map((appeal) => (
                      <div key={appeal.appealID} className="border rounded p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <strong>ערעור #{appeal.appealID}</strong>
                            <div className="small text-muted">
                              הוגש: {new Date(appeal.appealDate).toLocaleDateString('he-IL')}
                            </div>
                          </div>
                          <div>
                            {getAppealStatusBadge(appeal.appealStatus)}
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <strong>נימוק הערעור:</strong>
                          <div className="mt-1">{appeal.appealReason}</div>
                        </div>

                        {appeal.reviewerResponse && (
                          <div className="bg-light p-2 rounded">
                            <strong>תשובת המערכת:</strong>
                            <div className="mt-1">{appeal.reviewerResponse}</div>
                            {appeal.reviewDate && (
                              <small className="text-muted">
                                תאריך מענה: {new Date(appeal.reviewDate).toLocaleDateString('he-IL')}
                              </small>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* טופס ערעור חדש */}
          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-plus-circle me-2"></i>
                    הגשת ערעור חדש
                  </h6>
                </Card.Header>
                <Card.Body>
                  {!canAppeal ? (
                    <Alert variant="warning">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      <strong>לא ניתן להגיש ערעור</strong>
                      <div className="mt-2">
                        {existingAppeals.some(a => a.appealStatus === 'Pending') ? (
                          'יש כבר ערעור ממתין על טופס זה'
                        ) : (
                          'הטופס לא בסטטוס המאפשר הגשת ערעור'
                        )}
                      </div>
                    </Alert>
                  ) : (
                    <Form>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          נימוק הערעור <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Text className="d-block mb-2 text-muted">
                          נא פרט את הסיבות לערעור. ציין עובדות ספציפיות ותמך את טענותיך בדוגמאות קונקרטיות.
                        </Form.Text>
                        <Form.Control
                          as="textarea"
                          rows={6}
                          value={appealReason}
                          onChange={(e) => setAppealReason(e.target.value)}
                          placeholder="הכנס כאן את נימוק הערעור המפורט..."
                          required
                        />
                        <Form.Text className="text-muted">
                          מינימום 20 תווים, מומלץ להיות מפורט ומדויק
                        </Form.Text>
                      </Form.Group>

                      <Alert variant="info">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>חשוב לדעת:</strong>
                        <ul className="mb-0 mt-2">
                          <li>הערעור יטופל על ידי מנהל הסטודנטים</li>
                          <li>תקבל הודעה על החלטה בערעור</li>
                          <li>לאחר הגשת הערעור לא ניתן לבטל או לערוך אותו</li>
                          <li>ניתן להגיש ערעור אחד בלבד לכל טופס</li>
                        </ul>
                      </Alert>

                      <div className="d-flex gap-3">
                        <Button
                          variant="primary"
                          onClick={() => setShowConfirmModal(true)}
                          disabled={appealReason.trim().length < 20 || submitting}
                        >
                          <i className="bi bi-send me-2"></i>
                          הגש ערעור
                        </Button>
                        
                        <Button
                          variant="outline-secondary"
                          onClick={() => navigate('/lecturer/my-forms')}
                        >
                          ביטול
                        </Button>
                      </div>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Modal אישור הגשת ערעור */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>אישור הגשת ערעור</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="bi bi-megaphone text-warning" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">האם אתה בטוח?</h5>
            <p className="text-muted">
              לאחר הגשת הערעור לא יהיה ניתן לערוך או לבטל אותו.
              הערעור יועבר לטיפול מנהל הסטודנטים.
            </p>
          </div>
          
          <div className="bg-light p-3 rounded mt-3">
            <h6>תקציר הערעור:</h6>
            <div className="small">
              {appealReason.length > 100 
                ? `${appealReason.substring(0, 100)}...` 
                : appealReason
              }
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowConfirmModal(false)}
            disabled={submitting}
          >
            ביטול
          </Button>
          <Button 
            variant="warning" 
            onClick={handleSubmitAppeal} 
            disabled={submitting}
          >
            {submitting ? (
              <>
                <i className="spinner-border spinner-border-sm me-2"></i>
                מגיש ערעור...
              </>
            ) : (
              <>
                <i className="bi bi-send me-2"></i>
                אישור הגשה
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SubmitAppeal;