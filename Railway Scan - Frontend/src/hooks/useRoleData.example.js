/**
 * Example usage of useRoleData hook
 *
 * This file demonstrates how to use the role-based caching hook
 * in various scenarios.
 */

import { useRoleData, invalidateRoleCache, getCacheStats } from './useRoleData'
import apiClient from '../api/client'

// Example 1: Basic usage - Fetch dashboard data
export const useDashboardData = () => {
  return useRoleData(
    'dashboard', // Unique cache key
    async () => {
      const response = await apiClient.get('/dashboard')
      return response.data
    }
  )
}

// Example 2: With custom options
export const useInspections = () => {
  return useRoleData(
    'inspections',
    async () => {
      const response = await apiClient.get('/inspections')
      return response.data
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates)
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onSuccess: data => {
        console.log('Inspections loaded:', data.length)
      },
      onError: error => {
        console.error('Failed to load inspections:', error)
      },
    }
  )
}

// Example 3: Conditional fetching
export const useUserProfile = userId => {
  return useRoleData(
    `user-profile-${userId}`,
    async () => {
      const response = await apiClient.get(`/users/${userId}`)
      return response.data
    },
    {
      enabled: !!userId, // Only fetch if userId is provided
    }
  )
}

// Example 4: Using in a component
export const DashboardComponent = () => {
  const { data, isLoading, error, refetch } = useDashboardData()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}

// Example 5: Manual cache invalidation
export const handleLogout = () => {
  const role = useAuthStore.getState().user?.role

  // Clear all cached data for the current role
  if (role) {
    invalidateRoleCache(role)
  }

  // Proceed with logout
  // ...
}

// Example 6: Debugging cache
export const CacheDebugger = () => {
  const stats = getCacheStats()

  return (
    <div>
      <h2>Cache Statistics</h2>
      <p>Total Entries: {stats.totalEntries}</p>
      <h3>By Role:</h3>
      <ul>
        {Object.entries(stats.byRole).map(([role, count]) => (
          <li key={role}>
            {role}: {count} entries
          </li>
        ))}
      </ul>
    </div>
  )
}

// Example 7: Paginated data with cache
export const useInspectionsPaginated = (page = 1, limit = 10) => {
  return useRoleData(
    `inspections-page-${page}-limit-${limit}`, // Unique key per page
    async () => {
      const response = await apiClient.get('/inspections', {
        params: { page, limit },
      })
      return response.data
    }
  )
}

// Example 8: Dependent queries
export const useInspectionDetails = inspectionId => {
  // First, get the inspection
  const { data: inspection, isLoading: loadingInspection } = useRoleData(
    `inspection-${inspectionId}`,
    async () => {
      const response = await apiClient.get(`/inspections/${inspectionId}`)
      return response.data
    },
    {
      enabled: !!inspectionId,
    }
  )

  // Then, get related defects
  const { data: defects, isLoading: loadingDefects } = useRoleData(
    `inspection-${inspectionId}-defects`,
    async () => {
      const response = await apiClient.get(`/inspections/${inspectionId}/defects`)
      return response.data
    },
    {
      enabled: !!inspection, // Only fetch when inspection is loaded
    }
  )

  return {
    inspection,
    defects,
    isLoading: loadingInspection || loadingDefects,
  }
}
