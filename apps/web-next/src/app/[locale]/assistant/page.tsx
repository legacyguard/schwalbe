import { notFound } from "next/navigation";
import { isAssistantEnabled } from "@/config/flags";
import AssistantPanel from "@/components/assistant/AssistantPanel";
import { track } from "@/lib/analytics";

export default function AssistantPage({ params }: { params: { locale: string } }) {
  if (!isAssistantEnabled()) notFound();
  // Best-effort page view
  track({ event: "assistant_view", locale: params.locale });
  return <AssistantPanel locale={params.locale} />;
}
