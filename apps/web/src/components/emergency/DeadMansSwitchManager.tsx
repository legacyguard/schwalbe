import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { EmergencyService } from '@schwalbe/shared';

interface ShieldSettingsForm {
  is_shield_enabled: boolean;
  inactivity_hours: number;
  required_confirmations: number; // number of guardians confirmations (1-3)
  last_activity_check?: string;
}

export default function DeadMansSwitchManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ShieldSettingsForm>({
    is_shield_enabled: false,
    inactivity_hours: 48,
    required_confirmations: 1,
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id || null;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      const svc = new EmergencyService(supabase as any);
      const settings = await svc.getShieldSettings(uid);
      if (settings) {
        setForm({
          is_shield_enabled: !!settings.is_shield_enabled,
          inactivity_hours: settings.inactivity_hours ?? 48,
          required_confirmations: settings.required_confirmations ?? 1,
          last_activity_check: settings.last_activity_check ?? undefined,
        });
      }
      setLoading(false);
    })();
  }, []);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    try {
      const svc = new EmergencyService(supabase as any);
      await svc.updateShieldSettings(userId, {
        is_shield_enabled: form.is_shield_enabled,
        inactivity_hours: form.inactivity_hours,
        required_confirmations: form.required_confirmations,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">🕒 Dead Man's Switch</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-slate-300">Loading settings…</div>
        ) : !userId ? (
          <div className="text-sm text-slate-300">Sign in to manage Dead Man's Switch settings.</div>
        ) : (
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={form.is_shield_enabled}
                onCheckedChange={(v: any) => setForm((s) => ({ ...s, is_shield_enabled: Boolean(v) }))}
                aria-label="Enable Family Shield"
              />
              <span>Enable Family Shield (Dead Man's Switch)</span>
            </label>

            <div>
              <label className="block text-sm mb-1">Inactivity threshold (hours)</label>
              <Input
                type="number"
                min={6}
                max={720}
                value={form.inactivity_hours}
                onChange={(e) => setForm((s) => ({ ...s, inactivity_hours: Number(e.target.value) }))}
                aria-label="Inactivity threshold hours"
                className="max-w-xs"
              />
              <p className="text-xs text-slate-400 mt-1">After this period without activity, guardians will be contacted for confirmation.</p>
            </div>

            <div>
              <label className="block text-sm mb-1">Required guardian confirmations</label>
              <Input
                type="number"
                min={1}
                max={3}
                value={form.required_confirmations}
                onChange={(e) => setForm((s) => ({ ...s, required_confirmations: Number(e.target.value) }))}
                aria-label="Required confirmations"
                className="max-w-xs"
              />
              <p className="text-xs text-slate-400 mt-1">Number of guardians required to acknowledge the emergency before escalation.</p>
            </div>

            {form.last_activity_check && (
              <p className="text-xs text-slate-400">Last activity recorded: {new Date(form.last_activity_check).toLocaleString()}</p>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} aria-busy={saving}>
                {saving ? 'Saving…' : 'Save Settings'}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (!userId) return;
                  const svc = new EmergencyService(supabase as any);
                  await svc.initializeDefaultRules(userId);
                }}
              >
                Initialize Default Rules
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}