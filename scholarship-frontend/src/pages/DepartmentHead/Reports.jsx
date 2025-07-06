// src/pages/DepartmentHead/Reports.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { instanceService } from '../../services/instanceService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';

const DeptHeadReports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState({
    summary: {},
    byLecturer: [],
    byMonth: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // תחילת השנה
    endDate: new Date().toISOString().split('T')[0] // היום
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    setError('');

    try {
      // טעינת כל הטפסים לבדיקה (היסטוריה)
      const allForms = await instanceService.getInstancesForReview();
      
      // סינון רק טפסים מהמחלקה שלי ובטווח התאריכים
      const departmentForms = allForms.filter(instance => {
        const submissionDate = new Date(instance.submissionDate);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        return instance.userDepartmentID === user.departmentID &&
               submissionDate >= startDate &&
               submissionDate <= endDate;
      });

      // חישוב סיכום כללי
      const summary = {
        total: departmentForms.length,
        approved: departmentForms.filter(f => f.currentStage === 'ApprovedByDepartment' || f.currentStage === 'ApprovedByDean' || f.currentStage === 'FinalApproved').length,
        rejected: departmentForms.filter(f => f.currentStage === 'Rejected').length,
        pending: departmentForms.filter(f => f.currentStage === 'Submitted').length
      };

      // דיווח לפי מרצה
      const lecturerMap = {};
      departmentForms.forEach(form => {
        const lecturerKey = `${form.firstName} ${form.lastName}`;
        if (!lecturerMap[lecturerKey]) {
          lecturerMap[lecturerKey] = {
            name: lecturerKey,
            userId: form.userID,
            total: 0,
            approved: 0,
            rejected: 0,
            pending: 0
          };
        }
        
        lecturerMap[lecturerKey].total++;
        
        if (['ApprovedByDepartment', 'ApprovedByDean', 'FinalApproved'].includes(form.currentStage)) {
          lecturerMap[lecturerKey].approved++;
        } else if (form.currentStage === 'Rejected') {
          lecturerMap[lecturerKey].rejected++;
        } else if (form.currentStage === 'Submitted') {
          lecturerMap[lecturerKey].pending++;
        }
      });

      // דיווח לפי חודש
      const monthMap = {};
      departmentForms.forEach(form => {
        const date = new Date(form.submissionDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthMap[monthKey]) {
          monthMap[monthKey] = {
            month: date.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' }),
            total: 0,
            approved: 0,
            rejected: 0
          };
        }
        
        monthMap[monthKey].total++;
        
        if (['ApprovedByDepartment', 'ApprovedByDean', 'FinalApproved'].includes(form.currentStage)) {
          monthMap[monthKey].approved++;
        } else if (form.currentStage === 'Rejected') {
          monthMap[monthKey].rejected++;
        }
      });

      setReportData({
        summary,
        byLecturer: Object.values(lecturerMap).sort((a, b) => b.total - a.total),
        byMonth: Object.values(monthMap).reverse()
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSuccessRate = (approved, total) => {
    if (total === 0) return 0;
    return Math.round((approved / total) * 100);
  };

  if (loading) return <LoadingSpinner message="טוען דוחות..." />;

  return (
    <Container>
      {/* כותרת */}
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="bi bi-graph-up me-2"></i>
            דוחות מחלקה {user?.departmentID}
          </h2>
          <p className="text-muted">סטטיסטיקות וניתוח נתונים של המחלקה</p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <ErrorAlert error={error} onRetry={loadReportData} />
          </Col>
        </Row>
      )}

      {/* סינון תאריכים */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-funnel me-2"></i>
                סינון לפי תאריכים
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>מתאריך</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({
                        ...prev,
                        startDate: e.target.value
                      }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>עד תאריך</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({
                        ...prev,
                        endDate: e.target.value
                      }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button variant="primary" onClick={loadReportData}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    רענן דוח
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* סיכום כללי */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-primary">
            <Card.Body>
              <i className="bi bi-files text-primary" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-primary">{reportData.summary.total}</h3>
              <small className="text-muted">סך הכל טפסים</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-success">
            <Card.Body>
              <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-success">{reportData.summary.approved}</h3>
              <small className="text-muted">אושרו</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-danger">
            <Card.Body>
              <i className="bi bi-x-circle text-danger" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-danger">{reportData.summary.rejected}</h3>
              <small className="text-muted">נדחו</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-warning">
            <Card.Body>
              <i className="bi bi-clock text-warning" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-1 text-warning">{reportData.summary.pending}</h3>
              <small className="text-muted">ממתינים</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* דוח לפי מרצה */}
        <Col lg={7} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-people me-2"></i>
                דוח לפי מרצה
              </h6>
            </Card.Header>
            <Card.Body>
              {reportData.byLecturer.length === 0 ? (
                <div className="text-center py-3 text-muted">
                  אין נתונים לתצוגה
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>מרצה</th>
                        <th>סך הכל</th>
                        <th>אושרו</th>
                        <th>נדחו</th>
                        <th>% הצלחה</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.byLecturer.map((lecturer, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{lecturer.name}</strong>
                            <div className="small text-muted">{lecturer.userId}</div>
                          </td>
                          <td><Badge bg="primary">{lecturer.total}</Badge></td>
                          <td><Badge bg="success">{lecturer.approved}</Badge></td>
                          <td><Badge bg="danger">{lecturer.rejected}</Badge></td>
                          <td>
                            <Badge bg={getSuccessRate(lecturer.approved, lecturer.total) >= 70 ? 'success' : 'warning'}>
                              {getSuccessRate(lecturer.approved, lecturer.total)}%
                            </Badge>
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

        {/* דוח לפי חודש */}
        <Col lg={5} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-calendar3 me-2"></i>
                דוח לפי חודש
              </h6>
            </Card.Header>
            <Card.Body>
              {reportData.byMonth.length === 0 ? (
                <div className="text-center py-3 text-muted">
                  אין נתונים לתצוגה
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>חודש</th>
                        <th>סך הכל</th>
                        <th>אושרו</th>
                        <th>נדחו</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.byMonth.map((month, index) => (
                        <tr key={index}>
                          <td>{month.month}</td>
                          <td><Badge bg="primary">{month.total}</Badge></td>
                          <td><Badge bg="success">{month.approved}</Badge></td>
                          <td><Badge bg="danger">{month.rejected}</Badge></td>
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
    </Container>
  );
};

export default DeptHeadReports;

