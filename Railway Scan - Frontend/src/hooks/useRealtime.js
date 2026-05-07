import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import SocketClient from '../services/socketClient'

/**
 * Hook to listen to real-time inspection updates
 * Usage:
 * const inspections = useRealtimeInspections(setInspections)
 */
export const useRealtimeInspections = (onUpdate) => {
  const user = useAuthStore(state => state.user)
  const token = useAuthStore(state => state.token)

  useEffect(() => {
    if (!token || !user) return

    const socket = SocketClient.getInstance(
      token,
      user._id || user.id || user.id,
      user.role,
      user.zoneId || user.zoneCode,
      user.depotId
    )

    // Listen to inspection lifecycle events
    const handleInspectionCreated = (data) => {
      console.log('🔔 New inspection created:', data)
      onUpdate?.({ type: 'CREATED', data })
    }

    const handleInspectionUpdated = (data) => {
      console.log('🔔 Inspection updated:', data)
      onUpdate?.({ type: 'UPDATED', data })
    }

    const handleInspectionCompleted = (data) => {
      console.log('🔔 Inspection completed:', data)
      onUpdate?.({ type: 'COMPLETED', data })
    }

    const handleInspectionFailed = (data) => {
      console.log('🔔 Inspection failed:', data)
      onUpdate?.({ type: 'FAILED', data })
    }

    socket.on('inspection.created', handleInspectionCreated)
    socket.on('inspection.updated', handleInspectionUpdated)
    socket.on('inspection.completed', handleInspectionCompleted)
    socket.on('inspection.failed', handleInspectionFailed)

    return () => {
      socket.off('inspection.created', handleInspectionCreated)
      socket.off('inspection.updated', handleInspectionUpdated)
      socket.off('inspection.completed', handleInspectionCompleted)
      socket.off('inspection.failed', handleInspectionFailed)
    }
  }, [user?.accessToken, onUpdate])
}

/**
 * Hook to listen to real-time fitting updates
 * Usage:
 * const fittings = useRealtimeFittings(setFittings)
 */
export const useRealtimeFittings = (onUpdate) => {
  const user = useAuthStore(state => state.user)
  const token = useAuthStore(state => state.token)

  useEffect(() => {
    if (!token || !user) return

    const socket = SocketClient.getInstance(
      token,
      user._id || user.id,
      user.role,
      user.zoneId || user.zoneCode,
      user.depotId
    )

    const handleFittingStatusChanged = (data) => {
      console.log('🔔 Fitting status changed:', data)
      onUpdate?.({ type: 'STATUS_CHANGED', data })
    }

    const handleDefectReported = (data) => {
      console.log('🔔 Defect reported:', data)
      onUpdate?.({ type: 'DEFECT_REPORTED', data })
    }

    socket.on('fitting.status.changed', handleFittingStatusChanged)
    socket.on('fitting.defect.reported', handleDefectReported)

    return () => {
      socket.off('fitting.status.changed', handleFittingStatusChanged)
      socket.off('fitting.defect.reported', handleDefectReported)
    }
  }, [token, user, onUpdate])
}

/**
 * Hook to listen to real-time user/system updates
 * Usage:
 * const system = useRealtimeSystem(setSystemData)
 */
export const useRealtimeSystem = (onUpdate) => {
  const user = useAuthStore(state => state.user)
  const token = useAuthStore(state => state.token)

  useEffect(() => {
    if (!token || !user) return

    const socket = SocketClient.getInstance(
      token,
      user._id || user.id,
      user.role,
      user.zoneId || user.zoneCode,
      user.depotId
    )

    const handleUserCreated = (data) => {
      console.log('🔔 New user created:', data)
      onUpdate?.({ type: 'USER_CREATED', data })
    }

    const handleUserUpdated = (data) => {
      console.log('🔔 User updated:', data)
      onUpdate?.({ type: 'USER_UPDATED', data })
    }

    const handleSystemSettingsChanged = (data) => {
      console.log('🔔 System settings changed:', data)
      onUpdate?.({ type: 'SETTINGS_CHANGED', data })
    }

    socket.on('user.created', handleUserCreated)
    socket.on('user.updated', handleUserUpdated)
    socket.on('system.settings.changed', handleSystemSettingsChanged)

    return () => {
      socket.off('user.created', handleUserCreated)
      socket.off('user.updated', handleUserUpdated)
      socket.off('system.settings.changed', handleSystemSettingsChanged)
    }
  }, [token, user, onUpdate])
}

/**
 * Hook for generic real-time event listening
 * Usage:
 * useRealtimeEvent('inspection.created', (data) => {
 *   console.log('Inspection created:', data)
 * })
 */
export const useRealtimeEvent = (eventName, callback) => {
  const user = useAuthStore(state => state.user)
  const token = useAuthStore(state => state.token)

  useEffect(() => {
    if (!token || !user) return

    const socket = SocketClient.getInstance(
      token,
      user._id || user.id,
      user.role,
      user.zoneId || user.zoneCode,
      user.depotId
    )

    socket.on(eventName, callback)

    return () => {
      socket.off(eventName, callback)
    }
  }, [token, user, eventName, callback])
}
