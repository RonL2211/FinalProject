// // src/pages/AddForm/formService.js

// // URL בסיסי לשרת
// const API_BASE_URL = 'https://localhost:7230/api';

// // יצירת טופס חדש
// export async function createForm(formData) {
//   try {
//     const currentUser = JSON.parse(localStorage.getItem("currentUser"));
//     const currentUserId = currentUser?.personId;
    
//     // מכיוון שאנחנו יוצרים טופס חדש, מזהה הטופס יהיה 0
//     const requestData = {
//       formID: 0,
//       formName: formData.formName,
//       creationDate: new Date().toISOString(),
//       dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
//       description: formData.description || "",
//       instructions: formData.instructions || "",
//       academicYear: formData.academicYear || "",
//       semester: formData.semester && formData.semester.length > 0 ? formData.semester.charAt(0) : null,
//       startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
//       createdBy: formData.createdBy || currentUserId,
//       lastModifiedBy: formData.lastModifiedBy || currentUserId,
//       lastModifiedDate: new Date().toISOString(),
//       isActive: formData.isActive !== undefined ? formData.isActive : true,
//       isPublished: formData.isPublished !== undefined ? formData.isPublished : false
//     };
    
//     console.log("שולח לשרת:", requestData);
    
//     const response = await fetch(`${API_BASE_URL}/Form`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(requestData)
//     });
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Server error response:", errorText);
//       throw new Error(`שגיאה ביצירת הטופס: ${errorText}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error("Error creating form:", error);
//     throw error;
//   }
// }

// // פרסום טופס קיים
// export async function publishForm(formId) {
//   try {
//     const currentUser = JSON.parse(localStorage.getItem("currentUser"));
//     const currentUserId = currentUser?.personId;
    
//     const response = await fetch(`${API_BASE_URL}/Form/${formId}/publish`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(currentUserId)
//     });
    
//     if (!response.ok) {
//       const errorData = await response.text();
//       throw new Error(errorData || 'שגיאה בפרסום הטופס');
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error publishing form:', error);
//     throw error;
//   }
// }

// // יצירת סעיף בטופס
// export async function createFormSection(sectionData) {
//   try {
//     const requestData = {
//       sectionID: 0,
//       formId: sectionData.formId,
//       parentSectionID: sectionData.parentSectionID,
//       level: sectionData.level,
//       orderIndex: sectionData.orderIndex,
//       title: sectionData.title,
//       description: sectionData.description || "",
//       explanation: sectionData.explanation || "",
//       maxPoints: sectionData.maxPoints,
//       responsibleEntity: sectionData.responsibleEntity,
//       responsiblePerson: sectionData.responsiblePerson,
//       isRequired: sectionData.isRequired,
//       isVisible: sectionData.isVisible,
//       maxOccurrences: sectionData.maxOccurrences || 1
//     };
    
//     console.log("שולח נתוני סעיף לשרת:", requestData);
    
//     const response = await fetch(`${API_BASE_URL}/FormSection`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(requestData),
//     });
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Server error response:", errorText);
//       throw new Error(`שגיאה ביצירת סעיף: ${errorText}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error creating section:', error);
//     throw error;
//   }
// }

// // יצירת שדה בסעיף
// export async function createSectionField(fieldData) {
//   try {
//     const requestData = {
//       fieldID: 0,
//       sectionID: fieldData.sectionID,
//       fieldName: fieldData.fieldName,
//       fieldLabel: fieldData.fieldLabel,
//       fieldType: fieldData.fieldType,
//       isRequired: fieldData.isRequired,
//       defaultValue: fieldData.defaultValue || "",
//       placeholder: fieldData.placeholder || "",
//       helpText: fieldData.helpText || "",
//       orderIndex: fieldData.orderIndex,
//       isVisible: fieldData.isVisible,
//       maxLength: fieldData.maxLength,
//       minValue: fieldData.minValue,
//       maxValue: fieldData.maxValue,
//       scoreCalculationRule: fieldData.scoreCalculationRule,
//       isActive: fieldData.isActive
//     };
    
//     console.log("שולח נתוני שדה לשרת:", requestData);
    
//     const response = await fetch(`${API_BASE_URL}/SectionField`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(requestData),
//     });
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Server error response:", errorText);
//       throw new Error(`שגיאה ביצירת שדה: ${errorText}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error creating field:', error);
//     throw error;
//   }
// }

// // יצירת אפשרות לשדה
// export async function createFieldOption(optionData) {
//   try {
//     const requestData = {
//       optionID: 0,
//       fieldID: optionData.fieldID,
//       optionValue: optionData.optionValue,
//       optionLabel: optionData.optionLabel,
//       scoreValue: optionData.scoreValue,
//       orderIndex: optionData.orderIndex,
//       isDefault: optionData.isDefault
//     };
    
//     console.log("שולח נתוני אפשרות לשרת:", requestData);
    
//     const response = await fetch(`${API_BASE_URL}/FieldOptions`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(requestData),
//     });
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Server error response:", errorText);
//       throw new Error(`שגיאה ביצירת אפשרות לשדה: ${errorText}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error creating field option:', error);
//     throw error;
//   }
// }

// // קבלת רשימת המחלקות
// export async function getDepartments() {
//   try {
//     const response = await fetch(`${API_BASE_URL}/Department`);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`שגיאה בקבלת נתוני המחלקות: ${errorText}`);
//     }
    
//     const data = await response.json(); 
//     console.log("נתוני מחלקות:", data);
//     return data;
//   } catch (error) {
//     console.error('Error getting Departments:', error);
//     throw error;
//   }
// }

// // קבלת רשימת המשתמשים
// export async function getUsers() {
//   try {
//     const response = await fetch(`${API_BASE_URL}/Person`);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`שגיאה בקבלת נתוני המשתמשים: ${errorText}`);
//     }
    
//     const data = await response.json(); 
//     return data;
//   } catch (error) {
//     console.error('Error getting Users:', error);
//     throw error;
//   }
// }

// // קבלת טופס לפי מזהה
// export async function getForm(formId) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/Form/${formId}`);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`שגיאה בקבלת נתוני הטופס: ${errorText}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error getting form:', error);
//     throw error;
//   }
// }

// // עדכון טופס קיים
// export async function updateForm(formId, formData) {
//   try {
//     const currentUser = JSON.parse(localStorage.getItem("currentUser"));
//     const currentUserId = currentUser?.personId;
    
//     const requestData = {
//       formID: formId,
//       formName: formData.formName,
//       dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
//       description: formData.description || "",
//       instructions: formData.instructions || "",
//       academicYear: formData.academicYear || "",
//       semester: formData.semester && formData.semester.length > 0 ? formData.semester.charAt(0) : null,
//       startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
//       lastModifiedBy: currentUserId,
//       lastModifiedDate: new Date().toISOString(),
//       isActive: formData.isActive !== undefined ? formData.isActive : true,
//       isPublished: formData.isPublished !== undefined ? formData.isPublished : false
//     };
    
//     const response = await fetch(`${API_BASE_URL}/Form/${formId}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(requestData),
//     });
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`שגיאה בעדכון הטופס: ${errorText}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error updating form:', error);
//     throw error;
//   }
// }

// // בדיקת תקינות הטופס
// export async function validateForm(formId) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/Form/validate/${formId}`);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`שגיאה בבדיקת תקינות הטופס: ${errorText}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error validating form:', error);
//     throw error;
//   }
// }