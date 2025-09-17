#!/bin/bash

# LegacyGuard Load Testing Script
# Runs k6 load test simulating 10,000 concurrent users

set -e

echo "🚀 LegacyGuard Load Testing Script"
echo "===================================="
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 is not installed. Installing..."
    
    # Detect OS and install k6
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install k6
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
        echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6
    else
        echo "Please install k6 manually from: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
fi

# Configuration
TARGET_URL="${1:-https://legacyguard-staging.vercel.app}"
API_URL="${2:-https://api.legacyguard.com/v1}"
TEST_TYPE="${3:-quick}"  # quick, full, or stress

# Select test configuration based on type
case $TEST_TYPE in
    quick)
        echo "📋 Running quick load test (100 users, 5 minutes)"
        TEST_CONFIG="--duration=5m --vus=100"
        ;;
    full)
        echo "📋 Running full load test (10,000 users, 105 minutes)"
        TEST_CONFIG=""  # Use default configuration from script
        ;;
    stress)
        echo "📋 Running stress test (15,000 users, 20 minutes)"
        TEST_CONFIG="--duration=20m --vus=15000"
        ;;
    *)
        echo "❌ Invalid test type. Use: quick, full, or stress"
        exit 1
        ;;
esac

# Create results directory
RESULTS_DIR="load-test-results/$(date +%Y%m%d-%H%M%S)"
mkdir -p $RESULTS_DIR

echo "🎯 Target URL: $TARGET_URL"
echo "🔗 API URL: $API_URL"
echo "📁 Results will be saved to: $RESULTS_DIR"
echo ""

# Pre-test health check
echo "🏥 Performing pre-test health check..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" $TARGET_URL)
if [ $HEALTH_CHECK -ne 200 ]; then
    echo "❌ Target is not healthy (HTTP $HEALTH_CHECK). Aborting."
    exit 1
fi
echo "✅ Target is healthy"
echo ""

# Run the load test
echo "🚀 Starting load test..."
echo "------------------------"

k6 run \
    --env BASE_URL=$TARGET_URL \
    --env API_URL=$API_URL \
    --out json=$RESULTS_DIR/results.json \
    --summary-export=$RESULTS_DIR/summary.json \
    $TEST_CONFIG \
    tests/load/k6-load-test.js

# Check if test passed
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Load test completed successfully!"
else
    echo ""
    echo "❌ Load test failed. Check the results for details."
fi

# Generate HTML report if results exist
if [ -f "$RESULTS_DIR/summary.json" ]; then
    echo ""
    echo "📊 Generating HTML report..."
    
    # Create a simple HTML report from the JSON summary
    cat > $RESULTS_DIR/report.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Load Test Report</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 40px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #333;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .metric-card {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2196F3;
        }
        .metric-card h3 {
            margin: 0 0 10px 0;
            color: #555;
            font-size: 14px;
            text-transform: uppercase;
        }
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            color: #333;
        }
        .metric-unit {
            font-size: 14px;
            color: #777;
            margin-left: 5px;
        }
        .status-pass { color: #4CAF50; }
        .status-fail { color: #f44336; }
        .chart {
            margin: 30px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f5f5f5;
            font-weight: 600;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 LegacyGuard Load Test Report</h1>
        
        <div class="metric-grid">
            <div class="metric-card">
                <h3>Total Requests</h3>
                <span class="metric-value" id="total-requests">-</span>
            </div>
            <div class="metric-card">
                <h3>Success Rate</h3>
                <span class="metric-value" id="success-rate">-</span>
                <span class="metric-unit">%</span>
            </div>
            <div class="metric-card">
                <h3>Avg Response Time</h3>
                <span class="metric-value" id="avg-response">-</span>
                <span class="metric-unit">ms</span>
            </div>
            <div class="metric-card">
                <h3>Peak RPS</h3>
                <span class="metric-value" id="peak-rps">-</span>
                <span class="metric-unit">req/s</span>
            </div>
        </div>
        
        <div class="chart">
            <h2>Response Time Distribution</h2>
            <table>
                <thead>
                    <tr>
                        <th>Percentile</th>
                        <th>Response Time (ms)</th>
                        <th>Target</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="percentiles">
                </tbody>
            </table>
        </div>
        
        <div class="chart">
            <h2>Test Configuration</h2>
            <table>
                <tbody>
                    <tr><td><strong>Target URL:</strong></td><td id="target-url">-</td></tr>
                    <tr><td><strong>Test Duration:</strong></td><td id="test-duration">-</td></tr>
                    <tr><td><strong>Max Virtual Users:</strong></td><td id="max-vus">-</td></tr>
                    <tr><td><strong>Test Type:</strong></td><td id="test-type">-</td></tr>
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>Generated: <span id="timestamp"></span></p>
            <p>Full results available in: <code id="results-path"></code></p>
        </div>
    </div>
    
    <script>
        // Load and display the summary data
        fetch('summary.json')
            .then(response => response.json())
            .then(data => {
                // Update metrics
                document.getElementById('timestamp').textContent = new Date().toLocaleString();
                document.getElementById('results-path').textContent = window.location.pathname.replace('/report.html', '');
                
                // Parse and display the data
                if (data.metrics) {
                    // Add your parsing logic here based on actual k6 output format
                }
            })
            .catch(error => {
                console.error('Error loading summary data:', error);
            });
    </script>
</body>
</html>
EOF
    
    echo "📄 HTML report generated: $RESULTS_DIR/report.html"
fi

# Open report in browser (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open $RESULTS_DIR/report.html
fi

echo ""
echo "📊 Load Test Results Summary"
echo "============================"
echo "• Results directory: $RESULTS_DIR"
echo "• JSON results: $RESULTS_DIR/results.json"
echo "• Summary: $RESULTS_DIR/summary.json"
echo "• HTML report: $RESULTS_DIR/report.html"
echo ""
echo "📈 Next steps:"
echo "  1. Review the HTML report for detailed metrics"
echo "  2. Check response time percentiles (p95, p99)"
echo "  3. Analyze error rates and types"
echo "  4. Review resource utilization on the server"
echo "  5. Identify and fix any bottlenecks"
