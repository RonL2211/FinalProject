// // src/pages/AddForm/FormSection.jsx
// import React from 'react';
// import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';

// const FormSection = ({ 
//   section, 
//   sectionIndex, 
//   updateSection, 
//   addField, 
//   updateField, 
//   removeField, 
//   addSubSection, 
//   updateSubSection, 
//   removeSubSection,
//   addFieldOption,
//   updateFieldOption,
//   removeFieldOption,
//   fieldTypeOptions,
//   removeSection,
//   departments,
//   users
// }) => {
//   return (
//     <Card className="mb-4 shadow-sm section-card border-0">
//       <Card.Header className="d-flex justify-content-between align-items-center bg-light rounded-top">
//         <div className="d-flex align-items-center">
//           <span className="badge bg-primary me-2 rounded-circle">{sectionIndex + 1}</span>
//           <h6 className="mb-0">
//             {section.title || "סעיף חדש"}
//             {section.maxPoints ? 
//               <span className="text-muted ms-2">({section.maxPoints} נק')</span> : 
//               <span className="text-danger ms-2">(יש להגדיר ניקוד)</span>
//             }
//           </h6>
//         </div>
//         <Button 
//           variant="outline-danger" 
//           size="sm" 
//           onClick={() => removeSection(sectionIndex)}
//           className="rounded-pill px-3"
//         >
//           <i className="bi bi-trash me-1"></i> הסר
//         </Button>
//       </Card.Header>
//       <Card.Body>
//         <Row className="mb-3">
//           <Col md={8}>
//             <Form.Group>
//               <Form.Label>כותרת הסעיף <span className="text-danger">*</span></Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="הזן כותרת"
//                 value={section.title || ''}
//                 onChange={(e) => updateSection(sectionIndex, "title", e.target.value)}
//                 className="rounded-pill"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>ניקוד מקסימלי <span className="text-danger">*</span></Form.Label>
//               <Form.Control
//                 type="number"
//                 placeholder="הזן ניקוד"
//                 value={section.maxPoints || ''}
//                 onChange={(e) => updateSection(sectionIndex, "maxPoints", e.target.value)}
//                 className="rounded-pill"
//               />
//             </Form.Group>
//           </Col>
//         </Row>
        
//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Group>
//               <Form.Label>תיאור הסעיף</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="תיאור קצר של הסעיף"
//                 value={section.description || ''}
//                 onChange={(e) => updateSection(sectionIndex, "description", e.target.value)}
//                 className="rounded-pill"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={6}>
//             <Form.Group>
//               <Form.Label>הסבר למילוי</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 placeholder="הנחיות למילוי הסעיף"
//                 value={section.explanation || ''}
//                 onChange={(e) => updateSection(sectionIndex, "explanation", e.target.value)}
//                 className="rounded"
//               />
//             </Form.Group>
//           </Col>
//         </Row>
        
//         <Row className="mb-3">
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>גורם אחראי (מחלקה)</Form.Label>
//               <Form.Select
//                 value={section.responsibleEntity || ''}
//                 onChange={(e) => updateSection(sectionIndex, "responsibleEntity", e.target.value ? parseInt(e.target.value) : null)}
//                 className="rounded-pill"
//               >
//                 <option value="">בחר מחלקה</option>
//                 {departments && departments.map(dept => (
//                   <option key={dept.departmentID} value={dept.departmentID}>
//                     {dept.departmentName}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>אדם אחראי</Form.Label>
//               <Form.Select
//                 value={section.responsiblePerson || ''}
//                 onChange={(e) => updateSection(sectionIndex, "responsiblePerson", e.target.value)}
//                 className="rounded-pill"
//               >
//                 <option value="">בחר אדם אחראי</option>
//                 {users && users.map(user => (
//                   <option key={user.personId} value={user.personId}>
//                     {user.firstName} {user.lastName}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>מספר מופעים מקסימלי</Form.Label>
//               <Form.Control
//                 type="number"
//                 min="1"
//                 placeholder="1"
//                 value={section.maxOccurrences || 1}
//                 onChange={(e) => updateSection(sectionIndex, "maxOccurrences", parseInt(e.target.value) || 1)}
//                 className="rounded-pill"
//               />
//               <Form.Text className="text-muted">
//                 כמה פעמים ניתן למלא את הסעיף הזה
//               </Form.Text>
//             </Form.Group>
//           </Col>
//         </Row>
        
