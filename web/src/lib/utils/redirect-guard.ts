
// Utility to prevent redirect loops
export class RedirectGuard {
  private static redirectCount = 0;
  private static lastRedirectPath = '';
  private static lastRedirectTime = 0;
  private static readonly MAX_REDIRECTS = 3;
  private static readonly REDIRECT_WINDOW = 2000; // 2 seconds

  static canRedirect(toPath: string): boolean {
    const now = Date.now();

    // Reset counter if enough time has passed
    if (now - this.lastRedirectTime > this.REDIRECT_WINDOW) {
      this.redirectCount = 0;
    }

    // Check if we're redirecting to the same path repeatedly
    if (
      toPath === this.lastRedirectPath &&
      this.redirectCount >= this.MAX_REDIRECTS
    ) {
      console.warn(
        `Redirect loop detected: attempted to redirect to ${toPath} ${this.redirectCount} times`
      );
      return false;
    }

    // Update tracking
    if (toPath === this.lastRedirectPath) {
      this.redirectCount++;
    } else {
      this.redirectCount = 1;
      this.lastRedirectPath = toPath;
    }

    this.lastRedirectTime = now;

    return true;
  }

  static reset(): void {
    this.redirectCount = 0;
    this.lastRedirectPath = '';
    this.lastRedirectTime = 0;
  }
}
