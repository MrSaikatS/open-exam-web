import { useEffect, useState } from "react";

/**
 * Mobile breakpoint in pixels.
 * Screens with width less than this value are considered mobile.
 */
const MOBILE_BREAKPOINT = 768;

/**
 * Custom React hook to detect if the current viewport is mobile-sized.
 *
 * This hook uses lazy initialization to determine the initial mobile state
 * and a MediaQueryList to listen for viewport changes. It avoids synchronous
 * setState calls in effects by initializing state during the first render.
 * The hook properly cleans up the MediaQueryList listener on unmount
 * (via MediaQueryList.removeEventListener("change", ...)).
 *
 * @returns {boolean} True if the current viewport width is less than 768px, false otherwise
 *
 * @example
 * ```typescript
 * const isMobile = useIsMobile();
 *
 * if (isMobile) {
 *   // Render mobile-specific UI
 *   return <MobileNavigation />;
 * } else {
 *   // Render desktop UI
 *   return <DesktopNavigation />;
 * }
 * ```
 */

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(mql.matches);
    };

    mql.addEventListener("change", onChange);

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
