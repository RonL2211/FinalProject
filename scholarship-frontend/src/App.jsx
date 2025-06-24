// // src/App.jsx
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import LoginPage from "./components/LoginPage";

// // Lecturer
// import LecturerLayout from "./layouts/LecturerLayout";
// import LecturerDashboard from "./pages/LecturerDashboard";
// import LecturerProfilePage from "./pages/LecturerProfilePage";

// // Faculty Head
// import FacultyHeadLayout from "./layouts/FacultyHeadLayout";
// import FacultyHeadDashboard from "./pages/FacultyHeadDashboard";
// import FacultyHeadProfilePage from "./pages/FacultyHeadProfilePage";
// import FacultyHeadDepartmentsPage from "./pages/FacultyHeadDepartmentsPage";
// import FacultyHeadReportsPage from "./pages/FacultyHeadReportsPage";

// // Committee
// import CommitteeLayout from "./layouts/CommitteeLayout";
// import CommitteeDashboard from "./pages/CommitteeDashboard";
// import NewFormPage from "./pages/AddForm/NewFormPage";
// import CommitteeFormsPage from "./pages/CommitteeFormsPage";
// import EditFormPage from "./pages/EditFormPage";   // ← adjusted import

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Authentication */}
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/login" element={<LoginPage />} />

//         {/* Lecturer Section */}
//         <Route path="/lecturer" element={<LecturerLayout />}>
//           <Route index element={<LecturerDashboard />} />
//           <Route path="profile" element={<LecturerProfilePage />} />
//         </Route>

//         {/* Faculty Head Section */}
//         <Route path="/faculty-head" element={<FacultyHeadLayout />}>
//           <Route index element={<FacultyHeadDashboard />} />
//           <Route path="profile" element={<FacultyHeadProfilePage />} />
//           <Route path="departments" element={<FacultyHeadDepartmentsPage />} />
//           <Route path="reports" element={<FacultyHeadReportsPage />} />
//         </Route>

//         {/* Committee Section */}
//         <Route path="/committee" element={<CommitteeLayout />}>
//           <Route index element={<CommitteeDashboard />} />
//           <Route path="create-form" element={<NewFormPage />} />
//           <Route path="forms" element={<CommitteeFormsPage />} />
//           <Route path="edit-form/:id" element={<EditFormPage />} />  {/* no subfolder now */}
//         </Route>

//         {/* 404 Not Found */}
//         <Route
//           path="*"
//           element={
//             <div dir="rtl" className="text-center mt-5">
//               עמוד לא נמצא
//             </div>
//           }
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";

// Lecturer
import LecturerLayout from "./layouts/LecturerLayout";
import LecturerDashboard from "./pages/LecturerDashboard";
import LecturerProfilePage from "./pages/LecturerProfilePage";
import LecturerFormsPage from "./pages/LecturerFormsPage";

// Faculty Head
import FacultyHeadLayout from "./layouts/FacultyHeadLayout";
import FacultyHeadDashboard from "./pages/FacultyHeadDashboard";
import FacultyHeadProfilePage from "./pages/FacultyHeadProfilePage";
import FacultyHeadDepartmentsPage from "./pages/FacultyHeadDepartmentsPage";
import FacultyHeadReportsPage from "./pages/FacultyHeadReportsPage";

// Committee
import CommitteeLayout from "./layouts/CommitteeLayout";
import CommitteeDashboard from "./pages/CommitteeDashboard";
import CommitteeFormsPage from "./pages/NEW-110625/CommitteeFormsPage";

// Form Management - Use the improved version from AddForm folder
import NewFormPage from "./pages/NEW-110625/NewFormPage";
import EditFormPage from "./pages/NEW-110625/EditFormPage";

// Shared Components
import NotFoundPage from "./pages/NEW-110625/NotFoundPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Lecturer Section */}
        <Route path="/lecturer" element={<LecturerLayout />}>
          <Route index element={<LecturerDashboard />} />
          <Route path="profile" element={<LecturerProfilePage />} />
          <Route path="forms" element={<LecturerFormsPage />} />
        </Route>

        {/* Faculty Head Section */}
        <Route path="/faculty-head" element={<FacultyHeadLayout />}>
          <Route index element={<FacultyHeadDashboard />} />
          <Route path="profile" element={<FacultyHeadProfilePage />} />
          <Route path="departments" element={<FacultyHeadDepartmentsPage />} />
          <Route path="reports" element={<FacultyHeadReportsPage />} />
        </Route>

        {/* Committee Section */}
        <Route path="/committee" element={<CommitteeLayout />}>
          <Route index element={<CommitteeDashboard />} />
          <Route path="forms" element={<CommitteeFormsPage />} />
          <Route path="create-form" element={<NewFormPage />} />
          <Route path="edit-form/:id" element={<EditFormPage />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;