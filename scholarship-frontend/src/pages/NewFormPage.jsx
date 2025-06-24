// // src/pages/NewFormPage.jsx
// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   Card,
//   Form,
//   Row,
//   Col,
//   Button,
//   Accordion,
//   Alert,
//   Table,
// } from "react-bootstrap";

// // אפשרויות לסוגי השדות - מותאם לערכים בטבלת SectionFields
// const fieldTypeOptions = [
//   { value: "text", label: "טקסט קצר" },
//   { value: "textarea", label: "טקסט ארוך" },
//   { value: "number", label: "מספר" },
//   { value: "date", label: "תאריך" },
//   { value: "email", label: "דואר אלקטרוני" },
//   { value: "select", label: "תפריט בחירה" },
//   { value: "checkbox", label: "תיבת סימון" },
//   { value: "radio", label: "כפתורי רדיו" },
//   { value: "file", label: "קובץ" },
//   { value: "link", label: "לינק" },
//   { value: "image", label: "תמונה" },
// ];

// function NewFormPage() {
//   // שדות הטופס הבסיסיים
//   const [formName, setFormName] = useState("");
//   const [academicYear, setAcademicYear] = useState("");
//   const [semester, setSemester] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [dueDate, setDueDate] = useState("");
//   const [description, setDescription] = useState("");
//   const [instructions, setInstructions] = useState("");
  
//   // מידע על משתמשים ומחלקות - לבחירת אחראים
//   const [faculties, setFaculties] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [users, setUsers] = useState([]);
  
//   // סעיפים
//   const [sections, setSections] = useState([]);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");


//   const [currentUser, setCurrentUser] = useState(null);
//   useEffect(() => {
//     // טעינת המשתמש הנוכחי מה-localStorage
//     try {
//        setCurrentUser (JSON.parse(localStorage.getItem('currentUser'))) 
//       // if (!currentUser || !currentUser.personId) {
//       //   // אם אין משתמש מחובר - להעביר לדף התחברות
//       //   // history.push('/login');
//       //   setError("יש להתחבר למערכת");
//       // }
//     } catch (error) {
//       setError("שגיאה בטעינת פרטי משתמש");
//     }
//   }, []);

//   // טעינת נתוני בסיס
//   useEffect(() => {
//     // טעינת רשימת פקולטות, מחלקות ומשתמשים מהשרת
//     const loadBaseData = async () => {
//       try {
//         // בפועל היה צריך לבצע קריאות API אמיתיות
//         const facultiesResponse = await fetch("https://localhost:7230/api/Department/faculties");
//         const facultiesData = await facultiesResponse.json();
//         setFaculties(facultiesData);
        
//         const departmentsResponse = await fetch("https://localhost:7230/api/Department");
//         const departmentsData = await departmentsResponse.json();
//         setDepartments(departmentsData);
        
//         const usersResponse = await fetch("https://localhost:7230/api/Person");
//         const usersData = await usersResponse.json();
//         setUsers(usersData);
//       } catch (err) {
//         setError("שגיאה בטעינת נתונים: " + err.message);
//       }
//     };
    
//     loadBaseData(); // מבוטל כעת - יופעל בפועל
    
   

//     // // רק לצורך הדגמה - נתונים לדוגמה
//     // setFaculties([
//     //   { facultyID: 1, facultyName: "פקולטה להנדסה" },
//     //   { facultyID: 2, facultyName: "פקולטה למדעי המחשב" },
//     // ]);
    
//     // setDepartments([
//     //   { departmentID: 1, departmentName: "הנדסת תוכנה", facultyId: 1 },
//     //   { departmentID: 2, departmentName: "הנדסת חשמל", facultyId: 1 },
//     //   { departmentID: 3, departmentName: "מדעי המחשב", facultyId: 2 },
//     // ]);
    
//     // setUsers([
//     //   { personId: "123456789", firstName: "ישראל", lastName: "ישראלי", position: "חבר ועדה" },
//     //   { personId: "987654321", firstName: "שרה", lastName: "כהן", position: "ראש מחלקה" },
//     // ]);
    
//     // קביעת שנת לימודים נוכחית
//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     const monthNow = currentDate.getMonth() + 1; // JavaScript months start from 0
    
//     // קביעת שנת הלימודים - אם אנחנו לאחר אוקטובר, זו השנה הבאה
//     const academicYearStart = monthNow >= 10 ? currentYear : currentYear - 1;
//     const academicYearEnd = academicYearStart + 1;
//     setAcademicYear(`${academicYearStart}-${academicYearEnd}`);
    
//     // קביעת סמסטר ברירת מחדל
//     setSemester(monthNow >= 3 && monthNow <= 7 ? "ב" : "א");
//   }, []);

//   // פונקציה להוספת סעיף חדש
//   const addSection = () => {
//     setSections([
//       ...sections,
//       {
//         title: "",
//         description: "",
//         explanation: "",
//         maxPoints: "",
//         level: 0, // סעיף ראשי
//         orderIndex: sections.length + 1,
//         isRequired: false,
//         isVisible: true,
//         maxOccurrences: 1,
//         responsibleEntity: null, // מחלקה אחראית
//         responsiblePerson: null, // אדם אחראי
//         fields: [], // שדות הקלט בסעיף
//         subSections: [], // תתי-סעיפים
//         permissions: [], // הרשאות צפייה/עריכה/הערכה
//       },
//     ]);
//   };

//   // עדכון סעיף
//   const updateSection = (index, field, value) => {
//     const newSections = [...sections];
//     newSections[index][field] = value;
//     setSections(newSections);
//   };

//   // הוספת שדה לסעיף
//   const addField = (sectionIndex) => {
//     const newSections = [...sections];
//     newSections[sectionIndex].fields.push({
//       fieldName: "",
//       fieldLabel: "",
//       fieldType: "",
//       isRequired: false,
//       defaultValue: "",
//       placeholder: "",
//       helpText: "",
//       orderIndex: newSections[sectionIndex].fields.length + 1,
//       isVisible: true,
//       maxLength: null,
//       minValue: null,
//       maxValue: null,
//       scoreCalculationRule: null,
//       isActive: true,
//       options: [], // אפשרויות לשדות מסוג בחירה (select, radio, checkbox)
//     });
//     setSections(newSections);
//   };

