const removeSubSection = (subIndex) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את תת-הסעיף?')) {
      const updatedSubSections = (section.subSections || []).filter((_, idx) => idx !== subIndex);
      // Update order indices
      updatedSubSections.forEach((subSection, idx) => {
        subSection.orderIndex = idx + 1;
      });
      onUpdateSection(sectionIndex, 'subSections', updatedSubSections);
    }
  };// src/pages/AddForm/components/SectionCard.jsx
import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Collapse, Badge } from 'react-bootstrap';
import FieldCard from './FieldCard';
import EmptyState from './EmptyState';

const SectionCard = ({ 
  section, 
  sectionIndex, 
  onUpdateSection, 
  onRemoveSection,
  onAddField,
  onUpdateField,
  onRemoveField,
  departments = [],
  users = []
}) => {
  const [showFields, setShowFields] = useState(true);
  const [showSubSections, setShowSubSections] = useState(false);

  const handleUpdate = (field, value) => {
    onUpdateSection(sectionIndex, field, value);
  };

  const addSubSection = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const newSubSection = {
      id: Date.now(),
      title: '',
      description: '',
      explanation: '',
      maxPoints: '',
      level: 1,
      orderIndex: (section.subSections?.length || 0) + 1,
      isRequired: false,
      isVisible: true,
      maxOccurrences: 1,
      responsibleEntity: section.responsibleEntity,
      responsiblePerson: section.responsiblePerson || currentUser?.personId || '',
      fields: [
        // Add a default field to satisfy server requirements
        {
          id: Date.now() + 1,
          fieldName: `default_field_${Date.now()}`,
          fieldLabel: '',
          fieldType: '',
          isRequired: false,
          defaultValue: '',
          placeholder: '',
          helpText: '',
          orderIndex: 1,
          isVisible: true,
          maxLength: null,
          minValue: null,
          maxValue: null,
          isActive: true,
          options: []
        }
      ],
      subSections: [],
      permissions: []
    };

    const updatedSection = {
      ...section,
      subSections: [...(section.subSections || []), newSubSection]
    };

    onUpdateSection(sectionIndex, 'subSections', updatedSection.subSections);
  };

  const updateSubSection = (subIndex, field, value) => {
    const updatedSubSections = [...(section.subSections || [])];
    updatedSubSections[subIndex] = {
      ...updatedSubSections[subIndex],
      [field]: value
    };
    onUpdateSection(sectionIndex, 'subSections', updatedSubSections);
  };

  const addFieldToSubSection = (subIndex) => {
    const newField = {
      id: Date.now(),
      fieldName: `subfield_${Date.now()}`,
      fieldLabel: '',
      fieldType: '',
      isRequired: false,
      defaultValue: '',
      placeholder: '',
      helpText: '',
      orderIndex: (section.subSections[subIndex].fields?.length || 0) + 1,
      isVisible: true,
      maxLength: null,
      minValue: null,
      maxValue: null,
      isActive: true,
      options: []
    };

    const updatedSubSections = [...(section.subSections || [])];
    updatedSubSections[subIndex] = {
      ...updatedSubSections[subIndex],
      fields: [...(updatedSubSections[subIndex].fields || []), newField]
    };
    
    onUpdateSection(sectionIndex, 'subSections', updatedSubSections);
  };

  const updateSubSectionField = (subIndex, fieldIndex, field, value) => {
    const updatedSubSections = [...(section.subSections || [])];
    updatedSubSections[subIndex].fields[fieldIndex][field] = value;

    // Auto-generate field name from label
    if (field === 'fieldLabel' && !updatedSubSections[subIndex].fields[fieldIndex].fieldName) {
      const systemName = value
        .replace(/\s+/g, '_')
        .replace(/[^\w\s]/gi, '')
        .toLowerCase();
      updatedSubSections[subIndex].fields[fieldIndex].fieldName = systemName || `subfield_${Date.now()}`;
    }

    // Add default options for select fields
    if (field === 'fieldType' && ['select', 'radio', 'checkbox'].includes(value)) {
      if (!updatedSubSections[subIndex].fields[fieldIndex].options?.length) {
        updatedSubSections[subIndex].fields[fieldIndex].options = [{
          id: Date.now(),
          optionValue: 'option_1',
          optionLabel: '',
          scoreValue: 0,
          orderIndex: 1,
          isDefault: true
        }];
      }
    }

    onUpdateSection(sectionIndex, 'subSections', updatedSubSections);
  };

  const removeSubSectionField = (subIndex, fieldIndex) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את השדה?')) {
      const updatedSubSections = [...(section.subSections || [])];
      updatedSubSections[subIndex].fields.splice(fieldIndex, 1);
      
      // Update order indices
      updatedSubSections[subIndex].fields.forEach((field, idx) => {
        field.orderIndex = idx + 1;
      });
      
      onUpdateSection(sectionIndex, 'subSections', updatedSubSections);
    }
  };

  const fieldsCount = section.fields?.length || 0;
  const subSectionsCount = section.subSections?.length || 0;

  return (
    <Card className="mb-4 shadow-sm border-0 section-card">
      {/* Section Header */}
      <Card.Header className="d-flex justify-content-between align-items-center bg-gradient-primary text-white">
        <div className="d-flex align-items-center">
          <span className="badge bg-white text-primary me-3 rounded-circle fs-6 fw-bold">
            {sectionIndex + 1}
          </span>
          <div>
            <h6 className="mb-0 text-white">
              {section.title || "סעיף חדש"}
            </h6>
            {section.maxPoints && (
              <small className="text-white-50">
                {section.maxPoints} נקודות מקסימום
              </small>
            )}
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          {section.isRequired && (
            <span className="badge bg-warning text-dark">חובה</span>
          )}
          <Button 
            variant="outline-light" 
            size="sm" 
            onClick={() => onRemoveSection(sectionIndex)}
            className="rounded-circle"
            style={{ width: '32px', height: '32px', padding: '0' }}
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Basic Section Info */}
        <Row className="mb-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label className="fw-semibold">
                כותרת הסעיף <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="הזן כותרת לסעיף"
                value={section.title || ''}
                onChange={(e) => handleUpdate("title", e.target.value)}
                className="rounded-pill"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-semibold">
                ניקוד מקסימלי <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={section.maxPoints || ''}
                onChange={(e) => handleUpdate("maxPoints", e.target.value)}
                className="rounded-pill"
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">תיאור הסעיף</Form.Label>
              <Form.Control
                type="text"
                placeholder="תיאור קצר של הסעיף"
                value={section.description || ''}
                onChange={(e) => handleUpdate("description", e.target.value)}
                className="rounded-pill"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">הסבר למילוי</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="הנחיות למילוי הסעיף"
                value={section.explanation || ''}
                onChange={(e) => handleUpdate("explanation", e.target.value)}
                className="rounded"
              />
            </Form.Group>
          </Col>
        </Row>
        
        {/* Responsible Settings */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">גורם אחראי (מחלקה)</Form.Label>
              <Form.Select
                value={section.responsibleEntity || ""}
                onChange={(e) => handleUpdate("responsibleEntity", e.target.value ? parseInt(e.target.value) : null)}
                className="rounded-pill"
              >
                <option value="">בחר מחלקה</option>
                {departments.map(dept => (
                  <option key={dept.departmentID} value={dept.departmentID}>
                    {dept.departmentName}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">איזה מחלקה אחראית על הסעיף</Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">אדם אחראי <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={section.responsiblePerson || ""}
                onChange={(e) => handleUpdate("responsiblePerson", e.target.value)}
                className="rounded-pill"
              >
                <option value="">בחר אדם אחראי</option>
                {users.map(user => (
                  <option key={user.personId} value={user.personId}>
                    {user.firstName} {user.lastName} ({user.position || 'לא צוין'})
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">מי אחראי לבדוק את הסעיף הזה</Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Section Settings */}
        <Row className="mb-4">
          <Col md={4}>
            <div className="d-flex gap-4">
              <Form.Check
                type="switch"
                id={`required-switch-${sectionIndex}`}
                label="סעיף חובה"
                checked={section.isRequired || false}
                onChange={(e) => handleUpdate("isRequired", e.target.checked)}
              />
              <Form.Check
                type="switch"
                id={`visible-switch-${sectionIndex}`}
                label="סעיף גלוי"
                checked={section.isVisible !== false}
                onChange={(e) => handleUpdate("isVisible", e.target.checked)}
              />
            </div>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-semibold">מספר מופעים מקסימלי</Form.Label>
              <Form.Control
                type="number"
                min="1"
                placeholder="1"
                value={section.maxOccurrences || 1}
                onChange={(e) => handleUpdate("maxOccurrences", parseInt(e.target.value) || 1)}
                className="rounded-pill"
              />
              <Form.Text className="text-muted">
                כמה פעמים ניתן למלא את הסעיף הזה
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <hr className="my-4" />

        {/* Section Fields */}
        <div className="mb-4">
          <div 
            className="d-flex justify-content-between align-items-center mb-3 cursor-pointer"
            onClick={() => setShowFields(!showFields)}
          >
            <h6 className="mb-0 d-flex align-items-center">
              <i className={`bi bi-chevron-${showFields ? 'down' : 'left'} me-2 text-primary`}></i>
              <i className="bi bi-input-cursor me-2 text-primary"></i>
              שדות בסעיף
              {fieldsCount > 0 && (
                <span className="badge bg-primary ms-2 rounded-pill">{fieldsCount}</span>
              )}
            </h6>
            <Button 
              variant="success" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddField(sectionIndex);
              }}
              className="rounded-pill px-3"
            >
              <i className="bi bi-plus-lg me-1"></i> הוסף שדה
            </Button>
          </div>
          
          <Collapse in={showFields}>
            <div>
              {fieldsCount === 0 ? (
                <EmptyState
                  icon="bi-input-cursor-text"
                  title="אין שדות בסעיף זה"
                  description="הוסף שדה ראשון כדי שמשתמשים יוכלו למלא מידע"
                  actionLabel="הוסף שדה"
                  onAction={() => onAddField(sectionIndex)}
                  size="sm"
                />
              ) : (
                <div className="fields-container">
                  {section.fields.map((field, fieldIndex) => (
                    <FieldCard
                      key={field.id || fieldIndex}
                      field={field}
                      fieldIndex={fieldIndex}
                      sectionIndex={sectionIndex}
                      onUpdateField={onUpdateField}
                      onRemoveField={onRemoveField}
                    />
                  ))}
                </div>
              )}
            </div>
          </Collapse>
        </div>

        <hr className="my-4" />

        {/* Sub-sections */}
        <div className="mb-3">
          <div 
            className="d-flex justify-content-between align-items-center mb-3 cursor-pointer"
            onClick={() => setShowSubSections(!showSubSections)}
          >
            <h6 className="mb-0 d-flex align-items-center">
              <i className={`bi bi-chevron-${showSubSections ? 'down' : 'left'} me-2 text-primary`}></i>
              <i className="bi bi-diagram-3 me-2 text-primary"></i>
              תתי-סעיפים
              {subSectionsCount > 0 && (
                <span className="badge bg-info ms-2 rounded-pill">{subSectionsCount}</span>
              )}
            </h6>
            <Button 
              variant="info" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                addSubSection();
              }}
              className="rounded-pill px-3"
            >
              <i className="bi bi-plus-lg me-1"></i> הוסף תת-סעיף
            </Button>
          </div>
          
          <Collapse in={showSubSections}>
            <div>
              {subSectionsCount === 0 ? (
                <EmptyState
                  icon="bi-diagram-3"
                  title="אין תתי-סעיפים"
                  description="תוכל להוסיף תתי-סעיפים לארגון נוסף של התוכן"
                  actionLabel="הוסף תת-סעיף"
                  onAction={addSubSection}
                  size="sm"
                />
              ) : (
                <div className="sub-sections-container">
                  {section.subSections.map((subSection, subIndex) => (
                    <Card key={subSection.id || subIndex} className="mb-3 border-light ms-3">
                      <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 d-flex align-items-center">
                          <span className="badge bg-info me-2 rounded-circle">{subIndex + 1}</span>
                          {subSection.title || `תת-סעיף ${subIndex + 1}`}
                          {subSection.maxPoints && (
                            <Badge bg="success" className="ms-2 rounded-pill">
                              {subSection.maxPoints} נק'
                            </Badge>
                          )}
                          {subSection.isRequired && (
                            <Badge bg="danger" className="ms-2">חובה</Badge>
                          )}
                        </h6>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => removeSubSection(subIndex)}
                          className="rounded-circle"
                          style={{ width: '28px', height: '28px', padding: '0' }}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </Card.Header>
                      <Card.Body className="p-3">
                        <Row className="mb-3">
                          <Col md={8}>
                            <Form.Group>
                              <Form.Label className="fw-semibold">
                                כותרת תת-הסעיף <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="הזן כותרת"
                                value={subSection.title || ''}
                                onChange={(e) => updateSubSection(subIndex, "title", e.target.value)}
                                className="rounded-pill"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label className="fw-semibold">
                                ניקוד מקסימלי <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Control
                                type="number"
                                placeholder="0"
                                value={subSection.maxPoints || ''}
                                onChange={(e) => updateSubSection(subIndex, "maxPoints", e.target.value)}
                                className="rounded-pill"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">הסבר תת-הסעיף</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="הסבר על תת-הסעיף"
                            value={subSection.explanation || ''}
                            onChange={(e) => updateSubSection(subIndex, "explanation", e.target.value)}
                            className="rounded"
                          />
                        </Form.Group>
                        
                        <div className="mb-3 d-flex gap-3">
                          <Form.Check
                            type="switch"
                            id={`required-subsection-${sectionIndex}-${subIndex}`}
                            label="תת-סעיף חובה"
                            checked={subSection.isRequired || false}
                            onChange={(e) => updateSubSection(subIndex, "isRequired", e.target.checked)}
                          />
                          <Form.Check
                            type="switch"
                            id={`visible-subsection-${sectionIndex}-${subIndex}`}
                            label="תת-סעיף גלוי"
                            checked={subSection.isVisible !== false}
                            onChange={(e) => updateSubSection(subIndex, "isVisible", e.target.checked)}
                          />
                        </div>

                        <hr />

                        {/* Fields for Sub-section */}
                        <div className="sub-section-fields">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0 d-flex align-items-center">
                              <i className="bi bi-input-cursor me-2 text-success"></i>
                              שדות בתת-הסעיף
                              {subSection.fields?.length > 0 && (
                                <Badge bg="success" className="ms-2 rounded-pill">
                                  {subSection.fields.length}
                                </Badge>
                              )}
                            </h6>
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => addFieldToSubSection(subIndex)}
                              className="rounded-pill px-3"
                            >
                              <i className="bi bi-plus-lg me-1"></i> הוסף שדה
                            </Button>
                          </div>
                          
                          {(!subSection.fields || subSection.fields.length === 0) ? (
                            <EmptyState
                              icon="bi-input-cursor-text"
                              title="אין שדות בתת-סעיף זה"
                              description="הוסף שדה ראשון כדי שמשתמשים יוכלו למלא מידע"
                              actionLabel="הוסף שדה"
                              onAction={() => addFieldToSubSection(subIndex)}
                              size="sm"
                              variant="white"
                            />
                          ) : (
                            <div className="sub-section-fields-container">
                              {subSection.fields.map((field, fieldIndex) => (
                                <div key={field.id || fieldIndex} className="mb-2">
                                  <FieldCard
                                    field={field}
                                    fieldIndex={fieldIndex}
                                    sectionIndex={`${sectionIndex}-sub-${subIndex}`} // Unique identifier
                                    onUpdateField={(sIdx, fIdx, fieldName, value) => 
                                      updateSubSectionField(subIndex, fIdx, fieldName, value)
                                    }
                                    onRemoveField={(sIdx, fIdx) => 
                                      removeSubSectionField(subIndex, fIdx)
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Collapse>
        </div>
      </Card.Body>
    </Card>
  );
};

// Custom styles for the card
const cardStyles = `
.section-card .bg-gradient-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('section-card-styles')) {
  const style = document.createElement('style');
  style.id = 'section-card-styles';
  style.textContent = cardStyles;
  document.head.appendChild(style);
}

export default SectionCard;