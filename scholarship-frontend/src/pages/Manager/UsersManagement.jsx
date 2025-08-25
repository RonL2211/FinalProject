// src/pages/Manager/UsersManagement.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form, Alert, Dropdown, InputGroup, Tabs, Tab } from 'react-bootstrap';
import { userManagementHelpers, userService } from '../../services/userService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';
import Swal from 'sweetalert2';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);

  // Form data
  const [userForm, setUserForm] = useState({
    personId: '',
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    departmentID: '',
    isActive: true,
    password: '',
    username: '',
    folderPath: ''
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  // const loadData = async () => {
  //   setLoading(true);
  //   setError('');

  //   try {
  //     const departmentsData = await userService.getAllDepartments();
  //     setDepartments(departmentsData);
  //     // טעינת משתמשים
  //     const usersData = await userService.getAllUsers();
      
  //     // טעינת תפקידים לכל משתמש
  //     const usersWithRoles = await Promise.all(
  //       usersData.map(async (user) => {
  //         try {
  //           const userRoles = await userService.getUserRoles(user.personId);
  //           return { ...user, roles: userRoles };
  //         } catch (err) {
  //           return { ...user, roles: [] };
  //         }
  //       })
  //     );

  //     setUsers(usersWithRoles);
      
  //     // טעינת רשימת התפקידים האפשריים 
  //     setRoles([
  //       { roleID: 1, roleName: 'מרצה' },
  //       { roleID: 2, roleName: 'ראש התמחות' },
  //       { roleID: 3, roleName: 'ראש מחלקה' },
  //       { roleID: 4, roleName: 'דיקאן' },
  //       { roleID: 5, roleName: 'מנהל סטודנטים' }
  //     ]);

  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadData = async () => {
  setLoading(true);
  setError('');

  try {
    const data = await userManagementHelpers.loadUsersData();
    
    setDepartments(data.departments);
    setUsers(data.users);
    setRoles(data.roles);

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  const filterUsers = () => {
    let filtered = [...users];

    // חיפוש טקסט
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.personId.includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // סינון לפי תפקיד
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user =>
        user.roles.some(role => role.roleName === roleFilter)
      );
    }

    // סינון לפי סטטוס
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => user.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(user => !user.isActive);
      }
    }

    // מיון
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
        break;
      case 'id':
        filtered.sort((a, b) => a.personId.localeCompare(b.personId));
        break;
      case 'department':
        filtered.sort((a, b) => (a.departmentID || 0) - (b.departmentID || 0));
        break;
      default:
        break;
    }

    setFilteredUsers(filtered);
  };
  const generateUsername = () => {
  // מציאת המספר הבא הזמין
  const existingNumbers = users
    .map(user => user.username?.match(/^user(\d+)$/)?.[1])
    .filter(Boolean)
    .map(Number)
    .sort((a, b) => a - b);
  
  let nextNumber = 1;
  for (let i = 0; i < existingNumbers.length; i++) {
    if (existingNumbers[i] !== nextNumber) {
      break;
    }
    nextNumber++;
  }
  
  return `user${nextNumber}`;
};

