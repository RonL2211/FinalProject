// // src/pages/form-add/FormSummary.jsx
// import React from 'react';
// import { Card, Row, Col, Button, Alert, Badge, Table } from 'react-bootstrap';

// const FormSummary = ({ formData, sections, onSave, loading }) => {
//   const totalPoints = sections.reduce((total, section) => 
//     total + (parseFloat(section.maxPoints) || 0), 0
//   );
  
//   const totalFields = sections.reduce((total, section) => {
//     const mainFields = section.fields?.length || 0;
//     const subFields = (section.subSections || []).reduce((subTotal, subSection) => 
//       subTotal + (subSection.fields?.length || 0), 0
//     );
//     return total + mainFields + subFields;
//   }, 0);
  
//   const totalSubSections = sections.reduce((total, section) => 
//     total + (section.subSections?.length || 0), 0
//   );

//   const getFieldTypeLabel = (fieldType) => {
//     const types = {
//       text: "טקסט קצר",
//       textarea: "טקסט ארוך", 
//       number: "מספר",
//       date: "תאריך",
//       select: "תפריט בחירה",
//       checkbox: "תיבת סימון",
//       radio: "כפתורי רדיו",
//       file: "העלאת קובץ",
//       url: "כתובת אינטרנט",
//       email: "דוא״ל"
//     };
//     return types[fieldType] || fieldType;
//   };

//   return (
//     <div className="form-summary">
//       {/* Header */}
//       <div className="text-center mb-4">
//         <h5 className="text-primary mb-1">
//           <i className="bi bi-check2-circle me-2"></i>
//           סיכום ושמירת הטופס
//         </h5>
//         <p className="text-muted mb-0">בדוק את פרטי הטופס לפני השמירה</p>
//       </div>

//       {/* Quick Stats */}
//       <Card className="border-0 bg-primary bg-opacity-10 mb-4">
//         <Card.Body className="text-center py-3">
//           <Row>
//             <Col md={3}>
//               <div className="d-flex align-items-center justify-content-center">
//                 <i className="bi bi-list-ol text-primary me-2 fs-4"></i>
//                 <div>
//                   <div className="fw-bold fs-4 text-primary">{sections.length}</div>
//                   <small className="text-muted">סעיפים</small>
//                 </div>
//               </div>
//             </Col>
//             <Col md={3}>
//               <div className="d-flex align-items-center justify-content-center">
//                 <i className="bi bi-input-cursor text-success me-2 fs-4"></i>
//                 <div>
//                   <div className="fw-bold fs-4 text-success">{totalFields}</div>
//                   <small className="text-muted">שדות</small>
//                 </div>
//               </div>
//             </Col>
//             <Col md={3}>
//               <div className="d-flex align-items-center justify-content-center">
//                 <i className="bi bi-diagram-3 text-info me-2 fs-4"></i>
//                 <div>
//                   <div className="fw-bold fs-4 text-info">{totalSubSections}</div>
//                   <small className="text-muted">תתי-סעיפים</small>
//                 </div>
//               </div>
//             </Col>
//             <Col md={3}>
//               <div className="d-flex align-items-center justify-content-center">
//                 <i className="bi bi-trophy text-warning me-2 fs-4"></i>
//                 <div>
//                   <div className="fw-bold fs-4 text-warning">{totalPoints}</div>
//                   <small className="text-muted">נקודות כולל</small>
//                 </div>
//               </div>
//             </Col>
//           </Row>
//         </Card.Body>
//       </Card>

