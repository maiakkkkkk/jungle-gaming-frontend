import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { socketHandlers } from './socketHandlers'
import { installMockTestHooks } from './testHooks'

export const worker = setupWorker(...handlers, ...socketHandlers)

// Gatilhos determinísticos dos cenários de tempo real (window.__mocks).
installMockTestHooks()
