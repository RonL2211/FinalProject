// src/components/Layout/AppNavbar.jsx
import React from 'react';
import { Navbar, Nav, Container, Dropdown, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AppNavbar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const items = [];

    if (hasRole('מנהל סטודנטים')) {
      items.push(
        { path: '/manager', label: 'דף הבית', exact: true },
        { path: '/manager/forms', label: 'ניהול טפסים' },
        { path: '/manager/appeals', label: 'ערעורים' },
        { path: '/manager/users', label: 'ניהול משתמשים' }
      );
    } else if (hasRole('דיקאן')) {
      items.push(
        { path: '/dean', label: 'דף הבית', exact: true },
        { path: '/dean/review', label: 'בדיקת טפסים' },
        { path: '/dean/reports', label: 'דוחות פקולטה' }
      );
    } else if (hasRole('ראש מחלקה')) {
      items.push(
        { path: '/dept-head', label: 'דף הבית', exact: true },
        { path: '/dept-head/review', label: 'בדיקת טפסים' },
        { path: '/dept-head/reports', label: 'דוחות מחלקה' }
      );
    } else if (hasRole('מרצה') || hasRole('ראש התמחות')) {
      items.push(
        { path: '/lecturer', label: 'דף הבית', exact: true },
        { path: '/lecturer/forms', label: 'טפסים זמינים' },
        { path: '/lecturer/my-forms', label: 'הטפסים שלי' }
      );
    }

    return items;
  };

  const isActivePath = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <strong>RuppStar</strong>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />
        
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            {getNavItems().map((item) => (
              <Nav.Link
                key={item.path}
                as={Link}
                to={item.path}
                className={isActivePath(item.path, item.exact) ? 'active' : ''}
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-flex align-items-center">
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" size="sm">
                {user?.firstName} {user?.lastName}
              </Dropdown.Toggle>
              
              <Dropdown.Menu>
                <Dropdown.Header>
                  {user?.personId}
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/profile">
                  הפרופיל שלי
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  התנתקות
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;