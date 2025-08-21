// // src/pages/form-add/NewFormPage.jsx
// import React, { useState, useEffect } from "react";
// import { Container, Card, Alert, Spinner } from "react-bootstrap";
// import StepProgress from "./StepProgress";
// import BasicFormDetails from "./BasicFormDetails";
// import FormSectionsManager from "./FormSectionsManager";
// import FormSummary from "./FormSummary";
// import useFormData from "./useFormData";
// import { createFormWithStructure } from "./formService";

// const STEPS = {
//   BASIC_DETAILS: 1,
//   SECTIONS: 2,
//   SUMMARY: 3
// };

// const STEP_NAMES = {
//   [STEPS.BASIC_DETAILS]: "פרטים בסיסיים",
//   [STEPS.SECTIONS]: "סעיפים וקריטריונים", 
//   [STEPS.SUMMARY]: "סיכום ושמירה"
// };

// function NewFormPage() {
//   const [activeStep, setActiveStep] = useState(STEPS.BASIC_DETAILS);
//   const [loading, setLoading] = useState(false);
  
//   const {
//     formData,
//     sections,
//     departments,
//     users,
//     progress,
//     error,
//     success,
//     updateBasicDetails,
//     updateSections,
//     validateStep,
//     resetForm,
//     setError,
//     setSuccess
//   } = useFormData();

//   // Navigation between steps
//   const nextStep = () => {
//     const validationError = validateStep(activeStep);
//     if (validationError) {
//       setError(validationError);
//       return;
//     }
    
//     setError('');
//     setActiveStep(prev => Math.min(prev + 1, Object.keys(STEPS).length));
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const prevStep = () => {
//     setActiveStep(prev => Math.max(prev - 1, 1));
//     setError('');
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // Save form (draft or published)
//   const handleSave = async (publish = false) => {
//     setLoading(true);
//     setError('');
//     setSuccess('');
    
//     try {
//       await createFormWithStructure(formData, sections, publish);
//       setSuccess(publish ? 'הטופס פורסם בהצלחה!' : 'הטופס נשמר כטיוטה בהצלחה!');
      
//       console.success("Form saved successfully:", formData);
//       if (window.confirm('האם אתה רוצה ליצור טופס חדש?')) {
//         resetForm();
//         setActiveStep(STEPS.BASIC_DETAILS);
//       }
//       else 
//       {
//         // Optionally redirect or reset state
//         window.location.href = '/committee/forms'; // Redirect to forms list
//       }
//     } catch (err) {
//       setError(`שגיאה בשמירת הטופס: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Render step content
//   const renderStepContent = () => {
//     switch (activeStep) {
//       case STEPS.BASIC_DETAILS:
//         return (
//           <BasicFormDetails
//             formData={formData}
//             onUpdate={updateBasicDetails}
//           />
//         );
        
//       case STEPS.SECTIONS:
//         return (
//           <FormSectionsManager
//             sections={sections}
//             onUpdate={updateSections}
//             departments={departments}
//             users={users}
//           />
//         );
        
//       case STEPS.SUMMARY:
//         return (
//           <FormSummary
//             formData={formData}
//             sections={sections}
//             onSave={handleSave}
//             loading={loading}
//           />
//         );
        
//       default:
//         return null;
//     }
//   };

//   if (loading) {
//     return (
//       <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
//         <div className="text-center">
//           <Spinner animation="border" variant="primary" className="mb-3" />
//           <h5>מעבד את הנתונים...</h5>
//           <p className="text-muted">אנא המתן בזמן שאנו שומרים את הטופס</p>
//         </div>
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
//             <h4 className="mb-3 text-center text-primary">יצירת טופס חדש</h4>
//             <StepProgress 
//               currentStep={activeStep} 
//               totalSteps={Object.keys(STEPS).length}
//               stepNames={STEP_NAMES}
//               completionPercentage={progress}
//             />
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
//             {renderStepContent()}
//           </Card.Body>
          
//           {/* Footer Navigation */}
//           {activeStep !== STEPS.SUMMARY && (
//             <Card.Footer className="bg-white border-0 pt-3">
//               <div className="d-flex justify-content-between">
//                 {activeStep > 1 ? (
//                   <button 
//                     className="btn btn-outline-secondary rounded-pill px-4"
//                     onClick={prevStep}
//                     disabled={loading}
//                   >
//                     <i className="bi bi-arrow-right me-1"></i> חזור
//                   </button>
//                 ) : (
//                   <div></div>
//                 )}
                
//                 <button 
//                   className="btn btn-primary rounded-pill px-4"
//                   onClick={nextStep}
//                   disabled={loading}
//                 >
//                   המשך <i className="bi bi-arrow-left ms-1"></i>
//                 </button>
//               </div>
//             </Card.Footer>
//           )}
//         </Card>
//       </div>
//     </Container>
//   );
// }

// export default NewFormPage;