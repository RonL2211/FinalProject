// // src/pages/FacultyHeadReportsPage.jsx
// import React, { useState, useEffect } from "react";
// import { getCurrentUser } from "../services/authService";
// import { Card, ListGroup, Button } from "react-bootstrap";

// function FacultyHeadReportsPage() {
//   const currentUser = getCurrentUser();
//   const [reports, setReports] = useState([]);

//   useEffect(() => {
//     // לדוגמה: fetch("/api/faculty-reports")...
//     setReports([
//       { id: 1, title: 'דו"ח סטודנטים לפברואר 2025', date: "2025-02-28" },
//       { id: 2, title: 'דו"ח ביצועי מחלקות', date: "2025-04-15" },
//       { id: 3, title: 'דו"ח שביעות רצון סטודנטים', date: "2025-05-01" },
//     ]);
//   }, []);

//   return (
//     <div dir="rtl">
//       <Card>
//         <Card.Header>דוחות פקולטה — {currentUser?.departmentID}</Card.Header>
//         <Card.Body>
//           <ListGroup variant="flush">
//             {reports.map((r) => (
//               <ListGroup.Item
//                 key={r.id}
//                 className="d-flex justify-content-between align-items-center"
//               >
//                 <div>
//                   <strong>{r.title}</strong>
//                   <br />
//                   <small>נוצר: {r.date}</small>
//                 </div>
//                 <Button size="sm" variant="outline-primary">
//                   הורד
//                 </Button>
//               </ListGroup.Item>
//             ))}
//           </ListGroup>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// }

// export default FacultyHeadReportsPage;
