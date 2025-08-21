// import React, { useState, useEffect } from 'react';
// import { Container, Row, Col, Card, Button, Form, Alert, Modal, Accordion, Badge, ProgressBar } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
// import { formService } from '../../services/formService';
// import Swal from 'sweetalert2';

// import LoadingSpinner from '../../components/UI/LoadingSpinner';
// import ErrorAlert from '../../components/UI/ErrorAlert';

// const FormBuilder = () => {
//   const navigate = useNavigate();
  
//   // Form basic info - תוקן לפי המבנה הנכון בשרת
//   const [formInfo, setFormInfo] = useState({
//     formName: '',
//     description: '',
//     instructions: '', // הוספת שדה instructions שחסר
//     academicYear: String(new Date().getFullYear()),
//     semester: 'A',
//     startDate: null,
//     dueDate: null, // תוקן השם מ-endDate ל-dueDate
//     createdBy: '', // יתמלא אוטומטית בשרת
//     isActive: true,
//     isPublished: false
//   });

//   // Form structure
//   const [sections, setSections] = useState([]);
//   const [currentStep, setCurrentStep] = useState(1);
  
//   // UI states
//   const [saving, setSaving] = useState(false);
//   const [publishing, setPublishing] = useState(false);
//   const [error, setError] = useState('');
//   const [showAddSectionModal, setShowAddSectionModal] = useState(false);
//   const [showAddFieldModal, setShowAddFieldModal] = useState(false);
//   const [selectedSection, setSelectedSection] = useState(null);

//   // Add section form - תוקן לפי המבנה הנכון
//   const [newSection, setNewSection] = useState({
//     title: '',
//     description: '',
//     explanation: '',
//     maxPoints: null,
//     level: 1,
//     parentSectionID: null,
//     isRequired: false,
//     isVisible: true,
//     orderIndex: 1,
//     responsibleEntity: null,
//     responsiblePerson: null,
//     maxOccurrences: 1
//   });

//   // Add field form - תוקן לפי המבנה הנכון
//   const [newField, setNewField] = useState({
//     fieldName: '', // הוסף שם פנימי לשדה
//     fieldLabel: '',
//     fieldType: 'Text',
//     description: '',
//     helpText: '',
//     placeholder: '',
//     defaultValue: '',
//     isRequired: false,
//     isVisible: true,
//     orderIndex: 1,
//     maxLength: null,
//     minValue: null,
//     maxValue: null,
//     validationRegex: null,
//     options: []
//   });

//   // Field types available
//   const fieldTypes = [
//     { value: 'Text', label: 'תיבת טקסט קצר' },
//     { value: 'TextArea', label: 'תיבת טקסט ארוך' },
//     { value: 'Number', label: 'מספר' },
//     { value: 'Select', label: 'רשימה נפתחת' },
//     { value: 'Radio', label: 'בחירה יחידה' },
//     { value: 'Checkbox', label: 'בחירה מרובה' },
//     { value: 'Date', label: 'תאריך' },
//     { value: 'File', label: 'העלאת קובץ' }
//   ];

//   useEffect(() => {
//     // Initialize with current academic year dates
//     const currentYear = new Date().getFullYear();
//     const startDate = new Date(currentYear, 9, 1); // October 1st
//     const dueDate = new Date(currentYear + 1, 8, 30); // September 30th next year
    
//     setFormInfo(prev => ({
//       ...prev,
//       startDate: startDate.toISOString().split('T')[0],
//       dueDate: dueDate.toISOString().split('T')[0]
//     }));
//   }, []);

//   const validateStep1 = () => {
//     return formInfo.formName.trim() && 
//            formInfo.description.trim();
//   };

//   const validateStep2 = () => {
//     if (sections.length === 0) return false;
    
//     // Check if all sections have at least one field
//     return sections.every(section => 
//       section.fields && section.fields.length > 0
//     );
//   };

//   const handleAddSection = () => {
//     if (!newSection.title.trim()) {
//       Swal.fire({
//         icon: 'error',
//         title: 'שגיאה',
//         text: 'יש להזין כותרת לסעיף',
//         confirmButtonText: 'אישור'
//       });
//       return;
//     }

//     const section = {
//       ...newSection,
//       tempId: Date.now(), // ID זמני לצורך התצוגה
//       orderIndex: sections.length + 1,
//       fields: []
//     };

