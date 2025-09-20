
// Track request IDs
let nextRequestId = 0;

// Handle stdin
process.stdin.setEncoding('utf8');

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

  console.log(JSON.stringify(response));
}

// Handle initialize request
function handleInitialize(params, id) {
  // Store the protocol version for future use
  const protocolVersion = params.protocolVersion;
  
  // Send proper initialization response
  sendResponse(id, {
    protocolVersion: protocolVersion,
    serverInfo: {
      name: "github-auth-server",
      version: "1.0.0"
    },
    capabilities: {
      auth: {
        methods: ["github"]
      }
    }
  });
}

// Handle shutdown request
function handleShutdown(params, id) {
  sendResponse(id, {});
  process.exit(0);
}

// Handle auth request
async function handleAuth(params, id) {
  try {
    if (!params.method || params.method !== 'github') {
      throw new Error('Unsupported auth method');
    }

    // Get token from environment variable or params
    const token = process.env.GITHUB_TOKEN || params.token;
    if (!token) {
      throw new Error('No authentication token provided');
    }

    const { Octokit } = await import('@octokit/rest');

    // Create an Octokit instance with the token
    const octokit = new Octokit({
      auth: token
    });

    try {
      // Verify the token by getting the authenticated user
      const { data: user } = await octokit.users.getAuthenticated();

      sendResponse(id, {
        status: 'success',
        userId: user.id.toString(),
        metadata: {
          login: user.login,
          name: user.name || user.login,
          avatarUrl: user.avatar_url
        }
      });
    } catch (error) {
      if (error.status === 401) {
        sendResponse(id, null, {
          code: -32001,
          message: 'Invalid GitHub token'
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

// Buffer for incomplete JSON data
let buffer = '';

// Process incoming JSON-RPC requests
process.stdin.on('data', async (chunk) => {
  try {
    buffer += chunk;
    let request;
    try {
      request = JSON.parse(buffer);
      // Reset buffer after successful parse
      buffer = '';
    } catch (parseError) {
      // If it's a syntax error, the chunk might be incomplete
      // Keep it in buffer and wait for more data
      return;
    }
    
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
        // Return empty resources list
        sendResponse(request.id, { resources: [] });
        break;
      case 'tools/list':
        // Return available tools
        sendResponse(request.id, {
          tools: [
            {
              name: "github_auth",
              description: "Authenticate with GitHub using a token",
              inputSchema: {
                type: "object",
                properties: {
                  token: {
                    type: "string",
                    description: "GitHub personal access token"
                  }
                },
                required: ["token"]
              }
            },
            {
              name: "github_user_info",
              description: "Get current GitHub user information",
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
    if (error instanceof SyntaxError) {
      // If it's a syntax error, the chunk might be incomplete
      // Keep it in buffer and wait for more data
      return;
    }
    // For other errors, send error response and clear buffer
    buffer = '';
    sendResponse(nextRequestId++, null, {
      code: -32700,
      message: error.message
    });
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});