//   // עדכון שדה בסעיף
//   const updateField = (sectionIndex, fieldIndex, field, value) => {
//     const newSections = [...sections];
//     newSections[sectionIndex].fields[fieldIndex][field] = value;
    
//     // אם סוג השדה השתנה, עדכון אפשרויות לפי הצורך
//     if (field === "fieldType") {
//       const needsOptions = ["select", "radio", "checkbox"].includes(value);
//       if (needsOptions && newSections[sectionIndex].fields[fieldIndex].options.length === 0) {
//         // הוספת אפשרות ברירת מחדל אם זה שדה עם אפשרויות בחירה
//         newSections[sectionIndex].fields[fieldIndex].options = [
//           { optionValue: "", optionLabel: "", scoreValue: 0, orderIndex: 1, isDefault: true }
//         ];
//       }
//     }
    
//     setSections(newSections);
//   };

//   // הוספת אפשרות בחירה לשדה
//   const addFieldOption = (sectionIndex, fieldIndex) => {
//     const newSections = [...sections];
//     const newOption = {
//       optionValue: "",
//       optionLabel: "",
//       scoreValue: 0,
//       orderIndex: newSections[sectionIndex].fields[fieldIndex].options.length + 1,
//       isDefault: false
//     };
//     newSections[sectionIndex].fields[fieldIndex].options.push(newOption);
//     setSections(newSections);
//   };

//   // עדכון אפשרות בחירה בשדה
//   const updateFieldOption = (sectionIndex, fieldIndex, optionIndex, field, value) => {
//     const newSections = [...sections];
//     newSections[sectionIndex].fields[fieldIndex].options[optionIndex][field] = value;
    
//     // אם מדובר בשינוי ברירת מחדל, עדכן את שאר האפשרויות
//     if (field === "isDefault" && value === true) {
//       // אפס את כל האפשרויות האחרות
//       newSections[sectionIndex].fields[fieldIndex].options.forEach((option, idx) => {
//         if (idx !== optionIndex) {
//           option.isDefault = false;
//         }
//       });
//     }
    
//     setSections(newSections);
//   };

//   // הסרת שדה מסעיף
//   const removeField = (sectionIndex, fieldIndex) => {
//     const newSections = [...sections];
//     newSections[sectionIndex].fields.splice(fieldIndex, 1);
//     // עדכון סדר השדות
//     newSections[sectionIndex].fields.forEach((field, idx) => {
//       field.orderIndex = idx + 1;
//     });
//     setSections(newSections);
//   };

//   // הסרת סעיף
//   const removeSection = (index) => {
//     setSections(sections.filter((_, i) => i !== index));
//   };

//   // תתי‑סעיפים
//   const addSubSection = (sectionIndex) => {
//     const newSections = [...sections];
//     newSections[sectionIndex].subSections.push({
//       title: "",
//       description: "",
//       explanation: "",
//       maxPoints: "",
//       level: 1, // תת-סעיף
//       orderIndex: newSections[sectionIndex].subSections.length + 1,
//       isRequired: false,
//       isVisible: true,
//       maxOccurrences: 1,
//       responsibleEntity: null,
//       responsiblePerson: null,
//       parentSectionId: null, // יוגדר בעת השמירה
//       fields: [],
//       subSections: [], // תת-תת-סעיפים
//       permissions: [],
//     });
//     setSections(newSections);
//   };

//   // עדכון תת-סעיף
//   const updateSubSection = (sectionIndex, subIndex, field, value) => {
//     const newSections = [...sections];
//     newSections[sectionIndex].subSections[subIndex][field] = value;
//     setSections(newSections);
//   };

//   // הוספת שדה לתת-סעיף
//   const addSubSectionField = (sectionIndex, subIndex) => {
//     const newSections = [...sections];
//     newSections[sectionIndex].subSections[subIndex].fields.push({
//       fieldName: "",
//       fieldLabel: "",
//       fieldType: "",
//       isRequired: false,
//       defaultValue: "",
//       placeholder: "",
//       helpText: "",
//       orderIndex: newSections[sectionIndex].subSections[subIndex].fields.length + 1,
//       isVisible: true,
//       maxLength: null,
//       minValue: null,
//       maxValue: null,
//       scoreCalculationRule: null,
//       isActive: true,
//       options: [],
//     });
//     setSections(newSections);
//   };

//   // עדכון שדה בתת-סעיף
//   const updateSubSectionField = (sectionIndex, subIndex, fieldIndex, field, value) => {
//     const newSections = [...sections];
//     newSections[sectionIndex].subSections[subIndex].fields[fieldIndex][field] = value;
    
//     // עדכון אפשרויות בשדות בחירה, כמו בפונקציה updateField
//     if (field === "fieldType") {
//       const needsOptions = ["select", "radio", "checkbox"].includes(value);
//       if (needsOptions && newSections[sectionIndex].subSections[subIndex].fields[fieldIndex].options.length === 0) {
//         newSections[sectionIndex].subSections[subIndex].fields[fieldIndex].options = [
//           { optionValue: "", optionLabel: "", scoreValue: 0, orderIndex: 1, isDefault: true }
//         ];
//       }
//     }
    
//     setSections(newSections);
//   };

//   // הסרת תת-סעיף
//   const removeSubSection = (sectionIndex, subIndex) => {
//     const newSections = [...sections];
//     newSections[sectionIndex].subSections.splice(subIndex, 1);
//     // עדכון סדר תתי-הסעיפים
//     newSections[sectionIndex].subSections.forEach((subSection, idx) => {
//       subSection.orderIndex = idx + 1;
//     });
//     setSections(newSections);
//   };

//   // הוספת הרשאה לסעיף
//   const addSectionPermission = (sectionIndex) => {
//     const newSections = [...sections];
//     newSections[sectionIndex].permissions.push({
//       responsiblePerson: "",
//       canView: true,
//       canEdit: false,
//       canEvaluate: false,
//     });
//     setSections(newSections);
//   };

