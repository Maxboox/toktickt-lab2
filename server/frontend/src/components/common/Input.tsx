import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  required?: boolean
  error?: string
  readOnly?: boolean
}

export const Input: React.FC<InputProps> = ({
  label,
  required = false,
  error,
  readOnly = false,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(7)}`

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`form-control ${error ? 'error' : ''} ${readOnly ? 'readonly' : ''} ${className}`}
        readOnly={readOnly}
        {...props}
      />
      {error && <span className="validation-message">{error}</span>}
    </div>
  )
}
