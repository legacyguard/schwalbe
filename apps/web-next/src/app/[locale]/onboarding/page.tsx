"use client";

import { notFound } from "next/navigation";
import { isOnboardingEnabled } from "@/config/flags";
import { useEffect, useState } from "react";
import { Scene1Promise, Scene2Box, Scene3Key, Scene4Prepare } from "@/components/onboarding/Scenes";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics";

export default function OnboardingPage({ params }: { params: { locale: string } }) {
  if (!isOnboardingEnabled()) {
    notFound();
  }

  // Minimal client-side stepper using adapted scenes
  const t = useTranslations("onboarding");
  const [step, setStep] = useState(1);
  const [boxItems, setBoxItems] = useState("");
  const [trustedName, setTrustedName] = useState("");

  const STORAGE_KEY = `onb_state_${params.locale}`;

  // Load persisted state on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        if (typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= 4) setStep(parsed.step);
        if (typeof parsed.boxItems === "string") setBoxItems(parsed.boxItems);
        if (typeof parsed.trustedName === "string") setTrustedName(parsed.trustedName);
      }
    } catch {
      // ignore invalid JSON
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state on change (best-effort)
  useEffect(() => {
    try {
      const state = { step, boxItems, trustedName };
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota or JSON errors
    }
  }, [STORAGE_KEY, step, boxItems, trustedName]);

  // Analytics: view event on mount
  useEffect(() => {
    track({ event: "onboarding_view", locale: params.locale });
  }, [params.locale]);

  const goBack = () =>
    setStep((s) => {
      const prev = Math.max(1, s - 1);
      if (prev !== s) track({ event: "onboarding_step_back", locale: params.locale, meta: { from: s, to: prev } });
      return prev;
    });

  const goNext = () =>
    setStep((s) => {
      const next = Math.min(4, s + 1);
      if (next !== s) track({ event: "onboarding_step_next", locale: params.locale, meta: { from: s, to: next } });
      return next;
    });

  return (
    <main className="min-h-screen text-slate-100">
      {step === 1 && <Scene1Promise onNext={goNext} />}
      {step === 2 && (
        <Scene2Box
          initialItems={boxItems}
          onBack={goBack}
          onNext={(items) => {
            setBoxItems(items);
            goNext();
          }}
        />
      )}
      {step === 3 && (
        <Scene3Key
          initialTrustedName={trustedName}
          onBack={goBack}
          onNext={(name) => {
            setTrustedName(name);
            goNext();
          }}
        />
      )}
      {step === 4 && (
        <Scene4Prepare
          onBack={goBack}
          onComplete={() => {
            track({ event: "onboarding_complete", locale: params.locale, meta: { boxItemsLen: boxItems.trim().length, hasTrusted: !!trustedName.trim() } });
            try {
              if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
            } catch {}
            // Later: redirect to dashboard or next step
          }}
        />
      )}
    </main>
  );
}