//     setSections([...sections, section]);
    
//     // איפוס הטופס
//     setNewSection({
//       title: '',
//       description: '',
//       explanation: '',
//       maxPoints: null,
//       level: 1,
//       parentSectionID: null,
//       isRequired: false,
//       isVisible: true,
//       orderIndex: 1,
//       responsibleEntity: null,
//       responsiblePerson: null,
//       maxOccurrences: 1
//     });
    
//     setShowAddSectionModal(false);
//     setError('');
//   };

//   const handleAddField = () => {
//     if (!selectedSection || !newField.fieldLabel.trim()) {
//       Swal.fire({
//         icon: 'error',
//         title: 'שגיאה',
//         text: 'יש להזין תווית לשדה',
//         confirmButtonText: 'אישור'
//       });
//       return;
//     }

//     const field = {
//       ...newField,
//       fieldName: newField.fieldLabel.replace(/\s+/g, '_'), // יצירת שם פנימי
//       tempId: Date.now(),
//       orderIndex: selectedSection.fields ? selectedSection.fields.length + 1 : 1
//     };

//     const updatedSections = sections.map(section => {
//       if (section.tempId === selectedSection.tempId) {
//         return {
//           ...section,
//           fields: [...(section.fields || []), field]
//         };
//       }
//       return section;
//     });

//     setSections(updatedSections);
    
//     // איפוס הטופס
//     setNewField({
//       fieldName: '',
//       fieldLabel: '',
//       fieldType: 'Text',
//       description: '',
//       helpText: '',
//       placeholder: '',
//       defaultValue: '',
//       isRequired: false,
//       isVisible: true,
//       orderIndex: 1,
//       maxLength: null,
//       minValue: null,
//       maxValue: null,
//       validationRegex: null,
//       options: []
//     });
    
//     setShowAddFieldModal(false);
//     setSelectedSection(null);
//     setError('');
//   };

//   const handleRemoveSection = (sectionId) => {
//     Swal.fire({
//       title: 'האם אתה בטוח?',
//       text: 'מחיקת הסעיף תמחק גם את כל השדות שבו',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'כן, מחק',
//       cancelButtonText: 'ביטול'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setSections(sections.filter(s => s.tempId !== sectionId));
//       }
//     });
//   };

//   const handleRemoveField = (sectionId, fieldId) => {
//     const updatedSections = sections.map(section => {
//       if (section.tempId === sectionId) {
//         return {
//           ...section,
//           fields: section.fields.filter(f => f.tempId !== fieldId)
//         };
//       }
//       return section;
//     });
//     setSections(updatedSections);
//   };

//   const handleAddFieldOption = () => {
//     setNewField({
//       ...newField,
//       options: [...newField.options, { 
//         optionLabel: '', 
//         optionValue: '', 
//         scoreValue: null,
//         isDefault: false,
//         orderIndex: newField.options.length + 1
//       }]
//     });
//   };

//   const handleRemoveFieldOption = (index) => {
//     const updatedOptions = newField.options.filter((_, i) => i !== index);
//     setNewField({ ...newField, options: updatedOptions });
//   };

//   const handleUpdateFieldOption = (index, key, value) => {
//     const updatedOptions = newField.options.map((option, i) => {
//       if (i === index) {
//         return { ...option, [key]: value };
//       }
//       return option;
//     });
//     setNewField({ ...newField, options: updatedOptions });
//   };

//   const handleSaveForm = async (publish = false) => {
//     if (publish) {
//       setPublishing(true);
//     } else {
//       setSaving(true);
//     }
    
//     setError('');

//     try {
//       // הכנת המבנה הנכון לשרת
//       const formData = {
//         formName: formInfo.formName,
//         description: formInfo.description,
//         instructions: formInfo.instructions || '',
//         academicYear: formInfo.academicYear,
//         semester: formInfo.semester?.charAt(0) || 'A', // וודא שזה תו בודד
//         startDate: formInfo.startDate,
//         dueDate: formInfo.dueDate,
//         isActive: true,
//         isPublished: false
//       };

//       // יצירת הטופס תחילה
//       const formResult = await formService.createForm(formData);
      
//       if (!formResult || !formResult.formID) {
//         throw new Error('Failed to create form');
//       }

//       const formId = formResult.formID;

