// // src/pages/EditFormPage.jsx
// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Container,
//   Card,
//   Form,
//   Row,
//   Col,
//   Button,
//   Alert,
//   Spinner,
// } from "react-bootstrap";
// import { getToken } from "../services/authService";

// // Field‐type options (unchanged)
// const fieldTypeOptions = [
//   { value: "text", label: "טקסט" },
//   { value: "textarea", label: "טקסט ארוך" },
//   { value: "number", label: "מספר" },
//   { value: "date", label: "תאריך" },
//   { value: "email", label: "דואר אלקטרוני" },
//   { value: "select", label: "בחירה" },
//   { value: "checkbox", label: "תיבת סימון" },
//   { value: "radio", label: "כפתורי רדיו" },
//   { value: "file", label: "קובץ" },
//   { value: "link", label: "לינק" },
//   { value: "image", label: "תמונה" },
// ];

// // Semester options now matching your DB values (א, ב, ש)
// const semesterOptions = [
//   { value: "", label: "בחר סמסטר" },
//   { value: "א", label: "סמסטר א'" },
//   { value: "ב", label: "סמסטר ב'" },
//   { value: "ש", label: "סמסטר ש'" },
// ];

// export default function EditFormPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [formMeta, setFormMeta] = useState(null);
//   const [sections, setSections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     async function load() {
//       setLoading(true);
//       setError("");
//       try {
//         const token = getToken();
//         const headers = {
//           "Content-Type": "application/json",
//           ...(token && { Authorization: `Bearer ${token}` }),
//         };

//         // 1) Load form metadata
//         const metaRes = await fetch(`https://localhost:7230/api/Form/${id}`, {
//           headers,
//         });
//         if (!metaRes.ok) throw new Error(await metaRes.text());
//         const meta = await metaRes.json();
//         setFormMeta(meta);

//         // 2) Load form structure
//         const structRes = await fetch(
//           `https://localhost:7230/api/Form/${id}/structure`,
//           { headers }
//         );
//         if (!structRes.ok) throw new Error(await structRes.text());
//         const raw = await structRes.json();

//         // Normalize into an array
//         let baseSections = Array.isArray(raw)
//           ? raw
//           : Array.isArray(raw.formSections)
//           ? raw.formSections
//           : Object.values(raw).flatMap(v => (Array.isArray(v) ? v : []));

//         // 3) For each section, fetch its fields
//         const detailed = await Promise.all(
//           baseSections.map(async sec => {
//             const fRes = await fetch(
//               `https://localhost:7230/api/FormSection/${sec.sectionID}/fields`,
//               { headers }
//             );
//             const fields = fRes.ok ? await fRes.json() : [];
//             return { ...sec, fields };
//           })
//         );

//         setSections(detailed);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, [id]);

//   // Helper to update nested state by path
//   const updateNested = (path, value) => {
//     setSections(prev => {
//       const clone = JSON.parse(JSON.stringify(prev));
//       let cur = clone;
//       for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
//       cur[path[path.length - 1]] = value;
//       return clone;
//     });
//   };

//   // Save or publish handler
//   const handleSave = async publish => {
//     setLoading(true);
//     setError("");
//     setSuccess("");
//     try {
//       const token = getToken();
//       const payload = {
//         ...formMeta,
//         isPublished: publish,
//         formSections: sections,
//       };

//       const res = await fetch(`https://localhost:7230/api/Form/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token && { Authorization: `Bearer ${token}` }),
//         },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error(await res.text());
//       setSuccess(publish ? "פורסם בהצלחה!" : "נשמר בהצלחה!");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Spinner animation="border" className="m-3" />;
//   if (error)
//     return (
//       <Container className="mt-4">
//         <Alert variant="danger">{error}</Alert>
//       </Container>
//     );

//   return (
//     <Container dir="rtl" className="mt-4">
//       <Card className="shadow">
//         <Card.Body>
//           <h4 className="mb-3">עריכת טופס: {formMeta.formName}</h4>
//           {success && <Alert variant="success">{success}</Alert>}

