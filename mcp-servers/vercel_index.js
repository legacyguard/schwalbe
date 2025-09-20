const fetch = require('node-fetch');

// Track request IDs
let nextRequestId = 0;

// Handle stdin
process.stdin.setEncoding('utf8');

// Constants
const VERCEL_API_ENDPOINT = 'https://api.vercel.com';

// JSON-RPC response helper
function sendResponse(id, result, error = null) {
  const response = {
    jsonrpc: '2.0',
    id: id
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
      name: "vercel-auth-server",
      version: "1.0.0"
    },
    capabilities: {
      auth: {
        methods: ["vercel"]
      }
    }
  });
}

// Handle shutdown request
function handleShutdown(params, id) {
  sendResponse(id, {});
  process.exit(0);
}

// Handle resources list request
function handleResourcesList(params, id) {
  sendResponse(id, {
    resources: []
  });
}

// Handle tools list request
function handleToolsList(params, id) {
  sendResponse(id, {
    tools: [
      {
        name: "vercel_auth",
        description: "Authenticate with Vercel using a token",
        inputSchema: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "Vercel API token"
            }
          },
          required: ["token"]
        }
      },
      {
        name: "vercel_user_info",
        description: "Get current Vercel user information",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  });
}

// Fetch user data from Vercel API
async function fetchVercelUser(token) {
  const response = await fetch(`${VERCEL_API_ENDPOINT}/v2/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid Vercel token');
    }
    throw new Error(`Vercel API error: ${response.statusText}`);
  }

  return response.json();
}

// Handle auth request
async function handleAuth(params, id) {
  try {
    if (!params.method || params.method !== 'vercel') {
      throw new Error('Unsupported auth method');
    }

    // Get token from environment variable or params
    const token = process.env.VERCEL_TOKEN || params.token;
    if (!token) {
      throw new Error('No authentication token provided');
    }

    try {
      const userData = await fetchVercelUser(token);
      sendResponse(id, {
        status: 'success',
        userId: userData.uid || userData.id,
        metadata: {
          email: userData.email,
          name: userData.name,
          username: userData.username
        }
      });
    } catch (error) {
      if (error.message.includes('Invalid Vercel token')) {
        sendResponse(id, null, {
          code: -32001,
          message: 'Invalid Vercel token'
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    sendResponse(id, null, {
      code: -32000,
      message: error.message
    });
  }
}

// Process JSON-RPC requests
let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  
  const messages = buffer.split('\n');
  buffer = messages.pop(); // Keep the last partial message

  for (const message of messages) {
    if (!message.trim()) continue;

    try {
      const request = JSON.parse(message);
      
      if (request.jsonrpc !== '2.0') {
        throw new Error('Invalid JSON-RPC version');
      }

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
        case 'tools/list':
          handleToolsList(request.params, request.id);
          break;
        default:
          sendResponse(request.id, null, {
            code: -32601,
            message: 'Method not found'
          });
      }
    } catch (error) {
      sendResponse(nextRequestId++, null, {
        code: -32700,
        message: error.message
      });
    }
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});