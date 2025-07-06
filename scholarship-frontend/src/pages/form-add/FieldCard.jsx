// src/pages/form-add/FieldCard.jsx
import React, { useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import FieldOptionsManager from './FieldOptionsManager';

const FIELD_TYPES = [
  { value: "text", label: "טקסט קצר", icon: "bi-input-cursor-text" },
  { value: "textarea", label: "טקסט ארוך", icon: "bi-textarea-t" },
  { value: "number", label: "מספר", icon: "bi-123" },
  { value: "date", label: "תאריך", icon: "bi-calendar" },
  { value: "select", label: "תפריט בחירה", icon: "bi-menu-button-wide" },
  { value: "checkbox", label: "תיבת סימון", icon: "bi-check-square" },
  { value: "radio", label: "כפתורי רדיו", icon: "bi-record-circle" },
  { value: "file", label: "העלאת קובץ", icon: "bi-file-earmark-arrow-up" },
  { value: "url", label: "כתובת אינטרנט", icon: "bi-link-45deg" },
  { value: "email", label: "דוא״ל", icon: "bi-envelope" }
];

const FieldCard = ({ 
  field, 
  fieldIndex, 
  sectionIndex, 
  onUpdateField, 
  onRemoveField 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUpdate = (fieldName, value) => {
    onUpdateField(sectionIndex, fieldIndex, fieldName, value);
  };

  const handleRemove = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את השדה?')) {
      onRemoveField(sectionIndex, fieldIndex);
    }
  };

  const getFieldTypeInfo = (type) => {
    return FIELD_TYPES.find(t => t.value === type) || { icon: "bi-question", label: type };
  };

  const fieldTypeInfo = getFieldTypeInfo(field.fieldType);
  const needsOptions = ['select', 'radio', 'checkbox'].includes(field.fieldType);

  return (
    <Card className="mb-3 border-light shadow-sm field-card">
      {/* Field Header */}
      <Card.Header 
        className="bg-white d-flex justify-content-between align-items-center py-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="d-flex align-items-center">
          <div 
            className="field-type-icon me-3 rounded-circle d-flex align-items-center justify-content-center"
            style={{ 
              width: '35px', 
              height: '35px', 
              backgroundColor: field.fieldType ? '#e3f2fd' : '#f5f5f5',
              color: field.fieldType ? '#1976d2' : '#999'
            }}
          >
            <i className={fieldTypeInfo.icon}></i>
          </div>
          <div>
            <h6 className="mb-0">
              {field.fieldLabel || `שדה ${fieldIndex + 1}`}
              {field.isRequired && <span className="text-danger ms-1">*</span>}
            </h6>
            <small className="text-muted">
              {fieldTypeInfo.label}
              {needsOptions && field.options?.length > 0 && 
                ` (${field.options.length} אפשרויות)`
              }
            </small>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} text-muted`}></i>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="rounded-circle"
            style={{ width: '32px', height: '32px', padding: '0' }}
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </div>
      </Card.Header>

      {/* Field Details */}
      {isExpanded && (
        <Card.Body className="p-3">
          {/* Basic Field Info */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  תווית השדה <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="לדוגמה: מספר קורסים"
                  value={field.fieldLabel || ''}
                  onChange={(e) => handleUpdate("fieldLabel", e.target.value)}
                  className="rounded-pill"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  סוג השדה <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={field.fieldType || ''}
                  onChange={(e) => handleUpdate("fieldType", e.target.value)}
                  className="rounded-pill"
                >
                  <option value="">בחר סוג שדה</option>
                  {FIELD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Field Name and Help */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">שם שדה מערכתי</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="לדוגמה: courseCount"
                  value={field.fieldName || ''}
                  onChange={(e) => handleUpdate("fieldName", e.target.value)}
                  className="rounded-pill"
                />
                <Form.Text className="text-muted">
                  זיהוי פנימי של השדה (באנגלית בלבד)
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">טקסט עזרה</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="הסבר למשתמש"
                  value={field.helpText || ''}
                  onChange={(e) => handleUpdate("helpText", e.target.value)}
                  className="rounded-pill"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Conditional Fields based on type */}
          {['text', 'textarea'].includes(field.fieldType) && (
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">טקסט מציין מקום</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="טקסט שיופיע בשדה לפני המילוי"
                    value={field.placeholder || ''}
                    onChange={(e) => handleUpdate("placeholder", e.target.value)}
                    className="rounded-pill"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">אורך מקסימלי</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="ללא הגבלה"
                    value={field.maxLength || ''}
                    onChange={(e) => handleUpdate("maxLength", e.target.value ? parseInt(e.target.value) : null)}
                    className="rounded-pill"
                  />
                </Form.Group>
              </Col>
            </Row>
          )}

          {field.fieldType === 'number' && (
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">ערך ברירת מחדל</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    value={field.defaultValue || ''}
                    onChange={(e) => handleUpdate("defaultValue", e.target.value)}
                    className="rounded-pill"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">ערך מינימלי</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="ללא מינימום"
                    value={field.minValue || ''}
                    onChange={(e) => handleUpdate("minValue", e.target.value)}
                    className="rounded-pill"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">ערך מקסימלי</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="ללא מקסימום"
                    value={field.maxValue || ''}
                    onChange={(e) => handleUpdate("maxValue", e.target.value)}
                    className="rounded-pill"
                  />
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* Field Settings */}
          <div className="mb-3 d-flex gap-4">
            <Form.Check
              type="switch"
              id={`required-field-${sectionIndex}-${fieldIndex}`}
              label="שדה חובה"
              checked={field.isRequired || false}
              onChange={(e) => handleUpdate("isRequired", e.target.checked)}
            />
            <Form.Check
              type="switch"
              id={`visible-field-${sectionIndex}-${fieldIndex}`}
              label="שדה גלוי"
              checked={field.isVisible !== false}
              onChange={(e) => handleUpdate("isVisible", e.target.checked)}
            />
          </div>

          {/* Field Options for select/radio/checkbox */}
          {needsOptions && (
            <FieldOptionsManager
              field={field}
              sectionIndex={sectionIndex}
              fieldIndex={fieldIndex}
              onUpdateField={onUpdateField}
            />
          )}
        </Card.Body>
      )}
    </Card>
  );
};

// Custom styles
const fieldCardStyles = `
.field-card .cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.field-card .cursor-pointer:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.field-card {
  transition: all 0.3s ease;
}

.field-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('field-card-styles')) {
  const style = document.createElement('style');
  style.id = 'field-card-styles';
  style.textContent = fieldCardStyles;
  document.head.appendChild(style);
}

export default FieldCard;