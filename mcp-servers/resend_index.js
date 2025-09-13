const fetch = require('node-fetch');

// Track request IDs
let nextRequestId = 0;

// Handle stdin
process.stdin.setEncoding('utf8');

// JSON-RPC response helper (newline-delimited JSON)
function sendResponse(id, result, error = null) {
  const response = {
    jsonrpc: '2.0',
    id,
  };

  if (error) {
    response.error = error;
  } else {
    response.result = result;
  }

  process.stdout.write(JSON.stringify(response) + '\n');
}

// Handle initialize request
function handleInitialize(params, id) {
  sendResponse(id, {
    protocolVersion: params.protocolVersion,
    serverInfo: {
      name: 'resend-auth-server',
      version: '1.0.0',
    },
    capabilities: {
      auth: {
        methods: ['resend'],
      },
    },
  });
}

// Handle shutdown request
function handleShutdown(params, id) {
  sendResponse(id, {});
  process.exit(0);
}

// Handle resources list request
function handleResourcesList(params, id) {
  sendResponse(id, { resources: [] });
}

// Verify Resend token with a read-only API call (list domains)
async function verifyResendToken(token) {
  const resp = await fetch('https://api.resend.com/domains', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error('Invalid Resend token');
    }
    throw new Error(`Resend API error: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.json();
  // Normalize possible shapes: {data: [...]}, {items: [...]}, or {...}
  const list = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.domains)
    ? data.domains
    : [];

  // Extract safe metadata
  const domainsSample = list
    .slice(0, 3)
    .map((d) => d?.name || d?.domain || d?.id || 'unknown');

  return {
    domain_count: list.length,
    domains_sample: domainsSample,
  };
}

// Handle auth request
async function handleAuth(params, id) {
  try {
    if (!params?.method || params.method !== 'resend') {
      throw new Error('Unsupported auth method');
    }

    const token = params.token || process.env.RESEND_API_KEY;
    if (!token) {
      throw new Error('No authentication token provided');
    }

    try {
      const meta = await verifyResendToken(token);
      sendResponse(id, {
        status: 'success',
        userId: 'resend',
        metadata: meta,
      });
    } catch (err) {
      if (String(err.message || '').includes('Invalid Resend token')) {
        sendResponse(id, null, { code: -32001, message: 'Invalid Resend token' });
      } else {
        throw err;
      }
    }
  } catch (error) {
    sendResponse(id, null, { code: -32000, message: error.message });
  }
}

// Process JSON-RPC requests (newline-delimited JSON)
let buffer = '';
process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  const messages = buffer.split('\n');
  buffer = messages.pop(); // retain last partial

  for (const message of messages) {
    if (!message.trim()) continue;
    try {
      const request = JSON.parse(message);
      if (request.jsonrpc !== '2.0') throw new Error('Invalid JSON-RPC version');

      switch (request.method) {
        case 'initialize':
          handleInitialize(request.params, request.id);
          break;
        case 'shutdown':
          handleShutdown(request.params, request.id);
          break;
        case 'auth':
          await handleAuth(request.params, request.id);
          break;
        case 'resources/list':
          handleResourcesList(request.params, request.id);
          break;
        default:
          sendResponse(request.id, null, { code: -32601, message: 'Method not found' });
      }
    } catch (err) {
      sendResponse(nextRequestId++, null, { code: -32700, message: err.message });
    }
  }
});

// Graceful termination
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
