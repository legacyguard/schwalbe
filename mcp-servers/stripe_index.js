const stripe = require('stripe');

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

  process.stdout.write(JSON.stringify(response) + '\n');
}

// Handle initialize request
function handleInitialize(params, id) {
  sendResponse(id, {
    protocolVersion: params.protocolVersion,
    serverInfo: {
      name: "stripe-auth-server",
      version: "1.0.0"
    },
    capabilities: {
      auth: {
        methods: ["stripe"]
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

// Verify Stripe token by fetching account info
async function verifyStripeToken(token) {
  try {
    const stripeClient = stripe(token);
    
    // Fetch account information
    const account = await stripeClient.account.retrieve();
    
    // Fetch additional business profile if available
    let businessProfile = null;
    if (account.business_profile) {
      businessProfile = {
        name: account.business_profile.name,
        url: account.business_profile.url,
        support_email: account.business_profile.support_email,
        support_phone: account.business_profile.support_phone
      };
    }

    // Get account capabilities
    const capabilities = Object.entries(account.capabilities || {})
      .filter(([_, value]) => value === 'active')
      .map(([key, _]) => key);

    return {
      id: account.id,
      email: account.email,
      business_type: account.business_type,
      country: account.country,
      currency: account.default_currency,
      capabilities,
      businessProfile,
      details_submitted: account.details_submitted,
      payouts_enabled: account.payouts_enabled,
      charges_enabled: account.charges_enabled
    };
  } catch (error) {
    if (error.type === 'StripeAuthenticationError') {
      throw new Error('Invalid Stripe token');
    }
    throw error;
  }
}

// Handle auth request
async function handleAuth(params, id) {
  try {
    if (!params.method || params.method !== 'stripe') {
      throw new Error('Unsupported auth method');
    }

    const token = params.token;
    if (!token) {
      throw new Error('No authentication token provided');
    }

    try {
      const accountData = await verifyStripeToken(token);
      sendResponse(id, {
        status: 'success',
        userId: accountData.id,
        metadata: {
          email: accountData.email,
          business_type: accountData.business_type,
          country: accountData.country,
          currency: accountData.currency,
          capabilities: accountData.capabilities,
          business_profile: accountData.businessProfile,
          account_status: {
            details_submitted: accountData.details_submitted,
            payouts_enabled: accountData.payouts_enabled,
            charges_enabled: accountData.charges_enabled
          }
        }
      });
    } catch (error) {
      if (error.message.includes('Invalid Stripe token')) {
        sendResponse(id, null, {
          code: -32001,
          message: 'Invalid Stripe token'
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