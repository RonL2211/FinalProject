// // src/pages/DepartmentHead/Dashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { Container, Row, Col, Card, Button, Alert, Badge, Table } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { instanceService } from '../../services/instanceService';
// import LoadingSpinner from '../../components/UI/LoadingSpinner';
// import ErrorAlert from '../../components/UI/ErrorAlert';

// const DeptHeadDashboard = () => {
//   const { user } = useAuth();
//   const [dashboardData, setDashboardData] = useState({
//     pendingForms: [],
//     recentActions: [],
//     stats: {}
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   const loadDashboardData = async () => {
//     setLoading(true);
//     setError('');

//     try {
//       // טעינת טפסים לבדיקה
//       const formsForReview = await instanceService.getInstancesForReview();
      
//       // סינון רק טפסים מהמחלקה שלי שממתינים לבדיקה
//       const pendingForms = formsForReview.filter(instance => 
//         instance.currentStage === 'Submitted' && 
//         instance.userDepartmentID === user.departmentID
//       );

//       // חישוב סטטיסטיקות
//       const stats = {
//         pendingReview: pendingForms.length,
//         thisMonth: pendingForms.filter(f => 
//           new Date(f.submissionDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//         ).length,
//         approved: formsForReview.filter(f => 
//           f.currentStage === 'ApprovedByDepartment' && 
//           f.userDepartmentID === user.departmentID
//         ).length
//       };

//       setDashboardData({
//         pendingForms: pendingForms.slice(0, 5), // 5 האחרונים
//         stats
//       });
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const statusMap = {
//       'Submitted': { variant: 'warning', text: 'ממתין לבדיקה', icon: 'bi-clock' },
//       'ApprovedByDepartment': { variant: 'success', text: 'אושר', icon: 'bi-check-circle' },
//       'Rejected': { variant: 'danger', text: 'נדחה', icon: 'bi-x-circle' }
//     };

//     const config = statusMap[status] || { variant: 'light', text: status, icon: 'bi-question' };
//     return (
//       <Badge bg={config.variant}>
//         <i className={`${config.icon} me-1`}></i>
//         {config.text}
//       </Badge>
//     );
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'לא זמין';
//     return new Date(dateString).toLocaleDateString('he-IL', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) return <LoadingSpinner message="טוען לוח בקרה..." />;

//   return (
//     <Container>
//       {/* כותרת ברכה */}
//       <Row className="mb-4">
//         <Col>
//           <Card className="bg-primary text-white">
//             <Card.Body>
//               <Row className="align-items-center">
//                 <Col>
//                   <h2 className="mb-1">שלום {user?.firstName} {user?.lastName}!</h2>
//                   <p className="mb-0 opacity-75">ראש מחלקה - לוח בקרה</p>
//                 </Col>
//                 <Col xs="auto">
//                   <i className="bi bi-shield-check" style={{ fontSize: '3rem' }}></i>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {error && (
//         <Row className="mb-4">
//           <Col>
//             <ErrorAlert error={error} onRetry={loadDashboardData} />
//           </Col>
//         </Row>
//       )}

//       {/* סטטיסטיקות מהירות */}
//       <Row className="mb-4">
//         <Col md={4} className="mb-3">
//           <Card className="card-hover h-100 border-warning">
//             <Card.Body className="text-center">
//               <i className="bi bi-clock text-warning" style={{ fontSize: '2.5rem' }}></i>
//               <h3 className="mt-2 mb-1 text-warning">{dashboardData.stats.pendingReview}</h3>
//               <small className="text-muted">ממתינים לבדיקה</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4} className="mb-3">
//           <Card className="card-hover h-100 border-info">
//             <Card.Body className="text-center">
//               <i className="bi bi-calendar-month text-info" style={{ fontSize: '2.5rem' }}></i>
//               <h3 className="mt-2 mb-1 text-info">{dashboardData.stats.thisMonth}</h3>
//               <small className="text-muted">החודש</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4} className="mb-3">
//           <Card className="card-hover h-100 border-success">
//             <Card.Body className="text-center">
//               <i className="bi bi-check-circle text-success" style={{ fontSize: '2.5rem' }}></i>
//               <h3 className="mt-2 mb-1 text-success">{dashboardData.stats.approved}</h3>
//               <small className="text-muted">אושרו על ידי</small>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <Row>
//         {/* טפסים לבדיקה */}
//         <Col lg={8} className="mb-4">
//           <Card>
//             <Card.Header className="d-flex justify-content-between align-items-center">
//               <h5 className="mb-0">
//                 <i className="bi bi-clipboard-check me-2"></i>
//                 טפסים לבדיקה
//               </h5>
//               <Button as={Link} to="/dept-head/review" variant="outline-primary" size="sm">
//                 צפה בכולם
//               </Button>
//             </Card.Header>
//             <Card.Body>
//               {dashboardData.pendingForms.length === 0 ? (
//                 <div className="text-center py-4 text-muted">
//                   <i className="bi bi-clipboard-check" style={{ fontSize: '3rem' }}></i>
//                   <p className="mt-2 mb-0">אין טפסים הממתינים לבדיקה</p>
//                   <small>כל הטפסים במחלקה נבדקו</small>
//                 </div>
//               ) : (
//                 <div className="table-responsive">
//                   <Table hover size="sm">
//                     <thead>
//                       <tr>
//                         <th>מרצה</th>
//                         <th>טופס</th>
//                         <th>תאריך הגשה</th>
//                         <th>פעולות</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {dashboardData.pendingForms.map((instance) => (
//                         <tr key={instance.instanceId}>
//                           <td>
//                             <div>
//                               <strong>{instance.firstName} {instance.lastName}</strong>
//                               <div className="small text-muted">{instance.userID}</div>
//                             </div>
//                           </td>
//                           <td>
//                             <div>
//                               {instance.formName || `טופס ${instance.formId}`}
//                               <div className="small text-muted">
//                                 {getStatusBadge(instance.currentStage)}
//                               </div>
//                             </div>
//                           </td>
//                           <td>{formatDate(instance.submissionDate)}</td>
//                           <td>
//                             <Button
//                               as={Link}
//                               to={`/dept-head/review#instance-${instance.instanceId}`}
//                               variant="outline-primary"
//                               size="sm"
//                             >
//                               בדוק
//                             </Button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                 </div>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>

//         {/* פעולות מהירות */}
//         <Col lg={4} className="mb-4">
//           <Card>
//             <Card.Header>
//               <h6 className="mb-0">
//                 <i className="bi bi-lightning me-2"></i>
//                 פעולות מהירות
//               </h6>
//             </Card.Header>
//             <Card.Body>
//               <div className="d-grid gap-2">
//                 <Button
//                   as={Link}
//                   to="/dept-head/review"
//                   variant="warning"
//                   size="lg"
//                 >
//                   <i className="bi bi-clipboard-check me-2"></i>
//                   בדוק טפסים
//                   {dashboardData.stats.pendingReview > 0 && (
//                     <Badge bg="light" text="dark" className="ms-2">
//                       {dashboardData.stats.pendingReview}
//                     </Badge>
//                   )}
//                 </Button>

//                 <Button
//                   as={Link}
//                   to="/dept-head/reports"
//                   variant="info"
//                   size="lg"
//                 >
//                   <i className="bi bi-graph-up me-2"></i>
//                   דוחות מחלקה
//                 </Button>

//                 <Button
//                   as={Link}
//                   to="/profile"
//                   variant="secondary"
//                   size="lg"
//                 >
//                   <i className="bi bi-person-gear me-2"></i>
//                   עדכון פרופיל
//                 </Button>
//               </div>
//             </Card.Body>
//           </Card>

//           {/* מידע מחלקה */}
//           <Card className="mt-3">
//             <Card.Header>
//               <h6 className="mb-0">
//                 <i className="bi bi-building me-2"></i>
//                 פרטי המחלקה
//               </h6>
//             </Card.Header>
//             <Card.Body>
//               <div className="small">
//                 <div className="d-flex justify-content-between mb-2">
//                   <span>מחלקה:</span>
//                   <span>{user?.departmentID}</span>
//                 </div>
//                 <div className="d-flex justify-content-between mb-2">
//                   <span>תפקיד:</span>
//                   <span>{user?.position}</span>
//                 </div>
//                 <div className="d-flex justify-content-between">
//                   <span>מרצים פעילים:</span>
//                   <span>-</span>
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default DeptHeadDashboard;

