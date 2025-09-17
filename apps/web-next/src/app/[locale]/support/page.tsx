"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function SupportPage() {
  const t = useTranslations("support");
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";

  const email = "support@documentsafe.app";
  const emailLink = (
    <a className="text-sky-300 underline" href={`mailto:${email}`}>
      {email}
    </a>
  );
  const faqAnchor = (
    <a className="text-sky-300 underline" href="#faq">
      FAQ
    </a>
  );

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 px-6 py-10">
      <section className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">{t("title")}</h1>
        <p className="mb-6">
          {t.rich("intro", {
            emailLink: () => emailLink,
            faqLink: () => faqAnchor,
          })}
        </p>

        <div className="rounded border border-slate-700 bg-slate-800 p-4" id="faq">
          <h2 className="text-xl font-medium mb-2">{t("faq.title")}</h2>
          <ul className="list-disc ml-6 space-y-2 text-slate-300">
            <li>
              {t.rich("faq.cancel", {
                billingLink: () => (
                  <Link className="underline" href={`/${locale}/account/billing`}>
                    Account → Billing
                  </Link>
                ),
              })}
            </li>
            <li>
              {t.rich("faq.export", {
                exportLink: () => (
                  <Link className="underline" href={`/${locale}/account/export`}>
                    Account → Export
                  </Link>
                ),
              })}
            </li>
            <li>
              {t.rich("faq.contact", {
                emailLink: () => emailLink,
              })}
            </li>
          </ul>
        </div>

        <div className="mt-6 text-sm text-slate-300">
          <span className="mr-2">{t("legal.title")}</span>
          <Link className="underline mr-2" href={`/${locale}/legal/terms`}>
            {t("legal.terms")}
          </Link>
          <Link className="underline mr-2" href={`/${locale}/legal/privacy`}>
            {t("legal.privacy")}
          </Link>
          <Link className="underline mr-2" href={`/${locale}/legal/cookies`}>
            {t("legal.cookies")}
          </Link>
          <Link className="underline" href={`/${locale}/legal/imprint`}>
            {t("legal.imprint")}
          </Link>
        </div>
      </section>
    </main>
  );
}
