import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import {
  randomString,
  randomItem,
} from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const documentUploadDuration = new Trend('document_upload_duration');
const apiCallDuration = new Trend('api_call_duration');
const successfulRequests = new Counter('successful_requests');
const activeUsers = new Gauge('active_users');

// Test configuration for 10,000 concurrent users
export const options = {
  scenarios: {
    // Scenario 1: Gradual ramp-up to 10,000 users
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 1000 }, // Ramp up to 1,000 users over 5 minutes
        { duration: '10m', target: 5000 }, // Ramp up to 5,000 users over 10 minutes
        { duration: '15m', target: 10000 }, // Ramp up to 10,000 users over 15 minutes
        { duration: '20m', target: 10000 }, // Stay at 10,000 users for 20 minutes
        { duration: '10m', target: 5000 }, // Ramp down to 5,000 users
        { duration: '5m', target: 0 }, // Ramp down to 0 users
      ],
      gracefulRampDown: '30s',
    },
    // Scenario 2: Spike test
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '30s', target: 10000 }, // Sudden spike to 10,000 users
        { duration: '3m', target: 10000 }, // Hold at 10,000 users
        { duration: '30s', target: 100 }, // Quick drop
      ],
      startTime: '65m', // Start after load test
    },
    // Scenario 3: Stress test for breaking point
    stress_test: {
      executor: 'ramping-arrival-rate',
      startRate: 100,
      timeUnit: '1s',
      preAllocatedVUs: 2000,
      maxVUs: 15000,
      stages: [
        { duration: '5m', target: 1000 }, // 1,000 requests per second
        { duration: '5m', target: 5000 }, // 5,000 requests per second
        { duration: '5m', target: 10000 }, // 10,000 requests per second
        { duration: '5m', target: 15000 }, // 15,000 requests per second
      ],
      startTime: '85m', // Start after spike test
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests under 500ms, 99% under 1s
    http_req_failed: ['rate<0.05'], // Error rate under 5%
    errors: ['rate<0.05'], // Custom error rate under 5%
    login_duration: ['p(95)<2000'], // 95% of logins under 2s
    document_upload_duration: ['p(95)<5000'], // 95% of uploads under 5s
  },
};

// Test configuration
const BASE_URL = __ENV.BASE_URL || 'https://legacyguard-staging.vercel.app';
const API_URL = __ENV.API_URL || 'https://api.legacyguard.com/v1';

// Test data
const testUsers = generateTestUsers(100);
const documentCategories = [
  'personal',
  'legal',
  'financial',
  'medical',
  'property',
];
const documentSizes = [100000, 500000, 1000000, 5000000]; // 100KB to 5MB

function generateTestUsers(count) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      email: `loadtest_${i}@example.com`,
      password: 'Test123!@#',
      firstName: `LoadTest${i}`,
      lastName: 'User',
    });
  }
  return users;
}

// Helper function to handle API responses
function handleResponse(response, requestName) {
  const success = check(response, {
    [`${requestName}: status is 200-299`]: r =>
      r.status >= 200 && r.status < 300,
    [`${requestName}: response time < 1000ms`]: r => r.timings.duration < 1000,
  });

  if (success) {
    successfulRequests.add(1);
  } else {
    errorRate.add(1);
    console.error(
      `${requestName} failed: ${response.status} - ${response.body}`
    );
  }

  return success;
}

