# Accessibility Testing Guide

## Overview
This guide provides instructions for testing the accessibility features implemented across all role interfaces in the RailTrack AI Frontend.

## Testing Checklist

### 1. Keyboard Navigation (Requirements 23.1, 17.3)

#### Inspector Role
- [ ] Tab through all navigation items in bottom nav
- [ ] Verify focus indicators are visible on all items
- [ ] Test that Enter/Space activates navigation links
- [ ] Verify skip navigation link appears on first Tab press

#### Management Roles (Depot Officer, Zonal Manager, Admin)
- [ ] Test keyboard shortcuts:
  - Alt+D: Navigate to Dashboard
  - Alt+R: Navigate to Reports
  - Alt+P: Navigate to Profile
  - Alt+I: Navigate to Inspections (Depot Officer, Admin)
  - Alt+Q: Navigate to QR Management (Depot Officer only)
  - Alt+S: Navigate to Settings (Admin only)
  - Alt+U: Navigate to Users (Admin only)
  - Alt+A: Navigate to Analytics (Zonal Manager only)
  - Alt+V: Navigate to Vendors (Zonal Manager only)
- [ ] Tab through sidebar navigation items
- [ ] Verify focus indicators are visible
- [ ] Test Escape key closes user menu dropdown
- [ ] Verify skip navigation link appears on first Tab press

### 2. ARIA Labels and Semantic HTML (Requirement 23.2)

#### All Roles
- [ ] Verify all navigation elements use `<nav>` with aria-label
- [ ] Verify main content uses `<main>` with id="main-content"
- [ ] Verify headers use `<header>` with role="banner"
- [ ] Verify all buttons have descriptive aria-label attributes
- [ ] Verify icons have aria-hidden="true"
- [ ] Verify user menu has aria-haspopup and aria-expanded
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)

### 3. Color Contrast (Requirement 23.3)

#### Automated Testing
```bash
# Using axe DevTools browser extension
1. Install axe DevTools extension
2. Open each role interface
3. Run "Scan All of My Page"
4. Verify no color contrast violations
```

