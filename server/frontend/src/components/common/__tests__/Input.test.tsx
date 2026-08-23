import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../Input'

describe('Input Component', () => {
  test('renders input with label', () => {
    render(<Input label="Username" />)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  test('shows required asterisk', () => {
    render(<Input label="Username" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  test('displays error message', () => {
    render(<Input label="Username" error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toHaveClass('error')
  })

  test('applies read-only class', () => {
    render(<Input label="Username" readOnly />)
    expect(screen.getByLabelText('Username')).toHaveClass('readonly')
  })

  test('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input label="Username" onChange={handleChange} />)
    const input = screen.getByLabelText('Username')
    fireEvent.change(input, { target: { value: 'john' } })
    expect(handleChange).toHaveBeenCalled()
  })
})
