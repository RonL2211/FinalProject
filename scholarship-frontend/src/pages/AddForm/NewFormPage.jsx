// // src/pages/AddForm/NewFormPage.jsx
// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   Card,
//   Button,
//   Alert,
//   Spinner,
//   Row,
//   Col
// } from "react-bootstrap";
// import StepProgress from "./StepProgress";
// import useFormData from "./useFormData";
// import BasicFormDetails from "./BasicFormDetails";
// import FormSection from "./FormSection";

// // src/pages/NewFormPage.jsx (המשך)
// import {
//   createForm,
//   createFormSection,
//   createSectionField,
//   createFieldOption,
//   publishForm,
//   getDepartments,
//   getUsers
// } from "./formService";

// // אפשרויות סוגי השדות
// const fieldTypeOptions = [
//   { value: "text", label: "טקסט קצר" },
//   { value: "textarea", label: "טקסט ארוך" },
//   { value: "number", label: "מספר" },
//   { value: "date", label: "תאריך" },
//   { value: "select", label: "תיבת בחירה" },
//   { value: "checkbox", label: "תיבת סימון" },
//   { value: "radio", label: "כפתורי רדיו" },
//   { value: "file", label: "העלאת קובץ" },
//   { value: "url", label: "כתובת אינטרנט" },
//   { value: "email", label: "דוא״ל" },
// ];

// function NewFormPage() {
//   // מספר השלבים
//   const totalSteps = 3;
//   const [activeStep, setActiveStep] = useState(1);
  

// // פונקציונליות ניהול הנתונים מהקאסטום הוק
// const {
//   formBasicDetails,
//   mainSections,
//   departments,  
//   users,        
//   error,
//   success,
//   loading,
//   formProgress,
//   updateFormBasicDetails,
//   setFormId,
//   addMainSection,
//   updateMainSection,
//   addFieldToMainSection,
//   updateField,
//   removeField,
//   addFieldOption,
//   updateFieldOption,
//   removeFieldOption,
//   addSubSection,
//   updateSubSection,
//   removeSubSection,
//   calculateCompletion,
//   validateForm,
//   setError,
//   setSuccess,
//   setLoading,
//   setFormProgress,
//   setMainSections,
//   setDepartments,
//   setUsers
// } = useFormData();


//   // עדכון אחוז ההתקדמות בכל פעם שהנתונים משתנים
//   useEffect(() => {
//     const completion = calculateCompletion();
//     setFormProgress(completion);
//   }, [formBasicDetails, mainSections]);

//   // טעינת נתוני בסיס: מחלקות ומשתמשים
//   useEffect(() => {
//     const loadBaseData = async () => {
//       try {
//         // טעינת מחלקות
//         const departmentsData = await getDepartments();
//         console.log("נטענו מחלקות:", departmentsData);
//         setDepartments(departmentsData);
        
//         // טעינת משתמשים
//         const usersData = await getUsers();
//         console.log("נטענו משתמשים:", usersData);
//         setUsers(usersData);
//       } catch (error) {
//         console.error("שגיאה בטעינת נתוני בסיס:", error);
//         setError("אירעה שגיאה בטעינת נתוני מערכת. נסה לרענן את הדף.");
//       }
//     };
    
//     loadBaseData();
    
//     // טעינת פרטי משתמש מחובר
//     try {
//       const currentUser = JSON.parse(localStorage.getItem('currentUser'));
//       if (!currentUser || !currentUser.personId) {
//         console.warn("אין משתמש מחובר או שחסרים פרטי זיהוי");
//       }
//     } catch (error) {
//       console.error("שגיאה בטעינת פרטי משתמש:", error);
//     }
//   }, []);

//   // מעבר לשלב הבא
//   const nextStep = () => {
//     // בדיקת תקינות בהתאם לשלב
//     let validationError = '';
    
