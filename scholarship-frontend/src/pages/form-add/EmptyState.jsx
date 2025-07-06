// src/pages/form-add/EmptyState.jsx
import React from 'react';
import { Button } from 'react-bootstrap';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction, 
  size = "md",
  variant = "light" 
}) => {
  const sizeClasses = {
    sm: {
      container: "py-3",
      icon: "2rem",
      title: "h6",
      description: "small"
    },
    md: {
      container: "py-5",
      icon: "3rem", 
      title: "h5",
      description: ""
    },
    lg: {
      container: "py-5 my-4",
      icon: "4rem",
      title: "h4", 
      description: ""
    }
  };

  const variantClasses = {
    light: "bg-light",
    white: "bg-white border",
    primary: "bg-primary bg-opacity-10 border-primary border-opacity-25"
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  return (
    <div className={`text-center rounded ${currentSize.container} ${currentVariant}`}>
      {icon && (
        <div className="mb-3">
          <i 
            className={`${icon} text-muted`}
            style={{ fontSize: currentSize.icon }}
          ></i>
        </div>
      )}
      
      {title && (
        <div className={`text-muted mb-3 ${currentSize.title}`}>
          {title}
        </div>
      )}
      
      {description && (
        <p className={`text-muted mb-4 ${currentSize.description}`}>
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <Button 
          variant="primary" 
          onClick={onAction}
          className="rounded-pill px-4"
          size={size === "sm" ? "sm" : undefined}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;