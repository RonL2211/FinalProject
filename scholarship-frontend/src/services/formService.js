// src/services/formService.js - תיקון סופי עם CreatedBy ותתי-סעיפים
import { api } from './api';
import Swal from 'sweetalert2';
import { getCurrentUser } from './authService';

export const formService = {
  // קבלת כל הטפסים
  getAllForms: async () => {
    try {
      const response = await api.get('/Form');
      return response.data;
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת טפסים');
    }
  },

  // קבלת טופס לפי מזהה
  getFormById: async (id) => {
    try {
      const response = await api.get(`/Form/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching form:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת הטופס');
    }
  },

  // קבלת מבנה טופס עם היררכיה
  getFormStructure: async (formId) => {
    try {
      const response = await api.get(`/FormSection/form/${formId}`);
      let sections = response.data;
      
      // טעינת שדות לכל סעיף
      const sectionsWithFields = await Promise.all(
        (sections || []).map(async (section) => {
          try {
            const fieldsResponse = await api.get(`/FormSection/${section.sectionID}/fields`);
            return {
              ...section,
              fields: fieldsResponse.data || []
            };
          } catch (err) {
            console.warn(`Could not load fields for section ${section.sectionID}`);
            return {
              ...section,
              fields: []
            };
          }
        })
      );
      
      console.log('All sections from server:', sectionsWithFields);
      
      // ארגון היררכי - רק אם צריך
      const hasSubSections = sectionsWithFields.some(s => s.parentSectionID && s.parentSectionID > 0);
      
      if (!hasSubSections) {
        // אין תתי-סעיפים, החזר כמו שזה
        return sectionsWithFields.map(s => ({
          ...s,
          subSections: s.subSections || []
        }));
      }
      
      // יש תתי-סעיפים - ארגן היררכיה
      const mainSections = [];
      const subSectionsByParent = {};
      
      sectionsWithFields.forEach(section => {
        if (!section.parentSectionID || section.parentSectionID === 0) {
          mainSections.push({
            ...section,
            subSections: []
          });
        } else {
          if (!subSectionsByParent[section.parentSectionID]) {
            subSectionsByParent[section.parentSectionID] = [];
          }
          subSectionsByParent[section.parentSectionID].push(section);
        }
      });
      
      // חבר תתי-סעיפים להורים שלהם
      mainSections.forEach(mainSection => {
        if (subSectionsByParent[mainSection.sectionID]) {
          mainSection.subSections = subSectionsByParent[mainSection.sectionID];
        }
      });
      
      return mainSections;
    } catch (error) {
      console.error('Error fetching form structure:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת מבנה הטופס');
    }
  },

  // יצירת טופס חדש - תיקון! שליחת CreatedBy ו-LastModifiedBy עם ערכים דמיים
  createForm: async (formData) => {
    try {
      const currentUser = getCurrentUser();
      
      // הכן את הנתונים - כולל CreatedBy ו-LastModifiedBy עם ערכים דמיים שיוחלפו בשרת
      const requestData = {
        formName: formData.formName,
        description: formData.description || '',
        instructions: formData.instructions || '',
        academicYear: String(formData.academicYear),
        semester: formData.semester?.charAt(0) || 'A',
        startDate: formData.startDate || null,
        dueDate: formData.dueDate || null,
        createdBy: 'PLACEHOLDER', // ערך דמי - יוחלף בשרת
        lastModifiedBy: 'PLACEHOLDER', // ערך דמי - יוחלף בשרת
        isActive: true,
        isPublished: false
      };

      console.log('Creating form with data:', requestData);

      const response = await api.post('/Form', requestData);
      
      if (response.data) {
        return {
          formID: response.data.formID || response.data.FormID || response.data.id,
          ...response.data
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating form:', error);
      
      // טיפול בשגיאות ספציפיות
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        throw new Error(errorMessages.join(', '));
      }
      
      throw new Error(error.response?.data?.message || 'שגיאה ביצירת הטופס');
    }
  },

  // יצירת סעיף עם תמיכה בתתי-סעיפים
  createSection: async (sectionData) => {
    try {
      const currentUser = getCurrentUser();
      
      const requestData = {
        formId: sectionData.formId,
        parentSectionID: sectionData.parentSectionID || null, // תמיכה בתתי-סעיפים!
        level: sectionData.level || (sectionData.parentSectionID ? 2 : 1), // קביעת רמה אוטומטית
        orderIndex: sectionData.orderIndex || 1,
        title: sectionData.title,
        description: sectionData.description || '',
        explanation: sectionData.explanation || '',
        maxPoints: sectionData.maxPoints || null,
        responsibleEntity: sectionData.responsibleEntity || null,
        responsiblePerson: sectionData.responsiblePerson || currentUser?.personId || 'PLACEHOLDER', // ערך דמי אם אין משתמש
        isRequired: sectionData.isRequired || false,
        isVisible: sectionData.isVisible !== false,
        maxOccurrences: sectionData.maxOccurrences || 1
      };

      const response = await api.post('/FormSection', requestData);
      return {
        sectionID: response.data.sectionID || response.data.SectionID || response.data.id,
        ...response.data
      };
    } catch (error) {
      console.error('Error creating section:', error);
      throw new Error(error.response?.data?.message || 'שגיאה ביצירת סעיף');
    }
  },

  // יצירת שדה
  createField: async (fieldData) => {
    try {
      const requestData = {
        sectionID: fieldData.sectionID,
        fieldName: fieldData.fieldName || fieldData.fieldLabel.replace(/\s+/g, '_'),
        fieldLabel: fieldData.fieldLabel,
        fieldType: fieldData.fieldType,
        isRequired: fieldData.isRequired || false,
        defaultValue: fieldData.defaultValue || '', // ערך ריק במקום null
        placeholder: fieldData.placeholder || '', // ערך ריק במקום null
        helpText: fieldData.helpText || '', // ערך ריק במקום null
        orderIndex: fieldData.orderIndex || 1,
        isVisible: fieldData.isVisible !== false,
        maxLength: fieldData.maxLength || null,
        minValue: fieldData.minValue || null,
        maxValue: fieldData.maxValue || null,
        validationRegex: fieldData.validationRegex || null
      };

      const response = await api.post('/SectionField', requestData);
      return {
        fieldID: response.data.fieldID || response.data.FieldID || response.data.id,
        ...response.data
      };
    } catch (error) {
      console.error('Error creating field:', error);
      throw new Error(error.response?.data?.message || 'שגיאה ביצירת שדה');
    }
  },

  // יצירת אפשרות לשדה
  createFieldOption: async (optionData) => {
    try {
      const requestData = {
        fieldID: optionData.fieldID,
        optionValue: optionData.optionValue || optionData.optionLabel,
        optionLabel: optionData.optionLabel,
        scoreValue: optionData.scoreValue || null,
        orderIndex: optionData.orderIndex || 1,
        isDefault: optionData.isDefault || false
      };

      const response = await api.post('/SectionField/options', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating field option:', error);
      throw new Error(error.response?.data?.message || 'שגיאה ביצירת אפשרות');
    }
  },

  // עדכון טופס - גם כאן נשלח LastModifiedBy דמי
  updateForm: async (id, formData) => {
    try {
      const requestData = {
        formID: id,
        formName: formData.formName,
        description: formData.description || '',
        instructions: formData.instructions || '',
        academicYear: String(formData.academicYear),
        semester: formData.semester?.charAt(0) || 'A',
        startDate: formData.startDate || null,
        dueDate: formData.dueDate || null,
        createdBy: formData.createdBy || 'PLACEHOLDER', // שמור על הערך המקורי או דמי
        lastModifiedBy: 'PLACEHOLDER', // ערך דמי - יוחלף בשרת
        isActive: formData.isActive !== false,
        isPublished: formData.isPublished || false
      };

      const response = await api.put(`/Form/${id}`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error updating form:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בעדכון הטופס');
    }
  },

  // פרסום טופס
  publishForm: async (id) => {
    try {
      console.log(id, 'Publishing form...');
      const response = await api.post(`/Form/${id}/publish`);
      console.log('Form published successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error publishing form:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בפרסום הטופס');
    }
  },

  // פונקציה מתקדמת ליצירת טופס מלא עם היררכיה
  createCompleteForm: async (formData, sectionsHierarchy) => {
    try {
      const currentUser = getCurrentUser();
      
      // שלב 1: יצירת הטופס
      const formResult = await formService.createForm(formData);
      
      if (!formResult || !formResult.formID) {
        throw new Error('Failed to create form');
      }

      const formId = formResult.formID;
      const sectionIdMapping = {}; // מיפוי ID זמני ל-ID אמיתי

      // שלב 2: יצירת סעיפים ראשיים ותתי-סעיפים
      for (const mainSection of sectionsHierarchy) {
        try {
          // יצירת סעיף ראשי
          const mainSectionData = {
            formId: formId,
            title: mainSection.title,
            description: mainSection.description || '',
            explanation: mainSection.explanation || '',
            maxPoints: mainSection.maxPoints || null,
            level: 1,
            parentSectionID: null,
            orderIndex: mainSection.orderIndex,
            isRequired: mainSection.isRequired || false,
            isVisible: mainSection.isVisible !== false,
            responsibleEntity: mainSection.responsibleEntity || null,
            responsiblePerson: mainSection.responsiblePerson || currentUser?.personId || 'PLACEHOLDER',
            maxOccurrences: mainSection.maxOccurrences || 1
          };

          const mainSectionResult = await formService.createSection(mainSectionData);
          
          if (mainSectionResult && mainSectionResult.sectionID) {
            // שמור את המיפוי
            sectionIdMapping[mainSection.tempId] = mainSectionResult.sectionID;

            // יצירת שדות לסעיף הראשי
            if (mainSection.fields && mainSection.fields.length > 0) {
              await formService.createFieldsForSection(mainSectionResult.sectionID, mainSection.fields);
            }

            // יצירת תתי-סעיפים
            if (mainSection.subSections && mainSection.subSections.length > 0) {
              for (const subSection of mainSection.subSections) {
                try {
                  const subSectionData = {
                    formId: formId,
                    title: subSection.title,
                    description: subSection.description || '',
                    explanation: subSection.explanation || '',
                    maxPoints: subSection.maxPoints || null,
                    level: 2,
                    parentSectionID: mainSectionResult.sectionID, // קישור להורה!
                    orderIndex: subSection.orderIndex,
                    isRequired: subSection.isRequired || false,
                    isVisible: subSection.isVisible !== false,
                    responsibleEntity: subSection.responsibleEntity || null,
                    responsiblePerson: subSection.responsiblePerson || currentUser?.personId || 'PLACEHOLDER',
                    maxOccurrences: subSection.maxOccurrences || 1
                  };

                  const subSectionResult = await formService.createSection(subSectionData);
                  
                  // יצירת שדות לתת-סעיף
                  if (subSectionResult && subSectionResult.sectionID && subSection.fields) {
                    await formService.createFieldsForSection(subSectionResult.sectionID, subSection.fields);
                  }
                } catch (subSectionError) {
                  console.error(`Error creating subsection ${subSection.title}:`, subSectionError);
                }
              }
            }
          }
        } catch (sectionError) {
          console.error(`Error creating section ${mainSection.title}:`, sectionError);
        }
      }

      return { formID: formId, success: true };
    } catch (error) {
      console.error('Error creating complete form:', error);
      throw error;
    }
  },

  // פונקציית עזר ליצירת שדות לסעיף
  createFieldsForSection: async (sectionID, fields) => {
    for (const field of fields) {
      try {
        const fieldData = {
          sectionID: sectionID,
          fieldName: field.fieldName || field.fieldLabel.replace(/\s+/g, '_'),
          fieldLabel: field.fieldLabel,
          fieldType: field.fieldType,
          isRequired: field.isRequired || false,
          defaultValue: field.defaultValue || '', // ערך ריק במקום null
          placeholder: field.placeholder || '', // ערך ריק במקום null
          helpText: field.helpText || '', // ערך ריק במקום null
          orderIndex: field.orderIndex,
          isVisible: field.isVisible !== false,
          maxLength: field.maxLength || null,
          minValue: field.minValue || null,
          maxValue: field.maxValue || null,
          validationRegex: field.validationRegex || null
        };

        const fieldResult = await formService.createField(fieldData);

        // יצירת אפשרויות לשדה אם יש
        if (fieldResult && fieldResult.fieldID && field.options && field.options.length > 0) {
          for (const option of field.options) {
            try {
              const optionData = {
                fieldID: fieldResult.fieldID,
                optionValue: option.optionValue || option.optionLabel,
                optionLabel: option.optionLabel,
                scoreValue: option.scoreValue || null,
                orderIndex: option.orderIndex || 1,
                isDefault: option.isDefault || false
              };

              await formService.createFieldOption(optionData);
            } catch (optionError) {
              console.error(`Error creating option for field ${field.fieldLabel}:`, optionError);
            }
          }
        }
      } catch (fieldError) {
        console.error(`Error creating field ${field.fieldLabel}:`, fieldError);
      }
    }
  },

  // פונקציה מתקדמת לשמירה ופרסום עם הודעות Swal
  saveAndPublishForm: async (formData, sectionsHierarchy, publish = false) => {
    try {
      // הצג loading
      Swal.fire({
        title: publish ? 'מפרסם טופס...' : 'שומר טופס...',
        html: '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><br/>אנא המתן, יוצר טופס עם סעיפים ושדות...</div>',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // יצירת הטופס המלא
      const result = await formService.createCompleteForm(formData, sectionsHierarchy);

      // פרסום אם נדרש
      if (publish && result.formID) {
        await formService.publishForm(result.formID);
      }

      // הודעת הצלחה
      await Swal.fire({
        icon: 'success',
        title: 'הצלחה!',
        text: publish ? 'הטופס נוצר ופורסם בהצלחה!' : 'הטופס נשמר בהצלחה כטיוטה!',
        confirmButtonText: 'אישור',
        confirmButtonColor: '#28a745',
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });

      return result;

    } catch (error) {
      // הודעת שגיאה מפורטת
      console.error('Full error:', error);
      
      let errorMessage = 'אירעה שגיאה בשמירת הטופס';
      
      if (error.response?.data?.errors) {
        // אם יש שגיאות ולידציה
        const errors = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('<br/>');
        errorMessage = `<div class="text-right">${errors}</div>`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      await Swal.fire({
        icon: 'error',
        title: 'שגיאה',
        html: errorMessage,
        confirmButtonText: 'אישור',
        confirmButtonColor: '#dc3545',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
      
      throw error;
    }
  },

  // וולידציה של טופס
  validateForm: async (id) => {
    try {
      const response = await api.get(`/Form/validate/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error validating form:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בוולידציה');
    }
  },

  // פונקציות עזר לניהול סעיפים
  getSectionById: async (id) => {
    try {
      const response = await api.get(`/FormSection/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching section:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת הסעיף');
    }
  },

  getSectionFields: async (sectionId) => {
    try {
      const response = await api.get(`/FormSection/${sectionId}/fields`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching section fields:', error);
      return [];
    }
  },

  updateSection: async (id, sectionData) => {
    try {
      const currentUser = getCurrentUser();
      
      const requestData = {
        sectionID: id,
        formId: sectionData.formId,
        parentSectionID: sectionData.parentSectionID || null,
        level: sectionData.level || 1,
        orderIndex: sectionData.orderIndex || 1,
        title: sectionData.title,
        description: sectionData.description || '',
        explanation: sectionData.explanation || '',
        maxPoints: sectionData.maxPoints || null,
        responsibleEntity: sectionData.responsibleEntity || null,
        responsiblePerson: sectionData.responsiblePerson || currentUser?.personId || 'PLACEHOLDER',
        isRequired: sectionData.isRequired || false,
        isVisible: sectionData.isVisible !== false,
        maxOccurrences: sectionData.maxOccurrences || 1
      };
      
      const response = await api.put(`/FormSection/${id}`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error updating section:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בעדכון הסעיף');
    }
  },

  deleteSection: async (id) => {
    try {
      const response = await api.delete(`/FormSection/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting section:', error);
      throw new Error(error.response?.data?.message || 'שגיאה במחיקת הסעיף');
    }
  },

  // פונקציות לניהול שדות
  updateField: async (id, fieldData) => {
    try {
      const requestData = {
        fieldID: id,
        sectionID: fieldData.sectionID,
        fieldName: fieldData.fieldName || fieldData.fieldLabel.replace(/\s+/g, '_'),
        fieldLabel: fieldData.fieldLabel,
        fieldType: fieldData.fieldType,
        isRequired: fieldData.isRequired || false,
        defaultValue: fieldData.defaultValue || '',
        placeholder: fieldData.placeholder || '',
        helpText: fieldData.helpText || '',
        orderIndex: fieldData.orderIndex || 1,
        isVisible: fieldData.isVisible !== false,
        maxLength: fieldData.maxLength || null,
        minValue: fieldData.minValue || null,
        maxValue: fieldData.maxValue || null,
        validationRegex: fieldData.validationRegex || null
      };
      
      const response = await api.put(`/SectionField/${id}`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error updating field:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בעדכון השדה');
    }
  },

  deleteField: async (id) => {
    try {
      const response = await api.delete(`/SectionField/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting field:', error);
      throw new Error(error.response?.data?.message || 'שגיאה במחיקת השדה');
    }
  },

  // פונקציות לניהול אפשרויות
  deleteFieldOptions: async (fieldId) => {
    try {
      // מחיקת כל האפשרויות של השדה
      const response = await api.delete(`/SectionField/options/${fieldId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting field options:', error);
      // אם אין endpoint כזה, נמחק אחד אחד
      return null;
    }
  },

getFieldOptions:async(fieldId) =>{
  try {
    const response = await api.get(`/SectionField/${fieldId}/options`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching field options:', error);
    return [];
  }
}

};