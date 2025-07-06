// src/pages/DepartmentHead/ReviewForms.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { instanceService } from '../../services/instanceService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const DeptHeadReviewForms = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState(''); // 'approve' or 'reject'
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    filterForms();
  }, [forms, activeTab]);

  const loadForms = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת כל הטפסים לבדיקה
      const allForms = await instanceService.getInstancesForReview();
      
      // סינון רק טפסים מהמחלקה שלי
      const departmentForms = allForms.filter(instance => 
        instance.userDepartmentID === user.departmentID
      );

      setForms(departmentForms);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterForms = () => {
    let filtered = [...forms];

    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(f => f.currentStage === 'Submitted');
        break;
      case 'approved':
        filtered = filtered.filter(f => f.currentStage === 'ApprovedByDepartment');
        break;
      case 'rejected':
        filtered = filtered.filter(f => f.currentStage === 'Rejected');
        break;
      default:
        break;
    }

    // מיון לפי תאריך הגשה
    filtered.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
    
    setFilteredForms(filtered);
  };

  const handleReviewClick = (instance, action) => {
    setSelectedInstance(instance);
    setReviewAction(action);
    setComments('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedInstance || !reviewAction) return;

    setProcessing(true);
    try {
      if (reviewAction === 'approve') {
        await instanceService.approveInstance(selectedInstance.instanceId, comments);
      } else if (reviewAction === 'reject') {
        if (!comments.trim()) {
          setError('יש להוסיף הערות לדחיית טופס');
          return;
        }
        await instanceService.rejectInstance(selectedInstance.instanceId, comments);
      }

      // רענון הרשימה
      await loadForms();
      
      // סגירת המודל
      setShowReviewModal(false);
      setSelectedInstance(null);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Submitted': { variant: 'warning', text: 'ממתין לבדיקה', icon: 'bi-clock' },
      'ApprovedByDepartment': { variant: 'success', text: 'אושר', icon: 'bi-check-circle' },
      'Rejected': { variant: 'danger', text: 'נדחה', icon: 'bi-x-circle' }
    };

    const config = statusMap[status] || { variant: 'light', text: status, icon: 'bi-question' };
    return (
      <Badge bg={config.variant}>
        <i className={`${config.icon} me-1`}></i>
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'לא זמין';
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner message="טוען טפסים לבדיקה..." />;

  return (
    <Container>
      {/* כותרת */}
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="bi bi-clipboard-check me-2"></i>
            בדיקת טפסים - מחלקה {user?.departmentID}
          </h2>
          <p className="text-muted">בדוק ואשר טפסים שהוגשו על ידי מרצי המחלקה</p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <ErrorAlert error={error} onRetry={loadForms} />
          </Col>
        </Row>
      )}

      {/* טאבים */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Tabs activeKey={activeTab} onSelect={setActiveTab} className="border-0">
                <Tab 
                  eventKey="pending" 
                  title={
                    <span>
                      <i className="bi bi-clock me-1"></i>
                      ממתינים לבדיקה
                      {forms.filter(f => f.currentStage === 'Submitted').length > 0 && (
                        <Badge bg="warning" className="ms-1">
                          {forms.filter(f => f.currentStage === 'Submitted').length}
                        </Badge>
                      )}
                    </span>
                  } 
                />
                <Tab 
                  eventKey="approved" 
                  title={
                    <span>
                      <i className="bi bi-check-circle me-1"></i>
                      אושרו
                      {forms.filter(f => f.currentStage === 'ApprovedByDepartment').length > 0 && (
                        <Badge bg="success" className="ms-1">
                          {forms.filter(f => f.currentStage === 'ApprovedByDepartment').length}
                        </Badge>
                      )}
                    </span>
                  } 
                />
                <Tab 
                  eventKey="rejected" 
                  title={
                    <span>
                      <i className="bi bi-x-circle me-1"></i>
                      נדחו
                      {forms.filter(f => f.currentStage === 'Rejected').length > 0 && (
                        <Badge bg="danger" className="ms-1">
                          {forms.filter(f => f.currentStage === 'Rejected').length}
                        </Badge>
                      )}
                    </span>
                  } 
                />
              </Tabs>
            </Card.Header>
            <Card.Body>
              {filteredForms.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3 text-muted">
                    {activeTab === 'pending' && 'אין טפסים הממתינים לבדיקה'}
                    {activeTab === 'approved' && 'אין טפסים מאושרים'}
                    {activeTab === 'rejected' && 'אין טפסים שנדחו'}
                  </h4>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>מרצה</th>
                        <th>טופס</th>
                        <th>תאריך הגשה</th>
                        <th>סטטוס</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredForms.map((instance) => (
                        <tr key={instance.instanceId}>
                          <td>
                            <div>
                              <strong>{instance.firstName} {instance.lastName}</strong>
                              <div className="small text-muted">{instance.userID}</div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{instance.formName || `טופס ${instance.formId}`}</strong>
                              {instance.totalScore > 0 && (
                                <div className="small text-muted">
                                  ציון: <Badge bg="info">{instance.totalScore}</Badge>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{formatDate(instance.submissionDate)}</td>
                          <td>{getStatusBadge(instance.currentStage)}</td>
                          <td>
                            <div className="d-flex gap-1">
                              {instance.currentStage === 'Submitted' && (
                                <>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleReviewClick(instance, 'approve')}
                                    disabled={processing}
                                  >
                                    <i className="bi bi-check me-1"></i>
                                    אשר
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleReviewClick(instance, 'reject')}
                                    disabled={processing}
                                  >
                                    <i className="bi bi-x me-1"></i>
                                    דחה
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => {/* פתיחת מודל צפייה */}}
                              >
                                <i className="bi bi-eye me-1"></i>
                                צפה
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal אישור/דחיה */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {reviewAction === 'approve' ? 'אישור טופס' : 'דחיית טופס'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInstance && (
            <>
              <div className="mb-3">
                <strong>מרצה:</strong> {selectedInstance.firstName} {selectedInstance.lastName}
              </div>
              <div className="mb-3">
                <strong>טופס:</strong> {selectedInstance.formName || `טופס ${selectedInstance.formId}`}
              </div>
              
              <Form.Group>
                <Form.Label>
                  הערות {reviewAction === 'reject' && <span className="text-danger">*</span>}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    reviewAction === 'approve' 
                      ? 'הערות נוספות (אופציונלי)'
                      : 'נא פרט מדוע הטופס נדחה'
                  }
                  required={reviewAction === 'reject'}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)} disabled={processing}>
            ביטול
          </Button>
          <Button 
            variant={reviewAction === 'approve' ? 'success' : 'danger'} 
            onClick={handleReviewSubmit}
            disabled={processing || (reviewAction === 'reject' && !comments.trim())}
          >
            {processing ? (
              <>
                <i className="spinner-border spinner-border-sm me-2"></i>
                מעבד...
              </>
            ) : (
              <>
                <i className={`bi ${reviewAction === 'approve' ? 'bi-check' : 'bi-x'} me-2`}></i>
                {reviewAction === 'approve' ? 'אשר טופס' : 'דחה טופס'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DeptHeadReviewForms;