//       // יצירת סעיפים ושדות
//       for (const section of sections) {
//         // יצירת סעיף
//         const sectionData = {
//           formId: formId,
//           title: section.title,
//           description: section.description || '',
//           explanation: section.explanation || '',
//           maxPoints: section.maxPoints || null,
//           level: section.level || 1,
//           parentSectionID: section.parentSectionID || null,
//           orderIndex: section.orderIndex,
//           isRequired: section.isRequired || false,
//           isVisible: section.isVisible !== false,
//           responsibleEntity: section.responsibleEntity || null,
//           responsiblePerson: section.responsiblePerson || null,
//           maxOccurrences: section.maxOccurrences || 1
//         };

//         const sectionResult = await formService.createSection(sectionData);
        
//         if (sectionResult && sectionResult.sectionID && section.fields) {
//           // יצירת שדות לסעיף
//           for (const field of section.fields) {
//             const fieldData = {
//               sectionID: sectionResult.sectionID,
//               fieldName: field.fieldName || field.fieldLabel.replace(/\s+/g, '_'),
//               fieldLabel: field.fieldLabel,
//               fieldType: field.fieldType,
//               isRequired: field.isRequired || false,
//               defaultValue: field.defaultValue || null,
//               placeholder: field.placeholder || null,
//               helpText: field.helpText || null,
//               orderIndex: field.orderIndex,
//               isVisible: field.isVisible !== false,
//               maxLength: field.maxLength || null,
//               minValue: field.minValue || null,
//               maxValue: field.maxValue || null,
//               validationRegex: field.validationRegex || null
//             };

//             const fieldResult = await formService.createField(fieldData);

//             // יצירת אפשרויות לשדה אם יש
//             if (fieldResult && fieldResult.fieldID && field.options && field.options.length > 0) {
//               for (const option of field.options) {
//                 const optionData = {
//                   fieldID: fieldResult.fieldID,
//                   optionValue: option.optionValue || option.optionLabel,
//                   optionLabel: option.optionLabel,
//                   scoreValue: option.scoreValue || null,
//                   orderIndex: option.orderIndex || 1,
//                   isDefault: option.isDefault || false
//                 };

//                 await formService.createFieldOption(optionData);
//               }
//             }
//           }
//         }
//       }

//       // פרסום הטופס אם נדרש
//       if (publish) {
//         await formService.publishForm(formId);
//       }

//       // הודעת הצלחה
//       Swal.fire({
//         icon: 'success',
//         title: 'הצלחה!',
//         text: publish ? 'הטופס נוצר ופורסם בהצלחה!' : 'הטופס נשמר בהצלחה כטיוטה!',
//         confirmButtonText: 'אישור',
//         timer: 3000,
//         timerProgressBar: true
//       }).then(() => {
//         navigate('/manager/forms');
//       });

//     } catch (err) {
//       console.error('Error saving form:', err);
      
//       Swal.fire({
//         icon: 'error',
//         title: 'שגיאה',
//         text: err.message || 'אירעה שגיאה בשמירת הטופס',
//         confirmButtonText: 'אישור'
//       });
//     } finally {
//       setSaving(false);
//       setPublishing(false);
//     }
//   };

//   const renderStepIndicator = () => (
//     <Card className="mb-4">
//       <Card.Body>
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h6 className="mb-0">שלבי בניית הטופס</h6>
//           <Badge bg="primary">{currentStep}/3</Badge>
//         </div>
//         <ProgressBar now={(currentStep / 3) * 100} className="mb-2" />
//         <div className="d-flex justify-content-between small text-muted">
//           <span className={currentStep >= 1 ? 'text-primary fw-bold' : ''}>פרטי בסיס</span>
//           <span className={currentStep >= 2 ? 'text-primary fw-bold' : ''}>בניית מבנה</span>
//           <span className={currentStep >= 3 ? 'text-primary fw-bold' : ''}>סיכום ופרסום</span>
//         </div>
//       </Card.Body>
//     </Card>
//   );

