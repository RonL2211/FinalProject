// // src/pages/AddForm/StepProgress.jsx
// import React from 'react';
// import { ProgressBar } from 'react-bootstrap';

// const StepProgress = ({ currentStep, totalSteps, completionPercentage }) => {
//   // חישוב אחוז ההתקדמות לפי השלב הנוכחי
//   const stepPercentage = (currentStep / totalSteps) * 100;
  
//   // שימוש באחוז ההתקדמות אם זה הועבר, אחרת חישוב לפי השלב
//   const percentage = completionPercentage || stepPercentage;
  
//   // קביעת סגנון לפי התקדמות
//   const getStepStyle = (step) => {
//     if (step < currentStep) {
//       return { color: '#198754', fontWeight: 'bold' }; // הושלם
//     } else if (step === currentStep) {
//       return { color: '#0d6efd', fontWeight: 'bold' }; // נוכחי
//     } else {
//       return { color: '#6c757d' }; // עתידי
//     }
//   };

//   return (
//     <div className="step-progress mb-4">
//       <div className="d-flex justify-content-between mb-2">
//         <div>
//           <strong>שלב {currentStep} מתוך {totalSteps}</strong>
//         </div>
//         <div>
//           <span className={percentage >= 75 ? 'text-success' : 'text-primary'}>
//             {Math.round(percentage)}% הושלם
//           </span>
//         </div>
//       </div>
//       <ProgressBar 
//         now={percentage} 
//         variant={
//           percentage < 25 ? "info" : 
//           percentage < 75 ? "primary" : 
//           percentage < 100 ? "success" : "success"
//         } 
//         animated={percentage < 100}
//         className="mb-2"
//         style={{ height: '10px' }}
//       />
      
//       <div className="d-flex justify-content-between mt-3">
//         <div className="step-item text-center" style={getStepStyle(1)}>
//           <div className="step-circle mb-2" 
//             style={{ 
//               width: '35px', 
//               height: '35px', 
//               borderRadius: '50%', 
//               display: 'flex', 
//               alignItems: 'center', 
//               justifyContent: 'center', 
//               margin: '0 auto',
//               background: currentStep >= 1 ? '#e7f5ff' : '#f1f3f5',
//               border: `2px solid ${currentStep >= 1 ? (currentStep === 1 ? '#0d6efd' : '#198754') : '#dee2e6'}`
//             }}
//           >
//             {currentStep > 1 ? <i className="bi bi-check-lg"></i> : "1"}
//           </div>
//           <span>פרטים בסיסיים</span>
//         </div>
        
//         <div className="step-item text-center" style={getStepStyle(2)}>
//           <div className="step-circle mb-2" 
//             style={{ 
//               width: '35px', 
//               height: '35px', 
//               borderRadius: '50%', 
//               display: 'flex', 
//               alignItems: 'center', 
//               justifyContent: 'center', 
//               margin: '0 auto',
//               background: currentStep >= 2 ? '#e7f5ff' : '#f1f3f5',
//               border: `2px solid ${currentStep >= 2 ? (currentStep === 2 ? '#0d6efd' : '#198754') : '#dee2e6'}`
//             }}
//           >
//             {currentStep > 2 ? <i className="bi bi-check-lg"></i> : "2"}
//           </div>
//           <span>סעיפים וקריטריונים</span>
//         </div>
        
//         <div className="step-item text-center" style={getStepStyle(3)}>
//           <div className="step-circle mb-2" 
//             style={{ 
//               width: '35px', 
//               height: '35px', 
//               borderRadius: '50%', 
//               display: 'flex', 
//               alignItems: 'center', 
//               justifyContent: 'center', 
//               margin: '0 auto',
//               background: currentStep >= 3 ? '#e7f5ff' : '#f1f3f5',
//               border: `2px solid ${currentStep >= 3 ? (currentStep === 3 ? '#0d6efd' : '#198754') : '#dee2e6'}`
//             }}
//           >
//             {currentStep > 3 ? <i className="bi bi-check-lg"></i> : "3"}
//           </div>
//           <span>סיכום ושמירה</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StepProgress;