// src/pages/Department/DepartmentSubmissionsReview.jsx
// דף אוניברסלי לדיקאן ולראש מחלקה/התמחות
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form, Alert, Tabs, Tab, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { instanceService } from '../../services/instanceService';
import { formService } from '../../services/formService';
import { authService } from '../../services/authService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const DepartmentSubmissionsReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  
  // Filters
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState('all');
  const [forms, setForms] = useState([]);

  useEffect(() => {
    determineUserRole();
    loadData();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, activeTab, searchTerm, selectedForm]);

  const determineUserRole = () => {
    const user = authService.getCurrentUser();
    if (user?.roles) {
      if (user.roles.includes('דיקאן')) {
        setUserRole('דיקאן');
      } else if (user.roles.includes('ראש מחלקה') || user.roles.includes('ראש התמחות')) {
        setUserRole('ראש מחלקה');
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת כל הטפסים
      const allForms = await formService.getAllForms();
      setForms(allForms);

      // טעינת המופעים לבדיקה - לפי ההרשאות של המשתמש
      const reviewSubmissions = await instanceService.getInstancesForReview();
      
      console.log('Submissions for review:', reviewSubmissions);

      // הוספת פרטים נוספים לכל הגשה
      const enrichedSubmissions = await Promise.all(
        reviewSubmissions.map(async (submission) => {
          try {
            const form = allForms.find(f => f.formID === submission.formId);
            
            return {
              ...submission,
              formName: form?.formName || `טופס ${submission.formId}`,
              formDescription: form?.description,
              academicYear: form?.academicYear,
              semester: form?.semester
            };
          } catch (err) {
            console.error('Error enriching submission:', err);
            return submission;
          }
        })
      );

      setSubmissions(enrichedSubmissions);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // סינון לפי טאב (סטטוס)
    switch (activeTab) {
      case 'pending':
        // לראש מחלקה: Submitted, לדיקאן: ApprovedByDepartment
        if (userRole === 'דיקאן') {
          filtered = filtered.filter(s => 
            s.currentStage === 'ApprovedByDepartment' || 
            s.status === 'ApprovedByDepartment'
          );
        } else {
          filtered = filtered.filter(s => 
            s.currentStage === 'Submitted' || 
            s.status === 'Submitted'
          );
        }
        break;
      case 'approved':
        // טפסים שאושרו
        if (userRole === 'דיקאן') {
          filtered = filtered.filter(s => 
            s.currentStage === 'ApprovedByDean' ||
            s.status === 'ApprovedByDean'
          );
        } else {
          filtered = filtered.filter(s => 
            s.currentStage === 'ApprovedByDepartment' ||
            s.status === 'ApprovedByDepartment'
          );
        }
        break;
      case 'rejected':
        filtered = filtered.filter(s => 
          s.currentStage === 'Rejected' ||
          s.status === 'Rejected'
        );
        break;
      case 'all':
        break;
      default:
        break;
    }

    // סינון לפי טופס
    if (selectedForm !== 'all') {
      filtered = filtered.filter(s => s.formId === parseInt(selectedForm));
    }

    // חיפוש טקסט
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(submission =>
        submission.userID?.toLowerCase().includes(searchLower) ||
        submission.userId?.toLowerCase().includes(searchLower) ||
        submission.formName?.toLowerCase().includes(searchLower) ||
        submission.firstName?.toLowerCase().includes(searchLower) ||
        submission.lastName?.toLowerCase().includes(searchLower) ||
        submission.fullName?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredSubmissions(filtered);
  };

  const handleReviewClick = (submission, action) => {
    setSelectedSubmission(submission);
    setReviewAction(action);
    setReviewComments('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedSubmission || !reviewAction) return;

    setProcessing(true);
    setError('');
    
    try {
      const instanceId = selectedSubmission.instanceId || selectedSubmission.instanceID;
      
      if (reviewAction === 'approve') {
        await instanceService.approveInstance(instanceId, reviewComments);
        alert('הטופס אושר בהצלחה!');
      } else if (reviewAction === 'reject') {
        if (!reviewComments.trim()) {
          setError('יש להוסיף הערה בעת דחיית טופס');
          setProcessing(false);
          return;
        }
        await instanceService.rejectInstance(instanceId, reviewComments);
        alert('הטופס נדחה.');
      }

      // רענון הרשימה
      await loadData();
      
      // סגירת המודל
      setShowReviewModal(false);
      setSelectedSubmission(null);
      setReviewComments('');
    } catch (err) {
      console.error('Error processing review:', err);
      setError(err.message || 'שגיאה בעיבוד הבקשה');
    } finally {
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
      day: 'numeric'
    });
  };

  const getSubmissionsByStatus = (status) => {
    const pendingStage = userRole === 'דיקאן' ? 'ApprovedByDepartment' : 'Submitted';
    const approvedStage = userRole === 'דיקאן' ? 'ApprovedByDean' : 'ApprovedByDepartment';

    switch (status) {
      case 'pending':
        return submissions.filter(s => 
          s.currentStage === pendingStage || s.status === pendingStage
        ).length;
      case 'approved':
        return submissions.filter(s => 
          s.currentStage === approvedStage || s.status === approvedStage
        ).length;
      case 'rejected':
        return submissions.filter(s => 
          s.currentStage === 'Rejected' || s.status === 'Rejected'
        ).length;
      default:
        return 0;
    }
  };

  const getPageTitle = () => {
    if (userRole === 'דיקאן') {
      return 'אישור טפסים - דיקאן';
    } else if (userRole === 'ראש מחלקה') {
      return 'אישור טפסים - ראש מחלקה';
    }
    return 'אישור טפסים';
  };

  const getPageDescription = () => {
    if (userRole === 'דיקאן') {
      return 'אישור טפסים שעברו אישור מחלקה';
    } else if (userRole === 'ראש מחלקה') {
      return 'אישור טפסים שהוגשו במחלקה';
    }
    return 'בדיקה ואישור טפסים';
  };

  if (loading) return <LoadingSpinner message="טוען טפסים לבדיקה..." />;

  // בדיקה האם ניתן לאשר/לדחות
  const canReview = (submission) => {
    const currentStatus = submission.currentStage || submission.status;
    if (userRole === 'דיקאן') {
      return currentStatus === 'ApprovedByDepartment';
    } else if (userRole === 'ראש מחלקה') {
      return currentStatus === 'Submitted';
    }
    return false;
  };

  return (
    <Container>
      {/* כותרת */}
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="bi bi-clipboard-check me-2"></i>
            {getPageTitle()}
          </h2>
          <p className="text-muted">{getPageDescription()}</p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <ErrorAlert error={error} onRetry={loadData} />
          </Col>
        </Row>
      )}

      {/* סטטיסטיקות */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-warning">
            <Card.Body>
              <i className="bi bi-clock text-warning" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-warning">{getSubmissionsByStatus('pending')}</h3>
              <small className="text-muted">ממתינים לאישור</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-success">
            <Card.Body>
              <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-success">{getSubmissionsByStatus('approved')}</h3>
              <small className="text-muted">אושרו</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-danger">
            <Card.Body>
              <i className="bi bi-x-circle text-danger" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-danger">{getSubmissionsByStatus('rejected')}</h3>
              <small className="text-muted">נדחו</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-info">
            <Card.Body>
              <i className="bi bi-file-text text-info" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-info">{submissions.length}</h3>
              <small className="text-muted">סך הכל</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* סינונים */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="חפש לפי שם או ת.ז..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={selectedForm}
                    onChange={(e) => setSelectedForm(e.target.value)}
                  >
                    <option value="all">כל הטפסים</option>
                    {forms.map(form => (
                      <option key={form.formID} value={form.formID}>
                        {form.formName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Button variant="outline-primary" onClick={loadData} className="w-100">
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    רענן רשימה
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* טאבים ורשימת טפסים */}
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
                      ממתינים לאישור
                      {getSubmissionsByStatus('pending') > 0 && (
                        <Badge bg="warning" className="ms-1">
                          {getSubmissionsByStatus('pending')}
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
                    </span>
                  } 
                />
                <Tab 
                  eventKey="rejected" 
                  title={
                    <span>
                      <i className="bi bi-x-circle me-1"></i>
                      נדחו
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
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3 text-muted">אין טפסים להצגה</h4>
                  <p className="text-muted">
                    {activeTab === 'pending' && 'אין טפסים הממתינים לאישור כרגע'}
                    {activeTab === 'approved' && 'אין טפסים שאושרו'}
                    {activeTab === 'rejected' && 'אין טפסים שנדחו'}
                  </p>
                  {searchTerm && (
                    <Button variant="outline-primary" onClick={() => setSearchTerm('')} className="mt-2">
                      נקה חיפוש
                    </Button>
                  )}
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
                        <th>תאריך הגשה</th>
                        <th>סטטוס</th>
                        <th>ציון</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((submission, index) => {
                        const instanceId = submission.instanceId || submission.instanceID;
                        const userId = submission.userID || submission.userId;
                        const fullName = submission.fullName || 
                                        submission.FullName ||
                                        `${submission.firstName || ''} ${submission.lastName || ''}`.trim();
                        const currentStatus = submission.currentStage || submission.status;

                        return (
                          <tr key={instanceId}>
                            <td>{index + 1}</td>
                            <td>
                              <div>
                                <strong>{fullName || 'לא זמין'}</strong>
                                <div className="small text-muted">{userId}</div>
                              </div>
                            </td>
                            <td>
                              <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                <strong>{submission.formName}</strong>
                                {submission.formDescription && (
                                  <div className="small text-muted">{submission.formDescription}</div>
                                )}
                              </div>
                            </td>
                            <td>
                              {submission.academicYear ? (
                                <div>
                                  {submission.academicYear}
                                  {submission.semester && ` / ${submission.semester}`}
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>{formatDate(submission.submissionDate)}</td>
                            <td>{getStatusBadge(currentStatus)}</td>
                            <td>
                              {submission.totalScore ? (
                                <Badge bg="info">{submission.totalScore}</Badge>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                {/* כפתור צפייה */}
                                <Button
                                  as={Link}
                                  to={`/view-submission/${instanceId}`}
                                  variant="outline-info"
                                  size="sm"
                                  title="צפייה בטופס"
                                >
                                  <i className="bi bi-eye"></i>
                                </Button>

                                {/* כפתורי אישור/דחייה */}
                                {canReview(submission) && (
                                  <>
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => handleReviewClick(submission, 'approve')}
                                      disabled={processing}
                                      title="אשר"
                                    >
                                      <i className="bi bi-check-lg"></i>
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleReviewClick(submission, 'reject')}
                                      disabled={processing}
                                      title="דחה"
                                    >
                                      <i className="bi bi-x-lg"></i>
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal בדיקת טופס */}
      <Modal show={showReviewModal} onHide={() => !processing && setShowReviewModal(false)} size="lg" centered>
        <Modal.Header closeButton={!processing}>
          <Modal.Title>
            {reviewAction === 'approve' && (
              <>
                <i className="bi bi-check-circle text-success me-2"></i>
                אישור הטופס
              </>
            )}
            {reviewAction === 'reject' && (
              <>
                <i className="bi bi-x-circle text-danger me-2"></i>
                דחיית הטופס
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubmission && (
            <div>
              <Alert variant={reviewAction === 'approve' ? 'success' : 'danger'}>
                <i className={`bi ${reviewAction === 'approve' ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
                {reviewAction === 'approve' 
                  ? userRole === 'דיקאן'
                    ? 'אתה עומד לאשר את הטופס ולהעבירו לאישור סופי של מנהל סטודנטים.'
                    : 'אתה עומד לאשר את הטופס ולהעבירו לאישור הדיקאן.'
                  : 'אתה עומד לדחות את הטופס. המרצה יקבל הודעה על הדחייה.'}
              </Alert>

              <Row className="mb-3">
                <Col sm={3}><strong>מרצה:</strong></Col>
                <Col>
                  {selectedSubmission.fullName || 
                   selectedSubmission.FullName ||
                   `${selectedSubmission.firstName || ''} ${selectedSubmission.lastName || ''}`.trim() || 
                   'לא זמין'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3}><strong>ת.ז.:</strong></Col>
                <Col>{selectedSubmission.userID || selectedSubmission.userId}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3}><strong>טופס:</strong></Col>
                <Col>{selectedSubmission.formName}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3}><strong>תאריך הגשה:</strong></Col>
                <Col>{formatDate(selectedSubmission.submissionDate)}</Col>
              </Row>
              {selectedSubmission.totalScore && (
                <Row className="mb-3">
                  <Col sm={3}><strong>ציון:</strong></Col>
                  <Col><Badge bg="info" className="fs-6">{selectedSubmission.totalScore}</Badge></Col>
                </Row>
              )}

              <Form.Group className="mt-4">
                <Form.Label>
                  <strong>
                    הערות 
                    {reviewAction === 'reject' && <span className="text-danger"> *</span>}
                  </strong>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder={
                    reviewAction === 'approve' 
                      ? 'הערות אופציונליות לאישור...'
                      : 'נמק את סיבת הדחייה (חובה)...'
                  }
                  required={reviewAction === 'reject'}
                />
              </Form.Group>
            </div>
          )}

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
            onClick={() => setShowReviewModal(false)}
            disabled={processing}
          >
            ביטול
          </Button>
          
          <Button 
            variant={reviewAction === 'approve' ? 'success' : 'danger'} 
            onClick={handleReviewSubmit}
            disabled={processing || (reviewAction === 'reject' && !reviewComments.trim())}
          >
            {processing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                מעבד...
              </>
            ) : (
              <>
                <i className={`bi ${reviewAction === 'approve' ? 'bi-check' : 'bi-x'} me-2`}></i>
                {reviewAction === 'approve' ? 'אשר' : 'דחה'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DepartmentSubmissionsReview;