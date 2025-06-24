//src/pages/CommitteePage.jsx
import React from "react";
import { getCurrentUser } from "../services/authService";

function CommitteePage() {
  const currentUser = getCurrentUser();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>שלום {currentUser?.firstName} {currentUser?.lastName}!</h1>
      <p>ברוכים הבאים לעמוד חבר הוועדה.</p>
      <h3>פרטי המשתמש:</h3>
      <ul>
        <li>תעודת זהות: {currentUser?.personId}</li>
        <li>שם: {currentUser?.firstName} {currentUser?.lastName}</li>
        <li>אימייל: {currentUser?.email}</li>
        <li>מחלקה: {currentUser?.departmentID}</li>
        <li>תפקיד: {currentUser?.position}</li>
      </ul>
    </div>
  );
}

export default CommitteePage;


