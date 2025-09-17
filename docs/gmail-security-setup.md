# Gmail API Security Configuration Guide

## Overview
This document provides guidance on securely configuring the Gmail API integration for LegacyGuard. The implementation follows security best practices by handling all sensitive operations server-side.

## Security Architecture

### Key Security Measures
1. **Server-side API Operations**: All Gmail API calls are performed on the server, not in the browser
2. **Secure Token Storage**: OAuth2 tokens are stored securely on the server, never exposed to clients
3. **Authentication via Clerk**: User authentication is verified through Clerk before any Gmail operations
4. **PKCE Implementation**: OAuth2 flow uses Proof Key for Code Exchange for enhanced security

## Google Cloud Console Configuration

### 1. Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "OAuth 2.0 Client ID"
4. Configure the OAuth consent screen:
   - Application name: LegacyGuard
   - Authorized domains: Your production domain
   - Scopes: 
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`

### 2. Set Redirect URIs
Configure **ONLY** these specific redirect URIs:
```
https://yourdomain.com/auth/gmail/callback
http://localhost:8080/auth/gmail/callback (development only)
```

### 3. API Restrictions
1. Navigate to "APIs & Services" > "Library"
2. Enable ONLY the Gmail API
3. Set quota limits to prevent abuse

## Environment Variables

### Server-side (Never expose to client)
```env
# Google OAuth2 Credentials (Server-only)
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/gmail/callback

# Clerk Authentication
CLERK_JWT_AUDIENCE=your-clerk-audience
CLERK_FRONTEND_API=your-clerk-frontend-api
CLERK_SECRET_KEY=your-clerk-secret

# Supabase (for token storage)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
```

### Client-side (Safe to expose)
```env
# Frontend URL for CORS
FRONTEND_URL=https://yourdomain.com
```

## Token Storage Implementation

### Database Schema
```sql
CREATE TABLE user_gmail_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add encryption at rest for token columns
ALTER TABLE user_gmail_tokens 
  ALTER COLUMN access_token TYPE bytea 
  USING encrypt(access_token::bytea, 'encryption-key'::bytea, 'aes');
```

### Secure Token Storage Function
```typescript
async function storeUserTokens(userId: string, tokens: OAuth2Tokens): Promise<void> {
  const encryptedTokens = await encryptTokens(tokens);
  
  await supabase
    .from('user_gmail_tokens')
    .upsert({
      user_id: userId,
      access_token: encryptedTokens.accessToken,
      refresh_token: encryptedTokens.refreshToken,
      expires_at: new Date(tokens.expiry_date),
      updated_at: new Date()
    });
}
```

## Security Checklist

### Before Deployment
- [ ] OAuth2 client ID is configured with restricted redirect URIs
- [ ] Client secret is ONLY stored server-side
- [ ] All sensitive environment variables are properly secured
- [ ] Database encryption is enabled for token storage
- [ ] HTTPS is enforced on all endpoints
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented on API endpoints
- [ ] Audit logging is enabled for all Gmail operations

### OAuth2 Security
- [ ] State parameter is used to prevent CSRF attacks
- [ ] PKCE is implemented for the OAuth flow
- [ ] Tokens are refreshed before expiration
- [ ] Refresh tokens are rotated on use
- [ ] Token revocation is implemented

### API Security
- [ ] All endpoints require authentication
- [ ] User permissions are verified before operations
- [ ] Input validation is implemented
- [ ] Error messages don't leak sensitive information
- [ ] Request/response payloads are sanitized

## Monitoring and Auditing

### Audit Log Implementation
```typescript
await supabase
  .from('audit_logs')
  .insert({
    user_id: userId,
    event_type: 'GMAIL_AUTH',
    description: 'User authorized Gmail access',
    ip_address: req.headers['x-forwarded-for'],
    user_agent: req.headers['user-agent'],
    created_at: new Date()
  });
```

### Metrics to Monitor
- Failed authentication attempts
- Unusual API usage patterns
- Token refresh failures
- Quota usage trends

## Incident Response

### If a Token is Compromised
1. Immediately revoke the token via Google API
2. Remove token from database
3. Notify the affected user
4. Review audit logs for unauthorized access
5. Implement additional security measures if needed

### If Client Credentials are Exposed
1. Immediately regenerate credentials in Google Cloud Console
2. Update server environment variables
3. Review all recent API usage
4. Notify security team and affected users
5. Implement secret rotation policy

## Best Practices

### Development
- Use separate OAuth clients for development/staging/production
- Never commit credentials to version control
- Use secret management tools (e.g., HashiCorp Vault)
- Regularly rotate credentials

### Production
- Implement automated token refresh
- Set up monitoring alerts for failed authentications
- Regular security audits
- Keep dependencies updated
- Document all security procedures

## Testing Security

### Security Test Cases
```typescript
describe('Gmail API Security', () => {
  it('should reject requests without authentication', async () => {
    const response = await fetch('/api/gmail?action=search');
    expect(response.status).toBe(401);
  });

  it('should validate state parameter in OAuth callback', async () => {
    const response = await fetch('/api/gmail?action=callback', {
      method: 'POST',
      body: JSON.stringify({ code: 'test', state: 'invalid' })
    });
    expect(response.status).toBe(403);
  });

  it('should rate limit API requests', async () => {
    // Make multiple rapid requests
    const responses = await Promise.all(
      Array(100).fill(0).map(() => 
        fetch('/api/gmail?action=search')
      )
    );
    const rateLimited = responses.some(r => r.status === 429);
    expect(rateLimited).toBe(true);
  });
});
```

## Support and Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## Contact
For security concerns or questions, contact the security team immediately.
