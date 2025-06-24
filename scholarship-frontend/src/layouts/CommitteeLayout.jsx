// src/layouts/CommitteeLayout.jsx
import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { getCurrentUser, logout } from "../services/authService";
import ruppstarLogo from "../assets/Logo.png";


const CommitteeLayout = () => {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();


  const handleLogout = () => {
    logout();
    navigate("/login");
  };


  const handleBack = () => {
    navigate(-1);
  };


  return (
    <div dir="rtl">
      <Navbar bg="primary" variant="dark" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand as={Link} to="/committee">
            <img
              src={ruppstarLogo}
              alt="Logo"
              style={{ width: "40px", marginRight: "10px" }}
            />
            מערכת מלגות
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="committee-navbar-nav" />
          <Navbar.Collapse id="committee-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/committee/create-form">
                יצירת טופס חדש
              </Nav.Link>
              <Nav.Link as={Link} to="/committee/forms">
                צפייה בטפסים קיימים
              </Nav.Link>
              <Nav.Link as={Link} to="/committee/manage-criteria">
                ניהול קריטריונים
              </Nav.Link>
              <Nav.Link as={Link} to="/committee/statistics">
                סטטיסטיקות
              </Nav.Link>
              <Nav.Link as={Link} to="/committee/publish-decisions">
                פרסום החלטות
              </Nav.Link>
              <Nav.Link as={Link} to="/committee/recent-actions">
                פעולות אחרונות
              </Nav.Link>
            </Nav>
            <div className="d-flex">
              <Button variant="secondary" onClick={handleBack} className="me-2">
                חזור
              </Button>
              <Button variant="danger" onClick={handleLogout}>
                התנתקות
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>


      {/* רווח כדי שהתוכן לא יסתתר מתחת לניווט */}
      <div style={{ marginTop: "70px" }}>
        <Container className="mt-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};


export default CommitteeLayout;





