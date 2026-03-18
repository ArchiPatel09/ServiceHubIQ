import React from 'react';

/**
 * Task 3 - Global Error Styling
 *
 * A reusable, accessible error message component that:
 *   - Always renders in red (enforced via CSS variables)
 *   - Is visible in BOTH light and dark themes
 *   - Uses role="alert" + aria-live="polite" for screen reader support
 *   - Returns null when there is no message (safe to render unconditionally)
 *
 * Usage:
 *   <ErrorMessage message="Invalid email format" />
 *   <ErrorMessage message={errors.password} className="mt-2" />
 */
const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <p className={`form-error-message ${className}`.trim()} role="alert" aria-live="polite">
      {/* Inline SVG icon keeps the component dependency-free */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="form-error-icon"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </p>
  );
};

export default ErrorMessage;
