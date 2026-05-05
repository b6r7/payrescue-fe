/**
 * MSW Node server — for Vitest / SSR usage.
 * Mirrors web-ux/product-flows/src/modules/repayment/mocks/server.ts
 */
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
