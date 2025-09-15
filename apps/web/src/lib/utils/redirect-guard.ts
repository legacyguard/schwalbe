// Simple redirect guard to prevent redirect loops
import { buildCountryUrl, getEnabledDomains, isProduction } from '@schwalbe/shared'

export interface RedirectSimulationTarget {
  code: string
  host: string
  url: string
}

export interface RedirectOutcome {
  didRedirect: boolean
  simulationTargets?: RedirectSimulationTarget[]
}

class RedirectGuardClass {
  private redirectHistory: string[] = [];
  private readonly maxRedirects = 3;
  private readonly timeWindow = 10000; // 10 seconds

  canRedirect(path: string): boolean {
    const now = Date.now();
    
    // Clean old entries
    this.redirectHistory = this.redirectHistory.filter(
      entry => now - parseInt(entry.split(':')[1]) < this.timeWindow
    );

    // Count redirects to this path
    const redirectsToPath = this.redirectHistory.filter(
      entry => entry.startsWith(`${path}:`)
    ).length;

    if (redirectsToPath >= this.maxRedirects) {
      console.warn(`Redirect loop detected for path: ${path}`);
      return false;
    }

    // Log this redirect attempt
    this.redirectHistory.push(`${path}:${now}`);
    return true;
  }

  reset(): void {
    this.redirectHistory = [];
  }
}

export const RedirectGuard = new RedirectGuardClass();

// Gate country redirect by environment.
// - Production: perform real redirect to buildCountryUrl(code)
// - Non-production: return a list of simulation targets for all enabled domains (no navigation)
export function redirectToCountryOrSimulate(code: string): RedirectOutcome {
  const targetUrl = buildCountryUrl(code)

  if (isProduction()) {
    if (targetUrl && RedirectGuard.canRedirect(targetUrl)) {
      window.location.href = targetUrl
      return { didRedirect: true }
    }
    return { didRedirect: false }
  }

  // Non-production: prepare simulation for all enabled domains
  const simTargets: RedirectSimulationTarget[] = getEnabledDomains()
    .map((d) => ({ code: d.code, host: d.host, url: buildCountryUrl(d.code) || '' }))
    .filter((t) => !!t.url)

  return { didRedirect: false, simulationTargets: simTargets }
}