//     if (activeStep === 1) {
//       // בדיקת פרטים בסיסיים
//       validationError = validateBasicDetails();
//     }
//     else if (activeStep === 2) {
//       // בדיקת סעיפים
//       validationError = validateSections();
//     }
    
//     if (validationError) {
//       setError(validationError);
//       return;
//     }
    
//     setError('');
//     setActiveStep(prev => Math.min(prev + 1, totalSteps));
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // בדיקת פרטים בסיסיים של הטופס
//   const validateBasicDetails = () => {
//     if (!formBasicDetails.formName) return 'שם הטופס הוא שדה חובה';
//     if (!formBasicDetails.academicYear) return 'שנת לימודים היא שדה חובה';
//     if (!formBasicDetails.startDate) return 'תאריך התחלה הוא שדה חובה';
    
//     // בדיקת סמסטר אם נבחר
//     if (formBasicDetails.semester && !['א', 'ב', 'ק', 'ש'].includes(formBasicDetails.semester)) {
//       return 'יש לבחור סמסטר תקין';
//     }
    
//     // בדיקת תאריכים
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const start = new Date(formBasicDetails.startDate);
    
//     if (start < today) return 'תאריך התחלה לא יכול להיות בעבר';
    
//     if (formBasicDetails.dueDate) {
//       const due = new Date(formBasicDetails.dueDate);
//       if (due <= start) return 'תאריך סיום חייב להיות מאוחר מתאריך ההתחלה';
//     }
    
//     return '';
//   };

//   // בדיקת תקינות הסעיפים
//   const validateSections = () => {
//     if (mainSections.length === 0) {
//       return 'יש להוסיף לפחות סעיף ראשי אחד';
//     }
    
//     // בדיקת כל סעיף
//     for (let i = 0; i < mainSections.length; i++) {
//       const section = mainSections[i];
//       if (!section.title) {
//         return `כותרת חסרה בסעיף ${i + 1}`;
//       }
//       if (!section.maxPoints) {
//         return `ניקוד מקסימלי חסר בסעיף ${i + 1}`;
//       }
      
//       // בדיקת שדות
//       if (!section.fields || section.fields.length === 0) {
//         return `יש להוסיף לפחות שדה אחד לסעיף ${i + 1}`;
//       }
      
//       // בדיקת כל שדה
//       for (let j = 0; j < section.fields.length; j++) {
//         const field = section.fields[j];
//         if (!field.fieldLabel) {
//           return `תווית שדה חסרה בסעיף ${i + 1}, שדה ${j + 1}`;
//         }
//         if (!field.fieldType) {
//           return `סוג שדה חסר בסעיף ${i + 1}, שדה ${j + 1}`;
//         }
        
//         // בדיקת אפשרויות לשדות בחירה
//         if (['select', 'radio', 'checkbox'].includes(field.fieldType) && 
//             (!field.options || field.options.length === 0)) {
//           return `יש להוסיף לפחות אפשרות אחת לשדה '${field.fieldLabel}' בסעיף ${i + 1}`;
//         }
//       }
//     }
    
//     return '';
//   };

//   // חזרה לשלב הקודם
//   const prevStep = () => {
//     setActiveStep(prev => Math.max(prev - 1, 1));
//     setError('');
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // שמירת הטופס
//   const handleSave = async (publish = false) => {
//     setError('');
//     setSuccess('');
//     setLoading(true);
    
//     try {
//       // וידוא שיש משתמש מחובר
//       const currentUser = JSON.parse(localStorage.getItem('currentUser'));
//       const personId = currentUser?.personId || '';
      
//       if (!personId) {
//         throw new Error("לא נמצאו פרטי משתמש מחובר. נא להתחבר מחדש למערכת.");
//       }
      
