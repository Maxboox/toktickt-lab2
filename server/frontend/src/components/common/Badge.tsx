import React from 'react'

interface BadgeProps {
  type: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  children: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({ type, children }) => {
  const badgeClasses: Record<string, string> = {
    NEW: 'badge-new',
    IN_PROGRESS: 'badge-in-progress',
    RESOLVED: 'badge-resolved',
    CLOSED: 'badge-closed',
    LOW: 'badge-low',
    MEDIUM: 'badge-medium',
    HIGH: 'badge-high',
    URGENT: 'badge-urgent'
  }

  return <span className={`badge ${badgeClasses[type] || ''}`}>{children}</span>
}
