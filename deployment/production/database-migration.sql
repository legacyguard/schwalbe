-- Production Database Migration Script
-- Schwalbe LegacyGuard Application
-- Version: 1.0.0
-- Target: Supabase PostgreSQL

-- =============================================================================
-- PRE-MIGRATION CHECKS
-- =============================================================================

-- Check if this is a fresh installation or migration
DO $$
BEGIN
    -- Create migration tracking table if it doesn't exist
    CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        checksum VARCHAR(64)
    );
END $$;

-- =============================================================================
-- ENABLE REQUIRED EXTENSIONS
-- =============================================================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =============================================================================
-- CORE USER MANAGEMENT
-- =============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(2), -- ISO country code
    language_preference VARCHAR(5) DEFAULT 'sk-SK',
    timezone VARCHAR(50) DEFAULT 'Europe/Bratislava',

    -- Onboarding and engagement
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,

    -- Account status
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Search vector for full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('slovak', coalesce(full_name, '') || ' ' || coalesce(email, ''))
    ) STORED
);

-- User preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

    -- UI Preferences
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',

    -- Sofia AI Preferences
    sofia_personality_level VARCHAR(20) DEFAULT 'balanced' CHECK (sofia_personality_level IN ('minimal', 'balanced', 'enthusiastic')),
    sofia_language VARCHAR(5) DEFAULT 'sk-SK',
    sofia_voice_enabled BOOLEAN DEFAULT TRUE,

    -- Document Preferences
    default_document_category VARCHAR(50),
    auto_ocr_enabled BOOLEAN DEFAULT TRUE,
    auto_categorization_enabled BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id)
);

-- =============================================================================
-- DOCUMENT MANAGEMENT
-- =============================================================================

-- Document categories
CREATE TABLE IF NOT EXISTS public.document_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_sk VARCHAR(100) NOT NULL, -- Slovak translation
    description TEXT,
    description_sk TEXT, -- Slovak translation
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    sort_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default document categories
INSERT INTO public.document_categories (name, name_sk, description, description_sk, icon, color, sort_order) VALUES
('Personal', 'Osobné', 'Personal identification documents', 'Osobné doklady totožnosti', 'user', '#3B82F6', 1),
('Financial', 'Finančné', 'Banking, insurance, and financial documents', 'Bankové, poisťovacie a finančné dokumenty', 'credit-card', '#10B981', 2),
('Legal', 'Právne', 'Contracts, wills, and legal documents', 'Zmluvy, testamenty a právne dokumenty', 'scale', '#8B5CF6', 3),
('Health', 'Zdravotné', 'Medical records and health documents', 'Zdravotné záznamy a zdravotné dokumenty', 'heart', '#EF4444', 4),
('Property', 'Nehnuteľnosti', 'Real estate and property documents', 'Nehnuteľnosti a majetkové dokumenty', 'home', '#F59E0B', 5),
('Education', 'Vzdelanie', 'Educational certificates and diplomas', 'Vzdelávacie certifikáty a diplomy', 'academic-cap', '#06B6D4', 6),
('Other', 'Ostatné', 'Other important documents', 'Ostatné dôležité dokumenty', 'document', '#6B7280', 7)
ON CONFLICT DO NOTHING;

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.document_categories(id),

    -- Document metadata
    title VARCHAR(255) NOT NULL,
    description TEXT,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,

    -- Storage
    storage_path TEXT NOT NULL, -- Supabase storage path
    thumbnail_path TEXT,

    -- Document properties
    page_count INTEGER DEFAULT 1,
    language VARCHAR(5) DEFAULT 'sk-SK',

    -- Processing status
    status VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'processed', 'failed', 'archived', 'deleted')),
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    processing_error TEXT,

    -- OCR data
    ocr_completed BOOLEAN DEFAULT FALSE,
    ocr_confidence DECIMAL(3,2), -- 0.00 to 1.00
    extracted_text TEXT,

    -- Security
    encryption_key_id UUID,
    is_sensitive BOOLEAN DEFAULT FALSE,

    -- Sharing
    is_shared BOOLEAN DEFAULT FALSE,
    shared_with JSONB DEFAULT '[]', -- Array of user IDs

    -- Metadata
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',

    -- Timestamps
    document_date DATE, -- Date when the document was issued/created
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('slovak',
            coalesce(title, '') || ' ' ||
            coalesce(description, '') || ' ' ||
            coalesce(extracted_text, '') || ' ' ||
            coalesce(array_to_string(tags, ' '), '')
        )
    ) STORED
);

-- Document versions (for version control)
CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    change_description TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(document_id, version_number)
);

-- =============================================================================
-- SOFIA AI ASSISTANT
-- =============================================================================