//   // עדכון הרשאה לסעיף
//   const updateSectionPermission = (sectionIndex, permIndex, field, value) => {
//     const newSections = [...sections];
//     newSections[sectionIndex].permissions[permIndex][field] = value;
//     setSections(newSections);
//   };

//   // הסרת הרשאה מסעיף
//   const removeSectionPermission = (sectionIndex, permIndex) => {
//     const newSections = [...sections];
//     newSections[sectionIndex].permissions.splice(permIndex, 1);
//     setSections(newSections);
//   };

//   // בדיקות תקינות לשדות הטופס הראשיים
//   const validateMainForm = () => {
//     if (!formName) return "שם הטופס הוא שדה חובה";
//     if (!academicYear) return "שנת לימודים היא שדה חובה";
//     if (!startDate) return "תאריך פתיחה הוא שדה חובה";

//     // בדיקת תאריכים
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const start = new Date(startDate);
//     if (start < today) return "תאריך פתיחה צריך להיות מהיום והלאה";
//     if (dueDate) {
//       const due = new Date(dueDate);
//       if (due < start) return "תאריך סיום לא יכול להיות לפני תאריך הפתיחה";
//     }
//     return "";
//   };

//   // בדיקות תקינות לסעיפים
//   const validateSections = () => {
//     if (sections.length === 0) return "יש להוסיף לפחות סעיף אחד לטופס";
    
//     for (let i = 0; i < sections.length; i++) {
//       const section = sections[i];
      
//       // בדיקת סעיף ראשי
//       if (!section.title) return `כותרת הסעיף (סעיף ${i + 1}) היא שדה חובה`;
//       if (!section.maxPoints && section.maxPoints !== 0) return `ניקוד הסעיף (סעיף ${i + 1}) הוא שדה חובה`;
      
//       // בדיקת שדות של הסעיף
//       if (section.fields.length === 0) return `יש להוסיף לפחות שדה אחד לסעיף ${i + 1}`;
      
//       for (let j = 0; j < section.fields.length; j++) {
//         const field = section.fields[j];
//         if (!field.fieldName) return `שם השדה (סעיף ${i + 1}, שדה ${j + 1}) הוא שדה חובה`;
//         if (!field.fieldLabel) return `תווית השדה (סעיף ${i + 1}, שדה ${j + 1}) היא שדה חובה`;
//         if (!field.fieldType) return `סוג השדה (סעיף ${i + 1}, שדה ${j + 1}) הוא שדה חובה`;
        
//         // בדיקת אפשרויות לשדות בחירה
//         const needsOptions = ["select", "radio", "checkbox"].includes(field.fieldType);
//         if (needsOptions) {
//           if (field.options.length === 0) return `יש להוסיף לפחות אפשרות אחת לשדה (סעיף ${i + 1}, שדה ${j + 1})`;
          
//           // בדיקת אפשרויות
//           for (let k = 0; k < field.options.length; k++) {
//             const option = field.options[k];
//             if (!option.optionLabel) return `תווית האפשרות (סעיף ${i + 1}, שדה ${j + 1}, אפשרות ${k + 1}) היא שדה חובה`;
//             if (!option.optionValue) return `ערך האפשרות (סעיף ${i + 1}, שדה ${j + 1}, אפשרות ${k + 1}) הוא שדה חובה`;
//           }
//         }
//       }
      
//       // בדיקת תתי-סעיפים
//       for (let j = 0; j < section.subSections.length; j++) {
//         const subSection = section.subSections[j];
//         if (!subSection.title) return `כותרת תת-הסעיף (סעיף ${i + 1}, תת-סעיף ${j + 1}) היא שדה חובה`;
//         if (!subSection.maxPoints && subSection.maxPoints !== 0) return `ניקוד תת-הסעיף (סעיף ${i + 1}, תת-סעיף ${j + 1}) הוא שדה חובה`;
        
//         // בדיקת שדות של תת-הסעיף
//         if (subSection.fields.length === 0) return `יש להוסיף לפחות שדה אחד לתת-סעיף (סעיף ${i + 1}, תת-סעיף ${j + 1})`;
        
//         for (let k = 0; k < subSection.fields.length; k++) {
//           const field = subSection.fields[k];
//           if (!field.fieldName) return `שם השדה (סעיף ${i + 1}, תת-סעיף ${j + 1}, שדה ${k + 1}) הוא שדה חובה`;
//           if (!field.fieldLabel) return `תווית השדה (סעיף ${i + 1}, תת-סעיף ${j + 1}, שדה ${k + 1}) היא שדה חובה`;
//           if (!field.fieldType) return `סוג השדה (סעיף ${i + 1}, תת-סעיף ${j + 1}, שדה ${k + 1}) הוא שדה חובה`;
          
//           // בדיקת אפשרויות לשדות בחירה
//           const needsOptions = ["select", "radio", "checkbox"].includes(field.fieldType);
//           if (needsOptions) {
//             if (field.options.length === 0) return `יש להוסיף לפחות אפשרות אחת לשדה (סעיף ${i + 1}, תת-סעיף ${j + 1}, שדה ${k + 1})`;
            
//             // בדיקת אפשרויות
//             for (let l = 0; l < field.options.length; l++) {
//               const option = field.options[l];
//               if (!option.optionLabel) return `תווית האפשרות (סעיף ${i + 1}, תת-סעיף ${j + 1}, שדה ${k + 1}, אפשרות ${l + 1}) היא שדה חובה`;
//               if (!option.optionValue) return `ערך האפשרות (סעיף ${i + 1}, תת-סעיף ${j + 1}, שדה ${k + 1}, אפשרות ${l + 1}) הוא שדה חובה`;
//             }
//           }
//         }
//       }
//     }
    
//     return "";
//   };

//   // הכנת נתוני טופס לשליחה לשרת
//   const prepareFormData = () => {
//     // יצירת אובייקט המייצג את הטופס לפי מבנה מסד הנתונים
//     const formData = {
//       formName,
//       creationDate: new Date().toISOString(),
//       dueDate: dueDate || null,
//       description,
//       instructions,
//       academicYear,
//       semester,
//       startDate,
//       createdBy: currentUser?.personId, // יש להחליף במזהה המשתמש המחובר
//       isActive: true,
//       isPublished: false, // יעודכן לפי פרמטר הפונקציה
      
