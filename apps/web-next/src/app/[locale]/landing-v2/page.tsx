import { notFound } from "next/navigation";
import { isHollywoodLandingEnabled } from "../../../config/flags";
import dynamic from "next/dynamic";

const LandingV2 = dynamic(() => import("@/components/landing/LandingV2"), {
  ssr: false,
});

export default function HollywoodLandingV2Page({
  params,
}: {
  params: { locale: string };
}) {
  if (!isHollywoodLandingEnabled()) {
    notFound();
  }

  return (
    <main className="min-h-screen text-slate-100">
      <LandingV2 locale={params.locale} />
    </main>
  );
}