//       {/* Form Metadata */}
//       <Card className="mb-4 shadow-sm border-0">
//         <Card.Header className="bg-light">
//           <h6 className="mb-0">
//             <i className="bi bi-info-circle me-2"></i>
//             פרטי הטופס
//           </h6>
//         </Card.Header>
//         <Card.Body>
//           <Row>
//             <Col md={6}>
//               <Table borderless size="sm">
//                 <tbody>
//                   <tr>
//                     <td className="fw-semibold" style={{width: '40%'}}>שם הטופס:</td>
//                     <td>{formData.formName}</td>
//                   </tr>
//                   <tr>
//                     <td className="fw-semibold">שנת לימודים:</td>
//                     <td>{formData.academicYear}</td>
//                   </tr>
//                   <tr>
//                     <td className="fw-semibold">סמסטר:</td>
//                     <td>
//                       {formData.semester ? 
//                         {א: 'סמסטר א\'', ב: 'סמסטר ב\'', ק: 'סמסטר קיץ', ש: 'שנתי'}[formData.semester] || formData.semester
//                         : 'לא צוין'
//                       }
//                     </td>
//                   </tr>
//                 </tbody>
//               </Table>
//             </Col>
//             <Col md={6}>
//               <Table borderless size="sm">
//                 <tbody>
//                   <tr>
//                     <td className="fw-semibold" style={{width: '40%'}}>תאריך פתיחה:</td>
//                     <td>{formData.startDate ? new Date(formData.startDate).toLocaleDateString('he-IL') : 'לא הוגדר'}</td>
//                   </tr>
//                   <tr>
//                     <td className="fw-semibold">תאריך סיום:</td>
//                     <td>{formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('he-IL') : 'לא הוגדר'}</td>
//                   </tr>
//                   <tr>
//                     <td className="fw-semibold">סטטוס:</td>
//                     <td>
//                       <Badge bg={formData.isActive !== false ? 'success' : 'secondary'}>
//                         {formData.isActive !== false ? 'פעיל' : 'לא פעיל'}
//                       </Badge>
//                     </td>
//                   </tr>
//                 </tbody>
//               </Table>
//             </Col>
//           </Row>
          
//           {formData.description && (
//             <>
//               <hr />
//               <div>
//                 <h6 className="fw-semibold">תיאור הטופס:</h6>
//                 <p className="text-muted mb-0">{formData.description}</p>
//               </div>
//             </>
//           )}
          
//           {formData.instructions && (
//             <>
//               <hr />
//               <div>
//                 <h6 className="fw-semibold">הנחיות למילוי:</h6>
//                 <p className="text-muted mb-0">{formData.instructions}</p>
//               </div>
//             </>
//           )}
//         </Card.Body>
//       </Card>

//       {/* Sections Summary */}
//       <Card className="mb-4 shadow-sm border-0">
//         <Card.Header className="bg-light">
//           <h6 className="mb-0">
//             <i className="bi bi-list-nested me-2"></i>
//             סעיפים וקריטריונים
//             {sections.length > 0 && (
//               <Badge bg="primary" className="ms-2 rounded-pill">{sections.length}</Badge>
//             )}
//           </h6>
//         </Card.Header>
//         <Card.Body>
//           {sections.length === 0 ? (
//             <div className="text-center text-muted py-3">
//               <i className="bi bi-exclamation-triangle fs-1 mb-2"></i>
//               <p>לא הוגדרו סעיפים בטופס זה.</p>
//             </div>
//           ) : (
//             <div className="sections-summary">
//               {sections.map((section, index) => (
//                 <Card key={section.id || index} className="mb-3 border-light">
//                   <Card.Body className="p-3">
//                     <div className="d-flex justify-content-between align-items-start mb-2">
//                       <h6 className="mb-0 d-flex align-items-center">
//                         <span className="badge bg-primary me-2 rounded-circle">{index + 1}</span>
//                         {section.title}
//                         {section.isRequired && (
//                           <Badge bg="danger" className="ms-2">חובה</Badge>
//                         )}
//                       </h6>
//                       <Badge bg="success" className="rounded-pill">
//                         {section.maxPoints} נק'
//                       </Badge>
//                     </div>
                    
//                     {section.description && (
//                       <p className="text-muted small mb-2">{section.description}</p>
//                     )}
                    
//                     {/* Fields Summary */}
//                     {section.fields && section.fields.length > 0 && (
//                       <div className="ms-3 mb-2">
//                         <div className="d-flex align-items-center mb-1">
//                           <i className="bi bi-input-cursor me-1 text-primary"></i>
//                           <span className="fw-semibold small">שדות ({section.fields.length}):</span>
//                         </div>
//                         <div className="ms-3">
//                           {section.fields.map((field, fieldIndex) => (
//                             <div key={field.id || fieldIndex} className="d-flex align-items-center justify-content-between py-1 border-bottom border-light">
//                               <div className="d-flex align-items-center">
//                                 <span className="small">
//                                   <strong>{field.fieldLabel}</strong>
//                                   {field.isRequired && <span className="text-danger ms-1">*</span>}
//                                 </span>
//                               </div>
//                               <div className="d-flex align-items-center gap-2">
//                                 <Badge bg="info" className="small">
//                                   {getFieldTypeLabel(field.fieldType)}
//                                 </Badge>
//                                 {['select', 'radio', 'checkbox'].includes(field.fieldType) && field.options?.length > 0 && (
//                                   <Badge bg="secondary" className="small">
//                                     {field.options.length} אפשרויות
//                                   </Badge>
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
                    