//       // מידע על הסעיפים - יחולץ מהמערך sections
//       formSections: []
//     };
    
//     // הכנת הסעיפים
//     sections.forEach(section => {
//       const formSection = {
//         formId: 0, // יעודכן בשרת
//         parentSectionID: null, // סעיף ראשי
//         level: 0,
//         orderIndex: section.orderIndex,
//         title: section.title,
//         description: section.description,
//         explanation: section.explanation,
//         maxPoints: section.maxPoints,
//         responsibleEntity: section.responsibleEntity,
//         responsiblePerson: section.responsiblePerson,
//         isRequired: section.isRequired,
//         isVisible: section.isVisible,
//         maxOccurrences: section.maxOccurrences,
        
//         // שדות הסעיף
//         fields: section.fields.map(field => ({
//           sectionID: 0, // יעודכן בשרת
//           fieldName: field.fieldName,
//           fieldLabel: field.fieldLabel,
//           fieldType: field.fieldType,
//           isRequired: field.isRequired,
//           defaultValue: field.defaultValue,
//           placeholder: field.placeholder,
//           helpText: field.helpText,
//           orderIndex: field.orderIndex,
//           isVisible: field.isVisible,
//           maxLength: field.maxLength,
//           minValue: field.minValue,
//           maxValue: field.maxValue,
//           scoreCalculationRule: field.scoreCalculationRule,
//           isActive: field.isActive,
          
//           // אפשרויות של השדה
//           options: field.options.map(option => ({
//             fieldID: 0, // יעודכן בשרת
//             optionValue: option.optionValue,
//             optionLabel: option.optionLabel,
//             scoreValue: option.scoreValue,
//             orderIndex: option.orderIndex,
//             isDefault: option.isDefault
//           }))
//         })),
        
//         // הרשאות לסעיף
//         permissions: section.permissions.map(permission => ({
//           sectionID: 0, // יעודכן בשרת
//           responsiblePerson: permission.responsiblePerson,
//           canView: permission.canView,
//           canEdit: permission.canEdit,
//           canEvaluate: permission.canEvaluate
//         })),
        
//         // תתי-סעיפים
//         subSections: section.subSections.map(subSection => ({
//           formId: 0, // יעודכן בשרת
//           parentSectionID: 0, // יעודכן בשרת
//           level: 1,
//           orderIndex: subSection.orderIndex,
//           title: subSection.title,
//           description: subSection.description,
//           explanation: subSection.explanation,
//           maxPoints: subSection.maxPoints,
//           responsibleEntity: subSection.responsibleEntity,
//           responsiblePerson: subSection.responsiblePerson,
//           isRequired: subSection.isRequired,
//           isVisible: subSection.isVisible,
//           maxOccurrences: subSection.maxOccurrences,
          
//           // שדות תת-הסעיף
//           fields: subSection.fields.map(field => ({
//             sectionID: 0, // יעודכן בשרת
//             fieldName: field.fieldName,
//             fieldLabel: field.fieldLabel,
//             fieldType: field.fieldType,
//             isRequired: field.isRequired,
//             defaultValue: field.defaultValue,
//             placeholder: field.placeholder,
//             helpText: field.helpText,
//             orderIndex: field.orderIndex,
//             isVisible: field.isVisible,
//             maxLength: field.maxLength,
//             minValue: field.minValue,
//             maxValue: field.maxValue,
//             scoreCalculationRule: field.scoreCalculationRule,
//             isActive: field.isActive,
            
//             // אפשרויות של השדה
//             options: field.options.map(option => ({
//               fieldID: 0, // יעודכן בשרת
//               optionValue: option.optionValue,
//               optionLabel: option.optionLabel,
//               scoreValue: option.scoreValue,
//               orderIndex: option.orderIndex,
//               isDefault: option.isDefault
//             }))
//           })),
          
//           // הרשאות לתת-סעיף
//           permissions: subSection.permissions.map(permission => ({
//             sectionID: 0, // יעודכן בשרת
//             responsiblePerson: permission.responsiblePerson,
//             canView: permission.canView,
//             canEdit: permission.canEdit,
//             canEvaluate: permission.canEvaluate
//           })),
          
//           // תת-תת-סעיפים (רמה שלישית)
//           subSections: subSection.subSections.map(subSubSection => ({
//             // נתוני תת-תת-סעיף
//             formId: 0, // יעודכן בשרת
//             parentSectionID: 0, // יעודכן בשרת
//             level: 2,
//             // ...שאר המידע
//           }))
//         }))
//       };
      
//       formData.formSections.push(formSection);
//     });
    
//     return formData;
//   };

//   const handleSave = async (publish = false) => {
//     setError("");
//     setSuccess("");
  
//     const mainError = validateMainForm();
//     if (mainError) {
//       setError(mainError);
//       return;
//     }
    
//     const sectionsError = validateSections();
//     if (sectionsError) {
//       setError(sectionsError);
//       return;
//     }
  
//     // הכנת הנתונים לשליחה
//     const formData = prepareFormData();
//     formData.isPublished = publish;
    
//     // שימוש במזהה המשתמש הנוכחי מ-localStorage
//     const currentUser = JSON.parse(localStorage.getItem('currentUser'));
//     formData.createdBy = currentUser?.personId || '';
  
//     try {
//       // קריאה ל-API
//       const response = await fetch("https://localhost:7230/api/Form", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });
      
//       if (!response.ok) {
//         const errText = await response.text();
//         throw new Error(errText || "Failed to create form");
//       }
      
//       const result = await response.json();
      
//       // המשך הטיפול בתשובת השרת
//       setSuccess(publish ? "הטופס פורסם בהצלחה!" : "הטופס נשמר כטיוטה בהצלחה!");
      
