// // src/pages/AddForm/useFormData.js
// import { useState, useEffect } from 'react';

// export default function useFormData() {
//   // נתוני הטופס הבסיסיים - התאמה למבנה בטבלת tblForm
//   const [formBasicDetails, setFormBasicDetails] = useState({
//     formName: '',
//     academicYear: '',
//     semester: '',
//     description: '',
//     instructions: '',
//     startDate: '',
//     dueDate: '',
//     isActive: true,
//     isPublished: false,
//     formId: null, // יתווסף אחרי יצירת הטופס
//   });

//   // סעיפים ראשיים - התאמה למבנה בטבלת FormSection
//   const [mainSections, setMainSections] = useState([]);

//   // שגיאות והודעות
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
  
//   // מצב הטעינה
//   const [loading, setLoading] = useState(false);
  
//   // מידע על התקדמות הטופס
//   const [formProgress, setFormProgress] = useState(0);

//   // נתונים מעטפת
//   const [departments, setDepartments] = useState([]);
//   const [users, setUsers] = useState([]);

//   // עדכון פרטים בסיסיים
//   const updateFormBasicDetails = (field, value) => {
//     setFormBasicDetails(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };
  
//   // עדכון המזהה של הטופס אחרי יצירתו
//   const setFormId = (id) => {
//     setFormBasicDetails(prev => ({
//       ...prev,
//       formId: id
//     }));
//   };

//   // הוספת סעיף ראשי
//   const addMainSection = () => {
//     setMainSections(prev => [
//       ...prev,
//       {
//         sectionId: null, // יתווסף אחרי יצירת הסעיף
//         formId: formBasicDetails.formId, // קישור לטופס
//         title: '',
//         description: '',
//         explanation: '',
//         maxPoints: '',
//         level: 0, // רמה 0 = סעיף ראשי
//         orderIndex: prev.length + 1,
//         isRequired: false,
//         isVisible: true,
//         maxOccurrences: 1,
//         responsibleEntity: null, // מחלקה אחראית
//         responsiblePerson: null, // אדם אחראי
//         parentSectionID: null, // אין הורה לסעיף ראשי
//         fields: [], // שדות בסעיף
//         subSections: [], // תתי-סעיפים
//         permissions: [] // הרשאות לסעיף
//       }
//     ]);
//   };

//   // עדכון סעיף ראשי
//   const updateMainSection = (index, field, value) => {
//     setMainSections(prev => {
//       const updated = [...prev];
//       updated[index] = {
//         ...updated[index],
//         [field]: value
//       };
//       return updated;
//     });
//   };
  
//   // עדכון מזהה של סעיף אחרי יצירתו
//   const setSectionId = (index, id) => {
//     setMainSections(prev => {
//       const updated = [...prev];
//       updated[index] = {
//         ...updated[index],
//         sectionId: id
//       };
//       return updated;
//     });
//   };

//   // הוספת שדה לסעיף ראשי - התאמה לטבלת SectionFields
//   const addFieldToMainSection = (sectionIndex) => {
//     setMainSections(prev => {
//       const updated = [...prev];
//       updated[sectionIndex].fields.push({
//         fieldId: null, // יתווסף אחרי יצירת השדה
//         sectionID: updated[sectionIndex].sectionId, // קישור לסעיף
//         fieldName: `field_${Date.now()}_${updated[sectionIndex].fields.length}`, // שם השדה לזיהוי מערכתי
//         fieldLabel: '', // התווית שתוצג למשתמש
//         fieldType: '', // סוג השדה
//         isRequired: false, // האם השדה חובה
//         defaultValue: '', // ערך ברירת מחדל
//         placeholder: '', // טקסט שיופיע בשדה לפני המילוי
//         helpText: '', // טקסט עזרה
//         orderIndex: updated[sectionIndex].fields.length + 1, // סדר בתוך הסעיף
//         isVisible: true, // האם השדה גלוי
//         maxLength: null, // אורך מקסימלי לשדה טקסט
//         minValue: null, // ערך מינימלי לשדה מספרי
//         maxValue: null, // ערך מקסימלי לשדה מספרי
//         scoreCalculationRule: null, // כלל חישוב ניקוד
//         isActive: true, // האם השדה פעיל
//         options: [] // אפשרויות בחירה (לשדות select, radio, checkbox)
//       });
//       return updated;
//     });
//   };

