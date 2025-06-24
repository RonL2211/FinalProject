// src/pages/AddForm/BasicFormDetails.jsx
import React, { useEffect } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';

const BasicFormDetails = ({ formData, updateFormData }) => {
  // קביעת שנת לימודים אוטומטית בטעינת הקומפוננטה
  useEffect(() => {
    if (!formData.academicYear) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const monthNow = currentDate.getMonth() + 1;
      
      // קביעת שנת הלימודים בהתאם לחודש הנוכחי
      const academicYearStart = monthNow >= 10 ? currentYear : currentYear - 1;
      const academicYearEnd = academicYearStart + 1;
      updateFormData("academicYear", `${academicYearStart}-${academicYearEnd}`);
    }
  }, []);

  return (
    <>
    <Card className="shadow-sm">
      <Card.Body>
        <h5 className="mb-4">פרטי טופס בסיסיים</h5>
        
        <Row className="mb-3">
          <Col md={8}>
            <Form.Group controlId="formName">
              <Form.Label>שם הטופס <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="לדוגמה: טופס תגמול מרצים מצטיינים 2025"
                value={formData.formName || ''}
                onChange={(e) => updateFormData("formName", e.target.value)}
                className="rounded-pill"
              />
              <Form.Text className="text-muted">שם הטופס כפי שיופיע למשתמשים</Form.Text>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="academicYear">
              <Form.Label>שנת לימודים <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="לדוגמה: 2024-2025"
                value={formData.academicYear || ''}
                onChange={(e) => updateFormData("academicYear", e.target.value)}
                className="rounded-pill"
              />
              <Form.Text className="text-muted">יש להזין בפורמט YYYY-YYYY</Form.Text>
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="semester">
              <Form.Label>סמסטר</Form.Label>
              <Form.Select
                value={formData.semester || ''}
                onChange={(e) => updateFormData("semester", e.target.value)}
                className="rounded-pill"
              >
                <option value="">בחר סמסטר</option>
                <option value="א">סמסטר א'</option>
                <option value="ב">סמסטר ב'</option>
                <option value="ק">סמסטר קיץ</option>
                <option value="ש">שנתי</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="startDate">
              <Form.Label>תאריך פתיחה <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => updateFormData("startDate", e.target.value)}
                className="rounded-pill"
              />
              <Form.Text className="text-muted">מתי הטופס יהיה זמין למילוי</Form.Text>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="dueDate">
              <Form.Label>תאריך סיום</Form.Label>
              <Form.Control
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => updateFormData("dueDate", e.target.value)}
                className="rounded-pill"
              />
              <Form.Text className="text-muted">תאריך אחרון למילוי הטופס</Form.Text>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>

    <Card className="shadow-sm mt-4">
      <Card.Body>
        <h5 className="mb-4">תוכן והנחיות</h5>
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="description">
              <Form.Label>תיאור הטופס</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="תיאור כללי של הטופס ומטרתו"
                value={formData.description || ''}
                onChange={(e) => updateFormData("description", e.target.value)}
                className="rounded"
              />
              <Form.Text className="text-muted">תיאור זה יוצג בראש הטופס</Form.Text>
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="instructions">
              <Form.Label>הוראות למילוי הטופס</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="הוראות מפורטות למילוי הטופס - למשל: 'יש למלא את כל השדות המסומנים בכוכבית ולהקפיד על הגשה עד התאריך הנקוב'"
                value={formData.instructions || ''}
                onChange={(e) => updateFormData("instructions", e.target.value)}
                className="rounded"
              />
              <Form.Text className="text-muted">הנחיות ברורות יעזרו למרצים למלא את הטופס בצורה נכונה</Form.Text>
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col>
            <Form.Check
              type="switch"
              id="isActiveSwitch"
              label="טופס פעיל"
              checked={formData.isActive !== false}
              onChange={(e) => updateFormData("isActive", e.target.checked)}
            />
            <Form.Text className="text-muted">טופס פעיל יהיה זמין למילוי בתאריכים שנקבעו</Form.Text>
          </Col>
        </Row>
      </Card.Body>
    </Card>
    </>
  );
};

export default BasicFormDetails;