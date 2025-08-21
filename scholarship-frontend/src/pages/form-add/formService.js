// // src/pages/form-add/formService.js

// const API_BASE_URL = 'https://localhost:7230/api';

// // Helper function to get current user
// const getCurrentUser = () => {
//   try {
//     return JSON.parse(localStorage.getItem("currentUser"));
//   } catch (error) {
//     console.error("Error getting current user:", error);
//     return null;
//   }
// };

// // Helper function to get auth headers
// const getAuthHeaders = () => {
//   const token = localStorage.getItem("token");
//   return {
//     'Content-Type': 'application/json',
//     ...(token && { 'Authorization': `Bearer ${token}` })
//   };
// };

// // Helper function to handle API errors
// const handleApiError = async (response) => {
//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(errorText || `HTTP Error ${response.status}`);
//   }
//   return response;
// };

// // ===============================
// // FORM OPERATIONS
// // ===============================

// // Create new form with complete structure
// export async function createFormWithStructure(formData, sections, publish = false) {
//   try {
//     const currentUser = getCurrentUser();
//     const currentUserId = currentUser?.personId;
    
//     if (!currentUserId) {
//       throw new Error("לא נמצאו פרטי משתמש מחובר. נא להתחבר מחדש למערכת.");
//     }
    
//     console.log("Creating form with data:", { formData, sections, publish });
    
//     // Step 1: Create the basic form - בהתאמה למודל Form בשרת
//     const formPayload = {
//       FormID: 0,  // שינוי: רכיב הוא עם אות גדולה כמו בשרת
//       FormName: formData.formName,
//       CreationDate: new Date().toISOString(),
//       DueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
//       Description: formData.description || "",
//       Instructions: formData.instructions || "",
//       AcademicYear: formData.academicYear || "",
//       Semester: formData.semester && formData.semester.length > 0 ? formData.semester.charAt(0) : null,
//       StartDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
//       CreatedBy: currentUserId,
//       LastModifiedBy: currentUserId,
//       LastModifiedDate: new Date().toISOString(),
//       IsActive: formData.isActive !== undefined ? formData.isActive : true,
//       IsPublished: publish
//     };
    
//     const formResponse = await fetch(`${API_BASE_URL}/Form`, {
//       method: 'POST',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(formPayload)
//     });
    
//     await handleApiError(formResponse);
//     const formResult = await formResponse.json();
//     const formId = formResult.formID; // חזר למזהה הקטן כמו ב-response
    
//     console.log("Form created with ID:", formId);
    
//     // Step 2: Create sections and their complete structure
//     for (let i = 0; i < sections.length; i++) {
//       const section = sections[i];
      
//       // Create main section - בהתאמה למודל FormSection
//       const sectionPayload = {
//         SectionID: 0,
//         FormId: formId, // שינוי: זה התחתון כמו בשרת
//         ParentSectionID: null,
//         Level: 0,
//         OrderIndex: i + 1,
//         Title: section.title,
//         Description: section.description || "",
//         Explanation: section.explanation || "",
//         MaxPoints: parseFloat(section.maxPoints) || 0,
//         ResponsibleEntity: section.responsibleEntity || null,
//         ResponsiblePerson: section.responsiblePerson || null, // לא currentUserId כברירת מחדל
//         IsRequired: section.isRequired || false,
//         IsVisible: section.isVisible !== false,
//         MaxOccurrences: section.maxOccurrences || 1
//       };
      
//       const sectionResponse = await fetch(`${API_BASE_URL}/FormSection`, {
//         method: 'POST',
//         headers: getAuthHeaders(),
//         body: JSON.stringify(sectionPayload)
//       });
      
//       await handleApiError(sectionResponse);
//       const sectionResult = await sectionResponse.json();
//       const sectionId = sectionResult.sectionID;
      
//       console.log("Section created with ID:", sectionId);

//       // Step 3: Create fields for main section
//       await createFieldsForSection(sectionId, section.fields);
      
//       // Step 4: Create sub-sections with their fields
//       if (section.subSections && section.subSections.length > 0) {
//         for (let j = 0; j < section.subSections.length; j++) {
//           const subSection = section.subSections[j];
          
