import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import './MetricsChart.css'

function MetricsChart({ trafficData }) {
  const { normal, anomalies } = trafficData

  // Prepare time-series data for traffic volume
  const timeSeriesData = []
  const timeMap = new Map()

  normal.concat(anomalies).forEach((traffic) => {
    const time = new Date(traffic.timestamp).toLocaleTimeString()
    if (!timeMap.has(time)) {
      timeMap.set(time, {
        time,
        normal: 0,
        anomalies: 0,
        totalBytes: 0
      })
    }
    const entry = timeMap.get(time)
    if (traffic.is_anomaly) {
      entry.anomalies += 1
    } else {
      entry.normal += 1
    }
    entry.totalBytes += traffic.bytes_sent + traffic.bytes_received
  })

  timeSeriesData.push(...Array.from(timeMap.values()).slice(-20))

  // Prepare protocol distribution data
  const protocolMap = new Map()
  normal.forEach((traffic) => {
    const protocol = traffic.protocol
    protocolMap.set(protocol, (protocolMap.get(protocol) || 0) + 1)
  })

  const protocolData = Array.from(protocolMap.entries()).map(([name, value]) => ({
    name,
    value
  }))

  // Prepare port distribution data
  const portMap = new Map()
  normal.forEach((traffic) => {
    const port = traffic.port
    portMap.set(port, (portMap.get(port) || 0) + 1)
  })

  const portData = Array.from(portMap.entries())
    .map(([name, value]) => ({ name: name.toString(), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const COLORS = ['#00d4ff', '#7c3aed', '#00ff88', '#ffc107', '#ff4757']

  return (
    <div className="metrics-chart">
      <h2>📈 Traffic Metrics</h2>
      
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Traffic Volume Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="time" 
                stroke="#a0aec0"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#a0aec0"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(26, 26, 46, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="normal" 
                stroke="#00ff88" 
                strokeWidth={2}
                name="Normal Traffic"
              />
              <Line 
                type="monotone" 
                dataKey="anomalies" 
                stroke="#ff4757" 
                strokeWidth={2}
                name="Anomalies"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Protocol Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={protocolData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {protocolData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(26, 26, 46, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Top Ports by Traffic</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={portData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="#a0aec0"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#a0aec0"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(26, 26, 46, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default MetricsChart