//         <div className="mb-3 d-flex gap-3">
//           <Form.Check
//             type="switch"
//             id={`required-switch-${sectionIndex}`}
//             label="סעיף חובה"
//             checked={section.isRequired || false}
//             onChange={(e) => updateSection(sectionIndex, "isRequired", e.target.checked)}
//           />
//           <Form.Check
//             type="switch"
//             id={`visible-switch-${sectionIndex}`}
//             label="סעיף גלוי"
//             checked={section.isVisible !== false}
//             onChange={(e) => updateSection(sectionIndex, "isVisible", e.target.checked)}
//           />
//         </div>
        
//         <hr />
        
//         {/* שדות הסעיף */}
//         <div className="section-fields mb-4">
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h6>
//               <i className="bi bi-input-cursor me-2"></i>
//               שדות בסעיף
//               {section.fields && section.fields.length > 0 && 
//                 <span className="text-muted ms-2">({section.fields.length})</span>
//               }
//             </h6>
//             <Button 
//               variant="success" 
//               size="sm"
//               onClick={() => addField(sectionIndex)}
//               className="rounded-pill px-3"
//             >
//               <i className="bi bi-plus-lg me-1"></i> הוסף שדה
//             </Button>
//           </div>
          
//           {(!section.fields || section.fields.length === 0) ? (
//             <Alert variant="light">
//               לא הוגדרו שדות בסעיף זה. הוסף שדה חדש.
//             </Alert>
//           ) : (
//             <div className="fields-container">
//               {section.fields.map((field, fieldIndex) => (
//                 <Card key={fieldIndex} className="mb-3 border-light shadow-sm">
//                   <Card.Header className="bg-white d-flex justify-content-between align-items-center py-2 ps-3 pe-2">
//                     <h6 className="mb-0 d-flex align-items-center">
//                       <div 
//                         className="field-type-icon me-2 rounded-circle d-flex align-items-center justify-content-center"
//                         style={{ width: '28px', height: '28px', background: '#f0f0f0' }}
//                       >
//                         {getFieldTypeIcon(field.fieldType)}
//                       </div>
//                       {field.fieldLabel || `שדה ${fieldIndex + 1}`}
//                       {field.isRequired && <span className="text-danger ms-1">*</span>}
//                     </h6>
//                     <Button 
//                       variant="outline-danger" 
//                       size="sm"
//                       onClick={() => removeField(sectionIndex, fieldIndex)}
//                       className="rounded-circle"
//                       style={{ width: '32px', height: '32px', padding: '0' }}
//                     >
//                       <i className="bi bi-x-lg"></i>
//                     </Button>
//                   </Card.Header>
//                   <Card.Body className="p-3">
//                     <Row className="mb-3">
//                       <Col md={6}>
//                         <Form.Group>
//                           <Form.Label>תווית השדה <span className="text-danger">*</span></Form.Label>
//                           <Form.Control
//                             type="text"
//                             placeholder="לדוגמה: מספר קורסים"
//                             value={field.fieldLabel || ''}
//                             onChange={(e) => updateField(sectionIndex, fieldIndex, "fieldLabel", e.target.value)}
//                             className="rounded-pill"
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={6}>
//                         <Form.Group>
//                           <Form.Label>סוג השדה <span className="text-danger">*</span></Form.Label>
//                           <Form.Select
//                             value={field.fieldType || ''}
//                             onChange={(e) => updateField(sectionIndex, fieldIndex, "fieldType", e.target.value)}
//                             className="rounded-pill"
//                           >
//                             <option value="">בחר סוג שדה</option>
//                             {fieldTypeOptions.map(option => (
//                               <option key={option.value} value={option.value}>
//                                 {option.label}
//                               </option>
//                             ))}
//                           </Form.Select>
//                         </Form.Group>
//                       </Col>
//                     </Row>
                    
