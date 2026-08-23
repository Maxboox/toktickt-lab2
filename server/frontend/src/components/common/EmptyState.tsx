import React from 'react'

interface EmptyStateProps {
  message?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = 'No items to display' 
}) => {
  return (
    <div className="empty-state">
      <p>{message}</p>
    </div>
  )
}