-- Sofia conversations
CREATE TABLE IF NOT EXISTS public.sofia_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

    -- Conversation metadata
    title VARCHAR(255),
    context_type VARCHAR(50), -- 'onboarding', 'document_help', 'general', etc.
    context_data JSONB DEFAULT '{}',

    -- Conversation state
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,

    -- AI model info
    model_version VARCHAR(50) DEFAULT 'gpt-4',
    personality_settings JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sofia messages
CREATE TABLE IF NOT EXISTS public.sofia_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.sofia_conversations(id) ON DELETE CASCADE,

    -- Message content
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,

    -- Message metadata
    message_type VARCHAR(50), -- 'text', 'suggestion', 'celebration', etc.
    emotional_context JSONB DEFAULT '{}',

    -- AI processing
    token_count INTEGER,
    processing_time INTEGER, -- milliseconds
    confidence_score DECIMAL(3,2),

    -- User feedback
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_feedback TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sofia user personality profiles
CREATE TABLE IF NOT EXISTS public.sofia_personality_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

    -- Personality traits
    confidence_level DECIMAL(3,2) DEFAULT 0.50, -- 0.00 to 1.00
    anxiety_level DECIMAL(3,2) DEFAULT 0.50,
    tech_savviness DECIMAL(3,2) DEFAULT 0.50,
    detail_orientation DECIMAL(3,2) DEFAULT 0.50,

    -- Communication preferences
    preferred_communication_style VARCHAR(20) DEFAULT 'balanced' CHECK (preferred_communication_style IN ('formal', 'balanced', 'casual')),
    preferred_pace VARCHAR(20) DEFAULT 'moderate' CHECK (preferred_pace IN ('slow', 'moderate', 'fast')),
    celebration_style VARCHAR(20) DEFAULT 'moderate' CHECK (celebration_style IN ('minimal', 'moderate', 'enthusiastic')),

    -- Learning and adaptation
    interaction_patterns JSONB DEFAULT '{}',
    milestone_history JSONB DEFAULT '[]',
    feedback_history JSONB DEFAULT '[]',

    -- Metadata
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id)
);

-- =============================================================================
-- LEGAL SERVICES
-- =============================================================================

-- Will templates
CREATE TABLE IF NOT EXISTS public.will_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_sk VARCHAR(255) NOT NULL,
    description TEXT,
    description_sk TEXT,
    jurisdiction VARCHAR(2) NOT NULL, -- ISO country code
    template_content TEXT NOT NULL, -- Legal template with placeholders
    template_content_sk TEXT NOT NULL, -- Slovak version
    required_fields JSONB DEFAULT '[]',

    -- Legal metadata
    legal_review_status VARCHAR(20) DEFAULT 'pending' CHECK (legal_review_status IN ('pending', 'approved', 'rejected')),
    legal_reviewer VARCHAR(255),
    legal_review_date DATE,
    legal_review_notes TEXT,

    -- Version control
    version VARCHAR(10) NOT NULL DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-generated wills
CREATE TABLE IF NOT EXISTS public.user_wills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.will_templates(id),

    -- Will metadata
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'finalized', 'legally_executed')),

    -- Will content
    content TEXT NOT NULL,
    field_values JSONB DEFAULT '{}', -- User-filled template values

    -- Legal status
    legal_review_requested BOOLEAN DEFAULT FALSE,
    legal_review_completed BOOLEAN DEFAULT FALSE,
    legally_witnessed BOOLEAN DEFAULT FALSE,
    witness_information JSONB DEFAULT '{}',

    -- Document generation
    generated_document_path TEXT,
    generated_at TIMESTAMP WITH TIME ZONE,

    -- Sharing and access
    emergency_contacts JSONB DEFAULT '[]',
    executor_information JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TIME CAPSULES
-- =============================================================================

