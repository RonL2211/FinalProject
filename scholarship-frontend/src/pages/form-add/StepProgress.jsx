// src/pages/form-add//StepProgress.jsx
import React from 'react';
import { ProgressBar } from 'react-bootstrap';

const StepProgress = ({ 
  currentStep, 
  totalSteps, 
  stepNames = {}, 
  completionPercentage 
}) => {
  // Calculate step percentage if no completion percentage provided
  const stepPercentage = (currentStep / totalSteps) * 100;
  const percentage = completionPercentage || stepPercentage;
  
  // Get progress color based on completion
  const getProgressVariant = () => {
    if (percentage < 25) return "info";
    if (percentage < 75) return "primary"; 
    if (percentage < 100) return "success";
    return "success";
  };

  // Get step status styling
  const getStepStatus = (step) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "current";
    return "upcoming";
  };

  const getStepIcon = (step, status) => {
    if (status === "completed") return "bi-check-lg";
    return step.toString();
  };

  const getStepStyles = (status) => {
    const baseStyles = {
      width: '45px',
      height: '45px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      fontWeight: 'bold',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      border: '3px solid'
    };

    switch (status) {
      case "completed":
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
          borderColor: '#28a745',
          color: 'white',
          transform: 'scale(1.1)'
        };
      case "current":
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
          borderColor: '#007bff',
          color: 'white',
          transform: 'scale(1.15)',
          boxShadow: '0 0 20px rgba(0, 123, 255, 0.4)'
        };
      default:
        return {
          ...baseStyles,
          background: '#f8f9fa',
          borderColor: '#dee2e6',
          color: '#6c757d'
        };
    }
  };

  return (
    <div className="step-progress mb-4">
      {/* Progress Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <div className="step-indicator me-3">
            <span className="fw-bold text-primary fs-5">{currentStep}</span>
            <span className="text-muted">/{totalSteps}</span>
          </div>
          <div>
            <div className="fw-bold">שלב {currentStep}: {stepNames[currentStep] || `שלב ${currentStep}`}</div>
            <small className="text-muted">השלם את השדות הנדרשים כדי להמשיך</small>
          </div>
        </div>
        <div className="text-end">
          <div className={`fw-bold fs-6 ${percentage >= 75 ? 'text-success' : 'text-primary'}`}>
            {Math.round(percentage)}% הושלם
          </div>
          <small className="text-muted">התקדמות כוללת</small>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <ProgressBar 
          now={percentage} 
          variant={getProgressVariant()}
          animated={percentage < 100}
          className="progress-modern"
          style={{ height: '8px' }}
        />
      </div>
      
      {/* Steps Visualization */}
      <div className="steps-container position-relative">
        {/* Connection Line */}
        <div 
          className="position-absolute"
          style={{
            top: '22px',
            left: '50px',
            right: '50px',
            height: '3px',
            background: 'linear-gradient(to right, #28a745 0%, #007bff 50%, #dee2e6 100%)',
            zIndex: 1
          }}
        />
        
        {/* Steps */}
        <div className="d-flex justify-content-between position-relative" style={{ zIndex: 2 }}>
          {Array.from({ length: totalSteps }, (_, index) => {
            const step = index + 1;
            const status = getStepStatus(step);
            const stepName = stepNames[step] || `שלב ${step}`;
            
            return (
              <div key={step} className="text-center" style={{ minWidth: '120px' }}>
                {/* Step Circle */}
                <div 
                  className="step-circle mb-2"
                  style={getStepStyles(status)}
                >
                  {status === "completed" ? (
                    <i className="bi bi-check-lg"></i>
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                
                {/* Step Name */}
                <div className="step-name">
                  <div 
                    className={`fw-semibold ${
                      status === "current" ? 'text-primary' : 
                      status === "completed" ? 'text-success' : 
                      'text-muted'
                    }`}
                    style={{ fontSize: '13px' }}
                  >
                    {stepName}
                  </div>
                  
                  {/* Step Status */}
                  {status === "completed" && (
                    <small className="text-success">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      הושלם
                    </small>
                  )}
                  {status === "current" && (
                    <small className="text-primary">
                      <i className="bi bi-arrow-down-circle-fill me-1"></i>
                      נוכחי
                    </small>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Custom CSS for modern progress bar
const progressStyles = `
.progress-modern {
  border-radius: 10px;
  background-color: #e9ecef;
  overflow: hidden;
}

.progress-modern .progress-bar {
  border-radius: 10px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  transition: all 0.5s ease;
}

.progress-modern .progress-bar.bg-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
}

.progress-modern .progress-bar.bg-info {
  background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%) !important;
}

.step-circle {
  position: relative;
}

.step-circle::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,123,255,0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.step-circle:hover::before {
  opacity: 1;
}
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('step-progress-styles')) {
  const style = document.createElement('style');
  style.id = 'step-progress-styles';
  style.textContent = progressStyles;
  document.head.appendChild(style);
}

export default StepProgress;