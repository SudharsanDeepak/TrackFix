# Component Documentation

This document provides comprehensive documentation for all components in the role-based frontend architecture.

## Table of Contents

- [Shared Components](#shared-components)
  - [Button](#button)
  - [Card](#card)
  - [RoleGuard](#roleguard)
- [Layout Components](#layout-components)
  - [InspectorLayout](#inspectorlayout)
  - [DepotOfficerLayout](#depotofficerlayout)
  - [ZonalManagerLayout](#zonalmanagerlayout)
  - [AdminLayout](#adminlayout)
- [Dashboard Widgets](#dashboard-widgets)
  - [Inspector Widgets](#inspector-widgets)
  - [Depot Officer Widgets](#depot-officer-widgets)
  - [Zonal Manager Widgets](#zonal-manager-widgets)
  - [Administrator Widgets](#administrator-widgets)

---

## Shared Components

### Button

**Location:** `src/components/atoms/Button.jsx`

Role-aware button component that applies role-specific color schemes while maintaining consistent variants. Ensures touch-friendly sizing for mobile roles (Inspector).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Button content |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'danger' \| 'ghost'` | `'primary'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable button |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type attribute |
| `className` | `string` | `''` | Additional CSS classes |
| `onClick` | `Function` | - | Click handler |

#### Usage Examples

```jsx
import Button from '@/components/atoms/Button'

// Primary button
<Button variant="primary" onClick={handleSubmit}>
  Submit
</Button>

// Loading state
<Button variant="primary" loading>
  Saving...
</Button>

// Outline variant
<Button variant="outline" size="lg">
  Cancel
</Button>

// Danger variant
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>
```

#### Role-Specific Behavior

- **Inspector (Mobile):** Buttons have larger minimum heights (44px-52px) for touch-friendly interaction
- **Other Roles (Desktop):** Standard button sizes (36px-48px)
- **Color Scheme:** Automatically applies role-specific colors:
  - Inspector: Blue
  - Depot Officer: Green
  - Zonal Manager: Purple
  - Administrator: Red

---

### Card

**Location:** `src/components/atoms/Card.jsx`

Container component with role-based border colors and styling. Provides consistent card layout across the application.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Card content |
| `highlight` | `boolean` | `false` | Apply emphasized styling with role-specific border |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding size |
| `className` | `string` | `''` | Additional CSS classes |
| `onClick` | `Function` | - | Optional click handler (makes card interactive) |

#### Usage Examples

```jsx
import Card from '@/components/atoms/Card'

// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Highlighted card with role-specific border
<Card highlight>
  <h3>Important Information</h3>
  <p>This card stands out with role-specific styling</p>
</Card>

// Interactive card
<Card onClick={handleCardClick}>
  <h3>Clickable Card</h3>
  <p>Click anywhere on this card</p>
</Card>

// Custom padding
<Card padding="lg">
  <h3>Large Padding</h3>
</Card>
```

#### Accessibility

- Interactive cards (with `onClick`) are keyboard accessible
- Supports Enter and Space key activation
- Proper ARIA roles applied automatically

---

### RoleGuard

**Location:** `src/components/organisms/RoleGuard.jsx`

Conditionally renders children based on user role. Provides role-based access control for UI elements.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Content to render if role is allowed |
| `allowedRoles` | `string \| string[]` | - | Role or array of roles that can access the content |
| `fallback` | `React.ReactNode` | `null` | Optional content to render if role is not allowed |

#### Usage Examples

```jsx
import RoleGuard from '@/components/organisms/RoleGuard'

// Single role
<RoleGuard allowedRoles="ADMIN">
  <AdminPanel />
</RoleGuard>

// Multiple roles
<RoleGuard allowedRoles={['ADMIN', 'DEPOT_OFFICER']}>
  <ManagementFeature />
</RoleGuard>

// With fallback
<RoleGuard 
  allowedRoles="ADMIN"
  fallback={<p>Access denied. Admin privileges required.</p>}
>
  <AdminPanel />
</RoleGuard>

// Conditional feature rendering
<RoleGuard allowedRoles={['DEPOT_OFFICER', 'ZONAL_MANAGER', 'ADMIN']}>
  <Button onClick={generateReport}>Generate Report</Button>
</RoleGuard>
```

---

## Layout Components

### InspectorLayout

**Location:** `src/layouts/InspectorLayout.jsx`

Mobile-first layout optimized for field operations. Features a fixed header and bottom navigation bar.

#### Features

- Mobile-optimized design
- Fixed header with app branding
- Bottom navigation for easy thumb access
- Blue color scheme
- Touch-friendly controls

#### Structure

```
┌─────────────────────┐
│   InspectorHeader   │ ← Fixed header
├─────────────────────┤
│                     │
│   Main Content      │ ← Scrollable content area
│   (Outlet)          │
│                     │
├─────────────────────┤
│ InspectorBottomNav  │ ← Fixed bottom navigation
└─────────────────────┘
```

#### Navigation Items

- Dashboard
- Inspections
- Scan QR
- Defects
- Profile

---

### DepotOfficerLayout

**Location:** `src/layouts/DepotOfficerLayout.jsx`

Desktop-optimized layout for operational management. Features a collapsible sidebar and header.

#### Features

- Desktop-optimized design
- Collapsible sidebar navigation
- Responsive header with menu toggle
- Green color scheme
- Multi-column content support

#### Structure

```
┌──────┬──────────────────┐
│      │  Header          │
│ Side ├──────────────────┤
│ bar  │                  │
│      │  Main Content    │
│      │  (Outlet)        │
│      │                  │
└──────┴──────────────────┘
```

#### Navigation Items

- Dashboard
- QR Management
- Inspections
- Defect Management
- Reports
- Inventory
- Profile

---

### ZonalManagerLayout

**Location:** `src/layouts/ZonalManagerLayout.jsx`

Desktop-optimized layout for strategic oversight and analytics. Features a collapsible sidebar and header.

#### Features

- Desktop-optimized design
- Analytics-focused layout
- Collapsible sidebar navigation
- Purple color scheme
- Support for data visualizations

#### Structure

Same as DepotOfficerLayout but with purple color scheme.

#### Navigation Items

- Dashboard
- Zone Analytics
- Depot Performance
- Vendor Management
- Reports
- Alerts
- Profile

---

### AdminLayout

**Location:** `src/layouts/AdminLayout.jsx`

Desktop-optimized layout for system administration. Features a collapsible sidebar and header.

#### Features

- Desktop-optimized design
- Comprehensive navigation
- Collapsible sidebar navigation
- Red color scheme
- System-wide oversight support

#### Structure

Same as DepotOfficerLayout but with red color scheme.

#### Navigation Items

- Dashboard
- User Management
- System Settings
- All Inspections
- All Reports
- Audit Logs
- System Health
- Profile

---

## Dashboard Widgets

### Inspector Widgets

**Location:** `src/components/inspector/widgets/`

#### ActiveInspectionsWidget

Displays currently assigned inspections for the inspector.

**Features:**
- List of active assignments
- Location information
- Priority indicators
- Quick action buttons

#### QRScannerWidget

Quick-access QR code scanner widget.

**Features:**
- Camera activation button
- Manual entry option
- Recent scans history

#### RecentInspectionsWidget

Shows the last 10 inspections completed by the inspector.

**Features:**
- Limited to 10 most recent items
- Status indicators
- Quick view details

#### PendingDefectsWidget

Displays defect reports awaiting action.

**Features:**
- Count of pending defects
- Priority levels
- Quick navigation to defects page

#### DailyStatsWidget

Shows daily performance metrics.

**Features:**
- Inspections completed today
- Defects reported today
- Completion rate

#### QuickActionsWidget

Provides quick access to common inspector actions.

**Features:**
- Start Inspection button
- Scan QR Code button
- Report Defect button
- Touch-optimized for mobile

---

### Depot Officer Widgets

**Location:** `src/components/depot-officer/widgets/`

#### QRGenerationStatsWidget

Displays QR code generation statistics for the current month.

**Features:**
- Total QR codes generated
- Trend comparison
- Quick access to QR management

#### InspectionCompletionWidget

Shows inspection completion rates for the depot.

**Features:**
- Completion percentage
- Trend indicators
- Breakdown by status

#### PendingApprovalsWidget

Displays inspections awaiting approval.

**Features:**
- Count of pending approvals
- Priority indicators
- Quick approval actions

#### RecentDefectsWidget

Shows recent defect reports requiring attention.

**Features:**
- List of recent defects
- Severity indicators
- Assignment status

#### InventoryStatusWidget

Displays inventory status summary.

**Features:**
- Stock levels
- Low stock alerts
- Quick access to inventory management

#### QualityMetricsWidget

Shows quality control metrics for the current week.

**Features:**
- Quality scores
- Trend analysis
- Comparison to targets

---

### Zonal Manager Widgets

**Location:** `src/components/zonal-manager/widgets/`

#### ZoneTrendsWidget

Displays zone-wide inspection completion trends for the last 30 days.

**Features:**
- Line chart visualization
- Trend indicators
- Comparison to previous period

#### DefectRatesWidget

Shows defect rate trends across all depots in the zone.

**Features:**
- Chart visualization
- Depot comparison
- Severity breakdown

#### VendorMetricsWidget

Displays vendor performance metrics.

**Features:**
- Vendor ratings
- Performance scores
- Comparison chart

#### DepotRankingsWidget

Shows comparative depot performance rankings.

**Features:**
- Ranked list of depots
- Performance scores
- Key metrics comparison

#### AnalyticsAccessWidget

Provides quick access to advanced analytics reports.

**Features:**
- Report templates
- Custom report builder
- Export options

#### CriticalAlertsWidget

Displays critical alerts requiring managerial attention.

**Features:**
- Alert list with severity
- Escalation options
- Quick resolution actions

#### ResourceUtilizationWidget

Shows resource utilization metrics across the zone.

**Features:**
- Utilization percentages
- Resource allocation chart
- Efficiency indicators

---

### Administrator Widgets

**Location:** `src/components/admin/widgets/`

#### UserStatsWidget

Displays total active users count by role.

**Features:**
- User count by role
- Trend indicators
- Quick access to user management

#### SystemHealthWidget

Shows system health metrics including API response times.

**Features:**
- API response time chart
- Server status indicators
- Performance metrics

#### ActivityLogsWidget

Displays recent user activity logs.

**Features:**
- Recent activity list
- User actions
- Timestamp information

#### SecurityAlertsWidget

Shows security alerts and failed login attempts.

**Features:**
- Security alert list
- Failed login count
- IP address tracking

#### UserManagementAccessWidget

Provides quick access to user management functionality.

**Features:**
- Create user button
- Recent user changes
- Role distribution chart

#### SystemWideStatsWidget

Displays system-wide statistics across all zones and depots.

**Features:**
- Total inspections
- Total defects
- System-wide metrics

#### StorageMetricsWidget

Shows database storage utilization metrics.

**Features:**
- Storage usage chart
- Growth trends
- Capacity warnings

---

## Best Practices

### Component Usage

1. **Always use role-aware components** (Button, Card) instead of creating custom styled elements
2. **Use RoleGuard** for conditional rendering based on role
3. **Follow the established color schemes** for each role
4. **Ensure touch-friendly sizing** for Inspector (mobile) components
5. **Use semantic HTML** and proper ARIA labels for accessibility

### Styling Guidelines

1. **Use Tailwind CSS utility classes** for styling
2. **Apply role-specific colors** through the `useRole` hook
3. **Maintain consistent spacing** using Tailwind's spacing scale
4. **Ensure responsive design** for all screen sizes
5. **Test color contrast** for accessibility compliance

### Accessibility

1. **Provide ARIA labels** for all interactive elements
2. **Ensure keyboard navigation** works for all components
3. **Maintain color contrast ratios** of at least 4.5:1
4. **Support screen readers** with proper semantic HTML
5. **Test with browser zoom** up to 200%

---

## Related Documentation

- [Role Helper Utilities](./src/utils/roleHelpers.js)
- [Custom Hooks](./src/hooks/)
- [API Services](./src/services/)
- [README](./README.md)
