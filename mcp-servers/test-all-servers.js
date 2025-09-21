#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Test all MCP servers
const servers = [
  { name: 'GitHub', file: 'github_index.js', env: { GITHUB_TOKEN: 'sCQdHdoLVf8aAY50aDAa9dGm' } },
  { name: 'Vercel', file: 'vercel_index.js', env: { VERCEL_TOKEN: 'sCQdHdoLVf8aAY50aDAa9dGm' } },
  { name: 'Stripe', file: 'stripe_index.js', env: { STRIPE_SECRET_KEY: 'sk_test_51RxUMeFjl1oRWeU6boLX0xTnSSIzYdt9jcUQWUJx6FKsNX5uCqH55cqgjpYn0zayR5Y07T0XpePIM9N39CR7llo500XBtXellm' } },
  { name: 'Supabase', file: 'supabase_index.js', env: { 
    SUPABASE_URL: 'https://rnmqtqaegqpbpytqawpg.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubXF0cWFlZ3FwYnB5dHFhd3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1Mjk1NjMsImV4cCI6MjA3MzEwNTU2M30.53xGTvndBH9rJf0PI65xMEzKfc0myWpqOJrBxuip-bk',
    SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubXF0cWFlZ3FwYnB5dHFhd3BnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUyOTU2MywiZXhwIjoyMDczMTA1NTYzfQ.Zhy7dRNIqFWs1T4KgOgcUlvm0nanqKyxaXfAcezsmu4'
  }},
  { name: 'Clerk', file: 'clerk_index.js', env: { CLERK_SECRET_KEY: 'sk_test_ysXGp4FIZ7VoFMHS6IXeXSiS8yNjmPRjfyp6rFc5y1' } },
  { name: 'Linear', file: 'linear_index.js', env: { LINEAR_API_KEY: 'lin_api_2tDsVUlGO5vbbFxORSkvNzm6Sdxl2jYh1wxl4HYQ' } },
  { name: 'Resend', file: 'resend_index.js', env: { RESEND_API_KEY: 're_2FUyGxRt_FaigMrn98K7rTRetwZkNkL41' } }
];

async function testServer(server) {
  return new Promise((resolve) => {
    console.log(`Testing ${server.name} MCP Server...`);
    const child = spawn('node', [server.file], {
      cwd: __dirname,
      env: { ...process.env, ...server.env }
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      console.error(`${server.name} Server Error:`, data.toString());
    });

    // Send initialize request
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2024-11-05' }
    };

    child.stdin.write(JSON.stringify(initRequest) + '\n');

    setTimeout(() => {
      child.kill();
      const success = output.includes('"result"');
      console.log(`${server.name} Server: ${success ? '✅ PASS' : '❌ FAIL'}`);
      resolve(success);
    }, 1000);
  });
}

async function runAllTests() {
  console.log('🚀 Testing All MCP Servers for Cursor Configuration...\n');
  
  const results = [];
  for (const server of servers) {
    const result = await testServer(server);
    results.push({ name: server.name, success: result });
  }
  
  console.log('\n📊 Test Summary:');
  results.forEach(result => {
    console.log(`- ${result.name}: ${result.success ? '✅ Working' : '❌ Failed'}`);
  });
  
  const allPassed = results.every(r => r.success);
  if (allPassed) {
    console.log('\n🎉 All MCP servers are configured and working!');
    console.log('✅ Cursor MCP configuration is ready to use.');
  } else {
    console.log('\n⚠️  Some MCP servers may need attention.');
  }
}

runAllTests().catch(console.error);
