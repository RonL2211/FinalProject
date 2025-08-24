// // src/pages/form-add/EditFormPage.jsx
// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Container, Card, Alert, Spinner, Button } from "react-bootstrap";
// import { getToken } from "../../services/authService";

// // Reuse components from AddForm
// import BasicFormDetails from "./BasicFormDetails";
// import FormSectionsManager from "./FormSectionsManager";
// import LoadingSpinner from "./LoadingSpinner";
// import { updateFormWithStructure } from "./formService";

// const EditFormPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   // State management
//   const [formData, setFormData] = useState(null);
//   const [sections, setSections] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // Load form data on mount
//   useEffect(() => {
//     loadFormData();
//   }, [id]);

//   const loadFormData = async () => {
//     setLoading(true);
//     setError("");
    
//     try {
//       const token = getToken();
//       const headers = {
//         "Content-Type": "application/json",
//         ...(token && { Authorization: `Bearer ${token}` }),
//       };

//       // Load form metadata
//       const metaResponse = await fetch(`https://localhost:7230/api/Form/${id}`, { headers });
//       if (!metaResponse.ok) {
//         throw new Error(await metaResponse.text());
//       }
//       const metadata = await metaResponse.json();

//       // Load form structure (sections and fields)
//       const structureResponse = await fetch(`https://localhost:7230/api/Form/${id}/structure`, { headers });
//       if (!structureResponse.ok) {
//         throw new Error(await structureResponse.text());
//       }
//       const structure = await structureResponse.json();

//       // Process and normalize the data
//       const normalizedSections = await processSections(structure, headers);

//       // Load departments and users
//       const [departmentsData, usersData] = await Promise.all([
//         fetch(`https://localhost:7230/api/Department`, { headers }).then(r => r.ok ? r.json() : []),
//         fetch(`https://localhost:7230/api/Person`, { headers }).then(r => r.ok ? r.json() : [])
//       ]);
// console.log('metadata', metadata)
//       setFormData(metadata);
//       setSections(normalizedSections);
//       setDepartments(departmentsData);
//       setUsers(usersData);
//     } catch (err) {
//       console.error("Error loading form:", err);
//       setError(`שגיאה בטעינת הטופס: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processSections = async (rawStructure, headers) => {
//     // Normalize sections array
//     let baseSections = Array.isArray(rawStructure)
//       ? rawStructure
//       : Array.isArray(rawStructure.formSections)
//       ? rawStructure.formSections
//       : Object.values(rawStructure).flatMap(v => (Array.isArray(v) ? v : []));

//     // Load fields for each section
//     const sectionsWithFields = await Promise.all(
//       baseSections.map(async (section) => {
//         try {
//           const fieldsResponse = await fetch(
//             `https://localhost:7230/api/FormSection/${section.sectionID}/fields`,
//             { headers }
//           );
//           const fields = fieldsResponse.ok ? await fieldsResponse.json() : [];
          
//           return {
//             ...section,
//             id: section.sectionID,
//             fields: fields.map(field => ({
//               ...field,
//               id: field.fieldID,
//               options: field.options || []
//             }))
//           };
//         } catch (err) {
//           console.error(`Error loading fields for section ${section.sectionID}:`, err);
//           return { ...section, id: section.sectionID, fields: [] };
//         }
//       })
//     );

//     return sectionsWithFields;
//   };

//   // Update handlers
//   const updateBasicDetails = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const updateSections = (newSections) => {
//     setSections(newSections);
//   };

//   // Save form (draft or published)
//   const handleSave = async (publish = false) => {
//     setSaving(true);
//     setError("");
//     setSuccess("");
    
//     try {
//       await updateFormWithStructure(id, formData, sections, publish);
//       setSuccess(publish ? "הטופס פורסם בהצלחה!" : "הטופס נשמר בהצלחה!");
      
//       // Redirect after success
//       setTimeout(() => {
//         navigate("/committee/forms");
//       }, 2000);
      
//     } catch (err) {
//       console.error("Error saving form:", err);
//       setError(`שגיאה בשמירת הטופס: ${err.message}`);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Loading state
//   if (loading) {
//     return <LoadingSpinner message="טוען נתוני טופס..." />;
//   }

//   // Error state
//   if (error && !formData) {
//     return (
//       <Container className="mt-4" dir="rtl">
//         <Alert variant="danger">
//           <Alert.Heading>שגיאה בטעינת הטופס</Alert.Heading>
//           <p>{error}</p>
//           <hr />
//           <div className="d-flex justify-content-end">
//             <Button onClick={() => navigate("/committee/forms")} variant="outline-danger">
//               חזור לרשימת טפסים
//             </Button>
//           </div>
//         </Alert>
//       </Container>
//     );
//   }

