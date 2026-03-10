import React from 'react';

const StaticPage = ({ title, subtitle, content }) => {
  return (
    <div className="static-page">
      <div className="static-page-card">
        <h1>{title}</h1>
        {subtitle && <p className="static-page-subtitle">{subtitle}</p>}
        {Array.isArray(content) ? (
          content.map((paragraph, index) => (
            <p key={index} className="static-page-text">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="static-page-text">{content}</p>
        )}
      </div>
    </div>
  );
};

export default StaticPage;
