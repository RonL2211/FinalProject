// src/pages/Manager/UnifiedFormBuilder.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Accordion, Badge, ProgressBar, Tabs, Tab } from 'react-bootstrap';
import { formService } from '../../services/formService';
import { instanceService } from '../../services/instanceService';
import Swal from 'sweetalert2';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const UnifiedFormBuilder = ({ mode = 'create' }) => {
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const isEditMode = mode === 'edit' || !!formId;
  
  // Form basic info
  const [formInfo, setFormInfo] = useState({
    formName: '',
    description: '',
    instructions: '',
    academicYear: String(new Date().getFullYear()),
    semester: 'A',
    startDate: null,
    dueDate: null,
    isActive: true,
    isPublished: false
  });

  // Form structure with hierarchy
  const [sections, setSections] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Basic, 2: Structure, 3: Preview
  
  // UI states
  const [activeTab, setActiveTab] = useState('steps');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Modals
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [selectedParentSection, setSelectedParentSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  // New section/field forms
  const [newSection, setNewSection] = useState({
    title: '',
    description: '',
    explanation: '',
    maxPoints: null,
    isRequired: false,
    isVisible: true,
    orderIndex: 1
  });

  const [newField, setNewField] = useState({
    fieldLabel: '',
    fieldType: 'Text',
    helpText: '',
    placeholder: '',
    defaultValue: '',
    isRequired: false,
    isVisible: true,
    orderIndex: 1,
    maxLength: null,
    minValue: null,
    maxValue: null,
    options: []
  });

  // Field types
  const fieldTypes = [
    { value: 'Text', label: 'טקסט קצר', icon: 'bi-input-cursor-text' },
    { value: 'TextArea', label: 'טקסט ארוך', icon: 'bi-textarea-resize' },
    { value: 'Number', label: 'מספר', icon: 'bi-123' },
    { value: 'Select', label: 'רשימה נפתחת', icon: 'bi-menu-button-wide' },
    { value: 'Radio', label: 'בחירה יחידה', icon: 'bi-record-circle' },
    { value: 'Checkbox', label: 'בחירה מרובה', icon: 'bi-check-square' },
    { value: 'Date', label: 'תאריך', icon: 'bi-calendar3' },
    { value: 'File', label: 'קובץ', icon: 'bi-file-earmark-arrow-up' }
  ];

  // Load form data if editing
  useEffect(() => {
    if (isEditMode && formId) {
      loadFormData();
    } else {
      // For new forms, start with step indicator
      setActiveTab('steps');
    }
  }, [formId, isEditMode]);

  // Track changes
  useEffect(() => {
    if (originalData) {
      const currentData = JSON.stringify({ formInfo, sections });
      const original = JSON.stringify(originalData);
      setHasChanges(currentData !== original);
    }
  }, [formInfo, sections, originalData]);

  const loadFormData = async () => {
    setLoading(true);
    try {
      // Load form basic info
      const form = await formService.getFormById(formId);
      console.log('Loaded form:', form);
      
      setFormInfo({
        formName: form.formName || '',
        description: form.description || '',
        instructions: form.instructions || '',
        academicYear: form.academicYear || String(new Date().getFullYear()),
        semester: form.semester || 'A',
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
        isActive: form.isActive !== false,
        isPublished: form.isPublished || false
      });

      // Load form structure - flat array from server
      const structure = await formService.getFormStructure(formId);
      console.log('Raw structure from server:', structure);
      
      // Organize sections with proper hierarchy
      const organizedSections = organizeSectionsHierarchy(structure);
      console.log('Organized sections:', organizedSections);
      
      setSections(organizedSections);

      // Save original data for comparison
      setOriginalData({
        formInfo: { ...form },
        sections: organizedSections
      });

      // Set to structure tab in edit mode
      setActiveTab('structure');
      setCurrentStep(2);

    } catch (err) {
      console.error('Error loading form:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to organize sections into hierarchy
  const organizeSectionsHierarchy = (flatSections) => {
    if (!flatSections || !Array.isArray(flatSections)) return [];
    
    console.log('Organizing sections:', flatSections);
    
    // אם הסעיפים כבר מגיעים עם subSections, פשוט תחזיר אותם
    const hasSubSections = flatSections.some(s => s.subSections && s.subSections.length > 0);
    
    if (hasSubSections) {
      console.log('Sections already have subSections, returning as is');
      // וודא שכל סעיף ראשי יש לו מערך subSections
      return flatSections.filter(s => !s.parentSectionID).map(section => ({
        ...section,
        subSections: section.subSections || []
      }));
    }
    
    // אם לא, ארגן אותם
    const mainSections = [];
    const subSectionsByParent = {};
    
    flatSections.forEach(section => {
      // Check if it's a subsection by looking at parentSectionID
      if (!section.parentSectionID || section.parentSectionID === 0) {
        // Main section
        mainSections.push({
          ...section,
          subSections: []
        });
      } else {
        // Subsection - group by parent ID
        const parentId = section.parentSectionID;
        if (!subSectionsByParent[parentId]) {
          subSectionsByParent[parentId] = [];
        }
        subSectionsByParent[parentId].push(section);
      }
    });
    
    // Attach subsections to their parents
    mainSections.forEach(mainSection => {
      const sectionId = mainSection.sectionID;
      if (subSectionsByParent[sectionId]) {
        mainSection.subSections = subSectionsByParent[sectionId];
        console.log(`Section ${mainSection.title} has ${subSectionsByParent[sectionId].length} subsections`);
      }
    });
    
    console.log('Final organized sections:', mainSections);
    return mainSections;
  };
// Validation functions
  const validateBasicInfo = () => {
    return !!(formInfo.formName && formInfo.description);
  };

  const validateStructure = () => {
    if (sections.length === 0) return false;
    
    // Check that all sections have at least one field
    for (const section of sections) {
      const mainFields = section.fields?.length || 0;
      const subFields = section.subSections?.reduce((sum, sub) => 
        sum + (sub.fields?.length || 0), 0) || 0;
      
      if (mainFields + subFields === 0) {
        return false;
      }
    }
    return true;
  };

  const isFormValid = () => {
    return validateBasicInfo() && validateStructure();
  };
  // Add main section
  const handleAddSection = (parentSectionId = null) => {
    const isSubSection = !!parentSectionId;
    
    setEditingSection(null);
    setSelectedParentSection(parentSectionId);
    setNewSection({
      title: '',
      description: '',
      explanation: '',
      maxPoints: null,
      isRequired: false,
      isVisible: true,
      orderIndex: isSubSection 
        ? (sections.find(s => s.tempId === parentSectionId)?.subSections?.length || 0) + 1
        : sections.length + 1
    });
    setShowSectionModal(true);
  };

  // Edit existing section
  const handleEditSection = (section, parentId = null) => {
    setEditingSection(section);
    setSelectedParentSection(parentId);
    setNewSection({
      title: section.title || '',
      description: section.description || '',
      explanation: section.explanation || '',
      maxPoints: section.maxPoints || null,
      isRequired: section.isRequired || false,
      isVisible: section.isVisible !== false,
      orderIndex: section.orderIndex || 1
    });
    setShowSectionModal(true);
  };

  // Save section (add or update)
  const saveSection = () => {
    if (!newSection.title.trim()) {
      Swal.fire('שגיאה', 'יש להזין כותרת לסעיף', 'error');
      return;
    }

    if (editingSection) {
      // Update existing section
      const updatedSections = updateSectionInHierarchy(
        sections,
        editingSection.tempId || editingSection.sectionID,
        newSection
      );
      setSections(updatedSections);
    } else {
      // Add new section
      if (selectedParentSection) {
        // Add as subsection
        const parentIndex = sections.findIndex(s => 
          s.tempId === selectedParentSection || s.sectionID === selectedParentSection
        );
        
        if (parentIndex !== -1) {
          const newSubSection = {
            tempId: `subsection_${Date.now()}`,
            ...newSection,
            level: 2,
            fields: []
          };
          
          const updatedSections = [...sections];
          if (!updatedSections[parentIndex].subSections) {
            updatedSections[parentIndex].subSections = [];
          }
          updatedSections[parentIndex].subSections.push(newSubSection);
          setSections(updatedSections);
        }
      } else {
        // Add as main section
        const newMainSection = {
          tempId: `section_${Date.now()}`,
          ...newSection,
          level: 1,
          parentSectionID: null,
          fields: [],
          subSections: []
        };
        setSections([...sections, newMainSection]);
      }
    }

    setShowSectionModal(false);
    resetSectionForm();
  };

  // Delete section
  const handleDeleteSection = (sectionId, parentId = null) => {
    Swal.fire({
      title: 'האם אתה בטוח?',
      text: 'מחיקת הסעיף תמחק גם את כל תתי-הסעיפים והשדות שבו',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'כן, מחק',
      cancelButtonText: 'ביטול'
    }).then((result) => {
      if (result.isConfirmed) {
        if (parentId) {
          // Delete subsection
          const parentIndex = sections.findIndex(s => 
            s.tempId === parentId || s.sectionID === parentId
          );
          if (parentIndex !== -1) {
            const updatedSections = [...sections];
            updatedSections[parentIndex].subSections = 
              updatedSections[parentIndex].subSections.filter(s => 
                s.tempId !== sectionId && s.sectionID !== sectionId
              );
            setSections(updatedSections);
          }
        } else {
          // Delete main section
          setSections(sections.filter(s => 
            s.tempId !== sectionId && s.sectionID !== sectionId
          ));
        }
      }
    });
  };

  // Add/Edit field
  const handleAddField = (sectionId, isSubSection = false, parentId = null) => {
    setEditingField(null);
    setSelectedSection({ sectionId, isSubSection, parentId });
    setNewField({
      fieldLabel: '',
      fieldType: 'Text',
      helpText: '',
      placeholder: '',
      defaultValue: '',
      isRequired: false,
      isVisible: true,
      orderIndex: 1,
      maxLength: null,
      minValue: null,
      maxValue: null,
      options: []
    });
    setShowFieldModal(true);
  };

  const handleEditField = (field, sectionId, isSubSection = false, parentId = null) => {
    setEditingField(field);
    setSelectedSection({ sectionId, isSubSection, parentId });
    setNewField({
      fieldLabel: field.fieldLabel || '',
      fieldType: field.fieldType || 'Text',
      helpText: field.helpText || '',
      placeholder: field.placeholder || '',
      defaultValue: field.defaultValue || '',
      isRequired: field.isRequired || false,
      isVisible: field.isVisible !== false,
      orderIndex: field.orderIndex || 1,
      maxLength: field.maxLength || null,
      minValue: field.minValue || null,
      maxValue: field.maxValue || null,
      options: field.options || []
    });
    setShowFieldModal(true);
  };

  // Save field
  const saveField = () => {
    if (!newField.fieldLabel.trim()) {
      Swal.fire('שגיאה', 'יש להזין תווית לשדה', 'error');
      return;
    }

    const fieldData = {
      ...newField,
      fieldName: newField.fieldLabel.replace(/\s+/g, '_'),
      tempId: editingField?.tempId || `field_${Date.now()}`
    };

    if (selectedSection.isSubSection && selectedSection.parentId) {
      // Add to subsection
      const parentIndex = sections.findIndex(s => 
        s.tempId === selectedSection.parentId || s.sectionID === selectedSection.parentId
      );
      
      if (parentIndex !== -1) {
        const subIndex = sections[parentIndex].subSections.findIndex(s =>
          s.tempId === selectedSection.sectionId || s.sectionID === selectedSection.sectionId
        );
        
        if (subIndex !== -1) {
          const updatedSections = [...sections];
          if (!updatedSections[parentIndex].subSections[subIndex].fields) {
            updatedSections[parentIndex].subSections[subIndex].fields = [];
          }
          
          if (editingField) {
            // Update existing field
            const fieldIndex = updatedSections[parentIndex].subSections[subIndex].fields
              .findIndex(f => f.tempId === editingField.tempId || f.fieldID === editingField.fieldID);
            if (fieldIndex !== -1) {
              updatedSections[parentIndex].subSections[subIndex].fields[fieldIndex] = fieldData;
            }
          } else {
            // Add new field
            updatedSections[parentIndex].subSections[subIndex].fields.push(fieldData);
          }
          
          setSections(updatedSections);
        }
      }
    } else {
      // Add to main section
      const sectionIndex = sections.findIndex(s => 
        s.tempId === selectedSection.sectionId || s.sectionID === selectedSection.sectionId
      );
      
      if (sectionIndex !== -1) {
        const updatedSections = [...sections];
        if (!updatedSections[sectionIndex].fields) {
          updatedSections[sectionIndex].fields = [];
        }
        
        if (editingField) {
          // Update existing field
          const fieldIndex = updatedSections[sectionIndex].fields
            .findIndex(f => f.tempId === editingField.tempId || f.fieldID === editingField.fieldID);
          if (fieldIndex !== -1) {
            updatedSections[sectionIndex].fields[fieldIndex] = fieldData;
          }
        } else {
          // Add new field
          updatedSections[sectionIndex].fields.push(fieldData);
        }
        
        setSections(updatedSections);
      }
    }

    setShowFieldModal(false);
    resetFieldForm();
  };

  // Delete field
  const handleDeleteField = (fieldId, sectionId, isSubSection = false, parentId = null) => {
    Swal.fire({
      title: 'האם אתה בטוח?',
      text: 'השדה יימחק לצמיתות',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'כן, מחק',
      cancelButtonText: 'ביטול'
    }).then((result) => {
      if (result.isConfirmed) {
        if (isSubSection && parentId) {
          // Delete from subsection
          const parentIndex = sections.findIndex(s => 
            s.tempId === parentId || s.sectionID === parentId
          );
          
          if (parentIndex !== -1) {
            const subIndex = sections[parentIndex].subSections.findIndex(s =>
              s.tempId === sectionId || s.sectionID === sectionId
            );
            
            if (subIndex !== -1) {
              const updatedSections = [...sections];
              updatedSections[parentIndex].subSections[subIndex].fields = 
                updatedSections[parentIndex].subSections[subIndex].fields.filter(f =>
                  f.tempId !== fieldId && f.fieldID !== fieldId
                );
              setSections(updatedSections);
            }
          }
        } else {
          // Delete from main section
          const sectionIndex = sections.findIndex(s => 
            s.tempId === sectionId || s.sectionID === sectionId
          );
          
          if (sectionIndex !== -1) {
            const updatedSections = [...sections];
            updatedSections[sectionIndex].fields = 
              updatedSections[sectionIndex].fields.filter(f =>
                f.tempId !== fieldId && f.fieldID !== fieldId
              );
            setSections(updatedSections);
          }
        }
      }
    });
  };

  // Add option to field
  const handleAddFieldOption = () => {
    setNewField({
      ...newField,
      options: [...(newField.options || []), {
        optionLabel: '',
        optionValue: '',
        scoreValue: null,
        isDefault: false,
        orderIndex: (newField.options?.length || 0) + 1
      }]
    });
  };

  // Update option
  const handleUpdateFieldOption = (index, key, value) => {
    const updatedOptions = [...(newField.options || [])];
    updatedOptions[index] = { ...updatedOptions[index], [key]: value };
    setNewField({ ...newField, options: updatedOptions });
  };

  // Remove option
  const handleRemoveFieldOption = (index) => {
    setNewField({
      ...newField,
      options: newField.options.filter((_, i) => i !== index)
    });
  };

  // Save form
  const handleSaveForm = async (publish = false) => {
    try {
      // Validation
      if (!formInfo.formName) {
        Swal.fire('שגיאה', 'יש להזין שם לטופס', 'error');
        return;
      }

      if (sections.length === 0) {
        Swal.fire('שגיאה', 'יש להוסיף לפחות סעיף אחד', 'error');
        return;
      }

      // Check that all sections have at least one field
      for (const section of sections) {
        const mainFields = section.fields?.length || 0;
        const subFields = section.subSections?.reduce((sum, sub) => 
          sum + (sub.fields?.length || 0), 0) || 0;
        
        if (mainFields + subFields === 0) {
          Swal.fire('שגיאה', `הסעיף "${section.title}" חייב להכיל לפחות שדה אחד`, 'error');
          return;
        }
      }

      setSaving(true);

      if (isEditMode) {
        // Update existing form
        await updateExistingForm(publish);
      } else {
        // Create new form
        const result = await formService.saveAndPublishForm(
          formInfo,
          sections,
          publish
        );

        if (result.formID) {
          navigate('/manager/forms');
        }
      }
    } catch (error) {
      console.error('Error saving form:', error);
    } finally {
      setSaving(false);
    }
  };

  // Update existing form
  const updateExistingForm = async (publish = false) => {
    try {
      // Step 1: Update form basic info
      await formService.updateForm(formId, {
        ...formInfo,
        isPublished: publish || formInfo.isPublished
      });

      // Step 2: Get current sections from server to compare
      const currentServerSections = await formService.getFormStructure(formId);
      
      // Step 3: Find sections to delete (exist in server but not in local)
      const serverSectionIds = extractAllSectionIds(currentServerSections);
      const localSectionIds = extractAllSectionIds(sections);
      
      const sectionsToDelete = serverSectionIds.filter(id => 
        !localSectionIds.includes(id) && !id.toString().startsWith('section_') && !id.toString().startsWith('subsection_')
      );
      
      // Delete removed sections
      for (const sectionId of sectionsToDelete) {
        try {
          await formService.deleteSection(sectionId);
        } catch (err) {
          console.warn(`Failed to delete section ${sectionId}:`, err);
        }
      }

      // Step 4: Process each section (update existing, create new)
      for (const section of sections) {
        await processSectionUpdate(section, formId, null);
      }

      // Success message
      Swal.fire({
        icon: 'success',
        title: 'הצלחה!',
        text: publish ? 'הטופס עודכן ופורסם בהצלחה!' : 'הטופס עודכן בהצלחה!',
        confirmButtonText: 'אישור',
        timer: 3000,
        timerProgressBar: true
      }).then(() => {
        navigate('/manager/forms');
      });

    } catch (error) {
      console.error('Error updating form:', error);
      Swal.fire('שגיאה', error.message || 'אירעה שגיאה בעדכון הטופס', 'error');
    }
  };

  // Helper function to process section updates
  const processSectionUpdate = async (section, formId, parentSectionId = null) => {
    try {
      let sectionId = section.sectionID;
      
      // Check if it's a new section (has tempId) or existing (has sectionID)
      if (section.tempId && !section.sectionID) {
        // New section - create it
        const sectionData = {
          formId: formId,
          title: section.title,
          description: section.description || '',
          explanation: section.explanation || '',
          maxPoints: section.maxPoints || null,
          level: section.level || (parentSectionId ? 2 : 1),
          parentSectionID: parentSectionId,
          orderIndex: section.orderIndex,
          isRequired: section.isRequired || false,
          isVisible: section.isVisible !== false
        };
        
        const result = await formService.createSection(sectionData);
        sectionId = result.sectionID;
      } else if (section.sectionID) {
        // Existing section - update it
        const sectionData = {
          sectionID: section.sectionID,
          formId: formId,
          title: section.title,
          description: section.description || '',
          explanation: section.explanation || '',
          maxPoints: section.maxPoints || null,
          level: section.level || (parentSectionId ? 2 : 1),
          parentSectionID: parentSectionId,
          orderIndex: section.orderIndex,
          isRequired: section.isRequired || false,
          isVisible: section.isVisible !== false
        };
        
        await formService.updateSection(section.sectionID, sectionData);
      }

      // Process fields for this section
      if (section.fields && sectionId) {
        await processFieldsUpdate(section.fields, sectionId);
      }

      // Process subsections
      if (section.subSections && section.subSections.length > 0) {
        for (const subSection of section.subSections) {
          await processSectionUpdate(subSection, formId, sectionId);
        }
      }
    } catch (error) {
      console.error(`Error processing section ${section.title}:`, error);
      throw error;
    }
  };

  // Helper function to process field updates
  const processFieldsUpdate = async (fields, sectionId) => {
    // Get existing fields for this section
    const existingFields = await formService.getSectionFields(sectionId);
    const existingFieldIds = existingFields.map(f => f.fieldID);
    const currentFieldIds = fields.filter(f => f.fieldID).map(f => f.fieldID);
    
    // Delete removed fields
    const fieldsToDelete = existingFieldIds.filter(id => !currentFieldIds.includes(id));
    for (const fieldId of fieldsToDelete) {
      try {
        await formService.deleteField(fieldId);
      } catch (err) {
        console.warn(`Failed to delete field ${fieldId}:`, err);
      }
    }

    // Process each field
    for (const field of fields) {
      if (field.tempId && !field.fieldID) {
        // New field - create it
        const fieldData = {
          sectionID: sectionId,
          fieldName: field.fieldName || field.fieldLabel.replace(/\s+/g, '_'),
          fieldLabel: field.fieldLabel,
          fieldType: field.fieldType,
          isRequired: field.isRequired || false,
          defaultValue: field.defaultValue || '',
          placeholder: field.placeholder || '',
          helpText: field.helpText || '',
          orderIndex: field.orderIndex || 1,
          isVisible: field.isVisible !== false,
          maxLength: field.maxLength || null,
          minValue: field.minValue || null,
          maxValue: field.maxValue || null
        };
        
        const fieldResult = await formService.createField(fieldData);
        
        // Create options if needed
        if (fieldResult.fieldID && field.options && field.options.length > 0) {
          for (const option of field.options) {
            await formService.createFieldOption({
              fieldID: fieldResult.fieldID,
              optionValue: option.optionValue || option.optionLabel,
              optionLabel: option.optionLabel,
              scoreValue: option.scoreValue || null,
              orderIndex: option.orderIndex || 1,
              isDefault: option.isDefault || false
            });
          }
        }
      } else if (field.fieldID) {
        // Existing field - update it
        const fieldData = {
          fieldID: field.fieldID,
          sectionID: sectionId,
          fieldName: field.fieldName || field.fieldLabel.replace(/\s+/g, '_'),
          fieldLabel: field.fieldLabel,
          fieldType: field.fieldType,
          isRequired: field.isRequired || false,
          defaultValue: field.defaultValue || '',
          placeholder: field.placeholder || '',
          helpText: field.helpText || '',
          orderIndex: field.orderIndex || 1,
          isVisible: field.isVisible !== false,
          maxLength: field.maxLength || null,
          minValue: field.minValue || null,
          maxValue: field.maxValue || null
        };
        
        await formService.updateField(field.fieldID, fieldData);
        
        // Update options - for simplicity, delete all and recreate
        if (['Select', 'Radio', 'Checkbox'].includes(field.fieldType)) {
          // Delete existing options
          await formService.deleteFieldOptions(field.fieldID);
          
          // Create new options
          if (field.options && field.options.length > 0) {
            for (const option of field.options) {
              await formService.createFieldOption({
                fieldID: field.fieldID,
                optionValue: option.optionValue || option.optionLabel,
                optionLabel: option.optionLabel,
                scoreValue: option.scoreValue || null,
                orderIndex: option.orderIndex || 1,
                isDefault: option.isDefault || false
              });
            }
          }
        }
      }
    }
  };

  // Helper function to extract all section IDs
  const extractAllSectionIds = (sections) => {
    const ids = [];
    for (const section of sections) {
      if (section.sectionID) {
        ids.push(section.sectionID);
      }
      if (section.subSections) {
        for (const sub of section.subSections) {
          if (sub.sectionID) {
            ids.push(sub.sectionID);
          }
        }
      }
    }
    return ids;
  };

  // Helper functions
  const updateSectionInHierarchy = (sections, sectionId, updates) => {
    return sections.map(section => {
      if (section.tempId === sectionId || section.sectionID === sectionId) {
        return { ...section, ...updates };
      }
      if (section.subSections) {
        return {
          ...section,
          subSections: section.subSections.map(sub => {
            if (sub.tempId === sectionId || sub.sectionID === sectionId) {
              return { ...sub, ...updates };
            }
            return sub;
          })
        };
      }
      return section;
    });
  };

  const resetSectionForm = () => {
    setNewSection({
      title: '',
      description: '',
      explanation: '',
      maxPoints: null,
      isRequired: false,
      isVisible: true,
      orderIndex: 1
    });
    setEditingSection(null);
    setSelectedParentSection(null);
  };

  const resetFieldForm = () => {
    setNewField({
      fieldLabel: '',
      fieldType: 'Text',
      helpText: '',
      placeholder: '',
      defaultValue: '',
      isRequired: false,
      isVisible: true,
      orderIndex: 1,
      maxLength: null,
      minValue: null,
      maxValue: null,
      options: []
    });
    setEditingField(null);
    setSelectedSection(null);
  };

  // Render section with hierarchy (no subsections for subsections)
  const renderSection = (section, parentId = null, index = 0) => {
    const sectionId = section.tempId || section.sectionID;
    const isSubSection = !!parentId;
    
    return (
      <Card key={sectionId} className={`mb-3 ${isSubSection ? 'ms-4 border-start border-primary border-3' : ''}`}>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <Badge bg={isSubSection ? 'info' : 'primary'} className="me-2">
              {isSubSection ? 'תת-סעיף' : `סעיף ${index + 1}`}
            </Badge>
            <strong>{section.title || 'סעיף ללא כותרת'}</strong>
            {section.isRequired && <Badge bg="danger" className="ms-2">חובה</Badge>}
            {!section.isVisible && (
              <Badge bg="warning" className="ms-2">
                <i className="bi bi-eye-slash"></i> מוסתר
              </Badge>
            )}
          </div>
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => handleEditSection(section, parentId)}
              title="ערוך סעיף"
            >
              <i className="bi bi-pencil"></i>
            </Button>
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => handleDeleteSection(sectionId, parentId)}
              title="מחק סעיף"
            >
              <i className="bi bi-trash"></i>
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {section.description && (
            <p className="text-muted small mb-2">{section.description}</p>
          )}
          
          {section.explanation && (
            <Alert variant="info" className="py-2 px-3 small">
              <i className="bi bi-info-circle me-2"></i>
              {section.explanation}
            </Alert>
          )}

          {/* Fields */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                שדות ({section.fields?.length || 0})
              </h6>
              <Button
                size="sm"
                variant="outline-success"
                onClick={() => handleAddField(sectionId, isSubSection, parentId)}
              >
                <i className="bi bi-plus-circle me-1"></i>
                הוסף שדה
              </Button>
            </div>
            
            {section.fields && section.fields.length > 0 ? (
              <div className="list-group">
                {section.fields.map((field, fieldIndex) => (
                  <div key={field.tempId || field.fieldID} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <i className={`bi ${fieldTypes.find(t => t.value === field.fieldType)?.icon || 'bi-question-circle'} me-2`}></i>
                        <strong>{field.fieldLabel}</strong>
                        <Badge bg="secondary" className="ms-2" style={{ fontSize: '0.7rem' }}>
                          {fieldTypes.find(t => t.value === field.fieldType)?.label || field.fieldType}
                        </Badge>
                        {field.isRequired && <Badge bg="danger" className="ms-2">חובה</Badge>}
                        {!field.isVisible && <Badge bg="warning" className="ms-2">מוסתר</Badge>}
                      </div>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleEditField(field, sectionId, isSubSection, parentId)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDeleteField(field.tempId || field.fieldID, sectionId, isSubSection, parentId)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </div>
                    {field.helpText && (
                      <small className="text-muted d-block mt-1">
                        <i className="bi bi-question-circle me-1"></i>
                        {field.helpText}
                      </small>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Alert variant="warning" className="mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                אין שדות בסעיף זה - חובה להוסיף לפחות שדה אחד
              </Alert>
            )}
          </div>

          {/* Subsections - only for main sections, not for subsections */}
          {!isSubSection && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">
                  <i className="bi bi-diagram-2 me-2"></i>
                  תתי-סעיפים ({section.subSections?.length || 0})
                </h6>
                <Button
                  size="sm"
                  variant="outline-info"
                  onClick={() => handleAddSection(sectionId)}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  הוסף תת-סעיף
                </Button>
              </div>
              
              {section.subSections && section.subSections.length > 0 && (
                <div className="mt-2">
                  {section.subSections.map((subSection, subIndex) => 
                    renderSection(subSection, sectionId, subIndex)
                  )}
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner message="טוען נתוני טופס..." />;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        {isEditMode ? `עריכת טופס: ${formInfo.formName}` : 'יצירת טופס חדש'}
      </h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Step Indicator for new forms */}
      {!isEditMode && activeTab === 'steps' && (
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">שלבי יצירת הטופס</h5>
              <Badge bg="primary" style={{ fontSize: '1rem' }}>
                {currentStep}/3
              </Badge>
            </div>
            <ProgressBar now={(currentStep / 3) * 100} className="mb-3" style={{ height: '25px' }}>
              <ProgressBar 
                now={(currentStep / 3) * 100} 
                label={`${Math.round((currentStep / 3) * 100)}%`}
              />
            </ProgressBar>
            <div className="d-flex justify-content-between">
              <div className={`text-center ${currentStep >= 1 ? 'text-primary fw-bold' : 'text-muted'}`}>
                <i className={`bi bi-1-circle${currentStep >= 1 ? '-fill' : ''} fs-3 d-block mb-2`}></i>
                פרטי בסיס
              </div>
              <div className={`text-center ${currentStep >= 2 ? 'text-primary fw-bold' : 'text-muted'}`}>
                <i className={`bi bi-2-circle${currentStep >= 2 ? '-fill' : ''} fs-3 d-block mb-2`}></i>
                בניית מבנה
              </div>
              <div className={`text-center ${currentStep >= 3 ? 'text-primary fw-bold' : 'text-muted'}`}>
                <i className={`bi bi-3-circle${currentStep >= 3 ? '-fill' : ''} fs-3 d-block mb-2`}></i>
                סיכום ופרסום
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Content based on step/tab */}
      {(activeTab === 'steps' && !isEditMode) ? (
        // Step-based view for new forms
        <>
          {currentStep === 1 && (
            <Card>
              <Card.Header>
                <h5>שלב 1: פרטי הטופס</h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>שם הטופס <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          value={formInfo.formName}
                          onChange={(e) => setFormInfo({...formInfo, formName: e.target.value})}
                          placeholder="הזן שם לטופס"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>שנה אקדמית</Form.Label>
                        <Form.Control
                          type="text"
                          value={formInfo.academicYear}
                          onChange={(e) => setFormInfo({...formInfo, academicYear: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>סמסטר</Form.Label>
                        <Form.Select
                          value={formInfo.semester}
                          onChange={(e) => setFormInfo({...formInfo, semester: e.target.value})}
                        >
                          <option value="A">סמסטר א'</option>
                          <option value="B">סמסטר ב'</option>
                          <option value="C">סמסטר קיץ</option>
                          <option value="D">שנתי</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                       <Form.Group className="mb-3">
      <Form.Label>תאריך יעד</Form.Label>
      <DatePicker
        selected={formInfo.dueDate || ''}
onChange={(date) => setFormInfo({...formInfo, dueDate: date})}
        dateFormat="yyyy-MM-dd"
        className="form-control" // שומר על סטייל של Bootstrap
      />
    </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>תיאור <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formInfo.description}
                      onChange={(e) => setFormInfo({...formInfo, description: e.target.value})}
                      placeholder="תיאור הטופס"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>הנחיות למילוי</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formInfo.instructions}
                      onChange={(e) => setFormInfo({...formInfo, instructions: e.target.value})}
                      placeholder="הנחיות למילוי הטופס"
                    />
                  </Form.Group>
                </Form>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate('/manager/forms')}>
                  ביטול
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => setCurrentStep(2)}
                  disabled={!validateBasicInfo()}
                >
                  המשך לשלב הבא
                  <i className="bi bi-arrow-left ms-2"></i>
                </Button>
              </Card.Footer>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5>שלב 2: בניית מבנה הטופס</h5>
                <Button
                  variant="primary"
                  onClick={() => handleAddSection()}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  הוסף סעיף ראשי
                </Button>
              </Card.Header>
              <Card.Body>
                {sections.length > 0 ? (
                  sections.map((section, index) => renderSection(section, null, index))
                ) : (
                  <Alert variant="info" className="text-center">
                    <i className="bi bi-info-circle fs-1 d-block mb-2"></i>
                    <h5>טרם הוגדרו סעיפים</h5>
                    <p>לחץ על "הוסף סעיף ראשי" כדי להתחיל לבנות את מבנה הטופס</p>
                    <p className="mb-0 text-muted">כל סעיף חייב להכיל לפחות שדה אחד</p>
                  </Alert>
                )}
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                  <i className="bi bi-arrow-right me-2"></i>
                  חזור לשלב הקודם
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => setCurrentStep(3)}
                  disabled={!validateStructure()}
                >
                  המשך לסיכום
                  <i className="bi bi-arrow-left ms-2"></i>
                </Button>
              </Card.Footer>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <Card.Header>
                <h5>שלב 3: סיכום ושמירה</h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="success">
                  <h5>סיכום הטופס:</h5>
                  <Row className="mt-3">
                    <Col md={6}>
                      <ul className="list-unstyled">
                        <li><strong>שם:</strong> {formInfo.formName}</li>
                        <li><strong>תיאור:</strong> {formInfo.description}</li>
                        <li><strong>שנה אקדמית:</strong> {formInfo.academicYear}</li>
                        <li><strong>סמסטר:</strong> {formInfo.semester}</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <ul className="list-unstyled">
                        <li><strong>מספר סעיפים ראשיים:</strong> {sections.length}</li>
                        <li><strong>מספר תתי-סעיפים:</strong> {sections.reduce((sum, s) => sum + (s.subSections?.length || 0), 0)}</li>
                        <li><strong>סך הכל שדות:</strong> {
                          sections.reduce((sum, s) => 
                            sum + (s.fields?.length || 0) + 
                            (s.subSections?.reduce((subSum, sub) => subSum + (sub.fields?.length || 0), 0) || 0), 0)
                        }</li>
                      </ul>
                    </Col>
                  </Row>
                </Alert>

                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  ניתן לשמור את הטופס כטיוטה לעריכה מאוחרת, או לפרסם אותו מיידית למילוי
                </Alert>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => setCurrentStep(2)}>
                  <i className="bi bi-arrow-right me-2"></i>
                  חזור לשלב הקודם
                </Button>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    onClick={() => handleSaveForm(false)}
                    disabled={saving || !isFormValid()}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        שומר...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        שמור כטיוטה
                      </>
                    )}
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => handleSaveForm(true)}
                    disabled={saving || !isFormValid()}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        מפרסם...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        פרסם טופס
                      </>
                    )}
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          )}
        </>
      ) : (
        // Tab-based view for editing
        <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
          <Tab eventKey="basic" title="פרטי הטופס">
            <Card>
              <Card.Body>
                {/* Same form as in step 1 */}
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>שם הטופס <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          value={formInfo.formName}
                          onChange={(e) => setFormInfo({...formInfo, formName: e.target.value})}
                          placeholder="הזן שם לטופס"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>שנה אקדמית</Form.Label>
                        <Form.Control
                          type="text"
                          value={formInfo.academicYear}
                          onChange={(e) => setFormInfo({...formInfo, academicYear: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>סמסטר</Form.Label>
                        <Form.Select
                          value={formInfo.semester}
                          onChange={(e) => setFormInfo({...formInfo, semester: e.target.value})}
                        >
                          <option value="A">סמסטר א'</option>
                          <option value="B">סמסטר ב'</option>
                          <option value="C">סמסטר קיץ</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>תאריך יעד</Form.Label>
                        <Form.Control
                          type="date"
                          value={formInfo.dueDate || ''}
                          onChange={(e) => setFormInfo({...formInfo, dueDate: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>תיאור</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formInfo.description}
                      onChange={(e) => setFormInfo({...formInfo, description: e.target.value})}
                      placeholder="תיאור הטופס"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>הנחיות למילוי</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formInfo.instructions}
                      onChange={(e) => setFormInfo({...formInfo, instructions: e.target.value})}
                      placeholder="הנחיות למילוי הטופס"
                    />
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="structure" title="מבנה הטופס">
            <Card className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>סעיפי הטופס</h5>
                  <Button
                    variant="primary"
                    onClick={() => handleAddSection()}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    הוסף סעיף ראשי
                  </Button>
                </div>

                {sections.length > 0 ? (
                  sections.map((section, index) => renderSection(section, null, index))
                ) : (
                  <Alert variant="info">
                    טרם הוגדרו סעיפים לטופס. לחץ על "הוסף סעיף ראשי" להתחיל.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      )}

      {/* Action buttons for edit mode */}
      {(isEditMode || activeTab !== 'steps') && (
        <div className="d-flex justify-content-between mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/manager/forms')}
          >
            ביטול
          </Button>
          <div className="d-flex gap-2 align-items-center">
            {hasChanges && (
              <Badge bg="warning" className="me-2">
                <i className="bi bi-exclamation-circle me-1"></i>
                יש שינויים שלא נשמרו
              </Badge>
            )}
            <Button
              variant="outline-primary"
              onClick={() => handleSaveForm(false)}
              disabled={saving || !isFormValid()}
              title={!isFormValid() ? 'יש להשלים את כל השדות הנדרשים' : ''}
            >
              {saving ? 'שומר...' : 'שמור כטיוטה'}
            </Button>
            {/* <Button
              variant="success"
              onClick={() => handleSaveForm(true)}
              disabled={saving || formInfo.isPublished || !isFormValid()}
              title={!isFormValid() ? 'יש להשלים את כל השדות הנדרשים' : formInfo.isPublished ? 'הטופס כבר פורסם' : ''}
            >
              {saving ? 'מפרסם...' : formInfo.isPublished ? 'פורסם' : 'פרסם טופס'}
            </Button> */}
          </div>
        </div>
      )}

      {/* Section Modal */}
      <Modal show={showSectionModal} onHide={() => setShowSectionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSection ? 'עריכת סעיף' : 
             selectedParentSection ? 'הוספת תת-סעיף' : 'הוספת סעיף ראשי'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>כותרת <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={newSection.title}
                onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                placeholder="הזן כותרת לסעיף"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>תיאור</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newSection.description}
                onChange={(e) => setNewSection({...newSection, description: e.target.value})}
                placeholder="תיאור הסעיף"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>הסבר נוסף</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newSection.explanation}
                onChange={(e) => setNewSection({...newSection, explanation: e.target.value})}
                placeholder="הסבר נוסף למילוי"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ניקוד מקסימלי</Form.Label>
                  <Form.Control
                    type="number"
                    value={newSection.maxPoints || ''}
                    onChange={(e) => setNewSection({...newSection, maxPoints: e.target.value ? Number(e.target.value) : null})}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>סדר הצגה</Form.Label>
                  <Form.Control
                    type="number"
                    value={newSection.orderIndex}
                    onChange={(e) => setNewSection({...newSection, orderIndex: Number(e.target.value)})}
                    min="1"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Check
              type="checkbox"
              label="סעיף חובה"
              checked={newSection.isRequired}
              onChange={(e) => setNewSection({...newSection, isRequired: e.target.checked})}
              className="mb-2"
            />

            <Form.Check
              type="checkbox"
              label="הצג סעיף (הסעיף יהיה גלוי למשתמשים בעת מילוי הטופס)"
              checked={newSection.isVisible}
              onChange={(e) => setNewSection({...newSection, isVisible: e.target.checked})}
              title="אם לא מסומן, הסעיף יהיה מוסתר מהמשתמשים"
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSectionModal(false)}>
            ביטול
          </Button>
          <Button variant="primary" onClick={saveSection}>
            {editingSection ? 'עדכן' : 'הוסף'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Field Modal */}
      <Modal show={showFieldModal} onHide={() => setShowFieldModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingField ? 'עריכת שדה' : 'הוספת שדה חדש'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>תווית השדה <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={newField.fieldLabel}
                    onChange={(e) => setNewField({...newField, fieldLabel: e.target.value})}
                    placeholder="הזן תווית לשדה"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>סוג השדה</Form.Label>
                  <Form.Select
                    value={newField.fieldType}
                    onChange={(e) => setNewField({...newField, fieldType: e.target.value})}
                  >
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>טקסט עזרה</Form.Label>
                  <Form.Control
                    type="text"
                    value={newField.helpText}
                    onChange={(e) => setNewField({...newField, helpText: e.target.value})}
                    placeholder="טקסט עזרה למילוי"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Placeholder</Form.Label>
                  <Form.Control
                    type="text"
                    value={newField.placeholder}
                    onChange={(e) => setNewField({...newField, placeholder: e.target.value})}
                    placeholder="טקסט רמז"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Options for select/radio/checkbox */}
            {['Select', 'Radio', 'Checkbox'].includes(newField.fieldType) && (
              <div className="mb-3">
                <label className="form-label">אפשרויות בחירה</label>
                {newField.options?.map((option, index) => (
                  <div key={index} className="d-flex gap-2 mb-2">
                    <Form.Control
                      type="text"
                      placeholder="תווית"
                      value={option.optionLabel}
                      onChange={(e) => handleUpdateFieldOption(index, 'optionLabel', e.target.value)}
                    />
                    <Form.Control
                      type="text"
                      placeholder="ערך"
                      value={option.optionValue}
                      onChange={(e) => handleUpdateFieldOption(index, 'optionValue', e.target.value)}
                    />
                    <Form.Control
                      type="number"
                      placeholder="ניקוד"
                      value={option.scoreValue || ''}
                      onChange={(e) => handleUpdateFieldOption(index, 'scoreValue', e.target.value ? Number(e.target.value) : null)}
                      style={{ width: '100px' }}
                    />
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveFieldOption(index)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleAddFieldOption}
                >
                  <i className="bi bi-plus"></i> הוסף אפשרות
                </Button>
              </div>
            )}

            {/* Number field settings */}
            {newField.fieldType === 'Number' && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ערך מינימלי</Form.Label>
                    <Form.Control
                      type="number"
                      value={newField.minValue || ''}
                      onChange={(e) => setNewField({...newField, minValue: e.target.value ? Number(e.target.value) : null})}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ערך מקסימלי</Form.Label>
                    <Form.Control
                      type="number"
                      value={newField.maxValue || ''}
                      onChange={(e) => setNewField({...newField, maxValue: e.target.value ? Number(e.target.value) : null})}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            {/* Text field settings */}
            {(newField.fieldType === 'Text' || newField.fieldType === 'TextArea') && (
              <Form.Group className="mb-3">
                <Form.Label>אורך מקסימלי</Form.Label>
                <Form.Control
                  type="number"
                  value={newField.maxLength || ''}
                  onChange={(e) => setNewField({...newField, maxLength: e.target.value ? Number(e.target.value) : null})}
                />
              </Form.Group>
            )}

            <Form.Check
              type="checkbox"
              label="שדה חובה"
              checked={newField.isRequired}
              onChange={(e) => setNewField({...newField, isRequired: e.target.checked})}
              className="mb-2"
            />

            <Form.Check
              type="checkbox"
              label="הצג שדה"
              checked={newField.isVisible}
              onChange={(e) => setNewField({...newField, isVisible: e.target.checked})}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFieldModal(false)}>
            ביטול
          </Button>
          <Button variant="primary" onClick={saveField}>
            {editingField ? 'עדכן' : 'הוסף'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UnifiedFormBuilder;