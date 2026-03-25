# Role-Based Caching Strategy

## Overview

The `useRoleData` hook provides a lightweight caching mechanism for role-specific data without requiring React Query. It uses role-based cache keys to prevent data leakage between roles.

## Key Features

1. **Role-Based Cache Keys**: Data is cached with keys prefixed by the user's role (e.g., `INSPECTOR:dashboard`)
2. **Automatic Cache Invalidation**: Cache is automatically cleared when the user's role changes
3. **Configurable Stale Time**: Default 5 minutes before data is considered stale
4. **Configurable Cache Time**: Default 10 minutes before cached data is removed
5. **Global Cache Store**: Shared cache across all components for efficient memory usage

## Configuration

### Default Settings

- **Stale Time**: 5 minutes (300,000 ms)
- **Cache Time**: 10 minutes (600,000 ms)

### Custom Configuration

```javascript
const { data, isLoading, error } = useRoleData(
  'my-data-key',
  fetcherFunction,
  {
    staleTime: 2 * 60 * 1000,  // 2 minutes
    cacheTime: 5 * 60 * 1000,  // 5 minutes
    enabled: true,              // Auto-fetch on mount
    onSuccess: (data) => {},    // Success callback
    onError: (error) => {}      // Error callback
  }
)
```

## Usage Examples

See `useRoleData.example.js` for detailed usage examples.

## Cache Management

### Invalidate Role Cache
```javascript
import { invalidateRoleCache } from './useRoleData'
invalidateRoleCache('INSPECTOR') // Clear all INSPECTOR cache
```

### Invalidate All Cache
```javascript
import { invalidateAllCache } from './useRoleData'
invalidateAllCache() // Clear entire cache
```

### Get Cache Statistics
```javascript
import { getCacheStats } from './useRoleData'
const stats = getCacheStats()
console.log(stats) // { totalEntries: 5, byRole: { INSPECTOR: 3, ADMIN: 2 } }
```
