// // src/pages/FacultyHeadProfilePage.jsx
// import React from "react";
// import { getCurrentUser } from "../services/authService";
// import { Form, Button } from "react-bootstrap";

// function FacultyHeadProfilePage() {
//   const user = getCurrentUser();

//   return (
//     <div dir="rtl">
//       <h2>הפרופיל שלי</h2>
//       <Form>
//         <Form.Group controlId="firstName" className="mb-3">
//           <Form.Label>שם פרטי</Form.Label>
//           <Form.Control type="text" value={user?.firstName || ""} readOnly />
//         </Form.Group>
//         <Form.Group controlId="lastName" className="mb-3">
//           <Form.Label>שם משפחה</Form.Label>
//           <Form.Control type="text" value={user?.lastName || ""} readOnly />
//         </Form.Group>
//         <Form.Group controlId="email" className="mb-3">
//           <Form.Label>אימייל</Form.Label>
//           <Form.Control type="email" value={user?.email || ""} readOnly />
//         </Form.Group>
//         {/* הוסף כאן שדות לעריכה במידת הצורך */}
//         <Button variant="primary">ערוך פרטים</Button>
//       </Form>
//     </div>
//   );
// }

// export default FacultyHeadProfilePage;
