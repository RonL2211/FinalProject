// src/pages/AddForm/hooks/useFormData.js
import { useState, useEffect } from 'react';
import { getDepartments, getUsers } from './formService';

const useFormData = () => {
  // Basic form details
  const [formData, setFormData] = useState({
    formName: '',
    academicYear: '',
    semester: '',
    description: '',
    instructions: '',
    startDate: '',
    dueDate: '',
    isActive: true,
    isPublished: false,
    formId: null,
  });

  // Form sections
  const [sections, setSections] = useState([]);

  // Supporting data
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    setInitialAcademicYear();
  }, []);

  // Calculate progress when data changes
  useEffect(() => {
    const newProgress = calculateProgress();
    setProgress(newProgress);
  }, [formData, sections]);

  const loadInitialData = async () => {
    try {
      const [departmentsData, usersData] = await Promise.all([
        getDepartments(),
        getUsers()
      ]);
      
      setDepartments(departmentsData);
      setUsers(usersData);
    } catch (err) {
      console.error("Error loading initial data:", err);
      setError("שגיאה בטעינת נתוני מערכת. נסה לרענן את הדף.");
    }
  };

  const setInitialAcademicYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const monthNow = currentDate.getMonth() + 1;
    
    const academicYearStart = monthNow >= 10 ? currentYear : currentYear - 1;
    const academicYearEnd = academicYearStart + 1;
    
    setFormData(prev => ({
      ...prev,
      academicYear: `${academicYearStart}-${academicYearEnd}`,
      semester: monthNow >= 3 && monthNow <= 7 ? "ב" : "א"
    }));
  };

  // Update basic form details
  const updateBasicDetails = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear errors when user makes changes
  };

  // Update sections
  const updateSections = (newSections) => {
    setSections(newSections);
    setError(''); // Clear errors when user makes changes
  };

  // Calculate completion percentage
  const calculateProgress = () => {
    let percent = 0;
    
    // Basic details validation (30%)
    const basicFields = ['formName', 'academicYear', 'startDate'];
    const filledBasicFields = basicFields.filter(field => 
      formData[field]?.toString().trim() !== ''
    ).length;
    
    percent += (filledBasicFields / basicFields.length) * 30;
    
    // Sections validation (50%)
    if (sections.length > 0) {
      let validSections = 0;
      
      for (const section of sections) {
        let sectionScore = 0;
        
        // Basic section info (50% of section score)
        if (section.title && section.maxPoints) {
          sectionScore += 0.5;
        }
        
        // Fields validation (50% of section score)
        if (section.fields && section.fields.length > 0) {
          const validFields = section.fields.filter(field => 
            field.fieldLabel && field.fieldType
          ).length;
          
          if (validFields > 0) {
            sectionScore += 0.5 * (validFields / section.fields.length);
          }
        }
        
        validSections += sectionScore;
      }
      
      percent += (validSections / sections.length) * 50;
    }
    
    // Ready for save (20%)
    const hasValidForm = formData.formName && formData.academicYear && formData.startDate;
    const hasValidSections = sections.length > 0 && sections.some(s => 
      s.title && s.maxPoints && s.fields && s.fields.length > 0
    );
    
    if (hasValidForm && hasValidSections) {
      percent += 20;
    }
    
    return Math.min(Math.round(percent), 100);
  };

  // Validation for each step
  const validateStep = (step) => {
    switch (step) {
      case 1: // Basic details
        return validateBasicDetails();
      case 2: // Sections
        return validateSections();
      case 3: // Summary
        return ''; // No validation needed for summary
      default:
        return '';
    }
  };

  const validateBasicDetails = () => {
    if (!formData.formName?.trim()) return 'שם הטופס הוא שדה חובה';
    if (!formData.academicYear?.trim()) return 'שנת לימודים היא שדה חובה';
    if (!formData.startDate) return 'תאריך התחלה הוא שדה חובה';
    
    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(formData.startDate);
    
    if (start < today) return 'תאריך התחלה לא יכול להיות בעבר';
    
    if (formData.dueDate) {
      const due = new Date(formData.dueDate);
      if (due <= start) return 'תאריך סיום חייב להיות מאוחר מתאריך ההתחלה';
    }
    
    return '';
  };

  const validateSections = () => {
    if (sections.length === 0) {
      return 'יש להוסיף לפחות סעיף ראשי אחד';
    }
    
    // Validate each section
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      if (!section.title?.trim()) {
        return `כותרת חסרה בסעיף ${i + 1}`;
      }
      
      if (!section.maxPoints || section.maxPoints <= 0) {
        return `ניקוד מקסימלי חסר או לא תקין בסעיף ${i + 1}`;
      }
      
      // Validate fields
      if (!section.fields || section.fields.length === 0) {
        return `יש להוסיף לפחות שדה אחד לסעיף ${i + 1}`;
      }
      
      for (let j = 0; j < section.fields.length; j++) {
        const field = section.fields[j];
        
        if (!field.fieldLabel?.trim()) {
          return `תווית שדה חסרה בסעיף ${i + 1}, שדה ${j + 1}`;
        }
        
        if (!field.fieldType) {
          return `סוג שדה חסר בסעיף ${i + 1}, שדה ${j + 1}`;
        }
        
        // Validate options for choice fields
        if (['select', 'radio', 'checkbox'].includes(field.fieldType)) {
          if (!field.options || field.options.length === 0) {
            return `יש להוסיף לפחות אפשרות אחת לשדה '${field.fieldLabel}' בסעיף ${i + 1}`;
          }
          
          for (let k = 0; k < field.options.length; k++) {
            const option = field.options[k];
            if (!option.optionLabel?.trim()) {
              return `תווית אפשרות חסרה בשדה '${field.fieldLabel}', סעיף ${i + 1}, אפשרות ${k + 1}`;
            }
            if (!option.optionValue?.trim()) {
              return `ערך אפשרות חסר בשדה '${field.fieldLabel}', סעיף ${i + 1}, אפשרות ${k + 1}`;
            }
          }
        }
      }
    }
    
    return '';
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      formName: '',
      academicYear: '',
      semester: '',
      description: '',
      instructions: '',
      startDate: '',
      dueDate: '',
      isActive: true,
      isPublished: false,
      formId: null,
    });
    setSections([]);
    setError('');
    setSuccess('');
    setProgress(0);
    setInitialAcademicYear();
  };

  // Set form ID after creation
  const setFormId = (id) => {
    setFormData(prev => ({
      ...prev,
      formId: id
    }));
  };

  return {
    // Data
    formData,
    sections,
    departments,
    users,
    
    // UI State
    error,
    success,
    loading,
    progress,
    
    // Actions
    updateBasicDetails,
    updateSections,
    setFormId,
    
    // Validation
    validateStep,
    calculateProgress,
    
    // Utilities
    resetForm,
    
    // State setters (for direct manipulation if needed)
    setError,
    setSuccess,
    setLoading,
    setProgress,
    setDepartments,
    setUsers
  };
};

export default useFormData;