//       // אפשר להוסיף redirect לדף רשימת הטפסים
//       // history.push("/forms");
//     } catch (err) {
//       setError("שגיאה בשמירת הטופס: " + err.message);
//     }
//   };
//   return (
//     <Container
//       fluid
//       className="d-flex align-items-center justify-content-center"
//       dir="rtl"
//       style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "20px" }}
//     >
//       <Card className="p-4 shadow w-100" style={{ maxWidth: "1200px" }}>
//         <h4 className="mb-3 text-center">יצירת טופס חדש</h4>
//         {error && <Alert variant="danger">{error}</Alert>}
//         {success && <Alert variant="success">{success}</Alert>}

//         <Form>
//           <Row className="mb-3">
//             <Col md={6}>
//               <Form.Group controlId="formName">
//                 <Form.Label>
//                   שם הטופס <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="הכנס שם טופס"
//                   value={formName}
//                   onChange={(e) => setFormName(e.target.value)}
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={3}>
//               <Form.Group controlId="academicYear">
//                 <Form.Label>
//                   שנת לימודים <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="לדוגמה: 2024-2025"
//                   value={academicYear}
//                   onChange={(e) => setAcademicYear(e.target.value)}
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={3}>
//               <Form.Group controlId="semester">
//                 <Form.Label>סמסטר</Form.Label>
//                 <Form.Select
//                   value={semester}
//                   onChange={(e) => setSemester(e.target.value)}
//                 >
//                   <option value="">בחר סמסטר</option>
//                   <option value="א">סמסטר א'</option>
//                   <option value="ב">סמסטר ב'</option>
//                   <option value="ק">קיץ</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row className="mb-3">
//             <Col md={6}>
//               <Form.Group controlId="startDate">
//                 <Form.Label>
//                   תאריך פתיחה <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={startDate}
//                   onChange={(e) => setStartDate(e.target.value)}
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group controlId="dueDate">
//                 <Form.Label>תאריך סיום</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={dueDate}
//                   onChange={(e) => setDueDate(e.target.value)}
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           <Form.Group controlId="description" className="mb-3">
//             <Form.Label>תיאור כללי</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={2}
//               placeholder="הכנס תיאור כללי על הטופס"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//             />
//           </Form.Group>
          
//           <Form.Group controlId="instructions" className="mb-3">
//             <Form.Label>הנחיות למילוי</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={2}
//               placeholder="הכנס הנחיות למילוי הטופס"
//               value={instructions}
//               onChange={(e) => setInstructions(e.target.value)}
//             />
//           </Form.Group>
//         </Form>

//         <hr />
//         <div className="d-flex align-items-center justify-content-between">
//           <h5 className="mb-0">הגדרת סעיפים</h5>
//           <Button variant="primary" onClick={addSection}>
//             הוסף סעיף חדש
//           </Button>
//         </div>

//         <div className="mt-3">
//           {sections.map((section, sectionIndex) => (
//             <Card key={sectionIndex} className="mb-3">
//               <Card.Header className="bg-light">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <h6 className="mb-0">סעיף {sectionIndex + 1}</h6>
//                   <Button 
//                     variant="danger" 
//                     size="sm" 
//                     onClick={() => removeSection(sectionIndex)}
//                   >
//                     <i className="bi bi-trash"></i> הסר סעיף
//                   </Button>
//                 </div>
//               </Card.Header>
//               <Card.Body>
//                 <Row>
//                   <Col md={8}>
//                     <Form.Group className="mb-2">
//                       <Form.Label>
//                         כותרת הסעיף <span className="text-danger">*</span>
//                       </Form.Label>
//                       <Form.Control
//                         type="text"
//                         placeholder="הכנס כותרת"
//                         value={section.title}
//                         onChange={(e) =>
//                           updateSection(sectionIndex, "title", e.target.value)
//                         }
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={4}>
//                     <Form.Group className="mb-2">
//                       <Form.Label>
//                         ניקוד מקסימלי <span className="text-danger">*</span>
//                       </Form.Label>
//                       <Form.Control
//                         type="number"
//                         placeholder="הכנס ניקוד"
//                         value={section.maxPoints}
//                         onChange={(e) =>
//                           updateSection(sectionIndex, "maxPoints", e.target.value)
//                         }
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
                
//                 <Row>
//                   <Col md={6}>
//                     <Form.Group className="mb-2">
//                       <Form.Label>תיאור קצר</Form.Label>
//                       <Form.Control
//                         type="text"
//                         placeholder="תיאור קצר"
//                         value={section.description}
//                         onChange={(e) =>
//                           updateSection(sectionIndex, "description", e.target.value)
//                         }
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-2">
//                       <Form.Label>
//                         הסבר <span className="text-danger">*</span>
//                       </Form.Label>
//                       <Form.Control
//                         as="textarea"
//                         rows={2}
//                         placeholder="הסבר מפורט"
//                         value={section.explanation}
//                         onChange={(e) =>
//                           updateSection(sectionIndex, "explanation", e.target.value)
//                         }
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
                
//                 <Row>
//                   <Col md={4}>
//                     <Form.Group className="mb-2">
//                       <Form.Label>גורם אחראי (מחלקה)</Form.Label>
//                       <Form.Select
//                         value={section.responsibleEntity || ""}
//                         onChange={(e) =>
//                           updateSection(sectionIndex, "responsibleEntity", e.target.value ? parseInt(e.target.value) : null)
//                         }
//                       >
//                         <option value="">בחר מחלקה</option>
//                         {departments.map(dept => (
//                           <option key={dept.departmentID} value={dept.departmentID}>
//                             {dept.departmentName}
//                           </option>
//                         ))}
//                       </Form.Select>
//                     </Form.Group>
//                   </Col>
//                   <Col md={4}>
//                     <Form.Group className="mb-2">
//                       <Form.Label>אדם אחראי</Form.Label>
//                       <Form.Select
//                         value={section.responsiblePerson || ""}
//                         onChange={(e) =>
//                           updateSection(sectionIndex, "responsiblePerson", e.target.value || null)
//                         }
//                       >
//                         <option value="">בחר משתמש</option>
//                         {users.map(user => (
//                           <option key={user.personId} value={user.personId}>
//                             {user.firstName} {user.lastName}
//                           </option>
//                         ))}
//                       </Form.Select>
//                     </Form.Group>
//                   </Col>
//                   <Col md={4}>
//                     <Form.Group className="mb-2">
//                       <Form.Label>מספר מופעים מקסימלי</Form.Label>
//                       <Form.Control
//                         type="number"
//                         min="1"
//                         placeholder="1"
//                         value={section.maxOccurrences}
//                         onChange={(e) =>
//                           updateSection(sectionIndex, "maxOccurrences", e.target.value)
//                         }
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
                