// Test scenarios
export default function () {
  const user = randomItem(testUsers);
  activeUsers.add(1);

  group('User Authentication Flow', () => {
    // 1. Load homepage
    const homeResponse = http.get(BASE_URL, {
      tags: { name: 'Homepage' },
    });
    handleResponse(homeResponse, 'Homepage');
    sleep(1);

    // 2. Sign in
    const loginStart = Date.now();
    const loginResponse = http.post(
      `${API_URL}/auth/login`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        tags: { name: 'Login' },
      }
    );
    loginDuration.add(Date.now() - loginStart);

    if (!handleResponse(loginResponse, 'Login')) {
      return; // Exit if login fails
    }

    const authToken = JSON.parse(loginResponse.body).token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    };

    sleep(2);

    // 3. Load dashboard
    const dashboardResponse = http.get(`${BASE_URL}/dashboard`, {
      headers: authHeaders,
      tags: { name: 'Dashboard' },
    });
    handleResponse(dashboardResponse, 'Dashboard');
    sleep(1);
  });

  group('Document Operations', () => {
    const authToken = 'mock-token'; // In real test, use token from login
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    };

    // 1. List documents
    const listStart = Date.now();
    const listResponse = http.get(`${API_URL}/documents`, {
      headers: authHeaders,
      tags: { name: 'ListDocuments' },
    });
    apiCallDuration.add(Date.now() - listStart);
    handleResponse(listResponse, 'ListDocuments');
    sleep(1);

    // 2. Upload document (simulated)
    const uploadStart = Date.now();
    const documentData = {
      name: `test-doc-${randomString(8)}.pdf`,
      category: randomItem(documentCategories),
      size: randomItem(documentSizes),
      encrypted: true,
    };

    const uploadResponse = http.post(
      `${API_URL}/documents`,
      JSON.stringify(documentData),
      {
        headers: authHeaders,
        tags: { name: 'UploadDocument' },
      }
    );
    documentUploadDuration.add(Date.now() - uploadStart);
    handleResponse(uploadResponse, 'UploadDocument');
    sleep(2);

    // 3. Search documents
    const searchResponse = http.get(
      `${API_URL}/documents?search=test&category=legal`,
      {
        headers: authHeaders,
        tags: { name: 'SearchDocuments' },
      }
    );
    handleResponse(searchResponse, 'SearchDocuments');
    sleep(1);
  });

  group('Family Management', () => {
    const authToken = 'mock-token';
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    };

    // 1. List family members
    const familyResponse = http.get(`${API_URL}/family/members`, {
      headers: authHeaders,
      tags: { name: 'ListFamily' },
    });
    handleResponse(familyResponse, 'ListFamily');
    sleep(1);

    // 2. Add family member
    const memberData = {
      firstName: randomString(8),
      lastName: randomString(8),
      relationship: 'sibling',
      email: `${randomString(8)}@example.com`,
    };

    const addMemberResponse = http.post(
      `${API_URL}/family/members`,
      JSON.stringify(memberData),
      {
        headers: authHeaders,
        tags: { name: 'AddFamilyMember' },
      }
    );
    handleResponse(addMemberResponse, 'AddFamilyMember');
    sleep(1);
  });

  group('AI Assistant Interaction', () => {
    const authToken = 'mock-token';
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    };

    const questions = [
      'How do I create a will?',
      'What documents do I need for inheritance?',
      'How can I add a guardian?',
      'What is the inheritance tax in Czech Republic?',
    ];

    const aiResponse = http.post(
      `${API_URL}/ai/chat`,
      JSON.stringify({
        message: randomItem(questions),
        context: { category: 'legal' },
      }),
      {
        headers: authHeaders,
        tags: { name: 'AIChat' },
      }
    );
    handleResponse(aiResponse, 'AIChat');
    sleep(2);
  });

  group('Vault Operations', () => {
    const authToken = 'mock-token';
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    };

    // 1. List vault items
    const vaultResponse = http.get(`${API_URL}/vault/items`, {
      headers: authHeaders,
      tags: { name: 'ListVaultItems' },
    });
    handleResponse(vaultResponse, 'ListVaultItems');
    sleep(1);

    // 2. Add vault item
    const vaultItem = {
      type: 'password',
      name: `service-${randomString(8)}`,
      data: {
        username: `user-${randomString(8)}`,
        password: randomString(16),
        url: `https://${randomString(8)}.com`,
      },
    };

    const addVaultResponse = http.post(
      `${API_URL}/vault/items`,
      JSON.stringify(vaultItem),
      {
        headers: authHeaders,
        tags: { name: 'AddVaultItem' },
      }
    );
    handleResponse(addVaultResponse, 'AddVaultItem');
    sleep(1);
  });

  // Simulate user think time between operations
  sleep(Math.random() * 5 + 3);
  activeUsers.add(-1);
}

// Setup function - runs once before the test
export function setup() {
  console.error('🚀 Starting LegacyGuard Load Test');
  console.error(`📍 Target URL: ${BASE_URL}`);
  console.error(`🎯 Target: 10,000 concurrent users`);
  console.error('⏱️  Total duration: ~105 minutes');

  // Verify the target is accessible
  const response = http.get(BASE_URL);
  check(response, {
    'Target is accessible': r => r.status === 200,
  });

  if (response.status !== 200) {
    throw new Error(
      `Target ${BASE_URL} is not accessible. Status: ${response.status}`
    );
  }

  return { startTime: Date.now() };
}