//       // 1. שמירת הטופס הבסיסי
//       const formData = {
//         formName: formBasicDetails.formName,
//         academicYear: formBasicDetails.academicYear,
//         semester: formBasicDetails.semester,
//         description: formBasicDetails.description || '',
//         instructions: formBasicDetails.instructions || '',
//         startDate: formBasicDetails.startDate,
//         dueDate: formBasicDetails.dueDate || null,
//         createdBy: personId,
//         lastModifiedBy: personId,
//         isActive: formBasicDetails.isActive !== false,
//         isPublished: publish
//       };
      
//       console.log("נתוני טופס לשמירה:", formData);
//       const formResult = await createForm(formData);
//       const formId = formResult.formID; // מזהה הטופס החדש
      
//       console.log("טופס נוצר בהצלחה עם מזהה:", formId);
//       setFormId(formId);

//       // 2. יצירת הסעיפים הראשיים ותתי-הסעיפים
//       for (let i = 0; i < mainSections.length; i++) {
//         const section = mainSections[i];

        
//         // יצירת סעיף ראשי
//         const sectionData = {
//           formId: formId,
//           title: section.title,
//           description: section.description || "",
//           explanation: section.explanation || "",
//           maxPoints: section.maxPoints,
//           level: 0, // רמה 0 = סעיף ראשי
//           orderIndex: i + 1,
//           isRequired: section.isRequired || false,
//           isVisible: section.isVisible !== false,
//           maxOccurrences: section.maxOccurrences || 1,
//           responsibleEntity: section.responsibleEntity || null,
//           responsiblePerson: section.responsiblePerson || null,
//           parentSectionID: null // אין הורה לסעיף ראשי
//         };
        
//         console.log("שמירת סעיף:", sectionData);
//         const sectionResult = await createFormSection(sectionData);
//         const sectionId = sectionResult.sectionID; // מזהה הסעיף החדש
        
//         console.log("סעיף נוצר בהצלחה עם מזהה:", sectionId);

//         // 3. יצירת שדות לסעיף הראשי
//         if (section.fields && section.fields.length > 0) {
//           for (let j = 0; j < section.fields.length; j++) {
//             const field = section.fields[j];
            
//             const fieldData = {
//               sectionID: sectionId,
//               fieldName: field.fieldName || `field_${Date.now()}_${j}`,
//               fieldLabel: field.fieldLabel,
//               fieldType: field.fieldType,
//               isRequired: field.isRequired || false,
//               defaultValue: field.defaultValue || "",
//               placeholder: field.placeholder || "",
//               helpText: field.helpText || "",
//               orderIndex: j + 1,
//               isVisible: field.isVisible !== false,
//               maxLength: field.maxLength || null,
//               minValue: field.minValue || null,
//               maxValue: field.maxValue || null,
//               scoreCalculationRule: field.scoreCalculationRule || null,
//               isActive: field.isActive !== false
//             };
            
//             console.log("שמירת שדה:", fieldData);
//             const fieldResult = await createSectionField(fieldData);
//             const fieldId = fieldResult.fieldID; // מזהה השדה החדש
//             console.log("שדה נוצר בהצלחה עם מזהה:", fieldId);
            
//             // 4. יצירת אפשרויות לשדה (אם נדרש)
//             if (['select', 'radio', 'checkbox'].includes(field.fieldType) && field.options && field.options.length > 0) {
//               for (let k = 0; k < field.options.length; k++) {
//                 const option = field.options[k];
                
//                 const optionData = {
//                   fieldID: fieldId,
//                   optionValue: option.optionValue || `option_${k+1}`,
//                   optionLabel: option.optionLabel,
//                   scoreValue: option.scoreValue || 0,
//                   orderIndex: k + 1,
//                   isDefault: option.isDefault || false
//                 };
                
//                 console.log("שמירת אפשרות בחירה:", optionData);
//                 await createFieldOption(optionData);
//               }
//             }
//           }
//         }
        
//         // 5. יצירת תתי-סעיפים
//         if (section.subSections && section.subSections.length > 0) {
//           for (let j = 0; j < section.subSections.length; j++) {
//             const subSection = section.subSections[j];
            
