// src/pages/Manager/FormsManagement.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form, Alert, Dropdown, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { formService } from '../../services/formService';
import { instanceService } from '../../services/instanceService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const FormsManagement = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [formStats, setFormStats] = useState({});
  const [selectedForm, setSelectedForm] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [forms, searchTerm, statusFilter, sortBy]);

  const loadForms = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת כל הטפסים
      const formsData = await formService.getAllForms();
      
      // טעינת סטטיסטיקות לכל טופס
      const statsPromises = formsData.map(async (form) => {
        try {
          const instances = await instanceService.getInstancesByFormId?.(form.formID) || [];
          return {
            formId: form.formID,
            totalSubmissions: instances.length,
            approved: instances.filter(i => ['FinalApproved', 'AppealApproved'].includes(i.currentStage)).length,
            pending: instances.filter(i => ['Submitted', 'ApprovedByDepartment', 'ApprovedByDean'].includes(i.currentStage)).length,
            rejected: instances.filter(i => ['Rejected', 'AppealRejected'].includes(i.currentStage)).length
          };
        } catch (err) {
          return {
            formId: form.formID,
            totalSubmissions: 0,
            approved: 0,
            pending: 0,
            rejected: 0
          };
        }
      });

      const stats = await Promise.all(statsPromises);
      const statsMap = {};
      stats.forEach(stat => {
        statsMap[stat.formId] = stat;
      });

      setForms(formsData);
      setFormStats(statsMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...forms];

    // חיפוש טקסט
    if (searchTerm) {
      filtered = filtered.filter(form =>
        form.formName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // סינון לפי סטטוס
    switch (statusFilter) {
      case 'published':
        filtered = filtered.filter(f => f.isPublished && f.isActive);
        break;
      case 'draft':
        filtered = filtered.filter(f => !f.isPublished);
        break;
      case 'inactive':
        filtered = filtered.filter(f => !f.isActive);
        break;
      default:
        break;
    }

    // מיון
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.creationDate) - new Date(b.creationDate));
        break;
      case 'name':
        filtered.sort((a, b) => a.formName.localeCompare(b.formName));
        break;
      case 'popular':
        filtered.sort((a, b) => (formStats[b.formID]?.totalSubmissions || 0) - (formStats[a.formID]?.totalSubmissions || 0));
        break;
      default:
        break;
    }

    setFilteredForms(filtered);
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

  const handlePublishForm = async (formId) => {
    setProcessing(true);
    try {
      await formService.publishForm(formId);
      await loadForms();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteForm = async () => {
    if (!selectedForm) return;

    setProcessing(true);
    try {
      // כאן נוסיף API למחיקת טופס
      // await formService.deleteForm(selectedForm.formID);
      console.log('Delete form:', selectedForm.formID);
      
      await loadForms();
      setShowDeleteModal(false);
      setSelectedForm(null);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'לא זמין';
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner message="טוען טפסים..." />;

  return (
    <Container>
      {/* כותרת */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-files me-2"></i>
                ניהול טפסים
              </h2>
              <p className="text-muted">נהל, ערוך ופרסם טפסים במערכת</p>
            </div>
            <Button 
              as={Link} 
              to="/manager/forms/new" 
              variant="primary" 
              size="lg"
            >
              <i className="bi bi-plus-circle me-2"></i>
              יצירת טופס חדש
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <ErrorAlert error={error} onRetry={loadForms} />
          </Col>
        </Row>
      )}

      {/* סטטיסטיקות מהירות */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-primary">
            <Card.Body>
              <i className="bi bi-files text-primary" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-primary">{forms.length}</h3>
              <small className="text-muted">סך הכל טפסים</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-success">
            <Card.Body>
              <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-success">
                {forms.filter(f => f.isPublished && f.isActive).length}
              </h3>
              <small className="text-muted">מפורסמים ופעילים</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-warning">
            <Card.Body>
              <i className="bi bi-pencil text-warning" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-warning">
                {forms.filter(f => !f.isPublished).length}
              </h3>
              <small className="text-muted">טיוטות</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-info">
            <Card.Body>
              <i className="bi bi-eye text-info" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-info">
                {Object.values(formStats).reduce((sum, stat) => sum + stat.totalSubmissions, 0)}
              </h3>
              <small className="text-muted">סך הגשות</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* סינונים וחיפוש */}
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
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="חפש טופס..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">כל הסטטוסים</option>
                    <option value="published">מפורסמים</option>
                    <option value="draft">טיוטות</option>
                    <option value="inactive">לא פעילים</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">החדשים ביותר</option>
                    <option value="oldest">הישנים ביותר</option>
                    <option value="name">לפי שם</option>
                    <option value="popular">הפופולריים ביותר</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Button variant="outline-primary" onClick={loadForms} className="w-100">
                    <i className="bi bi-arrow-clockwise"></i>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* רשימת טפסים */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                רשימת טפסים ({filteredForms.length})
              </h6>
            </Card.Header>
            <Card.Body>
              {filteredForms.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3 text-muted">
                    {searchTerm || statusFilter !== 'all' ? 'לא נמצאו טפסים התואמים לסינון' : 'אין טפסים במערכת'}
                  </h4>
                  {(searchTerm || statusFilter !== 'all') ? (
                    <Button 
                      variant="outline-primary" 
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                    >
                      נקה סינונים
                    </Button>
                  ) : (
                    <Button as={Link} to="/manager/forms/new" variant="primary">
                      יצור טופס ראשון
                    </Button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>שם הטופס</th>
                        <th>סטטוס</th>
                        <th>תאריך יצירה</th>
                        <th>הגשות</th>
                        <th>סטטיסטיקות</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredForms.map((form) => {
                        const stats = formStats[form.formID] || {};
                        return (
                          <tr key={form.formID}>
                            <td>
                              <div>
                                <strong>{form.formName}</strong>
                                {form.description && (
                                  <div
                                    className="small text-muted text-truncate"
                                    style={{ maxWidth: "300px" }}
                                  >
                                    {form.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>{getStatusBadge(form)}</td>
                            <td>{formatDate(form.creationDate)}</td>
                            <td>
                              <Badge bg="info">
                                {stats.totalSubmissions || 0}
                              </Badge>
                            </td>
                            <td>
                              <div className="small">
                                <Badge bg="success" className="me-1">
                                  {stats.approved || 0} ✓
                                </Badge>
                                <Badge bg="warning" className="me-1">
                                  {stats.pending || 0} ⏳
                                </Badge>
                                <Badge bg="danger">
                                  {stats.rejected || 0} ✗
                                </Badge>
                              </div>
                            </td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle
                                  variant="outline-secondary"
                                  size="sm"
                                >
                                  <i className="bi bi-three-dots"></i>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item
                                    onClick={() => {
                                      setSelectedForm(form);
                                      setShowDetailsModal(true);
                                    }}
                                  >
                                    <i className="bi bi-eye me-2"></i>
                                    צפה בפרטים
                                  </Dropdown.Item>

                                  {!form.isPublished && (
                                    <Dropdown.Item
                                      as={Link}
                                      to={`/manager/forms/edit/${form.formID}`}
                                    >
                                      <i className="bi bi-pencil me-2"></i>
                                      ערוך טופס
                                    </Dropdown.Item>
                                  )}
                                  {form.isActive && !form.isPublished && (
                                    <Dropdown.Item
                                      onClick={() =>
                                        handlePublishForm(form.formID)
                                      }
                                      disabled={processing}
                                    >
                                      <i className="bi bi-globe me-2"></i>
                                      פרסם טופס
                                    </Dropdown.Item>
                                  )}

                                  <Dropdown.Divider />

                                  <Dropdown.Item
                                    className="text-danger"
                                    onClick={() => {
                                      setSelectedForm(form);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <i className="bi bi-trash me-2"></i>
                                    מחק טופס
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
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

      {/* Modal פרטי טופס */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>פרטי הטופס</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedForm && (
            <div>
              <Row className="mb-3">
                <Col sm={3}><strong>שם הטופס:</strong></Col>
                <Col>{selectedForm.formName}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3}><strong>תיאור:</strong></Col>
                <Col>{selectedForm.description || 'אין תיאור'}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3}><strong>סטטוס:</strong></Col>
                <Col>{getStatusBadge(selectedForm)}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3}><strong>תאריך יצירה:</strong></Col>
                <Col>{formatDate(selectedForm.creationDate)}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3}><strong>שנה אקדמית:</strong></Col>
                <Col>{selectedForm.academicYear || 'לא הוגדר'}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3}><strong>סמסטר:</strong></Col>
                <Col>{selectedForm.semester || 'לא הוגדר'}</Col>
              </Row>
              
              {formStats[selectedForm.formID] && (
                <>
                  <hr />
                  <h6>סטטיסטיקות הגשות:</h6>
                  <Row className="text-center">
                    <Col sm={3}>
                      <div className="border rounded p-2">
                        <h5 className="text-info">{formStats[selectedForm.formID].totalSubmissions}</h5>
                        <small>סך הכל</small>
                      </div>
                    </Col>
                    <Col sm={3}>
                      <div className="border rounded p-2">
                        <h5 className="text-success">{formStats[selectedForm.formID].approved}</h5>
                        <small>מאושרים</small>
                      </div>
                    </Col>
                    <Col sm={3}>
                      <div className="border rounded p-2">
                        <h5 className="text-warning">{formStats[selectedForm.formID].pending}</h5>
                        <small>בבדיקה</small>
                      </div>
                    </Col>
                    <Col sm={3}>
                      <div className="border rounded p-2">
                        <h5 className="text-danger">{formStats[selectedForm.formID].rejected}</h5>
                        <small>נדחו</small>
                      </div>
                    </Col>
                  </Row>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            סגור
          </Button>
          {selectedForm && (
            <Button 
              as={Link}
              to={`/manager/forms/edit/${selectedForm.formID}`}
              variant="primary"
            >
              ערוך טופס
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal מחיקת טופס */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">מחיקת טופס</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedForm && (
            <div>
              <div className="text-center mb-3">
                <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
              </div>
              <h6 className="text-center">האם אתה בטוח?</h6>
              <p className="text-center text-muted">
                פעולה זו תמחק את הטופס "<strong>{selectedForm.formName}</strong>" 
                וכל הנתונים הקשורים אליו.
              </p>
              <Alert variant="danger">
                <small>
                  <strong>אזהרה:</strong> פעולה זו בלתי הפיכה! 
                  כל ההגשות והנתונים יאבדו לצמיתות.
                </small>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={processing}
          >
            ביטול
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteForm}
            disabled={processing}
          >
            {processing ? (
              <>
                <i className="spinner-border spinner-border-sm me-2"></i>
                מוחק...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                מחק טופס
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FormsManagement;