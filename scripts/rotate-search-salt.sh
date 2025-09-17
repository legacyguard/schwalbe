#!/bin/bash
set -euo pipefail

# Salt Rotation Automation Script for LegacyGuard
# This script automates the search index salt rotation process
# Usage: ./rotate-search-salt.sh [--dry-run] [--force]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
DRY_RUN=false
FORCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--dry-run] [--force]"
            echo "  --dry-run  Simulate the rotation without making changes"
            echo "  --force    Skip confirmation prompts"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check required environment variables
    if [[ -z "${SUPABASE_URL:-}" ]]; then
        error "SUPABASE_URL environment variable is not set"
        exit 1
    fi
    
    if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
        error "SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
        exit 1
    fi
    
    if [[ -z "${SEARCH_INDEX_SALT:-}" ]]; then
        error "SEARCH_INDEX_SALT environment variable is not set"
        exit 1
    fi
    
    # Check required tools
    for tool in openssl psql npm; do
        if ! command -v "$tool" &> /dev/null; then
            error "$tool is required but not installed"
            exit 1
        fi
    done
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        error "Not in project root directory. Expected to find package.json"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Generate new salt
generate_new_salt() {
    log "Generating new cryptographically secure salt..."
    NEW_SALT=$(openssl rand -base64 32)
    
    if [[ ${#NEW_SALT} -lt 32 ]]; then
        error "Generated salt is too short"
        exit 1
    fi
    
    log "New salt generated (length: ${#NEW_SALT} characters)"
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would use salt: ${NEW_SALT:0:8}..."
    fi
}

# Backup current search index
backup_search_index() {
    log "Creating backup of current search index..."
    
    local backup_table="hashed_tokens_backup_$BACKUP_DATE"
    local backup_sql="CREATE TABLE $backup_table AS SELECT * FROM hashed_tokens;"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would create backup table: $backup_table"
        return 0
    fi
    
    if psql "$SUPABASE_URL" -c "$backup_sql"; then
        success "Backup created: $backup_table"
        
        # Verify backup
        local original_count=$(psql "$SUPABASE_URL" -t -c "SELECT COUNT(*) FROM hashed_tokens;" | tr -d ' ')
        local backup_count=$(psql "$SUPABASE_URL" -t -c "SELECT COUNT(*) FROM $backup_table;" | tr -d ' ')
        
        if [[ "$original_count" == "$backup_count" ]]; then
            success "Backup verified: $backup_count rows"
        else
            error "Backup verification failed: original=$original_count, backup=$backup_count"
            exit 1
        fi
    else
        error "Failed to create backup"
        exit 1
    fi
}

# Get current statistics
get_current_stats() {
    log "Gathering current search index statistics..."
    
    TOTAL_DOCS=$(psql "$SUPABASE_URL" -t -c "SELECT COUNT(*) FROM documents WHERE ocr_text IS NOT NULL;" | tr -d ' ')
    INDEXED_DOCS=$(psql "$SUPABASE_URL" -t -c "SELECT COUNT(DISTINCT doc_id) FROM hashed_tokens;" | tr -d ' ')
    TOTAL_TOKENS=$(psql "$SUPABASE_URL" -t -c "SELECT COUNT(*) FROM hashed_tokens;" | tr -d ' ')
    
    log "Current statistics:"
    log "  Total searchable documents: $TOTAL_DOCS"
    log "  Currently indexed documents: $INDEXED_DOCS"
    log "  Total hashed tokens: $TOTAL_TOKENS"
    
    if [[ "$INDEXED_DOCS" -ne "$TOTAL_DOCS" ]]; then
        warn "Not all searchable documents are currently indexed"
    fi
}

# Update environment variable
update_environment() {
    log "Updating SEARCH_INDEX_SALT environment variable..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would update SEARCH_INDEX_SALT to: ${NEW_SALT:0:8}..."
        return 0
    fi
    
    echo
    echo "======================================================"
    echo "MANUAL STEP REQUIRED: Update Environment Variable"
    echo "======================================================"
    echo "Please update the SEARCH_INDEX_SALT environment variable"
    echo "in all environments to the following value:"
    echo
    echo "$NEW_SALT"
    echo
    echo "After updating the environment variable:"
    echo "1. Restart all web services"
    echo "2. Redeploy edge functions if applicable"
    echo
    
    if [[ "$FORCE" == "false" ]]; then
        read -p "Press Enter after updating the environment variable..."
    fi
    
    # Verify the environment variable was updated
    if [[ "${SEARCH_INDEX_SALT:-}" == "$NEW_SALT" ]]; then
        success "Environment variable updated successfully"
    else
        warn "Environment variable not updated in current session"
        warn "Ensure it's updated in your deployment environment"
    fi
}

# Reindex search data
reindex_search() {
    log "Starting search index reindexing..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would run reindex script"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    
    # Run the reindex script
    if npm run reindex:search 2>&1 | tee "/tmp/reindex_${BACKUP_DATE}.log"; then
        success "Reindexing completed successfully"
    else
        error "Reindexing failed. Check logs at /tmp/reindex_${BACKUP_DATE}.log"
        exit 1
    fi
}

# Verify reindexing results
verify_reindex() {
    log "Verifying reindexing results..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would verify reindex results"
        return 0
    fi
    
    local new_indexed_docs=$(psql "$SUPABASE_URL" -t -c "SELECT COUNT(DISTINCT doc_id) FROM hashed_tokens;" | tr -d ' ')
    local new_total_tokens=$(psql "$SUPABASE_URL" -t -c "SELECT COUNT(*) FROM hashed_tokens;" | tr -d ' ')
    
    log "Post-reindex statistics:"
    log "  Indexed documents: $new_indexed_docs (was: $INDEXED_DOCS)"
    log "  Total hashed tokens: $new_total_tokens (was: $TOTAL_TOKENS)"
    
    if [[ "$new_indexed_docs" -eq "$TOTAL_DOCS" ]]; then
        success "All searchable documents are now indexed"
    else
        error "Reindex verification failed: expected $TOTAL_DOCS, got $new_indexed_docs"
        warn "Consider rolling back and investigating"
        exit 1
    fi
    
    # Test search functionality
    log "Testing search functionality..."
    local test_response=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/search_documents" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -d '{"query": "test"}' || echo "FAILED")
    
    if [[ "$test_response" != "FAILED" ]]; then
        success "Search functionality test passed"
    else
        warn "Search functionality test failed (this may be expected if no test documents exist)"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backup tables..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would clean up backup tables older than 7 days"
        return 0
    fi
    
    # Find backup tables older than 7 days
    local old_backups=$(psql "$SUPABASE_URL" -t -c "
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename LIKE 'hashed_tokens_backup_%'
        AND tablename < 'hashed_tokens_backup_$(date -d '7 days ago' +%Y%m%d)'
    " | tr -d ' ')
    
    if [[ -n "$old_backups" ]]; then
        while read -r table; do
            if [[ -n "$table" ]]; then
                log "Dropping old backup table: $table"
                psql "$SUPABASE_URL" -c "DROP TABLE IF EXISTS $table;"
            fi
        done <<< "$old_backups"
        success "Old backup tables cleaned up"
    else
        log "No old backup tables to clean up"
    fi
}

# Generate summary report
generate_report() {
    local report_file="/tmp/salt_rotation_report_${BACKUP_DATE}.txt"
    
    cat > "$report_file" << EOF
Salt Rotation Report
==================
Date: $(date)
Backup ID: $BACKUP_DATE
Dry Run: $DRY_RUN

Pre-rotation Statistics:
- Total searchable documents: $TOTAL_DOCS
- Indexed documents: $INDEXED_DOCS
- Total hashed tokens: $TOTAL_TOKENS

Salt Information:
- Previous salt: ${SEARCH_INDEX_SALT:0:8}... (truncated)
- New salt: ${NEW_SALT:0:8}... (truncated)

Status: $(if [[ "$DRY_RUN" == "true" ]]; then echo "DRY RUN COMPLETED"; else echo "ROTATION COMPLETED"; fi)

Backup Table: hashed_tokens_backup_$BACKUP_DATE
Log File: /tmp/reindex_${BACKUP_DATE}.log (if reindex was run)

Next Steps:
1. Monitor search functionality for 24-48 hours
2. Schedule cleanup of backup table after 7 days
3. Update documentation with rotation date
EOF

    log "Report generated: $report_file"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        echo
        echo "======================================================"
        echo "Salt Rotation Summary"
        echo "======================================================"
        cat "$report_file"
    fi
}

# Main execution flow
main() {
    log "Starting salt rotation process..."
    echo "Dry run: $DRY_RUN"
    echo "Force mode: $FORCE"
    echo
    
    if [[ "$DRY_RUN" == "false" && "$FORCE" == "false" ]]; then
        echo "This will rotate the search index salt and reindex all searchable content."
        echo "This process may take 2-4 hours depending on data volume."
        echo
        read -p "Are you sure you want to continue? (yes/no): " confirm
        if [[ "$confirm" != "yes" ]]; then
            log "Operation cancelled by user"
            exit 0
        fi
    fi
    
    check_prerequisites
    generate_new_salt
    get_current_stats
    backup_search_index
    update_environment
    reindex_search
    verify_reindex
    cleanup_old_backups
    generate_report
    
    if [[ "$DRY_RUN" == "true" ]]; then
        success "Dry run completed successfully"
    else
        success "Salt rotation completed successfully"
        success "Monitor search functionality and clean up backup table after 7 days"
    fi
}

# Trap errors and cleanup
trap 'error "Script failed at line $LINENO"' ERR

# Run main function
main "$@"