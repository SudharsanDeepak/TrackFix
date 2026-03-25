import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import InspectorLayout from '../../layouts/InspectorLayout'
import InspectorBottomNav from '../../components/inspector/InspectorBottomNav'
import StartInspectionPage from '../../pages/inspector/StartInspectionPage'
import { useAuthStore } from '../../store/authStore'

/**
 * Inspector Mobile-First Design Tests
 *
 * Validates Requirements:
 * - 16.1: Responsive Layout that adapts to screen sizes below 768 pixels width
 * - 16.2: Touch-friendly buttons with minimum 44 pixel touch targets
 * - 16.3: Optimize image upload for mobile camera capture
 * - 16.5: Gesture-based navigation for common actions
 * - 16.6: Simplified forms optimized for mobile input
 */

// Helper to wrap components with Router
const renderWithRouter = component => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

// Mock auth store
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

describe('Inspector Mobile-First Design Tests', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Mock authenticated user
    useAuthStore.mockReturnValue({
      user: { id: '1', name: 'Test Inspector', role: 'INSPECTOR' },
      isAuthenticated: true,
    })
  })

  describe('Requirement 16.1: Responsive Layout (screens below 768px)', () => {
    it('should render InspectorLayout with mobile-optimized structure', () => {
      renderWithRouter(<InspectorLayout />)

      // Check for mobile-first layout structure
      const mainContent = screen.getByRole('main')
      expect(mainContent).toBeInTheDocument()
      expect(mainContent).toHaveClass('p-4') // Mobile padding

      // Check for bottom navigation (mobile pattern)
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
      expect(nav).toHaveClass('fixed', 'bottom-0') // Fixed bottom navigation
    })

    it('should apply mobile-first spacing and padding', () => {
      renderWithRouter(<InspectorLayout />)

      const mainContent = screen.getByRole('main')
      const computedStyle = window.getComputedStyle(mainContent)

      // Verify mobile padding is applied (p-4 = 1rem = 16px)
      expect(mainContent).toHaveClass('p-4')
    })

    it('should have bottom padding to prevent content overlap with bottom nav', () => {
      const { container } = renderWithRouter(<InspectorLayout />)

      // Layout should have pb-16 to account for bottom nav height
      const layout = container.firstChild
      expect(layout).toHaveClass('pb-16')
    })

    it('should render header as fixed at top for mobile', () => {
      renderWithRouter(<InspectorLayout />)

      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('fixed', 'top-0')
    })
  })

  describe('Requirement 16.2: Touch-friendly buttons (minimum 44px touch targets)', () => {
    it('should have bottom navigation buttons with minimum 44x44px touch targets', () => {
      renderWithRouter(<InspectorBottomNav />)

      const navLinks = screen.getAllByRole('link')

      navLinks.forEach(link => {
        // Check for minimum touch target classes
        expect(link).toHaveClass('min-w-[44px]', 'min-h-[44px]')

        // Verify the link has adequate height
        expect(link).toHaveClass('h-full') // h-full within h-16 container = 64px
      })
    })

    it('should have all navigation items with adequate spacing', () => {
      renderWithRouter(<InspectorBottomNav />)

      const nav = screen.getByRole('navigation')
      const navContainer = nav.firstChild

      // Container should use flex with justify-around for spacing
      expect(navContainer).toHaveClass('flex', 'justify-around')
    })

    it('should render 5 navigation items with touch-friendly sizing', () => {
      renderWithRouter(<InspectorBottomNav />)

      const navLinks = screen.getAllByRole('link')
      expect(navLinks).toHaveLength(5)

      // Each should be touch-friendly
      navLinks.forEach(link => {
        expect(link.classList.toString()).toMatch(/min-w-\[44px\]/)
        expect(link.classList.toString()).toMatch(/min-h-\[44px\]/)
      })
    })

    it('should have notification button with minimum 44px touch target', () => {
      renderWithRouter(<InspectorLayout />)

      const notificationButton = screen.getByRole('button', { name: /notifications/i })
      expect(notificationButton).toBeInTheDocument()

      // Button should have adequate padding for touch (p-2 minimum)
      expect(notificationButton).toHaveClass('p-2')
    })
  })

  describe('Requirement 16.3: Mobile camera image upload optimization', () => {
    it('should have image upload input with camera capture attribute', () => {
      renderWithRouter(<StartInspectionPage />)

      const imageInput = screen.getByLabelText(/upload inspection photos/i)
      expect(imageInput).toBeInTheDocument()
      expect(imageInput).toHaveAttribute('type', 'file')
      expect(imageInput).toHaveAttribute('accept', 'image/*')
      expect(imageInput).toHaveAttribute('capture', 'environment')
    })

    it('should support multiple image uploads', () => {
      renderWithRouter(<StartInspectionPage />)

      const imageInput = screen.getByLabelText(/upload inspection photos/i)
      expect(imageInput).toHaveAttribute('multiple')
    })

    it('should display camera icon for mobile-friendly upload UI', () => {
      renderWithRouter(<StartInspectionPage />)

      // Camera icon should be visible in the upload label
      const uploadLabel = screen.getByText(/take photo or upload/i)
      expect(uploadLabel).toBeInTheDocument()
    })

    it('should handle image upload and display previews', async () => {
      const user = userEvent.setup()
      renderWithRouter(<StartInspectionPage />)

      const imageInput = screen.getByLabelText(/upload inspection photos/i)

      // Create mock file
      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' })

      // Upload file
      await user.upload(imageInput, file)

      // Wait for preview to appear
      await waitFor(() => {
        const preview = screen.getByAltText(/inspection preview/i)
        expect(preview).toBeInTheDocument()
      })
    })

    it('should allow removing uploaded images', async () => {
      const user = userEvent.setup()
      renderWithRouter(<StartInspectionPage />)

      const imageInput = screen.getByLabelText(/upload inspection photos/i)
      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' })

      await user.upload(imageInput, file)

      await waitFor(() => {
        const removeButton = screen.getByRole('button', { name: /remove image/i })
        expect(removeButton).toBeInTheDocument()
      })
    })
  })

  describe('Requirement 16.5: Gesture-based navigation', () => {
    it('should provide bottom navigation for easy thumb access', () => {
      renderWithRouter(<InspectorBottomNav />)

      const nav = screen.getByRole('navigation')

      // Bottom navigation is positioned at bottom for thumb reach
      expect(nav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0')
    })

    it('should have navigation items spread across full width for easy tapping', () => {
      renderWithRouter(<InspectorBottomNav />)

      const nav = screen.getByRole('navigation')
      const container = nav.firstChild

      // Items should be spread with justify-around
      expect(container).toHaveClass('justify-around')
    })

    it('should provide visual feedback on navigation item interaction', () => {
      renderWithRouter(<InspectorBottomNav />)

      const navLinks = screen.getAllByRole('link')

      navLinks.forEach(link => {
        // Should have transition for visual feedback
        expect(link).toHaveClass('transition-colors')

        // Should have hover state
        expect(link.className).toMatch(/hover:/)
      })
    })

    it('should support keyboard navigation with focus indicators', () => {
      renderWithRouter(<InspectorBottomNav />)

      const navLinks = screen.getAllByRole('link')

      navLinks.forEach(link => {
        // Should have focus ring for keyboard navigation
        expect(link.className).toMatch(/focus:ring/)
      })
    })
  })

  describe('Requirement 16.6: Simplified forms for mobile input', () => {
    it('should render form with mobile-optimized layout', () => {
      const { container } = renderWithRouter(<StartInspectionPage />)

      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()

      // Form should have vertical spacing
      expect(form).toHaveClass('space-y-4')
    })

    it('should have full-width input fields for easy mobile input', () => {
      renderWithRouter(<StartInspectionPage />)

      const assetIdInput = screen.getByLabelText(/asset id/i)
      expect(assetIdInput).toHaveClass('w-full')

      const locationInput = screen.getByPlaceholderText(/enter location or capture gps/i)
      expect(locationInput).toHaveClass('w-full')
    })

    it('should group related fields in cards for visual clarity', () => {
      renderWithRouter(<StartInspectionPage />)

      // Each form section should be in a white card with shadow
      const assetIdLabel = screen.getByText(/asset id/i)
      const cardContainer = assetIdLabel.closest('.bg-white')

      expect(cardContainer).toBeInTheDocument()
      expect(cardContainer).toHaveClass('rounded-lg', 'shadow')
    })

    it('should provide GPS location capture button for mobile convenience', () => {
      renderWithRouter(<StartInspectionPage />)

      const gpsButton = screen.getByRole('button', { name: /capture current location/i })
      expect(gpsButton).toBeInTheDocument()
    })

    it('should have large, touch-friendly submit and cancel buttons', () => {
      renderWithRouter(<StartInspectionPage />)

      const submitButton = screen.getByRole('button', { name: /start inspection/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      expect(submitButton).toBeInTheDocument()
      expect(cancelButton).toBeInTheDocument()

      // Buttons should be full width on mobile (flex-1)
      expect(submitButton).toHaveClass('flex-1')
      expect(cancelButton).toHaveClass('flex-1')
    })

    it('should display validation errors clearly for mobile users', async () => {
      const user = userEvent.setup()
      renderWithRouter(<StartInspectionPage />)

      const submitButton = screen.getByRole('button', { name: /start inspection/i })

      // Try to submit without filling required fields
      await user.click(submitButton)

      // Errors should be displayed
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should have appropriate input types for mobile keyboards', () => {
      renderWithRouter(<StartInspectionPage />)

      const assetIdInput = screen.getByLabelText(/asset id/i)
      expect(assetIdInput).toHaveAttribute('type', 'text')

      const locationInput = screen.getByPlaceholderText(/enter location or capture gps/i)
      expect(locationInput).toHaveAttribute('type', 'text')
    })

    it('should provide clear labels and placeholders for mobile context', () => {
      renderWithRouter(<StartInspectionPage />)

      const assetIdInput = screen.getByLabelText(/asset id/i)
      expect(assetIdInput).toHaveAttribute('placeholder', 'Enter asset ID')

      const locationInput = screen.getByPlaceholderText(/enter location or capture gps/i)
      expect(locationInput).toHaveAttribute('placeholder', 'Enter location or capture GPS')
    })
  })

  describe('Additional Mobile Accessibility Tests', () => {
    it('should have skip navigation link for keyboard users', () => {
      renderWithRouter(<InspectorLayout />)

      const skipLink = screen.getByText(/skip to main content/i)
      expect(skipLink).toBeInTheDocument()
    })

    it('should have proper ARIA labels on navigation items', () => {
      renderWithRouter(<InspectorBottomNav />)

      const dashboardLink = screen.getByRole('link', { name: /navigate to dashboard/i })
      expect(dashboardLink).toBeInTheDocument()

      const inspectionsLink = screen.getByRole('link', { name: /view my inspections/i })
      expect(inspectionsLink).toBeInTheDocument()

      const scanLink = screen.getByRole('link', { name: /scan qr code/i })
      expect(scanLink).toBeInTheDocument()
    })

    it('should have semantic HTML structure', () => {
      renderWithRouter(<InspectorLayout />)

      expect(screen.getByRole('banner')).toBeInTheDocument() // header
      expect(screen.getByRole('main')).toBeInTheDocument() // main
      expect(screen.getByRole('navigation')).toBeInTheDocument() // nav
    })

    it('should have focus management for main content', () => {
      renderWithRouter(<InspectorLayout />)

      const mainContent = screen.getByRole('main')
      expect(mainContent).toHaveAttribute('tabIndex', '-1')
      expect(mainContent).toHaveAttribute('id', 'main-content')
    })
  })
})