-- Time capsules
CREATE TABLE IF NOT EXISTS public.time_capsules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

    -- Capsule metadata
    title VARCHAR(255) NOT NULL,
    description TEXT,
    message TEXT NOT NULL,

    -- Delivery settings
    delivery_method VARCHAR(20) DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms', 'in_app')),
    delivery_date TIMESTAMP WITH TIME ZONE,
    delivery_triggers JSONB DEFAULT '[]', -- Event-based triggers

    -- Recipients
    recipients JSONB NOT NULL DEFAULT '[]', -- Array of recipient objects

    -- Content
    attachments JSONB DEFAULT '[]', -- Array of attachment paths
    media_attachments JSONB DEFAULT '[]', -- Photos, videos, audio

    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'delivered', 'failed', 'cancelled')),
    delivery_attempted_at TIMESTAMP WITH TIME ZONE,
    delivery_completed_at TIMESTAMP WITH TIME ZONE,
    delivery_error TEXT,

    -- Security
    encryption_enabled BOOLEAN DEFAULT TRUE,
    require_verification BOOLEAN DEFAULT TRUE,
    verification_method VARCHAR(20) DEFAULT 'email' CHECK (verification_method IN ('email', 'sms', 'identity')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time capsule delivery logs
CREATE TABLE IF NOT EXISTS public.time_capsule_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capsule_id UUID REFERENCES public.time_capsules(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    delivery_status VARCHAR(20) NOT NULL CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    delivery_method VARCHAR(20) NOT NULL,
    delivery_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT,
    tracking_data JSONB DEFAULT '{}'
);

-- =============================================================================
-- ANALYTICS AND TRACKING
-- =============================================================================

-- User analytics events
CREATE TABLE IF NOT EXISTS public.user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

    -- Event data
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    event_action VARCHAR(100),
    event_label VARCHAR(255),
    event_value DECIMAL(10,2),

    -- Session information
    session_id UUID,
    page_url TEXT,
    referrer_url TEXT,
    user_agent TEXT,

    -- Device and location (anonymized)
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    country_code VARCHAR(2),
    city VARCHAR(100),

    -- Custom properties
    custom_properties JSONB DEFAULT '{}',

    -- Privacy compliance
    is_anonymous BOOLEAN DEFAULT FALSE,
    consent_given BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id UUID UNIQUE NOT NULL,

    -- Session metadata
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,

    -- Session data
    pages_visited INTEGER DEFAULT 0,
    actions_taken INTEGER DEFAULT 0,
    documents_processed INTEGER DEFAULT 0,
    sofia_interactions INTEGER DEFAULT 0,

    -- Device information
    device_fingerprint TEXT,
    ip_address INET,
    user_agent TEXT,

    -- Session quality
    bounce_rate DECIMAL(3,2),
    engagement_score DECIMAL(3,2)
);

-- =============================================================================
-- SYSTEM ADMINISTRATION
-- =============================================================================

-- System settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(50) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),

    -- Action details
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,

    -- Changes
    old_values JSONB,
    new_values JSONB,

    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_id UUID,

    -- Metadata
    additional_data JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON public.users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_search_vector ON public.users USING gin(search_vector);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category_id ON public.documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_search_vector ON public.documents USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON public.documents USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_documents_user_status ON public.documents(user_id, status);

-- Sofia conversations indexes
CREATE INDEX IF NOT EXISTS idx_sofia_conversations_user_id ON public.sofia_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_sofia_conversations_status ON public.sofia_conversations(status);
CREATE INDEX IF NOT EXISTS idx_sofia_messages_conversation_id ON public.sofia_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sofia_messages_created_at ON public.sofia_messages(created_at);

-- Time capsules indexes
CREATE INDEX IF NOT EXISTS idx_time_capsules_user_id ON public.time_capsules(user_id);
CREATE INDEX IF NOT EXISTS idx_time_capsules_delivery_date ON public.time_capsules(delivery_date);
CREATE INDEX IF NOT EXISTS idx_time_capsules_status ON public.time_capsules(status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON public.user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON public.user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_user_analytics_session_id ON public.user_analytics(session_id);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofia_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofia_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofia_personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsule_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can manage own documents" ON public.documents
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared documents" ON public.documents
    FOR SELECT USING (
        auth.uid() = user_id OR
        (is_shared = true AND auth.uid()::text = ANY(SELECT jsonb_array_elements_text(shared_with)))
    );

-- Document versions policies
CREATE POLICY "Users can manage versions of own documents" ON public.document_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE documents.id = document_versions.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- Sofia conversations policies
CREATE POLICY "Users can manage own conversations" ON public.sofia_conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage messages in own conversations" ON public.sofia_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.sofia_conversations
            WHERE sofia_conversations.id = sofia_messages.conversation_id
            AND sofia_conversations.user_id = auth.uid()
        )
    );

-- Sofia personality profiles policies
CREATE POLICY "Users can manage own personality profile" ON public.sofia_personality_profiles
    FOR ALL USING (auth.uid() = user_id);

-- User wills policies
CREATE POLICY "Users can manage own wills" ON public.user_wills
    FOR ALL USING (auth.uid() = user_id);

-- Time capsules policies
CREATE POLICY "Users can manage own time capsules" ON public.time_capsules
    FOR ALL USING (auth.uid() = user_id);

-- Analytics policies (read-only for users)
CREATE POLICY "Users can view own analytics" ON public.user_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Audit logs policies (read-only for users)
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sofia_conversations_updated_at BEFORE UPDATE ON public.sofia_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_capsules_updated_at BEFORE UPDATE ON public.time_capsules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );

    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);

    INSERT INTO public.sofia_personality_profiles (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- RECORD MIGRATION COMPLETION
-- =============================================================================

-- Record this migration
INSERT INTO schema_migrations (version, checksum) VALUES
('1.0.0_initial_schema', md5('production_initial_schema'))
ON CONFLICT (version) DO UPDATE SET
applied_at = NOW(),
checksum = EXCLUDED.checksum;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;

-- =============================================================================
-- MIGRATION COMPLETED SUCCESSFULLY
-- =============================================================================