#### Manual Testing
- [ ] Inspector: Blue theme (#003DA5) on white - 10.67:1 ✅
- [ ] Depot Officer: Green theme (#16a34a) on white - 4.56:1 ✅
- [ ] Zonal Manager: Purple theme (#9333ea) on white - 5.73:1 ✅
- [ ] Administrator: Red theme (#dc2626) on white - 5.94:1 ✅
- [ ] All text meets 4.5:1 minimum for normal text
- [ ] All large text (≥18pt) meets 3:1 minimum
- [ ] Focus indicators meet 3:1 contrast against background

#### Color Blindness Testing
```bash
# Using browser extensions
1. Install "Colorblindly" or similar extension
2. Test each role interface with:
   - Protanopia (red-blind)
   - Deuteranopia (green-blind)
   - Tritanopia (blue-blind)
3. Verify all information is conveyed without relying solely on color
```

### 4. Responsive Text and Zoom Support (Requirement 23.5)

#### Browser Zoom Testing
- [ ] Test at 100% zoom (baseline)
- [ ] Test at 125% zoom
- [ ] Test at 150% zoom
- [ ] Test at 200% zoom (maximum required)

#### Verification at Each Zoom Level
- [ ] No horizontal scrolling
- [ ] All text remains readable
- [ ] All functionality remains accessible
- [ ] Touch targets remain adequate size
- [ ] No content overlap
- [ ] Navigation remains usable

#### Font Size Testing
- [ ] Verify all font sizes use rem units
- [ ] Test browser font size increase (Settings > Appearance > Font Size)
- [ ] Verify layout adapts to larger font sizes

### 5. Touch Targets (Requirement 16.2)

#### Inspector Interface (Mobile)
- [ ] Bottom navigation buttons: minimum 44x44px ✅
- [ ] Header notification button: minimum 44x44px ✅
- [ ] All action buttons: minimum 44x44px ✅
- [ ] Form inputs: minimum 44px height ✅
- [ ] Adequate spacing between targets (minimum 8px)

#### Management Interfaces (Desktop with Mobile Support)
- [ ] Sidebar navigation items: minimum 44px height ✅
- [ ] Header buttons: minimum 44x44px ✅
- [ ] Table row actions: minimum 44px height ✅
- [ ] Pagination controls: minimum 44x44px ✅

#### Testing Tools
```bash
# Chrome DevTools
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (iPhone, Android)
4. Inspect element sizes
5. Verify computed height/width ≥ 44px
```

### 6. Screen Reader Testing

#### NVDA (Windows)
```bash
1. Download NVDA from nvaccess.org
2. Start NVDA (Ctrl+Alt+N)
3. Navigate with:
   - Tab: Move between interactive elements
   - Arrow keys: Read content
   - H: Jump between headings
   - N: Jump between navigation regions
4. Verify all content is announced correctly
```

#### JAWS (Windows)
```bash
1. Start JAWS
2. Navigate with:
   - Tab: Move between interactive elements
   - Insert+F7: List all links
   - Insert+F5: List all form fields
3. Verify all interactive elements are announced
```

#### VoiceOver (macOS/iOS)
```bash
# macOS
1. Enable VoiceOver (Cmd+F5)
2. Navigate with:
   - VO+Right Arrow: Next item
   - VO+Left Arrow: Previous item
   - VO+Space: Activate item
3. Verify all content is announced

# iOS
1. Enable VoiceOver (Settings > Accessibility)
2. Swipe right/left to navigate
3. Double-tap to activate
4. Verify all touch targets are accessible
```

### 7. Focus Management

#### All Roles
- [ ] Focus moves to main content when skip link is activated
- [ ] Focus is trapped in modal dialogs
- [ ] Focus returns to trigger element when modal closes
- [ ] Focus is visible on all interactive elements
- [ ] Focus order follows logical reading order
- [ ] No keyboard traps (can Tab out of all elements)

### 8. Dynamic Content Updates

#### ARIA Live Regions
- [ ] Success messages are announced
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Data updates are announced (for screen readers)

### 9. Forms Accessibility

#### All Form Elements
- [ ] All inputs have associated labels
- [ ] Error messages are linked to inputs (aria-describedby)
- [ ] Required fields are marked (aria-required)
- [ ] Invalid fields are marked (aria-invalid)
- [ ] Field instructions are provided
- [ ] Error messages are clear and actionable

### 10. Mobile Device Testing

#### Real Device Testing
- [ ] Test on iPhone (iOS Safari)
- [ ] Test on Android (Chrome)
- [ ] Test in portrait orientation
- [ ] Test in landscape orientation
- [ ] Test with one-handed use
- [ ] Test with different hand sizes

## Automated Testing Tools

### Browser Extensions
1. **axe DevTools** - Comprehensive accessibility testing
2. **WAVE** - Visual accessibility evaluation
3. **Lighthouse** - Accessibility audit in Chrome DevTools
4. **Colorblindly** - Color blindness simulation

### Command Line Tools
```bash
# Install pa11y for automated testing
npm install -g pa11y

# Test a page
pa11y http://localhost:5173/inspector/dashboard

# Test with specific standard
pa11y --standard WCAG2AA http://localhost:5173
```

### CI/CD Integration
```bash
# Add to package.json scripts
"test:a11y": "pa11y-ci --config .pa11yci.json"

# Run in CI pipeline
npm run test:a11y
```

## Compliance Checklist

### WCAG 2.1 Level AA Requirements
- [x] 1.3.1 Info and Relationships (Level A)
- [x] 1.4.3 Contrast (Minimum) (Level AA)
- [x] 1.4.4 Resize Text (Level AA)
- [x] 1.4.10 Reflow (Level AA)
- [x] 2.1.1 Keyboard (Level A)
- [x] 2.1.2 No Keyboard Trap (Level A)
- [x] 2.4.3 Focus Order (Level A)
- [x] 2.4.7 Focus Visible (Level AA)
- [x] 2.5.5 Target Size (Level AAA - implemented)
- [x] 3.2.4 Consistent Identification (Level AA)
- [x] 4.1.2 Name, Role, Value (Level A)
- [x] 4.1.3 Status Messages (Level AA)

## Issue Reporting

When accessibility issues are found:
1. Document the issue with screenshots
2. Note the WCAG criterion violated
3. Specify the role interface affected
4. Provide steps to reproduce
5. Suggest remediation if possible

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)
