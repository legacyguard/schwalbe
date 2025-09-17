# Salt Rotation and Reindex Runbook

## Overview

This runbook describes the process for rotating encryption salts and reindexing affected data in the LegacyGuard system. Salt rotation is a critical security practice that should be performed regularly to maintain data security.

## Salt Types in LegacyGuard

### 1. Search Index Salt (`SEARCH_INDEX_SALT`)
- **Purpose**: HMAC-SHA256 hashing of search tokens for privacy-preserving full-text search
- **Location**: Environment variable, used in `packages/shared/src/search/hash.ts`
- **Impact**: All hashed search tokens in `hashed_tokens` table
- **Rotation Frequency**: Every 6 months or immediately after security incident

### 2. Bcrypt Salt (PostgreSQL `gen_salt('bf')`)
- **Purpose**: Password hashing for share link passwords
- **Location**: PostgreSQL pgcrypto extension
- **Impact**: All share link passwords in `share_links.password_hash`
- **Rotation Frequency**: Not rotated (each password gets unique salt)

## Pre-Rotation Checklist

- [ ] Confirm maintenance window (estimated 2-4 hours depending on data volume)
- [ ] Backup current `SEARCH_INDEX_SALT` value securely
- [ ] Verify all environments have backup procedures in place
- [ ] Ensure sufficient disk space for reindexing operations
- [ ] Notify team of planned maintenance
- [ ] Prepare rollback plan with previous salt value

## Search Index Salt Rotation Process

### Phase 1: Generate New Salt

1. **Generate new cryptographically secure salt:**
   ```bash
   # Generate 32-byte random salt in base64
   NEW_SALT=$(openssl rand -base64 32)
   echo "New SEARCH_INDEX_SALT: $NEW_SALT"
   ```

2. **Securely store the new salt:**
   - Update environment variables in all environments
   - Store in secure secret management system
   - Document rotation date and reason

### Phase 2: Database Preparation

1. **Create backup of search index:**
   ```sql
   -- Create backup table
   CREATE TABLE hashed_tokens_backup_YYYYMMDD AS
   SELECT * FROM hashed_tokens;
   
   -- Verify backup
   SELECT COUNT(*) FROM hashed_tokens_backup_YYYYMMDD;
   SELECT COUNT(*) FROM hashed_tokens;
   ```

2. **Estimate reindexing time:**
   ```sql
   -- Check documents with searchable content
   SELECT COUNT(*) as total_docs,
          COUNT(CASE WHEN ocr_text IS NOT NULL THEN 1 END) as searchable_docs,
          AVG(LENGTH(ocr_text)) as avg_text_length
   FROM documents;
   ```

### Phase 3: Salt Rotation

1. **Update environment variables:**
   ```bash
   # Production environment
   export SEARCH_INDEX_SALT="$NEW_SALT"
   
   # Verify environment update
   echo "Current salt (first 8 chars): ${SEARCH_INDEX_SALT:0:8}..."
   ```

2. **Restart services to pick up new salt:**
   ```bash
   # Restart web services
   systemctl restart legacyguard-web
   
   # Restart edge functions (if applicable)
   supabase functions deploy
   ```

### Phase 4: Reindexing

1. **Run the reindex script:**
   ```bash
   # Navigate to project root
   cd /path/to/schwalbe
   
   # Run reindex with new salt
   npm run reindex:search
   # OR run the script directly:
   npx ts-node scripts/reindex-hashed-search.ts
   ```

2. **Monitor reindexing progress:**
   ```sql
   -- Check progress during reindexing
   SELECT 
     COUNT(*) as current_tokens,
     COUNT(DISTINCT doc_id) as indexed_docs,
     MAX(created_at) as latest_index_time
   FROM hashed_tokens;
   
   -- Compare with documents
   SELECT COUNT(*) as total_searchable_docs
   FROM documents 
   WHERE ocr_text IS NOT NULL;
   ```

### Phase 5: Verification

1. **Test search functionality:**
   ```bash
   # Test search with known terms
   curl -X POST "$SUPABASE_URL/rest/v1/rpc/search_documents" \
     -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -d '{"query": "test search term"}'
   ```

