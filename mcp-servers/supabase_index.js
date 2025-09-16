const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');

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
      name: "supabase-auth-server",
      version: "1.0.0"
    },
    capabilities: {
      auth: {
        methods: ["supabase"]
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
    if (!params.method || params.method !== 'supabase') {
      throw new Error('Unsupported auth method');
    }

    const token = params.token;
    if (!token) {
      throw new Error('No authentication token provided');
    }

    // Create Supabase client with the provided token
    // Note: You'll need to replace SUPABASE_URL with your actual Supabase project URL
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      token
    );

    try {
      // Verify the token by getting the user
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      if (!user) {
        throw new Error('User not found');
      }

      sendResponse(id, {
        status: 'success',
        userId: user.id,
        metadata: {
          email: user.email,
          phone: user.phone,
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at,
          role: user.role
        }
      });
    } catch (error) {
      if (error.status === 401 || error.message.includes('invalid token')) {
        sendResponse(id, null, {
          code: -32001,
          message: 'Invalid Supabase token'
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

// Handle migrations push (uses supabase CLI under the hood)
function handleMigrationsPush(params, id) {
  try {
    const dbUrl = (params && params.dbUrl) || process.env.SUPABASE_DB_URL;
    const includeAll = params && params.includeAll ? '--include-all' : '';
    const base = dbUrl ? `supabase db push ${includeAll} --db-url "${dbUrl}"` : `supabase db push ${includeAll}`;
    const cmd = `yes | ${base}`;

    let attempts = 0;
    const maxAttempts = (params && params.maxAttempts) || 4;
    const delayMs = 3000;

    const run = () => {
      attempts++;
      exec(cmd, { env: { ...process.env } }, (err, stdout, stderr) => {
        if (err) {
          const out = (stdout || '') + '\n' + (stderr || '');
          const transient = /timeout|connect|refused|pooler/i.test(out) || /read: operation timed out/i.test(out);
          if (transient && attempts < maxAttempts) {
            setTimeout(run, delayMs);
            return;
          }
          sendResponse(id, null, {
            code: -32011,
            message: 'Migration push failed',
            data: { error: String(err), stdout, stderr }
          });
          return setTimeout(() => process.exit(1), 0);
        }
        sendResponse(id, { ok: true, stdout, stderr: stderr || '' });
        setTimeout(() => process.exit(0), 0);
      });
    };

    run();
  } catch (error) {
    sendResponse(id, null, { code: -32012, message: error.message });
    setTimeout(() => process.exit(1), 0);
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
      case 'migrations.push':
        handleMigrationsPush(request.params, request.id);
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