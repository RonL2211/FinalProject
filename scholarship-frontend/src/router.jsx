// src/router.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';

// // Manager Pages (מנהל סטודנטים)
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import FormsManagement from './pages/Manager/FormsManagement';
import UnifiedFormBuilder from './pages/Manager/UnifiedFormBuilder';
// import FormBuilder from './pages/Manager/FormBuilder';
// import FormEditor from './pages/Manager/FormEditor';
import ReviewAppeals from './pages/Manager/ReviewAppeals';
import UsersManagement from './pages/Manager/UsersManagement';
import SubmissionsReview from './pages/Manager/SubmissionsReview';

// Dean Pages (דיקאן)
import DeanDashboard from './pages/Dean/Dashboard';
import DeanReviewForms from './pages/Dean/ReviewForms';
import DeanReports from './pages/Dean/Reports';

// Department Head Pages (ראש מחלקה)
// import DeptHeadDashboard from './pages/DepartmentHead/Dashboard';
// import DeptHeadReviewForms from './pages/DepartmentHead/ReviewForms';
import DeptHeadReports from './pages/DepartmentHead/Reports';

// Lecturer Pages (מרצה)
import LecturerDashboard from './pages/Lecturer/Dashboard';
import AvailableForms from './pages/Lecturer/AvailableForms';
import FillForm from './pages/Lecturer/FillForm';
import MyForms from './pages/Lecturer/MyForms';
import SubmitAppeal from './pages/Lecturer/SubmitAppeal';
import ViewSubmittedForm from './pages/Lecturer/ViewSubmittedForm';


// Shared Pages
import UnauthorizedPage from './pages/Shared/UnauthorizedPage';
import NotFoundPage from './pages/Shared/NotFoundPage';
import FormViewer from './pages/Manager/FormViewer';
import DepartmentSubmissionsReview from './pages/Shared/DepartmentSubmissionsReview';
import ViewSubmission from './pages/Shared/ViewSubmission';
// import ProfilePage from './pages/Shared/ProfilePage';


const AppRouter = () => {
  const { isAuthenticated, isLoading, getDefaultRoute } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="טוען את המערכת..." />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={getDefaultRoute()} replace />
              ) : (
                <LoginPage />
              )
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={
              <Navigate
                to={isAuthenticated ? getDefaultRoute() : "/login"}
                replace
              />
            }
          />

          {/* Manager Routes (מנהל סטודנטים) */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute requiredRoles={["מנהל סטודנטים"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/forms"
            element={
              <ProtectedRoute requiredRoles={["מנהל סטודנטים"]}>
                <FormsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/forms/new"
            element={
              <ProtectedRoute requiredRoles={["מנהל סטודנטים"]}>
                {/* <FormBuilder /> */}
                <UnifiedFormBuilder mode="create" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/forms/edit/:id"
            element={
              <ProtectedRoute requiredRoles={["מנהל סטודנטים"]}>
                {/* <FormEditor /> */}
                <UnifiedFormBuilder mode="edit" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/forms/view/:id"
            element={
              <ProtectedRoute requiredRoles={["מנהל סטודנטים"]}>
                <FormViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/appeals"
            element={
              <ProtectedRoute requiredRoles={["מנהל סטודנטים"]}>
                <ReviewAppeals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/users"
            element={
              <ProtectedRoute requiredRoles={["מנהל סטודנטים"]}>
                <UsersManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/submissions"
            element={
              <ProtectedRoute requiredRoles={["מנהל סטודנטים"]}>
                <SubmissionsReview />
              </ProtectedRoute>
            }
          />

          {/* Dean Routes (דיקאן) */}
          <Route
            path="/dean"
            element={
              <ProtectedRoute requiredRoles={["דיקאן"]}>
                <DeanDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean/review"
            element={
              <ProtectedRoute requiredRoles={["דיקאן"]}>
                <DeanReviewForms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean/reports"
            element={
              <ProtectedRoute requiredRoles={["דיקאן"]}>
                <DeanReports />
              </ProtectedRoute>
            }
          />

          {/* Department Head Routes (ראש מחלקה) */}
          {/* <Route
            path="/dept-head"
            element={
              <ProtectedRoute requiredRoles={["ראש מחלקה"]}>
                <DeptHeadDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dept-head/review"
            element={
              <ProtectedRoute requiredRoles={["ראש מחלקה"]}>
                <DeptHeadReviewForms />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/dept-head/reports"
            element={
              <ProtectedRoute requiredRoles={["ראש מחלקה"]}>
                <DeptHeadReports />
              </ProtectedRoute>
            }
          />

          {/* Lecturer Routes (מרצה/ראש התמחות/ראש מחלקה/דיקאן) */}
          <Route
            path="/lecturer"
            element={
              <ProtectedRoute
                requiredRoles={["מרצה", "ראש התמחות", "ראש מחלקה", "דיקאן"]}
              >
                <LecturerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/forms"
            element={
              <ProtectedRoute
                requiredRoles={["מרצה", "ראש התמחות", "ראש מחלקה", "דיקאן"]}
              >
                <AvailableForms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/fill/:id"
            element={
              <ProtectedRoute
                requiredRoles={["מרצה", "ראש התמחות", "ראש מחלקה", "דיקאן"]}
              >
                <FillForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/my-forms"
            element={
              <ProtectedRoute
                requiredRoles={["מרצה", "ראש התמחות", "ראש מחלקה", "דיקאן"]}
              >
                <MyForms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/appeal/:id"
            element={
              <ProtectedRoute
                requiredRoles={["מרצה", "ראש התמחות", "ראש מחלקה", "דיקאן"]}
              >
                <SubmitAppeal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/view/:instanceId"
            element={
              <ProtectedRoute
                requiredRoles={["מרצה", "ראש התמחות", "ראש מחלקה", "דיקאן"]}
              >
                <ViewSubmittedForm />
              </ProtectedRoute>
            }
          />

          {/* Shared Routes */}
          <Route
            path="/profile"
            element={<ProtectedRoute>{/* <ProfilePage /> */}</ProtectedRoute>}
          />
          <Route
            path="/department/submissions"
            element={
              <ProtectedRoute
              requiredRoles={[ "ראש התמחות", "ראש מחלקה", "דיקאן"]}>
                <DepartmentSubmissionsReview />
              </ProtectedRoute>
            }
          />
          <Route
           path="/view-submission/:instanceId"
            element={
              <ProtectedRoute
              requiredRoles={[ "ראש התמחות", "ראש מחלקה", "דיקאן"]}>
                <ViewSubmission />
              </ProtectedRoute>
            }
          />

          {/* Error Pages */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRouter;