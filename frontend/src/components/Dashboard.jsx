import React from 'react'
import './Dashboard.css'

function Dashboard({ isMonitoring, onStart, onStop, stats }) {
  return (
    <div className="dashboard">
      <div className="control-panel">
        <button
          className={`control-button ${isMonitoring ? 'stop' : 'start'}`}
          onClick={isMonitoring ? onStop : onStart}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
        <div className="status-indicator">
          <span className={`status-dot ${isMonitoring ? 'active' : 'inactive'}`}></span>
          <span className="status-text">
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalConnections}</div>
            <div className="stat-label">Total Connections</div>
          </div>
        </div>

        <div className="stat-card anomaly">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.anomalyCount}</div>
            <div className="stat-label">Anomalies Detected</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💾</div>
          <div className="stat-content">
            <div className="stat-value">{(stats.totalBytes / 1024 / 1024).toFixed(2)} MB</div>
            <div className="stat-label">Total Data Transferred</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.avgDuration.toFixed(2)}s</div>
            <div className="stat-label">Avg Duration</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
