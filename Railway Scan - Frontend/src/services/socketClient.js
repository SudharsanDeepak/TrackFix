/**
 * RailTrack Socket Client Utility
 * Use this in both Web Frontend and Mobile Inspector App for real-time updates
 * 
 * Installation:
 * npm install socket.io-client
 * 
 * Usage Example (React):
 * 
 * import { SocketClient } from './services/socketClient'
 * 
 * useEffect(() => {
 *   const socket = SocketClient.getInstance(token, userId, role, zoneCode, depotId)
 *   
 *   // Listen to inspection events
 *   socket.on('inspection.created', (inspection) => {
 *     setInspections(prev => [inspection, ...prev])
 *   })
 *   
 *   socket.on('inspection.updated', (data) => {
 *     setInspections(prev => prev.map(i => i._id === data.inspectionId ? {...i, ...data.updates} : i))
 *   })
 *   
 *   return () => {
 *     socket.disconnect()
 *   }
 * }, [token, userId, role])
 */

import io from 'socket.io-client'

class SocketClient {
  static instance = null
  
  static getInstance(token, userId, role, zoneCode = null, depotId = null) {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient(token, userId, role, zoneCode, depotId)
    }
    return SocketClient.instance.socket
  }

  constructor(token, userId, role, zoneCode, depotId) {
    const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_WS_URL || 'http://localhost:5000'
    this.socket = io(baseUrl, {
      auth: {
        token,
        userId,
        role,
        zoneCode,
        depotId,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    })

    this.setupListeners()
  }

  setupListeners() {
    this.socket.on('connect', () => {
      console.log('✓ Socket connected:', this.socket.id)
    })

    this.socket.on('connect:success', (data) => {
      console.log('✓ Socket authenticated:', data)
    })

    this.socket.on('disconnect', () => {
      console.log('✗ Socket disconnected')
    })

    this.socket.on('error', (error) => {
      console.error('✗ Socket error:', error)
    })
  }
}

export default SocketClient
