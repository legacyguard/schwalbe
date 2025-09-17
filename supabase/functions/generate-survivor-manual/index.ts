
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SurvivorManualEntry {
  id: string;
  entry_type: string;
  title: string;
  content: string;
  is_completed: boolean;
  priority: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Guardian {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship?: string;
  can_trigger_emergency: boolean;
  can_access_health_docs: boolean;
  can_access_financial_docs: boolean;
  is_child_guardian: boolean;
  is_will_executor: boolean;
  emergency_contact_priority: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, access_token } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log(`Generating survivor manual for user ${user_id}`);

    // Verify access (either user themselves or guardian with valid token)
    // TODO: Implement proper access token verification
    if (access_token) {
      console.log('Guardian access via token (verification would be implemented here)');
    }

    // Get protocol settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_protocol_settings')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (settingsError) {
      console.error('Error fetching protocol settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Protocol settings not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Get manual entries
    const { data: entries, error: entriesError } = await supabaseClient
      .from('survivor_manual_entries')
      .select('*')
      .eq('user_id', user_id)
      .order('priority', { ascending: true });

    if (entriesError) {
      console.error('Error fetching manual entries:', entriesError);
      throw entriesError;
    }

    // Get guardians
    const { data: guardians, error: guardiansError } = await supabaseClient
      .from('guardians')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true)
      .order('emergency_contact_priority', { ascending: true });

    if (guardiansError) {
      console.error('Error fetching guardians:', guardiansError);
      throw guardiansError;
    }

    // Get user profile information
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (profileError) {
      console.log('No profile found, using basic info');
    }

    // Generate the manual content
    const manual = generateManualContent(entries || [], guardians || [], userProfile, settings);

    // In a real implementation, you would convert this to PDF using a service like Puppeteer
    // For now, we return HTML that can be converted to PDF client-side
    const htmlContent = generateManualHTML(manual);

    return new Response(
      JSON.stringify({
        manual_content: manual,
        html_content: htmlContent,
        generated_at: new Date().toISOString(),
        entries_count: entries?.length || 0,
        guardians_count: guardians?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating survivor manual:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateManualContent(
  entries: SurvivorManualEntry[],
  guardians: Guardian[],
  userProfile: any,
  settings: any
) {
  // Ensure userProfile has expected structure
  const safeUserProfile = userProfile || {};
  const userName = safeUserProfile.full_name || 'Unknown';

  const manual = {
    title: 'Family Survivor\'s Manual',
    generated_at: new Date().toISOString(),
    user_name: userName,
    introduction: generateIntroduction(safeUserProfile, settings || {}),
    emergency_contacts: generateEmergencyContacts(guardians),
    sections: organizeEntriesByType(entries),
    quick_reference: generateQuickReference(entries, guardians)
  };

  return manual;
}

function generateIntroduction(userProfile: any, settings: any) {
  const userName = userProfile?.full_name || 'your loved one';
  
  return `
This manual was created by ${userName} to help you during this difficult time.

This document contains step-by-step instructions and important information 
to help you handle various situations. Each section provides specific guidance
on what to do and who to contact.

Please remember:
• You are not alone - the people listed here are ready to help
• Take things one step at a time
• Don't hesitate to ask for help when you need it
• This manual was created with love to support you

The Family Shield Protocol was activated on ${new Date().toLocaleDateString()}.
You can trust that these instructions reflect ${userName}'s wishes and careful planning.
  `.trim();
}

function generateEmergencyContacts(guardians: Guardian[]) {
  const emergencyGuardians = guardians.filter(g => g.can_trigger_emergency);
  const contacts = guardians.map(guardian => ({
    name: guardian.name,
    relationship: guardian.relationship || 'Guardian',
    email: guardian.email,
    phone: guardian.phone,
    priority: guardian.emergency_contact_priority,
    can_help_with: getGuardianCapabilities(guardian)
  }));

  return {
    primary_contacts: contacts.filter(c => c.priority <= 2),
    all_contacts: contacts,
    emergency_guardians_count: emergencyGuardians.length
  };
}

function getGuardianCapabilities(guardian: Guardian): string[] {
  const capabilities = [];
  
  if (guardian.can_trigger_emergency) {
    capabilities.push('Emergency decisions');
  }
  if (guardian.can_access_health_docs) {
    capabilities.push('Health information');
  }
  if (guardian.can_access_financial_docs) {
    capabilities.push('Financial matters');
  }
  if (guardian.is_child_guardian) {
    capabilities.push('Child care');
  }
  if (guardian.is_will_executor) {
    capabilities.push('Will execution');
  }
  
  return capabilities.length > 0 ? capabilities : ['General support'];
}

function organizeEntriesByType(entries: SurvivorManualEntry[]) {
  const typeOrder = [
    'emergency_procedure',
    'important_contacts', 
    'financial_access',
    'document_locations',
    'child_care_instructions',
    'property_management',
    'funeral_wishes',
    'custom_instruction'
  ];

  const sections: Record<string, any> = {};
  
  // Group entries by type
  entries.forEach(entry => {
    if (!sections[entry.entry_type]) {
      sections[entry.entry_type] = {
        title: getTypeTitle(entry.entry_type),
        entries: []
      };
    }
    sections[entry.entry_type].entries.push(entry);
  });

  // Return sections in priority order
  const orderedSections: any[] = [];
  typeOrder.forEach(type => {
    if (sections[type]) {
      orderedSections.push({
        type,
        ...sections[type]
      });
    }
  });

  return orderedSections;
}

function getTypeTitle(entryType: string): string {
  const titles: Record<string, string> = {
    'emergency_procedure': '🚨 Emergency Procedures',
    'important_contacts': '📞 Important Contacts',
    'financial_access': '💳 Financial Information',
    'document_locations': '📄 Document Locations',
    'child_care_instructions': '👶 Child Care Instructions',
    'property_management': '🏠 Property Management',
    'funeral_wishes': '💐 Final Wishes',
    'custom_instruction': '📝 Additional Instructions'
  };
  
  return titles[entryType] || 'Instructions';
}

function generateQuickReference(entries: SurvivorManualEntry[], guardians: Guardian[]) {
  const highPriorityEntries = entries
    .filter(e => e.priority <= 3)
    .slice(0, 5)
    .map(e => ({
      title: e.title,
      type: getTypeTitle(e.entry_type)
    }));

  const primaryContacts = guardians
    .filter(g => g.emergency_contact_priority <= 2)
    .map(g => ({
      name: g.name,
      phone: g.phone,
      email: g.email
    }));

  return {
    most_important_tasks: highPriorityEntries,
    primary_contacts: primaryContacts,
    important_note: 'Start with the Emergency Procedures section, then work through the other sections as needed.'
  };
}

function generateManualHTML(manual: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${manual.title}</title>
  <style>
    body { font-family: Georgia, serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 3px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .section { margin-bottom: 40px; page-break-inside: avoid; }
    .section-title { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
    .entry { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
    .entry-title { font-weight: bold; margin-bottom: 10px; }
    .entry-content { white-space: pre-line; }
    .contact { padding: 10px; border-left: 4px solid #007bff; margin-bottom: 10px; background: #f8f9fa; }
    .quick-ref { background: #fff3cd; padding: 20px; border-radius: 5px; border: 1px solid #ffeaa7; }
    @media print { body { margin: 0; padding: 15px; } .section { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${manual.title}</h1>
    <p>Created for the family of ${manual.user_name}</p>
    <p>Generated: ${new Date(manual.generated_at).toLocaleString()}</p>
  </div>

  <div class="section">
    <h2 class="section-title">Introduction</h2>
    <div class="entry-content">${manual.introduction}</div>
  </div>

  <div class="section quick-ref">
    <h2 class="section-title">⚡ Quick Reference</h2>
    <p><strong>Most Important Tasks:</strong></p>
    <ul>
      ${manual.quick_reference.most_important_tasks.map((task: any) => `
        <li><strong>${task.title}</strong> (${task.type})</li>
      `).join('')}
    </ul>
    <p><strong>Primary Contacts:</strong></p>
    ${manual.quick_reference.primary_contacts.map((contact: any) => `
      <div class="contact">
        <strong>${contact.name}</strong><br>
        Phone: ${contact.phone || 'Not provided'}<br>
        Email: ${contact.email}
      </div>
    `).join('')}
    <p><em>${manual.quick_reference.important_note}</em></p>
  </div>

  <div class="section">
    <h2 class="section-title">📞 Emergency Contacts</h2>
    ${manual.emergency_contacts.all_contacts.map((contact: any) => `
      <div class="contact">
        <strong>${contact.name}</strong> (${contact.relationship})<br>
        Priority: ${contact.priority}<br>
        Phone: ${contact.phone || 'Not provided'}<br>
        Email: ${contact.email}<br>
        <em>Can help with: ${contact.can_help_with.join(', ')}</em>
      </div>
    `).join('')}
  </div>

  ${manual.sections.map((section: any) => `
    <div class="section">
      <h2 class="section-title">${section.title}</h2>
      ${section.entries.map((entry: any) => `
        <div class="entry">
          <div class="entry-title">${entry.title}</div>
          <div class="entry-content">${entry.content}</div>
          ${entry.tags.length > 0 ? `<small>Tags: ${entry.tags.join(', ')}</small>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('')}

  <div class="section" style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #333;">
    <p><em>This manual was created with the Family Shield Protocol by LegacyGuard. 
    It reflects the careful planning and love of ${manual.user_name} for their family.</em></p>
    <p><small>Last updated: ${new Date(manual.generated_at).toLocaleString()}</small></p>
  </div>
</body>
</html>
  `.trim();
}