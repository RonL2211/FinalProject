// src/layouts/LecturerLayout.jsx
import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { getCurrentUser, logout } from "../services/authService";
import ruppstarLogo from "../assets/Logo.png";

const LecturerLayout = () => {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const handleBack = () => navigate(-1);

  return (
    <div dir="rtl">
      <Navbar bg="primary" variant="dark" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand as={Link} to="/lecturer">
            <img
              src={ruppstarLogo}
              alt="Logo"
              style={{ width: "40px", marginRight: "10px" }}
            />
            מערכת מרצים
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="lecturer-navbar-nav" />
          <Navbar.Collapse id="lecturer-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/lecturer">
                דף הבית
              </Nav.Link>
              <Nav.Link as={Link} to="/lecturer/profile">
                הפרופיל שלי
              </Nav.Link>
              {/* הוסף כאן קישורים נוספים לפי הצורך */}
              <Nav.Link as={Link} to="/lecturer/forms">
                צפייה בטפסים קיימים
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

      {/* ידאג לרווח מתקפל מתחת ל־navbar */}
      <div style={{ marginTop: "70px" }}>
        <Container className="mt-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default LecturerLayout;
