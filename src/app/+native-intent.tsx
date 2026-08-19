import { savePendingDeepLink } from '../utils/pending-deep-link';
import { rewritePropertyDeepLink } from '../utils/property-deep-link';

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    const rewritten = rewritePropertyDeepLink(path);
    if (rewritten) {
      void savePendingDeepLink(rewritten);
      return rewritten;
    }
    return path;
  } catch {
    return path;
  }
}