//             const subSectionData = {
//               formId: formId,
//               title: subSection.title,
//               description: subSection.description || "",
//               explanation: subSection.explanation || "",
//               maxPoints: subSection.maxPoints,
//               level: 1, // רמה 1 = תת-סעיף
//               orderIndex: j + 1,
//               isRequired: subSection.isRequired || false,
//               isVisible: subSection.isVisible !== false,
//               maxOccurrences: subSection.maxOccurrences || 1,
//               responsibleEntity: subSection.responsibleEntity || section.responsibleEntity,
//               responsiblePerson: subSection.responsiblePerson || section.responsiblePerson,
//               parentSectionID: sectionId // שיוך לסעיף ההורה
//             };
            
//             const subSectionResult = await createFormSection(subSectionData);
//             const subSectionId = subSectionResult.sectionID; // מזהה תת-הסעיף החדש
            
//             // 6. יצירת שדות לתת-סעיף
//             if (subSection.fields && subSection.fields.length > 0) {
//               for (let k = 0; k < subSection.fields.length; k++) {
//                 const field = subSection.fields[k];
                
//                 const fieldData = {
//                   sectionID: subSectionId,
//                   fieldName: field.fieldName || `subfield_${Date.now()}_${k}`,
//                   fieldLabel: field.fieldLabel,
//                   fieldType: field.fieldType,
//                   isRequired: field.isRequired || false,
//                   defaultValue: field.defaultValue || "",
//                   placeholder: field.placeholder || "",
//                   helpText: field.helpText || "",
//                   orderIndex: k + 1,
//                   isVisible: field.isVisible !== false,
//                   maxLength: field.maxLength || null,
//                   minValue: field.minValue || null,
//                   maxValue: field.maxValue || null,
//                   scoreCalculationRule: field.scoreCalculationRule || null,
//                   isActive: field.isActive !== false
//                 };
                
//                 const fieldResult = await createSectionField(fieldData);
//                 const fieldId = fieldResult.fieldID; // מזהה השדה החדש
                
//                 // 7. יצירת אפשרויות לשדה בתת-סעיף (אם נדרש)
//                 if (['select', 'radio', 'checkbox'].includes(field.fieldType) && field.options && field.options.length > 0) {
//                   for (let l = 0; l < field.options.length; l++) {
//                     const option = field.options[l];
                    
//                     const optionData = {
//                       fieldID: fieldId,
//                       optionValue: option.optionValue || `option_${l+1}`,
//                       optionLabel: option.optionLabel,
//                       scoreValue: option.scoreValue || 0,
//                       orderIndex: l + 1,
//                       isDefault: option.isDefault || false
//                     };
                    
//                     await createFieldOption(optionData);
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
      
//       // 8. פרסום הטופס אם נדרש
//       if (publish) {
//         console.log("מפרסם טופס עם מזהה:", formId);
//         await publishForm(formId);
//       }
      
//       setSuccess(publish 
//         ? 'הטופס פורסם בהצלחה! המרצים יכולים כעת למלא אותו.' 
//         : 'הטופס נשמר כטיוטה בהצלחה!'
//       );
      
//       // ניקוי הטופס אחרי שמירה מוצלחת
//       resetForm();
      
//     } catch (err) {
//       console.error("שגיאה בשמירת הטופס:", err);
//       setError(`שגיאה בשמירת הטופס: ${err.message || 'אירעה שגיאה לא ידועה'}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ניקוי הטופס ואיפוס השדות
//   const resetForm = () => {
//     // איפוס הטופס לאחר שמירה מוצלחת
//     // אם רוצים לחזור לעמוד ריק, יש לאפס את כל השדות
//     if (window.confirm('האם אתה רוצה ליצור טופס חדש?')) {
//       // איפוס פרטי טופס בסיסיים
//       updateFormBasicDetails("formName", "");
//       updateFormBasicDetails("description", "");
//       updateFormBasicDetails("instructions", "");
//       updateFormBasicDetails("dueDate", "");
      
