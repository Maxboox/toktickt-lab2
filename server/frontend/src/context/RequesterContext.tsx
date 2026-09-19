import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Requester, getCurrentRequester, selectRequester } from '../services/api'

interface RequesterContextType {
  requester: Requester | null
  isLoading: boolean
  selectRequester: (id: number) => Promise<void>
  refreshRequester: () => Promise<void>
}

const RequesterContext = createContext<RequesterContextType | undefined>(undefined)

export const useRequester = () => {
  const context = useContext(RequesterContext)
  if (!context) {
    throw new Error('useRequester must be used within RequesterProvider')
  }
  return context
}

interface RequesterProviderProps {
  children: ReactNode
}

export const RequesterProvider: React.FC<RequesterProviderProps> = ({ children }) => {
  const [requester, setRequester] = useState<Requester | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshRequester = async () => {
    try {
      setIsLoading(true)
      const current = await getCurrentRequester()
      setRequester(current)
    } catch (error) {
      console.error('Failed to refresh requester:', error)
      setRequester(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectRequester = async (id: number) => {
    try {
      setIsLoading(true)
      const result = await selectRequester(id)
      setRequester(result.requester)
    } catch (error) {
      console.error('Failed to select requester:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshRequester()
  }, [])

  return (
    <RequesterContext.Provider
      value={{
        requester,
        isLoading,
        selectRequester: handleSelectRequester,
        refreshRequester
      }}
    >
      {children}
    </RequesterContext.Provider>
  )
}