//                     <Row className="mb-3">
//                       <Col md={field.fieldType === 'number' ? 4 : 6}>
//                         <Form.Group>
//                           <Form.Label>שם שדה מערכתי</Form.Label>
//                           <Form.Control
//                             type="text"
//                             placeholder="לדוגמה: courseCount"
//                             value={field.fieldName || ''}
//                             onChange={(e) => updateField(sectionIndex, fieldIndex, "fieldName", e.target.value)}
//                             className="rounded-pill"
//                           />
//                           <Form.Text className="text-muted">
//                             זיהוי פנימי של השדה (באנגלית בלבד)
//                           </Form.Text>
//                         </Form.Group>
//                       </Col>
//                       <Col md={field.fieldType === 'number' ? 4 : 6}>
//                         <Form.Group>
//                           <Form.Label>טקסט עזרה</Form.Label>
//                           <Form.Control
//                             type="text"
//                             placeholder="הסבר למשתמש"
//                             value={field.helpText || ''}
//                             onChange={(e) => updateField(sectionIndex, fieldIndex, "helpText", e.target.value)}
//                             className="rounded-pill"
//                           />
//                         </Form.Group>
//                       </Col>
//                       {field.fieldType === 'number' && (
//                         <Col md={4}>
//                           <Form.Group>
//                             <Form.Label>ערך ברירת מחדל</Form.Label>
//                             <Form.Control
//                               type="number"
//                               placeholder="0"
//                               value={field.defaultValue || ''}
//                               onChange={(e) => updateField(sectionIndex, fieldIndex, "defaultValue", e.target.value)}
//                               className="rounded-pill"
//                             />
//                           </Form.Group>
//                         </Col>
//                       )}
//                     </Row>
                    
//                     {field.fieldType === 'number' && (
//                       <Row className="mb-3">
//                         <Col md={6}>
//                           <Form.Group>
//                             <Form.Label>ערך מינימלי</Form.Label>
//                             <Form.Control
//                               type="number"
//                               placeholder="ללא מינימום"
//                               value={field.minValue || ''}
//                               onChange={(e) => updateField(sectionIndex, fieldIndex, "minValue", e.target.value)}
//                               className="rounded-pill"
//                             />
//                           </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                           <Form.Group>
//                             <Form.Label>ערך מקסימלי</Form.Label>
//                             <Form.Control
//                               type="number"
//                               placeholder="ללא מקסימום"
//                               value={field.maxValue || ''}
//                               onChange={(e) => updateField(sectionIndex, fieldIndex, "maxValue", e.target.value)}
//                               className="rounded-pill"
//                             />
//                           </Form.Group>
//                         </Col>
//                       </Row>
//                     )}
                    
//                     {(field.fieldType === 'text' || field.fieldType === 'textarea') && (
//                       <Row className="mb-3">
//                         <Col md={6}>
//                           <Form.Group>
//                             <Form.Label>טקסט מציין מקום</Form.Label>
//                             <Form.Control
//                               type="text"
//                               placeholder="טקסט שיופיע בשדה לפני המילוי"
//                               value={field.placeholder || ''}
//                               onChange={(e) => updateField(sectionIndex, fieldIndex, "placeholder", e.target.value)}
//                               className="rounded-pill"
//                             />
//                           </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                           <Form.Group>
//                             <Form.Label>אורך מקסימלי</Form.Label>
//                             <Form.Control
//                               type="number"
//                               placeholder="ללא הגבלה"
//                               value={field.maxLength || ''}
//                               onChange={(e) => updateField(sectionIndex, fieldIndex, "maxLength", e.target.value ? parseInt(e.target.value) : null)}
//                               className="rounded-pill"
//                             />
//                           </Form.Group>
//                         </Col>
//                       </Row>
//                     )}
                    
//                     <div className="mb-3 d-flex gap-3">
//                       <Form.Check
//                         type="switch"
//                         id={`required-field-${sectionIndex}-${fieldIndex}`}
//                         label="שדה חובה"
//                         checked={field.isRequired || false}
//                         onChange={(e) => updateField(sectionIndex, fieldIndex, "isRequired", e.target.checked)}
//                       />
//                       <Form.Check
//                         type="switch"
//                         id={`visible-field-${sectionIndex}-${fieldIndex}`}
//                         label="שדה גלוי"
//                         checked={field.isVisible !== false}
//                         onChange={(e) => updateField(sectionIndex, fieldIndex, "isVisible", e.target.checked)}
//                       />
//                     </div>
                    