//                     {/* Sub-sections Summary */}
//                     {section.subSections && section.subSections.length > 0 && (
//                       <div className="ms-3">
//                         <div className="d-flex align-items-center mb-1">
//                           <i className="bi bi-diagram-3 me-1 text-info"></i>
//                           <span className="fw-semibold small">תתי-סעיפים ({section.subSections.length}):</span>
//                         </div>
//                         <div className="ms-3">
//                           {section.subSections.map((subSection, subIndex) => (
//                             <div key={subSection.id || subIndex} className="mb-2 p-2 bg-light rounded">
//                               <div className="d-flex justify-content-between align-items-center mb-1">
//                                 <span className="fw-semibold small">
//                                   {subSection.title} ({subSection.maxPoints} נק')
//                                   {subSection.isRequired && <span className="text-danger ms-1">*</span>}
//                                 </span>
//                               </div>
                              
//                               {/* Sub-section Fields */}
//                               {subSection.fields && subSection.fields.length > 0 && (
//                                 <div className="ms-2">
//                                   <span className="small text-muted">שדות:</span>
//                                   <div className="ms-2">
//                                     {subSection.fields.map((field, fieldIndex) => (
//                                       <div key={field.id || fieldIndex} className="d-flex align-items-center justify-content-between py-1 small">
//                                         <span>
//                                           {field.fieldLabel}
//                                           {field.isRequired && <span className="text-danger ms-1">*</span>}
//                                         </span>
//                                         <div className="d-flex align-items-center gap-1">
//                                           <Badge bg="light" text="dark" className="small">
//                                             {getFieldTypeLabel(field.fieldType)}
//                                           </Badge>
//                                           {['select', 'radio', 'checkbox'].includes(field.fieldType) && field.options?.length > 0 && (
//                                             <Badge bg="secondary" className="small">
//                                               {field.options.length} אפשרויות
//                                             </Badge>
//                                           )}
//                                         </div>
//                                       </div>
//                                     ))}
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </Card.Body>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </Card.Body>
//       </Card>

//       {/* Validation Warnings */}
//       <Alert variant="info" className="d-flex align-items-start">
//         <i className="bi bi-info-circle me-2 mt-1"></i>
//         <div>
//           <strong>שים לב:</strong> בעת פרסום הטופס, הוא יהיה זמין למילוי על ידי המרצים.
//           <br />
//           לפני פרסום, אנא וודא שכל הפרטים והקריטריונים נכונים ומדויקים.
//           <br />
//           <small className="text-muted">
//             לאחר פרסום ניתן יהיה לערוך את הטופס, אך שינויים עלולים להשפיע על טפסים שכבר נמלאו.
//           </small>
//         </div>
//       </Alert>

//       {/* Action Buttons */}
//       <div className="d-flex justify-content-center gap-3 mt-4">
//         <Button 
//           variant="outline-warning" 
//           onClick={() => onSave(false)}
//           disabled={loading}
//           className="rounded-pill px-5"
//           size="lg"
//         >
//           <i className="bi bi-save me-2"></i>
//           שמור כטיוטה
//         </Button>
//         <Button 
//           variant="success" 
//           onClick={() => onSave(true)}
//           disabled={loading}
//           className="rounded-pill px-5"
//           size="lg"
//         >
//           <i className="bi bi-send me-2"></i>
//           פרסם טופס
//         </Button>
//       </div>

//       {/* Loading Overlay */}
//       {loading && (
//         <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{zIndex: 9999}}>
//           <div className="bg-white p-4 rounded shadow text-center">
//             <div className="spinner-border text-primary mb-3" role="status"></div>
//             <h6>שומר את הטופס...</h6>
//             <small className="text-muted">אנא המתן</small>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FormSummary;