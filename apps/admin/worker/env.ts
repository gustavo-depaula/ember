import type { Reviewer } from './reviewer'

export type Env = {
  DB: D1Database
  // The relay's database (apps/relay), read for the usage desk only.
  RELAY: D1Database
  ASSETS: Fetcher
  REVIEWER: DurableObjectNamespace<Reviewer>
  // From `claude setup-token`. Held here and added to the reviewer's calls on their way out.
  CLAUDE_CODE_OAUTH_TOKEN?: string
  ACCESS_TEAM_DOMAIN?: string
  ACCESS_AUD?: string
  // The model reviews run on; Claude Code's default when unset.
  MODERATION_MODEL?: string
  // The weekly usage digest (digest.ts): the binding it is sent through, who it goes to (a
  // secret), and the address it comes from, on a domain onboarded to Email Sending.
  EMAIL?: SendEmail
  DIGEST_TO?: string
  DIGEST_FROM?: string
}
