# 🚀 Supabase CLI Setup & Usage Guide

## 📋 Overview

This guide covers how to use Supabase CLI with your LegacyGuard project. The CLI provides powerful tools for local development, database management, and deployment.

## 🛠️ Prerequisites

- ✅ Supabase CLI v2.34.3+ (already installed)
- ✅ Supabase account (already configured)
- ✅ Project access token (already set up)

## 🔧 Configuration

### Environment Variables

Your `.env.local` file contains:

```bash
VITE_SUPABASE_URL=https://lonkpeipxwhhiukqboo.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ACCESS_TOKEN=your_access_token
```

### Project Configuration

- **Project ID**: `lonkpeipxwhhiukqboo`
- **Local Ports**:
  - API: 54321
  - Studio: 54323
  - Database: 54322
  - Functions: 54324

## 🚀 Getting Started

### 1. Start Local Development

```bash
# Start all Supabase services locally
supabase start

# This will start:
# - PostgreSQL database
# - Supabase API
# - Supabase Studio (dashboard)
# - Edge Functions
# - Storage
# - Realtime
```

### 2. Stop Local Services

```bash
# Stop all local services
supabase stop

# Stop and reset data
supabase stop --reset
```

### 3. View Status

```bash
# Check service status
supabase status

# View logs
supabase logs
```

## 🗄️ Database Management

### 1. Apply Migrations

```bash
# Apply all pending migrations
supabase db reset

# Apply specific migration
supabase db push

# Generate migration from schema changes
supabase db diff --schema public
```

### 2. Seed Data

```bash
# Apply seed data
supabase db reset --seed

# Or manually run seed
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/seed.sql
```

### 3. Database Access

```bash
# Connect to local database
supabase db connect

# Or use psql directly
psql -h localhost -p 54322 -U postgres -d postgres
```

## 🔧 Edge Functions

### 1. Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy legacy-guard-auth
supabase functions deploy legacy-guard-api
```

### 2. Test Functions Locally

```bash
# Start functions locally
supabase functions serve

# Test specific function
curl -X POST http://localhost:54324/functions/v1/legacy-guard-auth \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "get_user_profile"}'
```

### 3. Function Logs

```bash
# View function logs
supabase functions logs

# Follow logs in real-time
supabase functions logs --follow
```

## 🌐 Remote Project Management

### 1. Link to Remote Project

```bash
# Link to your Supabase project
supabase link --project-ref lonkpeipxwhhiukqboo
```

### 2. Pull Remote Schema

```bash
# Pull latest schema from remote
supabase db pull

# Pull specific schema
supabase db pull --schema public
```

### 3. Push Local Changes

```bash
# Push local schema to remote
supabase db push

# Push with confirmation
supabase db push --dry-run
```

## 📊 Supabase Studio

### Access Local Studio

- **URL**: <http://localhost:54323>
- **Access**: The local Studio opens automatically without authentication when running locally

> ℹ️ **Note**: Local Studio doesn't require authentication for development convenience.
>
### Access Remote Studio

- **URL**: <https://supabase.com/dashboard/project/lonkpeipxwhhiukqboo>
- **Login**: Use your Supabase account

## 🔐 Authentication & Security

### 1. User Management

```bash
# Create test user
supabase auth signup --email test@example.com --password password123

# List users
supabase auth list
```

### 2. Row Level Security (RLS)

- All tables have RLS enabled
- Policies ensure users can only access their own data
- Service role bypasses RLS for admin operations

### 3. Environment Security

- `.env.local` is in `.gitignore`
- Pre-commit hooks prevent accidental commits
- Service role key never exposed to client

## 📁 Project Structure

```text
supabase/
├── config.toml          # CLI configuration
├── migrations/          # Database migrations
│   ├── 20250123000000_create_profiles_table.sql
│   └── 20250123000001_create_legacy_items_table.sql
├── functions/           # Edge Functions
│   ├── legacy-guard-auth/
│   ├── legacy-guard-api/
│   └── import_map.json
├── seed.sql            # Sample data
└── README.md           # Project documentation
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Conflicts

```bash
# Check what's using the ports
lsof -i :54321
lsof -i :54322
lsof -i :54323

# Kill processes if needed
kill -9 <PID>
```

#### 2. Database Connection Issues

```bash
# Reset local database
supabase stop --reset
supabase start

# Check database status
supabase status
```

#### 3. Function Deployment Issues

```bash
# Check function logs
supabase functions logs

# Redeploy functions
supabase functions deploy --no-verify-jwt
```

#### 4. Migration Issues

```bash
# Reset database and reapply migrations
supabase db reset

# Check migration status
supabase migration list
```

### Reset Everything

```bash
# Complete reset (⚠️ WARNING: This deletes all local data)
supabase stop --reset
supabase start
supabase db reset --seed
```

## 📚 Useful Commands Reference

### Development

```bash
supabase start          # Start local services
supabase stop           # Stop local services
supabase status         # Check service status
supabase logs           # View service logs
```

### Database

```bash
supabase db reset       # Reset and seed database
supabase db push        # Push local schema to remote
supabase db pull        # Pull remote schema to local
supabase db diff        # Show schema differences
supabase db connect     # Connect to local database
```

### Functions

```bash
supabase functions deploy    # Deploy all functions
supabase functions serve     # Serve functions locally
supabase functions logs      # View function logs
```

### Authentication

```bash
supabase auth signup         # Create test user
supabase auth list           # List users
supabase auth signin         # Sign in user
```

### Project Management

```bash
supabase link                # Link to remote project
supabase projects list       # List your projects
supabase projects create     # Create new project
```

## 🔄 Workflow Examples

### Daily Development Workflow

```bash
# 1. Start services
supabase start

# 2. Make changes to schema/migrations
# 3. Test locally
# 4. Generate migration
supabase db diff --schema public

# 5. Apply migration
supabase db push

# 6. Test functions
supabase functions serve

# 7. Stop services when done
supabase stop
```

### Deployment Workflow

```bash
# 1. Link to remote project
supabase link --project-ref lonkpeipxwhhiukqboo

# 2. Push local changes
supabase db push

# 3. Deploy functions
supabase functions deploy

# 4. Verify deployment
# Check Supabase dashboard
```

## 📖 Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Database Migrations](https://supabase.com/docs/guides/database/migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Getting Help

If you encounter issues:

1. **Check logs**: `supabase logs`
2. **Verify status**: `supabase status`
3. **Reset if needed**: `supabase stop --reset && supabase start`
4. **Check documentation**: [Supabase Docs](https://supabase.com/docs)
5. **Community support**: [Supabase Discord](https://discord.supabase.com)

---

## 🚀 Happy coding with Supabase CLI
