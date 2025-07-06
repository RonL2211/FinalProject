// src/pages/form-add/CommitteeFormsPage.jsx
import React, { useEffect, useState } from "react";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Alert, 
  Badge,
  Form,
  InputGroup,
  Dropdown,
  ButtonGroup
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { getToken } from "../../services/authService";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";

const CommitteeFormsPage = () => {
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [forms, searchTerm, statusFilter, sortBy]);

  const fetchForms = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = getToken();
      const response = await fetch("https://localhost:7230/api/Form", {
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error(await response.text() || `Error ${response.status}`);
      }
      
      const data = await response.json();
      setForms(data);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...forms];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(form =>
        form.formName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(form => {
        switch (statusFilter) {
          case "published":
            return form.isPublished === true;
          case "draft":
            return form.isPublished === false;
          case "active":
            return form.isActive === true;
          case "inactive":
            return form.isActive === false;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.creationDate) - new Date(a.creationDate);
        case "oldest":
          return new Date(a.creationDate) - new Date(b.creationDate);
        case "name":
          return (a.formName || "").localeCompare(b.formName || "");
        case "due":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        default:
          return 0;
      }
    });

    setFilteredForms(filtered);
  };

  const getStatusBadge = (form) => {
    if (!form.isActive) {
      return <Badge bg="secondary">לא פעיל</Badge>;
    }
    if (form.isPublished) {
      return <Badge bg="success">פורסם</Badge>;
    }
    return <Badge bg="warning" text="dark">טיוטה</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "לא הוגדר";
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner message="טוען רשימת טפסים..." />;
  }

  return (
    <Container className="mt-4" dir="rtl">
      {/* Header */}
      <Row className="mb-4">
        <Col xs={12} md={6}>
          <h2 className="mb-1">
            <i className="bi bi-file-text me-2 text-primary"></i>
            ניהול טפסים
          </h2>
          <p className="text-muted mb-0">צפה, ערוך וצור טפסים חדשים</p>
        </Col>
        <Col xs={12} md={6} className="text-md-start text-center mt-2 mt-md-0">
          <Link to="/committee/create-form">
            <Button variant="primary" size="lg" className="rounded-pill px-4">
              <i className="bi bi-plus-lg me-2"></i>
              יצירת טופס חדש
            </Button>
          </Link>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">חיפוש טפסים</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="חפש לפי שם טופס..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">סינון לפי סטטוס</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">הכל ({forms.length})</option>
                  <option value="published">
                    פורסם ({forms.filter(f => f.isPublished).length})
                  </option>
                  <option value="draft">
                    טיוטה ({forms.filter(f => !f.isPublished).length})
                  </option>
                  <option value="active">
                    פעיל ({forms.filter(f => f.isActive).length})
                  </option>
                  <option value="inactive">
                    לא פעיל ({forms.filter(f => !f.isActive).length})
                  </option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">מיון לפי</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">החדשים ביותר</option>
                  <option value="oldest">הישנים ביותר</option>
                  <option value="name">שם הטופס</option>
                  <option value="due">תאריך סיום</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                onClick={fetchForms}
                className="w-100"
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                רענן
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

      {/* Results Summary */}
      {!loading && !error && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="text-muted">
            מציג {filteredForms.length} טפסים מתוך {forms.length}
          </div>
          {searchTerm && (
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => setSearchTerm("")}
            >
              <i className="bi bi-x me-1"></i>
              נקה חיפוש
            </Button>
          )}
        </div>
      )}

      {/* Forms Grid */}
      {!loading && !error && filteredForms.length === 0 && !searchTerm && (
        <EmptyState
          icon="bi-file-text"
          title="אין טפסים קיימים"
          description="התחל ביצירת הטופס הראשון שלך"
          actionLabel="יצירת טופס חדש"
          onAction={() => window.location.href = "/committee/create-form"}
        />
      )}

      {!loading && !error && filteredForms.length === 0 && searchTerm && (
        <EmptyState
          icon="bi-search"
          title="לא נמצאו תוצאות"
          description={`לא נמצאו טפסים שמתאימים לחיפוש "${searchTerm}"`}
          actionLabel="נקה חיפוש"
          onAction={() => setSearchTerm("")}
        />
      )}

      {!loading && !error && filteredForms.length > 0 && (
        <Row>
          {filteredForms.map((form) => (
            <Col key={form.formID} xs={12} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0 form-card">
                <Card.Body className="d-flex flex-column">
                  {/* Card Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                      <h5 className="card-title mb-1">{form.formName}</h5>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        {getStatusBadge(form)}
                        {form.dueDate && isOverdue(form.dueDate) && (
                          <Badge bg="danger">
                            <i className="bi bi-clock me-1"></i>
                            פג תוקף
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-grow-1">
                    {form.description && (
                      <p className="text-muted small mb-3 line-clamp-2">
                        {form.description}
                      </p>
                    )}

                    <div className="small text-muted">
                      <div className="d-flex justify-content-between mb-1">
                        <span>
                          <i className="bi bi-calendar-plus me-1"></i>
                          נוצר:
                        </span>
                        <span>{formatDate(form.creationDate)}</span>
                      </div>
                      
                      {form.dueDate && (
                        <div className="d-flex justify-content-between mb-1">
                          <span>
                            <i className="bi bi-calendar-x me-1"></i>
                            סיום:
                          </span>
                          <span className={isOverdue(form.dueDate) ? "text-danger" : ""}>
                            {formatDate(form.dueDate)}
                          </span>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between">
                        <span>
                          <i className="bi bi-mortarboard me-1"></i>
                          שנת לימודים:
                        </span>
                        <span>{form.academicYear || "לא הוגדר"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-3 pt-3 border-top">
                    <div className="d-flex gap-2">
                      <Link 
                        to={`/committee/edit-form/${form.formID}`}
                        className="btn btn-primary btn-sm flex-grow-1 rounded-pill"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        ערוך
                      </Link>
                      
                      <Dropdown as={ButtonGroup}>
                        <Button variant="outline-secondary" size="sm" className="rounded-pill">
                          <i className="bi bi-three-dots"></i>
                        </Button>
                        <Dropdown.Toggle 
                          split 
                          variant="outline-secondary" 
                          size="sm"
                          className="rounded-pill"
                        />
                        <Dropdown.Menu align="end">
                          <Dropdown.Item>
                            <i className="bi bi-eye me-2"></i>
                            תצוגה מקדימה
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <i className="bi bi-files me-2"></i>
                            שכפל טופס
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <i className="bi bi-download me-2"></i>
                            ייצא נתונים
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item className="text-danger">
                            <i className="bi bi-trash me-2"></i>
                            מחק טופס
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

// Custom styles
const formCardStyles = `
.form-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.1);
}

.form-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.form-card .card-title {
  color: #2c3e50;
  font-weight: 600;
}

.form-card .badge {
  font-size: 0.7rem;
}
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('form-card-styles')) {
  const style = document.createElement('style');
  style.id = 'form-card-styles';
  style.textContent = formCardStyles;
  document.head.appendChild(style);
}

export default CommitteeFormsPage;