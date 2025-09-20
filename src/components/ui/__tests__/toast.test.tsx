import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast, useToastActions } from '../toast'

// Test component to use the toast hooks
function TestComponent() {
  const { addToast } = useToast()
  const { success, error, warning, info } = useToastActions()

  return (
    <div>
      <button 
        onClick={() => addToast({ type: 'success', title: 'Custom Success' })}
        data-testid="custom-toast"
      >
        Custom Toast
      </button>
      <button onClick={() => success('Success!', 'Operation completed')} data-testid="success-btn">
        Success
      </button>
      <button onClick={() => error('Error!', 'Something went wrong')} data-testid="error-btn">
        Error
      </button>
      <button onClick={() => warning('Warning!', 'Please be careful')} data-testid="warning-btn">
        Warning
      </button>
      <button onClick={() => info('Info!', 'Just so you know')} data-testid="info-btn">
        Info
      </button>
    </div>
  )
}

function WrappedTestComponent() {
  return (
    <ToastProvider>
      <TestComponent />
    </ToastProvider>
  )
}

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  it('should render success toast with correct styling', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    render(<WrappedTestComponent />)
    
    await user.click(screen.getByTestId('success-btn'))
    
    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('Operation completed')).toBeInTheDocument()
    
    // Should have success styling
    const toast = screen.getByRole('alert')
    expect(toast).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800')
  })

  it('should render error toast with correct styling', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    render(<WrappedTestComponent />)
    
    await user.click(screen.getByTestId('error-btn'))
    
    expect(screen.getByText('Error!')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    const toast = screen.getByRole('alert')
    expect(toast).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800')
  })

  it('should auto-dismiss toast after default duration', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    render(<WrappedTestComponent />)
    
    await user.click(screen.getByTestId('success-btn'))
    
    expect(screen.getByText('Success!')).toBeInTheDocument()
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(4000)
    })
    
    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument()
    })
  })

  it('should allow manual dismissal of toast', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    render(<WrappedTestComponent />)
    
    await user.click(screen.getByTestId('success-btn'))
    
    expect(screen.getByText('Success!')).toBeInTheDocument()
    
    // Click close button
    const closeButton = screen.getByLabelText('Close notification')
    await user.click(closeButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument()
    })
  })

  it('should handle multiple toasts', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    render(<WrappedTestComponent />)
    
    await user.click(screen.getByTestId('success-btn'))
    await user.click(screen.getByTestId('error-btn'))
    await user.click(screen.getByTestId('warning-btn'))
    
    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('Error!')).toBeInTheDocument()
    expect(screen.getByText('Warning!')).toBeInTheDocument()
    
    // Should have 3 toasts
    expect(screen.getAllByRole('alert')).toHaveLength(3)
  })

  it('should have proper accessibility attributes', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    render(<WrappedTestComponent />)
    
    await user.click(screen.getByTestId('info-btn'))
    
    const toast = screen.getByRole('alert')
    expect(toast).toHaveAttribute('aria-live', 'polite')
    expect(toast).toHaveAttribute('aria-atomic', 'true')
    
    const closeButton = screen.getByLabelText('Close notification')
    expect(closeButton).toBeInTheDocument()
  })

  it('should support custom toast configuration', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    render(<WrappedTestComponent />)
    
    await user.click(screen.getByTestId('custom-toast'))
    
    expect(screen.getByText('Custom Success')).toBeInTheDocument()
  })

  it('should throw error when useToast is used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      const { addToast } = useToast()
      return <div>Test</div>
    }

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponentWithoutProvider />)
    }).toThrow('useToast must be used within a ToastProvider')
    
    consoleSpy.mockRestore()
  })

  it('should handle keyboard navigation for close button', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    render(<WrappedTestComponent />)
    
    await user.click(screen.getByTestId('success-btn'))
    
    const closeButton = screen.getByLabelText('Close notification')
    closeButton.focus()
    
    expect(closeButton).toHaveFocus()
    
    // Press Enter to close
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument()
    })
  })
})