//           {/* --- Form Metadata --- */}
//           <Form>
//             <Row>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>שם הטופס</Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formMeta.formName}
//                     onChange={e =>
//                       setFormMeta({ ...formMeta, formName: e.target.value })
//                     }
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={3}>
//                 <Form.Group>
//                   <Form.Label>שנת לימודים</Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formMeta.academicYear}
//                     onChange={e =>
//                       setFormMeta({
//                         ...formMeta,
//                         academicYear: e.target.value,
//                       })
//                     }
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={3}>
//                 <Form.Group>
//                   <Form.Label>סמסטר</Form.Label>
//                   <Form.Select
//                     value={formMeta.semester}
//                     onChange={e =>
//                       setFormMeta({ ...formMeta, semester: e.target.value })
//                     }
//                   >
//                     {semesterOptions.map(opt => (
//                       <option key={opt.value} value={opt.value}>
//                         {opt.label}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row className="mt-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>תאריך פתיחה</Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={formMeta.startDate?.slice(0, 10) || ""}
//                     onChange={e =>
//                       setFormMeta({ ...formMeta, startDate: e.target.value })
//                     }
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>תאריך סיום</Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={formMeta.dueDate?.slice(0, 10) || ""}
//                     onChange={e =>
//                       setFormMeta({ ...formMeta, dueDate: e.target.value })
//                     }
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Form.Group className="mt-3">
//               <Form.Label>תיאור</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 value={formMeta.description}
//                 onChange={e =>
//                   setFormMeta({ ...formMeta, description: e.target.value })
//                 }
//               />
//             </Form.Group>

//             <Form.Group className="mt-3">
//               <Form.Label>הנחיות</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 value={formMeta.instructions}
//                 onChange={e =>
//                   setFormMeta({ ...formMeta, instructions: e.target.value })
//                 }
//               />
//             </Form.Group>
//           </Form>

//           <hr />

//           {/* --- Sections & Fields --- */}
//           {sections.map((sec, si) => (
//             <Card key={sec.sectionID} className="mb-3">
//               <Card.Header>
//                 <Form.Control
//                   size="sm"
//                   type="text"
//                   value={sec.title}
//                   placeholder="כותרת סעיף"
//                   onChange={e => updateNested([si, "title"], e.target.value)}
//                 />
//               </Card.Header>
//               <Card.Body>
//                 <h6>שדות בסעיף</h6>
//                 {sec.fields.map((f, fi) => (
//                   <Row key={f.fieldID} className="align-items-center mb-2">
//                     <Col md={5}>
//                       <Form.Control
//                         size="sm"
//                         type="text"
//                         value={f.fieldLabel}
//                         placeholder="תווית שדה"
//                         onChange={e =>
//                           updateNested(
//                             [si, "fields", fi, "fieldLabel"],
//                             e.target.value
//                           )
//                         }
//                       />
//                     </Col>
//                     <Col md={4}>
//                       <Form.Select
//                         size="sm"
//                         value={f.fieldType}
//                         onChange={e =>
//                           updateNested(
//                             [si, "fields", fi, "fieldType"],
//                             e.target.value
//                           )
//                         }
//                       >
//                         <option value="">בחר סוג</option>
//                         {fieldTypeOptions.map(opt => (
//                           <option key={opt.value} value={opt.value}>
//                             {opt.label}
//                           </option>
//                         ))}
//                       </Form.Select>
//                     </Col>
//                     <Col md={2}>
//                       <Button
//                         size="sm"
//                         variant="danger"
//                         onClick={() => {
//                           const clone = [...sections];
//                           clone[si].fields.splice(fi, 1);
//                           setSections(clone);
//                         }}
//                       >
//                         הסר
//                       </Button>
//                     </Col>
//                   </Row>
//                 ))}
//               </Card.Body>
//             </Card>
//           ))}

//           <div className="d-flex justify-content-between mt-4">
//             <Button onClick={() => handleSave(false)} variant="warning">
//               שמור כטיוטה
//             </Button>
//             <Button onClick={() => handleSave(true)} variant="success">
//               פרסם
//             </Button>
//           </div>
//         </Card.Body>
//       </Card>
//     </Container>
//   );
// }