2. **Verify index integrity:**
   ```sql
   -- Check for any orphaned or missing indexes
   SELECT 
     d.id as doc_id,
     CASE WHEN ht.doc_id IS NULL THEN 'MISSING_INDEX' ELSE 'INDEXED' END as status
   FROM documents d
   LEFT JOIN (SELECT DISTINCT doc_id FROM hashed_tokens) ht ON d.id = ht.doc_id
   WHERE d.ocr_text IS NOT NULL
   ORDER BY status, d.id;
   ```

## Rollback Procedure

If issues arise during rotation:

1. **Immediate rollback:**
   ```bash
   # Restore previous salt
   export SEARCH_INDEX_SALT="$PREVIOUS_SALT"
   
   # Restart services
   systemctl restart legacyguard-web
   ```

2. **Restore search index:**
   ```sql
   -- Clear current (potentially corrupted) index
   DELETE FROM hashed_tokens;
   
   -- Restore from backup
   INSERT INTO hashed_tokens 
   SELECT * FROM hashed_tokens_backup_YYYYMMDD;
   
   -- Verify restoration
   SELECT COUNT(*) FROM hashed_tokens;
   ```

## Post-Rotation Tasks

1. **Cleanup backup data:**
   ```sql
   -- After 7 days of successful operation
   DROP TABLE IF EXISTS hashed_tokens_backup_YYYYMMDD;
   ```

2. **Update documentation:**
   - Record rotation date and new salt reference
   - Update disaster recovery procedures
   - Note any performance impacts observed

3. **Security audit:**
   - Verify old salt is securely disposed
   - Confirm new salt is properly secured
   - Review access logs during rotation

## Emergency Salt Rotation

In case of suspected salt compromise:

1. **Immediate actions:**
   - Generate new salt immediately
   - Rotate salt across all environments
   - Clear all search indexes
   - Re-index all searchable content

2. **Investigation:**
   - Review access logs for unauthorized access
   - Check for data exfiltration attempts
   - Audit search queries for suspicious patterns

## Automation Script

Create automated salt rotation script at `scripts/rotate-search-salt.sh`:

```bash
#!/bin/bash
set -euo pipefail

# Salt rotation automation script
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
NEW_SALT=$(openssl rand -base64 32)

echo "Starting salt rotation at $(date)"
echo "Backup date: $BACKUP_DATE"

# 1. Backup current index
psql "$DATABASE_URL" -c "CREATE TABLE hashed_tokens_backup_$BACKUP_DATE AS SELECT * FROM hashed_tokens;"

# 2. Update environment (requires manual confirmation)
echo "New salt generated. Update SEARCH_INDEX_SALT environment variable:"
echo "$NEW_SALT"
read -p "Press enter after updating environment variables..."

# 3. Reindex
echo "Starting reindex..."
npm run reindex:search

# 4. Verify
echo "Verifying index integrity..."
INDEXED_DOCS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(DISTINCT doc_id) FROM hashed_tokens;")
TOTAL_DOCS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM documents WHERE ocr_text IS NOT NULL;")

echo "Indexed documents: $INDEXED_DOCS"
echo "Total searchable documents: $TOTAL_DOCS"

if [ "$INDEXED_DOCS" -eq "$TOTAL_DOCS" ]; then
    echo "✅ Salt rotation completed successfully"
else
    echo "❌ Index verification failed. Check logs and consider rollback."
    exit 1
fi
```

## Monitoring and Alerts

Set up monitoring for:
- Search index size and consistency
- Search performance degradation
- Failed search operations
- Reindexing job failures

## Security Considerations

1. **Salt Storage**: Never log or expose salt values in plaintext
2. **Access Control**: Limit salt rotation access to senior engineers only
3. **Audit Trail**: Log all salt rotation activities
4. **Backup Security**: Encrypt and secure all backup files
5. **Communication**: Use secure channels for salt distribution

## Schedule

- **Regular Rotation**: Every 6 months (January 1st and July 1st)
- **Emergency Rotation**: Immediately upon security incident
- **Testing**: Quarterly rotation drills in staging environment

---

**Last Updated**: $(date)
**Next Scheduled Rotation**: [SET_DATE]
**Rotation Owner**: Infrastructure Team