//   // הוספת אפשרות בחירה לשדה - התאמה לטבלת FieldOptions
//   const addFieldOption = (sectionIndex, fieldIndex) => {
//     setMainSections(prev => {
//       const updated = [...prev];
//       if (!updated[sectionIndex].fields[fieldIndex].options) {
//         updated[sectionIndex].fields[fieldIndex].options = [];
//       }
//       updated[sectionIndex].fields[fieldIndex].options.push({
//         optionId: null, // יתווסף אחרי יצירת האפשרות
//         fieldID: updated[sectionIndex].fields[fieldIndex].fieldId, // קישור לשדה
//         optionValue: `option_${updated[sectionIndex].fields[fieldIndex].options.length + 1}`, // ערך לשמירה
//         optionLabel: '', // תווית לתצוגה
//         scoreValue: 0, // ניקוד
//         orderIndex: updated[sectionIndex].fields[fieldIndex].options.length + 1, // סדר בתוך השדה
//         isDefault: false // האם זו ברירת המחדל
//       });
//       return updated;
//     });
//   };

//   // עדכון אפשרות בחירה בשדה
//   const updateFieldOption = (sectionIndex, fieldIndex, optionIndex, field, value) => {
//     setMainSections(prev => {
//       const updated = [...prev];
//       updated[sectionIndex].fields[fieldIndex].options[optionIndex][field] = value;
      
//       // אם עדכנו את isDefault ל-true, נאפס את שאר האפשרויות
//       if (field === 'isDefault' && value === true) {
//         updated[sectionIndex].fields[fieldIndex].options.forEach((opt, idx) => {
//           if (idx !== optionIndex) {
//             opt.isDefault = false;
//           }
//         });
//       }
      
//       return updated;
//     });
//   };

//   // הסרת אפשרות בחירה משדה
//   const removeFieldOption = (sectionIndex, fieldIndex, optionIndex) => {
//     setMainSections(prev => {
//       const updated = [...prev];
//       updated[sectionIndex].fields[fieldIndex].options.splice(optionIndex, 1);
      
//       // עדכון סדר האפשרויות
//       updated[sectionIndex].fields[fieldIndex].options.forEach((opt, idx) => {
//         opt.orderIndex = idx + 1;
//       });
      
//       return updated;
//     });
//   };

//   // עדכון שדה בסעיף
//   const updateField = (sectionIndex, fieldIndex, field, value) => {
//     setMainSections(prev => {
//       const updated = [...prev];
//       updated[sectionIndex].fields[fieldIndex][field] = value;
      
//       // עדכון אוטומטי של שם השדה המערכתי אם עדכנו את תווית השדה
//       if (field === 'fieldLabel' && !updated[sectionIndex].fields[fieldIndex].fieldName) {
//         // יצירת שם שדה מתוך התווית - הסרת רווחים ותווים מיוחדים
//         const systemName = value
//           .replace(/\s+/g, '_') // רווחים ל-_
//           .replace(/[^\w\s]/gi, '') // הסרת תווים מיוחדים
//           .toLowerCase(); // אותיות קטנות
        
//         updated[sectionIndex].fields[fieldIndex].fieldName = systemName || `field_${Date.now()}_${fieldIndex}`;
//       }
      
//       // אם שינינו את סוג השדה לסוג שדה עם אפשרויות, ניצור אפשרות ברירת מחדל
//       if (field === 'fieldType' && ['select', 'radio', 'checkbox'].includes(value)) {
//         if (!updated[sectionIndex].fields[fieldIndex].options || updated[sectionIndex].fields[fieldIndex].options.length === 0) {
//           updated[sectionIndex].fields[fieldIndex].options = [{
//             optionId: null,
//             fieldID: updated[sectionIndex].fields[fieldIndex].fieldId,
//             optionValue: 'option_1',
//             optionLabel: '',
//             scoreValue: 0,
//             orderIndex: 1,
//             isDefault: true
//           }];
//         }
//       }
      
//       return updated;
//     });
//   };

//   // הסרת שדה מסעיף
//   const removeField = (sectionIndex, fieldIndex) => {
//     setMainSections(prev => {
//       const updated = [...prev];
//       updated[sectionIndex].fields.splice(fieldIndex, 1);
      
//       // עדכון סדר השדות
//       updated[sectionIndex].fields.forEach((field, idx) => {
//         field.orderIndex = idx + 1;
//       });
      
//       return updated;
//     });
//   };

//   // הוספת תת-סעיף לסעיף ראשי - התאמה למבנה בטבלת FormSection
//   const addSubSection = (parentIndex) => {
//     setMainSections(prev => {
//       const updated = [...prev];
//       updated[parentIndex].subSections.push({
//         sectionId: null, // יתווסף אחרי יצירת התת-סעיף
//         formId: formBasicDetails.formId, // קישור לטופס
//         title: '',
//         description: '',
//         explanation: '',
//         maxPoints: '',
//         level: 1, // רמה 1 = תת-סעיף
//         orderIndex: updated[parentIndex].subSections.length + 1,
//         isRequired: false,
//         isVisible: true,
//         maxOccurrences: 1,
//         responsibleEntity: updated[parentIndex].responsibleEntity, // ירושה מההורה כברירת מחדל
//         responsiblePerson: updated[parentIndex].responsiblePerson, // ירושה מההורה כברירת מחדל
//         parentSectionID: updated[parentIndex].sectionId, // קישור לסעיף ההורה
//         fields: [], // שדות בתת-הסעיף
//         subSections: [], // תת-תת-סעיפים
//         permissions: [] // הרשאות לתת-הסעיף
//       });
//       return updated;
//     });
//   };

