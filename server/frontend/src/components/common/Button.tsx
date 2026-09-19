import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'btn'
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-2.5',
    lg: 'px-8 py-3 text-lg'
  }

  const isDisabled = disabled || loading

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${loading ? 'btn-busy' : ''}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && <span className="loading-spinner-small" />}
      {children}
    </button>
  )
}