//           const subSectionPayload = {
//             SectionID: 0,
//             FormId: formId,
//             ParentSectionID: sectionId,
//             Level: 1,
//             OrderIndex: j + 1,
//             Title: subSection.title,
//             Description: subSection.description || "",
//             Explanation: subSection.explanation || "",
//             MaxPoints: parseFloat(subSection.maxPoints) || 0,
//             ResponsibleEntity: subSection.responsibleEntity || section.responsibleEntity,
//             ResponsiblePerson: subSection.responsiblePerson || section.responsiblePerson,
//             IsRequired: subSection.isRequired || false,
//             IsVisible: subSection.isVisible !== false,
//             MaxOccurrences: subSection.maxOccurrences || 1
//           };
          
//           const subSectionResponse = await fetch(`${API_BASE_URL}/FormSection`, {
//             method: 'POST',
//             headers: getAuthHeaders(),
//             body: JSON.stringify(subSectionPayload)
//           });
          
//           await handleApiError(subSectionResponse);
//           const subSectionResult = await subSectionResponse.json();
//           const subSectionId = subSectionResult.sectionID;
          
//           console.log("Sub-section created with ID:", subSectionId);
          
//           // Create fields for sub-section
//           await createFieldsForSection(subSectionId, subSection.fields);
//         }
//       }
//     }
    
//     // Step 5: Publish form if requested
//     if (publish) {
//       await publishForm(formId);
//     }
    
//     return { formID: formId, success: true };
    
//   } catch (error) {
//     console.error("Error creating form with structure:", error);
//     throw error;
//   }
// }

// // Helper function to create fields for any section (main or sub)
// async function createFieldsForSection(sectionId, fields) {
//   if (!fields || fields.length === 0) return;
  
//   for (let j = 0; j < fields.length; j++) {
//     const field = fields[j];
    
//     // שינוי: התאמה למודל SectionField עם אותיות גדולות
//     const fieldPayload = {
//       FieldID: 0,
//       SectionID: sectionId,
//       FieldName: field.fieldName || `field_${Date.now()}_${j}`,
//       FieldLabel: field.fieldLabel,
//       FieldType: field.fieldType,
//       IsRequired: field.isRequired || false,
//       DefaultValue: field.defaultValue || "",
//       Placeholder: field.placeholder || "",
//       HelpText: field.helpText || "",
//       OrderIndex: j + 1,
//       IsVisible: field.isVisible !== false,
//       MaxLength: field.maxLength || null,
//       MinValue: field.minValue || null,
//       MaxValue: field.maxValue || null,
//       ScoreCalculationRule: field.scoreCalculationRule || null,
//       IsActive: field.isActive !== false
//     };
    
//     const fieldResponse = await fetch(`${API_BASE_URL}/SectionField`, {
//       method: 'POST',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(fieldPayload)
//     });
    
//     await handleApiError(fieldResponse);
//     const fieldResult = await fieldResponse.json();
//     const fieldId = fieldResult.fieldID;
    
//     console.log("Field created with ID:", fieldId);
    
//     // Create field options if needed
//     if (['select', 'radio', 'checkbox'].includes(field.fieldType) && 
//         field.options && field.options.length > 0) {
      
//       for (let k = 0; k < field.options.length; k++) {
//         const option = field.options[k];
        
//         // שינוי: התאמה למודל FieldOption עם אותיות גדולות
//         const optionPayload = {
//           OptionID: 0,
//           FieldID: fieldId,
//           OptionValue: option.optionValue || `option_${k + 1}`,
//           OptionLabel: option.optionLabel,
//           ScoreValue: parseFloat(option.scoreValue) || 0,
//           OrderIndex: k + 1,
//           IsDefault: option.isDefault || false
//         };
        
//         // שינוי: נתיב הנכון לפי ה-controller שלך
//         const optionResponse = await fetch(`${API_BASE_URL}/SectionField/options`, {
//           method: 'POST',
//           headers: getAuthHeaders(),
//           body: JSON.stringify(optionPayload)
//         });
        
//         await handleApiError(optionResponse);
//         console.log("Option created for field:", fieldId);
//       }
//     }
//   }
// }

