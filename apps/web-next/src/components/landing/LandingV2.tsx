"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function LandingV2({ locale }: { locale: string }) {
  const t = useTranslations("landingV2");

  const heroStars = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        id: i,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 2 + Math.random() * 2,
      })),
    []
  );

  // Page view analytics
  useEffect(() => {
    track({ event: "landing_v2_view", locale });
  }, [locale]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero */}
      <section
        className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-28"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.10) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.10) 0%, transparent 50%), linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        }}
      >
        {/* Stars */}
        <div className="absolute inset-0 -z-10">
          {heroStars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute bg-white rounded-full"
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                left: `${star.x}%`,
                top: `${star.y}%`,
                opacity: star.opacity,
              }}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: star.duration, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 text-center relative">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6"
          >
            {t("hero.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={`/${locale}/landing-v2`}
              className="inline-flex items-center justify-center rounded-lg bg-slate-700/70 hover:bg-slate-600 text-white px-6 py-3 text-lg font-semibold border border-slate-600"
              onClick={() => track({ event: "landing_v2_cta_primary_click", locale })}
            >
              {t("hero.ctaPrimary")}
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-100 px-6 py-3 text-lg font-medium border border-slate-700"
              onClick={() => track({ event: "landing_v2_cta_secondary_click", locale })}
            >
              {t("hero.ctaSecondary")}
            </a>
          </motion.div>
        </div>

        {/* Soft glow */}
        <div className="absolute -z-10 top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-cyan-500/10 rounded-full blur-3xl" />
      </section>

      {/* Key value & trust sections */}
      <div id="features" className="bg-slate-900/50">
        <SecurityPromiseSection />
      </div>

      <PricingSection locale={locale} />
    </div>
  );
}

function SecurityPromiseSection() {
  const t = useTranslations("landingV2.securityPromise");
  const features = [0, 1, 2, 3].map((i) => ({
    title: t(`features.${i}.title`),
    description: t(`features.${i}.description`),
    icon: ["🛡️", "🔑", "✅", "⏱️"][i],
  }));

  // Section view (security promise) when mounted
  useEffect(() => {
    track({ event: "landing_v2_security_promise_view", locale: (useTranslations as any).locale?.() || "en" });
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">{t("title")}</h2>
        <p className="text-lg text-slate-300 mb-12 max-w-3xl mx-auto">{t("subtitle")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/60 p-8 rounded-lg shadow-md border border-slate-700 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="mb-6 inline-block p-4 bg-yellow-400/10 rounded-full text-3xl">
                <span aria-hidden>{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <a href="#security" className="text-slate-300 hover:text-yellow-400 transition-colors">
            {t("learnMore.text")} {t("learnMore.arrow")}
          </a>
        </div>
      </div>
    </section>
  );
}

function PricingSection({ locale }: { locale: string }) {
  useEffect(() => {
    track({ event: "landing_v2_pricing_view", locale });
  }, [locale]);
  const t = useTranslations("landingV2.pricing");

  const tiers = [
    {
      id: "free",
      name: t("tiers.free.name"),
      price: t("tiers.free.price"),
      description: t("tiers.free.description"),
      features: t("tiers.free.features", { returnObjects: true }) as { title: string; description: string }[],
      cta: t("tiers.free.cta"),
      href: `/${locale}/sign-up`,
      highlighted: false,
      period: "",
      badge: "",
    },
    {
      id: "premium",
      name: t("tiers.premium.name"),
      price: t("tiers.premium.price"),
      period: t("tiers.premium.period"),
      description: t("tiers.premium.description"),
      features: t("tiers.premium.features", { returnObjects: true }) as { title: string; description: string }[],
      cta: t("tiers.premium.cta"),
      href: `/${locale}/sign-up?plan=premium`,
      highlighted: true,
      badge: t("tiers.premium.badge"),
    },
    {
      id: "family",
      name: t("tiers.family.name"),
      price: t("tiers.family.price"),
      period: t("tiers.family.period"),
      description: t("tiers.family.description"),
      features: t("tiers.family.features", { returnObjects: true }) as { title: string; description: string }[],
      cta: t("tiers.family.cta"),
      href: `/${locale}/sign-up?plan=family`,
      highlighted: false,
      badge: "",
    },
  ];

  return (
    <section className="relative py-24 px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("heading")}</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">{t("subheading")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={`relative flex flex-col h-full p-8 rounded-2xl border transition-all duration-300 ${
                tier.highlighted
                  ? "bg-gradient-to-b from-primary/5 to-transparent border-primary/20 shadow-xl scale-105"
                  : "bg-slate-900/50 backdrop-blur-sm border-slate-700 hover:border-primary/20 hover:shadow-lg"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                    ⭐ {tier.badge}
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 text-white">{tier.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  {tier.period && (
                    <span className="text-slate-400 ml-2">/ {tier.period}</span>
                  )}
                </div>
                <p className="text-slate-300">{tier.description}</p>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">✅</div>
                    <div>
                      <div className="font-medium mb-1 text-white">{feature.title}</div>
                      <div className="text-sm text-slate-400">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={tier.href}
                className={`w-full inline-flex items-center justify-center rounded-lg px-4 py-3 border transition-colors ${
                  tier.highlighted
                    ? "bg-primary text-white border-primary hover:bg-primary/90"
                    : "bg-slate-800/40 text-slate-100 border-slate-700 hover:bg-slate-800"
                }`}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-slate-300"
        >
          <div className="flex items-center gap-2">🛡️ <span>{t("trust.encryption")}</span></div>
          <div className="flex items-center gap-2">👨‍👩‍👧‍👦 <span>{t("trust.families")}</span></div>
          <div className="flex items-center gap-2">✔️ <span>{t("trust.cancel")}</span></div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-300">
            {t("faq.lead")} <a href="#faq" className="text-primary hover:underline">{t("faq.link")}</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
