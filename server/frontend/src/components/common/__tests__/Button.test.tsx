import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  test('applies primary variant by default', () => {
    render(<Button>Primary</Button>)
    const button = screen.getByText('Primary')
    expect(button).toHaveClass('btn-primary')
  })

  test('applies secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByText('Secondary')
    expect(button).toHaveClass('btn-secondary')
  })

  test('applies danger variant', () => {
    render(<Button variant="danger">Danger</Button>)
    const button = screen.getByText('Danger')
    expect(button).toHaveClass('btn-danger')
  })

  test('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })

  test('disables button when loading prop is true', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByText('Loading')).toBeDisabled()
    expect(screen.getByText('Loading')).toHaveClass('btn-busy')
  })

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('does not call onClick when disabled', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
