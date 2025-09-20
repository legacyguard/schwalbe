const fetch = require('node-fetch');

// Track request IDs
let nextRequestId = 0;

// Handle stdin
process.stdin.setEncoding('utf8');

// Constants
const LINEAR_API_ENDPOINT = 'https://api.linear.app/graphql';

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
      name: "linear-auth-server",
      version: "1.0.0"
    },
    capabilities: {
      auth: {
        methods: ["linear"]
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

// Verify Linear token by fetching viewer info
async function verifyLinearToken(token) {
  const query = `
    query {
      viewer {
        id
        name
        email
        displayName
        organization {
          id
          name
        }
      }
    }
  `;

  const response = await fetch(LINEAR_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error('Invalid Linear token');
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error('Invalid Linear token');
  }

  return data.data.viewer;
}

// Handle auth request
async function handleAuth(params, id) {
  try {
    if (!params.method || params.method !== 'linear') {
      throw new Error('Unsupported auth method');
    }

    const token = params.token;
    if (!token) {
      throw new Error('No authentication token provided');
    }

    try {
      const userData = await verifyLinearToken(token);
      sendResponse(id, {
        status: 'success',
        userId: userData.id,
        metadata: {
          name: userData.name,
          email: userData.email,
          displayName: userData.displayName,
          organization: {
            id: userData.organization.id,
            name: userData.organization.name
          }
        }
      });
    } catch (error) {
      if (error.message.includes('Invalid Linear token')) {
        sendResponse(id, null, {
          code: -32001,
          message: 'Invalid Linear token'
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
          sendResponse(request.id, {
            tools: [
              {
                name: "linear_auth",
                description: "Authenticate with Linear using an API key",
                inputSchema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                      description: "Linear API key"
                    }
                  },
                  required: ["token"]
                }
              },
              {
                name: "linear_user_info",
                description: "Get current Linear user information",
                inputSchema: {
                  type: "object",
                  properties: {}
                }
              }
            ]
          });
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