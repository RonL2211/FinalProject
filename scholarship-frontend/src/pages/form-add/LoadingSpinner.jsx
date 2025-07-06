// src/pages/form-add/LoadingSpinner.jsx
import React from 'react';
import { Container, Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ 
  message = "טוען...", 
  size = "lg", 
  variant = "primary",
  fullScreen = true,
  className = ""
}) => {
  const containerProps = fullScreen ? {
    className: `d-flex align-items-center justify-content-center ${className}`,
    style: { minHeight: "50vh" }
  } : {
    className: `text-center py-4 ${className}`
  };

  const content = (
    <div className="text-center">
      <Spinner 
        animation="border" 
        variant={variant} 
        size={size}
        className="mb-3"
        style={{ 
          width: size === "lg" ? "3rem" : "2rem", 
          height: size === "lg" ? "3rem" : "2rem" 
        }}
      />
      <div>
        <h5 className="text-muted mb-1">{message}</h5>
        <div className="spinner-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );

  return fullScreen ? (
    <Container {...containerProps} dir="rtl">
      {content}
    </Container>
  ) : (
    <div {...containerProps}>
      {content}
    </div>
  );
};

// CSS for animated dots
const spinnerStyles = `
.spinner-dots {
  display: inline-flex;
  gap: 4px;
  margin-top: 8px;
}

.spinner-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #6c757d;
  animation: dot-pulse 1.4s infinite ease-in-out both;
}

.spinner-dots .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.spinner-dots .dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dot-pulse {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'spinner-styles';
  style.textContent = spinnerStyles;
  document.head.appendChild(style);
}

export default LoadingSpinner;