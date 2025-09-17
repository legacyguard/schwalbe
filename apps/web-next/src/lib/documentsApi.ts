// Minimal client stubs mapping to the legacy API surface
// TODO: Wire to Supabase/Edge Functions as in legacy app when ready

export async function listDocuments(): Promise<any[]> {
  // Replace with real API call
  return [];
}

export async function getDocument(id: string): Promise<any | null> {
  // Replace with real API call
  return null;
}

export async function uploadDocumentAndAnalyze(file: File): Promise<{ document: { id: string } }> {
  // Replace with real API call that uploads file and triggers OCR analysis
  return { document: { id: "temp-id" } };
}

export async function updateDocument(id: string, patch: Record<string, unknown>): Promise<any> {
  // Replace with real API call that updates document metadata
  return { id, ...patch } as any;
}