//                 <Row>
//                   <Col>
//                     <Form.Check
//                       type="checkbox"
//                       label="סעיף חובה"
//                       checked={section.isRequired}
//                       onChange={(e) =>
//                         updateSection(sectionIndex, "isRequired", e.target.checked)
//                       }
//                       className="mb-2"
//                     />
//                   </Col>
//                   <Col>
//                     <Form.Check
//                       type="checkbox"
//                       label="נראה למשתמש"
//                       checked={section.isVisible}
//                       onChange={(e) =>
//                         updateSection(sectionIndex, "isVisible", e.target.checked)
//                       }
//                       className="mb-2"
//                     />
//                   </Col>
//                 </Row>
                
//                 <hr />
                
//                 {/* שדות הסעיף */}
//                 <div className="mb-3">
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <h6>שדות בסעיף</h6>
//                     <Button 
//                       variant="success" 
//                       size="sm" 
//                       onClick={() => addField(sectionIndex)}
//                     >
//                       <i className="bi bi-plus"></i> הוסף שדה
//                     </Button>
//                   </div>
                  
//                   {section.fields.length === 0 && (
//                     <div className="text-center text-muted py-3">
//                       <p>אין שדות בסעיף זה</p>
//                       <Button 
//                         variant="outline-primary" 
//                         size="sm" 
//                         onClick={() => addField(sectionIndex)}
//                       >
//                         הוסף שדה חדש
//                       </Button>
//                     </div>
//                   )}
                  
//                   {section.fields.map((field, fieldIndex) => (
//                     <Card key={fieldIndex} className="mb-2 border-light">
//                       <Card.Body>
//                         <Row>
//                           <Col md={3}>
//                             <Form.Group className="mb-2">
//                               <Form.Label>
//                                 שם השדה <span className="text-danger">*</span>
//                               </Form.Label>
//                               <Form.Control
//                                 type="text"
//                                 placeholder="fieldName"
//                                 value={field.fieldName}
//                                 onChange={(e) =>
//                                   updateField(sectionIndex, fieldIndex, "fieldName", e.target.value)
//                                 }
//                               />
//                               <Form.Text className="text-muted">
//                                 שם טכני - באנגלית בלבד, ללא רווחים
//                               </Form.Text>
//                             </Form.Group>
//                           </Col>
//                           <Col md={4}>
//                             <Form.Group className="mb-2">
//                               <Form.Label>
//                                 תווית השדה <span className="text-danger">*</span>
//                               </Form.Label>
//                               <Form.Control
//                                 type="text"
//                                 placeholder="כותרת"
//                                 value={field.fieldLabel}
//                                 onChange={(e) =>
//                                   updateField(sectionIndex, fieldIndex, "fieldLabel", e.target.value)
//                                 }
//                               />
//                             </Form.Group>
//                           </Col>
//                           <Col md={3}>
//                             <Form.Group className="mb-2">
//                               <Form.Label>
//                                 סוג השדה <span className="text-danger">*</span>
//                               </Form.Label>
//                               <Form.Select
//                                 value={field.fieldType}
//                                 onChange={(e) =>
//                                   updateField(sectionIndex, fieldIndex, "fieldType", e.target.value)
//                                 }
//                               >
//                                 <option value="">בחר סוג שדה</option>
//                                 {fieldTypeOptions.map(opt => (
//                                   <option key={opt.value} value={opt.value}>
//                                     {opt.label}
//                                   </option>
//                                 ))}
//                               </Form.Select>
//                             </Form.Group>
//                           </Col>
//                           <Col md={2} className="d-flex align-items-end justify-content-end mb-2">
//                             <Button 
//                               variant="danger" 
//                               size="sm" 
//                               onClick={() => removeField(sectionIndex, fieldIndex)}
//                             >
//                               <i className="bi bi-trash"></i> הסר
//                             </Button>
//                           </Col>
//                         </Row>
                        
//                         <Row>
//                           <Col md={4}>
//                             <Form.Group className="mb-2">
//                               <Form.Label>ערך ברירת מחדל</Form.Label>
//                               <Form.Control
//                                 type="text"
//                                 placeholder="ערך ברירת מחדל"
//                                 value={field.defaultValue}
//                                 onChange={(e) =>
//                                   updateField(sectionIndex, fieldIndex, "defaultValue", e.target.value)
//                                 }
//                               />
//                             </Form.Group>
//                           </Col>
//                           <Col md={4}>
//                             <Form.Group className="mb-2">
//                               <Form.Label>טקסט דוגמה (Placeholder)</Form.Label>
//                               <Form.Control
//                                 type="text"
//                                 placeholder="טקסט דוגמה"
//                                 value={field.placeholder}
//                                 onChange={(e) =>
//                                   updateField(sectionIndex, fieldIndex, "placeholder", e.target.value)
//                                 }
//                               />
//                             </Form.Group>
//                           </Col>
//                           <Col md={4}>
//                             <Form.Group className="mb-2">
//                               <Form.Label>טקסט עזרה</Form.Label>
//                               <Form.Control
//                                 type="text"
//                                 placeholder="הסבר למשתמש"
//                                 value={field.helpText}
//                                 onChange={(e) =>
//                                   updateField(sectionIndex, fieldIndex, "helpText", e.target.value)
//                                 }
//                               />
//                             </Form.Group>
//                           </Col>
//                         </Row>
                        
//                         <Row>
//                           <Col>
//                             <Form.Check
//                               type="checkbox"
//                               label="שדה חובה"
//                               checked={field.isRequired}
//                               onChange={(e) =>
//                                 updateField(sectionIndex, fieldIndex, "isRequired", e.target.checked)
//                               }
//                               className="mb-2"
//                             />
//                           </Col>
//                           <Col>
//                             <Form.Check
//                               type="checkbox"
//                               label="נראה למשתמש"
//                               checked={field.isVisible}
//                               onChange={(e) =>
//                                 updateField(sectionIndex, fieldIndex, "isVisible", e.target.checked)
//                               }
//                               className="mb-2"
//                             />
//                           </Col>
//                         </Row>
                        
