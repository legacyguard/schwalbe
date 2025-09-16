#!/usr/bin/env node
/*
Small test harness to send a single transactional email via the Supabase Edge Function
"send-email". This is for verifying SPF/DKIM/DMARC headers on the received message.

Environment variables (no secrets are printed):
- FUNCTIONS_URL: Base URL for Supabase Functions, e.g. https://<ref>.functions.supabase.co
- AUTH_TOKEN: Bearer token added to Authorization header (e.g., a service role key or any token
  acceptable by your function in staging). Do not commit/paste secrets in plain text.
- TEST_TO: recipient email to send the test to (your inbox)
- TEST_FROM: optional from, defaults to "Document Safe <noreply@documentsafe.app>"
*/

import assert from 'node:assert'

const FUNCTIONS_URL = process.env.FUNCTIONS_URL
const AUTH_TOKEN = process.env.AUTH_TOKEN
const TEST_TO = process.env.TEST_TO
const TEST_FROM = process.env.TEST_FROM || 'Document Safe <noreply@documentsafe.app>'

try {
  assert(FUNCTIONS_URL && AUTH_TOKEN && TEST_TO, 'Missing env: FUNCTIONS_URL, AUTH_TOKEN, TEST_TO are required')
} catch (e) {
  console.error(String(e))
  process.exit(1)
}

const endpoint = `${FUNCTIONS_URL.replace(/\/$/, '')}/send-email`

const html = `<!doctype html><html><body>
  <h1>Schwalbe Email Auth Test</h1>
  <p>If you can read this, the function worked. Please check the raw message headers for Authentication-Results and confirm SPF, DKIM, and DMARC show pass.</p>
</body></html>`

const payload = {
  from: TEST_FROM,
  to: TEST_TO,
  subject: 'Schwalbe: Email Auth Test (SPF/DKIM/DMARC)',
  html,
  text: 'Schwalbe Email Auth Test. Check Authentication-Results headers for SPF, DKIM, and DMARC.'
}

const res = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})

const body = await res.text()
if (!res.ok) {
  console.error('Failed:', res.status, body)
  process.exit(2)
}
console.log('Success:', body)