// // Create basic form
// export async function createForm(formData) {
//   try {
//     const currentUser = getCurrentUser();
//     const currentUserId = currentUser?.personId;
    
//     // שינוי: התאמה למודל Form עם אותיות גדולות
//     const requestData = {
//       FormID: 0,
//       FormName: formData.formName,
//       CreationDate: new Date().toISOString(),
//       DueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
//       Description: formData.description || "",
//       Instructions: formData.instructions || "",
//       AcademicYear: formData.academicYear || "",
//       Semester: formData.semester && formData.semester.length > 0 ? formData.semester.charAt(0) : null,
//       StartDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
//       CreatedBy: currentUserId,
//       LastModifiedBy: currentUserId,
//       LastModifiedDate: new Date().toISOString(),
//       IsActive: formData.isActive !== undefined ? formData.isActive : true,
//       IsPublished: formData.isPublished !== undefined ? formData.isPublished : false
//     };
    
//     console.log("Creating form:", requestData);
    
//     const response = await fetch(`${API_BASE_URL}/Form`, {
//       method: 'POST',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(requestData)
//     });
    
//     await handleApiError(response);
//     return await response.json();
    
//   } catch (error) {
//     console.error("Error creating form:", error);
//     throw error;
//   }
// }

// // Publish form
// export async function publishForm(formId) {
//   try {
//     const currentUser = getCurrentUser();
//     const currentUserId = currentUser?.personId;
    
//     // שינוי: הסגן של הקריאה לפי הקונטרולר שלך
//     const response = await fetch(`${API_BASE_URL}/Form/${formId}/publish`, {
//       method: 'POST',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(currentUserId) // הגוף הוא רק ה-userId כמחרוזת
//     });
    
//     await handleApiError(response);
//     return await response.json();
    
//   } catch (error) {
//     console.error('Error publishing form:', error);
//     throw error;
//   }
// }

// // Get form by ID
// export async function getForm(formId) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/Form/${formId}`, {
//       headers: getAuthHeaders()
//     });
    
//     await handleApiError(response);
//     return await response.json();
    
//   } catch (error) {
//     console.error('Error getting form:', error);
//     throw error;
//   }
// }

// // Get form structure for editing
// export async function getFormStructure(formId) {
//   try {
//     console.log(`Getting structure for form ${formId}`);
    
//     // Step 1: קבלת המבנה הראשי מה-API
//     const structureResponse = await fetch(`${API_BASE_URL}/Form/${formId}/structure`, {
//       headers: getAuthHeaders()
//     });
    
//     if (!structureResponse.ok) {
//       // נסה דרך אלטרנטיבית
//       console.warn("Structure endpoint failed, trying alternative");
//       return await getFormStructureAlternative(formId);
//     }
    
//     const structure = await structureResponse.json();
    
//     // Step 2: המרת המבנה למערך
//     let sections = [];
//     if (Array.isArray(structure)) {
//       sections = structure;
//     } else if (structure.formSections && Array.isArray(structure.formSections)) {
//       sections = structure.formSections;
//     } else if (typeof structure === 'object') {
//       // אם זה מילון של סעיפים
//       for (const key in structure) {
//         if (Array.isArray(structure[key])) {
//           sections = sections.concat(structure[key]);
//         }
//       }
//     }
    
//     // Step 3: קבלת שדות לכל סעיף
//     for (let section of sections) {
//       try {
//         const fieldsResponse = await fetch(`${API_BASE_URL}/FormSection/${section.sectionID}/fields`, {
//           headers: getAuthHeaders()
//         });
        
//         if (fieldsResponse.ok) {
//           section.fields = await fieldsResponse.json();
          
//           // Step 4: קבלת אפשרויות לכל שדה
//           for (let field of section.fields) {
//             try {
//               const optionsResponse = await fetch(`${API_BASE_URL}/SectionField/${field.fieldID}/options`, {
//                 headers: getAuthHeaders()
//               });
              
//               if (optionsResponse.ok) {
//                 field.options = await optionsResponse.json();
//               } else {
//                 field.options = [];
//               }
//             } catch (err) {
//               console.warn(`Could not fetch options for field ${field.fieldID}:`, err);
//               field.options = [];
//             }
//           }
//         } else {
//           section.fields = [];
//         }
//       } catch (err) {
//         console.warn(`Could not fetch fields for section ${section.sectionID}:`, err);
//         section.fields = [];
//       }
//     }
    
