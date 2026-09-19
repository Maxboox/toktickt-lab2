import React from 'react'

interface SelectOption {
  id: number | string
  name: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  required?: boolean
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  required = false,
  error,
  options,
  placeholder = 'Select an option',
  id,
  className = '',
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substring(7)}`

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
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {error && <span className="validation-message">{error}</span>}
    </div>
  )
}
