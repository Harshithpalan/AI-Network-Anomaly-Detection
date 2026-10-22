from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import datetime
import threading
import time

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'network-anomaly-detection-secret'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Global model and scaler
model = None
scaler = None
is_monitoring = False
monitor_thread = None

# Initialize anomaly detection model
def initialize_model():
    global model, scaler
    scaler = StandardScaler()
    model = IsolationForest(contamination=0.1, random_state=42)
    
    # Train with initial synthetic data
    normal_data = generate_normal_traffic(1000)
    features = prepare_features(normal_data)
    scaler.fit(features)
    model.fit(scaler.transform(features))

def generate_normal_traffic(n_samples=100):
    """Generate synthetic normal network traffic data"""
    data = []
    for _ in range(n_samples):
        data.append({
            'timestamp': datetime.datetime.now().isoformat(),
            'source_ip': f"192.168.1.{np.random.randint(1, 255)}",
            'destination_ip': f"10.0.0.{np.random.randint(1, 255)}",
            'port': np.random.choice([80, 443, 22, 53, 3306, 5432]),
            'protocol': np.random.choice(['TCP', 'UDP', 'HTTP', 'HTTPS']),
            'bytes_sent': np.random.randint(100, 10000),
            'bytes_received': np.random.randint(100, 10000),
            'duration': np.random.uniform(0.1, 5.0),
            'packet_count': np.random.randint(1, 100)
        })
    return pd.DataFrame(data)

def generate_anomaly_traffic():
    """Generate synthetic anomalous network traffic"""
    anomalies = []
    anomaly_types = ['port_scan', 'ddos', 'data_exfiltration', 'unusual_protocol']
    
    for _ in range(np.random.randint(1, 5)):
        anomaly_type = np.random.choice(anomaly_types)
        
        if anomaly_type == 'port_scan':
            # Port scan: many different ports
            for port in range(1, 100, 10):
                anomalies.append({
                    'timestamp': datetime.datetime.now().isoformat(),
                    'source_ip': f"192.168.1.{np.random.randint(1, 255)}",
                    'destination_ip': f"10.0.0.{np.random.randint(1, 255)}",
                    'port': port,
                    'protocol': 'TCP',
                    'bytes_sent': np.random.randint(50, 200),
                    'bytes_received': 0,
                    'duration': np.random.uniform(0.01, 0.1),
                    'packet_count': 1
                })
        
        elif anomaly_type == 'ddos':
            # DDoS: high volume from single source
            for _ in range(50):
                anomalies.append({
                    'timestamp': datetime.datetime.now().isoformat(),
                    'source_ip': f"192.168.1.{np.random.randint(1, 255)}",
                    'destination_ip': f"10.0.0.{np.random.randint(1, 255)}",
                    'port': 80,
                    'protocol': 'HTTP',
                    'bytes_sent': np.random.randint(1000, 50000),
                    'bytes_received': np.random.randint(1000, 50000),
                    'duration': np.random.uniform(0.5, 2.0),
                    'packet_count': np.random.randint(50, 200)
                })
        
        elif anomaly_type == 'data_exfiltration':
            # Data exfiltration: large outbound transfer
            anomalies.append({
                'timestamp': datetime.datetime.now().isoformat(),
                'source_ip': f"192.168.1.{np.random.randint(1, 255)}",
                'destination_ip': f"203.0.113.{np.random.randint(1, 255)}",
                'port': 443,
                'protocol': 'HTTPS',
                'bytes_sent': np.random.randint(1000000, 10000000),
                'bytes_received': np.random.randint(100, 1000),
                'duration': np.random.uniform(10.0, 60.0),
                'packet_count': np.random.randint(1000, 10000)
            })
        
        else:  # unusual_protocol
            anomalies.append({
                'timestamp': datetime.datetime.now().isoformat(),
                'source_ip': f"192.168.1.{np.random.randint(1, 255)}",
                'destination_ip': f"10.0.0.{np.random.randint(1, 255)}",
                'port': np.random.randint(10000, 65000),
                'protocol': 'UNKNOWN',
                'bytes_sent': np.random.randint(100, 1000),
                'bytes_received': np.random.randint(100, 1000),
                'duration': np.random.uniform(0.1, 1.0),
                'packet_count': np.random.randint(1, 20)
            })
    
    return pd.DataFrame(anomalies)

def prepare_features(df):
    """Convert network traffic data to features for ML model"""
    features = df[['bytes_sent', 'bytes_received', 'duration', 'packet_count', 'port']].copy()
    features['bytes_ratio'] = features['bytes_sent'] / (features['bytes_received'] + 1)
    features['packet_rate'] = features['packet_count'] / (features['duration'] + 0.01)
    features['total_bytes'] = features['bytes_sent'] + features['bytes_received']
    return features

def monitor_traffic():
    """Background thread for real-time traffic monitoring"""
    global is_monitoring
    
    while is_monitoring:
        # Generate mixed traffic (normal + occasional anomalies)
        if np.random.random() < 0.1:  # 10% chance of anomaly
            traffic = generate_anomaly_traffic()
        else:
            traffic = generate_normal_traffic(np.random.randint(5, 20))
        
        # Detect anomalies
        features = prepare_features(traffic)
        scaled_features = scaler.transform(features)
        predictions = model.predict(scaled_features)
        anomaly_scores = model.score_samples(scaled_features)
        
        # Add predictions to data
        traffic['is_anomaly'] = predictions == -1
        traffic['anomaly_score'] = anomaly_scores
        
        # Separate normal and anomalous traffic
        normal_traffic = traffic[traffic['is_anomaly'] == False].to_dict('records')
        anomalous_traffic = traffic[traffic['is_anomaly'] == True].to_dict('records')
        
        # Emit via WebSocket
        socketio.emit('traffic_update', {
            'normal': normal_traffic,
            'anomalies': anomalous_traffic,
            'timestamp': datetime.datetime.now().isoformat()
        })
        
        time.sleep(2)  # Check every 2 seconds

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model_initialized': model is not None})

@app.route('/api/start-monitoring', methods=['POST'])
def start_monitoring():
    global is_monitoring, monitor_thread
    
    if is_monitoring:
        return jsonify({'message': 'Monitoring already active'})
    
    is_monitoring = True
    monitor_thread = threading.Thread(target=monitor_traffic, daemon=True)
    monitor_thread.start()
    
    return jsonify({'message': 'Monitoring started'})

@app.route('/api/stop-monitoring', methods=['POST'])
def stop_monitoring():
    global is_monitoring
    is_monitoring = False
    return jsonify({'message': 'Monitoring stopped'})

@app.route('/api/analyze', methods=['POST'])
def analyze_traffic():
    """Analyze uploaded traffic data"""
    data = request.json.get('traffic_data', [])
    
    if not data:
        return jsonify({'error': 'No traffic data provided'}), 400
    
    df = pd.DataFrame(data)
    features = prepare_features(df)
    scaled_features = scaler.transform(features)
    predictions = model.predict(scaled_features)
    anomaly_scores = model.score_samples(scaled_features)
    
    df['is_anomaly'] = predictions == -1
    df['anomaly_score'] = anomaly_scores
    
    return jsonify({
        'results': df.to_dict('records'),
        'anomaly_count': int((predictions == -1).sum()),
        'total_count': len(predictions)
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get current monitoring statistics"""
    return jsonify({
        'is_monitoring': is_monitoring,
        'model_status': 'initialized' if model else 'not_initialized'
    })

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connection_response', {'data': 'Connected to network anomaly detection server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    initialize_model()
    print("Starting Network Anomaly Detection Server...")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
