# AI Network Anomaly Detection

A real-time web application for detecting network traffic anomalies using machine learning. Built with React (frontend) and Flask (backend).

## Features

- **Real-time Monitoring**: Live network traffic analysis with WebSocket updates
- **ML-Powered Detection**: Isolation Forest algorithm for anomaly detection
- **Interactive Dashboard**: Visual metrics and statistics
- **Alert System**: Real-time anomaly alerts with severity levels
- **Data Visualization**: Charts showing traffic patterns, protocol distribution, and port usage
- **Traffic Logs**: Detailed table view of all network connections

## Architecture

### Backend (Flask)
- REST API for control endpoints
- WebSocket (Socket.IO) for real-time data streaming
- Scikit-learn Isolation Forest for anomaly detection
- Synthetic traffic generation for demonstration

### Frontend (React)
- Vite for fast development
- Socket.IO client for real-time updates
- Recharts for data visualization
- Responsive design with modern UI

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start the Backend

```bash
cd backend
python app.py
```

The backend will start on `http://localhost:5000`

### Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Click "Start Monitoring" to begin real-time traffic analysis
3. View the dashboard for:
   - Live statistics (connections, anomalies, data transfer)
   - Real-time traffic charts
   - Anomaly alerts with severity levels
   - Detailed traffic logs table
4. Click "Stop Monitoring" to pause analysis

## Anomaly Detection

The system uses an Isolation Forest model to detect anomalous network traffic patterns:

- **Port Scans**: Multiple connection attempts to different ports
- **DDoS Attacks**: High volume traffic from single source
- **Data Exfiltration**: Large outbound data transfers
- **Unusual Protocols**: Traffic on uncommon ports/protocols

## API Endpoints

- `GET /api/health` - Check server health
- `POST /api/start-monitoring` - Start real-time monitoring
- `POST /api/stop-monitoring` - Stop monitoring
- `POST /api/analyze` - Analyze uploaded traffic data
- `GET /api/stats` - Get current monitoring statistics

## WebSocket Events

- `traffic_update` - Real-time traffic data updates
- `connection_response` - Connection confirmation

## Project Structure

```
AI Network Anomaly Detection/
├── backend/
│   ├── app.py              # Flask application
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite configuration
│   └── package.json        # Node dependencies
└── README.md               # This file
```

## Customization

### Adjust Anomaly Sensitivity

In `backend/app.py`, modify the `contamination` parameter:

```python
model = IsolationForest(contamination=0.1, random_state=42)
```

Lower values (e.g., 0.05) = fewer false positives, may miss some anomalies
Higher values (e.g., 0.2) = more sensitive, may have more false positives

### Traffic Generation Rate

In `backend/app.py`, modify the sleep time in `monitor_traffic()`:

```python
time.sleep(2)  # Current: updates every 2 seconds
```

## Future Enhancements

- Integration with real network traffic (pcap files, live network interfaces)
- Additional ML models (Autoencoders, One-Class SVM)
- Historical data analysis and trend detection
- User authentication and role-based access
- Export functionality for reports
- Configuration UI for model parameters