//                         {/* אפשרויות לשדות מסוג בחירה */}
//                         {["select", "radio", "checkbox"].includes(field.fieldType) && (
//                           <div className="mt-2">
//                             <div className="d-flex justify-content-between align-items-center mb-2">
//                               <h6>אפשרויות בחירה</h6>
//                               <Button 
//                                 variant="outline-primary" 
//                                 size="sm" 
//                                 onClick={() => addFieldOption(sectionIndex, fieldIndex)}
//                               >
//                                 <i className="bi bi-plus"></i> הוסף אפשרות
//                               </Button>
//                             </div>
                            
//                             <Table size="sm" bordered hover>
//                               <thead>
//                                 <tr>
//                                   <th style={{width: "40%"}}>תווית</th>
//                                   <th style={{width: "20%"}}>ערך</th>
//                                   <th style={{width: "15%"}}>ניקוד</th>
//                                   <th style={{width: "15%"}}>ברירת מחדל</th>
//                                   <th style={{width: "10%"}}>פעולות</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {field.options.map((option, optionIndex) => (
//                                   <tr key={optionIndex}>
//                                     <td>
//                                       <Form.Control
//                                         size="sm"
//                                         type="text"
//                                         placeholder="תווית לתצוגה"
//                                         value={option.optionLabel}
//                                         onChange={(e) =>
//                                           updateFieldOption(sectionIndex, fieldIndex, optionIndex, "optionLabel", e.target.value)
//                                         }
//                                       />
//                                     </td>
//                                     <td>
//                                       <Form.Control
//                                         size="sm"
//                                         type="text"
//                                         placeholder="ערך לשמירה"
//                                         value={option.optionValue}
//                                         onChange={(e) =>
//                                           updateFieldOption(sectionIndex, fieldIndex, optionIndex, "optionValue", e.target.value)
//                                         }
//                                       />
//                                     </td>
//                                     <td>
//                                       <Form.Control
//                                         size="sm"
//                                         type="number"
//                                         placeholder="ניקוד"
//                                         value={option.scoreValue}
//                                         onChange={(e) =>
//                                           updateFieldOption(sectionIndex, fieldIndex, optionIndex, "scoreValue", e.target.value)
//                                         }
//                                       />
//                                     </td>
//                                     <td className="text-center">
//                                       <Form.Check
//                                         type="radio"
//                                         checked={option.isDefault}
//                                         onChange={(e) =>
//                                           updateFieldOption(sectionIndex, fieldIndex, optionIndex, "isDefault", true)
//                                         }
//                                       />
//                                     </td>
//                                     <td className="text-center">
//                                       <Button 
//                                         variant="danger" 
//                                         size="sm"
//                                         onClick={() => {
//                                           const newSections = [...sections];
//                                           newSections[sectionIndex].fields[fieldIndex].options.splice(optionIndex, 1);
//                                           setSections(newSections);
//                                         }}
//                                       >
//                                         <i className="bi bi-trash"></i>
//                                       </Button>
//                                     </td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </Table>
//                           </div>
//                         )}
//                       </Card.Body>
//                     </Card>
//                   ))}
//                 </div>
                
//                 <hr />
                
//                 {/* תתי-סעיפים */}
//                 <div className="mb-3">
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <h6>תתי-סעיפים</h6>
//                     <Button 
//                       variant="info" 
//                       size="sm" 
//                       onClick={() => addSubSection(sectionIndex)}
//                     >
//                       <i className="bi bi-plus"></i> הוסף תת-סעיף
//                     </Button>
//                   </div>
                  
//                   {section.subSections.length === 0 && (
//                     <div className="text-center text-muted py-3">
//                       <p>אין תתי-סעיפים בסעיף זה</p>
//                       <Button 
//                         variant="outline-info" 
//                         size="sm" 
//                         onClick={() => addSubSection(sectionIndex)}
//                       >
//                         הוסף תת-סעיף חדש
//                       </Button>
//                     </div>
//                   )}
                  
//                   {section.subSections.map((subSection, subIndex) => (
//                     <Accordion key={subIndex} className="mb-2">
//                       <Accordion.Item eventKey="0">
//                         <Accordion.Header>
//                           <div className="d-flex justify-content-between w-100 pe-4">
//                             <span>
//                               {subSection.title || `תת-סעיף ${subIndex + 1}`}
//                               {subSection.maxPoints ? ` (${subSection.maxPoints} נקודות)` : ''}
//                             </span>
//                             <Button 
//                               variant="danger" 
//                               size="sm" 
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 removeSubSection(sectionIndex, subIndex);
//                               }}
//                             >
//                               <i className="bi bi-trash"></i> הסר
//                             </Button>
//                           </div>
//                         </Accordion.Header>
//                         <Accordion.Body>
//                           <Row>
//                             <Col md={8}>
//                               <Form.Group className="mb-2">
//                                 <Form.Label>
//                                   כותרת תת-הסעיף <span className="text-danger">*</span>
//                                 </Form.Label>
//                                 <Form.Control
//                                   type="text"
//                                   placeholder="הכנס כותרת"
//                                   value={subSection.title}
//                                   onChange={(e) =>
//                                     updateSubSection(sectionIndex, subIndex, "title", e.target.value)
//                                   }
//                                 />
//                               </Form.Group>
//                             </Col>
//                             <Col md={4}>
//                               <Form.Group className="mb-2">
//                                 <Form.Label>
//                                   ניקוד מקסימלי <span className="text-danger">*</span>
//                                 </Form.Label>
//                                 <Form.Control
//                                   type="number"
//                                   placeholder="הכנס ניקוד"
//                                   value={subSection.maxPoints}
//                                   onChange={(e) =>
//                                     updateSubSection(sectionIndex, subIndex, "maxPoints", e.target.value)
//                                   }
//                                 />
//                               </Form.Group>
//                             </Col>
//                           </Row>
                          