//     return sections;
    
//   } catch (error) {
//     console.error("Error getting form structure:", error);
//     return [];
//   }
// }

// // Alternative method to get form structure
// async function getFormStructureAlternative(formId) {
//   try {
//     // ננסה לקבל סעיפים ישירות מהטופס
//     const sectionsResponse = await fetch(`${API_BASE_URL}/FormSection/form/${formId}`, {
//       headers: getAuthHeaders()
//     });
    
//     if (sectionsResponse.ok) {
//       const sections = await sectionsResponse.json();
//       return sections;
//     }
    
//     console.warn("Could not fetch form structure");
//     return [];
    
//   } catch (error) {
//     console.warn("Alternative structure fetch failed:", error);
//     return [];
//   }
// }

// // Update form with complete structure (for edit mode)
// export async function updateFormWithStructure(formId, formData, sections, publish = false) {
//   try {
//     const currentUser = getCurrentUser();
//     const currentUserId = currentUser?.personId;
    
//     if (!currentUserId) {
//       throw new Error("לא נמצאו פרטי משתמש מחובר. נא להתחבר מחדש למערכת.");
//     }
    
//     console.log("Updating form with data:", { formId, formData, sections, publish });
    
//     // Step 1: עדכון הטופס הבסיסי
//     const formPayload = {
//       FormID: formId,
//       FormName: formData.formName,
//       DueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
//       Description: formData.description || "",
//       Instructions: formData.instructions || "",
//       AcademicYear: formData.academicYear || "",
//       CreatedBy: formData.createdBy || currentUserId,
//       CreationDate: formData.creationDate || new Date().toISOString(),
//       Semester: formData.semester && formData.semester.length > 0 ? formData.semester.charAt(0) : null,
//       StartDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
//       LastModifiedBy: currentUserId,
//       LastModifiedDate: new Date().toISOString(),
//       IsActive: formData.isActive !== undefined ? formData.isActive : true,
//       IsPublished: publish
//     };
    
//     const formResponse = await fetch(`${API_BASE_URL}/Form/${formId}`, {
//       method: 'PUT',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(formPayload)
//     });
    
//     await handleApiError(formResponse);
//     console.log("Form metadata updated");
    
//     // Step 2: מחיקה של מבנה קיים ויצירה מחדש
//     console.log("Getting existing structure for deletion...");
//     const existingStructure = await getFormStructure(formId);
    
//     // Step 3: מחיקת המבנה הקיים עם cascading delete
//     await deleteFormStructureCascading(existingStructure);
    
//     // Step 4: יצירת המבנה החדש
//     console.log("Creating new structure...");
//     await createFormStructureFromSections(formId, sections, currentUserId);
    
//     return { formID: formId, success: true };
    
//   } catch (error) {
//     console.error("Error updating form with structure:", error);
//     throw error;
//   }
// }

// // Cascading delete of form structure
// async function deleteFormStructureCascading(sections) {
//   console.log("Starting cascading delete...");
  
//   if (!sections || sections.length === 0) {
//     console.log("No sections to delete");
//     return;
//   }
  
//   // מיון הסעיפים - תחילה תתי-סעיפים ואז ראשיים
//   const sortedSections = sections.sort((a, b) => (b.level || 0) - (a.level || 0));
  
//   for (let section of sortedSections) {
//     try {
//       console.log(`Deleting section ${section.sectionID}...`);
      
//       // מחיקת אפשרויות שדות
//       if (section.fields && section.fields.length > 0) {
//         for (let field of section.fields) {
//           if (field.options && field.options.length > 0) {
//             for (let option of field.options) {
//               try {
//                 await fetch(`${API_BASE_URL}/SectionField/options/${option.optionID}`, {
//                   method: 'DELETE',
//                   headers: getAuthHeaders()
//                 });
//                 console.log(`Deleted field option ${option.optionID}`);
//               } catch (err) {
//                 console.warn(`Could not delete field option ${option.optionID}:`, err.message);
//               }
//             }
//           }
          
