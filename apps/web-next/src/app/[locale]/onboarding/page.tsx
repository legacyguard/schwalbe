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
            // Later: redirect to dashboard or next step
          }}
        />
      )}
    </main>
  );
}
