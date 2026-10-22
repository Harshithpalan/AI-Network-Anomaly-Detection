import React, { useState } from 'react'
import './TrafficTable.css'

function TrafficTable({ normalTraffic, anomalousTraffic }) {
  const [activeTab, setActiveTab] = useState('all')

  const allTraffic = [...normalTraffic, ...anomalousTraffic]

  const formatBytes = (bytes) => {
    if (bytes >= 1024 * 1024) {
      return (bytes / 1024 / 1024).toFixed(2) + ' MB'
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB'
    }
    return bytes + ' B'
  }

  const filteredTraffic = activeTab === 'all' 
    ? allTraffic 
    : activeTab === 'normal' 
      ? normalTraffic 
      : anomalousTraffic

  return (
    <div className="traffic-table-container">
      <div className="table-header">
        <h2>Network Traffic Logs</h2>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({allTraffic.length})
          </button>
          <button
            className={`tab ${activeTab === 'normal' ? 'active' : ''}`}
            onClick={() => setActiveTab('normal')}
          >
            Normal ({normalTraffic.length})
          </button>
          <button
            className={`tab ${activeTab === 'anomalies' ? 'active' : ''}`}
            onClick={() => setActiveTab('anomalies')}
          >
            Anomalies ({anomalousTraffic.length})
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="traffic-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Source IP</th>
              <th>Destination IP</th>
              <th>Port</th>
              <th>Protocol</th>
              <th>Bytes Sent</th>
              <th>Bytes Received</th>
              <th>Duration</th>
              <th>Packets</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTraffic.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  {activeTab === 'anomalies' 
                    ? 'No anomalies detected' 
                    : 'No traffic data available. Start monitoring to see real-time data.'}
                </td>
              </tr>
            ) : (
              filteredTraffic.map((traffic, index) => (
                <tr 
                  key={index} 
                  className={traffic.is_anomaly ? 'anomaly-row' : 'normal-row'}
                >
                  <td>{new Date(traffic.timestamp).toLocaleTimeString()}</td>
                  <td>{traffic.source_ip}</td>
                  <td>{traffic.destination_ip}</td>
                  <td>{traffic.port}</td>
                  <td>
                    <span className={`protocol-badge ${traffic.protocol.toLowerCase()}`}>
                      {traffic.protocol}
                    </span>
                  </td>
                  <td>{formatBytes(traffic.bytes_sent)}</td>
                  <td>{formatBytes(traffic.bytes_received)}</td>
                  <td>{traffic.duration.toFixed(2)}s</td>
                  <td>{traffic.packet_count}</td>
                  <td>
                    <span className={`status-badge ${traffic.is_anomaly ? 'anomaly' : 'normal'}`}>
                      {traffic.is_anomaly ? 'ANOMALY' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TrafficTable
