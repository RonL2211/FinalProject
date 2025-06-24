// src/pages/AddForm/components/FormSectionsManager.jsx
import React from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import SectionCard from './SectionCard';
import EmptyState from './EmptyState';

const FormSectionsManager = ({ sections, onUpdate, departments = [], users = [] }) => {
  const addSection = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const newSection = {
      id: Date.now(),
      title: '',
      description: '',
      explanation: '',
      maxPoints: '',
      level: 0,
      orderIndex: sections.length + 1,
      isRequired: false,
      isVisible: true,
      maxOccurrences: 1,
      responsibleEntity: null,
      responsiblePerson: currentUser?.personId || '', // ברירת מחדל - המשתמש הנוכחי
      fields: [],
      subSections: [],
      permissions: []
    };
    
    onUpdate([...sections, newSection]);
  };

  const updateSection = (index, field, value) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  const removeSection = (index) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הסעיף?')) {
      const updated = sections.filter((_, i) => i !== index);
      onUpdate(updated);
    }
  };

  const addFieldToSection = (sectionIndex) => {
    const newField = {
      id: Date.now(),
      fieldName: `field_${Date.now()}`,
      fieldLabel: '',
      fieldType: '',
      isRequired: false,
      defaultValue: '',
      placeholder: '',
      helpText: '',
      orderIndex: sections[sectionIndex].fields.length + 1,
      isVisible: true,
      maxLength: null,
      minValue: null,
      maxValue: null,
      isActive: true,
      options: []
    };

    const updated = [...sections];
    updated[sectionIndex].fields.push(newField);
    onUpdate(updated);
  };

  const updateField = (sectionIndex, fieldIndex, field, value) => {
    const updated = [...sections];
    updated[sectionIndex].fields[fieldIndex][field] = value;

    // Auto-generate field name from label
    if (field === 'fieldLabel' && !updated[sectionIndex].fields[fieldIndex].fieldName) {
      const systemName = value
        .replace(/\s+/g, '_')
        .replace(/[^\w\s]/gi, '')
        .toLowerCase();
      updated[sectionIndex].fields[fieldIndex].fieldName = systemName || `field_${Date.now()}`;
    }

    // Add default options for select fields
    if (field === 'fieldType' && ['select', 'radio', 'checkbox'].includes(value)) {
      if (!updated[sectionIndex].fields[fieldIndex].options?.length) {
        updated[sectionIndex].fields[fieldIndex].options = [{
          id: Date.now(),
          optionValue: 'option_1',
          optionLabel: '',
          scoreValue: 0,
          orderIndex: 1,
          isDefault: true
        }];
      }
    }

    onUpdate(updated);
  };

  const removeField = (sectionIndex, fieldIndex) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את השדה?')) {
      const updated = [...sections];
      updated[sectionIndex].fields.splice(fieldIndex, 1);
      
      // Update order indices
      updated[sectionIndex].fields.forEach((field, idx) => {
        field.orderIndex = idx + 1;
      });
      
      onUpdate(updated);
    }
  };

  return (
    <div className="sections-manager">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">
            <i className="bi bi-list-nested me-2 text-primary"></i>
            הגדרת סעיפים וקריטריונים
          </h5>
          <p className="text-muted mb-0">
            צור סעיפים עם שדות ותת-סעיפים לטופס שלך
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={addSection}
          className="rounded-pill px-4"
        >
          <i className="bi bi-plus-lg me-1"></i> הוסף סעיף ראשי
        </Button>
      </div>

      {/* Sections List or Empty State */}
      {sections.length === 0 ? (
        <EmptyState
          icon="bi-card-text"
          title="לא הוגדרו סעיפים עדיין"
          description="התחל ביצירת סעיף ראשי שיכיל את הקריטריונים והשדות הדרושים"
          actionLabel="הוסף סעיף ראשי"
          onAction={addSection}
        />
      ) : (
        <div className="sections-list">
          {sections.map((section, index) => (
            <SectionCard
              key={section.id || index}
              section={section}
              sectionIndex={index}
              onUpdateSection={updateSection}
              onRemoveSection={removeSection}
              onAddField={addFieldToSection}
              onUpdateField={updateField}
              onRemoveField={removeField}
              departments={departments}
              users={users}
            />
          ))}
          
          {/* Progress Summary */}
          <Card className="border-0 bg-light mt-4">
            <Card.Body className="text-center py-3">
              <div className="row">
                <div className="col-md-3">
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="bi bi-list-ol text-primary me-2"></i>
                    <div>
                      <div className="fw-bold">{sections.length}</div>
                      <small className="text-muted">סעיפים</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="bi bi-input-cursor text-success me-2"></i>
                    <div>
                      <div className="fw-bold">
                        {sections.reduce((total, section) => {
                          const mainFields = section.fields?.length || 0;
                          const subFields = (section.subSections || []).reduce((subTotal, subSection) => 
                            subTotal + (subSection.fields?.length || 0), 0
                          );
                          return total + mainFields + subFields;
                        }, 0)}
                      </div>
                      <small className="text-muted">שדות</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="bi bi-diagram-3 text-info me-2"></i>
                    <div>
                      <div className="fw-bold">
                        {sections.reduce((total, section) => total + (section.subSections?.length || 0), 0)}
                      </div>
                      <small className="text-muted">תתי-סעיפים</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="bi bi-trophy text-warning me-2"></i>
                    <div>
                      <div className="fw-bold">
                        {sections.reduce((total, section) => total + (parseFloat(section.maxPoints) || 0), 0)}
                      </div>
                      <small className="text-muted">נקודות כולל</small>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FormSectionsManager;