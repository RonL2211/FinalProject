// src/pages/CommitteeDashboard.jsx
import React from "react";
import { getCurrentUser } from "../services/authService";
import { Card } from "react-bootstrap";

function CommitteeDashboard() {
  const currentUser = getCurrentUser();

  return (
    <div dir="rtl">
      <Card className="text-center">
        <Card.Header>ברוכים הבאים</Card.Header>
        <Card.Body>
          <Card.Title>
            שלום, {currentUser?.firstName} {currentUser?.lastName}!
          </Card.Title>
          <Card.Text>
            זהו המסך הראשי לחברי ועדה.
            בחר אפשרות מהתפריט העליון לצפייה בטפסים, ניהול קריטריונים, סטטיסטיקות, פרסום החלטות ופעולות אחרונות.
          </Card.Text>
          <hr />
          <h5>פרטי המשתמש:</h5>
          <ul className="list-unstyled">
            <li>תעודת זהות: {currentUser?.personId}</li>
            <li>שם: {currentUser?.firstName} {currentUser?.lastName}</li>
            <li>אימייל: {currentUser?.email}</li>
            <li>מחלקה: {currentUser?.departmentID}</li>
            <li>תפקיד: {currentUser?.position}</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CommitteeDashboard;


