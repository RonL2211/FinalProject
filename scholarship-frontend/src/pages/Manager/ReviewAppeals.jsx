// src/pages/Manager/ReviewAppeals.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form, Alert, Tabs, Tab, InputGroup } from 'react-bootstrap';
import { appealService } from '../../services/appealService';
import { instanceService } from '../../services/instanceService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const ReviewAppeals = () => {
  const [appeals, setAppeals] = useState([]);
  const [filteredAppeals, setFilteredAppeals] = useState([]);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState(''); // 'approve' or 'reject'
  const [reviewerResponse, setReviewerResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadAppeals();
  }, []);

  useEffect(() => {
    filterAppeals();
  }, [appeals, activeTab, searchTerm, sortBy]);

  const loadAppeals = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת כל הערעורים (כולל היסטוריה)
      const pendingAppeals = await appealService.getPendingAppeals();
      
      // כאן יכולנו לטעון גם ערעורים שכבר טופלו, אבל זה דורש API נוסף
      // לעת עתה נציג רק את הממתינים ונוסיף mock data להיסטוריה
      
      const allAppeals = [
        ...pendingAppeals,
        // Mock data לערעורים שטופלו (בפועל יבוא מה-API)
        ...getMockProcessedAppeals()
      ];

      setAppeals(allAppeals);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMockProcessedAppeals = () => {
    // נתונים זמניים לדוגמה - בפועל יבוא מה-API
    return [
      {
        appealID: 100,
        instanceId: 50,
        appealReason: 'אני חושב שהערכת הטופס לא הייתה הוגנת. הציון שקיבלתי לא משקף את המאמץ שהשקעתי.',
        appealDate: '2024-03-15T10:30:00Z',
        appealStatus: 'Approved',
        reviewerResponse: 'לאחר בדיקה מחודשת, הערעור מתקבל. הטופס אושר.',
        reviewDate: '2024-03-18T14:20:00Z',
        reviewedBy: '298374928',
        // נתונים נוספים מה-join
        firstName: 'דניאל',
        lastName: 'כהן',
        formName: 'טופס הצטיינות ספטמבר 2024',
        userID: '123456789'
      },
      {
        appealID: 101,
        instanceId: 51,
        appealReason: 'לא הייתי מרוצה מהחלטת ראש המחלקה. אני מבקש בדיקה נוספת.',
        appealDate: '2024-03-10T15:45:00Z',
        appealStatus: 'Rejected',
        reviewerResponse: 'לאחר בדיקה יסודית, החלטת ראש המחלקה הייתה נכונה. הערעור נדחה.',
        reviewDate: '2024-03-12T11:15:00Z',
        reviewedBy: '298374928',
        firstName: 'שרה',
        lastName: 'לוי',
        formName: 'טופס הצטיינות מרץ 2024',
        userID: '987654321'
      }
    ];
  };

  const filterAppeals = () => {
    let filtered = [...appeals];

    // סינון לפי טאב
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(a => a.appealStatus === 'Pending');
        break;
      case 'approved':
        filtered = filtered.filter(a => a.appealStatus === 'Approved');
        break;
      case 'rejected':
        filtered = filtered.filter(a => a.appealStatus === 'Rejected');
        break;
      default:
        break;
    }

    // חיפוש טקסט
    if (searchTerm) {
      filtered = filtered.filter(appeal =>
        appeal.appealReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appeal.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appeal.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appeal.formName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // מיון
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.appealDate) - new Date(a.appealDate));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.appealDate) - new Date(b.appealDate));
        break;
      default:
        break;
    }

    setFilteredAppeals(filtered);
  };

  const handleReviewClick = (appeal, action) => {
    setSelectedAppeal(appeal);
    setReviewAction(action);
    setReviewerResponse('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedAppeal || !reviewAction) return;

    if (!reviewerResponse.trim()) {
      setError('יש להוסיף תגובה לערעור');
      return;
    }

    setProcessing(true);
    try {
      const isApproved = reviewAction === 'approve';
      await appealService.respondToAppeal(
        selectedAppeal.appealID, 
        isApproved, 
        reviewerResponse
      );

      // רענון הרשימה
      await loadAppeals();
      
      // סגירת המודל
      setShowReviewModal(false);
      setSelectedAppeal(null);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': { variant: 'warning', text: 'ממתין', icon: 'bi-clock' },
      'Approved': { variant: 'success', text: 'אושר', icon: 'bi-check-circle' },
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

  const getAppealsByStatus = (status) => {
    return appeals.filter(a => a.appealStatus === status).length;
  };

  if (loading) return <LoadingSpinner message="טוען ערעורים..." />;

  return (
    <Container>
      {/* כותרת */}
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="bi bi-scale me-2"></i>
            ניהול ערעורים
          </h2>
          <p className="text-muted">בדוק ואשר או דחה ערעורים שהוגשו על ידי מרצים</p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <ErrorAlert error={error} onRetry={loadAppeals} />
          </Col>
        </Row>
      )}

      {/* סטטיסטיקות מהירות */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="text-center h-100 border-warning">
            <Card.Body>
              <i className="bi bi-clock text-warning" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-warning">{getAppealsByStatus('Pending')}</h3>
              <small className="text-muted">ממתינים לבדיקה</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="text-center h-100 border-success">
            <Card.Body>
              <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-success">{getAppealsByStatus('Approved')}</h3>
              <small className="text-muted">אושרו</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="text-center h-100 border-danger">
            <Card.Body>
              <i className="bi bi-x-circle text-danger" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-danger">{getAppealsByStatus('Rejected')}</h3>
              <small className="text-muted">נדחו</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* סינונים */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-funnel me-2"></i>
                סינון וחיפוש
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="חפש בערעורים..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">החדשים ביותר</option>
                    <option value="oldest">הישנים ביותר</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Button variant="outline-primary" onClick={loadAppeals} className="w-100">
                    <i className="bi bi-arrow-clockwise"></i>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* טאבים ורשימת ערעורים */}
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
                      {getAppealsByStatus('Pending') > 0 && (
                        <Badge bg="warning" className="ms-1">
                          {getAppealsByStatus('Pending')}
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
                      {getAppealsByStatus('Approved') > 0 && (
                        <Badge bg="success" className="ms-1">
                          {getAppealsByStatus('Approved')}
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
                      {getAppealsByStatus('Rejected') > 0 && (
                        <Badge bg="danger" className="ms-1">
                          {getAppealsByStatus('Rejected')}
                        </Badge>
                      )}
                    </span>
                  } 
                />
              </Tabs>
            </Card.Header>
            <Card.Body>
              {filteredAppeals.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3 text-muted">
                    {activeTab === 'pending' && 'אין ערעורים הממתינים לבדיקה'}
                    {activeTab === 'approved' && 'אין ערעורים שאושרו'}
                    {activeTab === 'rejected' && 'אין ערעורים שנדחו'}
                  </h4>
                  {searchTerm && (
                    <Button variant="outline-primary" onClick={() => setSearchTerm('')}>
                      נקה חיפוש
                    </Button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>מרצה</th>
                        <th>טופס</th>
                        <th>תאריך ערעור</th>
                        <th>סטטוס</th>
                        <th>נימוק הערעור</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppeals.map((appeal) => (
                        <tr key={appeal.appealID}>
                          <td>
                            <div>
                              <strong>{appeal.firstName} {appeal.lastName}</strong>
                              <div className="small text-muted">{appeal.userID}</div>
                            </div>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '200px' }}>
                              <strong>{appeal.formName || `טופס ${appeal.instanceId}`}</strong>
                            </div>
                          </td>
                          <td>{formatDate(appeal.appealDate)}</td>
                          <td>{getStatusBadge(appeal.appealStatus)}</td>
                          <td>
                            <div 
                              className="text-truncate" 
                              style={{ maxWidth: '300px' }}
                              title={appeal.appealReason}
                            >
                              {appeal.appealReason}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              {appeal.appealStatus === 'Pending' && (
                                <>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleReviewClick(appeal, 'approve')}
                                    disabled={processing}
                                  >
                                    <i className="bi bi-check me-1"></i>
                                    אשר
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleReviewClick(appeal, 'reject')}
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
                                onClick={() => {
                                  setSelectedAppeal(appeal);
                                  setShowReviewModal(true);
                                  setReviewAction('view');
                                }}
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

      {/* Modal בדיקת ערעור */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {reviewAction === 'approve' && 'אישור ערעור'}
            {reviewAction === 'reject' && 'דחיית ערעור'}
            {reviewAction === 'view' && 'פרטי הערעור'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppeal && (
            <div>
              {/* פרטי הערעור */}
              <Row className="mb-3">
                <Col sm={3}><strong>מרצה:</strong></Col>
                <Col>{selectedAppeal.firstName} {selectedAppeal.lastName}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3}><strong>ת.ז.:</strong></Col>
                <Col>{selectedAppeal.userID}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3}><strong>טופס:</strong></Col>
                <Col>{selectedAppeal.formName || `טופס ${selectedAppeal.instanceId}`}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3}><strong>תאריך הגשה:</strong></Col>
                <Col>{formatDate(selectedAppeal.appealDate)}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3}><strong>סטטוס:</strong></Col>
                <Col>{getStatusBadge(selectedAppeal.appealStatus)}</Col>
              </Row>

              {/* נימוק הערעור */}
              <div className="mb-4">
                <strong>נימוק הערעור:</strong>
                <div className="mt-2 p-3 bg-light border rounded">
                  {selectedAppeal.appealReason}
                </div>
              </div>

              {/* תגובה קודמת אם קיימת */}
              {selectedAppeal.reviewerResponse && (
                <div className="mb-4">
                  <strong>תגובת המערכת:</strong>
                  <div className="mt-2 p-3 bg-info bg-opacity-10 border border-info rounded">
                    {selectedAppeal.reviewerResponse}
                  </div>
                  <small className="text-muted">
                    נענה ב-{formatDate(selectedAppeal.reviewDate)}
                  </small>
                </div>
              )}

              {/* טופס תגובה למועמדים הממתינים */}
              {selectedAppeal.appealStatus === 'Pending' && reviewAction !== 'view' && (
                <Form.Group>
                  <Form.Label>
                    <strong>תגובתך לערעור <span className="text-danger">*</span></strong>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={reviewerResponse}
                    onChange={(e) => setReviewerResponse(e.target.value)}
                    placeholder={
                      reviewAction === 'approve' 
                        ? 'נמק מדוע הערעור מתקבל...'
                        : 'נמק מדוע הערעור נדחה...'
                    }
                    required
                  />
                  <Form.Text className="text-muted">
                    התגובה תישלח למרצה ותתועד במערכת
                  </Form.Text>
                </Form.Group>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowReviewModal(false)}
            disabled={processing}
          >
            {reviewAction === 'view' ? 'סגור' : 'ביטול'}
          </Button>
          
          {selectedAppeal?.appealStatus === 'Pending' && reviewAction !== 'view' && (
            <Button 
              variant={reviewAction === 'approve' ? 'success' : 'danger'} 
              onClick={handleReviewSubmit}
              disabled={processing || !reviewerResponse.trim()}
            >
              {processing ? (
                <>
                  <i className="spinner-border spinner-border-sm me-2"></i>
                  מעבד...
                </>
              ) : (
                <>
                  <i className={`bi ${reviewAction === 'approve' ? 'bi-check' : 'bi-x'} me-2`}></i>
                  {reviewAction === 'approve' ? 'אשר ערעור' : 'דחה ערעור'}
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReviewAppeals;