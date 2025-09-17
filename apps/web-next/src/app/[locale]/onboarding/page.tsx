"use client";

import { notFound } from "next/navigation";
import { isOnboardingEnabled } from "@/config/flags";
import { useState } from "react";
import { Scene1Promise, Scene2Box, Scene3Key, Scene4Prepare } from "@/components/onboarding/Scenes";
import { useTranslations } from "next-intl";

export default function OnboardingPage({ params }: { params: { locale: string } }) {
  if (!isOnboardingEnabled()) {
    notFound();
  }

  // Minimal client-side stepper using adapted scenes
  const t = useTranslations("onboarding");
  const [step, setStep] = useState(1);
  const [boxItems, setBoxItems] = useState("");
  const [trustedName, setTrustedName] = useState("");

  const goBack = () => setStep((s) => Math.max(1, s - 1));
  const goNext = () => setStep((s) => Math.min(4, s + 1));

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
            // Placeholder complete handler; later: analytics + redirect
          }}
        />
      )}
    </main>
  );
}