//   return (
//     <Container
//       fluid
//       className="d-flex align-items-center justify-content-center"
//       dir="rtl"
//       style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "20px" }}
//     >
//       <div className="w-100" style={{ maxWidth: "1200px" }}>
//         <Card className="shadow border-0 rounded-4">
//           {/* Header */}
//           <Card.Header className="bg-white border-0 pb-0">
//             <div className="d-flex justify-content-between align-items-center mb-3">
//               <div>
//                 <h4 className="mb-1 text-primary">עריכת טופס</h4>
//                 <p className="text-muted mb-0">{formData?.formName}</p>
//               </div>
//               <Button 
//                 variant="outline-secondary" 
//                 onClick={() => navigate("/committee/forms")}
//                 className="rounded-pill px-3"
//               >
//                 <i className="bi bi-arrow-right me-1"></i> חזור לרשימה
//               </Button>
//             </div>
            
//             {/* Status Badge */}
//             <div className="mb-3">
//               <span className={`badge ${formData?.isPublished ? 'bg-success' : 'bg-warning text-dark'} me-2`}>
//                 {formData?.isPublished ? 'פורסם' : 'טיוטה'}
//               </span>
//               {formData?.isActive === false && (
//                 <span className="badge bg-secondary">לא פעיל</span>
//               )}
//             </div>
//           </Card.Header>
          
//           {/* Alerts */}
//           <div className="px-4">
//             {error && (
//               <Alert variant="danger" className="d-flex align-items-center">
//                 <i className="bi bi-exclamation-triangle-fill me-2"></i>
//                 {error}
//               </Alert>
//             )}
            
//             {success && (
//               <Alert variant="success" className="d-flex align-items-center">
//                 <i className="bi bi-check-circle-fill me-2"></i>
//                 {success}
//               </Alert>
//             )}
//           </div>
          
//           {/* Content */}
//           <Card.Body className="p-4">
//             {saving ? (
//               <div className="text-center py-5">
//                 <Spinner animation="border" variant="primary" className="mb-3" />
//                 <h5>שומר שינויים...</h5>
//                 <p className="text-muted">אנא המתן בזמן שאנו מעדכנים את הטופס</p>
//               </div>
//             ) : (
//               <>
//                 {/* Basic Form Details */}
//                 <div className="mb-5">
//                   <h5 className="mb-3 text-primary">
//                     <i className="bi bi-info-circle me-2"></i>
//                     פרטי הטופס
//                   </h5>
//                   <BasicFormDetails
//                     formData={formData}
//                     onUpdate={updateBasicDetails}
//                   />
//                 </div>

//                 <hr className="my-5" />

//                 {/* Form Sections */}
//                 <div className="mb-4">
//                   <h5 className="mb-3 text-primary">
//                     <i className="bi bi-list-nested me-2"></i>
//                     סעיפים וקריטריונים
//                   </h5>
//                   <FormSectionsManager
//                     sections={sections}
//                     onUpdate={updateSections}
//                     departments={departments}
//                     users={users}
//                   />
//                 </div>
//               </>
//             )}
//           </Card.Body>
          
//           {/* Footer Actions */}
//           {!saving && (
//             <Card.Footer className="bg-white border-0 pt-3">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div className="text-muted">
//                   <small>
//                     <i className="bi bi-clock me-1"></i>
//                     עדכון אחרון: {formData?.lastModifiedDate ? 
//                       new Date(formData.lastModifiedDate).toLocaleString('he-IL') : 
//                       'לא זמין'
//                     }
//                   </small>
//                 </div>
                
//                 <div className="d-flex gap-2">
//                   <Button 
//                     variant="outline-warning" 
//                     onClick={() => handleSave(false)}
//                     disabled={saving}
//                     className="rounded-pill px-4"
//                   >
//                     <i className="bi bi-save me-1"></i>
//                     שמור כטיוטה
//                   </Button>
//                   <Button 
//                     variant="success" 
//                     onClick={() => handleSave(true)}
//                     disabled={saving}
//                     className="rounded-pill px-4"
//                   >
//                     <i className="bi bi-send me-1"></i>
//                     {formData?.isPublished ? 'עדכן ופרסם' : 'פרסם טופס'}
//                   </Button>
//                 </div>
//               </div>
//             </Card.Footer>
//           )}
//         </Card>
//       </div>
//     </Container>
//   );
// };

// export default EditFormPage;