//   const renderStep1 = () => (
//     <Card>
//       <Card.Header>
//         <h5>פרטי הטופס</h5>
//       </Card.Header>
//       <Card.Body>
//         <Form>
//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>שם הטופס <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={formInfo.formName}
//                   onChange={(e) => setFormInfo({...formInfo, formName: e.target.value})}
//                   placeholder="הזן שם לטופס"
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>שנה אקדמית <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={formInfo.academicYear}
//                   onChange={(e) => setFormInfo({...formInfo, academicYear: e.target.value})}
//                   placeholder="לדוגמה: 2024"
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>סמסטר</Form.Label>
//                 <Form.Select 
//                   value={formInfo.semester}
//                   onChange={(e) => setFormInfo({...formInfo, semester: e.target.value})}
//                 >
//                   <option value="A">סמסטר א'</option>
//                   <option value="B">סמסטר ב'</option>
//                   <option value="C">סמסטר קיץ</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>תאריך יעד להגשה</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={formInfo.dueDate || ''}
//                   onChange={(e) => setFormInfo({...formInfo, dueDate: e.target.value})}
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           <Form.Group className="mb-3">
//             <Form.Label>תיאור הטופס <span className="text-danger">*</span></Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               value={formInfo.description}
//               onChange={(e) => setFormInfo({...formInfo, description: e.target.value})}
//               placeholder="תיאור קצר של מטרת הטופס"
//               required
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>הנחיות למילוי</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               value={formInfo.instructions}
//               onChange={(e) => setFormInfo({...formInfo, instructions: e.target.value})}
//               placeholder="הנחיות למילוי הטופס (אופציונלי)"
//             />
//           </Form.Group>

//           <div className="d-flex justify-content-end">
//             <Button 
//               variant="primary" 
//               onClick={() => setCurrentStep(2)}
//               disabled={!validateStep1()}
//             >
//               המשך לבניית מבנה
//             </Button>
//           </div>
//         </Form>
//       </Card.Body>
//     </Card>
//   );

//   const renderStep2 = () => (
//     <Card>
//       <Card.Header className="d-flex justify-content-between align-items-center">
//         <h5>מבנה הטופס</h5>
//         <Button 
//           variant="success" 
//           size="sm"
//           onClick={() => setShowAddSectionModal(true)}
//         >
//           + הוסף סעיף
//         </Button>
//       </Card.Header>
//       <Card.Body>
//         {sections.length === 0 ? (
//           <Alert variant="info">
//             טרם הוספו סעיפים לטופס. לחץ על "הוסף סעיף" להתחיל.
//           </Alert>
//         ) : (
//           <Accordion defaultActiveKey="0">
//             {sections.map((section, index) => (
//               <Accordion.Item eventKey={String(index)} key={section.tempId}>
//                 <Accordion.Header>
//                   <div className="d-flex justify-content-between align-items-center w-100 me-2">
//                     <span>
//                       {section.title}
//                       {section.isRequired && <Badge bg="danger" className="ms-2">חובה</Badge>}
//                     </span>
//                     <span className="text-muted">
//                       {section.fields?.length || 0} שדות
//                     </span>
//                   </div>
//                 </Accordion.Header>
//                 <Accordion.Body>
//                   <p className="text-muted">{section.description}</p>
                  
//                   {/* רשימת השדות */}
//                   {section.fields && section.fields.length > 0 ? (
//                     <div className="mb-3">
//                       <h6>שדות בסעיף:</h6>
//                       {section.fields.map((field, fieldIndex) => (
//                         <div key={field.tempId} className="border rounded p-2 mb-2">
//                           <div className="d-flex justify-content-between align-items-center">
//                             <div>
//                               <strong>{field.fieldLabel}</strong>
//                               <Badge bg="secondary" className="ms-2">{field.fieldType}</Badge>
//                               {field.isRequired && <Badge bg="danger" className="ms-2">חובה</Badge>}
//                             </div>
//                             <Button 
//                               variant="outline-danger" 
//                               size="sm"
//                               onClick={() => handleRemoveField(section.tempId, field.tempId)}
//                             >
//                               הסר
//                             </Button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <Alert variant="warning">
//                       לא הוגדרו שדות בסעיף זה
//                     </Alert>
//                   )}

//                   <div className="d-flex gap-2">
//                     <Button 
//                       variant="outline-primary" 
//                       size="sm"
//                       onClick={() => {
//                         setSelectedSection(section);
//                         setShowAddFieldModal(true);
//                       }}
//                     >
//                       + הוסף שדה
//                     </Button>
//                     <Button 
//                       variant="outline-danger" 
//                       size="sm"
//                       onClick={() => handleRemoveSection(section.tempId)}
//                     >
//                       מחק סעיף
//                     </Button>
//                   </div>
//                 </Accordion.Body>
//               </Accordion.Item>
//             ))}
//           </Accordion>
//         )}

