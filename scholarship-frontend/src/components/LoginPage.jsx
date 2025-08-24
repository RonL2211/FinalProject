
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { login } from "../services/authService";

// // רכיבי React-Bootstrap
// import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

// // לוגו
// // import ruppstarLogo from "../assets/Logo.png";

// // CSS מותאם משלך (אופציונלי)
// import "../styles/LoginPage.css";

// function LoginPage() {
//   const navigate = useNavigate();

//   const [personId, setPersonId] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const data = await login(personId, password);
//       const userPosition = (data.person?.position || "").trim().toLowerCase();

//       if (
//         userPosition === "מרצה" ||
//         userPosition === "ראש מחלקה" ||
//         userPosition === "ראש התמחות"
//       ) {
//         navigate("/lecturer");
//       } else if (userPosition === "דיקאן") {
//         navigate("/faculty-head");
//       } else if (userPosition === "מנהל סטודנטים") {
//         navigate("/committee");
//       } else {
//         navigate("/unknown-role");
//       }
//     } catch (err) {
//       setError("תעודת זהות או סיסמה שגויים, או שגיאה בהתחברות");
//       console.error("Login error:", err);
//     }
//   };

//   return (
//     <Container
//       // לא fluid, כדי שלא יתפוס את כל הרוחב
//       className="d-flex justify-content-center align-items-center"
//       style={{
//         minHeight: "100vh",
//         direction: "rtl", // RTL לעברית
//       }}
//     >
//       {/* נעטוף את התוכן ב-Row + Col וניתן לו רוחב מוגדר */}
//       <Row
//         className="shadow"
//         style={{
//           width: "900px",
//           borderRadius: "10px",
//           overflow: "hidden",
//         }}
//       >
//         {/* צד שמאל - טופס */}
//         <Col
//           xs={12}
//           md={6}
//           className="p-5 d-flex flex-column justify-content-center"
//           style={{ backgroundColor: "#fff" }}
//         >
//           <div className="text-center mb-4">
//             <img
//               src={ruppstarLogo}
//               alt="Ruppstar Logo"
//               style={{ width: "120px", marginBottom: "1rem" }}
//             />
//             <h3 className="mb-3">מערכת מלגות</h3>
//           </div>

//           {error && (
//             <Alert variant="danger" className="text-center">
//               {error}
//             </Alert>
//           )}

//           <Form onSubmit={handleSubmit}>
//             <Form.Group className="mb-3" controlId="personId">
//               <Form.Label>תעודת זהות</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="הכנס תעודת זהות"
//                 value={personId}
//                 onChange={(e) => setPersonId(e.target.value)}
//                 required
//               />
//             </Form.Group>

//             <Form.Group className="mb-4" controlId="password">
//               <Form.Label>סיסמה</Form.Label>
//               <Form.Control
//                 type="password"
//                 placeholder="הכנס סיסמה"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </Form.Group>

//             <div className="d-flex justify-content-between align-items-center mb-3">
//               <Button variant="primary" type="submit">
//                 התחבר
//               </Button>
//             </div>

//             {/* אפשרות לרישום או פעולה נוספת */}
//             <div className="text-center mt-3">
//               <span>אין לך חשבון? <a href="#!">הרשמה</a></span>
//             </div>
//           </Form>
//         </Col>

//         {/* צד ימין - רקע סגול */}
//         <Col
//           xs={12}
//           md={6}
//           style={{
//             background: "linear-gradient(135deg, #7367f0 0%, #ce9ffc 100%)",
//           }}
//         ></Col>
//       </Row>
//     </Container>
//   );
// }

// export default LoginPage;   


