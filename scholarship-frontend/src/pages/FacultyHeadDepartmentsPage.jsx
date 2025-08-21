// // src/pages/FacultyHeadDepartmentsPage.jsx
// import React, { useState, useEffect } from "react";
// import { getCurrentUser } from "../services/authService";
// import { Card, Table, Button } from "react-bootstrap";

// function FacultyHeadDepartmentsPage() {
//   const currentUser = getCurrentUser();
//   const [departments, setDepartments] = useState([]);

//   useEffect(() => {
//     // לדוגמה: fetch("/api/departments")...
//     // כרגע נשתמש בנתונים סטטיים
//     setDepartments([
//       { id: 1, name: 'הנדסת תוכנה', head: 'ד"ר כהן' },
//       { id: 2, name: 'מדעי המחשב', head: 'ד"ר לוי' },
//       { id: 3, name: 'הנדסת תעשייה וניהול', head: 'ד"ר ברטה' },
//     ]);
//   }, []);

//   return (
//     <div dir="rtl">
//       <Card>
//         <Card.Header>ניהול מחלקות — {currentUser?.departmentID}</Card.Header>
//         <Card.Body>
//           <Button variant="primary" className="mb-3">
//             הוסף מחלקה חדשה
//           </Button>
//           <Table striped bordered hover>
//             <thead>
//               <tr>
//                 <th>מזהה</th>
//                 <th>שם המחלקה</th>
//                 <th>ראש המחלקה</th>
//                 <th>פעולות</th>
//               </tr>
//             </thead>
//             <tbody>
//               {departments.map((dept) => (
//                 <tr key={dept.id}>
//                   <td>{dept.id}</td>
//                   <td>{dept.name}</td>
//                   <td>{dept.head}</td>
//                   <td>
//                     <Button size="sm" variant="outline-secondary" className="me-2">
//                       ערוך
//                     </Button>
//                     <Button size="sm" variant="outline-danger">
//                       מחק
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// }

// export default FacultyHeadDepartmentsPage;
