import React from 'react';

const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <p className={`form-error-message ${className}`.trim()} role="alert" aria-live="polite">
      {message}
    </p>
  );
};

export default ErrorMessage;