// Teardown function - runs once after the test
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000 / 60;
  console.error(`✅ Load test completed in ${duration.toFixed(2)} minutes`);
  console.error('📊 Check the k6 cloud or HTML report for detailed results');
}

// Handle test summary
export function handleSummary(data) {
  return {
    'load-test-summary.html': htmlReport(data),
    'load-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function htmlReport(data) {
  const metrics = data.metrics;
  return `
<!DOCTYPE html>
<html>
<head>
    <title>LegacyGuard Load Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        .metric { 
            background: #f5f5f5; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 5px;
            border-left: 4px solid #4CAF50;
        }
        .failed { border-left-color: #f44336; }
        .warning { border-left-color: #ff9800; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
        th { background: #f5f5f5; }
        .summary { background: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🚀 LegacyGuard Load Test Results</h1>
    <div class="summary">
        <h2>Executive Summary</h2>
        <p><strong>Test Type:</strong> Load Test (10,000 concurrent users)</p>
        <p><strong>Duration:</strong> ${Math.round(metrics.iteration_duration.med / 1000)}s median iteration</p>
        <p><strong>Success Rate:</strong> ${(100 - metrics.http_req_failed.rate * 100).toFixed(2)}%</p>
        <p><strong>Total Requests:</strong> ${metrics.http_reqs.count}</p>
    </div>
    
    <h2>Key Performance Metrics</h2>
    <table>
        <tr>
            <th>Metric</th>
            <th>Value</th>
            <th>Target</th>
            <th>Status</th>
        </tr>
        <tr>
            <td>Response Time (p95)</td>
            <td>${Math.round(metrics.http_req_duration.p95)}ms</td>
            <td>&lt; 500ms</td>
            <td>${metrics.http_req_duration.p95 < 500 ? '✅' : '❌'}</td>
        </tr>
        <tr>
            <td>Response Time (p99)</td>
            <td>${Math.round(metrics.http_req_duration.p99)}ms</td>
            <td>&lt; 1000ms</td>
            <td>${metrics.http_req_duration.p99 < 1000 ? '✅' : '❌'}</td>
        </tr>
        <tr>
            <td>Error Rate</td>
            <td>${(metrics.http_req_failed.rate * 100).toFixed(2)}%</td>
            <td>&lt; 5%</td>
            <td>${metrics.http_req_failed.rate < 0.05 ? '✅' : '❌'}</td>
        </tr>
        <tr>
            <td>Requests per Second</td>
            <td>${Math.round(metrics.http_reqs.rate)}</td>
            <td>-</td>
            <td>ℹ️</td>
        </tr>
    </table>
    
    <h2>Detailed Results</h2>
    <div class="metric">
        <h3>HTTP Request Duration</h3>
        <ul>
            <li>Min: ${Math.round(metrics.http_req_duration.min)}ms</li>
            <li>Median: ${Math.round(metrics.http_req_duration.med)}ms</li>
            <li>Max: ${Math.round(metrics.http_req_duration.max)}ms</li>
            <li>p90: ${Math.round(metrics.http_req_duration.p90)}ms</li>
            <li>p95: ${Math.round(metrics.http_req_duration.p95)}ms</li>
            <li>p99: ${Math.round(metrics.http_req_duration.p99)}ms</li>
        </ul>
    </div>
    
    <div class="metric">
        <h3>Throughput</h3>
        <ul>
            <li>Total Requests: ${metrics.http_reqs.count}</li>
            <li>Requests/sec: ${Math.round(metrics.http_reqs.rate)}</li>
            <li>Data Received: ${(metrics.data_received.count / 1024 / 1024).toFixed(2)} MB</li>
            <li>Data Sent: ${(metrics.data_sent.count / 1024 / 1024).toFixed(2)} MB</li>
        </ul>
    </div>
    
    <div class="metric ${metrics.http_req_failed.rate > 0.05 ? 'failed' : ''}">
        <h3>Errors</h3>
        <ul>
            <li>Failed Requests: ${metrics.http_req_failed.passes}</li>
            <li>Error Rate: ${(metrics.http_req_failed.rate * 100).toFixed(2)}%</li>
        </ul>
    </div>
    
    <p><em>Generated: ${new Date().toISOString()}</em></p>
</body>
</html>
  `;
}