//       // איפוס סעיפים
//       setMainSections([]);
      
//       // חזרה לשלב הראשון
//       setActiveStep(1);
//     }
//   };

//   // רנדור תוכן השלב הנוכחי
//   const renderStepContent = () => {
//     switch (activeStep) {
//       case 1: // פרטים בסיסיים
//         return (
//           <BasicFormDetails
//             formData={formBasicDetails}
//             updateFormData={updateFormBasicDetails}
//           />
//         );
        
//       case 2: // סעיפים וקריטריונים
//         return (
//           <div className="step-content">
//             <div className="d-flex justify-content-between align-items-center mb-4">
//               <h5 className="mb-0">
//                 <i className="bi bi-list-nested me-2"></i>
//                 הגדרת סעיפים וקריטריונים
//               </h5>
//               <Button 
//                 variant="primary" 
//                 onClick={addMainSection}
//                 className="rounded-pill px-3"
//               >
//                 <i className="bi bi-plus-lg me-1"></i> הוסף סעיף ראשי
//               </Button>
//             </div>
            
//             {mainSections.length === 0 ? (
//               <div className="text-center py-5 my-4 bg-light rounded">
//                 <div className="mb-3">
//                   <i className="bi bi-card-text text-muted" style={{ fontSize: '3rem' }}></i>
//                 </div>
//                 <h5 className="text-muted mb-3">לא הוגדרו סעיפים עדיין</h5>
//                 <p className="text-muted mb-4">התחל ביצירת סעיף ראשי שיכיל את הקריטריונים והשדות הדרושים</p>
//                 <Button 
//                   variant="primary" 
//                   onClick={addMainSection}
//                   className="rounded-pill px-4"
//                 >
//                   <i className="bi bi-plus-lg me-1"></i> הוסף סעיף ראשי
//                 </Button>
//               </div>
//             ) : (
//               <div>
//                 {mainSections.map((section, index) => (
//                   <FormSection
//                     key={index}
//                     section={section}
//                     sectionIndex={index}
//                     updateSection={updateMainSection}
//                     addField={addFieldToMainSection}
//                     updateField={updateField}
//                     removeField={removeField}
//                     addSubSection={addSubSection}
//                     updateSubSection={updateSubSection}
//                     removeSubSection={removeSubSection}
//                     addFieldOption={addFieldOption}
//                     updateFieldOption={updateFieldOption}
//                     removeFieldOption={removeFieldOption}
//                     fieldTypeOptions={fieldTypeOptions}
//                     removeSection={() => {
//                       const updated = [...mainSections];
//                       updated.splice(index, 1);
//                       setMainSections(updated);
//                     }}
//                     departments={departments || []}
//                     users={users || []}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         );
        
//       case 3: // סיכום ושמירה
//         return (
//           <div className="step-content">
//             <h5 className="mb-4">
//               <i className="bi bi-check2-circle me-2"></i>
//               סיכום ושמירת הטופס
//             </h5>
            
