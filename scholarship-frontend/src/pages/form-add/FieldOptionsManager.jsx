// src/pages/form-add/FieldOptionsManager.jsx
import React from 'react';
import { Card, Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
import EmptyState from './EmptyState';

const FieldOptionsManager = ({ 
  field, 
  sectionIndex, 
  fieldIndex, 
  onUpdateField 
}) => {
  const options = field.options || [];

  const addOption = () => {
    const newOption = {
      id: Date.now(),
      optionValue: `option_${options.length + 1}`,
      optionLabel: '',
      scoreValue: 0,
      orderIndex: options.length + 1,
      isDefault: options.length === 0 // First option is default
    };

    const updatedOptions = [...options, newOption];
    onUpdateField(sectionIndex, fieldIndex, 'options', updatedOptions);
  };

  const updateOption = (optionIndex, field, value) => {
    const updatedOptions = [...options];
    updatedOptions[optionIndex][field] = value;

    // If setting as default, unset others
    if (field === 'isDefault' && value === true) {
      updatedOptions.forEach((opt, idx) => {
        if (idx !== optionIndex) {
          opt.isDefault = false;
        }
      });
    }

    onUpdateField(sectionIndex, fieldIndex, 'options', updatedOptions);
  };

  const removeOption = (optionIndex) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את האפשרות?')) {
      const updatedOptions = options.filter((_, idx) => idx !== optionIndex);
      
      // Update order indices
      updatedOptions.forEach((opt, idx) => {
        opt.orderIndex = idx + 1;
      });

      // If removed option was default, make first option default
      if (options[optionIndex]?.isDefault && updatedOptions.length > 0) {
        updatedOptions[0].isDefault = true;
      }

      onUpdateField(sectionIndex, fieldIndex, 'options', updatedOptions);
    }
  };

  const moveOption = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= options.length) return;

    const updatedOptions = [...options];
    const [movedOption] = updatedOptions.splice(fromIndex, 1);
    updatedOptions.splice(toIndex, 0, movedOption);

    // Update order indices
    updatedOptions.forEach((opt, idx) => {
      opt.orderIndex = idx + 1;
    });

    onUpdateField(sectionIndex, fieldIndex, 'options', updatedOptions);
  };

  return (
    <div className="field-options-manager mt-3">
      <Card className="border-light bg-light">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0 d-flex align-items-center">
              <i className="bi bi-list-check me-2 text-primary"></i>
              אפשרויות בחירה
              {options.length > 0 && (
                <Badge bg="primary" className="ms-2 rounded-pill">
                  {options.length}
                </Badge>
              )}
            </h6>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={addOption}
              className="rounded-pill px-3"
            >
              <i className="bi bi-plus-lg me-1"></i> הוסף אפשרות
            </Button>
          </div>
        </Card.Header>
        
        <Card.Body className="p-3">
          {options.length === 0 ? (
            <EmptyState
              icon="bi-list-ul"
              title="אין אפשרויות בחירה"
              description="הוסף אפשרות ראשונה כדי שמשתמשים יוכלו לבחור"
              actionLabel="הוסף אפשרות"
              onAction={addOption}
              size="sm"
              variant="white"
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="d-none d-md-block">
                <Table size="sm" hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{width: "5%"}}>#</th>
                      <th style={{width: "35%"}}>תווית לתצוגה</th>
                      <th style={{width: "25%"}}>ערך לשמירה</th>
                      <th style={{width: "15%"}}>ניקוד</th>
                      <th style={{width: "10%"}}>ברירת מחדל</th>
                      <th style={{width: "10%"}}>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {options.map((option, optionIndex) => (
                      <tr key={option.id || optionIndex}>
                        <td className="text-center align-middle">
                          <div className="d-flex flex-column gap-1">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => moveOption(optionIndex, optionIndex - 1)}
                              disabled={optionIndex === 0}
                              className="p-1"
                              style={{ fontSize: '10px' }}
                            >
                              <i className="bi bi-chevron-up"></i>
                            </Button>
                            <span className="small fw-bold">{optionIndex + 1}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => moveOption(optionIndex, optionIndex + 1)}
                              disabled={optionIndex === options.length - 1}
                              className="p-1"
                              style={{ fontSize: '10px' }}
                            >
                              <i className="bi bi-chevron-down"></i>
                            </Button>
                          </div>
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="text"
                            placeholder="תווית האפשרות"
                            value={option.optionLabel || ''}
                            onChange={(e) => updateOption(optionIndex, "optionLabel", e.target.value)}
                            className="rounded-pill"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="text"
                            placeholder="ערך"
                            value={option.optionValue || ''}
                            onChange={(e) => updateOption(optionIndex, "optionValue", e.target.value)}
                            className="rounded-pill"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="number"
                            placeholder="0"
                            value={option.scoreValue || ''}
                            onChange={(e) => updateOption(optionIndex, "scoreValue", parseFloat(e.target.value) || 0)}
                            className="rounded-pill"
                          />
                        </td>
                        <td className="text-center align-middle">
                          <Form.Check
                            type="radio"
                            name={`default-option-${sectionIndex}-${fieldIndex}`}
                            checked={option.isDefault || false}
                            onChange={() => updateOption(optionIndex, "isDefault", true)}
                          />
                        </td>
                        <td className="text-center align-middle">
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => removeOption(optionIndex)}
                            className="rounded-circle"
                            style={{ width: '28px', height: '28px', padding: '0' }}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="d-md-none">
                {options.map((option, optionIndex) => (
                  <Card key={option.id || optionIndex} className="mb-2 border-light">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-primary rounded-pill">אפשרות {optionIndex + 1}</span>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => moveOption(optionIndex, optionIndex - 1)}
                            disabled={optionIndex === 0}
                            className="rounded-circle"
                            style={{ width: '28px', height: '28px', padding: '0' }}
                          >
                            <i className="bi bi-chevron-up"></i>
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => moveOption(optionIndex, optionIndex + 1)}
                            disabled={optionIndex === options.length - 1}
                            className="rounded-circle"
                            style={{ width: '28px', height: '28px', padding: '0' }}
                          >
                            <i className="bi bi-chevron-down"></i>
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => removeOption(optionIndex)}
                            className="rounded-circle"
                            style={{ width: '28px', height: '28px', padding: '0' }}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>
                      
                      <Row className="mb-2">
                        <Col xs={12}>
                          <Form.Group>
                            <Form.Label className="small fw-semibold">תווית לתצוגה</Form.Label>
                            <Form.Control
                              size="sm"
                              type="text"
                              placeholder="תווית האפשרות"
                              value={option.optionLabel || ''}
                              onChange={(e) => updateOption(optionIndex, "optionLabel", e.target.value)}
                              className="rounded-pill"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row className="mb-2">
                        <Col xs={6}>
                          <Form.Group>
                            <Form.Label className="small fw-semibold">ערך לשמירה</Form.Label>
                            <Form.Control
                              size="sm"
                              type="text"
                              placeholder="ערך"
                              value={option.optionValue || ''}
                              onChange={(e) => updateOption(optionIndex, "optionValue", e.target.value)}
                              className="rounded-pill"
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={6}>
                          <Form.Group>
                            <Form.Label className="small fw-semibold">ניקוד</Form.Label>
                            <Form.Control
                              size="sm"
                              type="number"
                              placeholder="0"
                              value={option.scoreValue || ''}
                              onChange={(e) => updateOption(optionIndex, "scoreValue", parseFloat(e.target.value) || 0)}
                              className="rounded-pill"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <div className="text-center">
                        <Form.Check
                          type="radio"
                          name={`default-option-mobile-${sectionIndex}-${fieldIndex}`}
                          label="ברירת מחדל"
                          checked={option.isDefault || false}
                          onChange={() => updateOption(optionIndex, "isDefault", true)}
                        />
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-3 p-2 bg-info bg-opacity-10 rounded">
                <small className="text-muted d-flex align-items-center">
                  <i className="bi bi-info-circle me-1"></i>
                  סה"כ {options.length} אפשרויות • 
                  {options.filter(opt => opt.isDefault).length > 0 ? 
                    ` ברירת מחדל: "${options.find(opt => opt.isDefault)?.optionLabel || 'לא הוגדר'}"` :
                    ' לא הוגדרה ברירת מחדל'
                  }
                </small>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default FieldOptionsManager;