//         <div className="d-flex justify-content-between mt-4">
//           <Button 
//             variant="secondary" 
//             onClick={() => setCurrentStep(1)}
//           >
//             חזור
//           </Button>
//           <Button 
//             variant="primary" 
//             onClick={() => setCurrentStep(3)}
//             disabled={!validateStep2()}
//           >
//             המשך לסיכום
//           </Button>
//         </div>
//       </Card.Body>
//     </Card>
//   );

//   const renderStep3 = () => (
//     <Card>
//       <Card.Header>
//         <h5>סיכום ופרסום</h5>
//       </Card.Header>
//       <Card.Body>
//         <Alert variant="info">
//           <h6>סיכום הטופס:</h6>
//           <ul>
//             <li><strong>שם:</strong> {formInfo.formName}</li>
//             <li><strong>תיאור:</strong> {formInfo.description}</li>
//             <li><strong>שנה אקדמית:</strong> {formInfo.academicYear}</li>
//             <li><strong>סמסטר:</strong> {formInfo.semester}</li>
//             <li><strong>מספר סעיפים:</strong> {sections.length}</li>
//             <li><strong>סך הכל שדות:</strong> {sections.reduce((sum, s) => sum + (s.fields?.length || 0), 0)}</li>
//           </ul>
//         </Alert>

//         <div className="d-flex justify-content-between">
//           <Button 
//             variant="secondary" 
//             onClick={() => setCurrentStep(2)}
//           >
//             חזור
//           </Button>
//           <div className="d-flex gap-2">
//             <Button 
//               variant="outline-primary"
//               onClick={() => handleSaveForm(false)}
//               disabled={saving || publishing}
//             >
//               {saving ? 'שומר...' : 'שמור כטיוטה'}
//             </Button>
//             <Button 
//               variant="success"
//               onClick={() => handleSaveForm(true)}
//               disabled={saving || publishing}
//             >
//               {publishing ? 'מפרסם...' : 'פרסם טופס'}
//             </Button>
//           </div>
//         </div>
//       </Card.Body>
//     </Card>
//   );

//   return (
//     <Container className="py-4">
//       <h2 className="mb-4">יצירת טופס חדש</h2>
      
//       {error && <ErrorAlert message={error} onClose={() => setError('')} />}
      
//       {renderStepIndicator()}
      
//       {currentStep === 1 && renderStep1()}
//       {currentStep === 2 && renderStep2()}
//       {currentStep === 3 && renderStep3()}

//       {/* Modal להוספת סעיף */}
//       <Modal 
//         show={showAddSectionModal} 
//         onHide={() => setShowAddSectionModal(false)}
//         dir="rtl"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>הוספת סעיף חדש</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>כותרת הסעיף <span className="text-danger">*</span></Form.Label>
//               <Form.Control
//                 type="text"
//                 value={newSection.title}
//                 onChange={(e) => setNewSection({...newSection, title: e.target.value})}
//                 placeholder="הזן כותרת לסעיף"
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>תיאור הסעיף</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 value={newSection.description}
//                 onChange={(e) => setNewSection({...newSection, description: e.target.value})}
//                 placeholder="תיאור הסעיף (אופציונלי)"
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>הסבר נוסף</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 value={newSection.explanation}
//                 onChange={(e) => setNewSection({...newSection, explanation: e.target.value})}
//                 placeholder="הסבר נוסף למילוי (אופציונלי)"
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>ניקוד מקסימלי</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={newSection.maxPoints || ''}
//                 onChange={(e) => setNewSection({...newSection, maxPoints: e.target.value ? Number(e.target.value) : null})}
//                 placeholder="0"
//               />
//             </Form.Group>

