import { savePendingDeepLink } from '../utils/pending-deep-link';
import { rewritePropertyDeepLink } from '../utils/property-deep-link';

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    const rewritten = rewritePropertyDeepLink(path);
    if (rewritten) {
      // Defer storage so linking bootstrap is not racing React's first mount.
      setTimeout(() => {
        void savePendingDeepLink(rewritten);
      }, 0);
      return rewritten;
    }
    return path;
  } catch {
    return path;
  }
}