//             <Card className="mb-4 shadow-sm">
//               <Card.Header className="bg-light">
//                 <h6 className="mb-0">פרטי הטופס</h6>
//               </Card.Header>
//               <Card.Body>
//                 <Row>
//                   <Col md={6}>
//                     <p><strong>שם הטופס:</strong> {formBasicDetails.formName}</p>
//                     <p><strong>שנת לימודים:</strong> {formBasicDetails.academicYear}</p>
//                     <p><strong>סמסטר:</strong> {formBasicDetails.semester ? `סמסטר ${formBasicDetails.semester}` : 'לא צוין'}</p>
//                   </Col>
//                   <Col md={6}>
//                     <p><strong>תאריך פתיחה:</strong> {new Date(formBasicDetails.startDate).toLocaleDateString('he-IL')}</p>
//                     <p><strong>תאריך סיום:</strong> {formBasicDetails.dueDate 
//                       ? new Date(formBasicDetails.dueDate).toLocaleDateString('he-IL') 
//                       : 'לא הוגדר תאריך סיום'}</p>
//                     <p><strong>סטטוס:</strong> {formBasicDetails.isActive !== false ? 'פעיל' : 'לא פעיל'}</p>
//                   </Col>
//                 </Row>
//                 {formBasicDetails.description && (
//                   <>
//                     <hr />
//                     <h6>תיאור הטופס:</h6>
//                     <p>{formBasicDetails.description}</p>
//                   </>
//                 )}
//                 {formBasicDetails.instructions && (
//                   <>
//                     <hr />
//                     <h6>הנחיות למילוי:</h6>
//                     <p>{formBasicDetails.instructions}</p>
//                   </>
//                 )}
//               </Card.Body>
//             </Card>
            
//             <Card className="mb-4 shadow-sm">
//               <Card.Header className="bg-light">
//                 <h6 className="mb-0">
//                   סעיפים וקריטריונים
//                   {mainSections.length > 0 && 
//                     <span className="text-muted ms-2">({mainSections.length} סעיפים)</span>
//                   }
//                 </h6>
//               </Card.Header>
//               <Card.Body>
//                 {mainSections.length === 0 ? (
//                   <p className="text-muted text-center py-3">לא הוגדרו סעיפים בטופס זה.</p>
//                 ) : (
//                   <div className="sections-summary">
//                     {mainSections.map((section, index) => (
//                       <div key={index} className="section-summary mb-3 pb-3 border-bottom">
//                         <h6>
//                           <span className="badge bg-primary me-2 rounded-circle">{index + 1}</span>
//                           {section.title} 
//                           <span className="text-muted ms-2">({section.maxPoints} נקודות)</span>
//                           {section.isRequired && <span className="badge bg-danger ms-2">חובה</span>}
//                         </h6>
//                         {section.description && <p className="text-muted small mb-1">{section.description}</p>}
                        
//                         <div className="ms-4 mb-2">
//                           <p className="mb-1"><strong>
//                             <i className="bi bi-input-cursor me-1"></i>
//                             שדות ({section.fields.length}):
//                           </strong></p>
//                           <ul className="small">
//                             {section.fields.map((field, fieldIndex) => (
//                               <li key={fieldIndex}>
//                                 <strong>{field.fieldLabel}</strong> 
//                                 <span className="text-muted ms-1">({getFieldTypeLabel(field.fieldType)})</span>
//                                 {field.isRequired && <span className="text-danger ms-1">*</span>}
//                                 {['select', 'radio', 'checkbox'].includes(field.fieldType) && field.options && (
//                                   <span className="ms-1 text-muted">
//                                     ({field.options.length} אפשרויות)
//                                   </span>
//                                 )}
//                               </li>
//                             ))}
//                           </ul>
//                         </div>
                        
//                         {section.subSections && section.subSections.length > 0 && (
//                           <div className="ms-4">
//                             <p className="mb-1"><strong>
//                               <i className="bi bi-diagram-3 me-1"></i>
//                               תתי-סעיפים ({section.subSections.length}):
//                             </strong></p>
//                             <ul className="small">
//                               {section.subSections.map((subSection, subIndex) => (
//                                 <li key={subIndex}>
//                                   <strong>{subSection.title}</strong> 
//                                   <span className="text-muted ms-1">({subSection.maxPoints} נקודות)</span>
//                                   {subSection.isRequired && <span className="text-danger ms-1">*</span>}
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </Card.Body>
//             </Card>
            
//             <Alert variant="info">
//               <i className="bi bi-info-circle me-2"></i>
//               <strong>שים לב:</strong> בעת פרסום הטופס, הוא יהיה זמין למילוי על ידי המרצים. 
//               <br />
//               לפני פרסום, אנא וודא שכל הפרטים והקריטריונים נכונים ומדויקים.
//             </Alert>
//           </div>
//         );
        
