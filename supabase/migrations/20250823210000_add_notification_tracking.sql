-- Add notification tracking to documents table
ALTER TABLE documents 
ADD COLUMN last_notification_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for efficient querying of notification dates
CREATE INDEX idx_documents_notification_date ON documents(last_notification_sent_at);

-- Add index for efficient expiration date queries
CREATE INDEX idx_documents_expires_at ON documents(expires_at) WHERE expires_at IS NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN documents.last_notification_sent_at IS 'Timestamp of when the last expiration notification was sent for this document';

-- Create a view for documents needing notifications (optional, for easier querying)
CREATE OR REPLACE VIEW documents_needing_notification AS
SELECT 
    d.*,
    EXTRACT(days FROM (d.expires_at - CURRENT_DATE)) as days_until_expiration
FROM documents d
WHERE 
    d.expires_at IS NOT NULL 
    AND d.expires_at >= CURRENT_DATE
    AND d.expires_at <= (CURRENT_DATE + INTERVAL '30 days')
    AND (
        d.last_notification_sent_at IS NULL 
        OR d.last_notification_sent_at < (CURRENT_DATE - INTERVAL '20 days')
    );

COMMENT ON VIEW documents_needing_notification IS 'View showing documents that need expiration notifications sent';