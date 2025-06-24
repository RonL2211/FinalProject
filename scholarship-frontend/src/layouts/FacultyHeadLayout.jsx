// src/layouts/FacultyHeadLayout.jsx
import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { getCurrentUser, logout } from "../services/authService";
import ruppstarLogo from "../assets/Logo.png";

const FacultyHeadLayout = () => {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const handleBack = () => navigate(-1);

  return (
    <div dir="rtl">
      <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand as={Link} to="/faculty-head">
            <img
              src={ruppstarLogo}
              alt="Logo"
              style={{ width: "40px", marginRight: "10px" }}
            />
            מערכת ראש פקולטה
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="faculty-navbar-nav" />
          <Navbar.Collapse id="faculty-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/faculty-head">
                דף הבית
              </Nav.Link>
              <Nav.Link as={Link} to="/faculty-head/profile">
                הפרופיל שלי
              </Nav.Link>
              <Nav.Link as={Link} to="/faculty-head/departments">
                ניהול מחלקות
              </Nav.Link>
              <Nav.Link as={Link} to="/faculty-head/reports">
                דוחות
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

      <div style={{ marginTop: "70px" }}>
        <Container className="mt-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default FacultyHeadLayout;
