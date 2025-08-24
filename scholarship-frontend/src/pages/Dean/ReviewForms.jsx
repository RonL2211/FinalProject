// // src/pages/Dean/ReviewForms.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { instanceService } from '../../services/instanceService';
import { formService } from '../../services/formService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';
import Swal from 'sweetalert2';

const DeanReviewForms = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [allFormDetails, setAllFormDetails] = useState([]);

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
      // טעינת פרטי כל הטפסים
      const formsList = await formService.getAllForms();
      setAllFormDetails(formsList);

      // טעינת הטפסים לבדיקה - השרת כבר מחזיר רק את הטפסים של הפקולטה
      const instances = await instanceService.getInstancesForReview();
      
      // הוספת פרטי הטופס לכל מופע
      const enrichedInstances = instances.map(instance => {
        const formDetails = formsList.find(f => f.formID === instance.formId);
        return {
          ...instance,
          formName: formDetails?.formName || `טופס ${instance.formId}`,
          formDescription: formDetails?.description,
          academicYear: formDetails?.academicYear,
          semester: formDetails?.semester
        };
      });

      setForms(enrichedInstances);
    } catch (err) {
      setError(err.message || 'שגיאה בטעינת הטפסים');
    } finally {
      setLoading(false);
    }
  };
        console.log("filtered", forms)


  const filterForms = () => {
    let filtered = [...forms];

    switch (activeTab) {
      case 'pending':
        // טפסים שממתינים לאישור הדיקאן
        filtered = filtered.filter(f => f.currentStage === 'ApprovedByDepartment');
        break;
      case 'approved':
        // טפסים שהדיקאן כבר אישר
        filtered = filtered.filter(f => 
          f.currentStage === 'ApprovedByDean' || 
          f.currentStage === 'FinalApproved'
        );
        break;
      case 'rejected':
        // טפסים שנדחו
        filtered = filtered.filter(f => f.currentStage === 'Rejected');
        break;
      case 'all':
        // כל הטפסים
        break;
      default:
        break;
    }

    // מיון לפי תאריך עדכון אחרון
    filtered.sort((a, b) => new Date(b.lastModifiedDate || b.submissionDate) - new Date(a.lastModifiedDate || a.submissionDate));
    
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
    setError('');
    
    try {
      if (reviewAction === 'approve') {
        await instanceService.approveInstance(selectedInstance.instanceId, comments);
        Swal.fire({
          icon: 'success',
          title: 'הטופס אושר בהצלחה ועבר למנהל סטודנטים!',
        });
      } else if (reviewAction === 'reject') {
        if (!comments.trim()) {
          setError('יש להוסיף הערות לדחיית טופס');
          setProcessing(false);
          return;
        }
        await instanceService.rejectInstance(selectedInstance.instanceId, comments);
        Swal.fire({
          icon: 'error',
          title: 'הטופס נדחה.',
        });
      }

      // רענון הרשימה
      await loadForms();
      
      // סגירת המודל
      setShowReviewModal(false);
      setSelectedInstance(null);
    } catch (err) {
      setError(err.message || 'שגיאה בעיבוד הבקשה');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ApprovedByDepartment': { variant: 'warning', text: 'ממתין לאישור דיקאן', icon: 'bi-clock' },
      'ApprovedByDean': { variant: 'info', text: 'אושר על ידי דיקאן', icon: 'bi-check-all' },
      'FinalApproved': { variant: 'success', text: 'אושר סופית', icon: 'bi-check-circle-fill' },
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

  const getCountByStatus = (status) => {
    switch (status) {
      case 'pending':
        return forms.filter(f => f.currentStage === 'ApprovedByDepartment').length;
      case 'approved':
        return forms.filter(f => 
          f.currentStage === 'ApprovedByDean' || 
          f.currentStage === 'FinalApproved'
        ).length;
      case 'rejected':
        return forms.filter(f => f.currentStage === 'Rejected').length;
      default:
        return 0;
    }
  };

  if (loading) return <LoadingSpinner message="טוען טפסים לבדיקה..." />;

  return (
    <Container>
      {/* כותרת */}
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="bi bi-building me-2"></i>
            בדיקת טפסים - דיקאן
          </h2>
          <p className="text-muted">בדוק ואשר טפסים שאושרו על ידי ראשי המחלקות בפקולטה</p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <ErrorAlert error={error} onRetry={loadForms} />
          </Col>
        </Row>
      )}

      {/* סטטיסטיקות */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-warning">
            <Card.Body>
              <i className="bi bi-clock text-warning" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-warning">{getCountByStatus('pending')}</h3>
              <small className="text-muted">ממתינים לאישור</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-success">
            <Card.Body>
              <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-success">{getCountByStatus('approved')}</h3>
              <small className="text-muted">אושרו</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-danger">
            <Card.Body>
              <i className="bi bi-x-circle text-danger" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-danger">{getCountByStatus('rejected')}</h3>
              <small className="text-muted">נדחו</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-info">
            <Card.Body>
              <i className="bi bi-file-text text-info" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-info">{forms.length}</h3>
              <small className="text-muted">סך הכל</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
                      {getCountByStatus('pending') > 0 && (
                        <Badge bg="warning" className="ms-1">
                          {getCountByStatus('pending')}
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
                      {getCountByStatus('approved') > 0 && (
                        <Badge bg="success" className="ms-1">
                          {getCountByStatus('approved')}
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
                      {getCountByStatus('rejected') > 0 && (
                        <Badge bg="danger" className="ms-1">
                          {getCountByStatus('rejected')}
                        </Badge>
                      )}
                    </span>
                  } 
                />
                <Tab 
                  eventKey="all" 
                  title={
                    <span>
                      <i className="bi bi-list me-1"></i>
                      הכל
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
                    {activeTab === 'approved' && 'אין טפסים שאושרו'}
                    {activeTab === 'rejected' && 'אין טפסים שנדחו'}
                    {activeTab === 'all' && 'אין טפסים להצגה'}
                  </h4>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>מרצה</th>
                        <th>טופס</th>
                        <th>שנה/סמסטר</th>
                        <th>תאריך עדכון</th>
                        <th>סטטוס</th>
                        <th>ציון</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredForms.map((instance, index) => (
                        <tr key={instance.instanceId}>
                          <td>{index + 1}</td>
                          <td>
                            <div>
                              <strong>{instance.fullName || `${instance.firstName} ${instance.lastName}`}</strong>
                              <div className="small text-muted">{instance.userID}</div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{instance.formName}</strong>
                              {instance.formDescription && (
                                <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                                  {instance.formDescription}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {instance.academicYear ? (
                              <div>
                                {instance.academicYear}
                                {instance.semester && ` / ${instance.semester}`}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>{formatDate(instance.lastModifiedDate || instance.submissionDate)}</td>
                          <td>{getStatusBadge(instance.currentStage)}</td>
                          <td>
                            {instance.totalScore ? (
                              <Badge bg="info">{instance.totalScore}</Badge>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                as={Link}
                                to={`/view-submission/${instance.instanceId}`}
                                variant="outline-info"
                                size="sm"
                                title="צפייה בטופס"
                              >
                                <i className="bi bi-eye"></i>
                              </Button>
                              
                              {instance.currentStage === 'ApprovedByDepartment' && (
                                <>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleReviewClick(instance, 'approve')}
                                    disabled={processing}
                                    title="אישור"
                                  >
                                    <i className="bi bi-check-lg"></i>
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleReviewClick(instance, 'reject')}
                                    disabled={processing}
                                    title="דחייה"
                                  >
                                    <i className="bi bi-x-lg"></i>
                                  </Button>
                                </>
                              )}
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
      <Modal show={showReviewModal} onHide={() => !processing && setShowReviewModal(false)} centered>
        <Modal.Header closeButton={!processing}>
          <Modal.Title>
            {reviewAction === 'approve' ? (
              <>
                <i className="bi bi-check-circle text-success me-2"></i>
                אישור טופס בפקולטה
              </>
            ) : (
              <>
                <i className="bi bi-x-circle text-danger me-2"></i>
                דחיית טופס בפקולטה
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInstance && (
            <>
              <Alert variant={reviewAction === 'approve' ? 'info' : 'warning'}>
                {reviewAction === 'approve' 
                  ? 'אישור הטופס יעביר אותו לאישור סופי של מנהל סטודנטים.'
                  : 'דחיית הטופס תחזיר אותו למרצה עם ההערות שלך.'}
              </Alert>

              <div className="mb-3">
                <strong>מרצה:</strong> {selectedInstance.fullName || `${selectedInstance.firstName} ${selectedInstance.lastName}`}
              </div>
              <div className="mb-3">
                <strong>ת.ז.:</strong> {selectedInstance.userID}
              </div>
              <div className="mb-3">
                <strong>טופס:</strong> {selectedInstance.formName}
              </div>
              {selectedInstance.totalScore && (
                <div className="mb-3">
                  <strong>ציון:</strong> <Badge bg="info" className="ms-2">{selectedInstance.totalScore}</Badge>
                </div>
              )}
              
              <Form.Group className="mt-4">
                <Form.Label>
                  <strong>הערות {reviewAction === 'reject' && <span className="text-danger">*</span>}</strong>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    reviewAction === 'approve' 
                      ? 'הערות אופציונליות לאישור...'
                      : 'נמק את סיבת הדחייה (חובה)...'
                  }
                  required={reviewAction === 'reject'}
                />
              </Form.Group>

              {error && (
                <Alert variant="danger" className="mt-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}
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
                <span className="spinner-border spinner-border-sm me-2"></span>
                מעבד...
              </>
            ) : (
              <>
                <i className={`bi ${reviewAction === 'approve' ? 'bi-check' : 'bi-x'} me-2`}></i>
                {reviewAction === 'approve' ? 'אשר ועבר למנהל' : 'דחה טופס'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DeanReviewForms;