//   // עדכון תת-סעיף
//   const updateSubSection = (sectionIndex, subIndex, field, value) => {
//     setMainSections(prev => {
//       const updated = [...prev];
//       updated[sectionIndex].subSections[subIndex][field] = value;
//       return updated;
//     });
//   };

//   // הוספת שדה לתת-סעיף
//   const addFieldToSubSection = (sectionIndex, subIndex) => {
//     setMainSections(prev => {
//       const updated = [...prev];
//       updated[sectionIndex].subSections[subIndex].fields.push({
//         fieldId: null,
//         sectionID: updated[sectionIndex].subSections[subIndex].sectionId,
//         fieldName: `subfield_${Date.now()}_${updated[sectionIndex].subSections[subIndex].fields.length}`,
//         fieldLabel: '',
//         fieldType: '',
//         isRequired: false,
//         defaultValue: '',
//         placeholder: '',
//         helpText: '',
//         orderIndex: updated[sectionIndex].subSections[subIndex].fields.length + 1,
//         isVisible: true,
//         maxLength: null,
//         minValue: null,
//         maxValue: null,
//         scoreCalculationRule: null,
//         isActive: true,
//         options: []
//       });
//       return updated;
//     });
//   };

//   // הסרת תת-סעיף
//   const removeSubSection = (sectionIndex, subIndex) => {
//     setMainSections(prev => {
//       const updated = [...prev];
//       updated[sectionIndex].subSections.splice(subIndex, 1);
      
//       // עדכון סדר תתי-הסעיפים
//       updated[sectionIndex].subSections.forEach((subSection, idx) => {
//         subSection.orderIndex = idx + 1;
//       });
      
//       return updated;
//     });
//   };

//   // הוספת הרשאה לסעיף - התאמה לטבלת SectionPermissions
//   const addSectionPermission = (sectionIndex, isSub = false, subIndex = null) => {
//     setMainSections(prev => {
//       const updated = [...prev];
//       const permissionObj = {
//         permissionId: null, // יתווסף אחרי יצירת ההרשאה
//         sectionID: isSub ? updated[sectionIndex].subSections[subIndex].sectionId : updated[sectionIndex].sectionId, // קישור לסעיף
//         responsiblePerson: null, // אדם אחראי
//         canView: true, // זכות צפייה
//         canEdit: false, // זכות עריכה
//         canEvaluate: false // זכות הערכה
//       };
      
//       if (isSub) {
//         if (!updated[sectionIndex].subSections[subIndex].permissions) {
//           updated[sectionIndex].subSections[subIndex].permissions = [];
//         }
//         updated[sectionIndex].subSections[subIndex].permissions.push(permissionObj);
//       } else {
//         if (!updated[sectionIndex].permissions) {
//           updated[sectionIndex].permissions = [];
//         }
//         updated[sectionIndex].permissions.push(permissionObj);
//       }
      
//       return updated;
//     });
//   };

//   // חישוב אחוז השלמת הטופס
//   const calculateCompletion = () => {
//     let percent = 0;
    
//     // בדיקת פרטים בסיסיים - 30%
//     const basicDetailsFields = ['formName', 'academicYear', 'startDate'];
//     const filledBasicFields = basicDetailsFields.filter(field => 
//       formBasicDetails[field]?.toString().trim() !== ''
//     ).length;
    
//     percent += (filledBasicFields / basicDetailsFields.length) * 30;
    
//     // בדיקת סעיפים - 50%
//     if (mainSections.length > 0) {
//       let validSections = 0;
      
//       for (const section of mainSections) {
//         if (section.title && section.maxPoints) {
//           validSections += 0.5;
          
//           // בדיקת שדות
//           if (section.fields && section.fields.length > 0) {
//             const validFields = section.fields.filter(field => 
//               field.fieldLabel && field.fieldType
//             ).length;
            
//             if (validFields > 0) {
//               validSections += 0.5 * (validFields / section.fields.length);
//             }
//           }
//         }
//       }
      
//       percent += (validSections / mainSections.length) * 50;
//     }
    
//     // סיכום ושמירה - 20% נוספים אם יש לפחות סעיף אחד מלא
//     if (mainSections.length > 0 && mainSections.some(section => section.title && section.maxPoints && section.fields && section.fields.length > 0)) {
//       percent += 20;
//     }
    
