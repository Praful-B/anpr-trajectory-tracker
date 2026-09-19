import { useState, useEffect, useCallback } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { hotlistApi, sightingApi, HotlistEntry, Sighting } from './services/api'
import { connectWebSocket, disconnectWebSocket, subscribeToSightings } from './services/websocket'
import type { Sighting } from './services/api'
import LoginForm from './components/LoginForm'
import HotlistTable from './components/HotlistTable'
import TrajectoryMap from './components/TrajectoryMap'
import AuditLog from './components/AuditLog'
import './App.css'

function Dashboard() {
  const { isAuthenticated, isCop, userEmail, logout } = useAuth()
  const [hotlist, setHotlist] = useState<HotlistEntry[]>([])
  const [sightings, setSightings] = useState<Sighting[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlate, setSelectedPlate] = useState<HotlistEntry | null>(null)
  const [mapSightings, setMapSightings] = useState<Sighting[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')

  const loadData = useCallback(async () => {
    try {
      const [hotlistData, sightingsData, auditData] = await Promise.all([
        hotlistApi.getAll(),
        sightingApi.getAll(),
        Promise.resolve([]) // Audit logs loaded separately
      ])
      setHotlist(hotlistData)
      setSightings(sightingsData)
      
      // Reload audit logs
      const response = await fetch('/api/v1/cop/audit?limit=20')
      if (response.ok) {
        const logs = await response.json()
        setAuditLogs(logs)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated && isCop) {
      loadData()
      connectWebSocket()

      // Subscribe to real-time sighting updates
      const unsubscribe = subscribeToSightings((sighting) => {
        setSightings(prev => {
          // Avoid duplicates
          if (prev.some(s => s.id === sighting.id)) return prev
          return [...prev, sighting]
        })
        
        // Update hotlist with new location
        setHotlist(prev => prev.map(entry => {
          if (entry.id === sighting.hotlistId) {
            return {
              ...entry,
              lastSeenLat: sighting.latitude.toString(),
              lastSeenLng: sighting.longitude.toString(),
              lastSeenAt: sighting.capturedAt
            }
          }
          return entry
        }))
      })

      return () => {
        unsubscribe()
        disconnectWebSocket()
      }
    }
  }, [isAuthenticated, isCop, loadData])

  const filteredHotlist = hotlist.filter(entry => {
    const matchesSearch = searchQuery === '' || entry.plateNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'ALL' || entry.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleViewTrail = (entry: HotlistEntry) => {
    setSelectedPlate(entry)
    // Find sightings for this plate
    const plateSightings = sightings.filter(s => {
      const hotlistEntry = hotlist.find(h => h.id === s.hotlistId)
      return hotlistEntry?.plateNumber === entry.plateNumber
    })
    setMapSightings(plateSightings)
  }

  const handleVerifyFir = async (entry: HotlistEntry) => {
    const firNo = prompt('Enter FIR reference number:')
    if (!firNo) return

    try {
      await hotlistApi.verifyFir(entry.id, firNo)
      await loadData()
    } catch (error) {
      console.error('Failed to verify FIR:', error)
      alert('Failed to verify FIR')
    }
  }

  const handleMarkRecovered = async (entry: HotlistEntry) => {
    if (!confirm(`Mark ${entry.plateNumber} as recovered?`)) return

    try {
      await hotlistApi.markRecovered(entry.id)
      await loadData()
    } catch (error) {
      console.error('Failed to mark recovered:', error)
      alert('Failed to mark as recovered')
    }
  }

  if (!isAuthenticated || !isCop) {
    return (
      <div className="app">
        <LoginForm />
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="white" d="M12 2L2 7v10l10 5 10-5V7l-10-5zM4 9.5l8 4 8-4v2l-8 4-8-4V9.5z" />
            </svg>
            <span>RAKSHAK</span>
          </div>
          <div className="header-info">
            <span className="welcome-text">Welcome, Officer</span>
            <span className="user-email">{userEmail}</span>
          </div>
        </div>
        <div className="header-right">
          <span className="cop-badge">COP</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="main-panel">
          <div className="panel-header">
            <h2>Hotlist Monitor</h2>
            <div className="search-filter">
              <input
                type="text"
                placeholder="Search by plate number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE_UNCONFIRMED">Pending FIR</option>
                <option value="ACTIVE_CONFIRMED">FIR Verified</option>
                <option value="EXPIRED">Expired</option>
                <option value="RECOVERED">Recovered</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading hotlist...</p>
            </div>
          ) : (
            <HotlistTable
              entries={filteredHotlist}
              onViewTrail={handleViewTrail}
              onVerifyFir={handleVerifyFir}
              onMarkRecovered={handleMarkRecovered}
            />
          )}
        </div>

        <div className="side-panel">
          <AuditLog logs={auditLogs} />
          <div className="stats-card">
            <h3>Live Statistics</h3>
            <div className="stat-row">
              <span className="stat-value">{hotlist.length}</span>
              <span className="stat-label">Total on Hotlist</span>
            </div>
            <div className="stat-row stat-pending">
              <span className="stat-value">
                {hotlist.filter(h => h.status === 'ACTIVE_UNCONFIRMED').length}
              </span>
              <span className="stat-label">Pending FIR</span>
            </div>
            <div className="stat-row stat-verified">
              <span className="stat-value">
                {hotlist.filter(h => h.status === 'ACTIVE_CONFIRMED').length}
              </span>
              <span className="stat-label">FIR Verified</span>
            </div>
            <div className="stat-row">
              <span className="stat-value">{sightings.length}</span>
              <span className="stat-label">Sightings Today</span>
            </div>
          </div>
        </div>
      </div>

      {selectedPlate && (
        <TrajectoryMap
          sightings={mapSightings}
          plateNumber={selectedPlate.plateNumber}
          onClose={() => {
            setSelectedPlate(null)
            setMapSightings([])
          }}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  )
}

export default App