//           // מחיקת השדה
//           try {
//             await fetch(`${API_BASE_URL}/SectionField/${field.fieldID}`, {
//               method: 'DELETE',
//               headers: getAuthHeaders()
//             });
//             console.log(`Deleted field ${field.fieldID}`);
//           } catch (err) {
//             console.warn(`Could not delete field ${field.fieldID}:`, err.message);
//           }
//         }
//       }
      
//       // מחיקת הסעיף עצמו
//       try {
//         await fetch(`${API_BASE_URL}/FormSection/${section.sectionID}`, {
//           method: 'DELETE',
//           headers: getAuthHeaders()
//         });
//         console.log(`Deleted section ${section.sectionID}`);
//       } catch (err) {
//         console.warn(`Could not delete section ${section.sectionID}:`, err.message);
//       }
      
//     } catch (err) {
//       console.error(`Error deleting section ${section.sectionID}:`, err);
//     }
//   }
  
//   console.log("Cascading delete completed");
// }

// // Create form structure from sections array
// async function createFormStructureFromSections(formId, sections, currentUserId) {
//   for (let i = 0; i < sections.length; i++) {
//     const section = sections[i];
    
//     // יצירת סעיף ראשי
//     const sectionPayload = {
//       SectionID: 0,
//       FormId: formId,
//       ParentSectionID: null,
//       Level: 0,
//       OrderIndex: i + 1,
//       Title: section.title,
//       Description: section.description || "",
//       Explanation: section.explanation || "",
//       MaxPoints: parseFloat(section.maxPoints) || 0,
//       ResponsibleEntity: section.responsibleEntity || null,
//       ResponsiblePerson: section.responsiblePerson || null,
//       IsRequired: section.isRequired || false,
//       IsVisible: section.isVisible !== false,
//       MaxOccurrences: section.maxOccurrences || 1
//     };
    
//     const sectionResponse = await fetch(`${API_BASE_URL}/FormSection`, {
//       method: 'POST',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(sectionPayload)
//     });
    
//     await handleApiError(sectionResponse);
//     const sectionResult = await sectionResponse.json();
//     const sectionId = sectionResult.sectionID;
    
//     console.log("Created section with ID:", sectionId);
    
//     // יצירת שדות לסעיף הראשי
//     if (section.fields && section.fields.length > 0) {
//       await createFieldsForSection(sectionId, section.fields);
//     }
    
//     // יצירת תתי-סעיפים
//     if (section.subSections && section.subSections.length > 0) {
//       for (let j = 0; j < section.subSections.length; j++) {
//         const subSection = section.subSections[j];
        
//         const subSectionPayload = {
//           SectionID: 0,
//           FormId: formId,
//           ParentSectionID: sectionId,
//           Level: 1,
//           OrderIndex: j + 1,
//           Title: subSection.title,
//           Description: subSection.description || "",
//           Explanation: subSection.explanation || "",
//           MaxPoints: parseFloat(subSection.maxPoints) || 0,
//           ResponsibleEntity: subSection.responsibleEntity || section.responsibleEntity,
//           ResponsiblePerson: subSection.responsiblePerson || section.responsiblePerson,
//           IsRequired: subSection.isRequired || false,
//           IsVisible: subSection.isVisible !== false,
//           MaxOccurrences: subSection.maxOccurrences || 1
//         };
        
//         const subSectionResponse = await fetch(`${API_BASE_URL}/FormSection`, {
//           method: 'POST',
//           headers: getAuthHeaders(),
//           body: JSON.stringify(subSectionPayload)
//         });
        
//         await handleApiError(subSectionResponse);
//         const subSectionResult = await subSectionResponse.json();
//         const subSectionId = subSectionResult.sectionID;
        
//         console.log("Created sub-section with ID:", subSectionId);
        
//         // יצירת שדות לתת-סעיף
//         if (subSection.fields && subSection.fields.length > 0) {
//           await createFieldsForSection(subSectionId, subSection.fields);
//         }
//       }
//     }
//   }
// }

// // ===============================
// // INDIVIDUAL OPERATIONS
// // ===============================