//                     {/* אפשרויות לשדות בחירה */}
//                     {['select', 'radio', 'checkbox'].includes(field.fieldType) && (
//                       <div className="field-options mt-3">
//                         <h6 className="d-flex align-items-center">
//                           <i className="bi bi-list-check me-2"></i>
//                           אפשרויות בחירה
//                           {field.options && field.options.length > 0 && 
//                             <span className="text-muted ms-2">({field.options.length})</span>
//                           }
//                         </h6>
                        
//                         {(!field.options || field.options.length === 0) ? (
//                           <div className="text-center py-3">
//                             <Button 
//                               variant="outline-primary" 
//                               size="sm"
//                               onClick={() => addFieldOption(sectionIndex, fieldIndex)}
//                               className="rounded-pill px-3"
//                             >
//                               <i className="bi bi-plus-lg me-1"></i> הוסף אפשרות ראשונה
//                             </Button>
//                           </div>
//                         ) : (
//                           <>
//                             <div className="options-container bg-light p-3 rounded my-2">
//                               {field.options.map((option, optionIndex) => (
//                                 <div key={optionIndex} className="option-item d-flex align-items-center mb-2">
//                                   <div className="flex-grow-1 me-2">
//                                     <Row>
//                                       <Col md={6}>
//                                         <Form.Control
//                                           size="sm"
//                                           type="text"
//                                           placeholder="תווית האפשרות"
//                                           value={option.optionLabel || ''}
//                                           onChange={(e) => updateFieldOption(sectionIndex, fieldIndex, optionIndex, "optionLabel", e.target.value)}
//                                           className="rounded-pill"
//                                         />
//                                       </Col>
//                                       <Col md={3}>
//                                         <Form.Control
//                                           size="sm"
//                                           type="number"
//                                           placeholder="ניקוד"
//                                           value={option.scoreValue || ''}
//                                           onChange={(e) => updateFieldOption(sectionIndex, fieldIndex, optionIndex, "scoreValue", e.target.value)}
//                                           className="rounded-pill"
//                                         />
//                                       </Col>
//                                       <Col md={3} className="d-flex align-items-center">
//                                         <Form.Check
//                                           type="switch"
//                                           id={`default-option-${sectionIndex}-${fieldIndex}-${optionIndex}`}
//                                           label="ברירת מחדל"
//                                           checked={option.isDefault || false}
//                                           onChange={(e) => updateFieldOption(sectionIndex, fieldIndex, optionIndex, "isDefault", e.target.checked)}
//                                         />
//                                       </Col>
//                                     </Row>
//                                   </div>
//                                   <Button 
//                                     variant="outline-danger" 
//                                     size="sm"
//                                     onClick={() => removeFieldOption(sectionIndex, fieldIndex, optionIndex)}
//                                     className="rounded-circle"
//                                     style={{ width: '28px', height: '28px', padding: '0' }}
//                                   >
//                                     <i className="bi bi-x"></i>
//                                   </Button>
//                                 </div>
//                               ))}
//                             </div>
                            
//                             <div className="text-center">
//                               <Button 
//                                 variant="outline-primary" 
//                                 size="sm"
//                                 onClick={() => addFieldOption(sectionIndex, fieldIndex)}
//                                 className="rounded-pill px-3"
//                               >
//                                 <i className="bi bi-plus-lg me-1"></i> הוסף אפשרות נוספת
//                               </Button>
//                             </div>
//                           </>
//                         )}
//                       </div>
//                     )}
//                   </Card.Body>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
        
//         <hr />
        
//         {/* תתי-סעיפים */}
//         <div className="sub-sections mb-3">
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h6>
//               <i className="bi bi-diagram-3 me-2"></i>
//               תתי-סעיפים
//               {section.subSections && section.subSections.length > 0 && 
//                 <span className="text-muted ms-2">({section.subSections.length})</span>
//               }
//             </h6>
//             <Button 
//               variant="info" 
//               size="sm"
//               onClick={() => addSubSection(sectionIndex)}
//               className="rounded-pill px-3"
//             >
//               <i className="bi bi-plus-lg me-1"></i> הוסף תת-סעיף
//             </Button>
//           </div>
          
