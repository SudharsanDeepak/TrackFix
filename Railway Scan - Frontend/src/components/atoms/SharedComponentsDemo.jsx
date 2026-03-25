/**
 * Demonstration of Role-Aware Shared Components
 *
 * This file demonstrates how to use the role-aware shared components:
 * - Button: Role-based colors and touch-friendly sizing for Inspector
 * - Card: Role-based border colors with highlight option
 * - LoadingSpinner: Role-based color scheme
 * - RoleGuard: Conditional rendering based on user role
 */

import { Button, Card, LoadingSpinner } from './index'
import RoleGuard from '../organisms/RoleGuard'

const SharedComponentsDemo = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Role-Aware Shared Components Demo</h1>

      {/* Button Examples */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Button Component</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="primary" loading>
            Loading...
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Note: Colors adapt to user role. Inspector role has larger touch targets (min 44px).
        </p>
      </section>

      {/* Card Examples */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Card Component</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold mb-2">Regular Card</h3>
            <p className="text-gray-600">This is a standard card with default styling.</p>
          </Card>

          <Card highlight>
            <h3 className="font-semibold mb-2">Highlighted Card</h3>
            <p className="text-gray-600">
              This card has a role-specific border color (2px border).
            </p>
          </Card>

          <Card onClick={() => alert('Card clicked!')} highlight>
            <h3 className="font-semibold mb-2">Interactive Card</h3>
            <p className="text-gray-600">This card is clickable and has hover effects.</p>
          </Card>

          <Card padding="lg">
            <h3 className="font-semibold mb-2">Large Padding Card</h3>
            <p className="text-gray-600">This card has larger padding (p-6).</p>
          </Card>
        </div>
      </section>

      {/* LoadingSpinner Examples */}
      <section>
        <h2 className="text-xl font-semibold mb-4">LoadingSpinner Component</h2>
        <div className="flex items-center gap-8">
          <div>
            <p className="text-sm text-gray-600 mb-2">Small</p>
            <LoadingSpinner size="sm" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Medium (default)</p>
            <LoadingSpinner size="md" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Large</p>
            <LoadingSpinner size="lg" />
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">Note: Spinner color adapts to user role.</p>
      </section>

      {/* RoleGuard Examples */}
      <section>
        <h2 className="text-xl font-semibold mb-4">RoleGuard Component</h2>

        <Card className="mb-4">
          <h3 className="font-semibold mb-2">Admin Only Content</h3>
          <RoleGuard
            allowedRoles="ADMIN"
            fallback={<p className="text-red-600">Access denied. Admin privileges required.</p>}
          >
            <p className="text-green-600">✓ You have admin access!</p>
            <Button variant="primary" className="mt-2">
              Admin Action
            </Button>
          </RoleGuard>
        </Card>

        <Card className="mb-4">
          <h3 className="font-semibold mb-2">Management Roles Content</h3>
          <RoleGuard
            allowedRoles={['ADMIN', 'DEPOT_OFFICER', 'ZONAL_MANAGER']}
            fallback={<p className="text-red-600">Access denied. Management role required.</p>}
          >
            <p className="text-green-600">✓ You have management access!</p>
            <Button variant="primary" className="mt-2">
              Management Action
            </Button>
          </RoleGuard>
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">All Roles Content</h3>
          <RoleGuard allowedRoles={['INSPECTOR', 'DEPOT_OFFICER', 'ZONAL_MANAGER', 'ADMIN']}>
            <p className="text-green-600">✓ This content is visible to all authenticated users!</p>
          </RoleGuard>
        </Card>
      </section>

      {/* Usage Examples */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
        <Card>
          <h3 className="font-semibold mb-2">Code Examples</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-1">Button with role-based colors:</p>
              <code className="block bg-gray-100 p-2 rounded">
                {`<Button variant="primary">Click Me</Button>`}
              </code>
            </div>

            <div>
              <p className="font-medium mb-1">Highlighted card with role-based border:</p>
              <code className="block bg-gray-100 p-2 rounded">
                {`<Card highlight>Content</Card>`}
              </code>
            </div>

            <div>
              <p className="font-medium mb-1">Role-based conditional rendering:</p>
              <code className="block bg-gray-100 p-2 rounded">
                {`<RoleGuard allowedRoles="ADMIN" fallback={<AccessDenied />}>
  <AdminPanel />
</RoleGuard>`}
              </code>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}

export default SharedComponentsDemo