//       default:
//         return null;
//     }
//   };

//   // פונקציית עזר להצגת שם סוג השדה
//   const getFieldTypeLabel = (fieldType) => {
//     const option = fieldTypeOptions.find(opt => opt.value === fieldType);
//     return option ? option.label : fieldType;
//   };

//   return (
//     <Container
//       fluid
//       className="d-flex align-items-center justify-content-center"
//       dir="rtl"
//       style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "20px" }}
//     >
//       <div className="w-100" style={{ maxWidth: "1200px" }}>
//         <Card className="p-4 shadow border-0 rounded-4 mb-4">
//           <Card.Header className="bg-white border-0 pb-0">
//             <h4 className="mb-3 text-center">יצירת טופס חדש</h4>
//             <StepProgress 
//               currentStep={activeStep} 
//               totalSteps={totalSteps} 
//               completionPercentage={formProgress}
//             />
//           </Card.Header>
          
//           {error && 
//             <Alert variant="danger" className="mx-3">
//               <i className="bi bi-exclamation-triangle-fill me-2"></i>
//               {error}
//             </Alert>
//           }
          
//           {success && 
//             <Alert variant="success" className="mx-3">
//               <i className="bi bi-check-circle-fill me-2"></i>
//               {success}
//             </Alert>
//           }
          
//           <Card.Body>
//             {loading ? (
//               <div className="text-center py-5">
//                 <Spinner animation="border" variant="primary" className="mb-3" />
//                 <h5>מעבד את הנתונים...</h5>
//                 <p className="text-muted">אנא המתן בזמן שאנו שומרים את הטופס</p>
//               </div>
//             ) : (
//               <div className="form-container">
//                 {renderStepContent()}
//               </div>
//             )}
//           </Card.Body>
          
//           <Card.Footer className="bg-white border-0 pt-3">
//             <div className="d-flex justify-content-between">
//               {activeStep > 1 ? (
//                 <Button 
//                   variant="outline-secondary" 
//                   onClick={prevStep}
//                   className="rounded-pill px-4"
//                   disabled={loading}
//                 >
//                   <i className="bi bi-arrow-right me-1"></i> חזור
//                 </Button>
//               ) : (
//                 <div></div>
//               )}
              
//               {activeStep < totalSteps ? (
//                 <Button 
//                 variant="primary" 
//                 onClick={nextStep}
//                 className="rounded-pill px-4"
//                 disabled={loading}
//               >
//                 המשך <i className="bi bi-arrow-left ms-1"></i>
//               </Button>
//             ) : (
//               <div className="d-flex gap-2">
//                 <Button 
//                   variant="outline-primary" 
//                   onClick={() => handleSave(false)}
//                   className="rounded-pill px-4"
//                   disabled={loading}
//                 >
//                   <i className="bi bi-save me-1"></i> שמור כטיוטה
//                 </Button>
//                 <Button 
//                   variant="success" 
//                   onClick={() => handleSave(true)}
//                   className="rounded-pill px-4"
//                   disabled={loading}
//                 >
//                   <i className="bi bi-send me-1"></i> פרסם טופס
//                 </Button>
//               </div>
//             )}
//           </div>
//         </Card.Footer>
//       </Card>
      
//       {success && (
//         <Card className="shadow-sm border-0 rounded-4 mb-4 text-center p-3">
//           <Card.Body>
//             <p className="mb-3">רוצה ליצור טופס חדש?</p>
//             <Button 
//               variant="outline-primary" 
//               onClick={resetForm}
//               className="rounded-pill px-4"
//             >
//               <i className="bi bi-plus-lg me-1"></i> התחל טופס חדש
//             </Button>
//           </Card.Body>
//         </Card>
//       )}
//     </div>
//   </Container>
// );
// }

// export default NewFormPage;