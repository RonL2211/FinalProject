// src/pages/FacultyHeadDashboard.jsx
import React from "react";
import { getCurrentUser } from "../services/authService";
import { Card } from "react-bootstrap";

function FacultyHeadDashboard() {
  const user = getCurrentUser();

  return (
    <div dir="rtl">
      <Card className="text-center">
        <Card.Header>ברוכים הבאים, ראש הפקולטה</Card.Header>
        <Card.Body>
          <Card.Title>
            שלום {user?.firstName} {user?.lastName}!
          </Card.Title>
          <Card.Text>
            זהו דף הבית שלך. כאן תוכל לנהל מחלקות, לצפות בדוחות ולערוך הגדרות פקולטה.
          </Card.Text>
          <hr />
          <h5>פרטי המשתמש:</h5>
          <ul className="list-unstyled">
            <li>ת.ז.: {user?.personId}</li>
            <li>שם: {user?.firstName} {user?.lastName}</li>
            <li>אימייל: {user?.email}</li>
            <li>מחלקה: {user?.departmentID}</li>
            <li>תפקיד: {user?.position}</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
}

export default FacultyHeadDashboard;
