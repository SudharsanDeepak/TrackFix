import { useRoleCheck } from '../../hooks/useRoleCheck'

/**
 * RoleGuard Component
 * Conditionally renders children based on user role
 * Provides role-based access control for UI elements
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if role is allowed
 * @param {string|string[]} props.allowedRoles - Role or array of roles that can access the content
 * @param {React.ReactNode} props.fallback - Optional content to render if role is not allowed
 *
 * @example
 * // Single role
 * <RoleGuard allowedRoles="ADMIN">
 *   <AdminPanel />
 * </RoleGuard>
 *
 * @example
 * // Multiple roles
 * <RoleGuard allowedRoles={['ADMIN', 'DEPOT_OFFICER']}>
 *   <ManagementFeature />
 * </RoleGuard>
 *
 * @example
 * // With fallback
 * <RoleGuard
 *   allowedRoles="ADMIN"
 *   fallback={<p>Access denied. Admin privileges required.</p>}
 * >
 *   <AdminPanel />
 * </RoleGuard>
 */
const RoleGuard = ({ children, allowedRoles, fallback = null }) => {
  const hasAccess = useRoleCheck(allowedRoles)

  if (!hasAccess) {
    return fallback
  }

  return children
}

export default RoleGuard