//           {(!section.subSections || section.subSections.length === 0) ? (
//             <Alert variant="light">
//               לא הוגדרו תתי-סעיפים. ניתן להוסיף תת-סעיף לסעיף זה.
//             </Alert>
//           ) : (
//             <div className="sub-sections-container">
//               {section.subSections.map((subSection, subIndex) => (
//                 <Card key={subIndex} className="mb-3 border-light shadow-sm ms-4">
//                   <Card.Header className="bg-light d-flex justify-content-between align-items-center">
//                     <h6 className="mb-0">
//                       {section.title || "סעיף"} &raquo; {subSection.title || `תת-סעיף ${subIndex + 1}`}
//                       {subSection.maxPoints && <span className="text-muted ms-2">({subSection.maxPoints} נק')</span>}
//                     </h6>
//                     <Button 
//                       variant="outline-danger" 
//                       size="sm"
//                       onClick={() => removeSubSection(sectionIndex, subIndex)}
//                       className="rounded-pill px-3"
//                     >
//                       <i className="bi bi-trash me-1"></i> הסר
//                     </Button>
//                   </Card.Header>
//                   <Card.Body>
//                     <Row className="mb-3">
//                       <Col md={8}>
//                         <Form.Group>
//                           <Form.Label>כותרת תת-הסעיף <span className="text-danger">*</span></Form.Label>
//                           <Form.Control
//                             type="text"
//                             placeholder="הזן כותרת"
//                             value={subSection.title || ''}
//                             onChange={(e) => updateSubSection(sectionIndex, subIndex, "title", e.target.value)}
//                             className="rounded-pill"
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={4}>
//                         <Form.Group>
//                           <Form.Label>ניקוד מקסימלי <span className="text-danger">*</span></Form.Label>
//                           <Form.Control
//                             type="number"
//                             placeholder="הזן ניקוד"
//                             value={subSection.maxPoints || ''}
//                             onChange={(e) => updateSubSection(sectionIndex, subIndex, "maxPoints", e.target.value)}
//                             className="rounded-pill"
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row>
                    
//                     <Form.Group className="mb-3">
//                       <Form.Label>הסבר תת-הסעיף</Form.Label>
//                       <Form.Control
//                         as="textarea"
//                         rows={2}
//                         placeholder="הסבר על תת-הסעיף"
//                         value={subSection.explanation || ''}
//                         onChange={(e) => updateSubSection(sectionIndex, subIndex, "explanation", e.target.value)}
//                         className="rounded"
//                       />
//                     </Form.Group>
                    
//                     <div className="mb-3 d-flex gap-3">
//                       <Form.Check
//                         type="switch"
//                         id={`required-subsection-${sectionIndex}-${subIndex}`}
//                         label="תת-סעיף חובה"
//                         checked={subSection.isRequired || false}
//                         onChange={(e) => updateSubSection(sectionIndex, subIndex, "isRequired", e.target.checked)}
//                       />
//                       <Form.Check
//                         type="switch"
//                         id={`visible-subsection-${sectionIndex}-${subIndex}`}
//                         label="תת-סעיף גלוי"
//                         checked={subSection.isVisible !== false}
//                         onChange={(e) => updateSubSection(sectionIndex, subIndex, "isVisible", e.target.checked)}
//                       />
//                     </div>
//                   </Card.Body>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
//       </Card.Body>
//     </Card>
//   );
// };

// // פונקציית עזר לקבלת אייקון מתאים לסוג השדה
// function getFieldTypeIcon(fieldType) {
//   switch (fieldType) {
//     case 'text':
//       return <i className="bi bi-input-cursor-text"></i>;
//     case 'textarea':
//       return <i className="bi bi-textarea-t"></i>;
//     case 'number':
//       return <i className="bi bi-123"></i>;
//     case 'date':
//       return <i className="bi bi-calendar"></i>;
//     case 'select':
//       return <i className="bi bi-menu-button-wide"></i>;
//     case 'checkbox':
//       return <i className="bi bi-check-square"></i>;
//     case 'radio':
//       return <i className="bi bi-record-circle"></i>;
//     case 'file':
//       return <i className="bi bi-file-earmark-arrow-up"></i>;
//     case 'url':
//       return <i className="bi bi-link-45deg"></i>;
//     case 'email':
//       return <i className="bi bi-envelope"></i>;
//     default:
//       return <i className="bi bi-question"></i>;
//   }
// }

// export default FormSection;