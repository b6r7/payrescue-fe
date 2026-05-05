/**
 * MSW browser worker — mirrors web-ux/product-flows/src/modules/repayment/mocks/browser.ts
 */
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
