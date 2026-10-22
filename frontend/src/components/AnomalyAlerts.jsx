import React from 'react'
import './AnomalyAlerts.css'

function AnomalyAlerts({ anomalies }) {
  if (anomalies.length === 0) {
    return (
      <div className="anomaly-alerts">
        <h2>🔔 Anomaly Alerts</h2>
        <div className="no-alerts">
          <div className="no-alerts-icon">✅</div>
          <p>No anomalies detected</p>
          <span className="no-alerts-sub">Network traffic appears normal</span>
        </div>
      </div>
    )
  }

  const getSeverity = (anomaly) => {
    if (anomaly.bytes_sent > 1000000 || anomaly.packet_count > 1000) {
      return 'critical'
    } else if (anomaly.bytes_sent > 100000 || anomaly.packet_count > 100) {
      return 'high'
    }
    return 'medium'
  }

  const formatBytes = (bytes) => {
    if (bytes >= 1024 * 1024) {
      return (bytes / 1024 / 1024).toFixed(2) + ' MB'
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB'
    }
    return bytes + ' B'
  }

  return (
    <div className="anomaly-alerts">
      <h2>🔔 Anomaly Alerts</h2>
      <div className="alerts-list">
        {anomalies.map((anomaly, index) => (
          <div key={index} className={`alert-card ${getSeverity(anomaly)}`}>
            <div className="alert-header">
              <span className={`alert-severity ${getSeverity(anomaly)}`}>
                {getSeverity(anomaly).toUpperCase()}
              </span>
              <span className="alert-time">
                {new Date(anomaly.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="alert-body">
              <div className="alert-detail">
                <span className="detail-label">Source:</span>
                <span className="detail-value">{anomaly.source_ip}</span>
              </div>
              <div className="alert-detail">
                <span className="detail-label">Destination:</span>
                <span className="detail-value">{anomaly.destination_ip}:{anomaly.port}</span>
              </div>
              <div className="alert-detail">
                <span className="detail-label">Protocol:</span>
                <span className="detail-value">{anomaly.protocol}</span>
              </div>
              <div className="alert-detail">
                <span className="detail-label">Data Sent:</span>
                <span className="detail-value">{formatBytes(anomaly.bytes_sent)}</span>
              </div>
              <div className="alert-detail">
                <span className="detail-label">Packets:</span>
                <span className="detail-value">{anomaly.packet_count}</span>
              </div>
              <div className="alert-detail">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{anomaly.duration.toFixed(2)}s</span>
              </div>
            </div>
            <div className="alert-footer">
              <span className="alert-score">
                Anomaly Score: {anomaly.anomaly_score?.toFixed(4) || 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnomalyAlerts
