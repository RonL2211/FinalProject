// // src/pages/LecturerDashboard.jsx
// import React from "react";
// import { getCurrentUser } from "../services/authService";
// import { Card } from "react-bootstrap";

// function LecturerDashboard() {
//   const currentUser = getCurrentUser();

//   return (
//     <div dir="rtl">
//       <Card className="text-center">
//         <Card.Header>ברוכים הבאים, מרצה</Card.Header>
//         <Card.Body>
//           <Card.Title>
//             שלום {currentUser?.firstName} {currentUser?.lastName}!
//           </Card.Title>
//           <Card.Text>
//             זהו דף הבית שלך. תוכל לצפות בטפסים שהגשת, לשנות את הפרופיל שלך ועוד.
//           </Card.Text>
//           <hr />
//           <h5>פרטי המרצה:</h5>
//           <ul className="list-unstyled">
//             <li>ת.ז.: {currentUser?.personId}</li>
//             <li>שם: {currentUser?.firstName} {currentUser?.lastName}</li>
//             <li>אימייל: {currentUser?.email}</li>
//             <li>מחלקה: {currentUser?.departmentID}</li>
//           </ul>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// }

// export default LecturerDashboard;