//     // התאמה לטווח 0-100
//     return Math.min(Math.round(percent), 100);
//   };

//   // בדיקת תקינות הטופס
//   const validateForm = () => {
//     // בדיקת פרטים בסיסיים
//     if (!formBasicDetails.formName) return 'שם הטופס הוא שדה חובה';
//     if (!formBasicDetails.academicYear) return 'שנת לימודים היא שדה חובה';
//     if (!formBasicDetails.startDate) return 'תאריך התחלה הוא שדה חובה';
    
//     // בדיקת תאריכים
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const start = new Date(formBasicDetails.startDate);
    
//     if (start < today) return 'תאריך התחלה לא יכול להיות בעבר';
    
//     if (formBasicDetails.dueDate) {
//       const due = new Date(formBasicDetails.dueDate);
//       if (due <= start) return 'תאריך סיום חייב להיות מאוחר מתאריך ההתחלה';
//     }
    
//     // בדיקת סעיפים
//     if (mainSections.length === 0) return 'יש להוסיף לפחות סעיף ראשי אחד';
    
//     // בדיקה מעמיקה של כל סעיף
//     for (let i = 0; i < mainSections.length; i++) {
//       const section = mainSections[i];
      
//       if (!section.title) return `כותרת חסרה בסעיף ${i + 1}`;
//       if (!section.maxPoints) return `ניקוד מקסימלי חסר בסעיף ${i + 1}`;
      
//       // בדיקת שדות הסעיף
//       if (!section.fields || section.fields.length === 0) return `יש להוסיף לפחות שדה אחד לסעיף ${i + 1}`;
      
//       for (let j = 0; j < section.fields.length; j++) {
//         const field = section.fields[j];
//         if (!field.fieldLabel) return `תווית שדה חסרה בסעיף ${i + 1}, שדה ${j + 1}`;
//         if (!field.fieldType) return `סוג שדה חסר בסעיף ${i + 1}, שדה ${j + 1}`;
        
//         // בדיקת אפשרויות לשדות בחירה
//         if (['select', 'radio', 'checkbox'].includes(field.fieldType)) {
//           if (!field.options || field.options.length === 0) {
//             return `יש להוסיף לפחות אפשרות אחת לשדה '${field.fieldLabel}' בסעיף ${i + 1}`;
//           }
          
//           for (let k = 0; k < field.options.length; k++) {
//             const option = field.options[k];
//             if (!option.optionLabel) {
//               return `תווית אפשרות חסרה בשדה '${field.fieldLabel}', סעיף ${i + 1}, אפשרות ${k + 1}`;
//             }
//           }
//         }
//       }
      
//       // בדיקת תתי-סעיפים
//       if (section.subSections && section.subSections.length > 0) {
//         for (let j = 0; j < section.subSections.length; j++) {
//           const subSection = section.subSections[j];
          
//           if (!subSection.title) return `כותרת חסרה בתת-סעיף ${j + 1} של סעיף ${i + 1}`;
//           if (!subSection.maxPoints) return `ניקוד מקסימלי חסר בתת-סעיף ${j + 1} של סעיף ${i + 1}`;
          
//           // בדיקת שדות תת-הסעיף
//           if (subSection.fields && subSection.fields.length > 0) {
//             for (let k = 0; k < subSection.fields.length; k++) {
//               const field = subSection.fields[k];
//               if (!field.fieldLabel) return `תווית שדה חסרה בתת-סעיף ${j + 1} של סעיף ${i + 1}, שדה ${k + 1}`;
//               if (!field.fieldType) return `סוג שדה חסר בתת-סעיף ${j + 1} של סעיף ${i + 1}, שדה ${k + 1}`;
//             }
//           }
//         }
//       }
//     }
    
//     return '';
//   };

//   // החזרת הערכים והפונקציות כדי שנוכל להשתמש בהם בקומפוננטות
//   return {
//     formBasicDetails,
//     mainSections,
//     departments,
//     users,
//     error,
//     success,
//     loading,
//     formProgress,
//     updateFormBasicDetails,
//     setFormId,
//     addMainSection,
//     updateMainSection,
//     setSectionId,
//     addFieldToMainSection,
//     updateField,
//     removeField,
//     addFieldOption,
//     updateFieldOption,
//     removeFieldOption,
//     addSubSection,
//     updateSubSection,
//     removeSubSection,
//     addFieldToSubSection,
//     addSectionPermission,
//     calculateCompletion,
//     validateForm,
//     setError,
//     setSuccess,
//     setLoading,
//     setFormProgress,
//     setMainSections,
//     setDepartments,
//     setUsers
//   };
// }