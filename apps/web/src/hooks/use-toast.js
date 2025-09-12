// Minimal toast stub for web app (replace with real UI toast when available)
export function toast({ title, description, duration }) {
    const message = `[toast] ${title}${description ? `: ${description}` : ''} (duration: ${duration || 3000}ms)`;
    // In production, integrate with a real toast system (e.g., @schwalbe/ui toast)
    if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.log(message);
    }
    else {
        // eslint-disable-next-line no-console
        console.log(message);
    }
}
