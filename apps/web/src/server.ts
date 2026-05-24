import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server'

/**
 * Cloudflare Workers entry for the MDXForge website.
 * Keep this file minimal: app-specific middleware is intentionally not included
 * in the marketing site baseline.
 */
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    void env
    void ctx

    return paraglideMiddleware(request, () => handler.fetch(request))
  }
}
