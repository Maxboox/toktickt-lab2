import React, { ReactNode, Children, isValidElement } from 'react';

interface SelectOption {
  id: number | string;
  name: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  children?: ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  required = false,
  error,
  options,
  placeholder = 'Select an option',
  id,
  className = '',
  children,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substring(7)}`;

  let optionElements: ReactNode = null;

  // Si options existe et est un tableau valide
  if (options && Array.isArray(options) && options.length > 0) {
    optionElements = options.map((option) => (
      <option key={option.id} value={option.id}>
        {option.name}
      </option>
    ));
  } else if (children) {
    // Sinon, on utilise les children
    const validChildren = Children.toArray(children).filter(isValidElement);
    if (validChildren.length > 0) {
      optionElements = validChildren;
    }
  }

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`form-control ${error ? 'error' : ''} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {optionElements}
      </select>
      {error && <span className="validation-message">{error}</span>}
    </div>
  );
};
