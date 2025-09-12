// Simple redirect guard to prevent redirect loops
class RedirectGuardClass {
    redirectHistory = [];
    maxRedirects = 3;
    timeWindow = 10000; // 10 seconds
    canRedirect(path) {
        const now = Date.now();
        // Clean old entries
        this.redirectHistory = this.redirectHistory.filter(entry => now - parseInt(entry.split(':')[1]) < this.timeWindow);
        // Count redirects to this path
        const redirectsToPath = this.redirectHistory.filter(entry => entry.startsWith(`${path}:`)).length;
        if (redirectsToPath >= this.maxRedirects) {
            console.warn(`Redirect loop detected for path: ${path}`);
            return false;
        }
        // Log this redirect attempt
        this.redirectHistory.push(`${path}:${now}`);
        return true;
    }
    reset() {
        this.redirectHistory = [];
    }
}
export const RedirectGuard = new RedirectGuardClass();
