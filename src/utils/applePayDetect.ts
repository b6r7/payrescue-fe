/**
 * Returns true only when running in Safari on an Apple device
 * (iPhone, iPad, Mac) where Apple Pay is available.
 *
 * `window.ApplePaySession` is a Safari-only API and is not present
 * in Chrome, Firefox, Edge, or non-Apple browsers at all.
 */
export const isApplePayAvailable = (): boolean =>
  typeof window !== 'undefined' && 'ApplePaySession' in window