//             <Form.Check 
//               type="checkbox"
//               label="סעיף חובה"
//               checked={newSection.isRequired}
//               onChange={(e) => setNewSection({...newSection, isRequired: e.target.checked})}
//             />
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowAddSectionModal(false)}>
//             ביטול
//           </Button>
//           <Button variant="primary" onClick={handleAddSection}>
//             הוסף סעיף
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Modal להוספת שדה */}
//       <Modal 
//         show={showAddFieldModal} 
//         onHide={() => setShowAddFieldModal(false)}
//         dir="rtl"
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>הוספת שדה חדש לסעיף: {selectedSection?.title}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>תווית השדה <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={newField.fieldLabel}
//                     onChange={(e) => setNewField({...newField, fieldLabel: e.target.value})}
//                     placeholder="הזן תווית לשדה"
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>סוג השדה</Form.Label>
//                   <Form.Select 
//                     value={newField.fieldType}
//                     onChange={(e) => setNewField({...newField, fieldType: e.target.value})}
//                   >
//                     {fieldTypes.map(type => (
//                       <option key={type.value} value={type.value}>{type.label}</option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Form.Group className="mb-3">
//               <Form.Label>תיאור השדה</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={newField.description}
//                 onChange={(e) => setNewField({...newField, description: e.target.value})}
//                 placeholder="תיאור קצר (אופציונלי)"
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>טקסט עזרה</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={newField.helpText}
//                 onChange={(e) => setNewField({...newField, helpText: e.target.value})}
//                 placeholder="טקסט עזרה למילוי (אופציונלי)"
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Placeholder</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={newField.placeholder}
//                 onChange={(e) => setNewField({...newField, placeholder: e.target.value})}
//                 placeholder="טקסט רמז בתוך השדה (אופציונלי)"
//               />
//             </Form.Group>

//             {/* אפשרויות נוספות לפי סוג השדה */}
//             {newField.fieldType === 'Number' && (
//               <Row>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>ערך מינימלי</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={newField.minValue || ''}
//                       onChange={(e) => setNewField({...newField, minValue: e.target.value ? Number(e.target.value) : null})}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>ערך מקסימלי</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={newField.maxValue || ''}
//                       onChange={(e) => setNewField({...newField, maxValue: e.target.value ? Number(e.target.value) : null})}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             )}

//             {(newField.fieldType === 'Text' || newField.fieldType === 'TextArea') && (
//               <Form.Group className="mb-3">
//                 <Form.Label>אורך מקסימלי</Form.Label>
//                 <Form.Control
//                   type="number"
//                   value={newField.maxLength || ''}
//                   onChange={(e) => setNewField({...newField, maxLength: e.target.value ? Number(e.target.value) : null})}
//                 />
//               </Form.Group>
//             )}

//             {/* אפשרויות לשדות בחירה */}
//             {['Select', 'Radio', 'Checkbox'].includes(newField.fieldType) && (
//               <div>
//                 <label className="form-label">אפשרויות בחירה</label>
//                 {newField.options.map((option, index) => (
//                   <div key={index} className="d-flex gap-2 mb-2">
//                     <Form.Control
//                       type="text"
//                       placeholder="תווית"
//                       value={option.optionLabel}
//                       onChange={(e) => handleUpdateFieldOption(index, 'optionLabel', e.target.value)}
//                     />
//                     <Form.Control
//                       type="text"
//                       placeholder="ערך"
//                       value={option.optionValue}
//                       onChange={(e) => handleUpdateFieldOption(index, 'optionValue', e.target.value)}
//                     />
//                     <Form.Control
//                       type="number"
//                       placeholder="ניקוד"
//                       value={option.scoreValue || ''}
//                       onChange={(e) => handleUpdateFieldOption(index, 'scoreValue', e.target.value ? Number(e.target.value) : null)}
//                       style={{ width: '100px' }}
//                     />
//                     <Button 
//                       variant="outline-danger" 
//                       size="sm"
//                       onClick={() => handleRemoveFieldOption(index)}
//                     >
//                       הסר
//                     </Button>
//                   </div>
//                 ))}
//                 <Button 
//                   variant="outline-primary" 
//                   size="sm"
//                   onClick={handleAddFieldOption}
//                 >
//                   + הוסף אפשרות
//                 </Button>
//               </div>
//             )}

//             <Form.Check 
//               type="checkbox"
//               label="שדה חובה"
//               checked={newField.isRequired}
//               onChange={(e) => setNewField({...newField, isRequired: e.target.checked})}
//               className="mt-3"
//             />
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowAddFieldModal(false)}>
//             ביטול
//           </Button>
//           <Button variant="primary" onClick={handleAddField}>
//             הוסף שדה
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };

// export default FormBuilder;