// Deprecated: Clerk server entry; kept for reference. Use supabase_index.js instead.

// Initialize Clerk middleware
const clerk = ClerkExpressRequireAuth({
  secretKey: process.env.CLERK_SECRET_KEY
});

// Handle stdin
process.stdin.setEncoding('utf8');

// Track request IDs
let nextRequestId = 0;

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
      name: "clerk-auth-server",
      version: "1.0.0"
    },
    capabilities: {
      auth: {
        methods: ["clerk"]
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
    if (!params.method || params.method !== 'clerk') {
      throw new Error('Unsupported auth method');
    }

    const token = params.token;
    if (!token) {
      throw new Error('No authentication token provided');
    }

    // Here we would validate the token with Clerk
    // For now, just return a success response
    sendResponse(id, {
      status: 'success',
      userId: 'example-user-id',
      metadata: {
        sessionId: 'example-session-id'
      }
    });
  } catch (error) {
    sendResponse(id, null, {
      code: -32000,
      message: error.message
    });
  }
}

// Process incoming JSON-RPC requests
process.stdin.on('data', async (chunk) => {
  try {
    const request = JSON.parse(chunk);
    
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
});

// Handle process termination
process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});
