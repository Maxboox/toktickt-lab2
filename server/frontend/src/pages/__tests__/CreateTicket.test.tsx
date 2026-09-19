import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateTicket } from '../CreateTicket'
import { RequesterProvider } from '../../context/RequesterContext'

jest.mock('../../services/api', () => ({
  getCategories: jest.fn().mockResolvedValue([
    { id: 1, name: 'Hardware' },
    { id: 2, name: 'Software' }
  ]),
  getSystems: jest.fn().mockResolvedValue([
    { id: 1, name: 'Corporate Laptop' },
    { id: 2, name: 'Email' }
  ]),
  createTicket: jest.fn().mockResolvedValue({
    id: 1,
    ticketNumber: 'TK-2026-001',
    currentStatus: 'NEW',
    summary: 'Test ticket'
  })
}))

jest.mock('../../context/RequesterContext', () => ({
  useRequester: () => ({
    requester: { id: 1, name: 'Test User', email: 'test@example.com' },
    isLoading: false
  }),
  RequesterProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

describe('CreateTicket Screen', () => {
  test('renders form fields', async () => {
    render(
      <RequesterProvider>
        <CreateTicket />
      </RequesterProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Create New Ticket')).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/Category/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Related System/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Summary/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
  })

  test('shows validation errors for empty fields', async () => {
    render(
      <RequesterProvider>
        <CreateTicket />
      </RequesterProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Create New Ticket')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Create Ticket/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Category is required')).toBeInTheDocument()
      expect(screen.getByText('System is required')).toBeInTheDocument()
      expect(screen.getByText('Summary is required')).toBeInTheDocument()
    })
  })

  test('shows error for short description', async () => {
    render(
      <RequesterProvider>
        <CreateTicket />
      </RequesterProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Create New Ticket')).toBeInTheDocument()
    })

    const description = screen.getByLabelText(/Description/)
    fireEvent.change(description, { target: { value: 'Short' } })

    const submitButton = screen.getByRole('button', { name: /Create Ticket/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument()
    })
  })
})
