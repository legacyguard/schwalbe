# Backup & Restore Guide

## Overview

The LegacyGuard application includes comprehensive backup and restore functionality to protect your data and allow you to migrate between devices or recover from data loss.

## Features

### Data Export

- **Complete Data Export**: Export all your data including:
  - Documents metadata
  - Personal information (assets, people, wills)
  - User preferences and settings
  - Guardian information
  - Task progress
  - Onboarding responses

- **Data Integrity**: Each backup includes a checksum to verify data integrity
- **Version Control**: Backups include version information for compatibility checks
- **Secure Format**: Data is exported as a JSON file with structured format

### Data Import

- **Smart Merge**: Import process intelligently merges data to avoid duplicates
- **Validation**: Comprehensive validation ensures backup file integrity
- **Version Compatibility**: Checks backup version compatibility before import
- **Conflict Resolution**: Handles existing data gracefully

### Security Features

- **Local Processing**: All backup/restore operations happen locally
- **User Verification**: Confirms user identity before sensitive operations
- **Data Validation**: Checksums ensure data hasn't been tampered with
- **Clear Warnings**: Clear warnings for destructive operations

## Usage

### Accessing Backup & Restore

1. Navigate to **Settings** from the sidebar
2. Scroll down to the **Backup & Restore** section

### Creating a Backup

1. Click the **Export Data** button
2. Your browser will download a file named `legacyguard-backup-YYYY-MM-DD.json`
3. Store this file securely (e.g., cloud storage, external drive)

### Restoring from Backup

1. Click **Choose Backup File**
2. Select your previously exported `.json` backup file
3. The system will validate the file and import your data
4. Page will refresh after successful import

### Clearing Data

⚠️ **Warning**: This is a destructive operation!

1. Click **Clear All Data** in the Danger Zone
2. Confirm the operation twice
3. All local data will be permanently deleted

## Best Practices

### Regular Backups

- Create backups before major changes
- Export data weekly or monthly
- Keep multiple backup versions

### Secure Storage

- Store backups in secure locations
- Never share backup files publicly
- Consider encrypting backup files separately
- Use cloud storage with 2FA enabled

### Version Management

- Label backups with dates
- Keep recent 3-5 backup versions
- Delete very old backups securely

## Technical Details

### Backup File Structure

```json
{
  "version": "1.0.0",
  "exportDate": "2024-01-15T10:30:00Z",
  "userId": "user_abc123",
  "userData": {
    "profile": {},
    "preferences": {}
  },
  "localStorage": {
    "documents": [],
    "assets": [],
    "people": [],
    "wills": [],
    "guardians": [],
    "settings": {}
  },
  "supabase": {
    "documents": [],
    "guardians": [],
    "onboardingResponses": []
  },
  "metadata": {
    "appVersion": "1.0.0",
    "exportedFrom": "app.legacyguard.com",
    "checksum": "abc123def456"
  }
}
```

### Data Sources

The backup service collects data from:

1. **LocalStorage**: User preferences, cached data, task progress
2. **Supabase Database**: Documents, guardians, onboarding responses
3. **Clerk Metadata**: User profile information (future enhancement)

### Import Process

1. **File Validation**: Checks file format and structure
2. **Checksum Verification**: Ensures data integrity
3. **Version Check**: Confirms compatibility
4. **User Confirmation**: Warns if importing from different user
5. **Data Merge**: Intelligently merges without duplicates
6. **Page Refresh**: Reloads to show updated data

## Troubleshooting

### Export Issues

**Problem**: Export button doesn't work

- **Solution**: Ensure you're logged in and have a stable connection

**Problem**: Backup file is empty or corrupted

- **Solution**: Try exporting again, check browser console for errors

### Import Issues

**Problem**: "Invalid backup file format" error

- **Solution**: Ensure you're selecting a valid `.json` backup file

**Problem**: "Backup file appears to be corrupted" error

- **Solution**: The file may have been modified. Try an older backup

**Problem**: Data doesn't appear after import

- **Solution**: Refresh the page manually. Check if data was partially imported

### General Issues

**Problem**: Backup file is too large

- **Solution**: Maximum file size is 10MB. Contact support if legitimate backup exceeds this

**Problem**: Some data is missing from backup

- **Solution**: Ensure all data was saved before creating backup

## Security Considerations

### What's Included

- Document metadata (not actual files)
- Personal information and preferences
- Application settings
- Task progress and states

### What's NOT Included

- Actual document files (stored separately in Supabase)
- Authentication credentials
- Payment information
- Encrypted file contents

### Privacy Notes

- Backups contain sensitive personal information
- Never upload backups to public services
- Consider additional encryption for cloud storage
- Delete old backups securely

## Future Enhancements

### Planned Features

- Automatic scheduled backups
- Cloud backup integration
- Encrypted backup files
- Selective data export/import
- Backup history tracking
- Cross-platform sync

### Coming Soon

- Integration with Google Drive/Dropbox
- End-to-end encryption for backups
- Incremental backups
- Backup compression
- Multi-device sync

## Support

If you encounter issues with backup/restore functionality:

1. Check this documentation first
2. Review the troubleshooting section
3. Contact support with:
   - Error messages
   - Browser console logs
   - Steps to reproduce
   - Backup file size (don't send the actual file)

## API Reference

### BackupService Methods

```typescript
// Export all user data
backupService.exportData(userId: string): Promise<void>

// Import data from backup file
backupService.importData(file: File, userId: string): Promise<void>

// Estimate backup size
backupService.estimateBackupSize(userId: string): Promise<string>

// Clear all user data
backupService.clearAllData(userId: string): Promise<void>
```

### React Component

```typescript
import { BackupRestore } from '@/components/features/BackupRestore';

// Use in your component
<BackupRestore />
```

## Changelog

### Version 1.0.0

- Initial release
- Basic export/import functionality
- LocalStorage and Supabase integration
- Checksum validation
- Duplicate prevention
- Settings page integration
