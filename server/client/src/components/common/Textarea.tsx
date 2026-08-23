import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  required?: boolean
  error?: string
  readOnly?: boolean
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  required = false,
  error,
  readOnly = false,
  id,
  className = '',
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substring(7)}`

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`form-control ${error ? 'error' : ''} ${readOnly ? 'readonly' : ''} ${className}`}
        readOnly={readOnly}
        {...props}
      />
      {error && <span className="validation-message">{error}</span>}
    </div>
  )
}
