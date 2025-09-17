"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";

export function Scene1Promise({ onNext, onSkip }: { onNext: () => void; onSkip?: () => void }) {
  const t = useTranslations("onboarding.scene1");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative">
      {onSkip && (
        <motion.button onClick={onSkip} className="absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors z-10 bg-background/80 backdrop-blur px-3 py-1 rounded-full border border-border/50 hover:border-border">
          {t("skip")}
        </motion.button>
      )}
      <div className="w-full max-w-2xl text-center border border-primary/20 shadow-xl rounded-lg bg-background/95">
        <div className="pt-10 pb-8 px-6">
          <h2 className="text-3xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">{t("title")}</h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">{t("subtitle")}</p>
          <button className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-3 text-lg" onClick={onNext}>
            {t("cta")}
          </button>
          <p className="text-xs text-muted-foreground mt-3 opacity-70">{t("foot")}</p>
        </div>
      </div>
    </div>
  );
}

export function Scene2Box({ initialItems = "", onBack, onNext, onSkip }: { initialItems?: string; onBack: () => void; onNext: (items: string) => void; onSkip?: () => void }) {
  const t = useTranslations("onboarding.scene2");
  const [items, setItems] = useState(initialItems);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative">
      {onSkip && (
        <motion.button onClick={onSkip} className="absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors z-10 bg-background/80 backdrop-blur px-3 py-1 rounded-full border border-border/50 hover:border-border">
          {t("skip")}
        </motion.button>
      )}
      <div className="w-full max-w-3xl border border-primary/20 shadow-xl rounded-lg bg-background/95">
        <div className="pt-10 pb-8 px-6">
          <h2 className="text-2xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">{t("title")}</h2>
          <p className="text-muted-foreground mb-6 text-lg leading-relaxed">{t("lead")}</p>
          <p className="text-sm text-muted-foreground/80 mb-4 italic">{t("hint")}</p>
          <textarea value={items} onChange={(e) => setItems(e.target.value)} rows={6} className="w-full rounded border border-primary/20 bg-background/50 p-3 mb-6" placeholder={t("ph") as string} />
          <div className="flex gap-3 justify-between">
            <button onClick={onBack} className="inline-flex items-center justify-center rounded-lg bg-transparent text-foreground px-4 py-2 border border-primary/20 hover:border-primary/40">{t("back")}</button>
            <div className="flex gap-3">
              <button onClick={() => setItems("")} className="inline-flex items-center justify-center rounded-lg bg-transparent text-foreground px-4 py-2 border border-muted hover:border-muted-foreground/40">{t("clear")}</button>
              <button onClick={() => onNext(items)} disabled={!items.trim()} className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 disabled:opacity-60">{t("continue")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Scene3Key({ initialTrustedName = "", onBack, onNext, onSkip }: { initialTrustedName?: string; onBack: () => void; onNext: (name: string) => void; onSkip?: () => void }) {
  const t = useTranslations("onboarding.scene3");
  const [name, setName] = useState(initialTrustedName);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative">
      {onSkip && (
        <motion.button onClick={onSkip} className="absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors z-10 bg-background/80 backdrop-blur px-3 py-1 rounded-full border border-border/50 hover:border-border">
          {t("skip")}
        </motion.button>
      )}
      <div className="w-full max-w-3xl border border-primary/20 shadow-xl rounded-lg bg-background/95">
        <div className="pt-10 pb-8 px-6">
          <h2 className="text-2xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">{t("title")}</h2>
          <p className="text-muted-foreground mb-6 text-lg leading-relaxed">{t("lead")}</p>
          <p className="text-sm text-muted-foreground/80 mb-6 italic">{t("hint")}</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("ph") as string} className="w-full h-12 rounded border border-primary/20 bg-background/50 p-3 mb-6" />
          <div className="flex gap-3 justify-between">
            <button onClick={onBack} className="inline-flex items-center justify-center rounded-lg bg-transparent text-foreground px-4 py-2 border border-primary/20 hover:border-primary/40">{t("back")}</button>
            <button onClick={() => onNext(name)} disabled={!name.trim()} className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 disabled:opacity-60">{t("continue")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Scene4Prepare({ onBack, onComplete }: { onBack: () => void; onComplete?: () => void }) {
  const t = useTranslations("onboarding.scene4");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-2xl text-center border border-primary/20 shadow-xl bg-background/95 backdrop-blur rounded-lg">
        <div className="pt-10 pb-8 px-6">
          <h2 className="text-2xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">{t("title")}</h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">{t("lead")}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onBack} className="inline-flex items-center justify-center rounded-lg bg-transparent text-foreground px-4 py-2 border border-primary/20 hover:border-primary/40">{t("back")}</button>
            <button onClick={() => onComplete?.()} className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2">{t("done")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
