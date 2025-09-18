"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { User, Globe, Search, LifeBuoy, ShoppingCart, ChevronDown, X } from "lucide-react";
import { SearchBox } from "../search/SearchBox";
import { isAssistantEnabled } from "@/config/flags";

interface TopbarProps {
  locale: string;
}

export function Topbar({ locale }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const search = useSearchParams();
  const qs = search?.toString();
  const currentPath = `${pathname}${qs ? `?${qs}` : ""}`;

  const [countryOpen, setCountryOpen] = React.useState(false);
  const [buyOpen, setBuyOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [simMsg, setSimMsg] = React.useState<string | null>(null);

  const isProduction = (process.env.NEXT_PUBLIC_VITE_IS_PRODUCTION ?? process.env.VITE_IS_PRODUCTION ?? "false") === "true";

  React.useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setCountryOpen(false);
        setBuyOpen(false);
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  function handleDomainSelect(domain: string) {
    const target = `https://${domain}${currentPath}`;
    if (isProduction) {
      window.location.href = target;
    } else {
      // Czech-only message per requirement
      setSimMsg(`Simulace přesměrování na: ${target}`);
      setTimeout(() => setSimMsg(null), 4500);
    }
  }

  function handleSearchResultClick(result: any) {
    router.push(`/${locale}/documents/${result.documentId}`);
    setSearchOpen(false);
  }

  const products = React.useMemo(
    () => [
      { id: "starter", name: "Starter" },
      { id: "family", name: "Family" },
      { id: "pro", name: "Pro" },
      { id: "business", name: "Business" },
      { id: "enterprise", name: "Enterprise" },
      { id: "guardian", name: "Guardian" },
      { id: "executor", name: "Executor" },
      { id: "documents", name: "Documents" },
      { id: "sharing", name: "Secure Sharing" },
      { id: "backup", name: "Backup & Recovery" },
    ],
    []
  );

  return (
    <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800 text-slate-100">
      {/* Simulated redirect banner (Czech message only) */}
      {simMsg ? (
        <div className="bg-amber-900/60 border-b border-amber-700 text-amber-100 px-4 py-2 flex items-center gap-3">
          <span className="text-sm">{simMsg}</span>
          <button className="ml-auto hover:text-white" aria-label="Close" onClick={() => setSimMsg(null)}>
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-3 py-2 flex items-center gap-4">
        {/* Brand */}
        <Link href={`/${locale}/`} className="font-semibold text-white hover:text-white/90 tracking-wide">
          LegacyGuard
        </Link>

        {/* Primary text nav (lightweight, NVIDIA-like) */}
        <nav className="hidden md:flex items-center gap-4 text-sm" aria-label="Primary">
          <Link href={`/${locale}/subscriptions`} className="hover:text-white">Subscriptions</Link>
          <Link href={`/${locale}/support`} className="hover:text-white">Support</Link>
          {isAssistantEnabled() ? (
            <Link
              href={`/${locale}/assistant`}
              className="hover:text-white"
              onClick={() => {
                try {
                  // dynamic import to avoid SSR issues
                  import('@/lib/analytics').then(({ sendAnalytics }) => {
                    sendAnalytics('assistant_nav_click', { locale, from: currentPath });
                  }).catch(() => {});
                } catch {}
              }}
            >
              Assistant
            </Link>
          ) : null}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <button
            aria-label="Search"
            className="p-2 rounded hover:bg-slate-800"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search size={18} />
          </button>
          {searchOpen ? (
            <div className="absolute right-0 mt-2 w-80 z-50">
              <SearchBox
                onResultClick={handleSearchResultClick}
                placeholder="Search documents..."
                embedded={true}
              />
            </div>
          ) : null}
        </div>

        {/* Country selector */}
        <div className="relative">
          <button
            aria-haspopup="menu"
            aria-expanded={countryOpen}
            aria-label="Select country"
            className="p-2 rounded hover:bg-slate-800 inline-flex items-center gap-1"
            onClick={() => setCountryOpen((v) => !v)}
          >
            <Globe size={18} />
            <ChevronDown size={16} className="opacity-70" />
          </button>
          {countryOpen ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded shadow-lg p-2 text-sm"
            >
              <div className="px-2 py-1 text-slate-400">Select Country</div>
              <button
                className="w-full text-left px-2 py-2 rounded hover:bg-slate-800"
                onClick={() => {
                  setCountryOpen(false);
                  handleDomainSelect("legacyguard.cz");
                }}
              >
                🇨🇿 Czech Republic (legacyguard.cz)
              </button>
              <button
                className="w-full text-left px-2 py-2 rounded hover:bg-slate-800"
                onClick={() => {
                  setCountryOpen(false);
                  handleDomainSelect("legacyguard.sk");
                }}
              >
                🇸🇰 Slovakia (legacyguard.sk)
              </button>
              <div className="px-2 pt-2 text-xs text-slate-500">More countries coming soon</div>
            </div>
          ) : null}
        </div>

        {/* Support (icon duplicate for quick access) */}
        <Link
          href={`/${locale}/support`}
          aria-label="Support"
          className="p-2 rounded hover:bg-slate-800"
          title="Support"
        >
          <LifeBuoy size={18} />
        </Link>

        {/* Buy menu */}
        <div className="relative">
          <button
            aria-haspopup="menu"
            aria-expanded={buyOpen}
            aria-label="Buy"
            className="p-2 rounded hover:bg-slate-800 inline-flex items-center gap-1"
            onClick={() => setBuyOpen((v) => !v)}
            title="Buy"
          >
            <ShoppingCart size={18} />
            <ChevronDown size={16} className="opacity-70" />
          </button>
          {buyOpen ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded shadow-lg py-2 text-sm"
            >
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/${locale}/buy?product=${encodeURIComponent(p.id)}`}
                  className="block px-3 py-2 hover:bg-slate-800"
                  onClick={() => setBuyOpen(false)}
                >
                  {p.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {/* User/account (Clerk placeholder) */}
        <Link
          href={`/${locale}/account`}
          aria-label="Account"
          className="p-2 rounded hover:bg-slate-800"
          title="Account"
        >
          <User size={18} />
        </Link>
      </div>
    </div>
  );
}

export default Topbar;