const generatePassword = () => {
  return Math.random().toString().slice(2, 10); // 8 ספרות אקראיות
};
const handleAddUser = () => {
  resetUserForm();
  const newUsername = generateUsername();
  const newPassword = generatePassword();
  
  setUserForm({
    personId: '',
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    departmentID: '',
    isActive: true,
    password: newPassword,
    username: newUsername, 
    folderPath: `/folders/${newUsername}` 
  });
  setSelectedUser(null);
  setShowAddModal(true);
};


  const resetUserForm = () => {
    setUserForm({
      personId: '',
      firstName: '',
      lastName: '',
      email: '',
      position: '',
      departmentID: '',
      isActive: true,
       password: '',
    username: '',
    folderPath: ''
    });
  };



  const handleEditUser = (user) => {
    setUserForm({
      personId: user.personId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email || '',
      position: user.position || '',
      departmentID: user.departmentID || '',
      isActive: user.isActive,
      password: user.password || '',
      username: user.username || '',
      folderPath: user.folderPath || '',
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.personId || !userForm.firstName || !userForm.lastName) {
      setError('יש למלא את כל השדות החובה');
      return;
    }
 if (!selectedUser) {
      if (!userForm.username) {
        userForm.username = generateUsername();
      }
      if (!userForm.password) {
        userForm.password = generatePassword();
      }
      if (!userForm.folderPath) {
        userForm.folderPath = `/folders/${userForm.username}`;
      }
    }
    setProcessing(true);
    try {
      if (selectedUser) {
        // עדכון משתמש קיים
        await userService.updateUser(selectedUser.personId, userForm);
      } else {
        // הוספת משתמש חדש
        await userService.addUser?.(userForm) || Promise.resolve();
      }

      Swal.fire({
        icon: 'success',
        title: 'המשתמש נשמר בהצלחה',
        showConfirmButton: false,
        timer: 1500
      });
      await loadData();
      setShowEditModal(false);
      setShowAddModal(false);
      setSelectedUser(null);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleManageRoles = (user) => {
    setSelectedUser(user);
    setShowRolesModal(true);
  };

  const handleToggleRole = async (roleId, hasRole) => {
    if (!selectedUser) return;

    setProcessing(true);
    try {
      if (hasRole) {
        await userService.removeRole(selectedUser.personId, roleId);
      } else {
        await userService.assignRole(selectedUser.personId, roleId);
      }

      await loadData();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getRolesBadges = (userRoles) => {
    if (!userRoles || userRoles.length === 0) {
      return <Badge bg="light" text="dark">אין תפקיד</Badge>;
    }

    return userRoles.map(role => (
      <Badge key={role.roleID} bg="primary" className="me-1">
        {role.roleName}
      </Badge>
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'לא זמין';
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const getUsersByRole = (roleName) => {
    return users.filter(user => 
      user.roles.some(role => role.roleName === roleName)
    ).length;
  };

  if (loading) return <LoadingSpinner message="טוען משתמשים..." />;

  return (
    <Container>
      {/* כותרת */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-people me-2"></i>
                ניהול משתמשים
              </h2>
              <p className="text-muted">נהל משתמשים, תפקידים והרשאות במערכת</p>
            </div>
            <Button variant="primary" size="lg" onClick={handleAddUser}>
              <i className="bi bi-person-plus me-2"></i>
              הוסף משתמש
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <ErrorAlert error={error} onRetry={loadData} />
          </Col>
        </Row>
      )}

      {/* סטטיסטיקות */}
      <Row className="mb-4">
        <Col md={2} className="mb-3">
          <Card className="text-center h-100 border-primary">
            <Card.Body>
              <i className="bi bi-people text-primary" style={{ fontSize: '1.5rem' }}></i>
              <h4 className="mt-1 mb-1 text-primary">{users.length}</h4>
              <small className="text-muted">סך הכל</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className="text-center h-100 border-info">
            <Card.Body>
              <i className="bi bi-person text-info" style={{ fontSize: '1.5rem' }}></i>
              <h4 className="mt-1 mb-1 text-info">{getUsersByRole('מרצה')}</h4>
              <small className="text-muted">מרצים</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className="text-center h-100 border-warning">
            <Card.Body>
              <i className="bi bi-person-gear text-warning" style={{ fontSize: '1.5rem' }}></i>
              <h4 className="mt-1 mb-1 text-warning">{getUsersByRole('ראש מחלקה') + getUsersByRole('ראש התמחות')}</h4>
              <small className="text-muted">ראשי מחלקות</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className="text-center h-100 border-success">
            <Card.Body>
              <i className="bi bi-building text-success" style={{ fontSize: '1.5rem' }}></i>
              <h4 className="mt-1 mb-1 text-success">{getUsersByRole('דיקאן')}</h4>
              <small className="text-muted">דיקנים</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className="text-center h-100 border-danger">
            <Card.Body>
              <i className="bi bi-shield text-danger" style={{ fontSize: '1.5rem' }}></i>
              <h4 className="mt-1 mb-1 text-danger">{getUsersByRole('מנהל סטודנטים')}</h4>
              <small className="text-muted">מנהלים</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className="text-center h-100 border-secondary">
            <Card.Body>
              <i className="bi bi-person-x text-secondary" style={{ fontSize: '1.5rem' }}></i>
              <h4 className="mt-1 mb-1 text-secondary">{users.filter(u => !u.isActive).length}</h4>
              <small className="text-muted">לא פעילים</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* סינונים */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-funnel me-2"></i>
                סינון וחיפוש
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="חפש משתמש..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">כל התפקידים</option>
                    <option value="מרצה">מרצים</option>
                    <option value="ראש התמחות">ראשי התמחות</option>
                    <option value="ראש מחלקה">ראשי מחלקות</option>
                    <option value="דיקאן">דיקנים</option>
                    <option value="מנהל סטודנטים">מנהלי סטודנטים</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">כל הסטטוסים</option>
                    <option value="active">פעילים</option>
                    <option value="inactive">לא פעילים</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">לפי שם</option>
                    <option value="id">לפי ת.ז.</option>
                    <option value="department">לפי מחלקה</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Button variant="outline-primary" onClick={loadData} className="w-100">
                    <i className="bi bi-arrow-clockwise"></i>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* טבלת משתמשים */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                רשימת משתמשים ({filteredUsers.length})
              </h6>
            </Card.Header>
            <Card.Body>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3 text-muted">
                    {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                      ? 'לא נמצאו משתמשים התואמים לסינון' 
                      : 'אין משתמשים במערכת'
                    }
                  </h4>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>פרטים אישיים</th>
                        <th>מחלקה</th>
                        <th>תפקידים</th>
                        <th>סטטוס</th>
                        <th>תאריך יצירה</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.personId}>
                          <td>
                            <div>
                              <strong>{user.firstName} {user.lastName}</strong>
                              <div className="small text-muted">
                                <i className="bi bi-person-badge me-1"></i>
                                {user.personId}
                              </div>
                              {user.email && (
                                <div className="small text-muted">
                                  <i className="bi bi-envelope me-1"></i>
                                  {user.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {user.departmentID ? (
                              <Badge bg="light" text="dark">{departments.find(d => d.departmentID === user.departmentID)?.departmentName}</Badge>
                            ) : (
                              <span className="text-muted">לא הוגדר</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {getRolesBadges(user.roles)}
                            </div>
                          </td>
                          <td>
                            <Badge bg={user.isActive ? 'success' : 'secondary'}>
                              {user.isActive ? 'פעיל' : 'לא פעיל'}
                            </Badge>
                          </td>
                          <td>{formatDate(user.createdDate)}</td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-secondary" size="sm">
                                <i className="bi bi-three-dots"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleEditUser(user)}>
                                  <i className="bi bi-pencil me-2"></i>
                                  ערוך פרטים
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleManageRoles(user)}>
                                  <i className="bi bi-person-gear me-2"></i>
                                  נהל תפקידים
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item 
                                  className={user.isActive ? 'text-warning' : 'text-success'}
                                  onClick={() => {
                                    // Toggle user status
                                    handleEditUser({...user, isActive: !user.isActive});
                                  }}
                                >
                                  <i className={`bi ${user.isActive ? 'bi-pause' : 'bi-play'} me-2`}></i>
                                  {user.isActive ? 'השבת' : 'הפעל'}
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal הוספת/עריכת משתמש */}
      <Modal show={showAddModal || showEditModal} onHide={() => {
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedUser(null);
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser ? 'עריכת משתמש' : 'הוספת משתמש חדש'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>תעודת זהות <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.personId}
                    onChange={(e) => setUserForm({...userForm, personId: e.target.value})}
                    disabled={!!selectedUser}
                    maxLength="9"
                    placeholder="הכנס תעודת זהות"
                  />
                </Form.Group>
              </Col>
             <Col md={6}>
  <Form.Group className="mb-3">
    <Form.Label>מחלקה</Form.Label>
    <Form.Select
      value={userForm.departmentID}
      onChange={(e) => setUserForm({...userForm, departmentID: e.target.value})}
    >
      <option value="">בחר מחלקה</option>
      {departments.map(dept => (
        <option key={dept.departmentID} value={dept.departmentID}>
          {dept.departmentName}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
</Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>שם פרטי <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                    placeholder="הכנס שם פרטי"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>שם משפחה <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                    placeholder="הכנס שם משפחה"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>דואר אלקטרוני</Form.Label>
                  <Form.Control
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    placeholder="example@email.com"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>תפקיד</Form.Label>
                  <Form.Select
                    value={userForm.position}
                    onChange={(e) => setUserForm({...userForm, position: e.target.value})}
                  >
                    <option value="">בחר תפקיד</option>
                    <option value="מרצה">מרצה</option>
                    <option value="ראש התמחות">ראש התמחות</option>
                    <option value="ראש מחלקה">ראש מחלקה</option>
                    <option value="דיקאן">דיקאן</option>
                    <option value="מנהל סטודנטים">מנהל סטודנטים</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
    <Form.Group className="mb-3">
      <Form.Label>סיסמה</Form.Label>
      <Form.Control
        type="text"
        value={userForm.password}
        onChange={(e) => setUserForm({...userForm, password: e.target.value})}
        placeholder="סיסמה"
        maxLength="8"
      />
    </Form.Group>
  </Col>
            </Row>
            <Form.Check
              type="checkbox"
              label="משתמש פעיל"
              checked={userForm.isActive}
              onChange={(e) => setUserForm({...userForm, isActive: e.target.checked})}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedUser(null);
          }}>
            ביטול
          </Button>
          <Button variant="primary" onClick={handleSaveUser} disabled={processing}>
            {processing ? (
              <>
                <i className="spinner-border spinner-border-sm me-2"></i>
                שומר...
              </>
            ) : (
              <>
                <i className="bi bi-check me-2"></i>
                {selectedUser ? 'עדכן משתמש' : 'הוסף משתמש'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal ניהול תפקידים */}
      <Modal show={showRolesModal} onHide={() => setShowRolesModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>ניהול תפקידים</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <div className="mb-3">
                <strong>משתמש:</strong> {selectedUser.firstName} {selectedUser.lastName}
                <div className="small text-muted">{selectedUser.personId}</div>
              </div>
              
              <div className="mb-3">
                <strong>תפקידים נוכחיים:</strong>
                <div className="mt-2">
                  {getRolesBadges(selectedUser.roles)}
                </div>
              </div>

              <hr />

              <div>
                <strong>הקצה/הסר תפקידים:</strong>
                <div className="mt-2">
                  {roles.map(role => {
                    const hasRole = selectedUser.roles.some(ur => ur.roleID === role.roleID);
                    return (
                      <div key={role.roleID} className="d-flex justify-content-between align-items-center mb-2">
                        <span>{role.roleName}</span>
                        <Button
                          size="sm"
                          variant={hasRole ? 'danger' : 'success'}
                          onClick={() => handleToggleRole(role.roleID, hasRole)}
                          disabled={processing}
                        >
                          {hasRole ? 'הסר' : 'הוסף'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRolesModal(false)}>
            סגור
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UsersManagement;