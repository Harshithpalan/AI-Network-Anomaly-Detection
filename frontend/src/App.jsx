import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import Dashboard from './components/Dashboard'
import TrafficTable from './components/TrafficTable'
import AnomalyAlerts from './components/AnomalyAlerts'
import MetricsChart from './components/MetricsChart'
import './App.css'

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling']
})

function App() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [trafficData, setTrafficData] = useState({ normal: [], anomalies: [] })
  const [stats, setStats] = useState({
    totalConnections: 0,
    anomalyCount: 0,
    totalBytes: 0,
    avgDuration: 0
  })

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server')
    })

    socket.on('traffic_update', (data) => {
      setTrafficData({
        normal: data.normal || [],
        anomalies: data.anomalies || []
      })

      // Update stats
      const allTraffic = [...(data.normal || []), ...(data.anomalies || [])]
      setStats({
        totalConnections: allTraffic.length,
        anomalyCount: (data.anomalies || []).length,
        totalBytes: allTraffic.reduce((sum, t) => sum + t.bytes_sent + t.bytes_received, 0),
        avgDuration: allTraffic.length > 0 
          ? allTraffic.reduce((sum, t) => sum + t.duration, 0) / allTraffic.length 
          : 0
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const startMonitoring = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/start-monitoring', {
        method: 'POST'
      })
      if (response.ok) {
        setIsMonitoring(true)
      }
    } catch (error) {
      console.error('Error starting monitoring:', error)
    }
  }

  const stopMonitoring = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stop-monitoring', {
        method: 'POST'
      })
      if (response.ok) {
        setIsMonitoring(false)
      }
    } catch (error) {
      console.error('Error stopping monitoring:', error)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Network Anomaly Detection</h1>
        <p>Real-time network traffic monitoring with machine learning</p>
      </header>

      <Dashboard
        isMonitoring={isMonitoring}
        onStart={startMonitoring}
        onStop={stopMonitoring}
        stats={stats}
      />

      <div className="main-content">
        <div className="chart-section">
          <MetricsChart trafficData={trafficData} />
        </div>

        <div className="alerts-section">
          <AnomalyAlerts anomalies={trafficData.anomalies} />
        </div>

        <div className="table-section">
          <TrafficTable 
            normalTraffic={trafficData.normal} 
            anomalousTraffic={trafficData.anomalies}
          />
        </div>
      </div>
    </div>
  )
}

export default App