// // Create form section
// export async function createFormSection(sectionData) {
//   try {
//     const requestData = {
//       SectionID: 0,
//       FormId: sectionData.formId,
//       ParentSectionID: sectionData.parentSectionID,
//       Level: sectionData.level,
//       OrderIndex: sectionData.orderIndex,
//       Title: sectionData.title,
//       Description: sectionData.description || "",
//       Explanation: sectionData.explanation || "",
//       MaxPoints: sectionData.maxPoints,
//       ResponsibleEntity: sectionData.responsibleEntity,
//       ResponsiblePerson: sectionData.responsiblePerson,
//       IsRequired: sectionData.isRequired,
//       IsVisible: sectionData.isVisible,
//       MaxOccurrences: sectionData.maxOccurrences || 1
//     };
    
//     console.log("Creating section:", requestData);
    
//     const response = await fetch(`${API_BASE_URL}/FormSection`, {
//       method: 'POST',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(requestData)
//     });
    
//     await handleApiError(response);
//     return await response.json();
    
//   } catch (error) {
//     console.error('Error creating section:', error);
//     throw error;
//   }
// }

// // Create section field
// export async function createSectionField(fieldData) {
//   try {
//     const requestData = {
//       FieldID: 0,
//       SectionID: fieldData.sectionID,
//       FieldName: fieldData.fieldName,
//       FieldLabel: fieldData.fieldLabel,
//       FieldType: fieldData.fieldType,
//       IsRequired: fieldData.isRequired,
//       DefaultValue: fieldData.defaultValue || "",
//       Placeholder: fieldData.placeholder || "",
//       HelpText: fieldData.helpText || "",
//       OrderIndex: fieldData.orderIndex,
//       IsVisible: fieldData.isVisible,
//       MaxLength: fieldData.maxLength,
//       MinValue: fieldData.minValue,
//       MaxValue: fieldData.maxValue,
//       ScoreCalculationRule: fieldData.scoreCalculationRule,
//       IsActive: fieldData.isActive
//     };
    
//     console.log("Creating field:", requestData);
    
//     const response = await fetch(`${API_BASE_URL}/SectionField`, {
//       method: 'POST',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(requestData)
//     });
    
//     await handleApiError(response);
//     return await response.json();
    
//   } catch (error) {
//     console.error('Error creating field:', error);
//     throw error;
//   }
// }

// // Create field option
// export async function createFieldOption(optionData) {
//   try {
//     const requestData = {
//       OptionID: 0,
//       FieldID: optionData.fieldID,
//       OptionValue: optionData.optionValue,
//       OptionLabel: optionData.optionLabel,
//       ScoreValue: optionData.scoreValue,
//       OrderIndex: optionData.orderIndex,
//       IsDefault: optionData.isDefault
//     };
    
//     console.log("Creating field option:", requestData);
    
//     const response = await fetch(`${API_BASE_URL}/SectionField/options`, {
//       method: 'POST',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(requestData)
//     });
    
//     await handleApiError(response);
//     return await response.json();
    
//   } catch (error) {
//     console.error('Error creating field option:', error);
//     throw error;
//   }
// }

// // ===============================
// // SUPPORTING DATA
// // ===============================

// // Get departments
// export async function getDepartments() {
//   try {
//     const response = await fetch(`${API_BASE_URL}/Department`, {
//       headers: getAuthHeaders()
//     });
    
//     await handleApiError(response);
//     const data = await response.json();
//     console.log("Departments loaded:", data);
//     return data;
    
//   } catch (error) {
//     console.error('Error getting departments:', error);
//     throw error;
//   }
// }

// // Get users
// export async function getUsers() {
//   try {
//     const response = await fetch(`${API_BASE_URL}/Person`, {
//       headers: getAuthHeaders()
//     });
    
//     await handleApiError(response);
//     const data = await response.json();
//     console.log("Users loaded:", data);
//     return data;
    
//   } catch (error) {
//     console.error('Error getting users:', error);
//     throw error;
//   }
// }

// // ===============================
// // VALIDATION
// // ===============================

// // Validate form
// export async function validateForm(formId) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/Form/validate/${formId}`, {
//       headers: getAuthHeaders()
//     });
    
//     await handleApiError(response);
//     return await response.json();
    
//   } catch (error) {
//     console.error('Error validating form:', error);
//     throw error;
//   }
// }