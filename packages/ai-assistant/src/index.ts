// Minimal assistant core (no external calls). Deterministic canned replies.
export type AssistantMessage = { role: 'user' | 'assistant'; content: string };
export type AssistantRequest = { history: AssistantMessage[]; input: string };

export function assistantCore(req: AssistantRequest): AssistantMessage {
  const input = req.input.trim();
  if (!input) return { role: 'assistant', content: 'How can I help you today?' };

  // Tiny rules for demo purposes (no external API)
  if (/hello|hi|ahoj/i.test(input)) return { role: 'assistant', content: 'Hello! I am here to guide you gently, step by step.' };
  if (/onboard|start|begin/i.test(input)) return { role: 'assistant', content: 'We can start with a calm plan: 1) secure documents, 2) add a trusted person, 3) set gentle reminders.' };

  // Default echo with calm framing
  return { role: 'assistant', content: `I hear: “${input}”. Let’s move forward at your pace.` };
}

export * from './types';
