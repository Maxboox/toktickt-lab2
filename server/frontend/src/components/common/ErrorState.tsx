import React from 'react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = 'Something went wrong',
  onRetry 
}) => {
  return (
    <div className="error-state">
      <p>❌ {message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