//                           <Form.Group className="mb-2">
//                             <Form.Label>
//                               הסבר <span className="text-danger">*</span>
//                             </Form.Label>
//                             <Form.Control
//                               as="textarea"
//                               rows={2}
//                               placeholder="הסבר מפורט"
//                               value={subSection.explanation}
//                               onChange={(e) =>
//                                 updateSubSection(sectionIndex, subIndex, "explanation", e.target.value)
//                               }
//                             />
//                           </Form.Group>
                          
//                           <Row>
//                             <Col>
//                               <Form.Check
//                                 type="checkbox"
//                                 label="תת-סעיף חובה"
//                                 checked={subSection.isRequired}
//                                 onChange={(e) =>
//                                   updateSubSection(sectionIndex, subIndex, "isRequired", e.target.checked)
//                                 }
//                                 className="mb-2"
//                               />
//                             </Col>
//                             <Col>
//                               <Form.Check
//                                 type="checkbox"
//                                 label="נראה למשתמש"
//                                 checked={subSection.isVisible}
//                                 onChange={(e) =>
//                                   updateSubSection(sectionIndex, subIndex, "isVisible", e.target.checked)
//                                 }
//                                 className="mb-2"
//                               />
//                             </Col>
//                           </Row>
                          
//                           {/* שדות לתת-סעיף */}
//                           <div className="mt-3">
//                             <div className="d-flex justify-content-between align-items-center mb-2">
//                               <h6>שדות בתת-הסעיף</h6>
//                               <Button 
//                                 variant="success" 
//                                 size="sm" 
//                                 onClick={() => addSubSectionField(sectionIndex, subIndex)}
//                               >
//                                 <i className="bi bi-plus"></i> הוסף שדה
//                               </Button>
//                             </div>
                            
//                             {subSection.fields.length === 0 && (
//                               <div className="text-center text-muted py-3">
//                                 <p>אין שדות בתת-סעיף זה</p>
//                                 <Button 
//                                   variant="outline-primary" 
//                                   size="sm" 
//                                   onClick={() => addSubSectionField(sectionIndex, subIndex)}
//                                 >
//                                   הוסף שדה חדש
//                                 </Button>
//                               </div>
//                             )}
                            
//                             {/* הוספת שדות לתת-סעיף - דומה לשדות בסעיף הראשי */}
//                             {/* כאן אפשר להוסיף קוד דומה לשדות הסעיף העיקרי */}
//                           </div>
//                         </Accordion.Body>
//                       </Accordion.Item>
//                     </Accordion>
//                   ))}
//                 </div>
                
//                 <hr />
                
//                 {/* הרשאות לסעיף */}
//                 <div className="mb-3">
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <h6>הרשאות גישה לסעיף</h6>
//                     <Button 
//                       variant="warning" 
//                       size="sm" 
//                       onClick={() => addSectionPermission(sectionIndex)}
//                     >
//                       <i className="bi bi-plus"></i> הוסף הרשאה
//                     </Button>
//                   </div>
                  
//                   {section.permissions.length === 0 && (
//                     <div className="text-center text-muted py-3">
//                       <p>לא הוגדרו הרשאות מיוחדות לסעיף זה</p>
//                       <Button 
//                         variant="outline-warning" 
//                         size="sm" 
//                         onClick={() => addSectionPermission(sectionIndex)}
//                       >
//                         הוסף הרשאה חדשה
//                       </Button>
//                     </div>
//                   )}
                  
//                   {section.permissions.map((permission, permIndex) => (
//                     <Card key={permIndex} className="mb-2 border-light">
//                       <Card.Body>
//                         <Row>
//                           <Col md={6}>
//                             <Form.Group className="mb-2">
//                               <Form.Label>
//                                 משתמש אחראי <span className="text-danger">*</span>
//                               </Form.Label>
//                               <Form.Select
//                                 value={permission.responsiblePerson || ""}
//                                 onChange={(e) =>
//                                   updateSectionPermission(sectionIndex, permIndex, "responsiblePerson", e.target.value)
//                                 }
//                               >
//                                 <option value="">בחר משתמש</option>
//                                 {users.map(user => (
//                                   <option key={user.personId} value={user.personId}>
//                                     {user.firstName} {user.lastName}
//                                   </option>
//                                 ))}
//                               </Form.Select>
//                             </Form.Group>
//                           </Col>
//                           <Col md={6} className="d-flex align-items-end">
//                             <Form.Check
//                               inline
//                               type="checkbox"
//                               label="צפייה"
//                               checked={permission.canView}
//                               onChange={(e) =>
//                                 updateSectionPermission(sectionIndex, permIndex, "canView", e.target.checked)
//                               }
//                               className="me-3"
//                             />
//                             <Form.Check
//                               inline
//                               type="checkbox"
//                               label="עריכה"
//                               checked={permission.canEdit}
//                               onChange={(e) =>
//                                 updateSectionPermission(sectionIndex, permIndex, "canEdit", e.target.checked)
//                               }
//                               className="me-3"
//                             />
//                             <Form.Check
//                               inline
//                               type="checkbox"
//                               label="הערכה"
//                               checked={permission.canEvaluate}
//                               onChange={(e) =>
//                                 updateSectionPermission(sectionIndex, permIndex, "canEvaluate", e.target.checked)
//                               }
//                               className="me-3"
//                             />
//                             <Button 
//                               variant="danger" 
//                               size="sm" 
//                               onClick={() => removeSectionPermission(sectionIndex, permIndex)}
//                               className="ms-auto"
//                             >
//                               <i className="bi bi-trash"></i> הסר
//                             </Button>
//                           </Col>
//                         </Row>
//                       </Card.Body>
//                     </Card>
//                   ))}
//                 </div>
//               </Card.Body>
//             </Card>
//           ))}
//         </div>

//         <hr />
//         <div className="d-flex justify-content-between">
//           <Button variant="warning" onClick={() => handleSave(false)}>
//             שמור כטיוטה
//           </Button>
//           <Button variant="success" onClick={() => handleSave(true)}>
//             פרסם
//           </Button>
//         </div>
//       </Card>
//     </Container>
//   );
// }

// export default NewFormPage; 