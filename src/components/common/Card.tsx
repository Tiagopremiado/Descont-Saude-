import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="bg-gray-50 p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-ds-vinho">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;